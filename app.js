import express from "express";
import mahasiswaRoutes from "./src/routes/mahasiswaRoutes.js";

const app = express();

app.use(express.json());

app.use("/api/v1/mahasiswa", mahasiswaRoutes);

export default app;
