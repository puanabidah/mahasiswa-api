import sql from "../config/database.js";

const columns = ["nim", "nama_lengkap", "kelas", "alamat"];

export const findAll = async () => {
  return await sql`SELECT * FROM mahasiswa`;
};

export const findByNim = async (nim) => {
  const [data] = await sql`SELECT * FROM mahasiswa WHERE nim = ${nim}`;
  return data;
};

export const insert = async (data) => {
  return await sql`INSERT INTO mahasiswa ${sql(data, columns)} RETURNING *`;
};

export const update = async (nim, data) => {
  const [updated] = await sql`UPDATE mahasiswa SET ${sql(
    data
  )} WHERE nim = ${nim} RETURNING *`;
  return updated;
};

export const remove = async (nim) => {
  const [deleted] =
    await sql`DELETE FROM mahasiswa WHERE nim = ${nim} RETURNING nim, nama_lengkap`;
  return deleted;
};
