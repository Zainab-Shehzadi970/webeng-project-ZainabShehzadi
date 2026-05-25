const db = require('../config/db');
const courseModel = require('../models/courseModel');

exports.getDashboard = async (req, res) => {

  const user_id = req.user.id;

  try {

    // ======================================================
    // TOTAL STUDENTS
    // ======================================================

    const [students] = await db.promise().query(
      `
      SELECT COUNT(*) as total
      FROM students
      WHERE user_id = ?
      `,
      [user_id]
    );


    // ======================================================
    // TOTAL COURSES
    // ======================================================

    const [courses] = await db.promise().query(
      `
      SELECT COUNT(*) as total
      FROM courses
      WHERE user_id = ?
      `,
      [user_id]
    );


    // ======================================================
    // AVG ATTENDANCE
    // ======================================================

    const [attendance] = await db.promise().query(
      `
      SELECT ROUND(
        SUM(
          CASE
            WHEN a.status IN ('present','P')
            THEN 1
            ELSE 0
          END
        ) / NULLIF(COUNT(*),0) * 100
      ) AS avgAttendance

      FROM attendance a

      JOIN students s
      ON s.id = a.student_id

      WHERE s.user_id = ?
      `,
      [user_id]
    );


    // ======================================================
    // ATTENDANCE TREND
    // ======================================================

    const [trend] = await db.promise().query(
      `
      SELECT
        DATE(a.date) as day,

        ROUND(
          SUM(
            CASE
              WHEN a.status IN ('present','P')
              THEN 1
              ELSE 0
            END
          ) / NULLIF(COUNT(*),0) * 100
        ) as percentage

      FROM attendance a

      JOIN students s
      ON s.id = a.student_id

      WHERE
        s.user_id = ?
        AND DATE(a.date) >= CURDATE() - INTERVAL 6 DAY

      GROUP BY DATE(a.date)

      ORDER BY day ASC
      `,
      [user_id]
    );


    // ======================================================
    // ATTENDANCE ACTIVITY
    // ONLY ONE ENTRY PER COURSE + DATE
    // ======================================================

    const [attActivity] = await db.promise().query(
      `
      SELECT
        c.name AS course_name,
        MAX(a.date) as date

      FROM attendance a

      JOIN students s
      ON s.id = a.student_id

      JOIN courses c
      ON c.id = s.course_id

      WHERE s.user_id = ?

      GROUP BY c.id, DATE(a.date)

      ORDER BY MAX(a.date) DESC

      LIMIT 5
      `,
      [user_id]
    );


    // ======================================================
    // RECENTLY ADDED STUDENTS
    // ======================================================

    const [studentActivity] = await db.promise().query(
      `
      SELECT
        name,
        created_at as date

      FROM students

      WHERE
        user_id = ?
        AND name IS NOT NULL
        AND name != ''

      ORDER BY created_at DESC

      LIMIT 5
      `,
      [user_id]
    );


    // ======================================================
    // RECENTLY ADDED COURSES
    // ======================================================

    const [courseActivity] = await db.promise().query(
      `
      SELECT
        name,
        created_at as date

      FROM courses

      WHERE
        user_id = ?
        AND name IS NOT NULL
        AND name != ''

      ORDER BY created_at DESC

      LIMIT 5
      `,
      [user_id]
    );


    // ======================================================
    // FORMAT ACTIVITIES
    // ======================================================

   const formattedAttendance = attActivity.map(a => ({
  text: `Attendance marked for ${a.course_name}`,
  date: a.date,
  type: 'attendance'
}));


const formattedStudents = studentActivity.map(s => ({
  text: `Added new student ${s.name}`,
  date: s.date,
  type: 'student'
}));


const formattedCourses = courseActivity.map(c => ({
  text: `Added new course ${c.name}`,
  date: c.date,
  type: 'course'
}));

    // ======================================================
    // MERGE ALL
    // ======================================================

    let allActivities = [

      ...formattedAttendance,

      ...formattedStudents,

      ...formattedCourses

    ];


    // ======================================================
    // REMOVE DUPLICATES
    // ======================================================

    allActivities = allActivities.filter(
      (item, index, self) =>
        index === self.findIndex(
          t => t.text === item.text
        )
    );


    // ======================================================
    // SORT LATEST FIRST
    // ======================================================

    allActivities.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );


    // ======================================================
    // ONLY LATEST 5
    // ======================================================

    const recentActivity = allActivities.slice(0, 5);


    // ======================================================
    // MY COURSES
    // ======================================================

    const myCourses = await new Promise((resolve, reject) => {

      courseModel.getCourses(user_id, (err, results) => {

        if (err) return reject(err);

        resolve(results || []);

      });

    });


    // ======================================================
    // FINAL RESPONSE
    // ======================================================

    return res.json({

      success: true,

      data: {

        totalStudents:
          students[0]?.total || 0,

        totalCourses:
          courses[0]?.total || 0,

        avgAttendance:
          attendance[0]?.avgAttendance || 0,

        trend:
          trend || [],

        recentActivity:
          recentActivity || [],

        courses:
          myCourses || []

      }

    });

  } catch (err) {

    console.error('Dashboard Error:', err);

    return res.status(500).json({
      success: false,
      message: 'Dashboard load failed'
    });

  }

};