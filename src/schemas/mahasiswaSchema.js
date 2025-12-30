import * as z from "zod";

export const mahasiswaSchema = z.object({
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

export const bulkMahasiswaSchema = z
  .array(mahasiswaSchema)
  .min(1, "Masukkan minimal 1 objek data");

export const nimParamSchema = z.object({
  nim: z
    .string()
    .regex(/^\d+$/, "NIM tidak valid")
    .length(3, "NIM harus tepat 3 digit"),
});

export const putMahasiswaSchema = z.object({
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

export const patchMahasiswaSchema = z
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
