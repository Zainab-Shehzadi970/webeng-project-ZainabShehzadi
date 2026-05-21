let attendanceData = {};
let currentMode = 'new';
let currentCourseId = null;
let currentDate = null;
let currentStudents = [];

window.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('attendanceDate').value = today;
  currentDate = today;
  loadCourses();
});

// ===========================
// MODE
// ===========================
function setMode(mode) {
  currentMode = mode;
  document.getElementById('markNewBtn').className =
    mode === 'new'
      ? 'px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-500 text-white'
      : 'px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600';
  document.getElementById('viewHistoryBtn').className =
    mode === 'history'
      ? 'px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-500 text-white'
      : 'px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600';
  if (currentCourseId && currentDate) loadAttendance();
}

// ===========================
// LOAD COURSES
// ===========================
async function loadCourses() {
  try {
    const res = await fetch('/api/courses', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
    });
    const result = await res.json();
    const courses = result.data || [];
    const select = document.getElementById('courseSelect');
    courses.forEach(c => {
      select.innerHTML += `<option value="${c.id}">${c.name}</option>`;
    });
  } catch(e) { console.error(e); }
}

function onCourseChange() {
  currentCourseId = document.getElementById('courseSelect').value;
  if (currentCourseId && currentDate) loadAttendance();
}

function onDateChange() {
  currentDate = document.getElementById('attendanceDate').value;
  if (currentCourseId && currentDate) loadAttendance();
}

// ===========================
// STATUS HELPERS
// ===========================
// DB stores: 'present', 'absent', 'leave'
// UI badge shows: 'P', 'A', 'L'

function dbToDisplay(status) {
  if (!status) return '—';
  const s = status.toLowerCase();
  if (s === 'present') return 'P';
  if (s === 'absent')  return 'A';
  if (s === 'leave')   return 'L';
  return status.toUpperCase().charAt(0); // fallback
}

function dbToBadgeClass(status) {
  if (!status) return 'unset';
  const s = status.toLowerCase();
  if (s === 'present') return 'present';
  if (s === 'absent')  return 'absent';
  if (s === 'leave')   return 'leave';
  return 'unset';
}

// ===========================
// LOAD ATTENDANCE
// ===========================
async function loadAttendance() {
  if (!currentCourseId) return;
  try {
    showLoader();
    document.getElementById('tableHint').textContent = '';

    const res = await fetch(
      `/api/attendance?course_id=${currentCourseId}&date=${currentDate}`,
      { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } }
    );
    const result = await res.json();
    currentStudents = result.data || [];

    attendanceData = {};
    currentStudents.forEach(s => {
      attendanceData[s.id] = s.status || null;
    });

    if (currentMode === 'history') {
      renderHistoryTable(currentStudents);
    } else {
      const alreadyMarked = currentStudents.some(s => s.status);
      if (alreadyMarked) {
        showAlreadyMarkedMessage();
      } else {
        renderMarkNewTable(currentStudents);
      }
    }
    updateAvg();
  } catch(e) {
    console.error(e);
  } finally {
    hideLoader();
  }
}

// ===========================
// ALREADY MARKED MESSAGE
// ===========================
function showAlreadyMarkedMessage() {
  // Update thead
  document.querySelector('thead tr').innerHTML = `
    <th class="p-5 text-left text-gray-500 text-sm uppercase tracking-wide">Student Info</th>
    <th class="p-5 text-left text-gray-500 text-sm uppercase tracking-wide">Status</th>
    <th class="p-5 text-left text-gray-500 text-sm uppercase tracking-wide">Monthly Avg</th>
    <th class="p-5 text-left text-gray-500 text-sm uppercase tracking-wide">Summary</th>
  `;
  const tbody = document.getElementById('attendanceTable');
  tbody.innerHTML = `
    <tr>
      <td colspan="4" class="text-center py-10">
        <div class="flex flex-col items-center gap-3">
          <i class="fa-solid fa-circle-check text-emerald-500 text-4xl"></i>
          <p class="font-semibold text-slate-700 text-lg">Attendance Already Marked</p>
          <p class="text-gray-400 text-sm">You have already marked attendance for this date.</p>
          <button onclick="setMode('history')"
            class="mt-2 bg-emerald-500 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-600">
            View &amp; Edit in History
          </button>
        </div>
      </td>
    </tr>
  `;
}

