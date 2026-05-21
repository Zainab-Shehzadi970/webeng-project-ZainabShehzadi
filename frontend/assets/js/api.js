// 🔗 BASE URL
const BASE_URL = 'http://localhost:5000/api';

// 🔐 TOKEN
const getToken = () => localStorage.getItem('token');


// ============================
// GENERIC API CALL
// ============================
const apiRequest = async (endpoint, method = 'GET', body = null) => {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() && { Authorization: `Bearer ${getToken()}` })
      },
      body: body ? JSON.stringify(body) : null
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Something went wrong ❌');
    }

    return data;

  } catch (error) {
    console.error('API Error:', error.message);
    alert(error.message);
    throw error;
  }
};


// ============================
// AUTH API
// ============================

// ➤ Register
const registerUser = (userData) => {
  return apiRequest('/auth/register', 'POST', userData);
};

// ➤ Login
const loginUser = async (userData) => {
  const data = await apiRequest('/auth/login', 'POST', userData);

  // Save token
  localStorage.setItem('token', data.token);

  return data;
};


// ============================
// STUDENT API
// ============================

// ➤ Get Students
const getStudents = (query = '') => {
  return apiRequest(`/students${query}`);
};

// ➤ Add Student
const addStudent = (data) => {
  return apiRequest('/students', 'POST', data);
};

// ➤ Update Student
const updateStudent = (id, data) => {
  return apiRequest(`/students/${id}`, 'PUT', data);
};

// ➤ Delete Student
const deleteStudent = (id) => {
  return apiRequest(`/students/${id}`, 'DELETE');
};


// ============================
// COURSE API
// ============================

const getCourses = () => apiRequest('/courses');

const addCourse = (data) => apiRequest('/courses', 'POST', data);


// ============================
// ATTENDANCE API
// ============================

// ➤ Mark Attendance
const markAttendance = (data) => {
  return apiRequest('/attendance', 'POST', data);
};

// ➤ Get Attendance
const getAttendance = (date, course_id) => {
  return apiRequest(`/attendance?date=${date}&course_id=${course_id}`);
};

// ➤ Export Attendance
const exportAttendance = (date, course_id) => {
  window.open(`${BASE_URL}/attendance/export?date=${date}&course_id=${course_id}`);
};

// ➤ Bulk Export
const exportBulkAttendance = (course_id, from, to) => {
  window.open(`${BASE_URL}/attendance/export/bulk?course_id=${course_id}&from_date=${from}&to_date=${to}`);
};
