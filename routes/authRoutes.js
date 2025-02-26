const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const moment = require('moment');

const router = express.Router();

// Налаштування multer для завантаження аватарок
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

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

    // Перевірка, чи користувач існує
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
      lastNameChangeDate: new Date(),
    });

    await newUser.save();
    res.status(201).json({ message: 'Користувач зареєстрований успішно' });
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});

// Логін користувача
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Пошук користувача
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      return res.status(400).json({ message: 'Користувача не знайдено' });
    }

    // Перевірка пароля
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Невірний пароль' });
    }

    // Генерація JWT
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, message: 'Вхід успішний' });
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});

// Отримання профілю
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});

// Оновлення профілю
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const {
      firstNameUa,
      lastNameUa,
      firstNameEn,
      lastNameEn,
      affiliation,
      position,
      website,
      socialLinks,
      password,
    } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    let updateFields = { affiliation, position, website, socialLinks };

    // Перевірка зміни імені раз на місяць
    if (firstNameUa || lastNameUa || firstNameEn || lastNameEn) {
      const lastUpdated = moment(user.lastNameChangeDate);
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
      updateFields.lastNameChangeDate = new Date();
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

// Завантаження аватарки
router.post(
  '/upload-avatar',
  authMiddleware,
  upload.single('avatar'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Файл не завантажено' });
      }

      const avatarUrl = `/uploads/${req.file.filename}`;
      await User.findByIdAndUpdate(req.user.userId, { avatar: avatarUrl });

      res.json({ avatarUrl, message: 'Аватар оновлено' });
    } catch (error) {
      res
        .status(500)
        .json({
          message: 'Помилка завантаження аватарки',
          error: error.message,
        });
    }
  }
);

module.exports = router;
