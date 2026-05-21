const studentModel = require('../models/studentModel');
const courseModel  = require('../models/courseModel');
const { success }  = require('../utils/responseHandler');
const exportToExcel = require('../utils/exportExcel');
const importExcel  = require('../utils/importExcel');
const fs = require('fs');

// ➤ Add Student
exports.addStudent = (req, res, next) => {
  const { name, student_id, course_id } = req.body;
  const user_id = req.user.id;

  if (!name || !student_id || !course_id) {
    const err = new Error('All fields required ❌');
    err.statusCode = 400;
    return next(err);
  }

  studentModel.createStudent({ name, student_id, course_id, user_id }, (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        err.statusCode = 400;
        err.message = 'Student ID already exists ❌';
      }
      return next(err);
    }
    return success(res, null, 'Student added successfully ✅', 201);
  });
};

// ➤ Get Students (this teacher only)
exports.getStudents = (req, res, next) => {
  const filters = { ...req.query, user_id: req.user.id };
  studentModel.getStudents(filters, (err, results) => {
    if (err) return next(err);
    return success(res, results, 'Students fetched ✅');
  });
};

// ➤ Get Single Student
exports.getStudentById = (req, res, next) => {
  const { id } = req.params;
  studentModel.getStudentById(id, req.user.id, (err, result) => {
    if (err) return next(err);
    if (!result[0]) {
      const err = new Error('Student not found ❌');
      err.statusCode = 404;
      return next(err);
    }
    return success(res, result[0], 'Student fetched ✅');
  });
};

// ➤ Update Student
exports.updateStudent = (req, res, next) => {
  const { id } = req.params;
  studentModel.updateStudent(id, { ...req.body, user_id: req.user.id }, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        err.statusCode = 400;
        err.message = 'Student ID already exists ❌';
      }
      return next(err);
    }
    if (result.affectedRows === 0) {
      const err = new Error('Student not found ❌');
      err.statusCode = 404;
      return next(err);
    }
    return success(res, null, 'Student updated ✏️');
  });
};

// ➤ Delete Student
exports.deleteStudent = (req, res, next) => {
  const { id } = req.params;
  studentModel.deleteStudent(id, req.user.id, (err, result) => {
    if (err) return next(err);
    if (result.affectedRows === 0) {
      const err = new Error('Student not found ❌');
      err.statusCode = 404;
      return next(err);
    }
    return success(res, null, 'Student deleted 🗑️');
  });
};

// ➤ Export Students
exports.exportStudents = (req, res, next) => {
  const filters = { user_id: req.user.id };
  if (req.query.course_id) filters.course_id = req.query.course_id;

  studentModel.getStudents(filters, (err, results) => {
    if (err) return next(err);
    const formattedData = results.map(s => ({
      'Student ID': s.student_id,
      'Student Name': s.name,
      'Course Name': s.course_name
    }));
    let fileName = 'students_all_courses';
    if (results.length > 0 && req.query.course_id) {
      fileName = `students_${results[0].course_name.replace(/\s+/g, '_')}`;
    }
    exportToExcel(formattedData, res, fileName);
  });
};

// ➤ Import Students
exports.importStudents = (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error('Excel file required ❌');
      err.statusCode = 400;
      return next(err);
    }
    const filePath = req.file.path;
    const students = importExcel(filePath);

    if (!students || students.length === 0) {
      const err = new Error('No valid data found in Excel ❌');
      err.statusCode = 400;
      return next(err);
    }

    const user_id = req.user.id;
    courseModel.getCourses(user_id, (err, courses) => {
      if (err) return next(err);

      const values = students.map(s => {
        const courseName = (s.course || '').toLowerCase().trim();
        const matched = courses.find(c => c.name.toLowerCase().trim() === courseName);
        return [s.name, s.student_id, matched ? matched.id : null, user_id];
      }).filter(v => v[0] && v[1] && v[2]);

      if (!values.length) {
        fs.unlinkSync(filePath);
        return res.status(400).json({ success: false, message: 'Course names match nahi hue ❌' });
      }

      studentModel.bulkInsertStudents(values, (err, result) => {
        fs.unlinkSync(filePath);
        if (err) return next(err);
        return success(res, { inserted: result.affectedRows, total: students.length }, 'Students imported ✅');
      });
    });
  } catch (err) {
    next(err);
  }
};

// ➤ Student Count
exports.getStudentCount = (req, res, next) => {
  studentModel.getStudents({ user_id: req.user.id }, (err, results) => {
    if (err) return next(err);
    return success(res, { total: results.length }, 'Count fetched ✅');
  });
};
