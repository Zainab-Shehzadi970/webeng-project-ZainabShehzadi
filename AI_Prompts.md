# AI Prompts Log — Student Management System
**Student:** Zainab Shehzadi  
**Project:** Student Management System (SMS)  
**Platform Used:** Claude (Anthropic)

---

## Prompt 1 — Export Students with Course Filter (Modal UI)

**Date:** May 2026  
**Feature:** Students Page — Export Excel with course filter

**Prompt:**
> "I have a Students Directory page. Right now when I click Export, it directly saves all students as Excel. I want it to open a modal first where the teacher can select a specific course or 'All Courses', and then export. Here are two UI screenshots showing what I want."

**AI Output:**
- Added `openExportModal()` / `closeExportModal()` functions in `students.js`
- Created modal HTML in `students.html` with a course dropdown
- Updated `exportStudents()` to append `?course_id=` query param to the API URL
- Updated `dashboardController.js` backend to filter students by `course_id` if provided

**Refinement:**
I noticed the course dropdown in the modal was empty because `loadCourses()` was not populating the export modal's `<select>`. I prompted AI to fix `loadCourses()` to also fill `#exportCourseSelect`.

**Lesson:** AI gave correct logic but missed that there were two separate dropdowns on the page.

---

## Prompt 2 — Recent Activities: Students & Courses Not Showing

**Date:** May 2026  
**Feature:** Dashboard — Recent Activities panel

**Prompt:**
> "My dashboard Recent Activities only shows attendance entries. I also add students and courses but they never appear in recent activities. Fix this so all three types show up."

**AI Output:**
- Added two new SQL queries in `dashboardController.js`:
  - `SELECT name, DATE(created_at), 'student' as type FROM students WHERE user_id = ?`
  - `SELECT name, DATE(created_at), 'course' as type FROM courses WHERE user_id = ?`
- Merged all three arrays and sorted by date descending, sliced top 10
- Frontend `dashboard.js` already had `student` and `course` type handlers — they just never received data

**Refinement:** No major changes needed. Worked on first attempt.

---

## Prompt 3 — Dashboard Mobile Responsiveness

**Date:** May 2026  
**Feature:** Dashboard layout on mobile screens

**Prompt:**
> "My dashboard looks fine on desktop but on mobile the layout is very poor. The sidebar overlaps the content. Fix the responsiveness — sidebar should hide on mobile and a hamburger menu should appear."

**AI Output:**
- Updated `sidebar.html` to be hidden by default on mobile (`translate-x-full` → slide in on toggle)
- Added hamburger button in `navbar.html`
- Updated `dashboard.html` main wrapper from hardcoded `ml-64` to responsive `md:ml-64`
- Added overlay backdrop for mobile sidebar

**Refinement:** I had to prompt again to fix the sidebar toggle script because it was conflicting with the existing sidebar active-link highlight script.

---

## Prompt 4 — Bulk Attendance Export (Date Range + Course Filter)

**Date:** May 2026  
**Feature:** Attendance page — Export attendance records as Excel

**Prompt:**
> "I want a bulk export feature on the attendance page. Teacher selects a course and a date range (from_date, to_date), then downloads an Excel file with all student attendance records for that period."

**AI Output:**
- Created `GET /api/attendance/export/bulk?course_id=&from_date=&to_date=` route
- Backend queries attendance joined with students and courses, filtered by date range
- Used `exceljs` to generate the spreadsheet with columns: Student Name, Student ID, Date, Status
- Frontend modal with course select + two date pickers + Export button

**Refinement:** Browser direct URL gave "Access denied ❌ No token" — AI clarified this is expected because the browser doesn't send JWT. The export must be triggered from frontend fetch with Authorization header.

---

## Prompt 5 — Student Import via Excel

**Date:** May 2026  
**Feature:** Students page — Import students from Excel file

**Prompt:**
> "Add an Import Excel feature on the Students page. Teacher uploads an Excel file with columns: name, student_id, course_id. The backend reads the file and inserts all students into the database."

**AI Output:**
- Used `multer` for file upload and `xlsx` (SheetJS) to parse the file
- Created `POST /api/students/import` route
- Validated required columns and skipped duplicate student IDs
- Frontend: file input button + progress feedback toast

**Refinement:** Had to add error handling for when `course_id` in the Excel file doesn't exist in the database.

---

## Prompt 6 — JWT Auth Middleware & Protected Routes

**Date:** May 2026  
**Feature:** Authentication — All API routes protected

**Prompt:**
> "Make sure all my API routes are protected with JWT middleware. Only logged-in teachers should be able to access /api/students, /api/courses, /api/attendance, /api/dashboard."

**AI Output:**
- Created `authMiddleware.js` with `verifyToken` using `jsonwebtoken`
- Applied middleware to all route files
- Returns `{"message": "Access denied ❌ No token"}` when token is missing
- Returns `{"message": "Invalid token ❌"}` when token is expired or tampered

**Refinement:** None needed — worked cleanly.

---

## Prompt 7 — Dashboard Stats Cards (Total Students, Courses, Avg Attendance)

**Date:** May 2026  
**Feature:** Dashboard — Summary stats

**Prompt:**
> "My dashboard should show 3 stat cards: Total Students, Active Courses, and Average Attendance %. Fetch these from the backend using the logged-in teacher's user_id."

**AI Output:**
- Added three SQL COUNT queries in `dashboardController.js`
- Average attendance uses `SUM(CASE WHEN status IN ('present','P') THEN 1 ELSE 0 END) / COUNT(*) * 100`
- Frontend updates `#totalStudents`, `#totalCourses`, `#avgAttendance` elements on load

**Refinement:** Attendance average was returning `null` when no attendance records existed — fixed with `NULLIF(COUNT(*), 0)` to avoid division by zero.

---

## Prompt 8 — Attendance Trend Chart (Last 7 Days)

**Date:** May 2026  
**Feature:** Dashboard — Line chart showing attendance % per day

**Prompt:**
> "Add a line chart on the dashboard showing attendance percentage for each of the last 7 days. Use Chart.js."

**AI Output:**
- SQL query groups attendance by `DATE(a.date)` for last 6 days using `CURDATE() - INTERVAL 6 DAY`
- Returns array of `{ day, percentage }` objects
- Frontend renders Chart.js line chart with tension 0.4, fill true, y-axis 0–100
- Shows fallback flat-zero chart if no data exists yet

**Refinement:** Date labels were showing raw `YYYY-MM-DD` format — prompted AI to format them as `DD Mon` (e.g. "25 May") using `toLocaleDateString`.

---

