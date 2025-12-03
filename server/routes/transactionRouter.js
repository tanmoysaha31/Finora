import express from 'express'
import Transaction from '../models/Transaction.js'
import { auth } from '../middlewares/auth.js'

const router = express.Router()

router.get('/', auth, async (req, res) => {
  const { q, category, startDate, endDate, minAmount, maxAmount, sort = '-date', page = '1', limit = '50' } = req.query
  const filter = { userId: req.user._id }
  if (q) {
    const r = new RegExp(String(q), 'i')
    filter.$or = [{ title: r }, { note: r }, { category: r }]
  }
  if (category) {
    const list = String(category)
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    filter.category = list.length > 1 ? { $in: list } : list[0]
  }
  if (startDate || endDate) {
    const d = {}
    if (startDate) d.$gte = new Date(String(startDate))
    if (endDate) d.$lte = new Date(String(endDate))
    filter.date = d
  }
  if (minAmount || maxAmount) {
    const a = {}
    if (minAmount) a.$gte = Number(minAmount)
    if (maxAmount) a.$lte = Number(maxAmount)
    filter.amount = a
  }
  const pageNum = Math.max(1, Number(page) || 1)
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 50))
  const skip = (pageNum - 1) * limitNum
  const [items, total] = await Promise.all([
    Transaction.find(filter).sort(String(sort)).skip(skip).limit(limitNum),
    Transaction.countDocuments(filter),
  ])
  res.json({ items, total, page: pageNum, limit: limitNum })
})

router.post('/', auth, async (req, res) => {
  const { title, category, amount, date, note } = req.body
  if (!title || !category || typeof amount !== 'number') {
    return res.status(400).json({ error: 'title, category, amount required' })
  }
  const tx = await Transaction.create({ userId: req.user._id, title, category, amount, date, note })
  res.status(201).json(tx)
})

router.get('/summary', auth, async (req, res) => {
  const items = await Transaction.find({ userId: req.user._id })
  const income = items.filter(i => i.amount > 0).reduce((s, i) => s + i.amount, 0)
  const expense = items.filter(i => i.amount < 0).reduce((s, i) => s + Math.abs(i.amount), 0)
  const balance = income - expense
  res.json({ totalIncome: income, totalExpense: expense, totalBalance: balance, count: items.length })
})

export default router
