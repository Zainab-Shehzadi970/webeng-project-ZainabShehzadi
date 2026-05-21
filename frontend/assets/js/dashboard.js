let chartInstance = null;


// 🚀 INIT
document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
});


// 🔥 Load Dashboard
async function loadDashboard() {

  try {

    showLoader();

    const token = localStorage.getItem("token");

    const res = await fetch('/api/dashboard', {

      method: 'GET',

      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      }

    });

    // ❌ API failed
    if (!res.ok) {
      throw new Error("API Failed");
    }

    const result = await res.json();

    console.log("Dashboard Response:", result);

    const data = result.data || {};


    // ✅ Cards
    document.getElementById('totalStudents').innerText =
      data.totalStudents || 0;

    document.getElementById('totalCourses').innerText =
      data.totalCourses || 0;

    document.getElementById('avgAttendance').innerText =
      (data.avgAttendance || 0) + "%";


   // ✅ RECENT ACTIVITY
const activityContainer =
  document.getElementById('recentActivities');

activityContainer.innerHTML = '';

if (data.recentActivity?.length) {

  data.recentActivity.forEach(item => {

    let message = '';
    let icon = '📌';
    let bg = 'bg-red-100';

    // 📌 Attendance
    if (item.type === 'attendance') {

      message = `
        Attendance marked for 
        ${item.course_name}
      `;

      icon = '📌';
      bg = 'bg-red-100';
    }

    // 🎓 Student
    else if (item.type === 'student') {

      message = `
        Added new student 
        ${item.name}
      `;

      icon = '🎓';
      bg = 'bg-yellow-100';
    }

    // 📚 Course
    else if (item.type === 'course') {

      message = `
        Added new course 
        ${item.name}
      `;

      icon = '📚';
      bg = 'bg-green-100';
    }

    activityContainer.innerHTML += `

      <div class="flex items-start gap-3 p-3 border-b">

        <div class="w-10 h-10 rounded-full ${bg}
        flex items-center justify-center text-lg">

          ${icon}

        </div>

        <div>

          <p class="text-sm font-medium text-gray-700">
            ${message}
          </p>

          <p class="text-xs text-gray-400 mt-1">
            ${new Date(item.date).toLocaleDateString()}
          </p>

        </div>

      </div>
    `;
  });

} else {

  activityContainer.innerHTML = `
    <p class="text-gray-400 text-sm">
      No activity yet
    </p>
  `;
}

    // ✅ COURSES
const courseContainer = document.getElementById('coursesList');

courseContainer.innerHTML = '';

if (data.courses?.length) {

  data.courses.forEach(course => {

    courseContainer.innerHTML += `

      <div class="bg-gray-50 rounded-2xl p-5 hover:shadow-lg transition border">

        <div class="flex items-center justify-between mb-4">

          <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <i class="fa-solid fa-book text-green-600"></i>
          </div>

          <span class="text-xs font-semibold text-gray-400 uppercase">
            COURSE CODE:
            ${course.code || course.course_code || 'N/A'}
          </span>

        </div>

        <h4 class="text-lg font-bold text-gray-800">
          ${course.name}
        </h4>

      </div>

    `;

  });

} else {

  courseContainer.innerHTML = `
    <p class="text-gray-400 text-sm">
      No courses found
    </p>
  `;
}

    // ✅ Chart
    renderChart(data.trend || []);

  } catch (err) {

    console.error("Dashboard Error:", err);

    alert("❌ Failed to load dashboard");

  } finally {

    hideLoader();

  }

}



// 🔥 Render Chart
function renderChart(trendData) {

  const ctx =
    document.getElementById('attendanceChart');

  if (!ctx) return;

  // destroy old chart
  if (chartInstance) {
    chartInstance.destroy();
  }

  // fallback
  if (!trendData || trendData.length === 0) {

    trendData = [
      { day: 'Mon', percentage: 0 },
      { day: 'Tue', percentage: 0 },
      { day: 'Wed', percentage: 0 },
      { day: 'Thu', percentage: 0 },
      { day: 'Fri', percentage: 0 }
    ];

  }

  chartInstance = new Chart(ctx, {

    type: 'line',

    data: {

      labels: trendData.map(item => {

        if (item.day.includes('-')) {

          return new Date(item.day)
            .toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short'
            });

        }

        return item.day;

      }),

      datasets: [{

        label: 'Attendance %',

        data: trendData.map(
          item => item.percentage
        ),

        borderWidth: 3,

        tension: 0.4,

        fill: true

      }]

    },

    options: {

      responsive: true,

      plugins: {

        legend: {
          display: true
        }

      },

      scales: {

        y: {

          beginAtZero: true,

          max: 100,

          ticks: {
            stepSize: 20
          }

        }

      }

    }

  });

}