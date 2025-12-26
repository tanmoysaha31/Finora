import express from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import User from '../models/User.js'
import Transaction from '../models/Transaction.js'
import Income from '../models/Income.js'
import Goal from '../models/Goal.js'
import Debt from '../models/Debt.js'

const router = express.Router()

// --- CONFIGURATION: Reliable Model List ---
// Prioritizes faster/cheaper models, falls back to legacy/pro if needed.
const ROBUST_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-1.0-pro',
  'gemini-pro',
  'gemini-flash-latest'
]

async function ensureUser(userId) {
  if (userId) return await User.findById(userId)
  const u = await User.findOne().sort({ createdAt: -1 })
  return u
}

/**
 * PRO HELPER: AI Generation with Automatic Fallback
 * Tries models sequentially until one succeeds.
 */
async function generateWithFallback(apiKey, prompt) {
  const genAI = new GoogleGenerativeAI(apiKey)
  let lastError = null

  for (const modelName of ROBUST_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text().trim()
      
      // If successful, return immediately
      return { text, model: modelName }
    } catch (error) {
      console.warn(`[AI Warning] Model ${modelName} failed: ${error.message}. Trying next...`)
      lastError = error
      continue // Try next model
    }
  }
  
  // If all models fail, throw the last error to be caught by the route handler
  throw lastError || new Error('All AI models failed to respond.')
}

// Rule-based fallback generator
function generateFallbackSuggestion(income, expenses, goals, debts) {
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0
  const activeGoals = goals.filter(g => g.current < g.target)
  
  if (activeGoals.length > 0) {
    const topGoal = activeGoals[0]
    const remaining = topGoal.target - topGoal.current
    
    if (savingsRate < 10) {
      return `Try cutting one non-essential expense to reach your ${topGoal.title} goal faster!`
    }
    if (income > expenses * 1.5) {
      return `Great surplus! Allocate 20% of your extra cash to ${topGoal.title} this week.`
    }
    return `You're $${remaining.toFixed(0)} away from your ${topGoal.title}. Keep pushing!`
  }
  
  if (debts > 0) {
    return `Focus on paying down your highest interest debt with any extra income.`
  }
  
  if (expenses > income) {
    return `Your expenses are higher than income. Review your recent transactions.`
  }
  
  return `Building a habit of saving 20% of every paycheck is the key to wealth.`
}

// Rule-based fallback for debt
function generateDebtFallback(totalDebt, monthlyIncome, monthlyPayment) {
  if (totalDebt === 0) return "You are debt free! Great job!"
  
  const months = monthlyPayment > 0 ? Math.ceil(totalDebt / monthlyPayment) : 0
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  
  let timeStr = ''
  if (years > 0) timeStr += `${years} year${years > 1 ? 's' : ''} `
  if (remainingMonths > 0) timeStr += `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`
  
  if (monthlyPayment < totalDebt * 0.02) {
    return `At this rate, it will take over ${timeStr} to be debt free. Try increasing your monthly payment.`
  }
  return `You're on track to be debt free in about ${timeStr}. Keep it up!`
}

router.get('/goal-booster', async (req, res, next) => {
  try {
    const { userId } = req.query
    const user = await ensureUser(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    // 1. Gather Data (Last 30 days)
    const now = new Date()
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))

    const [incomes, transactions, goals, debts] = await Promise.all([
      Income.find({ userId: user._id, date: { $gte: thirtyDaysAgo } }),
      Transaction.find({ userId: user._id, date: { $gte: thirtyDaysAgo } }),
      Goal.find({ userId: user._id, current: { $lt: 5000000 } }), // Active goals
      Debt.find({ userId: user._id })
    ])

    const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0)
    const totalExpenses = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    
    const totalDebt = debts.reduce((sum, d) => sum + Number(d.remaining), 0)
    
    const expenseCategories = {}
    transactions.filter(t => t.amount < 0).forEach(t => {
      const cat = t.category || 'Other'
      expenseCategories[cat] = (expenseCategories[cat] || 0) + Math.abs(t.amount)
    })
    const topCategories = Object.entries(expenseCategories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat)
      .join(', ')

    const goalNames = goals.map(g => g.title).join(', ')

    // 2. Try Gemini AI (Robust Fallback)
    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `
          Context: Financial app "Finora".
          User Data (Monthly):
          - Income: $${totalIncome}
          - Expenses: $${totalExpenses} (Top spent on: ${topCategories})
          - Goals: ${goalNames || 'None'}
          - Total Debt: $${totalDebt}
          
          Task: Give a single, short, specific, and motivating tip (max 25 words) to help the user achieve their goals or reduce debt based on this data. 
          Do not mention "Gemini" or "AI". Be direct and friendly.
        `

        // Uses the new helper function to cycle through models
        const { text, model } = await generateWithFallback(process.env.GEMINI_API_KEY, prompt)
        return res.json({ suggestion: text, source: `gemini (${model})` })

      } catch (aiError) {
        console.error('All AI models failed for goal-booster. Falling back to rules.')
        // Fallback continues below
      }
    }

    // 3. Fallback Logic
    const fallback = generateFallbackSuggestion(totalIncome, totalExpenses, goals, totalDebt)
    res.json({ suggestion: fallback, source: 'rule-based' })

  } catch (err) {
    next(err)
  }
})

