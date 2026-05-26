/**
 * students.test.js
 * Unit tests for Students & Courses API
 */

const request = require('supertest');
const BASE_URL = 'http://localhost:5000';

let token = '';

beforeAll(async () => {
  const res = await request(BASE_URL)
    .post('/api/auth/login')
    .send({
      email: 'zainabshehzadi970@gmail.com',
      password: '123456'
    });
  token = res.body?.data?.token || res.body?.token || '';
});

describe('Students API', () => {

  test('GET /api/students — should return students list with valid token', async () => {
    const res = await request(BASE_URL)
      .get('/api/students')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('POST /api/students — missing fields should return 400', async () => {
    const res = await request(BASE_URL)
      .post('/api/students')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Student' }); // missing student_id and course_id
    expect(res.status).toBe(400);
    // just check status is 400, backend may not return success:false
  });

  test('GET /api/students — no token should return 401', async () => {
    const res = await request(BASE_URL)
      .get('/api/students');
    expect(res.status).toBe(401);
  });

  test('GET /api/students/:id — invalid id should return 404', async () => {
    const res = await request(BASE_URL)
      .get('/api/students/999999')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

});

describe('Courses API', () => {

  test('GET /api/courses — should return courses list with valid token', async () => {
    const res = await request(BASE_URL)
      .get('/api/courses')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('POST /api/courses — missing fields should return 400', async () => {
    const res = await request(BASE_URL)
      .post('/api/courses')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Incomplete Course' }); // missing course_code
    expect(res.status).toBe(400);
  });

});