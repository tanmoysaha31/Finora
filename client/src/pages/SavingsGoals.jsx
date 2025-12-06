import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function SavingsGoals() {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalStep, setModalStep] = useState(1)
  const [dashboardStats, setDashboardStats] = useState({ totalSaved: 0, totalTarget: 0, overallProgress: 0 })
  const [newGoal, setNewGoal] = useState({ type: '', title: '', targetAmount: '', savedAmount: '', deadline: '', icon: '' })
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  useEffect(() => {
    const loadGoals = async () => {
      try {
        setLoading(true)
        let userId = null
        try { userId = localStorage.getItem('finora_user_id') } catch (_) {}
        const url = userId ? `${API_BASE}/api/goals?userId=${encodeURIComponent(userId)}` : `${API_BASE}/api/goals`
        const res = await fetch(url)
        const payload = await res.json()
        if (!res.ok || !payload?.goals) throw new Error(payload?.error || 'Failed to load goals')
        setGoals(payload.goals)
        calculateStats(payload.goals)
      } catch (_) {
        setGoals([])
        calculateStats([])
      } finally {
        setLoading(false)
      }
    }
    loadGoals()
  }, [])

  const calculateStats = (data) => {
    const saved = data.reduce((acc, curr) => acc + Number(curr.savedAmount), 0)
    const target = data.reduce((acc, curr) => acc + Number(curr.targetAmount), 0)
    const progress = target > 0 ? (saved / target) * 100 : 0
    setDashboardStats({ totalSaved: saved, totalTarget: target, overallProgress: progress })
  }

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
  const calculateDaysLeft = (dateStr) => {
    const diff = new Date(dateStr) - new Date()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? `${days} days left` : 'Overdue'
  }
  const calculateMonthlyNeed = (target, saved, deadline) => {
    if (!target || !deadline) return 0
    const months = (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24 * 30)
    if (months <= 0) return 0
    const remaining = target - (saved || 0)
    return remaining / months
  }

  const getGoalStyle = (type) => {
    switch (type) {
      case 'wedding': return { gradient: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-500/20', icon: 'fa-ring' }
      case 'hajj': return { gradient: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20', icon: 'fa-kaaba' }
      case 'education': return { gradient: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/20', icon: 'fa-graduation-cap' }
      case 'emergency': return { gradient: 'from-red-500 to-orange-500', shadow: 'shadow-red-500/20', icon: 'fa-truck-medical' }
      default: return { gradient: 'from-purple-500 to-indigo-500', shadow: 'shadow-purple-500/20', icon: 'fa-star' }
    }
  }

  const selectType = (type, title) => {
    const style = getGoalStyle(type)
    setNewGoal({ ...newGoal, type, title, icon: style.icon })
    setModalStep(2)
  }

  const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #1a1a1a; color: white; }
    h1, h2, h3, h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
    .glass-panel { background: rgba(36, 36, 36, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); }
    .glass-modal { background: rgba(26, 26, 26, 0.95); backdrop-filter: blur(20px); }
    .bg-blob { position: fixed; border-radius: 50%; filter: blur(100px); opacity: 0.15; z-index: -1; pointer-events: none; }
    .blob-1 { top: -10%; left: -10%; width: 600px; height: 600px; background: #7c3aed; animation: float 20s infinite alternate; }
    .blob-2 { bottom: -10%; right: -10%; width: 500px; height: 500px; background: #2563eb; animation: float 25s infinite alternate-reverse; }
    @keyframes float { 0% { transform: translate(0, 0); } 100% { transform: translate(40px, -40px); } }
  `

  return (
    <div className="flex h-screen w-screen antialiased overflow-hidden text-white bg-[#1a1a1a]">
      <style>{customStyles}</style>
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <aside className={`w-72 flex-shrink-0 lg:flex flex-col justify-between p-6 border-r border-white/5 bg-[#1a1a1a]/95 backdrop-blur-xl fixed h-full z-40 transition-all duration-300 ${mobileOpen ? 'flex' : 'hidden'}`}>
        <div>
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/20">
              <i className="fa-solid fa-bolt"></i>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">Finora</span>
          </div>
          <nav className="space-y-1">
            <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
              <i className="fa-solid fa-grid-2 w-5 text-center"></i> <span>Dashboard</span>
            </Link>
            <Link to="/goals" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/10 text-white font-medium border-l-4 border-purple-500 shadow-inner">
              <i className="fa-solid fa-bullseye w-5 text-center text-purple-400"></i> <span>Savings Goals</span>
            </Link>
            <Link to="/transactions" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
              <i className="fa-solid fa-clock-rotate-left w-5 text-center"></i> <span>Transactions</span>
            </Link>
          </nav>
        </div>
      </aside>
      <div className="flex-1 lg:ml-72 flex flex-col h-full relative z-10">
        <header className="flex-shrink-0 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#1a1a1a]/80 backdrop-blur-md sticky top-0 z-20 border-b border-white/5">
          <div className="w-full md:w-auto flex items-center justify-between">
            <div className="md:hidden flex items-center gap-2">
                <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-white hover:bg-white/10 rounded-lg"><i className="fa-solid fa-bars"></i></button>
                <span className="font-bold">Finora</span>
            </div>
            <div className="hidden md:block">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1"><span>Home</span> <i className="fa-solid fa-chevron-right text-[8px]"></i> <span className="text-purple-400">Saving Goals</span></div>
                <h1 className="text-2xl font-bold">My Saving Goals</h1>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/20"><i className="fa-solid fa-plus"></i> <span>New Goal</span></button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 p-[2px] cursor-pointer"><img src="https://cdn-icons-png.flaticon.com/512/2922/2922510.png" alt="User" className="w-full h-full rounded-full object-cover border-2 border-[#1a1a1a]" /></div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-panel rounded-2xl p-4"><p className="text-xs text-gray-400">Total Saved</p><h3 className="text-2xl font-bold">{formatCurrency(dashboardStats.totalSaved)}</h3></div>
              <div className="glass-panel rounded-2xl p-4"><p className="text-xs text-gray-400">Total Target</p><h3 className="text-2xl font-bold">{formatCurrency(dashboardStats.totalTarget)}</h3></div>
              <div className="glass-panel rounded-2xl p-4"><p className="text-xs text-gray-400">Overall Progress</p><div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-2"><div className="h-full bg-purple-500" style={{ width: `${Math.min(dashboardStats.overallProgress, 100)}%` }}></div></div></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {goals.map(goal => (
                <div key={goal.id} className="glass-panel rounded-2xl p-4 hover:translate-y-[-2px] transition-transform">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center"><i className={`fa-solid ${goal.icon}`}></i></div><div><h4 className="font-bold">{goal.title}</h4><p className="text-xs text-gray-500">{calculateDaysLeft(goal.deadline)}</p></div></div>
                    <span className="text-sm">{formatCurrency(goal.savedAmount)} / {formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-3"><div className="h-full bg-white/30" style={{ width: `${Math.min((goal.savedAmount/goal.targetAmount)*100, 100)}%` }}></div></div>
                  <p className="text-[10px] text-gray-500 mt-2">Monthly need: {formatCurrency(calculateMonthlyNeed(goal.targetAmount, goal.savedAmount, goal.deadline))}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
