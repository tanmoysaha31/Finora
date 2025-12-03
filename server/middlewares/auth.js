import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No token provided' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret')
    req.user = await User.findById(decoded.id)
    if (!req.user) return res.status(401).json({ error: 'User not found' })
    next()
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const roleMap = {
    admin: req.user.isAdmin,
    client: req.user.isClient,
    staff: req.user.isStaff
  };
  const allowed = roles.some(role => roleMap[role]);
  if (!allowed) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}
