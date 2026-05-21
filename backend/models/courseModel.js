const db = require('../config/db');

// ➤ Create Course (with user_id)
exports.createCourse = (name, course_code, user_id, callback) => {
  const sql = `INSERT INTO courses (name, course_code, user_id) VALUES (?, ?, ?)`;
  db.query(sql, [name, course_code, user_id], callback);
};

// ➤ Get Courses by user_id only
exports.getCourses = (user_id, callback) => {
  const sql = `
    SELECT courses.*, COUNT(students.id) AS total_students
    FROM courses
    LEFT JOIN students ON students.course_id = courses.id
    WHERE courses.user_id = ?
    GROUP BY courses.id
  `;
  db.query(sql, [user_id], callback);
};

// ➤ Get Single Course (verify ownership)
exports.getCourseById = (id, user_id, callback) => {
  const sql = `SELECT * FROM courses WHERE id = ? AND user_id = ?`;
  db.query(sql, [id, user_id], callback);
};

// ➤ Update Course (verify ownership)
exports.updateCourse = (id, name, course_code, user_id, callback) => {
  const sql = `UPDATE courses SET name = ?, course_code = ? WHERE id = ? AND user_id = ?`;
  db.query(sql, [name, course_code, id, user_id], callback);
};

// ➤ Delete Course (verify ownership)
exports.deleteCourse = (id, user_id, callback) => {
  const sql = `DELETE FROM courses WHERE id = ? AND user_id = ?`;
  db.query(sql, [id, user_id], callback);
};
