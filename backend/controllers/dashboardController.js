const db = require('../config/db');
const courseModel = require('../models/courseModel');

exports.getDashboard = async (req, res, next) => {
  const user_id = req.user.id;

  try {
    const [students] = await db.promise().query(
      `SELECT COUNT(*) as total FROM students WHERE user_id = ?`, [user_id]
    );

    const [courses] = await db.promise().query(
      `SELECT COUNT(*) as total FROM courses WHERE user_id = ?`, [user_id]
    );

    const [attendance] = await db.promise().query(`
      SELECT ROUND(
        SUM(CASE WHEN a.status IN ('present','P') THEN 1 ELSE 0 END)
        / NULLIF(COUNT(*), 0) * 100
      ) AS avgAttendance
      FROM attendance a
      JOIN students s ON s.id = a.student_id
      WHERE s.user_id = ?
    `, [user_id]);

    const [trend] = await db.promise().query(`
      SELECT DATE(a.date) as day,
        ROUND(
          SUM(CASE WHEN a.status IN ('present','P') THEN 1 ELSE 0 END)
          / NULLIF(COUNT(*), 0) * 100
        ) as percentage
      FROM attendance a
      JOIN students s ON s.id = a.student_id
      WHERE s.user_id = ? AND DATE(a.date) >= CURDATE() - INTERVAL 6 DAY
      GROUP BY DATE(a.date)
      ORDER BY day ASC
    `, [user_id]);

    const [attActivity] = await db.promise().query(`
    SELECT c.name AS course_name, DATE(a.date) as date, 'attendance' as type
     FROM attendance a
     JOIN students s ON s.id = a.student_id
     JOIN courses c ON c.id = s.course_id
     WHERE s.user_id = ?
     GROUP BY c.name, DATE(a.date)
     ORDER BY DATE(a.date) DESC LIMIT 5
`  , [user_id]);

    const myCourses = await new Promise((resolve, reject) => {
      courseModel.getCourses(user_id, (err, results) => {
        if (err) return reject(err);
        resolve(results || []);
      });
    });

    return res.json({
      success: true,
      data: {
        totalStudents:  students[0]?.total || 0,
        totalCourses:   courses[0]?.total  || 0,
        avgAttendance:  attendance[0]?.avgAttendance || 0,
        trend:          trend || [],
        recentActivity: attActivity || [],
        courses:        myCourses
      }
    });

  } catch (err) {
    console.error('Dashboard Error:', err);
    return res.status(500).json({ success: false, message: 'Dashboard load failed' });
  }
};