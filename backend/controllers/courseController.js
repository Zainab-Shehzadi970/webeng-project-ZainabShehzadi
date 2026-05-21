const courseModel = require('../models/courseModel');
const { success } = require('../utils/responseHandler');

// ➤ Add Course
exports.addCourse = (req, res, next) => {
  const { name, course_code } = req.body;
  const user_id = req.user.id; // ✅ from JWT token

  if (!name || !course_code) {
    const err = new Error('All fields required ❌');
    err.statusCode = 400;
    return next(err);
  }

  courseModel.createCourse(name, course_code, user_id, (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        err.statusCode = 400;
        err.message = 'Course code already exists ❌';
      }
      return next(err);
    }
    return success(res, null, 'Course added successfully ✅', 201);
  });
};

// ➤ Get All Courses (only this teacher's)
exports.getCourses = (req, res, next) => {
  const user_id = req.user.id;
  courseModel.getCourses(user_id, (err, results) => {
    if (err) return next(err);
    return success(res, results, 'Courses fetched successfully ✅');
  });
};

// ➤ Get Single Course
exports.getCourseById = (req, res, next) => {
  const { id } = req.params;
  const user_id = req.user.id;
  courseModel.getCourseById(id, user_id, (err, result) => {
    if (err) return next(err);
    if (!result[0]) {
      const err = new Error('Course not found ❌');
      err.statusCode = 404;
      return next(err);
    }
    return success(res, result[0], 'Course fetched ✅');
  });
};

// ➤ Update Course
exports.updateCourse = (req, res, next) => {
  const { id } = req.params;
  const { name, course_code } = req.body;
  const user_id = req.user.id;

  courseModel.updateCourse(id, name, course_code, user_id, (err, result) => {
    if (err) return next(err);
    if (result.affectedRows === 0) {
      const err = new Error('Course not found ❌');
      err.statusCode = 404;
      return next(err);
    }
    return success(res, null, 'Course updated ✏️');
  });
};

// ➤ Delete Course
exports.deleteCourse = (req, res, next) => {
  const { id } = req.params;
  const user_id = req.user.id;

  courseModel.deleteCourse(id, user_id, (err, result) => {
    if (err) return next(err);
    if (result.affectedRows === 0) {
      const err = new Error('Course not found ❌');
      err.statusCode = 404;
      return next(err);
    }
    return success(res, null, 'Course deleted 🗑️');
  });
};
