document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/';
    return;
  }

  const response = await fetch('/api/auth/profile', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (response.ok) {
    document.getElementById('username').textContent = data.username;
  } else {
    alert('Не вдалося отримати дані профілю. Будь ласка, увійдіть знову.');
    localStorage.removeItem('token');
    window.location.href = '/';
  }
});

// Логаут
document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = '/';
});
