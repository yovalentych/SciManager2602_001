document
  .getElementById('registerForm')
  .addEventListener('submit', async (event) => {
    event.preventDefault();

    const userData = {
      username: document.getElementById('regUsername').value,
      email: document.getElementById('regEmail').value,
      password: document.getElementById('regPassword').value,
      firstNameUa: document.getElementById('regFirstNameUa').value,
      lastNameUa: document.getElementById('regLastNameUa').value,
      firstNameEn: document.getElementById('regFirstNameEn').value,
      lastNameEn: document.getElementById('regLastNameEn').value,
    };

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (response.ok) {
      window.location.href = '/register-success.html';
    } else {
      alert(data.message);
    }
  });

document
  .getElementById('loginForm')
  .addEventListener('submit', async (event) => {
    event.preventDefault();

    const loginData = {
      emailOrUsername: document.getElementById('loginEmailOrUsername').value,
      password: document.getElementById('loginPassword').value,
    };

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      window.location.href = '/dashboard.html';
    } else {
      alert(data.message);
    }
  });
