import express from 'express'
import Notification from '../models/Notification.js'
import { checkAndGenerateReminders } from '../services/notificationService.js'

const router = express.Router()

// GET notifications
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query
    if (!userId) return res.status(400).json({ error: 'UserId required' })

    // Trigger check
    const debug = await checkAndGenerateReminders(userId)

    const notifications = await Notification.find({ userId }).sort({ date: -1 }).limit(50)
    res.json({ notifications, debug })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT mark as read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params
    await Notification.findByIdAndUpdate(id, { isRead: true })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE clear all read
router.delete('/clear-read', async (req, res) => {
    try {
        const { userId } = req.query
        if (!userId) return res.status(400).json({ error: 'UserId required' })
        await Notification.deleteMany({ userId, isRead: true })
        res.json({ success: true })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

export default router
