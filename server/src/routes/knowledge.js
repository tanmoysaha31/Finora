import express from 'express'
import KnowledgeProgress from '../models/KnowledgeProgress.js'
import FinanceLesson from '../models/FinanceLesson.js'
import User from '../models/User.js'

const router = express.Router()

// Helper to ensure user exists
async function ensureUser(userId) {
  if (!userId) throw new Error('User ID is required')
  // Handle if userId is not a valid ObjectId format
  if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Invalid User ID format')
  }
  let user = await User.findById(userId)
  if (!user) throw new Error('User not found')
  return user
}

// GET /api/knowledge/lessons
router.get('/lessons', async (req, res, next) => {
  try {
    const lessons = await FinanceLesson.find().sort({ id: 1 })
    res.json(lessons)
  } catch (err) {
    next(err)
  }
})

// GET /api/knowledge/progress
router.get('/progress', async (req, res, next) => {
  try {
    const { userId } = req.query
    const user = await ensureUser(userId)

    let progress = await KnowledgeProgress.findOne({ userId: user._id })
    if (!progress) {
      // Return empty default state without creating it yet, or create it. 
      // Creating it ensures consistency.
      progress = await KnowledgeProgress.create({ userId: user._id, completedLessons: [], totalScore: 0 })
    }

    res.json(progress)
  } catch (err) {
    next(err)
  }
})

// POST /api/knowledge/complete
router.post('/complete', async (req, res, next) => {
  try {
    const { userId, lessonId, scoreEarned } = req.body
    const user = await ensureUser(userId)
    const lessonIdNum = Number(lessonId)

    let progress = await KnowledgeProgress.findOne({ userId: user._id })
    if (!progress) {
      progress = new KnowledgeProgress({ userId: user._id, completedLessons: [], totalScore: 0 })
    }

    // Only add if not already completed
    if (!progress.completedLessons.includes(lessonIdNum)) {
      progress.completedLessons.push(lessonIdNum)
      progress.totalScore += (scoreEarned || 0)
      progress.updatedAt = Date.now()
      await progress.save()
    }

    res.json(progress)
  } catch (err) {
    next(err)
  }
})

// POST /api/knowledge/sync
// In case we want to sync multiple lessons at once or handle arbitrary score updates
router.post('/sync', async (req, res, next) => {
    try {
      const { userId, completedLessons, totalScore } = req.body
      const user = await ensureUser(userId)
  
      let progress = await KnowledgeProgress.findOne({ userId: user._id })
      if (!progress) {
        progress = new KnowledgeProgress({ userId: user._id, completedLessons: [], totalScore: 0 })
      }
  
      // Merge completed lessons
      if (Array.isArray(completedLessons)) {
          completedLessons.forEach(id => {
              if (!progress.completedLessons.includes(id)) {
                  progress.completedLessons.push(id)
              }
          })
      }

      // Update score if provided and higher (or just update)
      if (typeof totalScore === 'number') {
          progress.totalScore = totalScore
      }
      
      progress.updatedAt = Date.now()
      await progress.save()
  
      res.json(progress)
    } catch (err) {
      next(err)
    }
  })

export default router
