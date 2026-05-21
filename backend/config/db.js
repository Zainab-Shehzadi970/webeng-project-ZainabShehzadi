const mysql = require('mysql2');
const env = require('./env'); // ✅ import

const db = mysql.createConnection({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed ❌', err);
  } else {
    console.log('MySQL Connected ✅');
  }
});

module.exports = db;
