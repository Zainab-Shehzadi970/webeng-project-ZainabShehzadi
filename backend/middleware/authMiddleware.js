const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Check token exist
  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied ❌ No token' });
  }

  // Format: Bearer TOKEN
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Invalid token format ❌' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Save user info in request
    req.user = decoded;

    next(); // go to next controller
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token ❌' });
  }
};
