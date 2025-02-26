const express = require('express');
const router = express.Router();
const Achievement = require('../models/Achievement');
const { checkAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// 📌 Завантаження сертифікатів або фото події
router.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  try {
    res.json({ imageUrl: `/uploads/${req.file.filename}` });
  } catch (error) {
    res.status(500).json({ message: 'Помилка завантаження файлу', error });
  }
});

// 📌 Додати нове досягнення
router.post('/', checkAuth, async (req, res) => {
  try {
    const { certificates, eventPhotos, ...data } = req.body;

    const newAchievement = new Achievement({
      userId: req.user.id,
      ...data,
      certificates: certificates ? certificates.split(',') : [],
      eventPhotos: eventPhotos ? eventPhotos.split(',') : [],
    });

    await newAchievement.save();
    res.status(201).json(newAchievement);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Помилка при додаванні досягнення', error });
  }
});

// 📌 Отримати всі досягнення користувача
router.get('/', checkAuth, async (req, res) => {
  try {
    const achievements = await Achievement.find({ userId: req.user.id }).sort({
      date: -1,
    });
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ message: 'Помилка при отриманні досягнень', error });
  }
});

// 📌 Оновити досягнення
router.put('/:id', checkAuth, async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement || achievement.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Немає прав для редагування' });
    }

    const { certificates, eventPhotos, ...data } = req.body;
    achievement.certificates = certificates
      ? certificates.split(',')
      : achievement.certificates;
    achievement.eventPhotos = eventPhotos
      ? eventPhotos.split(',')
      : achievement.eventPhotos;

    Object.assign(achievement, data);
    await achievement.save();

    res.json(achievement);
  } catch (error) {
    res.status(500).json({ message: 'Помилка при оновленні', error });
  }
});

// 📌 Видалити досягнення
router.delete('/:id', checkAuth, async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement || achievement.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Немає прав для видалення' });
    }
    await achievement.remove();
    res.json({ message: 'Досягнення видалено' });
  } catch (error) {
    res.status(500).json({ message: 'Помилка при видаленні', error });
  }
});

module.exports = router;
