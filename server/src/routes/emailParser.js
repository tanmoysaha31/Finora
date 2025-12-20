import express from 'express'
import User from '../models/User.js'
import Transaction from '../models/Transaction.js'

const router = express.Router()

// Email patterns for different providers
const EMAIL_PATTERNS = {
  bkash: {
    patterns: [
      /BDT\s*([\d,]+\.?\d*)\s*.*?(\d{1,2}\/\d{1,2}\/\d{4})/i,
      /Tk\s*([\d,]+\.?\d*)\s*.*?(\d{1,2}-\d{1,2}-\d{4})/i,
      /amount.*?BDT\s*([\d,]+\.?\d*)/i
    ],
    categories: {
      'cash out': 'Utility',
      'payment': 'Shopping',
      'mobile recharge': 'Utility',
      'bill pay': 'Utility',
      'send money': 'Others'
    }
  },
  nagad: {
    patterns: [
      /৳\s*([\d,]+\.?\d*)\s*.*?(\d{1,2}\/\d{1,2}\/\d{4})/i,
      /BDT\s*([\d,]+\.?\d*)\s*.*?(\d{1,2}-\d{1,2}-\d{4})/i,
      /amount.*?৳\s*([\d,]+\.?\d*)/i
    ],
    categories: {
      'cash out': 'Utility',
      'payment': 'Shopping',
      'mobile recharge': 'Utility',
      'bill': 'Utility',
      'send': 'Others'
    }
  },
  bank: {
    patterns: [
      /amount.*?BDT\s*([\d,]+\.?\d*)\s*.*?(\d{1,2}\/\d{1,2}\/\d{4})/i,
      /TK\s*([\d,]+\.?\d*)\s*.*?(\d{1,2}-\d{1,2}-\d{4})/i,
      /debit.*?BDT\s*([\d,]+\.?\d*)/i,
      /credit.*?BDT\s*([\d,]+\.?\d*)/i
    ],
    categories: {
      'atm': 'Utility',
      'pos': 'Shopping',
      'online': 'Shopping',
      'transfer': 'Others',
      'bill': 'Utility',
      'merchant': 'Shopping'
    }
  }
}

// Parse email content and extract transaction
function parseEmailTransaction(emailContent, provider = 'bkash') {
  const patterns = EMAIL_PATTERNS[provider]?.patterns || EMAIL_PATTERNS.bkash.patterns
  const categories = EMAIL_PATTERNS[provider]?.categories || EMAIL_PATTERNS.bkash.categories

  let amount = null
  let date = null
  let category = 'Others'
  let title = `${provider} Transaction`

  // Extract amount
  for (const pattern of patterns) {
    const match = emailContent.match(pattern)
    if (match) {
      if (match[1]) {
        amount = parseFloat(match[1].replace(/,/g, ''))
      }
      if (match[2]) {
        date = parseDate(match[2])
      }
      break
    }
  }

  // Detect category from content
  const lowerContent = emailContent.toLowerCase()
  for (const [keyword, cat] of Object.entries(categories)) {
    if (lowerContent.includes(keyword)) {
      category = cat
      title = `${provider} ${keyword}`
      break
    }
  }

  // Extract merchant/recipient name
  const merchantMatch = emailContent.match(/(?:to|from|merchant|recipient)[\s:]+([\w\s]+?)(?:\s|<|$)/i)
  if (merchantMatch && merchantMatch[1]) {
    title = `${provider} - ${merchantMatch[1].trim()}`
  }

  return {
    amount: amount ? -Math.abs(amount) : null, // Negative for expense
    date: date || new Date(),
    category,
    title,
    paymentMethod: provider,
    source: 'email-auto'
  }
}

// Parse date from various formats
function parseDate(dateStr) {
  // Try DD/MM/YYYY
  let match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (match) {
    return new Date(match[3], match[2] - 1, match[1])
  }

  // Try DD-MM-YYYY
  match = dateStr.match(/(\d{1,2})-(\d{1,2})-(\d{4})/)
  if (match) {
    return new Date(match[3], match[2] - 1, match[1])
  }

  return new Date()
}

// POST: Process email notification
router.post('/process', async (req, res, next) => {
  try {
    const { userId, emailSubject, emailBody, provider = 'bkash' } = req.body

    if (!userId || !emailBody) {
      return res.status(400).json({ error: 'userId and emailBody are required' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (!user.emailIntegrationEnabled) {
      return res.status(403).json({ error: 'Email integration not enabled for this user' })
    }

    // Parse transaction from email
    const fullContent = `${emailSubject || ''} ${emailBody}`
    const transactionData = parseEmailTransaction(fullContent, provider)

    if (!transactionData.amount) {
      return res.status(400).json({ error: 'Could not extract transaction amount from email' })
    }

    // Create transaction
    const transaction = await Transaction.create({
      userId: user._id,
      ...transactionData,
      note: 'Auto-imported from email'
    })

    // Update last sync time
    user.lastEmailSync = new Date()
    await user.save()

    res.json({
      message: 'Transaction processed successfully',
      transaction: {
        id: transaction._id,
        title: transaction.title,
        amount: transaction.amount,
        category: transaction.category,
        date: transaction.date
      }
    })
  } catch (err) {
    next(err)
  }
})

// POST: Enable/disable email integration
router.post('/toggle', async (req, res, next) => {
  try {
    const { userId, enabled, provider = 'gmail' } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    user.emailIntegrationEnabled = enabled
    user.emailProvider = provider
    await user.save()

    res.json({
      message: `Email integration ${enabled ? 'enabled' : 'disabled'}`,
      integration: {
        enabled: user.emailIntegrationEnabled,
        provider: user.emailProvider
      }
    })
  } catch (err) {
    next(err)
  }
})

// GET: Test email parsing
router.post('/test-parse', async (req, res, next) => {
  try {
    const { emailContent, provider = 'bkash' } = req.body

    if (!emailContent) {
      return res.status(400).json({ error: 'emailContent is required' })
    }

    const parsed = parseEmailTransaction(emailContent, provider)

    res.json({
      parsed,
      example: {
        bkash: 'BDT 500 sent to Merchant ABC on 12/18/2025',
        nagad: '৳ 300 payment to Shop XYZ on 18-12-2025',
        bank: 'Debit of BDT 1000 from your account on 18/12/2025'
      }
    })
  } catch (err) {
    next(err)
  }
})

export default router
