import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import authRouter from './routes/auth.js'
import dashboardRouter from './routes/dashboard.js'
import expensesRouter from './routes/expenses.js'
import budgetRouter from './routes/budget.js'
import goalsRouter from './routes/goals.js'
import emotionsRouter from './routes/emotions.js'
import incomeRouter from './routes/income.js'
import transactionsRouter from './routes/transactions.js'
import debtsRouter from './routes/debts.js'
import aiRouter from './routes/ai.js'
import savingsRouter from './routes/savings.js'
import incomeOpportunitiesRouter from './routes/incomeOpportunities.js'
import emailParserRouter from './routes/emailParser.js'
import { errorHandler } from './middlewares/error.js'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

connectDB()

app.use('/api/auth', authRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/expenses', expensesRouter)
app.use('/api/budget', budgetRouter)
app.use('/api/goals', goalsRouter)
app.use('/api/emotions', emotionsRouter)
app.use('/api/income', incomeRouter)
app.use('/api/transactions', transactionsRouter)
app.use('/api/debts', debtsRouter)
app.use('/api/ai', aiRouter)
app.use('/api/savings', savingsRouter)
app.use('/api/income-opportunities', incomeOpportunitiesRouter)
app.use('/api/email-parser', emailParserRouter)

// Serve repo-root assets for images (logo.png, login2.png)
const repoRoot = path.join(__dirname, '../../')
app.use(express.static(repoRoot))

app.use(errorHandler)

const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`)
})
