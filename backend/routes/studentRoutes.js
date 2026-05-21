const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const upload = require('../middleware/uploadMiddleware');
const { verifyToken } = require('../middleware/authMiddleware');
const { validateAddStudent, validateUpdateStudent, validateStudentId } = require('../validators/studentValidator');

router.post('/import', verifyToken, upload.single('file'), studentController.importStudents);
router.get('/export',  verifyToken, studentController.exportStudents);
router.get('/count',   verifyToken, studentController.getStudentCount);

router.post('/',     verifyToken, validateAddStudent, studentController.addStudent);
router.get('/',      verifyToken, studentController.getStudents);
router.get('/:id',   verifyToken, validateStudentId, studentController.getStudentById);
router.put('/:id',   verifyToken, validateStudentId, validateUpdateStudent, studentController.updateStudent);
router.delete('/:id',verifyToken, validateStudentId, studentController.deleteStudent);

module.exports = router;
