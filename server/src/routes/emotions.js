import express from 'express'
import User from '../models/User.js'
import EmotionCheckin from '../models/EmotionCheckin.js'
import mongoose from 'mongoose'

const router = express.Router()

async function ensureUser(userId) {
  if (userId) return await User.findById(userId)
  const u = await User.findOne().sort({ createdAt: -1 })
  return u
}

router.post('/', async (req, res, next) => {
  try {
    const { userId, expenseId, mood, necessityScore, socialContext, timestamp } = req.body || {}
    if (!expenseId || !mood) return res.status(400).json({ error: 'expenseId and mood required' })
    const user = await ensureUser(userId)
    const match = user ? { userId: user._id, expenseId: String(expenseId) } : { expenseId: String(expenseId) }

    const existing = await EmotionCheckin.findOne(match)
    if (existing) {
      return res.status(200).json({ success: true, id: existing._id.toString(), data: existing, message: 'Emotion already exists for this expense' })
    }

    const doc = await EmotionCheckin.create({
      userId: user?._id,
      expenseId: String(expenseId),
      mood: String(mood),
      necessity: necessityScore ? String(necessityScore) : undefined,
      socialContext: socialContext ? String(socialContext) : undefined,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      editCount: 1,
      lastEditedAt: new Date()
    })
    res.status(201).json({ success: true, id: doc._id.toString(), data: doc })
  } catch (err) {
    next(err)
  }
})

router.get('/summary', async (req, res, next) => {
  try {
    const { userId } = req.query
    const user = await ensureUser(userId)
    const match = user ? { userId: user._id } : {}
    const agg = await EmotionCheckin.aggregate([
      { $match: match },
      { $group: { _id: '$mood', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])
    const moodCounts = Object.fromEntries(agg.map(a => [a._id, a.count]))
    const recent = await EmotionCheckin.find(match).sort({ createdAt: -1 }).limit(10)
    res.json({ moodCounts, recent: recent.map(r => ({ id: r._id.toString(), expenseId: r.expenseId, mood: r.mood, necessity: r.necessity, socialContext: r.socialContext, timestamp: r.timestamp })) })
  } catch (err) {
    next(err)
  }
})

router.get('/:expenseId', async (req, res, next) => {
  try {
    const { expenseId } = req.params
    const { userId } = req.query
    if (!expenseId) return res.status(400).json({ success: false, error: 'expenseId is required' })

    const user = await ensureUser(userId)
    const match = user ? { userId: user._id, expenseId: String(expenseId) } : { expenseId: String(expenseId) }
    const record = await EmotionCheckin.findOne(match)
    if (!record) return res.status(404).json({ success: false, error: 'No emotion log found for this expense' })

    res.json({ success: true, data: record })
  } catch (err) {
    next(err)
  }
})

router.put('/:expenseId', async (req, res, next) => {
  try {
    const { expenseId } = req.params
    const { userId, mood, necessityScore, socialContext, timestamp } = req.body || {}
    if (!expenseId || !mood) return res.status(400).json({ success: false, error: 'expenseId and mood required' })

    const user = await ensureUser(userId)
    const match = user ? { userId: user._id, expenseId: String(expenseId) } : { expenseId: String(expenseId) }
    const record = await EmotionCheckin.findOne(match)
    if (!record) return res.status(404).json({ success: false, error: 'Emotion log not found for this expense' })

    if (record.editCount >= 2) {
      return res.status(403).json({ success: false, error: "Oh! It seems like you can't change the mood too many times!!", code: 'EDIT_LIMIT_REACHED', data: record })
    }

    record.mood = String(mood)
    record.necessity = necessityScore ? String(necessityScore) : undefined
    record.socialContext = socialContext ? String(socialContext) : undefined
    record.timestamp = timestamp ? new Date(timestamp) : new Date()
    record.editCount = (record.editCount || 1) + 1
    record.lastEditedAt = new Date()

    await record.save()
    res.json({ success: true, data: record })
  } catch (err) {
    next(err)
  }
})

export default router