// Income Advice Endpoint
router.get('/income-advice', async (req, res, next) => {
  try {
    const { userId } = req.query
    const user = await ensureUser(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const now = new Date()
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1)
    
    const incomes = await Income.find({ 
      userId: user._id, 
      date: { $gte: threeMonthsAgo } 
    }).sort({ date: -1 })

    const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0)
    const sources = [...new Set(incomes.map(i => i.source))]
    
    // AI Generation with graceful model fallback
    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `
          Context: Financial app "Finora".
          User Data (Last 3 months):
          - Total Income: $${totalIncome}
          - Sources: ${sources.join(', ') || 'None'}
          - Transaction Count: ${incomes.length}
          
          Task: Give a single, short, specific tip (max 25 words) to help the user increase their income stability or diversity.
          Be motivating.
        `

        const { text, model } = await generateWithFallback(process.env.GEMINI_API_KEY, prompt)
        return res.json({ suggestion: text, source: model })

      } catch (aiError) {
        console.error('All AI models failed for income-advice. Falling back to rules.')
      }
    }

    // Fallback
    if (sources.length < 2) return res.json({ suggestion: "Consider diversifying your income with a side hustle or freelance work." })
    return res.json({ suggestion: "Great job maintaining multiple income streams! Keep tracking every deposit." })

  } catch (err) {
    next(err)
  }
})

// Budget Advice Endpoint
router.get('/budget-advice', async (req, res, next) => {
  try {
    const { userId } = req.query
    const user = await ensureUser(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [transactions, incomes] = await Promise.all([
      Transaction.find({ userId: user._id, date: { $gte: startOfMonth }, amount: { $lt: 0 } }),
      Income.find({ userId: user._id, date: { $gte: startOfMonth } })
    ])

    const totalSpent = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0)

    // Top spending category
    const categories = {}
    transactions.forEach(t => {
      const c = t.category || 'Other'
      categories[c] = (categories[c] || 0) + Math.abs(t.amount)
    })
    const topCategory = Object.entries(categories).sort((a,b) => b[1]-a[1])[0]

    // AI Generation
    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `
          Context: Financial app "Finora".
          User Data (This Month):
          - Income: $${totalIncome}
          - Spent: $${totalSpent}
          - Top Expense: ${topCategory ? topCategory[0] + ' ($' + topCategory[1] + ')' : 'None'}
          
          Task: Give a single, short, actionable budget tip (max 25 words). 
          Focus on savings rate or cutting the top expense.
        `

        const { text, model } = await generateWithFallback(process.env.GEMINI_API_KEY, prompt)
        return res.json({ suggestion: text, source: `gemini (${model})` })

      } catch (aiError) {
        console.error('All AI models failed for budget-advice. Falling back to rules.')
      }
    }

    // Fallback
    if (totalSpent > totalIncome) return res.json({ suggestion: "You've spent more than you earned this month. Review your non-essential spending." })
    if (topCategory) return res.json({ suggestion: `Try to reduce your spending on ${topCategory[0]} next week.` })
    return res.json({ suggestion: "You're staying within your means. Consider allocating more to savings." })

  } catch (err) {
    next(err)
  }
})

