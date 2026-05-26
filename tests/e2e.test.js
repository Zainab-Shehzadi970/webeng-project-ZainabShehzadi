/**
 * e2e.test.js
 * End-to-End test — Full teacher workflow
 *
 * Flow:
 * 1. Login → get token
 * 2. Create a course
 * 3. Add a student to that course
 * 4. Fetch students → verify student exists
 * 5. Delete the student (cleanup)
 * 6. Delete the course (cleanup)
 */

const request = require('supertest');

const BASE_URL = 'http://localhost:5000';

describe('E2E — Teacher Full Workflow', () => {

  let token       = '';
  let courseId    = null;
  let studentDbId = null;

  const testCourseCode = `E2E-${Date.now()}`;   // unique each run
  const testStudentId  = `STU-E2E-${Date.now()}`;

  // ── Step 1: Login ──────────────────────────────
  test('Step 1 — Login should return JWT token', async () => {
    const res = await request(BASE_URL)
      .post('/api/auth/login')
      .send({
        email: 'zainabshehzadi970@gmail.com',
        password: '123456'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    token = res.body?.data?.token || res.body?.token || '';
    expect(token).not.toBe('');
  });

  // ── Step 2: Create Course ──────────────────────
  test('Step 2 — Create a new course', async () => {
    const res = await request(BASE_URL)
      .post('/api/courses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'E2E Test Course',
        course_code: testCourseCode
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  // ── Step 3: Get Course ID ──────────────────────
  test('Step 3 — Fetch courses and find the new course', async () => {
    const res = await request(BASE_URL)
      .get('/api/courses')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const course = res.body.data.find(c => c.course_code === testCourseCode);
    expect(course).toBeDefined();
    courseId = course.id;
  });

  // ── Step 4: Add Student ────────────────────────
  test('Step 4 — Add a student to the course', async () => {
    const res = await request(BASE_URL)
      .post('/api/students')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'E2E Student',
        student_id: testStudentId,
        course_id: courseId
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  // ── Step 5: Verify Student Exists ─────────────
  test('Step 5 — Fetch students and verify student is present', async () => {
    const res = await request(BASE_URL)
      .get('/api/students')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const student = res.body.data.find(s => s.student_id === testStudentId);
    expect(student).toBeDefined();
    expect(student.name).toBe('E2E Student');
    studentDbId = student.id;
  });

  // ── Step 6: Cleanup — Delete Student ──────────
  test('Step 6 — Delete the test student (cleanup)', async () => {
    const res = await request(BASE_URL)
      .delete(`/api/students/${studentDbId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // ── Step 7: Cleanup — Delete Course ───────────
  test('Step 7 — Delete the test course (cleanup)', async () => {
    const res = await request(BASE_URL)
      .delete(`/api/courses/${courseId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

});