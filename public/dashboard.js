document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  });

  // Переконайся, що всі вкладки працюють
  loadPage('profile'); // Завантажуємо профіль за замовчуванням
});

// Функція для зміни вкладок у дашборді
function loadPage(page) {
  const content = document.getElementById('content');

  if (!content) {
    console.error('Елемент #content не знайдено!');
    return;
  }

  switch (page) {
    case 'profile':
      content.innerHTML = `<div id="profileContent"><p>Завантаження...</p></div>`;
      loadUserProfile();
      break;
    case 'settings':
      content.innerHTML = `<h2>⚙️ Налаштування</h2><p>Тут будуть налаштування вашого акаунту.</p>`;
      break;
    case 'publications':
      content.innerHTML = `<h2>📄 Ваші публікації</h2><p>Тут можна керувати вашими науковими статтями.</p>`;
      break;
    case 'messages':
      content.innerHTML = `<h2>💬 Повідомлення</h2><p>Ваші особисті повідомлення та чати.</p>`;
      break;
    default:
      content.innerHTML = `<h2>Ласкаво просимо до дашборду!</h2><p>Оберіть вкладку ліворуч, щоб розпочати роботу.</p>`;
  }
}

// Функція завантаження профілю
async function loadUserProfile() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/';
    return;
  }

  const response = await fetch('/api/auth/profile', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();

  if (response.ok) {
    document.getElementById('profileContent').innerHTML = `
          <div class="profile-card">
              <img src="${
                data.avatar && data.avatar !== ''
                  ? data.avatar
                  : '/uploads/default-avatar.png'
              }" alt="Аватар">
              <h3>${data.firstNameUa} ${data.lastNameUa}</h3>
              <p><strong>Афіліація:</strong> ${
                data.affiliation || 'Не вказано'
              }</p>
              <p><strong>Посада:</strong> ${data.position || 'Не вказано'}</p>
              <p><strong>Персональний сайт:</strong> <a href="${
                data.website || '#'
              }" target="_blank">${data.website || 'Не вказано'}</a></p>
              <button class="edit-profile-btn" onclick="openEditProfileModal()">Редагувати профіль</button>
          </div>
      `;
  } else {
    alert('Не вдалося отримати дані профілю.');
    localStorage.removeItem('token');
    window.location.href = '/';
  }
}

async function saveProfileChanges() {
  const token = localStorage.getItem('token');
  const avatarFile = document.getElementById('editAvatar').files[0];

  const updatedData = {
    affiliation: document.getElementById('editAffiliation').value,
    position: document.getElementById('editPosition').value,
    website: document.getElementById('editWebsite').value,
    socialLinks: {
      googleScholar: document.getElementById('editGoogleScholar').value,
      orcid: document.getElementById('editOrcid').value,
      linkedin: document.getElementById('editLinkedin').value,
    },
  };

  // Завантаження аватарки, якщо є новий файл
  if (avatarFile) {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    const avatarResponse = await fetch('/api/auth/upload-avatar', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const avatarData = await avatarResponse.json();
    if (avatarResponse.ok) {
      updatedData.avatar = avatarData.avatarUrl;
    }
  }

  // Оновлення профілю
  const response = await fetch('/api/auth/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatedData),
  });

  if (response.ok) {
    alert('Профіль оновлено!');
    closeModal();
    loadUserProfile();
  } else {
    alert('Помилка оновлення профілю.');
  }
}

// Функції модального вікна
function openEditProfileModal() {
  document.getElementById('editProfileModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('editProfileModal').style.display = 'none';
}

// Додаємо слухачі подій для вкладок після завантаження сторінки
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.sidebar ul li a').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const page = event.target.getAttribute('onclick').match(/'([^']+)'/)[1];
      loadPage(page);
    });
  });
});