router.get('/debt-advice', async (req, res, next) => {
  try {
    const { userId } = req.query
    const user = await ensureUser(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const [incomes, debts] = await Promise.all([
      Income.find({ userId: user._id }),
      Debt.find({ userId: user._id })
    ])

    const totalDebt = debts.reduce((sum, d) => sum + Number(d.remaining), 0)
    const monthlyPayment = debts.reduce((sum, d) => sum + Number(d.minPayment), 0)
    
    // Calculate average monthly income
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthlyIncome = incomes
      .filter(i => new Date(i.date) >= startOfMonth)
      .reduce((sum, i) => sum + Number(i.amount), 0)

    // Calculate projection mathematically
    let projectedDate = null
    if (monthlyPayment > 0 && totalDebt > 0) {
      const months = Math.ceil(totalDebt / monthlyPayment)
      const d = new Date()
      d.setMonth(d.getMonth() + months)
      projectedDate = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }

    // AI Generation
    if (process.env.GEMINI_API_KEY) {
      try {
        const debtDetails = debts.map(d =>   
          `- ${d.lender}: $${d.remaining} (APR: ${d.interestRate}%, Min: $${d.minPayment})`
        ).join('\n')

        const prompt = `
          Context: Financial app "Finora".
          User Data:
          - Monthly Income: $${monthlyIncome}
          - Current Monthly Debt Payments: $${monthlyPayment}
          - Individual Debts:
          ${debtDetails}
          
          Task: 
          1. Calculate a realistic debt-free date (Month Year) considering the interest rates and balances.
          2. Provide a single short sentence (max 25 words) of advice, referencing specific debts if helpful (e.g. "Pay off Chase first...").
          
          Output format JSON: { "projection": "Month Year", "advice": "Your advice here" }
        `

        const { text, model } = await generateWithFallback(process.env.GEMINI_API_KEY, prompt)
        const cleanText = text.replace(/```json|```/g, '').trim()
        const json = JSON.parse(cleanText)
        
        return res.json({ 
          projection: json.projection || projectedDate, 
          advice: json.advice, 
          source: `gemini (${model})` 
        })
      } catch (aiError) {
        console.error('All AI models failed for debt-advice. Falling back to rules.')
      }
    }

    // Fallback
    const fallbackAdvice = generateDebtFallback(totalDebt, monthlyIncome, monthlyPayment)
    res.json({ 
      projection: projectedDate || 'Unknown', 
      advice: fallbackAdvice, 
      source: 'rule-based' 
    })

  } catch (err) {
    next(err)
  }
})

// Predictive Scenarios Endpoint
router.post('/predict', async (req, res, next) => {
  try {
    const { userId, query } = req.body
    if (!query) return res.status(400).json({ error: 'Query is required' })

    const user = await ensureUser(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    // 1. Gather comprehensive context
    const [incomes, transactions, goals, debts] = await Promise.all([
      Income.find({ userId: user._id }),
      Transaction.find({ userId: user._id }).sort({ date: -1 }).limit(50), // Last 50 transactions
      Goal.find({ userId: user._id }),
      Debt.find({ userId: user._id })
    ])

    // Calculate Summaries
    const totalDebt = debts.reduce((sum, d) => sum + Number(d.remaining), 0)
    const monthlyDebtPayments = debts.reduce((sum, d) => sum + Number(d.minPayment), 0)
    
    // Average Monthly Income (simplified)
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const monthlyIncome = incomes
      .filter(i => new Date(i.date) >= lastMonth) // Rough estimate using recent income
      .reduce((sum, i) => sum + Number(i.amount), 0) || 
      incomes.reduce((sum, i) => sum + Number(i.amount), 0) / (incomes.length || 1) // Fallback to average

    // Average Monthly Expenses
    const monthlyExpenses = transactions
      .filter(t => t.amount < 0 && new Date(t.date) >= lastMonth)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const goalDetails = goals.map(g => `${g.title} (Target: ${g.target}, Saved: ${g.current})`).join(', ')
    const debtDetails = debts.map(d => `${d.lender} ($${d.remaining} @ ${d.interestRate}%)`).join(', ')

    // 2. Gemini Generation with Fallback
    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `
          You are an expert financial advisor AI for the app "Finora".
          
          User Financial Profile:
          - Est. Monthly Income: $${monthlyIncome.toFixed(2)}
          - Est. Monthly Expenses: $${monthlyExpenses.toFixed(2)}
          - Total Debt: $${totalDebt.toFixed(2)} (Breakdown: ${debtDetails || 'None'})
          - Goals: ${goalDetails || 'None'}
          
          User Question/Scenario: "${query}"
          
          Task: Analyze the scenario based on the user's profile. Predict the outcome or impact.
          
          Guidelines:
          - Be specific with numbers where possible.
          - If the user asks "What if I save X more", calculate the impact on goals/debt.
          - If the user asks "What if I pay off X debt", calculate interest savings or timeline changes.
          - Keep the tone encouraging but realistic.
          - Limit response to 3-4 clear sentences.
          - Do not use markdown formatting (bold/italic), just plain text.
        `

        const { text, model } = await generateWithFallback(process.env.GEMINI_API_KEY, prompt)
        return res.json({ prediction: text, source: `gemini (${model})` })

      } catch (aiError) {
        console.error('All AI models failed for predict. Returning 503.')
        return res.status(503).json({ error: 'AI Service temporarily unavailable', details: aiError.message })
      }
    } else {
      return res.status(503).json({ error: 'AI Service not configured' })
    }

  } catch (err) {
    next(err)
  }
})

export default router