const attendanceModel = require('../models/attendanceModel');
const response = require('../utils/responseHandler');
const exportToExcel = require('../utils/exportExcel');
const { exportBulkToExcel } = require('../utils/exportExcel');

// ➤ Get Attendance
exports.getAttendance = (req, res, next) => {
  const { date, course_id } = req.query;
  const user_id = req.user.id; // ✅

  if (!date || !course_id) {
    const err = new Error('Date & Course required ❌');
    err.statusCode = 400;
    return next(err);
  }

  attendanceModel.getAttendanceByDate(date, course_id, user_id, (err, results) => {
    if (err) return next(err);
    response.success(res, results, 'Attendance fetched ✅');
  });
};

// ➤ Mark Attendance
exports.markAttendance = (req, res, next) => {
  const { records, date, course_id } = req.body;
  const user_id = req.user.id; // ✅

  if (!records || !Array.isArray(records) || records.length === 0 || !date) {
    const err = new Error('Invalid request ❌');
    err.statusCode = 400;
    return next(err);
  }

  if (course_id) {
    attendanceModel.checkAttendanceExists(date, course_id, user_id, (err, rows) => {
      if (err) return next(err);
      if (rows[0].count > 0) {
        return res.status(409).json({
          success: false,
          alreadyMarked: true,
          message: 'Attendance already marked. Use View History to edit.'
        });
      }
      const values = records.map(r => [r.student_id, date, r.status]);
      attendanceModel.saveAttendance(values, (err) => {
        if (err) return next(err);
        response.success(res, { count: records.length }, 'Attendance saved ✅');
      });
    });
  } else {
    const values = records.map(r => [r.student_id, date, r.status]);
    attendanceModel.saveAttendance(values, (err) => {
      if (err) return next(err);
      response.success(res, { count: records.length }, 'Attendance saved ✅');
    });
  }
};

// ➤ Update Single Attendance
exports.updateAttendance = (req, res, next) => {
  const { student_id, date, status } = req.body;

  if (!student_id || !date || !status) {
    const err = new Error('All fields required ❌');
    err.statusCode = 400;
    return next(err);
  }

  attendanceModel.updateAttendance(student_id, date, status, (err) => {
    if (err) return next(err);
    response.success(res, null, 'Attendance updated ✏️');
  });
};

// ➤ Student Log
exports.getStudentLog = (req, res, next) => {
  const { student_id } = req.params;
  const user_id = req.user.id; // ✅

  attendanceModel.getStudentLog(student_id, user_id, (err, results) => {
    if (err) return next(err);

    let summary = { present: 0, absent: 0, leave: 0 };
    results.forEach(r => { summary[r.status] = r.total; });

    const totalDays = summary.present + summary.absent + summary.leave;
    const percentage = totalDays ? ((summary.present / totalDays) * 100).toFixed(0) : 0;

    response.success(res, { ...summary, totalDays, percentage }, 'Student log ✅');
  });
};

// ➤ Monthly Report
exports.getMonthlyReport = (req, res, next) => {
  const { course_id } = req.query;
  const user_id = req.user.id; // ✅

  if (!course_id) {
    const err = new Error('Course ID required ❌');
    err.statusCode = 400;
    return next(err);
  }

  attendanceModel.getMonthlyReport(course_id, user_id, (err, results) => {
    if (err) return next(err);
    response.success(res, results, 'Monthly report ✅');
  });
};

// ➤ Export Single Date
exports.exportAttendance = (req, res, next) => {
  const { date, course_id } = req.query;
  const user_id = req.user.id; // ✅

  if (!date || !course_id) {
    const err = new Error('Date & Course required ❌');
    err.statusCode = 400;
    return next(err);
  }

  attendanceModel.getAttendanceByDate(date, course_id, user_id, (err, results) => {
    if (err) return next(err);
    const formatted = results
      .filter(r => r.status)
      .map(r => ({ Name: r.name, Student_ID: r.student_id, Status: r.status }));
    exportToExcel(formatted, res, `attendance_${date}`);
  });
};

// ➤ Bulk Export
exports.exportBulkAttendance = (req, res, next) => {
  const { course_id, from_date, to_date } = req.query;
  const user_id = req.user.id; // ✅

  if (!course_id || !from_date || !to_date) {
    const err = new Error('Course + Date range required ❌');
    err.statusCode = 400;
    return next(err);
  }

  attendanceModel.getAttendanceByRange(course_id, from_date, to_date, user_id, (err, results) => {
    if (err) return next(err);
    exportBulkToExcel(results, res, `attendance_${course_id}_${from_date}_to_${to_date}`);
  });
};

// ➤ Check if attendance exists
exports.checkAttendance = (req, res, next) => {
  const { date, course_id } = req.query;
  const user_id = req.user.id; // ✅

  if (!date || !course_id) {
    return res.status(400).json({ success: false, message: 'Date & Course required' });
  }

  attendanceModel.checkAttendanceExists(date, course_id, user_id, (err, results) => {
    if (err) return next(err);
    const exists = results[0].count > 0;
    response.success(res, { exists }, 'Check complete');
  });
};
