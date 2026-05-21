const isValidDate = (date) => !isNaN(Date.parse(date));

// ✅ Both short (P/A/L) and full (present/absent/leave) accept karo
const validStatus = ['P', 'A', 'L', 'present', 'absent', 'leave'];

exports.validateMarkAttendance = (req, res, next) => {
  const { records, date } = req.body;

  if (!records || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ success: false, message: 'Records required ❌' });
  }
  if (!date || !isValidDate(date)) {
    return res.status(400).json({ success: false, message: 'Valid date required ❌' });
  }
  for (let r of records) {
    if (!r.student_id) {
      return res.status(400).json({ success: false, message: 'Invalid student ID ❌' });
    }
    if (!validStatus.includes(r.status)) {
      return res.status(400).json({ success: false, message: 'Invalid status ❌' });
    }
  }
  next();
};

exports.validateGetAttendance = (req, res, next) => {
  const { date, course_id } = req.query;
  if (!date || !isValidDate(date)) {
    return res.status(400).json({ success: false, message: 'Valid date required ❌' });
  }
  if (!course_id || isNaN(course_id)) {
    return res.status(400).json({ success: false, message: 'Valid course ID required ❌' });
  }
  next();
};

exports.validateUpdateAttendance = (req, res, next) => {
  const { student_id, date, status } = req.body;
  if (!student_id) {
    return res.status(400).json({ success: false, message: 'Invalid student ID ❌' });
  }
  if (!date || !isValidDate(date)) {
    return res.status(400).json({ success: false, message: 'Invalid date ❌' });
  }
  if (!validStatus.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status ❌' });
  }
  next();
};

exports.validateStudentLog = (req, res, next) => {
  const { student_id } = req.params;
  if (!student_id || isNaN(student_id)) {
    return res.status(400).json({ success: false, message: 'Invalid student ID ❌' });
  }
  next();
};

exports.validateMonthlyReport = (req, res, next) => {
  const { course_id } = req.query;
  if (!course_id || isNaN(course_id)) {
    return res.status(400).json({ success: false, message: 'Invalid course ID ❌' });
  }
  next();
};
