const toFieldErrors = (errors) =>
  Object.fromEntries(
    Object.entries(errors).map(([field, error]) => [field, error.message])
  );

const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID format",
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A product with this code already exists",
    });
  }

  if (err.name === "ZodError") {
    const fields = Object.fromEntries(
      err.issues.map((issue) => [issue.path.join(".") || "body", issue.message])
    );
    return res.status(400).json({ success: false, message: "Validation failed", fields });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      fields: toFieldErrors(err.errors),
    });
  }

  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    message: statusCode >= 500 ? "Internal Server Error" : err.message,
  };

  if (err.fields) response.fields = err.fields;
  return res.status(statusCode).json(response);
};

export default errorHandler;
