import express from 'express'
import User from '../models/User.js'
import Transaction from '../models/Transaction.js'

const router = express.Router()

router.post('/add', async (req, res, next) => {
  try {
    const { userId, title, amount, date, category, paymentMethod, note } = req.body || {}
    if (!title || title.trim().length === 0) return res.status(400).json({ error: 'Title is required' })
    const amt = Number(amount)
    if (!Number.isFinite(amt) || amt === 0) return res.status(400).json({ error: 'Amount must be non-zero' })
    let uid = userId
    if (!uid) {
      const u = await User.findOne().sort({ createdAt: -1 })
      if (!u) return res.status(400).json({ error: 'No user available' })
      uid = u._id
    }
    const tx = await Transaction.create({
      userId: uid,
      title,
      category: category || 'Others',
      amount: -Math.abs(amt),
      date: date ? new Date(date) : new Date(),
      paymentMethod,
      note
    })
    res.status(201).json({ success: true, id: tx._id })
  } catch (err) {
    next(err)
  }
})

export default router
