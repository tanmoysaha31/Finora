const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  ID: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isClient: { type: Boolean, default: false },
  isStaff: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);
