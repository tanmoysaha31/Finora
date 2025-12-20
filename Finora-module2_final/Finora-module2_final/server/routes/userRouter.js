const express = require('express');
const User = require('../models/User');
const router = express.Router();

const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, authorize('admin'), async (req, res) => {
  const users = await User.find();
  res.json(users);
});

router.get('/:id', auth, async (req, res) => {
  if (req.user.role === 'admin' || req.user.role === 'staff' || req.user._id.toString() === req.params.id) {
    const user = await User.findById(req.params.id);
    res.json(user);
  } else {
    res.status(403).json({ error: 'Forbidden' });
  }
});

module.exports = router;
