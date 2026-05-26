const request = require('supertest');
const app = require('../backend/server');

describe('Auth Tests', () => {

  test('Register with missing fields should fail', async () => {

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@test.com'
      });

    expect(res.status).toBe(400);

  });

  test('Login with wrong password should fail', async () => {

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'zainabshehzadi970@gmail.com',
        password: 'wrongpassword123'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);

  });

  test('Login with correct credentials should return token', async () => {

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'zainabshehzadi970@gmail.com',
        password: '123456'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

  });

  test('Get courses without token should return 401', async () => {

    const res = await request(app)
      .get('/api/courses');

    expect(res.status).toBe(401);

  });

});