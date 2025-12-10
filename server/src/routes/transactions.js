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

// DELETE Transaction by ID with Balance Reallocation
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    // Find the transaction to delete
    const transaction = await Transaction.findById(id)
    
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' })
    }

    const userId = transaction.userId
    const deletedAmount = transaction.amount

    // Delete the transaction
    await Transaction.findByIdAndDelete(id)

    // Recalculate total balance for the user
    const allTransactions = await Transaction.find({ userId })
    const newTotalBalance = allTransactions.reduce((sum, tx) => sum + tx.amount, 0)

    // Update user's totalBalance field if it exists, or return computed balance
    // (Note: User model doesn't have a balance field, but we return computed balance)
    const user = await User.findById(userId)

    res.json({
      success: true,
      message: `Transaction deleted successfully. Amount: ${deletedAmount}`,
      data: {
        transactionId: id,
        deletedAmount,
        newTotalBalance: Number(newTotalBalance.toFixed(2)),
        user: {
          id: user._id.toString(),
          username: user.fullname,
          totalBalance: Number(newTotalBalance.toFixed(2))
        }
      }
    })
  } catch (err) {
    next(err)
  }
})

export default router