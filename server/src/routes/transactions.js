import express from 'express'
import Transaction from '../models/Transaction.js'
import User from '../models/User.js'

const router = express.Router()

// GET Single Transaction by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    // Find transaction and verify it exists
    const transaction = await Transaction.findById(id)
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' })
    }

    // Optional: Get aggregated stats for the category to populate the "Monthly Context" on the UI
    // (This matches the "categoryStats" mock data requirement in your UI)
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const categoryStatsAgg = await Transaction.aggregate([
      {
        $match: {
          userId: transaction.userId,
          category: transaction.category,
          date: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' }, // Amount is stored as negative in DB usually, so we might need abs
          count: { $sum: 1 }
        }
      }
    ])

    const monthlyTotal = categoryStatsAgg.length > 0 ? Math.abs(categoryStatsAgg[0].totalSpent) : 0

    res.json({
      success: true,
      data: {
        ...transaction.toObject(),
        amount: Math.abs(transaction.amount), // Ensure positive for display
        // Pass extra context for the UI
        context: {
          monthlyTotal,
          monthlyBudget: 500 // Mock budget for now, or fetch from Budget model if you have one
        }
      }
    })
  } catch (err) {
    next(err)
  }
})

export default router