// utils/responseHandler.js

// ➤ Success Response
exports.success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};


// ➤ Error Response (optional - rarely used if errorMiddleware hai)
exports.error = (res, message = 'Something went wrong ❌', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message
  });
};
