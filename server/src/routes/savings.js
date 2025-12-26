import express from 'express'
import User from '../models/User.js'
import Transaction from '../models/Transaction.js'
import Income from '../models/Income.js'

const router = express.Router()

const generateSavingsSuggestions = (transactions, incomes, period = 'monthly') => {
  const suggestions = []
  const now = new Date()
  
  // Determine time range based on period
  const startDate = new Date()
  if (period === 'weekly') {
    startDate.setDate(now.getDate() - 7)
  } else {
    startDate.setDate(now.getDate() - 30)
  }
  

  const recentTransactions = transactions.filter(tx => new Date(tx.date) >= startDate)
  const recentIncomes = incomes.filter(inc => new Date(inc.date) >= startDate)
  

  const totalIncome = recentIncomes.reduce((sum, inc) => sum + inc.amount, 0)
  const totalExpense = recentTransactions
    .filter(tx => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
  
 
  const categorySpending = {}
  recentTransactions
    .filter(tx => tx.amount < 0)
    .forEach(tx => {
      const category = tx.category || 'Other'
      categorySpending[category] = (categorySpending[category] || 0) + Math.abs(tx.amount)
    })
  
  
  const sortedCategories = Object.entries(categorySpending)
    .sort((a, b) => b[1] - a[1])
  
  
  const savingsAmount = totalIncome - totalExpense
  const savingsRate = totalIncome > 0 ? (savingsAmount / totalIncome) * 100 : 0
  

  if (savingsRate < 20 && totalIncome > 0) {
    suggestions.push({
      id: 'savings-rate',
      title: 'Increase Your Savings Rate',
      description: `You're currently saving ${savingsRate.toFixed(1)}% of your income. Aim for at least 20% to build a healthy emergency fund.`,
      impact: `Save an additional $${((totalIncome * 0.20) - savingsAmount).toFixed(2)} ${period === 'weekly' ? 'per week' : 'per month'}`,
      actionable: `Try to set aside $${((totalIncome * 0.20 - savingsAmount) / 4).toFixed(2)} more each week`,
      priority: 'high',
      icon: 'fa-piggy-bank',
      color: 'bg-emerald-600'
    })
  } else if (savingsRate >= 20) {
    suggestions.push({
      id: 'savings-great',
      title: 'Great Savings Habits!',
      description: `You're saving ${savingsRate.toFixed(1)}% of your income - that's excellent! Keep it up!`,
      impact: `You saved $${savingsAmount.toFixed(2)} this ${period === 'weekly' ? 'week' : 'month'}`,
      actionable: 'Consider investing your savings for long-term growth',
      priority: 'low',
      icon: 'fa-trophy',
      color: 'bg-yellow-600'
    })
  }
  

  if (sortedCategories.length > 0) {
    const [topCategory, topAmount] = sortedCategories[0]
    const categoryPercent = (topAmount / totalExpense) * 100
    
    if (categoryPercent > 30 && topAmount > 100) {
      const potentialSavings = topAmount * 0.15 // Suggest 15% reduction
      suggestions.push({
        id: `reduce-${topCategory.toLowerCase()}`,
        title: `Reduce ${topCategory} Spending`,
        description: `${topCategory} accounts for ${categoryPercent.toFixed(1)}% of your expenses ($${topAmount.toFixed(2)}).`,
        impact: `Save $${potentialSavings.toFixed(2)} by cutting ${topCategory} spending by 15%`,
        actionable: `Set a weekly budget of $${((topAmount * 0.85) / (period === 'weekly' ? 1 : 4)).toFixed(2)} for ${topCategory}`,
        priority: 'high',
        icon: topCategory === 'Food' ? 'fa-utensils' : topCategory === 'Shopping' ? 'fa-bag-shopping' : topCategory === 'Transport' ? 'fa-car' : 'fa-circle-dollar',
        color: 'bg-blue-600'
      })
    }
  }
  

  const smallExpenses = recentTransactions
    .filter(tx => tx.amount < 0 && Math.abs(tx.amount) < 50)
  
  if (smallExpenses.length > 5) {
    const smallExpenseTotal = smallExpenses.reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
    const potentialSavings = smallExpenseTotal * 0.30 // Suggest 30% reduction
    
    suggestions.push({
      id: 'small-expenses',
      title: 'Watch Small Recurring Expenses',
      description: `You have ${smallExpenses.length} small transactions totaling $${smallExpenseTotal.toFixed(2)}.`,
      impact: `Save $${potentialSavings.toFixed(2)} by reducing unnecessary small purchases`,
      actionable: 'Review subscriptions and daily purchases like coffee or snacks',
      priority: 'medium',
      icon: 'fa-receipt',
      color: 'bg-purple-600'
    })
  }
  
  
  if (totalIncome > 0 && totalExpense > totalIncome * 0.9) {
    suggestions.push({
      id: 'expense-warning',
      title: 'Expenses Near Income Limit',
      description: `Your expenses ($${totalExpense.toFixed(2)}) are consuming ${((totalExpense / totalIncome) * 100).toFixed(1)}% of your income.`,
      impact: `Reduce expenses by $${(totalExpense - totalIncome * 0.80).toFixed(2)} to maintain 20% savings`,
      actionable: 'Create a detailed budget and track daily spending',
      priority: 'high',
      icon: 'fa-triangle-exclamation',
      color: 'bg-red-600'
    })
  }
  
 
  if (sortedCategories.length < 3 && totalExpense > 100) {
    suggestions.push({
      id: 'budget-planning',
      title: 'Improve Budget Tracking',
      description: 'You have limited expense categories tracked. Better categorization helps identify savings opportunities.',
      impact: 'Better insights into spending patterns',
      actionable: 'Categorize all transactions for more accurate analysis',
      priority: 'low',
      icon: 'fa-chart-pie',
      color: 'bg-indigo-600'
    })
  }
  
  const monthlyExpenseAvg = totalExpense / (period === 'weekly' ? 0.25 : 1)
  const emergencyFundTarget = monthlyExpenseAvg * 6
  const currentSavings = savingsAmount * (period === 'weekly' ? 4 : 1)
  
  if (currentSavings < emergencyFundTarget * 0.5) {
    suggestions.push({
      id: 'emergency-fund',
      title: 'Build Your Emergency Fund',
      description: `Aim for 6 months of expenses ($${emergencyFundTarget.toFixed(2)}) in emergency savings.`,
      impact: `Need $${(emergencyFundTarget - currentSavings).toFixed(2)} more for full emergency fund`,
      actionable: `Save $${(emergencyFundTarget / 24).toFixed(2)} monthly for 2 years to reach goal`,
      priority: 'medium',
      icon: 'fa-shield',
      color: 'bg-teal-600'
    })
  }
  
  const priorityOrder = { high: 1, medium: 2, low: 3 }
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  
  return suggestions.slice(0, 5) 
}

router.get('/', async (req, res, next) => {
  try {
    const { userId, period = 'monthly' } = req.query
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' })
    }
    
    // Validate period
    if (!['weekly', 'monthly'].includes(period)) {
      return res.status(400).json({ error: 'period must be "weekly" or "monthly"' })
    }
    
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    

    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    
    const [transactions, incomes] = await Promise.all([
      Transaction.find({ 
        userId: user._id, 
        date: { $gte: threeMonthsAgo } 
      }).sort({ date: -1 }),
      Income.find({ 
        userId: user._id, 
        date: { $gte: threeMonthsAgo } 
      }).sort({ date: -1 })
    ])
    
    const suggestions = generateSavingsSuggestions(transactions, incomes, period)
    
    res.json({
      period,
      suggestions,
      summary: {
        totalSuggestions: suggestions.length,
        highPriority: suggestions.filter(s => s.priority === 'high').length,
        lastUpdated: new Date().toISOString()
      }
    })
  } catch (err) {
    next(err)
  }
})

export default router
