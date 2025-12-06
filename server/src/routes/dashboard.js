import express from 'express'
import User from '../models/User.js'
import Transaction from '../models/Transaction.js'
import Goal from '../models/Goal.js'
import Contact from '../models/Contact.js'

const router = express.Router()

const iconMap = {
  Tech: 'fa-laptop-code',
  Salary: 'fa-money-bill-wave',
  Food: 'fa-burger',
  Transport: 'fa-car',
  Shopping: 'fa-bag-shopping',
  Entertainment: 'fa-film',
  Utility: 'fa-bolt'
}

router.get('/', async (req, res, next) => {
  try {
    const { userId } = req.query
    let user
    if (userId) {
      user = await User.findById(userId)
    } else {
      user = await User.findOne().sort({ createdAt: -1 })
    }
    if (!user) return res.status(404).json({ error: 'User not found' })

    let [transactions, goals, contacts] = await Promise.all([
      Transaction.find({ userId: user._id }).sort({ date: -1 }).limit(50),
      Goal.find({ userId: user._id }).sort({ createdAt: -1 }),
      Contact.find({ userId: user._id }).sort({ createdAt: -1 })
    ])

    if (goals.length === 0) {
      const defaults = [
        { title: 'PlayStation 5', current: 350, target: 500, items: 'Console & Game', icon: 'fa-gamepad', bg: 'bg-indigo-600' },
        { title: 'Home Renovation', current: 8500, target: 15000, items: 'Roof & Paint', icon: 'fa-paint-roller', bg: 'bg-emerald-600' },
        { title: 'Japan Trip', current: 2500, target: 5000, items: 'Flight & Hotel', icon: 'fa-plane', bg: 'bg-rose-600' },
        { title: 'New MacBook', current: 1200, target: 2500, items: 'Macbook Pro M3 Max', icon: 'fa-laptop', bg: 'bg-gray-700' }
      ]
      goals = await Goal.insertMany(defaults.map(g => ({ ...g, userId: user._id })))
    }

    const now = new Date()
    const months = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-US', { month: 'short' }) })
    }
    const incomeByMonth = new Array(months.length).fill(0)
    const expenseByMonth = new Array(months.length).fill(0)
    let totalBalance = 0

    transactions.forEach(tx => {
      totalBalance += tx.amount
      const k = `${tx.date.getFullYear()}-${tx.date.getMonth()}`
      const idx = months.findIndex(m => m.key === k)
      if (idx >= 0) {
        if (tx.amount > 0) incomeByMonth[idx] += tx.amount
        else expenseByMonth[idx] += Math.abs(tx.amount)
      }
    })

    const chartData = {
      labels: months.map(m => m.label),
      income: incomeByMonth.map(v => Math.round(v)),
      expense: expenseByMonth.map(v => Math.round(v))
    }

    const bgByType = { wedding: 'bg-rose-600', hajj: 'bg-emerald-600', emergency: 'bg-red-600', tech: 'bg-indigo-600', education: 'bg-blue-600', savings: 'bg-emerald-600' }

    const payload = {
      user: {
        username: user.fullname,
        plan: 'Premium Plan',
        avatar: user.avatar || 'https://cdn-icons-png.flaticon.com/512/2922/2922510.png',
        totalBalance: Number(totalBalance.toFixed(2))
      },
      chartData,
      goals: goals.map(g => ({
        id: g._id.toString(),
        title: g.title,
        current: g.current,
        target: g.target,
        items: g.items || (g.deadline ? `Target by ${g.deadline.toISOString().slice(0,10)}` : (g.type ? `${g.type[0].toUpperCase()}${g.type.slice(1)} Goal` : 'Savings Goal')),
        icon: g.icon || 'fa-plane',
        bg: g.bg || bgByType[g.type] || 'bg-indigo-600'
      })),
      transactions: transactions.map(t => ({ id: t._id.toString(), title: t.title, category: t.category, amount: Number(t.amount), date: t.date.toISOString().slice(0,10), icon: iconMap[t.category] || 'fa-circle-dollar-to-slot' })),
      contacts: contacts.map(c => ({ id: c._id.toString(), name: c.name, avatarType: c.avatarType, icon: c.icon, avatar: c.avatar }))
    }

    res.json(payload)
  } catch (err) {
    next(err)
  }
})

export default router
