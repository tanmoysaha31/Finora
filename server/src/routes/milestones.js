import express from 'express'
import User from '../models/User.js'
import Goal from '../models/Goal.js'
import Milestone from '../models/Milestone.js'

const router = express.Router()

// Helper function to detect and log milestones
async function detectAndLogMilestones(goalId) {
  const goal = await Goal.findById(goalId)
  if (!goal) return []

  const progress = (goal.current / goal.target) * 100
  const newMilestones = []

  // Define milestone thresholds
  const milestones = [
    { type: 'goal_25', threshold: 25, title: '25% Progress', icon: 'fa-star', color: 'text-blue-500' },
    { type: 'goal_50', threshold: 50, title: '50% Progress', icon: 'fa-medal', color: 'text-purple-500' },
    { type: 'goal_75', threshold: 75, title: '75% Progress', icon: 'fa-fire', color: 'text-orange-500' },
    { type: 'goal_100', threshold: 100, title: 'Goal Completed!', icon: 'fa-trophy', color: 'text-yellow-500' }
  ]

  for (const m of milestones) {
    if (progress >= m.threshold) {
      try {
        const milestone = await Milestone.create({
          userId: goal.userId,
          goalId: goal._id,
          type: m.type,
          title: `${goal.title} - ${m.title}`,
          description: `You've reached ${m.threshold}% of your ${goal.title} goal! Keep going!`,
          amount: goal.current,
          percentage: m.threshold,
          icon: m.icon,
          color: m.color
        })
        newMilestones.push(milestone)
      } catch (err) {
        // Duplicate milestone, skip
        if (err.code !== 11000) throw err
      }
    }
  }

  return newMilestones
}

// GET all milestones for a user
router.get('/', async (req, res, next) => {
  try {
    const { userId } = req.query

    let user = userId 
      ? await User.findById(userId).catch(() => 
          User.findOne({ $or: [{ email: userId }, { fullname: userId }] })
        )
      : await User.findOne().sort({ createdAt: -1 })

    if (!user) return res.status(404).json({ error: 'User not found' })

    const milestones = await Milestone.find({ userId: user._id })
      .populate('goalId', 'title target current')
      .sort({ achievedAt: -1 })

    const payload = milestones.map(m => ({
      id: m._id.toString(),
      type: m.type,
      title: m.title,
      description: m.description,
      amount: m.amount,
      percentage: m.percentage,
      achievedAt: m.achievedAt.toISOString(),
      icon: m.icon,
      color: m.color,
      goal: m.goalId ? {
        id: m.goalId._id.toString(),
        title: m.goalId.title,
        current: m.goalId.current,
        target: m.goalId.target
      } : null
    }))

    res.json({
      milestones: payload,
      summary: {
        total: payload.length,
        completed: payload.filter(m => m.type === 'goal_100').length,
        lastAchieved: payload[0]?.achievedAt || null
      }
    })
  } catch (err) {
    next(err)
  }
})

// POST - Manually trigger milestone detection for a specific goal
router.post('/detect', async (req, res, next) => {
  try {
    const { goalId } = req.body

    if (!goalId) {
      return res.status(400).json({ error: 'goalId is required' })
    }

    const newMilestones = await detectAndLogMilestones(goalId)

    res.json({
      detected: newMilestones.length,
      milestones: newMilestones.map(m => ({
        id: m._id.toString(),
        type: m.type,
        title: m.title,
        percentage: m.percentage
      }))
    })
  } catch (err) {
    next(err)
  }
})

// POST - Check all goals for a user and detect milestones
router.post('/check-all', async (req, res, next) => {
  try {
    const { userId } = req.body

    let user = userId 
      ? await User.findById(userId).catch(() => 
          User.findOne({ $or: [{ email: userId }, { fullname: userId }] })
        )
      : await User.findOne().sort({ createdAt: -1 })

    if (!user) return res.status(404).json({ error: 'User not found' })

    const goals = await Goal.find({ userId: user._id })
    let totalDetected = 0

    for (const goal of goals) {
      const detected = await detectAndLogMilestones(goal._id)
      totalDetected += detected.length
    }

    res.json({
      message: `Checked ${goals.length} goals`,
      newMilestones: totalDetected
    })
  } catch (err) {
    next(err)
  }
})

export { detectAndLogMilestones }
export default router
