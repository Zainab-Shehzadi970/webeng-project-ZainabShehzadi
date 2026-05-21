// Email validation helper
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};


// ➤ REGISTER VALIDATION
exports.validateRegister = (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  // Required fields
  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required ❌' });
  }

  // Email format
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format ❌' });
  }

  // Password length
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters ❌' });
  }

  // Confirm password match
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match ❌' });
  }

  next(); // ✅ move to controller
};


// ➤ LOGIN VALIDATION
exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  // Required
  if (!email || !password) {
    return res.status(400).json({ message: 'Email & Password required ❌' });
  }

  // Email format
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format ❌' });
  }

  next(); // ✅ move to controller
};
