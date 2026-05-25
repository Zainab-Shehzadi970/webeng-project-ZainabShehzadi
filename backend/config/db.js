const mysql = require('mysql2');
const env = require('./env');

const db = mysql.createPool({
  host:     process.env.MYSQLHOST     || env.DB_HOST,
  user:     process.env.MYSQLUSER     || env.DB_USER,
  password: process.env.MYSQLPASSWORD || env.DB_PASSWORD,
  database: process.env.MYSQLDATABASE || env.DB_NAME,
  port:     process.env.MYSQLPORT     || process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed ❌', err.message);
  } else {
    console.log('MySQL Pool Connected ✅');
    connection.release();
  }
});

module.exports = db;