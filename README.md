# 📚 Student Management System (SMS)

A full-stack web application for teachers to manage students, courses, and attendance — built with Node.js, Express, MySQL, and vanilla JavaScript frontend.

**Live URL:** https://webeng-project-zainabshehzadi-production.up.railway.app/

---

## ✨ Features

- 🔐 **Authentication** — Secure login with JWT tokens
- 📊 **Dashboard** — Stats cards, attendance trend chart, recent activities (students, courses, attendance)
- 📚 **Courses** — Add, edit, delete courses with course codes
- 🎓 **Students** — Add, edit, delete students; import via Excel; export by course
- 📅 **Attendance** — Mark attendance per course per date; bulk export by date range

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, Tailwind CSS, Vanilla JS, Chart.js |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Auth | JWT (jsonwebtoken) |
| Excel | ExcelJS, SheetJS (xlsx) |
| Deployment | Railway |

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- MySQL 8+

### 1. Clone the repo
```bash
git clone https://github.com/Zainab-Shehzadi970/webeng-project-ZainabShehzadi.git
cd webeng-project-ZainabShehzadi
```

### 2. Install dependencies
```bash
cd backend
npm install
```

### 3. Create `.env` file
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=student_management
JWT_SECRET=your_secret_key
```

### 4. Setup Database
```bash
mysql -u root -p < database/schema.sql
```

### 5. Run the server
```bash
npm start
```

### 6. Open in browser
```
http://localhost:5000
```

---

## 📁 Project Structure

```
final_sms/
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/     # Route logic
│   ├── middlewares/     # JWT auth
│   ├── models/          # DB queries
│   ├── routes/          # Express routes
│   └── utils/           # Excel export helper
├── frontend/
│   ├── assets/
│   │   ├── css/         # Styles
│   │   └── js/          # Page scripts
│   ├── components/      # Sidebar, Navbar, Footer
│   └── pages/           # HTML pages
├── database/
│   └── schema.sql       # DB schema
└── tests/               # Unit tests
```

---

## 🧪 Running Tests

```bash
cd backend
npm test
```

---

## 🌐 Deployment

Deployed on **Railway** with MySQL plugin.

Environment variables set in Railway dashboard (same as `.env` above).

---

## 👩‍💻 Author

**Zainab Shehzadi**  
Web Engineering — Spring 2026