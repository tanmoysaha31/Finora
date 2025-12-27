import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/login.jsx'
import Signup from './pages/Signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AddNewExpense from './pages/addnewexpense.jsx'
import BudgetPlanner from './pages/BudgetPlanner.jsx'
import EmotionalState from './pages/EmotionalState.jsx'
import SavingsGoals from './pages/SavingsGoals.jsx'
import Income from './pages/Income.jsx'
import Transactions from './pages/Transactions.jsx'
import DebtTracker from './pages/DebtTracker.jsx'
import FinancialPersonalityQuiz from './pages/FinancialPersonalityQuiz.jsx'
import IncomeSources from './pages/IncomeSources.jsx'
import IncomeOpportunities from './pages/IncomeOpportunities.jsx'
import FinanceKnowledge from './pages/FinanceKnowledge.jsx'
import Bills from './pages/Bills.jsx'
import Profile from './pages/profile.jsx'
import Notifications from './pages/Notifications.jsx'
import PredictiveScenarios from './pages/PredictiveScenarios.jsx'
import AutoExpense from './pages/AutoExpense.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/account" element={<Profile />} />
        <Route path="/settings" element={<Profile />} />
        <Route path="/addnewexpense" element={<AddNewExpense />} />
        <Route path="/add-expense" element={<AddNewExpense />} />
        <Route path="/budget" element={<BudgetPlanner />} />
        <Route path="/emotional-state" element={<EmotionalState />} />
        <Route path="/emotional-state/:id" element={<EmotionalState />} />
        <Route path="/goals" element={<SavingsGoals />} />
        <Route path="/income" element={<Income />} />
        <Route path="/debt" element={<DebtTracker />} />
        <Route path="/quiz" element={<FinancialPersonalityQuiz />} />
        <Route path="/income-sources" element={<IncomeSources />} />
        <Route path="/income-opportunities" element={<IncomeOpportunities />} />
        <Route path="/finance-knowledge" element={<FinanceKnowledge />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/bills" element={<Bills />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/predict" element={<PredictiveScenarios />} />
        <Route path="/auto-expense" element={<AutoExpense />} />
      </Routes>
    </BrowserRouter>
  )
}
