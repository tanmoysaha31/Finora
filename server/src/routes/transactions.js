import express from 'express'
import Transaction from '../models/Transaction.js'
import Goal from '../models/Goal.js'
import EmotionCheckin from '../models/EmotionCheckin.js'
import Income from '../models/Income.js'

const router = express.Router()

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const tx = await Transaction.findById(id)
    if (!tx) return res.status(404).json({ error: 'Transaction not found' })
    if (tx.category === 'Savings') {
      let goal = null
      if (tx.goalId) {
        goal = await Goal.findById(tx.goalId)
      } else if (tx.title && tx.title.startsWith('Savings Deposit - ')) {
        const title = tx.title.replace('Savings Deposit - ', '')
        goal = await Goal.findOne({ title })
      }
      if (goal) {
        const amt = Math.abs(Number(tx.amount) || 0)
        const newCurrent = Math.max(0, (Number(goal.current) || 0) - amt)
        await Goal.updateOne({ _id: goal._id }, { $set: { current: newCurrent } })
      }
    }
    await EmotionCheckin.deleteMany({ expenseId: id })
    if (tx.amount > 0) {
      let income = null
      if (tx.incomeId) {
        income = await Income.findById(tx.incomeId)
      }
      if (!income) {
        const start = new Date(tx.date)
        start.setHours(0,0,0,0)
        const end = new Date(tx.date)
        end.setHours(23,59,59,999)
        const src = (tx.category || '').toLowerCase()
        income = await Income.findOne({
          userId: tx.userId,
          amount: Math.abs(Number(tx.amount) || 0),
          date: { $gte: start, $lte: end },
          $or: [{ note: tx.title }, { source: src }]
        })
      }
      if (income) {
        await Income.deleteOne({ _id: income._id })
      }
    }
    await Transaction.deleteOne({ _id: id })
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

export default router
