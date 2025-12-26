import express from 'express'
import QuizResult from '../models/QuizResult.js'
import User from '../models/User.js'

const router = express.Router()

// Personality Definitions
const personalities = {
  wealth_architect: {
    title: "The Wealth Architect",
    desc: "You are disciplined, strategic, and knowledgeable. You view money as a tool to build a fortress of security and growth.",
    color: "purple",
    icon: "fa-chess-rook"
  },
  savvy_investor: {
    title: "The Savvy Investor",
    desc: "You aren't afraid of risk and understand that growth requires action. You have a sharp eye for opportunity.",
    color: "green",
    icon: "fa-chart-line"
  },
  balanced_realist: {
    title: "The Balanced Realist",
    desc: "You enjoy life today while keeping an eye on tomorrow. You have a healthy relationship with money but could optimize further.",
    color: "blue",
    icon: "fa-scale-balanced"
  },
  spontaneous_spender: {
    title: "The Spontaneous Spirit",
    desc: "You prioritize experiences and the present moment. While you live life to the fullest, your future self might need some help.",
    color: "orange",
    icon: "fa-ticket"
  },
  cautious_guardian: {
    title: "The Cautious Guardian",
    desc: "Safety is your number one priority. You are excellent at saving but might be missing out on growth due to fear of risk.",
    color: "teal",
    icon: "fa-shield-halved"
  }
}

// Helper to ensure user exists
async function ensureUser(userId) {
  if (!userId) throw new Error('User ID is required')
  let user = await User.findById(userId)
  if (!user) {
     // If passed ID is not a valid ObjectId or not found, try to find one or fail
     // For simplicity, let's assume valid ObjectId is passed or we throw
     throw new Error('User not found')
  }
  return user
}

// POST /api/quiz/submit
router.post('/submit', async (req, res, next) => {
  try {
    const { userId, traits } = req.body || {}
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    const user = await ensureUser(userId)

    // Logic to determine persona
    let personaKey = 'balanced_realist'
    const { discipline = 0, risk = 0, knowledge = 0 } = traits || {}

    if (discipline > 60 && risk < 30) personaKey = 'cautious_guardian'
    else if (discipline > 60 && knowledge > 50) personaKey = 'wealth_architect'
    else if (risk > 50 && knowledge > 40) personaKey = 'savvy_investor'
    else if (discipline < 30) personaKey = 'spontaneous_spender'

    // Save result
    const newResult = await QuizResult.create({
      userId: user._id,
      traits,
      personaKey
    })

    // Return result with full details
    res.json({
      personaKey,
      details: personalities[personaKey],
      scores: traits
    })

  } catch (error) {
    next(error)
  }
})

// GET /api/quiz/latest
router.get('/latest', async (req, res, next) => {
  try {
    const { userId } = req.query
    if (!userId) return res.status(400).json({ error: 'User ID is required' })

    const user = await ensureUser(userId)
    const latestResult = await QuizResult.findOne({ userId: user._id }).sort({ createdAt: -1 })

    if (!latestResult) {
      return res.json({ hasResult: false })
    }

    res.json({
      hasResult: true,
      personaKey: latestResult.personaKey,
      details: personalities[latestResult.personaKey],
      scores: latestResult.traits,
      date: latestResult.createdAt
    })

  } catch (error) {
    next(error)
  }
})

export default router
