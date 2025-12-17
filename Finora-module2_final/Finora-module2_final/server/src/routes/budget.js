import express from 'express'
import User from '../models/User.js'
import Transaction from '../models/Transaction.js'
import BudgetPlan from '../models/BudgetPlan.js'
import Income from '../models/Income.js'

const router = express.Router()

const DEFAULT_CATEGORIES = [
  { id: 'cat_1', name: 'Housing & Rent', icon: 'fa-house', color: 'purple', limit: 0 },
  { id: 'cat_2', name: 'Food & Dining', icon: 'fa-burger', color: 'yellow', limit: 0 },
  { id: 'cat_3', name: 'Transportation', icon: 'fa-car', color: 'blue', limit: 0 },
  { id: 'cat_4', name: 'Entertainment', icon: 'fa-gamepad', color: 'pink', limit: 0 },
  { id: 'cat_5', name: 'Shopping', icon: 'fa-bag-shopping', color: 'orange', limit: 0 },
  { id: 'cat_6', name: 'Savings & Invest', icon: 'fa-piggy-bank', color: 'green', limit: 0 }
]

async function ensureUser(userId) {
  if (userId) return await User.findById(userId)
  const u = await User.findOne().sort({ createdAt: -1 })
  return u
}

router.get('/', async (req, res, next) => {
  try {
    const { userId, month, year } = req.query
    const user = await ensureUser(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    let plan = await BudgetPlan.findOne({ userId: user._id })
    if (!plan) {
      plan = await BudgetPlan.create({ userId: user._id, income: 0, categories: DEFAULT_CATEGORIES.map(c => ({ ...c, spent: 0 })) })
    }

    const now = new Date()
    const y = year ? Number(year) : now.getFullYear()
    const m = month ? Number(month) - 1 : now.getMonth()
    const start = new Date(y, m, 1)
    const end = new Date(y, m + 1, 0)
    end.setHours(23,59,59,999)
    const txs = await Transaction.find({ userId: user._id, amount: { $lt: 0 }, date: { $gte: start, $lte: end } })
    const spentMap = {}
    txs.forEach(t => {
      const key = t.category || 'Others'
      spentMap[key] = (spentMap[key] || 0) + Math.abs(t.amount)
    })

    const incomes = await Income.find({ userId: user._id, date: { $gte: start, $lte: end } })
    const monthlyIncome = incomes.reduce((acc, i) => acc + Math.abs(Number(i.amount) || 0), 0)

    const categories = plan.categories.map(c => ({ ...c.toObject(), spent: spentMap[c.id] ?? spentMap[c.name] ?? 0 }))

    res.json({ income: plan.income, monthlyIncome, categories, month: m + 1, year: y })
  } catch (err) {
    next(err)
  }
})

router.put('/', async (req, res, next) => {
  try {
    const { userId, income, categories } = req.body || {}
    const user = await ensureUser(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    const normalized = Array.isArray(categories)
      ? categories.map(c => ({ id: String(c.id), name: String(c.name), icon: c.icon || '', color: c.color || '', limit: Number(c.limit) || 0, spent: Number(c.spent) || 0 }))
      : undefined

    const update = {}
    if (typeof income === 'number') update.income = income
    if (normalized) update.categories = normalized

    const plan = await BudgetPlan.findOneAndUpdate(
      { userId: user._id },
      { $set: update },
      { upsert: true, new: true }
    )

    res.json({ success: true, income: plan.income, categories: plan.categories })
  } catch (err) {
    next(err)
  }
})

export default router
