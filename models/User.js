const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Основна інформація
    firstNameUa: { type: String, required: true },
    lastNameUa: { type: String, required: true },
    firstNameEn: { type: String, required: true },
    lastNameEn: { type: String, required: true },

    // Обмеження на зміну імені
    lastNameChangeDate: { type: Date, default: null },

    // Додаткові дані
    avatar: { type: String, default: '' }, // URL аватарки
    affiliation: { type: String, default: '' }, // Університет/інститут
    position: { type: String, default: '' }, // Посада
    website: { type: String, default: '' }, // Персональний сайт

    // Соціальні мережі
    socialLinks: {
      googleScholar: { type: String, default: '' },
      orcid: { type: String, default: '' },
      linkedin: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
