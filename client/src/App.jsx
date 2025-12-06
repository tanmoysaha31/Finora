import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/login.jsx'
import Signup from './pages/Signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AddNewExpense from './pages/addnewexpense.jsx'
import SavingsGoals from './pages/SavingsGoals.jsx'
import EmotionalState from './pages/EmotionalState.jsx'
import BudgetPlanner from './pages/BudgetPlanner.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/addnewexpense" element={<AddNewExpense />} />
        <Route path="/goals" element={<SavingsGoals />} />
        <Route path="/emotional-state" element={<EmotionalState />} />
        <Route path="/budget" element={<BudgetPlanner />} />
      </Routes>
    </BrowserRouter>
  )
}
