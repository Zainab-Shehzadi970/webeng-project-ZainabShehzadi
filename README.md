# Student Management System (SMS)

A web-based application for teachers to manage courses, students, and attendance.

## Features
- Teacher authentication (register/login)
- Course management (add, edit, delete)
- Student enrollment
- Attendance tracking with history
- Excel import/export

## Tech Stack
- Frontend: HTML, Tailwind CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MySQL

## Setup Instructions

1. Clone the repository
   git clone https://github.com/Zainab-Shehzadi970/student-management-system.git

2. Install dependencies
   npm install

3. Create .env file (see .env.example)

4. Setup MySQL database
   - Create database: student_management
   - Run: database/schema.sql

5. Run the project
   node backend/server.js

## Environment Variables
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=student_management
JWT_SECRET=your_secret_key
PORT=5000

## Live URL
Coming soon