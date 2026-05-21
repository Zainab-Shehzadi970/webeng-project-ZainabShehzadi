const db = require('../config/db');


// ➤ Create User
exports.createUser = (name, email, password, callback) => {
  const sql = `
    INSERT INTO users (name, email, password)
    VALUES (?, ?, ?)
  `;
  db.query(sql, [name, email, password], callback);
};


// ➤ Find User by Email
exports.findUserByEmail = (email, callback) => {
  const sql = `SELECT * FROM users WHERE email = ?`;
  db.query(sql, [email], callback);
};
