import ApiError from "../utils/ApiError.js";

const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const fields = Object.fromEntries(
        result.error.issues.map((issue) => [
          issue.path.join(".") || "body",
          issue.message,
        ])
      );

      return next(new ApiError(400, "Validation failed", { fields }));
    }

    req.body = result.data;

    next();
  };
};

export default validate;
