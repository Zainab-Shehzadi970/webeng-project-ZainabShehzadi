let students = [];
let courses = [];
let editId = null;

window.onload = () => {
  loadStudents();
  loadCourses();
};

// ===========================
// LOAD STUDENTS
// ===========================
async function loadStudents() {
  try {
    showLoader();
    const res = await fetch('/api/students', {
      headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
    });
    const result = await res.json();
    // ✅ FIX: backend returns array directly or result.data
    students = result.data || result || [];
    renderStudents(students);
  } catch (err) {
    console.error(err);
  } finally {
    hideLoader();
  }
}

// ===========================
// LOAD COURSES
// ===========================
async function loadCourses() {
  try {
    const res = await fetch('/api/courses', {
      headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
    });
    const result = await res.json();
    courses = result.data || [];

    const filter = document.getElementById('courseFilter');
    const modalSelect = document.getElementById('studentCourse');

    courses.forEach(c => {
      filter.innerHTML      += `<option value="${c.id}">${c.name}</option>`;
      modalSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`;
    });
  } catch (err) {
    console.error(err);
  }
}

// ===========================
// RENDER TABLE
// ===========================
function renderStudents(data) {
  const table = document.getElementById('studentsTable');
  table.innerHTML = '';

  if (!data.length) {
    table.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-10 text-gray-400">
          No students found
        </td>
      </tr>`;
    document.getElementById('totalCount').innerText = "0 Students Total";
    return;
  }

  data.forEach(s => {
    // ✅ FIX: backend returns student_id and course_name
    const sid    = s.studentId || s.student_id || '';
    const course = s.course    || s.course_name || '';
    const initials = s.name.substring(0, 2).toUpperCase();

    table.innerHTML += `
      <tr class="border-t hover:bg-gray-50 transition">
        <td class="p-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-sm">
              ${initials}
            </div>
            <span class="font-medium text-slate-800">${s.name}</span>
          </div>
        </td>
        <td class="p-5 text-gray-600">${sid}</td>
        <td class="p-5">
          <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">${course}</span>
        </td>
        <td class="p-5 text-right">
          <button onclick="editStudent(${s.id})"
            class="px-3 py-1.5 bg-gray-100 hover:bg-blue-50 text-blue-600 rounded-lg mr-2 text-sm">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button onclick="removeStudent(${s.id})"
            class="px-3 py-1.5 bg-gray-100 hover:bg-red-50 text-red-500 rounded-lg text-sm">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });

  document.getElementById('totalCount').innerText = data.length + " Students Total";
}

// ===========================
// SEARCH
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('searchInput').addEventListener('input', e => {
    const value = e.target.value.toLowerCase();
    const filtered = students.filter(s =>
      s.name.toLowerCase().includes(value) ||
      (s.student_id || s.studentId || '').toLowerCase().includes(value)
    );
    renderStudents(filtered);
  });

  document.getElementById('courseFilter').addEventListener('change', e => {
    const value = e.target.value;
    if (!value) return renderStudents(students);
    const filtered = students.filter(s => String(s.course_id) === String(value));
    renderStudents(filtered);
  });
});

// ===========================
// OPEN MODAL
// ===========================
function openAddModal() {
  editId = null;
  document.getElementById('modalTitle').innerText = "Add New Student";
  document.getElementById('studentName').value  = '';
  document.getElementById('studentId').value    = '';
  document.getElementById('studentCourse').value = '';
  clearErrors();
  document.getElementById('studentModal').classList.remove('hidden');
}

// ===========================
// EDIT
// ===========================
function editStudent(id) {
  const s = students.find(x => x.id === id);
  if (!s) return;
  editId = id;
  document.getElementById('modalTitle').innerText       = "Edit Student";
  document.getElementById('studentName').value          = s.name;
  document.getElementById('studentId').value            = s.student_id || s.studentId || '';
  document.getElementById('studentCourse').value        = s.course_id || '';
  clearErrors();
  document.getElementById('studentModal').classList.remove('hidden');
}

// ===========================
// VALIDATION
// ===========================
function clearErrors() {
  ['nameError','idError','courseError'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  ['studentName','studentId','studentCourse'].forEach(id => {
    document.getElementById(id).classList.remove('border-red-500');
  });
}

function validateFields(name, sid, course) {
  let valid = true;
  if (!name) {
    document.getElementById('nameError').classList.remove('hidden');
    document.getElementById('studentName').classList.add('border-red-500');
    valid = false;
  }
  if (!sid) {
    document.getElementById('idError').classList.remove('hidden');
    document.getElementById('studentId').classList.add('border-red-500');
    valid = false;
  }
  if (!course) {
    document.getElementById('courseError').classList.remove('hidden');
    document.getElementById('studentCourse').classList.add('border-red-500');
    valid = false;
  }
  return valid;
}

// ===========================
// SAVE
// ===========================
async function saveStudent() {
  const name   = document.getElementById('studentName').value.trim();
  const sid    = document.getElementById('studentId').value.trim();
  const course = document.getElementById('studentCourse').value;

  // ✅ Validation
  if (!validateFields(name, sid, course)) return;

  try {
    showLoader();

    const url    = editId ? `/api/students/${editId}` : '/api/students';
    const method = editId ? 'PUT' : 'POST';

    // ✅ FIX: backend maangta hai student_id aur course_id
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({ name, student_id: sid, course_id: course })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    closeModal();
    loadStudents();

  } catch (err) {
    alert("❌ " + err.message);
  } finally {
    hideLoader();
  }
}

// ===========================
// DELETE
// ===========================
async function removeStudent(id) {
  if (!confirm("Delete this student?")) return;
  try {
    showLoader();
    const res = await fetch(`/api/students/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    loadStudents();
  } catch (err) {
    alert("❌ " + err.message);
  } finally {
    hideLoader();
  }
}

// ===========================
// CLOSE MODAL
// ===========================
function closeModal() {
  document.getElementById('studentModal').classList.add('hidden');
  clearErrors();
}

// ===========================
// IMPORT EXCEL
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById("importFile").addEventListener("change", async function () {
    const file = this.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      showLoader();
      const res = await fetch("/api/students/import", {
        method: "POST",
        headers: { "Authorization": "Bearer " + localStorage.getItem("token") },
        body: formData
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      alert("✅ " + (result.message || "Import successful"));
      loadStudents();
    } catch (err) {
      alert("❌ Import failed: " + err.message);
    } finally {
      hideLoader();
      this.value = '';
    }
  });
});


// ===========================
// EXPORT EXCEL
// ===========================
async function exportStudents() {

  try {

    showLoader();

    const courseId =
      document.getElementById("exportCourse").value;

    let url = "/api/students/export";

    // specific course
    if (courseId) {
      url += `?course_id=${courseId}`;
    }

    const res = await fetch(url, {
      headers: {
        "Authorization":
          "Bearer " + localStorage.getItem("token")
      }
    });

    if (!res.ok)
      throw new Error("Export failed");

    const blob = await res.blob();

    const downloadUrl =
      window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = downloadUrl;

    // ✅ Get filename from backend response header
    const disposition = res.headers.get("Content-Disposition");

    let filename = "students.xlsx";

    if (disposition && disposition.includes("filename=")) {

  filename = disposition
    .split("filename=")[1]
    .replace(/"/g, "");

}

   link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(downloadUrl);

    closeExportModal();

  } catch (err) {

    alert("❌ " + err.message);

  } finally {

    hideLoader();

  }
}
// ===========================
// OPEN EXPORT MODAL
// ===========================
function openExportModal() {

  const select = document.getElementById("exportCourse");

  // reset
  select.innerHTML = `<option value="">All Courses</option>`;

  // load courses
  courses.forEach(c => {
    select.innerHTML += `
      <option value="${c.id}">
        ${c.name}
      </option>
    `;
  });

  document.getElementById("exportModal")
    .classList.remove("hidden");
}

// ===========================
// CLOSE EXPORT MODAL
// ===========================
function closeExportModal() {
  document.getElementById("exportModal")
    .classList.add("hidden");
}