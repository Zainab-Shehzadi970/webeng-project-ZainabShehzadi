const db = require('../config/db');
const courseModel = require('../models/courseModel');
const { success } = require('../utils/responseHandler');

exports.getDashboard = async (req, res, next) => {
  const user_id = req.user.id; // ✅

  try {
    // ➤ Total Students (this teacher only)
    const [students] = await db.promise().query(
      `SELECT COUNT(*) as total FROM students WHERE user_id = ?`, [user_id]
    );

    // ➤ Total Courses (this teacher only)
    const [courses] = await db.promise().query(
      `SELECT COUNT(*) as total FROM courses WHERE user_id = ?`, [user_id]
    );

    // ➤ Avg Attendance (this teacher's students only)
    const [attendance] = await db.promise().query(`
      SELECT ROUND(
        SUM(CASE WHEN a.status IN ('present','P') THEN 1 ELSE 0 END)
        / NULLIF(COUNT(*), 0) * 100
      ) AS avgAttendance
      FROM attendance a
      JOIN students s ON s.id = a.student_id
      WHERE s.user_id = ?
    `, [user_id]);

    // ➤ Attendance Trend (last 7 days, this teacher only)
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

    // ➤ Recent Activity (this teacher only)
    const [attActivity] = await db.promise().query(`
      SELECT c.name AS course_name, DATE(a.date) as date, 'attendance' as type
      FROM attendance a
      JOIN students s ON s.id = a.student_id
      JOIN courses c ON c.id = s.course_id
      WHERE s.user_id = ?
      GROUP BY c.name, DATE(a.date)
      ORDER BY a.date DESC LIMIT 5
    `, [user_id]);

    const [studentActivity] = await db.promise().query(`
      SELECT name, created_at as date, 'student' as type
      FROM students WHERE user_id = ?
      ORDER BY created_at DESC LIMIT 5
    `, [user_id]);

    const [courseActivity] = await db.promise().query(`
      SELECT name, created_at as date, 'course' as type
      FROM courses WHERE user_id = ?
      ORDER BY created_at DESC LIMIT 5
    `, [user_id]);

    const allActivities = [...attActivity, ...studentActivity, ...courseActivity]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    // ➤ My Courses
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
        recentActivity: allActivities,
        courses:        myCourses
      }
    });

  } catch (err) {
    console.error('Dashboard Error:', err);
    return res.status(500).json({ success: false, message: 'Dashboard load failed' });
  }
};
