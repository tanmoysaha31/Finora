import express from 'express'
import User from '../models/User.js'
import Debt from '../models/Debt.js'
import Transaction from '../models/Transaction.js'

const router = express.Router()

async function ensureUser(userId) {
  if (userId) return await User.findById(userId)
  const u = await User.findOne().sort({ createdAt: -1 })
  return u
}

function defaultsByType(type) {
  const t = String(type || '').toLowerCase()
  if (t.includes('credit')) return { color: 'pink', icon: 'fa-credit-card' }
  if (t.includes('student')) return { color: 'blue', icon: 'fa-graduation-cap' }
  if (t.includes('auto') || t.includes('car')) return { color: 'orange', icon: 'fa-car' }
  return { color: 'purple', icon: 'fa-money-bill-transfer' }
}

router.get('/', async (req, res, next) => {
  try {
    const { userId } = req.query
    const user = await ensureUser(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    const debts = await Debt.find({ userId: user._id }).sort({ createdAt: -1 })
    const payload = debts.map(d => ({
      id: d._id.toString(),
      lender: d.lender,
      type: d.type,
      totalAmount: Number(d.totalAmount),
      remaining: Number(d.remaining),
      interestRate: Number(d.interestRate || 0),
      minPayment: Number(d.minPayment || 0),
      dueDate: d.dueDate ? d.dueDate.toISOString().slice(0,10) : null,
      color: d.color,
      icon: d.icon,
      history: (d.history || []).map(h => ({ date: h.date.toISOString().slice(0,10), amount: Number(h.amount) }))
    }))
    res.json({ debts: payload })
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { userId, lender, totalAmount, interestRate, minPayment, dueDate, type, reminders } = req.body || {}
    if (!lender) return res.status(400).json({ error: 'lender required' })
    const amt = Number(totalAmount)
    if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ error: 'totalAmount must be > 0' })
    const user = await ensureUser(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    const defaults = defaultsByType(type)
    const doc = await Debt.create({
      userId: user._id,
      lender,
      type: type || 'Personal Loan',
      totalAmount: amt,
      remaining: amt,
      interestRate: Number(interestRate) || 0,
      minPayment: Number(minPayment) || 0,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      color: defaults.color,
      icon: defaults.icon,
      history: [],
      reminders: Array.isArray(reminders) ? reminders.map(Number) : []
    })
    
    // Trigger notification check immediately
    // checkAndGenerateReminders(user._id).catch(err => console.error('Notification trigger error:', err)) // checkAndGenerateReminders is not imported here, skip for now

    res.status(201).json({ success: true, id: doc._id.toString() })
  } catch (err) {
    next(err)
  }
})

router.post('/:id/pay', async (req, res, next) => {
  try {
    const { id } = req.params
    const { amount, date, paymentMethod, note } = req.body || {}
    const amt = Number(amount)
    if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ error: 'amount must be > 0' })
    const debt = await Debt.findById(id)
    if (!debt) return res.status(404).json({ error: 'Debt not found' })
    const newRemaining = Math.max(0, Number(debt.remaining || 0) - amt)
    const paidDate = date ? new Date(date) : new Date()
    const tx = await Transaction.create({
      userId: debt.userId,
      title: `Debt Payment - ${debt.lender}`,
      category: 'Debt',
      amount: -Math.abs(amt),
      date: paidDate,
      paymentMethod,
      note: note || `Payment towards ${debt.type}`
    })
    debt.remaining = newRemaining
    debt.history.unshift({ date: paidDate, amount: amt, txId: tx._id.toString() })
    await debt.save()
    res.json({ success: true, remaining: newRemaining, history: debt.history.map(h => ({ date: h.date.toISOString().slice(0,10), amount: Number(h.amount) })), transactionId: tx._id.toString() })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    await Debt.deleteOne({ _id: id })
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

export default router
