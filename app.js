import express from "express";
import mahasiswaRoutes from "./src/routes/mahasiswaRoutes.js";
import errorHandler from "./src/middlewares/errorHandler.js";

const app = express();

app.use(express.json());

app.use("/api/v1/mahasiswa", mahasiswaRoutes);

app.use(errorHandler);

export default app;
