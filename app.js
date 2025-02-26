require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Підключення до бази даних
connectDB();

// Middleware
app.use(express.json()); // Дозволяє обробляти JSON-запити
app.use(cors()); // Дозволяє запити з іншого домену (для фронтенду)
app.use(express.static(path.join(__dirname, 'public')));

// Головний маршрут: віддає `index.html`
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Підключення маршрутів
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const achievementRoutes = require('./routes/achievRoutes'); // Оновлено після перейменування
app.use('/api/achievements', achievementRoutes);

// Статичні файли (завантаження фото)
app.use('/uploads', express.static('public/uploads'));

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущено на порту ${PORT}`);
});
