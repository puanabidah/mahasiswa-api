import express from "express";
import sql from "./connection.js";
import response from "./response.js";
import * as z from "zod";

const app = express();
const PORT = 3000;

const columns = ["nim", "nama_lengkap", "kelas", "alamat"];

const mahasiswaSchema = z.object({
  nim: z
    .string({
      error: "NIM wajib diisi",
    })
    .trim()
    .regex(/^\d+$/, "NIM cuma boleh isi angka")
    .length(3, "NIM harus tepat 3 digit"),
  nama_lengkap: z
    .string({ error: "Nama wajib diisi dengan format huruf yang benar" })
    .trim()
    .min(3, "Nama minimal harus 3 huruf")
    .regex(/^[a-zA-Z\s\.\']+$/, "Hanya boleh huruf, spasi, titik, atau petik"),
  kelas: z
    .string({
      error: "Kelas wajib diisi",
    })
    .trim()
    .regex(/^[a-cA-C]$/, "Kelas harus berupa satu huruf antara A sampai C")
    .toUpperCase(),
  alamat: z.string().optional(),
});

const bulkMahasiswaSchema = z
  .array(mahasiswaSchema)
  .min(1, "Masukkan minimal 1 objek data");

const nimParamSchema = z.object({
  nim: z
    .string()
    .regex(/^\d+$/, "NIM tidak valid")
    .length(3, "NIM harus tepat 3 digit"),
});

const putMahasiswaSchema = z.object({
  nama_lengkap: z
    .string()
    .trim()
    .min(3, "Nama minimal harus 3 huruf")
    .regex(/^[a-zA-Z\s\.\']+$/, "Hanya boleh huruf, spasi, titik, atau petik"),
  kelas: z
    .string()
    .trim()
    .regex(/^[a-cA-C]$/, "Kelas harus berupa satu huruf antara A sampai C")
    .toUpperCase(),
  alamat: z.string().trim(),
});

const patchMahasiswaSchema = z
  .object({
    nama_lengkap: z
      .string()
      .trim()
      .min(3, "Nama minimal harus 3 huruf")
      .regex(/^[a-zA-Z\s\.\']+$/, "Hanya boleh huruf, spasi, titik, atau petik")
      .optional(),
    kelas: z
      .string()
      .trim()
      .regex(/^[a-cA-C]$/, "Kelas harus berupa satu huruf antara A sampai C")
      .toUpperCase()
      .optional(),
    alamat: z.string().trim().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Minimal satu field harus diupdate",
  });

// middleware validate = (schema, source) => (req, res, next) => {...; next();}
const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const map = result.error.issues.map((iss) => {
        if (iss.path.length > 1) {
          return {
            index: iss.path[0] ?? null,
            field: iss.path[1] ?? null,
            message: iss.message,
          };
        } else {
          return {
            field: iss.path[0],
            message: iss.message,
          };
        }
      });
      return response(res, 400, map);
    }

    req[source] = result.data;
    next();
  };

app.use(express.json());

app.get("/", async (req, res) => {
  response(res, 200, "success", "API v1 ready to go");
});

app.get("/mahasiswa", async (req, res) => {
  try {
    const data = await sql`SELECT * FROM mahasiswa`;
    response(res, 200, "Sukeses mengambil semua data", data);
  } catch (error) {
    console.error(error);
    response(res, 500, "Server erorr");
  }
});

app.get(
  "/mahasiswa/:nim",
  validate(nimParamSchema, "params"),
  async (req, res) => {
    try {
      const { nim } = req.params;

      const [data] = await sql`SELECT * FROM mahasiswa WHERE nim = ${nim}`;

      if (!data) {
        return response(res, 404, "Data tidak ditemukan");
      }

      response(res, 200, "Success", data);
    } catch (error) {
      console.error(error);
      response(res, 500, "Server error");
    }
  }
);

app.put(
  "/mahasiswa/:nim",
  validate(nimParamSchema, "params"),
  validate(putMahasiswaSchema),
  async (req, res) => {
    const data = req.body;

    const { nim } = req.params;

    try {
      if (Object.keys(data).length === 0) {
        return response(res, 400, "Tidak ada data yang diupdate");
      }
      const [updateData] = await sql`UPDATE mahasiswa SET ${sql(
        data
      )} WHERE nim = ${nim} RETURNING *`;

      if (!updateData) {
        return response(res, 404, "Mahasiswa tidak ditemukan, gagal update");
      }
      response(res, 200, "Data berhasil diubah", updateData);
    } catch (error) {
      console.error(error);
      response(res, 500, "Internal server error");
    }
  }
);

app.patch(
  "/mahasiswa/:nim",
  validate(nimParamSchema, "params"),
  validate(patchMahasiswaSchema),
  async (req, res) => {
    const data = req.body;
    const { nim } = req.params;

    const allowedColumns = ["nama_lengkap", "kelas", "alamat"];

    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([key]) => allowedColumns.includes(key))
    );

    if (Object.keys(filteredData).length === 0) {
      return response(res, 400, "Minimal satu field harus diupdate");
    }

    try {
      const updatePartial = await sql`UPDATE mahasiswa SET ${sql(
        filteredData
      )} WHERE nim = ${nim} RETURNING *`;

      if (updatePartial.length === 0) {
        return response(res, 404, "Mahasiswa tidak ditemukan");
      }
      response(res, 200, "Data berhasil diubah", updatePartial[0]);
    } catch (error) {
      console.error(error);
      response(res, 500, "Internal server error");
    }
  }
);

app.post("/mahasiswa/bulk", validate(bulkMahasiswaSchema), async (req, res) => {
  try {
    const data = req.body;

    const newData = await sql`INSERT INTO mahasiswa ${sql(
      data,
      columns
    )} RETURNING *`;
    response(res, 201, "Data baru berhasil dimasukkan", newData);
  } catch (error) {
    if (error.code === "23505") {
      return response(res, 409, "Data NIM duplicate");
    }
    console.error(error);
    response(res, 500, "Internal server error");
  }
});

app.post("/mahasiswa", validate(mahasiswaSchema), async (req, res) => {
  const data = req.body;

  try {
    const newData = await sql`INSERT INTO mahasiswa ${sql(
      data,
      columns
    )} RETURNING *`;

    response(res, 201, "Data baru berhasil dimasukkan", newData);
  } catch (error) {
    console.error(error);
    if (error.code === "23505") {
      return response(res, 409, "Data NIM duplicate");
    }
    response(res, 500, "Server error");
  }
});

app.delete(
  "/mahasiswa/:nim",
  validate(nimParamSchema, "params"),
  async (req, res) => {
    const { nim } = req.params;

    try {
      const [deletedData] =
        await sql`DELETE FROM mahasiswa WHERE nim = ${nim} RETURNING nim, nama_lengkap`;

      if (!deletedData) {
        return response(res, 404, "Tidak menemukan data untuk dihapus");
      }
      response(res, 200, "Success deleted a row", deletedData);
    } catch (error) {
      console.error(error);
      response(res, 500, "Server error");
    }
  }
);

app.listen(PORT, () => {
  console.log(`Example app listening on port http://localhost:${PORT}/`);
});
