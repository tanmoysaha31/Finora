import express from 'express'
import User from '../models/User.js'
import Goal from '../models/Goal.js'
import Transaction from '../models/Transaction.js'
import { detectAndLogMilestones } from './milestones.js'

const router = express.Router()

async function ensureUser(userId) {
  if (userId) return await User.findById(userId)
  const u = await User.findOne().sort({ createdAt: -1 })
  return u
}


router.get('/', async (req, res, next) => {
  try {
    const { userId } = req.query
    const user = await ensureUser(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    const goals = await Goal.find({ userId: user._id }).sort({ createdAt: -1 })
    const payload = goals.map(g => ({
      id: g._id.toString(),
      title: g.title,
      savedAmount: g.current,
      targetAmount: g.target,
      deadline: g.deadline ? g.deadline.toISOString().slice(0,10) : null,
      icon: g.icon || 'fa-star',
      type: g.type,
      color: g.color,
      shadow: g.shadow,
      reminders: g.reminders || []
    }))
    res.json({ goals: payload })
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { userId, title, targetAmount, savedAmount, deadline, icon, type, color, shadow, reminders } = req.body || {}
    if (!title || !targetAmount) return res.status(400).json({ error: 'Title and targetAmount required' })
    const user = await ensureUser(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    const goal = await Goal.create({
      userId: user._id,
      title,
      target: Number(targetAmount),
      current: Number(savedAmount) || 0,
      deadline: deadline ? new Date(deadline) : undefined,
      icon,
      type,
      color,
      shadow,
      reminders: Array.isArray(reminders) ? reminders.map(Number) : []
    })
    res.status(201).json({ id: goal._id.toString() })
  } catch (err) {
    next(err)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const { title, targetAmount, savedAmount, deadline, icon, type, color, shadow, reminders } = req.body || {}
    const update = {}
    if (title !== undefined) update.title = title
    if (targetAmount !== undefined) update.target = Number(targetAmount)
    if (savedAmount !== undefined) update.current = Number(savedAmount)
    if (deadline !== undefined) update.deadline = deadline ? new Date(deadline) : undefined
    if (icon !== undefined) update.icon = icon
    if (type !== undefined) update.type = type
    if (color !== undefined) update.color = color
    if (shadow !== undefined) update.shadow = shadow
    if (reminders !== undefined) update.reminders = Array.isArray(reminders) ? reminders.map(Number) : []
    await Goal.findByIdAndUpdate(id, { $set: update })
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const goal = await Goal.findById(id)
    if (!goal) return res.status(404).json({ error: 'Goal not found' })
    await Transaction.deleteMany({
      userId: goal.userId,
      $or: [
        { goalId: goal._id },
        { title: `Savings Deposit - ${goal.title}` }
      ]
    })
    await Goal.deleteOne({ _id: id })
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

// Fund a savings goal: increments goal.current and writes a negative transaction
router.post('/:id/fund', async (req, res, next) => {
  try {
    const { id } = req.params
    const { userId, amount, note, date } = req.body || {}
    const amt = Number(amount)
    if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ error: 'amount must be > 0' })
    const goal = await Goal.findById(id)
    if (!goal) return res.status(404).json({ error: 'Goal not found' })
    const user = await ensureUser(userId || goal.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    await Goal.findByIdAndUpdate(id, { $inc: { current: amt } })

    const tx = await Transaction.create({
      userId: user._id,
      goalId: goal._id,
      title: `Savings Deposit - ${goal.title}`,
      category: 'Savings',
      amount: -Math.abs(amt),
      date: date ? new Date(date) : new Date(),
      note: note || 'Goal funding'
    })

    // Automatically detect and log milestones after funding
    const newMilestones = await detectAndLogMilestones(id)

    res.status(201).json({ 
      success: true, 
      transactionId: tx._id.toString(),
      milestonesAchieved: newMilestones.length
    })
  } catch (err) {
    next(err)
  }
})

export default router
