import sql from "../config/database.js";
import response from "../utils/response.js";
import * as mahasiswaModel from "../models/mahasiswaModel.js";

export const getAllMahasiswa = async (req, res) => {
  try {
    const data = await mahasiswaModel.findAll();
    response(res, 200, "Sukses mengambil semua data", data);
  } catch (error) {
    console.error(error);
    response(res, 500, "Server erorr");
  }
};

export const getMahasiswaByNim = async (req, res) => {
  try {
    const { nim } = req.params;

    const data = await mahasiswaModel.findByNim(nim);

    if (!data) {
      return response(res, 404, "Data tidak ditemukan");
    }

    response(res, 200, "Success", data);
  } catch (error) {
    console.error(error);
    response(res, 500, "Server error");
  }
};

export const createMahasiswa = async (req, res) => {
  const data = req.body;

  try {
    const newData = await mahasiswaModel.insert(data);

    response(res, 201, "Data baru berhasil dimasukkan", newData);
  } catch (error) {
    console.error(error);
    if (error.code === "23505") {
      return response(res, 409, "Data NIM duplicate");
    }
    response(res, 500, "Server error");
  }
};

export const createBulkMahasiswa = async (req, res) => {
  try {
    const data = req.body;

    const newData = await mahasiswaModel.insert(data);

    response(res, 201, "Data baru berhasil dimasukkan", newData);
  } catch (error) {
    if (error.code === "23505") {
      return response(res, 409, "Data NIM duplicate");
    }
    console.error(error);
    response(res, 500, "Internal server error");
  }
};

export const updateAllField = async (req, res) => {
  const data = req.body;

  const { nim } = req.params;

  try {
    if (Object.keys(data).length === 0) {
      return response(res, 400, "Tidak ada data yang diupdate");
    }
    const updateData = await mahasiswaModel.update(nim, data);

    if (!updateData) {
      return response(res, 404, "Mahasiswa tidak ditemukan, gagal update");
    }
    response(res, 200, "Data berhasil diubah", updateData);
  } catch (error) {
    console.error(error);
    response(res, 500, "Internal server error");
  }
};

export const updatePartialField = async (req, res) => {
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
    const updatePartial = await mahasiswaModel.update(nim, filteredData);

    if (updatePartial.length === 0) {
      return response(res, 404, "Mahasiswa tidak ditemukan");
    }
    response(res, 200, "Data berhasil diubah", updatePartial[0]);
  } catch (error) {
    console.error(error);
    response(res, 500, "Internal server error");
  }
};

export const deleteMahasiswa = async (req, res) => {
  const { nim } = req.params;

  try {
    const deletedData = await mahasiswaModel.remove(nim);

    if (!deletedData) {
      return response(res, 404, "Tidak menemukan data untuk dihapus");
    }
    response(res, 200, "Success deleted a row", deletedData);
  } catch (error) {
    console.error(error);
    response(res, 500, "Server error");
  }
};
