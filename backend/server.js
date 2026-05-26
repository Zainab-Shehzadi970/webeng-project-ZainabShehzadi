const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const env = require('./config/env');

const app = express();

// ✅ Database Connection
require('./config/db');


// =============================
// MIDDLEWARE
// =============================
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(morgan('dev'));


// =============================
// STATIC FOLDERS
// =============================

// Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Frontend
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '../frontend/pages')));


// =============================
// ROUTES
// =============================
const dashboardRoutes = require('./routes/dashboardRoutes');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const courseRoutes = require('./routes/courseRoutes');
const authRoutes = require('./routes/authRoutes');


// =============================
// API ROUTES
// =============================
app.use('/api/dashboard', dashboardRoutes);

app.use('/api/students', studentRoutes);

app.use('/api/attendance', attendanceRoutes);

app.use('/api/courses', courseRoutes);

app.use('/api/auth', authRoutes);


// =============================
// FRONTEND ROUTES
// =============================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/dashboard.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/register.html'));
});

app.get('/courses', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/courses.html'));
});

app.get('/attendance', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/attendance.html'));
});

app.get('/students', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/students.html'));
});

// =============================
// 404 HANDLER
// =============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});


// =============================
// ERROR HANDLER
// =============================
const { errorHandler } = require('./middleware/errorMiddleware');

app.use(errorHandler);


/// =============================
// SERVER
// =============================

if (process.env.NODE_ENV !== 'test') {

  app.listen(env.PORT, () => {

    console.log(`🚀 Server running on port ${env.PORT}`);

  });

}

module.exports = app;