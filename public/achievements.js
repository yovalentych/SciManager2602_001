document.addEventListener('DOMContentLoaded', function () {
  const achievementsList = document.getElementById('achievementsList');
  const addAchievementBtn = document.getElementById('addAchievement');
  const modal = document.getElementById('modal');
  const closeModalBtn = document.getElementById('closeModal');
  const form = document.getElementById('achievementForm');

  let editMode = false;
  let editId = null;

  // Відкриття/закриття модального вікна
  addAchievementBtn.addEventListener('click', () => {
    form.reset();
    editMode = false;
    editId = null;
    modal.style.display = 'block';
  });

  closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Завантаження досягнень
  async function loadAchievements() {
    const res = await fetch('/api/achievements', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
    });
    const achievements = await res.json();
    achievementsList.innerHTML = '';

    achievements.forEach((ach) => {
      const div = document.createElement('div');
      div.classList.add('timeline-item');
      div.innerHTML = `
              <h3>${ach.title} (${ach.type})</h3>
              <p><strong>Дата:</strong> ${new Date(
                ach.date
              ).toLocaleDateString()}</p>
              <p><strong>Місто:</strong> ${ach.location?.city || ''}, ${
        ach.location?.country || ''
      }</p>
              <p><strong>Нотатки:</strong> ${ach.notes || '—'}</p>
              ${
                ach.certificates.length > 0
                  ? `<p><strong>Сертифікати:</strong> ${ach.certificates
                      .map((img) => `<a href="${img}" target="_blank">📄</a>`)
                      .join(' ')}</p>`
                  : ''
              }
              <button onclick="editAchievement('${
                ach._id
              }')">✏️ Редагувати</button>
              <button onclick="deleteAchievement('${
                ach._id
              }')">🗑 Видалити</button>
          `;
      achievementsList.appendChild(div);
    });
  }

  // Завантаження файлів
  async function uploadFile(file) {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('/api/achievements/upload', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
      body: formData,
    });

    const data = await res.json();
    return data.imageUrl;
  }

  // Додавання або редагування досягнення
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {
      type: formData.get('type'),
      title: formData.get('title'),
      date: formData.get('date'),
      location: {
        city: formData.get('city'),
        country: formData.get('country'),
        institution: formData.get('institution'),
      },
      notes: formData.get('notes'),
      certificates: [],
      eventPhotos: [],
    };

    // Завантаження фото сертифікатів
    const certFiles = formData.getAll('certificates');
    for (let file of certFiles) {
      if (file.size > 0) {
        const uploadedUrl = await uploadFile(file);
        data.certificates.push(uploadedUrl);
      }
    }

    // Завантаження фото подій
    const photoFiles = formData.getAll('eventPhotos');
    for (let file of photoFiles) {
      if (file.size > 0) {
        const uploadedUrl = await uploadFile(file);
        data.eventPhotos.push(uploadedUrl);
      }
    }

    const method = editMode ? 'PUT' : 'POST';
    const url = editMode ? `/api/achievements/${editId}` : '/api/achievements';

    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
      body: JSON.stringify(data),
    });

    modal.style.display = 'none';
    loadAchievements();
  });

  // Редагування досягнення
  window.editAchievement = async (id) => {
    const res = await fetch(`/api/achievements/${id}`, {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
    });

    const ach = await res.json();

    document.getElementById('type').value = ach.type;
    document.getElementById('title').value = ach.title;
    document.getElementById('date').value = ach.date.split('T')[0];
    document.getElementById('city').value = ach.location?.city || '';
    document.getElementById('country').value = ach.location?.country || '';
    document.getElementById('institution').value =
      ach.location?.institution || '';
    document.getElementById('links').value = ach.links?.join(', ') || '';
    document.getElementById('notes').value = ach.notes || '';

    editMode = true;
    editId = id;
    modal.style.display = 'block';
  };

  // Видалення досягнення
  window.deleteAchievement = async (id) => {
    if (!confirm('Ви впевнені, що хочете видалити це досягнення?')) return;

    await fetch(`/api/achievements/${id}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
    });

    loadAchievements();
  };

  loadAchievements();
});