// ===========================
// RENDER MARK NEW TABLE
// ===========================
function renderMarkNewTable(students) {
  document.querySelector('thead tr').innerHTML = `
    <th class="p-5 text-left text-gray-500 text-sm uppercase tracking-wide">Student Info</th>
    <th class="p-5 text-left text-gray-500 text-sm uppercase tracking-wide">Status</th>
    <th class="p-5 text-left text-gray-500 text-sm uppercase tracking-wide">Monthly Avg</th>
    <th class="p-5 text-left text-gray-500 text-sm uppercase tracking-wide">Summary</th>
  `;

  const tbody = document.getElementById('attendanceTable');
  tbody.innerHTML = '';

  if (!students.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center py-10 text-gray-400">No students found for this course</td></tr>`;
    return;
  }

  students.forEach(s => {
    // attendanceData stores DB values or null
    const dbStatus = attendanceData[s.id];
    const uiChar = dbToDisplay(dbStatus); // 'P','A','L' or '—'
    const isP = dbStatus === 'present';
    const isA = dbStatus === 'absent';
    const isL = dbStatus === 'leave';
    const avg = (s.monthly_avg != null) ? s.monthly_avg : 0;

    tbody.innerHTML += `
      <tr class="border-t hover:bg-gray-50 transition">
        <td class="p-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-sm">
              ${s.name.substring(0,2).toUpperCase()}
            </div>
            <div>
              <p class="font-semibold text-slate-800">${s.name}</p>
              <p class="text-xs text-gray-400">${s.student_id || ''}</p>
            </div>
          </div>
        </td>
        <td class="p-5">
          <div class="flex gap-2">
            <button onclick="setStatus(${s.id}, 'present')" class="status-btn ${isP?'present':'unset'}">P</button>
            <button onclick="setStatus(${s.id}, 'absent')"  class="status-btn ${isA?'absent':'unset'}">A</button>
            <button onclick="setStatus(${s.id}, 'leave')"   class="status-btn ${isL?'leave':'unset'}">L</button>
          </div>
        </td>
        <td class="p-5"><span class="font-semibold">${avg}%</span></td>
        <td class="p-5">
          <button onclick="viewLog(${s.id}, '${s.name}', '${s.student_id || ''}')"
            class="text-emerald-600 font-semibold text-sm hover:underline">VIEW FULL LOG</button>
        </td>
      </tr>
    `;
  });
}

// ===========================
// RENDER VIEW HISTORY TABLE
// ===========================
function renderHistoryTable(students) {
  document.querySelector('thead tr').innerHTML = `
    <th class="p-5 text-left text-gray-500 text-sm uppercase tracking-wide">Student Info</th>
    <th class="p-5 text-left text-gray-500 text-sm uppercase tracking-wide">Status</th>
    <th class="p-5 text-left text-gray-500 text-sm uppercase tracking-wide">Monthly Avg</th>
    <th class="p-5 text-left text-gray-500 text-sm uppercase tracking-wide">Edit</th>
    <th class="p-5 text-left text-gray-500 text-sm uppercase tracking-wide">Summary</th>
  `;

  const tbody = document.getElementById('attendanceTable');
  tbody.innerHTML = '';

  const hasAttendance = students.some(s => s.status);

  if (!students.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-10 text-gray-400">No students found</td></tr>`;
    updateAvg();
    return;
  }

  if (!hasAttendance) {
    tbody.innerHTML = `
      <tr><td colspan="5" class="text-center py-10 text-gray-400">
        <i class="fa-solid fa-calendar-xmark text-3xl mb-2 block"></i>
        Attendance not marked for this date
      </td></tr>`;
    updateAvg();
    return;
  }

  let totalPresent = 0, totalMarked = 0;

  students.forEach(s => {
    const dbStatus = s.status;                     // 'present','absent','leave' or null
    const displayChar = dbToDisplay(dbStatus);     // 'P','A','L' or '—'
    const badgeClass  = dbToBadgeClass(dbStatus);  // 'present','absent','leave','unset'
    const avg = (s.monthly_avg != null) ? s.monthly_avg : 0;

    if (dbStatus) {
      totalMarked++;
      if (dbStatus === 'present') totalPresent++;
    }

    tbody.innerHTML += `
      <tr class="border-t hover:bg-gray-50 transition">
        <td class="p-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-sm">
              ${s.name.substring(0,2).toUpperCase()}
            </div>
            <div>
              <p class="font-semibold text-slate-800">${s.name}</p>
              <p class="text-xs text-gray-400">${s.student_id || ''}</p>
            </div>
          </div>
        </td>
        <td class="p-5">
          <span class="status-btn ${badgeClass}" style="display:inline-flex;">${displayChar}</span>
        </td>
        <td class="p-5"><span class="font-semibold">${avg}%</span></td>
        <td class="p-5">
          <button onclick="openEditModal(${s.id}, '${s.name}', '${s.student_id || ''}', '${dbStatus || ''}')"
            class="text-blue-500 hover:text-blue-700 text-lg">
            <i class="fa-solid fa-pen"></i>
          </button>
        </td>
        <td class="p-5">
          <button onclick="viewLog(${s.id}, '${s.name}', '${s.student_id || ''}')"
            class="text-emerald-600 font-semibold text-sm hover:underline">VIEW FULL LOG</button>
        </td>
      </tr>
    `;
  });

  // Update avg bar for history view
  const avg = totalMarked ? Math.round((totalPresent / totalMarked) * 100) : 0;
  const el = document.getElementById('avgDisplay');
  if (el) el.textContent = avg + '%';
}

