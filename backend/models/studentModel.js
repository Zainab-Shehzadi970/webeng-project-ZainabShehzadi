const db = require('../config/db');

// ➤ Create Student (with user_id)
exports.createStudent = (data, callback) => {
  const sql = `INSERT INTO students (name, student_id, course_id, user_id) VALUES (?, ?, ?, ?)`;
  db.query(sql, [data.name, data.student_id, data.course_id, data.user_id], callback);
};

// ➤ Bulk Insert Students
exports.bulkInsertStudents = (values, callback) => {
  const sql = `INSERT INTO students (name, student_id, course_id, user_id) VALUES ?`;
  db.query(sql, [values], callback);
};

// ➤ Get Students (filtered by user_id)
exports.getStudents = (filters = {}, callback) => {
  let sql = `
    SELECT students.id, students.name, students.student_id,
           students.course_id, courses.name AS course_name
    FROM students
    LEFT JOIN courses ON students.course_id = courses.id
    WHERE students.user_id = ?
  `;
  let values = [filters.user_id];

  if (filters.search) {
    sql += ` AND (students.name LIKE ? OR students.student_id LIKE ?)`;
    values.push(`%${filters.search}%`, `%${filters.search}%`);
  }
  if (filters.course_id) {
    sql += ` AND students.course_id = ?`;
    values.push(filters.course_id);
  }
  sql += ` ORDER BY students.id DESC`;
  db.query(sql, values, callback);
};

// ➤ Get Student By ID (verify ownership)
exports.getStudentById = (id, user_id, callback) => {
  const sql = `
    SELECT students.*, courses.name AS course_name
    FROM students
    LEFT JOIN courses ON students.course_id = courses.id
    WHERE students.id = ? AND students.user_id = ?
  `;
  db.query(sql, [id, user_id], callback);
};

// ➤ Update Student (verify ownership)
exports.updateStudent = (id, data, callback) => {
  const sql = `UPDATE students SET name = ?, student_id = ?, course_id = ? WHERE id = ? AND user_id = ?`;
  db.query(sql, [data.name, data.student_id, data.course_id, id, data.user_id], callback);
};

// ➤ Delete Student (verify ownership)
exports.deleteStudent = (id, user_id, callback) => {
  const sql = `DELETE FROM students WHERE id = ? AND user_id = ?`;
  db.query(sql, [id, user_id], callback);
};
