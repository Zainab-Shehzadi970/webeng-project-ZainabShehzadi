exports.errorHandler = (err, req, res, next) => {

  if (process.env.NODE_ENV !== 'test') {
    console.error(err); // debug log
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error ❌';

  // ➤ MySQL Duplicate Entry
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 400;

    const field = err.sqlMessage?.match(/for key '(.+?)'/);

    message = field
      ? `${field[1]} already exists ❌`
      : 'Duplicate entry ❌';
  }

  // ➤ Foreign key error
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = 'Invalid reference ID ❌';
  }

  // ➤ Bad null (NOT NULL constraint)
  if (err.code === 'ER_BAD_NULL_ERROR') {
    statusCode = 400;
    message = 'Missing required field ❌';
  }

  return res.status(statusCode).json({
    success: false,
    message
  });
};