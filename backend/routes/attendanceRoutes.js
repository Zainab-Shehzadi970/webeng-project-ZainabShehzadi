const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { verifyToken } = require('../middleware/authMiddleware');
const { validateMarkAttendance, validateGetAttendance, validateUpdateAttendance, validateStudentLog, validateMonthlyReport } = require('../validators/attendanceValidator');

router.get('/export/bulk', verifyToken, attendanceController.exportBulkAttendance);
router.get('/export',      verifyToken, attendanceController.exportAttendance);
router.get('/check',       verifyToken, attendanceController.checkAttendance);
router.get('/student/:student_id', verifyToken, validateStudentLog, attendanceController.getStudentLog);
router.get('/report',      verifyToken, validateMonthlyReport, attendanceController.getMonthlyReport);

router.post('/', verifyToken, validateMarkAttendance, attendanceController.markAttendance);
router.get('/',  verifyToken, validateGetAttendance,  attendanceController.getAttendance);
router.put('/',  verifyToken, validateUpdateAttendance, attendanceController.updateAttendance);

module.exports = router;
