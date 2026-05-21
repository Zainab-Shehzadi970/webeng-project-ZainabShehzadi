-- Database create
CREATE DATABASE IF NOT EXISTS student_management;
USE student_management;

-- =========================
-- Users Table (Teachers/Login)
-- =========================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    course_code VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    student_id VARCHAR(50) UNIQUE,
    course_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (course_id) REFERENCES courses(id)
        ON DELETE SET NULL
);

-- Attendance Table
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    date DATE,
    status ENUM('present', 'absent', 'leave') DEFAULT 'present',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE,

    UNIQUE (student_id, date)
);

-- Indexes
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_student_name ON students(name);
CREATE INDEX idx_student_student_id ON students(student_id);
