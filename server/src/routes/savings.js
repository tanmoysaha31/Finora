import express from 'express'
import dotenv from 'dotenv'
import User from '../models/User.js'
import Transaction from '../models/Transaction.js'
import Income from '../models/Income.js'
import { Groq } from 'groq-sdk'

dotenv.config()

const router = express.Router()

// Initialization
let groq = null
const apiKey = process.env.GROQ_API_KEY
console.log('🔍 Checking Groq API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND')

if (apiKey && apiKey !== 'your_groq_api_key_here' && apiKey.trim() !== '') {
  try {
    groq = new Groq({ apiKey: apiKey })
    console.log('✓ Groq AI initialized successfully for savings suggestions')
  } catch (error) {
    console.error('❌ Failed to initialize Groq:', error.message)
    groq = null
  }
} else {
  console.warn('⚠ GROQ_API_KEY not set or invalid - using fallback suggestions')
}

// period
async function generateAISuggestions(transactions, incomes, period = 'monthly') {
  const now = new Date()
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

  // prepare data for AI analysis
  const financialData = {
    period,
    totalIncome: totalIncome.toFixed(2),
    totalExpense: totalExpense.toFixed(2),
    netSavings: (totalIncome - totalExpense).toFixed(2),
    savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0,
    categoryBreakdown: Object.entries(categorySpending)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, amt]) => ({ category: cat, amount: amt.toFixed(2) })),
    transactionCount: recentTransactions.length,
    incomeCount: recentIncomes.length
  }

  // prompt
  const prompt = `You are a financial advisor analyzing a user's spending patterns. Based on the following data, provide 3-5 personalized savings suggestions.

Financial Summary (${period}):
- Total Income: $${financialData.totalIncome}
- Total Expenses: $${financialData.totalExpense}
- Net Savings: $${financialData.netSavings}
- Savings Rate: ${financialData.savingsRate}%
- Number of Transactions: ${financialData.transactionCount}

Top Spending Categories:
${financialData.categoryBreakdown.map(c => `- ${c.category}: $${c.amount}`).join('\n')}

Generate suggestions in this EXACT JSON format:
[
  {
    "title": "Brief actionable title",
    "description": "Detailed explanation of why this matters",
    "impact": "Concrete savings amount or percentage",
    "actionable": "Specific action step",
    "priority": "high, medium, or low",
    "icon": "fa-piggy-bank, fa-chart-line, fa-wallet, fa-fire, fa-lightbulb, or fa-shield",
    "color": "bg-emerald-600, bg-blue-600, bg-purple-600, bg-orange-600, or bg-red-600"
  }
]

Focus on: savings rate optimization, category reduction, emergency fund, debt management, and smart spending habits. Be specific with dollar amounts. Respond ONLY with valid JSON array.`

  try {
    if (!groq) {
      throw new Error('AI not configured')
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_completion_tokens: 2048,
      top_p: 1,
      stream: false
    })

    const aiResponse = chatCompletion.choices[0]?.message?.content || '[]'
    
    let suggestions = JSON.parse(aiResponse)
    
    suggestions = suggestions.map((s, idx) => ({
      id: `ai-suggestion-${idx + 1}`,
      title: s.title || 'Savings Tip',
      description: s.description || '',
      impact: s.impact || 'Improve your financial health',
      actionable: s.actionable || 'Review your spending patterns',
      priority: s.priority || 'medium',
      icon: s.icon || 'fa-lightbulb',
      color: s.color || 'bg-blue-600'
    }))

    return suggestions

  } catch (error) {
    console.error('AI suggestion error:', error)
    
    // Fallback suggestions
    return [{
      id: 'fallback-1',
      title: 'Review Your Spending',
      description: `Your ${period} expenses are $${financialData.totalExpense}. Consider tracking categories to find savings opportunities.`,
      impact: 'Better financial awareness',
      actionable: 'Use the budget planner to categorize expenses',
      priority: 'medium',
      icon: 'fa-chart-line',
      color: 'bg-blue-600'
    }]
  }
}

router.get('/', async (req, res, next) => {
  try {
    const { userId, period = 'monthly' } = req.query
    
    if (!userId) {
      return res.status(400).json({ error: 'userId, email, or fullname is required' })
    }
    
    if (!['weekly', 'monthly'].includes(period)) {
      return res.status(400).json({ error: 'period must be "weekly" or "monthly"' })
    }
    
    
    let user
    try {
      user = await User.findById(userId)
    } catch (err) {
      user = await User.findOne({ 
        $or: [{ email: userId }, { fullname: userId }]
      })
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    
    const [transactions, incomes] = await Promise.all([
      Transaction.find({ userId: user._id, date: { $gte: threeMonthsAgo } }).sort({ date: -1 }),
      Income.find({ userId: user._id, date: { $gte: threeMonthsAgo } }).sort({ date: -1 })
    ])
    
  
    const suggestions = await generateAISuggestions(transactions, incomes, period)
    
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
