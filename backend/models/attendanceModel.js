const db = require('../config/db');

// ➤ Bulk Save Attendance (UPSERT)
exports.saveAttendance = (values, callback) => {
  const sql = `
    INSERT INTO attendance (student_id, date, status)
    VALUES ?
    ON DUPLICATE KEY UPDATE status = VALUES(status)
  `;
  db.query(sql, [values], callback);
};

// ➤ Get Attendance by Date + Course — ✅ user_id filter added
exports.getAttendanceByDate = (date, course_id, user_id, callback) => {
  const sql = `
    SELECT 
      students.id,
      students.name,
      students.student_id,
      att_today.status,
      ROUND(
        IFNULL(
          SUM(CASE WHEN a2.status IN ('present','P') THEN 1 ELSE 0 END)
          / NULLIF(COUNT(a2.id), 0) * 100,
        0)
      ) AS monthly_avg
    FROM students
    LEFT JOIN attendance att_today
      ON students.id = att_today.student_id 
      AND att_today.date = ?
    LEFT JOIN attendance a2
      ON students.id = a2.student_id
    WHERE students.course_id = ?
    AND students.user_id = ?
    GROUP BY students.id, students.name, students.student_id, att_today.status
  `;
  db.query(sql, [date, course_id, user_id], callback);
};

// ➤ Update Single Attendance (UPSERT)
exports.updateAttendance = (student_id, date, status, callback) => {
  const sql = `
    INSERT INTO attendance (student_id, date, status)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE status = VALUES(status)
  `;
  db.query(sql, [student_id, date, status], callback);
};

// ➤ Student Log — ✅ user_id se verify karo
exports.getStudentLog = (student_id, user_id, callback) => {
  const sql = `
    SELECT attendance.status, COUNT(*) as total
    FROM attendance
    JOIN students ON students.id = attendance.student_id
    WHERE attendance.student_id = ?
    AND students.user_id = ?
    GROUP BY attendance.status
  `;
  db.query(sql, [student_id, user_id], callback);
};

// ➤ Monthly Report — ✅ user_id filter
exports.getMonthlyReport = (course_id, user_id, callback) => {
  const sql = `
    SELECT 
      students.id,
      students.name,
      students.student_id,
      ROUND(
        IFNULL(
          SUM(CASE WHEN attendance.status IN ('present','P') THEN 1 ELSE 0 END)
          / NULLIF(COUNT(attendance.id), 0) * 100,
        0)
      ) AS percentage
    FROM students
    LEFT JOIN attendance ON students.id = attendance.student_id
    WHERE students.course_id = ?
    AND students.user_id = ?
    GROUP BY students.id
    ORDER BY students.name ASC
  `;
  db.query(sql, [course_id, user_id], callback);
};

// ➤ Attendance by Date Range — ✅ user_id filter
exports.getAttendanceByRange = (course_id, from, to, user_id, callback) => {
  const sql = `
    SELECT 
      students.name,
      students.student_id,
      DATE_FORMAT(attendance.date, '%Y-%m-%d') AS date,
      attendance.status
    FROM attendance
    JOIN students ON students.id = attendance.student_id
    WHERE students.course_id = ?
    AND attendance.date BETWEEN ? AND ?
    AND students.user_id = ?
    GROUP BY students.student_id, attendance.date
    ORDER BY attendance.date ASC, students.name ASC
  `;
  db.query(sql, [course_id, from, to, user_id], callback);
};

// ➤ Check attendance exists — ✅ user_id filter
exports.checkAttendanceExists = (date, course_id, user_id, callback) => {
  const sql = `
    SELECT COUNT(*) as count
    FROM attendance a
    JOIN students s ON s.id = a.student_id
    WHERE s.course_id = ? AND a.date = ? AND s.user_id = ?
  `;
  db.query(sql, [course_id, date, user_id], callback);
};
