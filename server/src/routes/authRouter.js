const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();


router.post('/register', async (req, res) => {
  try {
    const { name, email, password, isAdmin, isClient } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hash,
      isAdmin: !!isAdmin,
      isClient: !!isClient,
    });
    await user.save();
    const token = jwt.sign({ isAdmin: user.isAdmin, isClient: user.isClient }, process.env.JWT_SECRET || 'defaultsecret', { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email });
    let user = null;
    
    const allUsers = await User.find({});
    if (email) {
      user = await User.findOne({ email });
      console.log('User found by email:', user);
    }
    if (!user) {
      console.log('No user found for credentials');
      return res.status(400).json({ error: 'Invalid credentials: user not found' });
    }
    
    if (typeof user.password !== 'string' || !user.password.startsWith('$2')) {
      console.log('User password is not hashed:', user.password);
      return res.status(400).json({ error: 'Password not hashed in database' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log('Password mismatch for user:');
      return res.status(400).json({ error: 'Invalid credentials: password mismatch' });
    }
    
    const token = jwt.sign({ isAdmin: user.isAdmin, isClient: user.isClient }, process.env.JWT_SECRET || 'defaultsecret', { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});


router.get('/debug-users', async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

module.exports = router;
