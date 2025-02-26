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

// Головний маршрут для перевірки роботи сервера
app.get('/', (req, res) => {
  res.send('API працює!');
});

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Підтягування папки PUBLIC
app.use(express.static(path.join(__dirname, 'public')));

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущено на порту ${PORT}`);
});
