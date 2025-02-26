document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/';
    return;
  }

  // Отримання профілю користувача
  const response = await fetch('/api/auth/profile', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();

  if (response.ok) {
    document.getElementById('username').textContent = data.username;
    document.getElementById('bioDisplay').textContent =
      data.bio || 'Не вказано';
    document.getElementById('affiliationDisplay').textContent =
      data.affiliation || 'Не вказано';
    document.getElementById('positionDisplay').textContent =
      data.position || 'Не вказано';
    document.getElementById('researchInterestsDisplay').textContent =
      data.researchInterests?.join(', ') || 'Не вказано';
    document.getElementById('websiteDisplay').textContent =
      data.website || 'Не вказано';
    document.getElementById('websiteDisplay').href = data.website
      ? data.website
      : '#';
  } else {
    alert('Не вдалося отримати дані профілю. Будь ласка, увійдіть знову.');
    localStorage.removeItem('token');
    window.location.href = '/';
  }
});

// MODAL for editing user data
let currentField = '';

function editField(field) {
  currentField = field + 'Display'; // Оновлюємо ID для роботи з текстом
  const value = document.getElementById(currentField).textContent;
  document.getElementById('editInput').value =
    value === 'Не вказано' ? '' : value;
  document.getElementById('editModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('editModal').style.display = 'none';
}

async function saveChanges() {
  const token = localStorage.getItem('token');
  const newValue = document.getElementById('editInput').value;

  const fieldToUpdate = currentField.replace('Display', ''); // Прибираємо "Display"

  const updatedData = {};
  updatedData[fieldToUpdate] = newValue;

  const response = await fetch('/api/auth/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatedData),
  });

  const data = await response.json();

  if (response.ok) {
    alert('Профіль оновлено!');
    document.getElementById(currentField).textContent =
      newValue || 'Не вказано';
    closeModal();
  } else {
    alert(data.message);
  }
}

// Логаут
document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = '/';
});