// ===========================
// SET STATUS (mark new)
// ===========================
function setStatus(studentId, dbStatus) {
  // dbStatus = 'present'|'absent'|'leave'
  attendanceData[studentId] = dbStatus;

  document.querySelectorAll(`[onclick*="setStatus(${studentId},"]`).forEach(btn => {
    const btnText = btn.textContent.trim(); // 'P', 'A', 'L'
    const isActive =
      (dbStatus === 'present' && btnText === 'P') ||
      (dbStatus === 'absent'  && btnText === 'A') ||
      (dbStatus === 'leave'   && btnText === 'L');
    btn.className = 'status-btn ' + (
      isActive
        ? (dbStatus === 'present' ? 'present' : dbStatus === 'absent' ? 'absent' : 'leave')
        : 'unset'
    );
  });
  updateAvg();
}

function presentAll() {
  currentStudents.forEach(s => { attendanceData[s.id] = 'present'; });
  document.querySelectorAll('.status-btn').forEach(btn => {
    const t = btn.textContent.trim();
    if (['P','A','L'].includes(t)) {
      btn.className = 'status-btn ' + (t === 'P' ? 'present' : 'unset');
    }
  });
  updateAvg();
}

function resetAttendance() {
  currentStudents.forEach(s => { attendanceData[s.id] = null; });
  document.querySelectorAll('.status-btn').forEach(btn => {
    const t = btn.textContent.trim();
    if (['P','A','L'].includes(t)) btn.className = 'status-btn unset';
  });
  updateAvg();
}

function updateAvg() {
  const values = Object.values(attendanceData).filter(v => v);
  const present = values.filter(v => v === 'present').length;
  const avg = values.length ? Math.round((present / values.length) * 100) : 0;
  const el = document.getElementById('avgDisplay');
  if (el) el.textContent = avg + '%';
}

// ===========================
// SAVE CHANGES (Mark New)
// ===========================
async function saveChanges() {
  if (!currentCourseId || !currentDate) return alert('Please select course and date');

  const records = Object.entries(attendanceData)
    .filter(([, s]) => s)
    .map(([id, status]) => ({
      student_id: id,
      status: status  // already full DB value: 'present'/'absent'/'leave'
    }));

  if (!records.length) return alert('Please mark attendance first');

  try {
    showLoader();
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({ course_id: currentCourseId, date: currentDate, records })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    alert('✅ Attendance saved!');
    loadAttendance();
  } catch(e) {
    alert('❌ ' + e.message);
  } finally {
    hideLoader();
  }
}

// ===========================
// EDIT MODAL
// ===========================
function openEditModal(studentId, name, sid, currentDbStatus) {
  document.getElementById('editStudentLabel').textContent = `${name} | ID: ${sid}`;
  document.getElementById('editDateLabel').textContent = `Update for Date: ${currentDate}`;
  document.getElementById('editStudentId').value = studentId;
  const select = document.getElementById('editStatusSelect');
  select.value = currentDbStatus || '';
  updateEditBadge(select);
  document.getElementById('editAttendanceModal').classList.remove('hidden');
}

