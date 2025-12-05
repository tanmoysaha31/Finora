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
    return res.status(201).json({ id: user._id, fullname, email })
  } catch (err) {
    next(err)
  }
})

export default router
