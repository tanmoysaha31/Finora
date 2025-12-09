import express from 'express'
import User from '../models/User.js'
import Transaction from '../models/Transaction.js'
import Income from '../models/Income.js'

const router = express.Router()

async function ensureUser(userId) {
  if (userId) return await User.findById(userId)
  const u = await User.findOne().sort({ createdAt: -1 })
  return u
}

function labelForSource(src) {
  const s = String(src || 'Other').toLowerCase()
  if (s === 'salary') return 'Salary'
  if (s === 'business') return 'Business'
  if (s === 'freelance') return 'Freelance'
  if (s === 'investment') return 'Investment'
  if (s === 'gift') return 'Gift'
  return 'Other'
}

router.post('/add', async (req, res, next) => {
  try {
    const { userId, amount, source, date, note, paymentMethod, isRecurring } = req.body || {}
    const amt = Number(amount)
    if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ error: 'amount must be > 0' })
    const user = await ensureUser(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    const category = labelForSource(source)
    const title = note && String(note).trim().length > 0 ? String(note) : `${category} Income`
    const inc = await Income.create({
      userId: user._id,
      amount: Math.abs(amt),
      source: String(source || 'Other'),
      date: date ? new Date(date) : new Date(),
      note,
      isRecurring: !!isRecurring,
      paymentMethod
    })
    const tx = await Transaction.create({
      userId: user._id,
      incomeId: inc._id,
      title,
      category,
      amount: Math.abs(amt),
      date: date ? new Date(date) : new Date(),
      paymentMethod,
      note: isRecurring ? 'Recurring income' : note
    })
    res.status(201).json({ success: true, incomeId: inc._id.toString(), transactionId: tx._id.toString() })
  } catch (err) {
    next(err)
  }
})

router.get('/summary', async (req, res, next) => {
  try {
    const { userId } = req.query
    const user = await ensureUser(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const [currentMonthIncomes, lastMonthIncomes, recent] = await Promise.all([
      Income.find({ userId: user._id, date: { $gte: startOfMonth } }),
      Income.find({ userId: user._id, date: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Income.find({ userId: user._id }).sort({ date: -1 }).limit(10)
    ])

    const monthlyTotal = currentMonthIncomes.reduce((acc, t) => acc + Number(t.amount), 0)
    const lastMonthTotal = lastMonthIncomes.reduce((acc, t) => acc + Number(t.amount), 0)
    const sources = {}
    currentMonthIncomes.forEach(t => {
      const key = t.source || 'Other'
      sources[key] = (sources[key] || 0) + Number(t.amount)
    })

    res.json({
      monthlyTotal,
      lastMonthTotal,
      sources,
      recent: recent.map(r => ({ id: r._id.toString(), title: r.note && r.note.length ? r.note : `${String(r.source).charAt(0).toUpperCase()}${String(r.source).slice(1)} Income`, amount: Number(r.amount), date: r.date.toISOString().slice(0,10), type: r.source }))
    })
  } catch (err) {
    next(err)
  }
})

export default router
