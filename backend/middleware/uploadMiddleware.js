const multer = require('multer');
const path = require('path');

// Storage config

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // ✅ Fix: absolute path use karo
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

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
