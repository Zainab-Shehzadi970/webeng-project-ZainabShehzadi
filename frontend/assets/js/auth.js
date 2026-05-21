// LOGIN
const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const res = await loginUser({ email, password });

     // TOKEN SAVE
     localStorage.setItem("token", res.token);

    // USER SAVE
     localStorage.setItem("user", JSON.stringify(res.user));

     alert(res.message);

     window.location.href = '/pages/dashboard.html';


    } catch (err) {}
  });
}


// REGISTER
const registerForm = document.getElementById('registerForm');

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const res = await registerUser({ name, email, password });

      alert(res.message);

      window.location.href = '/pages/login.html';


    } catch (err) {}
  });
}


// LOGOUT
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  window.location.href = '/pages/login.html';
};

