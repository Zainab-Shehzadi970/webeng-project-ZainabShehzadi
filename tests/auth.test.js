const BASE_URL = 'http://localhost:5000';

describe('Auth Tests', () => {

 test('Register with missing fields should fail', async () => {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@test.com' })
  });
  expect(res.status).toBe(400);
});

  test('Login with wrong password should fail', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'zainabshehzadi970@gmail.com',
        password: 'wrongpassword123'
      })
    });
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
  });

  test('Login with correct credentials should return token', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'zainabshehzadi970@gmail.com',
        password: '123456'
      })
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  test('Get courses without token should return 401', async () => {
    const res = await fetch(`${BASE_URL}/api/courses`);
    expect(res.status).toBe(401);
  });

});