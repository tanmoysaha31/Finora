import express from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'

const router = express.Router()

router.post('/signup', async (req, res, next) => {
  try {
    const { fullname, email, password } = req.body || {}
    if (!fullname || !email || !password) return res.status(400).json({ error: 'Missing fields' })
    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ error: 'Email exists' })
    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ fullname, email, password: hash })
    return res.status(201).json({ id: user._id, fullname, email, token: 'ok' })
  } catch (err) {
    next(err)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, username, password } = req.body || {}
    const identifier = (email || username || '').toLowerCase()
    if (!identifier || !password) return res.status(400).json({ message: 'Missing credentials' })
    const user = await User.findOne({ email: identifier })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' })
    return res.json({ id: user._id, fullname: user.fullname, email: user.email, token: 'ok' })
  } catch (err) {
    next(err)
  }
})

router.get('/profile', async (req, res, next) => {
  try {
    const { userId } = req.query
    if (!userId) return res.status(400).json({ error: 'User ID required' })
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ id: user._id, fullname: user.fullname, email: user.email })
  } catch (err) {
    next(err)
  }
})

router.put('/profile', async (req, res, next) => {
  try {
    const { userId, fullname, email } = req.body || {}
    if (!userId) return res.status(400).json({ error: 'User ID required' })
    
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    if (email && email !== user.email) {
      const existing = await User.findOne({ email })
      if (existing) return res.status(409).json({ error: 'Email already in use' })
      user.email = email
    }
    
    if (fullname) user.fullname = fullname
    
    await user.save()
    res.json({ success: true, user: { id: user._id, fullname: user.fullname, email: user.email } })
  } catch (err) {
    next(err)
  }
})

router.put('/password', async (req, res, next) => {
  try {
    const { userId, currentPassword, newPassword } = req.body || {}
    if (!userId || !currentPassword || !newPassword) return res.status(400).json({ error: 'Missing fields' })

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const ok = await bcrypt.compare(currentPassword, user.password)
    if (!ok) return res.status(401).json({ error: 'Current password incorrect' })

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()
    
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

router.delete('/delete', async (req, res, next) => {
  try {
    const { userId } = req.query
    if (!userId) return res.status(400).json({ error: 'User ID required' })
    
    await User.findByIdAndDelete(userId)
    // Ideally verify cascade delete or manually delete related data here if needed
    // For now assuming models might be loose or this is sufficient for the task
    
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

export default router
