const multer = require('multer');
const path = require('path');

// ✅ Memory storage - Railway ke liye (disk ephemeral hoti hai)
const storage = multer.memoryStorage();

// File filter (sirf Excel allow)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files allowed ❌'), false);
  }
};

const upload = multer({
  storage,
  fileFilter
});

module.exports = upload;