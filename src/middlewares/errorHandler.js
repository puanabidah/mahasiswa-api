import response from "../utils/response.js";
import { ZodError } from "zod";

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = null;

  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";
    errors = err.issues.map((iss) => {
      const isBulk = iss.path.length > 1;
      return {
        row: isBulk ? iss.path[0] : null,
        field: isBulk ? iss.path[1] : iss.path[0],
        message: iss.message,
      };
    });
  }

  if (err.code === "23505") {
    statusCode = 409;
    message = "Data sudah ada (Duplicate Entry)";
  }

  response(res, statusCode, message, errors);
};

export default errorHandler;
