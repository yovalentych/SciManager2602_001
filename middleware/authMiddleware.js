const jwt = require('jsonwebtoken');

const checkAuth = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Немає токена, доступ заборонено' });
  }

  try {
    const decoded = jwt.verify(
      token.replace('Bearer ', ''),
      process.env.JWT_SECRET
    );
    req.user = decoded; // Додаємо userId, username, role до req
    next();
  } catch (error) {
    res.status(401).json({ message: 'Недійсний токен' });
  }
};

// Експортуємо `checkAuth` правильно
module.exports = { checkAuth };
