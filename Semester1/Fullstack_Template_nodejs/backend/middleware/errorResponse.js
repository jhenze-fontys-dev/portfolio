// Error factory — used in controllers
export function createError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

// Error-handling middleware — used at the end of your middleware stack
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    statusCode
  });
}