function updateEditBadge(select) {
  const badge = document.getElementById('editStatusBadge');
  const val = select.value;
  if (val === 'present') {
    badge.textContent = 'P';
    badge.style.background = '#22c55e';
    badge.style.display = 'flex';
  } else if (val === 'absent') {
    badge.textContent = 'A';
    badge.style.background = '#ef4444';
    badge.style.display = 'flex';
  } else if (val === 'leave') {
    badge.textContent = 'L';
    badge.style.background = '#facc15';
    badge.style.display = 'flex';
  } else {
    badge.textContent = '';
    badge.style.display = 'none';
  }
}

function closeEditModal() {
  document.getElementById('editAttendanceModal').classList.add('hidden');
}

async function saveEditAttendance() {
  const studentId = document.getElementById('editStudentId').value;
  const status    = document.getElementById('editStatusSelect').value; // 'present'/'absent'/'leave'
  if (!status) return alert('Please select a status');

  try {
    showLoader();
    const res = await fetch('/api/attendance', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({ student_id: studentId, date: currentDate, status })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    closeEditModal();
    loadAttendance(); // reload to show updated data
  } catch(e) {
    alert('❌ ' + e.message);
  } finally {
    hideLoader();
  }
}

// ===========================
// VIEW FULL LOG
// ===========================
async function viewLog(studentId, name, sid) {
  try {
    const res = await fetch(`/api/attendance/student/${studentId}`, {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
    });
    const result = await res.json();
    const log = result.data || {};

    const present = log.present || 0;
    const absent  = log.absent  || 0;
    const leave   = log.leave   || 0;
    const total   = present + absent + leave;
    const avg     = total ? Math.round((present / total) * 100) : 0;

    document.getElementById('logContent').innerHTML = `
      <div class="bg-gray-50 rounded-2xl p-4 mb-4 text-center font-bold text-slate-800">
        ${name} | ID: ${sid}
      </div>
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <span>Total Present</span>
          <span class="bg-green-500 text-white px-4 py-1 rounded-full font-bold">${present}</span>
        </div>
        <div class="flex justify-between items-center">
          <span>Total Absent</span>
          <span class="bg-red-500 text-white px-4 py-1 rounded-full font-bold">${absent}</span>
        </div>
        <div class="flex justify-between items-center">
          <span>Total Leave</span>
          <span class="bg-yellow-400 text-white px-4 py-1 rounded-full font-bold">${leave}</span>
        </div>
        <div class="flex justify-between items-center">
          <span>Monthly Average</span>
          <span class="border-2 border-green-500 text-green-600 px-4 py-1 rounded-full font-bold">${avg}%</span>
        </div>
      </div>
    `;
    document.getElementById('logModal').classList.remove('hidden');
  } catch(e) { console.error(e); }
}

function closeLogModal() {
  document.getElementById('logModal').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('saveAttendance')?.addEventListener('click', saveChanges);
});

// ===========================
// BULK EXPORT MODAL
// ===========================
function openBulkExportModal() {
  // Populate course dropdown from already-loaded courses
  const mainSelect = document.getElementById('courseSelect');
  const bulkSelect = document.getElementById('bulkCourseSelect');
  bulkSelect.innerHTML = '';
  Array.from(mainSelect.options).forEach(opt => {
    if (opt.value) {
      const o = document.createElement('option');
      o.value = opt.value;
      o.text  = opt.text;
      bulkSelect.appendChild(o);
    }
  });
  // Pre-select current course
  if (currentCourseId) bulkSelect.value = currentCourseId;

  // Default date range: first day of current month → today
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];
  document.getElementById('bulkFromDate').value = firstDay;
  document.getElementById('bulkToDate').value   = todayStr;

  document.getElementById('bulkExportModal').classList.remove('hidden');
}

function closeBulkExportModal() {
  document.getElementById('bulkExportModal').classList.add('hidden');
}

async function doBulkExport() {
  const courseId  = document.getElementById('bulkCourseSelect').value;
  const fromDate  = document.getElementById('bulkFromDate').value;
  const toDate    = document.getElementById('bulkToDate').value;

  if (!courseId)           return alert('Please select a course');
  if (!fromDate || !toDate) return alert('Please select date range');
  if (fromDate > toDate)   return alert('From Date cannot be after To Date');

  closeBulkExportModal();
  window.open(`/api/attendance/export/bulk?course_id=${courseId}&from_date=${fromDate}&to_date=${toDate}`);
}