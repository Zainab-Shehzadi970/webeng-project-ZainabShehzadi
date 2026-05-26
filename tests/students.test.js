const request = require('supertest');
const app = require('../backend/server');

let token = '';

beforeAll(async () => {

  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'zainabshehzadi970@gmail.com',
      password: '123456'
    });

  token = res.body?.data?.token || res.body?.token || '';

});

describe('Students API', () => {

  test('GET /api/students — should return students list with valid token', async () => {

    const res = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

  });

  test('POST /api/students — missing fields should return 400', async () => {

    const res = await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Student'
      });

    expect(res.status).toBe(400);

  });

  test('GET /api/students — no token should return 401', async () => {

    const res = await request(app)
      .get('/api/students');

    expect(res.status).toBe(401);

  });

  test('GET /api/students/:id — invalid id should return 404', async () => {

    const res = await request(app)
      .get('/api/students/999999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);

  });

});

describe('Courses API', () => {

  test('GET /api/courses — should return courses list with valid token', async () => {

    const res = await request(app)
      .get('/api/courses')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

  });

  test('POST /api/courses — missing fields should return 400', async () => {

    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Incomplete Course'
      });

    expect(res.status).toBe(400);

  });

});