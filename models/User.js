const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstNameUa: { type: String, required: true },
    lastNameUa: { type: String, required: true },
    firstNameEn: { type: String, required: true },
    lastNameEn: { type: String, required: true },
    bio: { type: String },
    affiliation: { type: String },
    position: { type: String },
    researchInterests: { type: [String] },
    website: { type: String },
    socialLinks: {
      googleScholar: { type: String },
      orcid: { type: String },
      linkedin: { type: String },
    },
    avatar: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
