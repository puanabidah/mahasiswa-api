import response from "../utils/response.js";

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
      return response(res, 400, "Validation Error", map);
    }

    req[source] = result.data;
    next();
  };

export default validate;
