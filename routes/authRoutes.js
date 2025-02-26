const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const moment = require('moment'); // Додаємо для перевірки дати

const router = express.Router();

// Реєстрація користувача
router.post('/register', async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      firstNameUa,
      lastNameUa,
      firstNameEn,
      lastNameEn,
    } = req.body;

    // Перевірка, чи користувач вже існує
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'Користувач з таким email або username вже існує' });
    }

    // Хешування пароля
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Створення нового користувача
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      firstNameUa,
      lastNameUa,
      firstNameEn,
      lastNameEn,
    });

    await newUser.save();

    res.status(201).json({ message: 'Користувач зареєстрований успішно' });
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Шукаємо користувача за email або username
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      return res.status(400).json({ message: 'Користувача не знайдено' });
    }

    // Перевіряємо пароль
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Невірний пароль' });
    }

    // Генеруємо JWT-токен
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, message: 'Вхід успішний' });
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});

// Отримати дані профілю (захищений маршрут)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password'); // Вимикаємо пароль
    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});

// Оновлення профілю (захищений маршрут)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const {
      firstNameUa,
      lastNameUa,
      firstNameEn,
      lastNameEn,
      password,
      ...updateFields
    } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    // Перевірка зміни імені (раз на місяць)
    if (firstNameUa || lastNameUa || firstNameEn || lastNameEn) {
      const lastUpdated = moment(user.updatedAt);
      const oneMonthAgo = moment().subtract(1, 'months');

      if (lastUpdated.isAfter(oneMonthAgo)) {
        return res.status(400).json({
          message: "Ім'я та прізвище можна змінювати лише раз на місяць",
        });
      }

      updateFields.firstNameUa = firstNameUa || user.firstNameUa;
      updateFields.lastNameUa = lastNameUa || user.lastNameUa;
      updateFields.firstNameEn = firstNameEn || user.firstNameEn;
      updateFields.lastNameEn = lastNameEn || user.lastNameEn;
    }

    // Якщо користувач хоче змінити пароль
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }

    // Оновлення користувача
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      updateFields,
      { new: true }
    ).select('-password');

    res.json({ message: 'Профіль оновлено', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});

module.exports = router;
