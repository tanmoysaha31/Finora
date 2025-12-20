import express from 'express'
import Bill from '../models/Bill.js'

const router = express.Router()

// GET all bills for a user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query
    if (!userId) return res.status(400).json({ error: 'UserId required' })
    const bills = await Bill.find({ userId }).sort({ dueDate: 1 })
    res.json({ bills })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST create a bill
router.post('/', async (req, res) => {
  try {
    const { userId, title, amount, dueDate, category, isRecurring, frequency, reminders } = req.body
    if (!userId || !title || !amount || !dueDate) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    const bill = await Bill.create({ 
        userId, title, amount, dueDate, category, isRecurring, frequency,
        reminders: Array.isArray(reminders) ? reminders.map(Number) : []
    })
    res.status(201).json(bill)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT update a bill (e.g., mark as paid)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    if (updates.reminders) {
        updates.reminders = Array.isArray(updates.reminders) ? updates.reminders.map(Number) : []
    }
    const bill = await Bill.findByIdAndUpdate(id, updates, { new: true })
    res.json(bill)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE a bill
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await Bill.findByIdAndDelete(id)
    res.json({ message: 'Bill deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
