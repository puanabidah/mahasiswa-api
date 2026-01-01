import response from "../utils/response.js";

// middleware validate = (schema, source) => (req, res, next) => {...; next();}
const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return next(result.error);
    }

    req[source] = result.data;
    next();
  };

export default validate;
