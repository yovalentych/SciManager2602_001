const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      'conference',
      'publication',
      'grant',
      'contest',
      'lecture',
      'award',
      'mentorship',
    ],
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    city: { type: String, trim: true },
    country: { type: String, trim: true },
    institution: { type: String, trim: true },
  },
  placeTaken: {
    type: String,
    trim: true,
  }, // Для конкурсів або нагород
  certificates: [
    {
      type: String,
      trim: true,
    },
  ], // Посилання на PDF, JPG, PNG тощо
  eventPhotos: [
    {
      type: String,
      trim: true,
    },
  ], // Фото події
  relatedPersons: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ], // Співавтори, організатори тощо
  links: [
    {
      type: String,
      trim: true,
    },
  ], // Посилання на сторінку події
  publicationPlace: {
    type: String,
    trim: true,
  }, // Для наукових публікацій
  grantDetails: {
    organization: { type: String, trim: true }, // Організація, яка видала грант
    amount: { type: Number, min: 0 }, // Сума гранту
    duration: { type: String, trim: true }, // Тривалість фінансування
  },
  mentorshipDetails: {
    mentees: [{ type: String, trim: true }], // Імена студентів/аспірантів
    institution: { type: String, trim: true },
    duration: { type: String, trim: true },
  },
  notes: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Achievement', achievementSchema);
