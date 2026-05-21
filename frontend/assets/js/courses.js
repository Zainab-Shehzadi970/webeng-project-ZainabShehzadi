let courses = [];
let editId = null;

async function loadCourses() {
  try {
    showLoader();
    const res = await fetch('/api/courses', {
      headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
    });
    const result = await res.json();
    courses = result.data || [];
    renderCourses(courses);
  } catch (err) {
    console.error("Load courses error:", err);
  } finally {
    hideLoader();
  }
}

function renderCourses(data) {
  const container = document.getElementById('coursesContainer');
  container.innerHTML = '';

  if (!data.length) {
    container.innerHTML = `
      <div class="col-span-3 text-center py-16 text-gray-400">
        <i class="fa-solid fa-book-open text-4xl mb-3"></i>
        <p class="text-lg font-medium">No courses yet</p>
        <p class="text-sm">Click "+ Add New Course" to get started</p>
      </div>`;
    return;
  }

  const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  data.forEach((course, index) => {
    const color = colors[index % colors.length];
    const studentCount = course.total_students || course.students || 0;
    const courseCode = course.course_code || course.code || 'N/A';

    container.innerHTML += `
      <div class="bg-white rounded-2xl shadow hover:shadow-xl transition-all duration-300 relative overflow-visible">

  <div style="height:6px; background:${color};"></div>

  <div class="p-6">

    <span class="text-xs font-semibold px-3 py-1 rounded-full"
      style="background:${color}20; color:${color};">
      ACTIVE
    </span>

    <h3 class="text-xl font-bold mt-4 mb-1 text-slate-800">
      ${course.name}
    </h3>

    <p class="text-gray-400 text-sm mb-3">
      Course Code: ${courseCode}
    </p>

    <div class="relative">

      <button onclick="toggleMenu(event, ${course.id})"
        class="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 px-5 rounded-xl transition text-sm w-full">
        Manage Course
      </button>

      <div id="menu-${course.id}"
        class="hidden absolute right-0 top-14 bg-white border border-gray-100 rounded-xl shadow-2xl z-[9999] min-w-[180px]">

        <div onclick="editCourse(${course.id})"
          class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer text-slate-700 text-sm font-medium">
          <i class="fa-solid fa-pen text-blue-500"></i>
          Edit Course
        </div>

        <div onclick="deleteCourse(${course.id})"
          class="flex items-center gap-3 px-4 py-3 hover:bg-red-50 cursor-pointer text-red-500 text-sm font-medium border-t">
          <i class="fa-solid fa-trash"></i>
          Delete Course
        </div>

      </div>

    </div>

  </div>

</div>

    `;
  });
}

document.addEventListener("input", (e) => {
  if (e.target.id === "searchInput") {
    const value = e.target.value.toLowerCase();
    const filtered = courses.filter(c =>
      c.name.toLowerCase().includes(value) ||
      (c.course_code || c.code || '').toLowerCase().includes(value)
    );
    renderCourses(filtered);
  }
});

function toggleMenu(event, id) {
  event.stopPropagation();
  document.querySelectorAll('[id^="menu-"]').forEach(m => m.classList.add('hidden'));
  document.getElementById(`menu-${id}`).classList.toggle('hidden');
}
document.addEventListener("click", () => {
  document.querySelectorAll('[id^="menu-"]').forEach(m => m.classList.add('hidden'));
});

function openAddModal() {
  editId = null;
  document.getElementById('modalTitle').innerText = "Add New Course";
  document.getElementById('courseName').value = '';
  document.getElementById('courseCode').value = '';
  document.getElementById('courseModal').classList.remove('hidden');
}

function editCourse(id) {
  const course = courses.find(c => c.id === id);
  if (!course) return;
  editId = id;
  document.getElementById('modalTitle').innerText = "Edit Course";
  document.getElementById('courseName').value = course.name;
  document.getElementById('courseCode').value = course.course_code || course.code || '';
  document.getElementById('courseModal').classList.remove('hidden');
  document.querySelectorAll('[id^="menu-"]').forEach(m => m.classList.add('hidden'));
}

async function saveCourse() {
  const name = document.getElementById('courseName').value.trim();
  const code = document.getElementById('courseCode').value.trim();
  if (!name || !code) return alert("⚠️ All fields are required");

  try {
    showLoader();
    const url = editId ? `/api/courses/${editId}` : '/api/courses';
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify({ name, course_code: code })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    closeModal();
    loadCourses();
  } catch (err) {
    alert("❌ " + err.message);
  } finally {
    hideLoader();
  }
}

async function deleteCourse(id) {
  if (!confirm("Delete this course?")) return;
  try {
    showLoader();
    await fetch(`/api/courses/${id}`, {
      method: 'DELETE',
      headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
    });
    loadCourses();
  } catch (err) {
    alert("❌ Failed to delete");
  } finally {
    hideLoader();
  }
}

function closeModal() {
  document.getElementById('courseModal').classList.add('hidden');
}

window.onload = loadCourses;