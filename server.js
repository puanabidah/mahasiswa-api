import "dotenv/config";
import sql from "./src/config/database.js";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sql`SELECT 1`;
    console.log("DB berhasil connect!");
    app.listen(PORT, () => {
      console.log(`Example app listening on port http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();
