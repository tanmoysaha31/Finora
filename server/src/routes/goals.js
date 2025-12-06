import express from 'express'
import User from '../models/User.js'
import Goal from '../models/Goal.js'

const router = express.Router()

async function ensureUser(userId) {
  if (userId) return await User.findById(userId)
  const u = await User.findOne().sort({ createdAt: -1 })
  return u
}

// Seed defaults when no goals exist for user
const DEFAULT_GOALS = [
  { title: 'Wedding Fund', type: 'wedding', current: 12500, target: 30000, deadline: new Date('2025-12-01'), icon: 'fa-ring', color: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-500/20' },
  { title: 'Hajj Pilgrimage', type: 'hajj', current: 4500, target: 8000, deadline: new Date('2026-06-15'), icon: 'fa-kaaba', color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20' },
  { title: 'Emergency Fund', type: 'emergency', current: 5000, target: 10000, deadline: new Date('2024-12-31'), icon: 'fa-heart-pulse', color: 'from-red-500 to-orange-500', shadow: 'shadow-red-500/20' },
  { title: 'New MacBook', type: 'tech', current: 1200, target: 2500, deadline: new Date('2024-05-20'), icon: 'fa-laptop', color: 'from-blue-500 to-indigo-500', shadow: 'shadow-blue-500/20' }
]

router.get('/', async (req, res, next) => {
  try {
    const { userId } = req.query
    const user = await ensureUser(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    let goals = await Goal.find({ userId: user._id }).sort({ createdAt: -1 })
    if (goals.length === 0) {
      goals = await Goal.insertMany(DEFAULT_GOALS.map(g => ({ ...g, userId: user._id })))
    }
    const payload = goals.map(g => ({
      id: g._id.toString(),
      title: g.title,
      savedAmount: g.current,
      targetAmount: g.target,
      deadline: g.deadline ? g.deadline.toISOString().slice(0,10) : null,
      icon: g.icon || 'fa-star',
      type: g.type,
      color: g.color,
      shadow: g.shadow
    }))
    res.json({ goals: payload })
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { userId, title, targetAmount, savedAmount, deadline, icon, type, color, shadow } = req.body || {}
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
      shadow
    })
    res.status(201).json({ id: goal._id.toString() })
  } catch (err) {
    next(err)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const { title, targetAmount, savedAmount, deadline, icon, type, color, shadow } = req.body || {}
    const update = {}
    if (title !== undefined) update.title = title
    if (targetAmount !== undefined) update.target = Number(targetAmount)
    if (savedAmount !== undefined) update.current = Number(savedAmount)
    if (deadline !== undefined) update.deadline = deadline ? new Date(deadline) : undefined
    if (icon !== undefined) update.icon = icon
    if (type !== undefined) update.type = type
    if (color !== undefined) update.color = color
    if (shadow !== undefined) update.shadow = shadow
    await Goal.findByIdAndUpdate(id, { $set: update })
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

export default router
