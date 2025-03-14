document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const firstNameUa = document.getElementById('regFirstNameUa');
  const lastNameUa = document.getElementById('regLastNameUa');
  const firstNameEn = document.getElementById('regFirstNameEn');
  const lastNameEn = document.getElementById('regLastNameEn');

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
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
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const userData = {
        username: document.getElementById('regUsername').value,
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value,
        firstNameUa: firstNameUa.value,
        lastNameUa: lastNameUa.value,
        firstNameEn: firstNameEn.value,
        lastNameEn: lastNameEn.value,
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = '/login.html';
      } else {
        alert(data.message);
      }
    });
  }

  // Функція транслітерації з української в латиницю
  const transliterate = (text) => {
    const map = {
      А: 'A',
      Б: 'B',
      В: 'V',
      Г: 'H',
      Ґ: 'G',
      Д: 'D',
      Е: 'E',
      Є: 'Ye',
      Ж: 'Zh',
      З: 'Z',
      И: 'Y',
      І: 'I',
      Ї: 'Yi',
      Й: 'Y',
      К: 'K',
      Л: 'L',
      М: 'M',
      Н: 'N',
      О: 'O',
      П: 'P',
      Р: 'R',
      С: 'S',
      Т: 'T',
      У: 'U',
      Ф: 'F',
      Х: 'Kh',
      Ц: 'Ts',
      Ч: 'Ch',
      Ш: 'Sh',
      Щ: 'Shch',
      Ю: 'Yu',
      Я: 'Ya',
      а: 'a',
      б: 'b',
      в: 'v',
      г: 'h',
      ґ: 'g',
      д: 'd',
      е: 'e',
      є: 'ie',
      ж: 'zh',
      з: 'z',
      и: 'y',
      і: 'i',
      ї: 'yi',
      й: 'y',
      к: 'k',
      л: 'l',
      м: 'm',
      н: 'n',
      о: 'o',
      п: 'p',
      р: 'r',
      с: 's',
      т: 't',
      у: 'u',
      ф: 'f',
      х: 'kh',
      ц: 'ts',
      ч: 'ch',
      ш: 'sh',
      щ: 'shch',
      ю: 'yu',
      я: 'ya',
      "'": '',
    };

    return text
      .split('')
      .map((char) => map[char] || char)
      .join('');
  };

  // Транслітерація ІМЕНІ (перевіряємо, чи існує поле)
  if (firstNameUa && firstNameEn) {
    firstNameUa.addEventListener('input', (event) => {
      firstNameEn.value = transliterate(event.target.value);
    });
  }

  // Транслітерація ПРІЗВИЩА (перевіряємо, чи існує поле)
  if (lastNameUa && lastNameEn) {
    lastNameUa.addEventListener('input', (event) => {
      lastNameEn.value = transliterate(event.target.value);
    });
  }
});
