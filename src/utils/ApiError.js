// src/utils/ApiError.js

class ApiError extends Error {
  constructor(statusCode, message, details = {}) {
    super(message);

    this.statusCode = statusCode;
    this.success = false;
    Object.assign(this, details);

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
