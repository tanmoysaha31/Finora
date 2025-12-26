import express from 'express'
import Transaction from '../models/Transaction.js'
import Goal from '../models/Goal.js'
import EmotionCheckin from '../models/EmotionCheckin.js'
import Income from '../models/Income.js'

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const { userId, keyword, q, category, start, end, startDate, endDate, minAmount, maxAmount, limit, skip } = req.query || {}
    const match = {}
    if (userId) match.userId = userId

    const kw = (q || keyword || '').trim()
    if (kw) {
      match.$or = [
        { title: { $regex: kw, $options: 'i' } },
        { note: { $regex: kw, $options: 'i' } }
      ]
    }

    if (category) {
      match.category = String(category)
    }

    const s = start || startDate
    const e = end || endDate
    if (s || e) {
      const range = {}
      if (s) {
        const sd = new Date(s)
        sd.setHours(0,0,0,0)
        range.$gte = sd
      }
      if (e) {
        const ed = new Date(e)
        ed.setHours(23,59,59,999)
        range.$lte = ed
      }
      match.date = range
    }

    const amt = {}
    if (minAmount !== undefined) amt.$gte = Number(minAmount)
    if (maxAmount !== undefined) amt.$lte = Number(maxAmount)
    if (Object.keys(amt).length) match.amount = amt

    const lim = Math.min(200, Number(limit) || 50)
    const sk = Math.max(0, Number(skip) || 0)

    const txs = await Transaction.find(match).sort({ date: -1 }).skip(sk).limit(lim)
    const items = txs.map(t => ({ id: t._id.toString(), title: t.title, category: t.category, amount: Number(t.amount), date: t.date.toISOString().slice(0,10) }))
    res.json({ total: items.length, items })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const tx = await Transaction.findById(id)
    if (!tx) return res.status(404).json({ success: false, error: 'Transaction not found' })
    
    // Calculate monthly stats for this category
    const startOfMonth = new Date(tx.date)
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    const endOfMonth = new Date(tx.date)
    endOfMonth.setMonth(endOfMonth.getMonth() + 1)
    endOfMonth.setDate(0)
    endOfMonth.setHours(23, 59, 59, 999)
    
    const monthlyTxs = await Transaction.find({
      userId: tx.userId,
      category: tx.category,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    })
    
    const monthlyTotal = Math.abs(monthlyTxs.reduce((sum, t) => sum + (t.amount < 0 ? Math.abs(t.amount) : 0), 0))
    
    res.json({
      success: true,
      data: {
        _id: tx._id.toString(),
        title: tx.title,
        amount: Number(tx.amount),
        category: tx.category,
        date: tx.date,
        paymentMethod: tx.paymentMethod,
        note: tx.note,
        context: {
          monthlyTotal,
          monthlyBudget: 2000 // Default budget, can be made dynamic later
        }
      }
    })
  } catch (err) {
    next(err)
  }
})

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
    if (tx.category === 'Debt') {
      let lender = ''
      if (tx.title && tx.title.startsWith('Debt Payment - ')) {
        lender = tx.title.replace('Debt Payment - ', '')
      }
      if (lender) {
        const debt = await (await import('../models/Debt.js')).default.findOne({ userId: tx.userId, lender })
        if (debt) {
          const amt = Math.abs(Number(tx.amount) || 0)
          let restored = amt
          const idx = (debt.history || []).findIndex(h => String(h.txId || '') === tx._id.toString())
          if (idx >= 0) {
            restored = Number(debt.history[idx].amount) || amt
            debt.history.splice(idx, 1)
          } else {
            const sameDayIdx = (debt.history || []).findIndex(h => h.amount === amt && h.date && h.date.toDateString() === tx.date.toDateString())
            if (sameDayIdx >= 0) debt.history.splice(sameDayIdx, 1)
          }
          const newRemaining = Math.min(Number(debt.totalAmount) || restored, Number(debt.remaining || 0) + restored)
          debt.remaining = newRemaining
          await debt.save()
        }
      }
    }
    await EmotionCheckin.deleteMany({ $or: [ { expenseId: id }, { expenseId: tx._id } ] })
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
    res.json({ success: true, amount: Number(tx.amount) })
  } catch (err) {
    next(err)
  }
})

export default router
