require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Підключення до бази даних
connectDB();

// Middleware
app.use(express.json()); // Дозволяє обробляти JSON-запити
app.use(cors()); // Дозволяє запити з іншого домену (для фронтенду)

// Головний маршрут для перевірки роботи сервера
app.get('/', (req, res) => {
  res.send('API працює!');
});

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущено на порту ${PORT}`);
});
