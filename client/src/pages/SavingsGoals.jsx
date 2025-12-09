import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function SavingsGoals() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  
  // --- STATE MANAGEMENT ---
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({ totalSaved: 0, totalTarget: 0, overallProgress: 0 });

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [newGoal, setNewGoal] = useState({ type: '', title: '', targetAmount: '', savedAmount: '', deadline: '', icon: '' });

  // Add Funds Modal State
  const [showFundModal, setShowFundModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');

  useEffect(() => {
    (async () => {
      try {
        let userId = null
        try { userId = localStorage.getItem('finora_user_id') } catch (_) {}
        const url = userId ? `${API_BASE}/api/goals?userId=${encodeURIComponent(userId)}` : `${API_BASE}/api/goals`
        const r = await fetch(url)
        const d = await r.json()
        const arr = Array.isArray(d?.goals) ? d.goals : []
        setGoals(arr)
        calculateStats(arr)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // --- HELPERS ---
  const calculateStats = (data) => {
    const saved = data.reduce((acc, curr) => acc + Number(curr.savedAmount), 0);
    const target = data.reduce((acc, curr) => acc + Number(curr.targetAmount), 0);
    const progress = target > 0 ? (saved / target) * 100 : 0;
    setDashboardStats({ totalSaved: saved, totalTarget: target, overallProgress: progress });
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  
  const calculateDaysLeft = (dateStr) => {
    const diff = new Date(dateStr) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days left` : 'Overdue';
  };

  const calculateMonthlyNeed = (target, saved, deadline) => {
    if (!target || !deadline) return 0;
    const months = (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24 * 30);
    if (months <= 0) return 0;
    const remaining = target - (saved || 0);
    return remaining / months;
  };

  const getGoalStyle = (type) => {
    switch (type) {
      case 'wedding': return { gradient: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-500/20', icon: 'fa-ring', bg: 'bg-pink-500' };
      case 'Religion': return { gradient: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20', icon: 'fa-kaaba', bg: 'bg-emerald-500' };
      case 'education': return { gradient: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/20', icon: 'fa-graduation-cap', bg: 'bg-blue-500' };
      case 'emergency': return { gradient: 'from-red-500 to-orange-500', shadow: 'shadow-red-500/20', icon: 'fa-truck-medical', bg: 'bg-red-500' };
      default: return { gradient: 'from-purple-500 to-indigo-500', shadow: 'shadow-purple-500/20', icon: 'fa-star', bg: 'bg-purple-500' };
    }
  };

  // --- HANDLERS: CREATE GOAL ---
  const handleCreateGoal = async (e) => {
    e.preventDefault()
    const style = getGoalStyle(newGoal.type)
    const payload = {
      title: newGoal.title,
      targetAmount: Number(newGoal.targetAmount),
      savedAmount: Number(newGoal.savedAmount) || 0,
      deadline: newGoal.deadline,
      icon: style.icon,
      type: newGoal.type,
      color: style.gradient,
      shadow: style.shadow
    }
    try {
      let userId = null
      try { userId = localStorage.getItem('finora_user_id') } catch (_) {}
      const r = await fetch(`${API_BASE}/api/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, userId })
      })
      if (!r.ok) throw new Error('Failed to create goal')
      const url = userId ? `${API_BASE}/api/goals?userId=${encodeURIComponent(userId)}` : `${API_BASE}/api/goals`
      const rr = await fetch(url)
      const d = await rr.json()
      const arr = Array.isArray(d?.goals) ? d.goals : []
      setGoals(arr)
      calculateStats(arr)
    } finally {
      setShowCreateModal(false)
      setModalStep(1)
      setNewGoal({ type: '', title: '', targetAmount: '', savedAmount: '', deadline: '', icon: '' })
    }
  }

  const selectType = (type, title) => {
    const style = getGoalStyle(type);
    setNewGoal({ ...newGoal, type, title, icon: style.icon });
    setModalStep(2);
  };

  // --- HANDLERS: ADD FUNDS ---
  const openFundModal = (goal) => {
    setSelectedGoal(goal);
    setDepositAmount(''); // Reset input
    setShowFundModal(true);
  };

  const handleDeleteGoal = async (id) => {
    try {
      const r = await fetch(`${API_BASE}/api/goals/${id}`, { method: 'DELETE' })
      if (!r.ok) return
      let userId = null
      try { userId = localStorage.getItem('finora_user_id') } catch (_) {}
      const url = userId ? `${API_BASE}/api/goals?userId=${encodeURIComponent(userId)}` : `${API_BASE}/api/goals`
      const rr = await fetch(url)
      const d = await rr.json()
      const arr = Array.isArray(d?.goals) ? d.goals : []
      setGoals(arr)
      calculateStats(arr)
    } catch (_) {}
  }

  const handleDeposit = async () => {
    if (!selectedGoal || !depositAmount) return
    const amount = parseFloat(depositAmount)
    if (isNaN(amount) || amount <= 0) return
    try {
      let userId = null
      try { userId = localStorage.getItem('finora_user_id') } catch (_) {}
      const r = await fetch(`${API_BASE}/api/goals/${selectedGoal.id}/fund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, userId })
      })
      if (!r.ok) throw new Error('Failed to fund goal')
      const url = userId ? `${API_BASE}/api/goals?userId=${encodeURIComponent(userId)}` : `${API_BASE}/api/goals`
      const rr = await fetch(url)
      const d = await rr.json()
      const arr = Array.isArray(d?.goals) ? d.goals : []
      setGoals(arr)
      calculateStats(arr)
    } finally {
      setShowFundModal(false)
      setSelectedGoal(null)
      setDepositAmount('')
    }
  }

  const addPresetAmount = (amount) => {
    const current = parseFloat(depositAmount) || 0;
    setDepositAmount((current + amount).toString());
  };

  // --- STYLES ---
  const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #1a1a1a; color: white; }
    h1, h2, h3, h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
    .glass-panel { background: rgba(36, 36, 36, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3); }
    .glass-modal { background: rgba(20, 20, 25, 0.95); backdrop-filter: blur(20px); }
    .hover-lift { transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); } .hover-lift:hover { transform: translateY(-4px); }
    .bg-blob { position: fixed; border-radius: 50%; filter: blur(100px); opacity: 0.15; z-index: -1; pointer-events: none; }
    .progress-bar-striped { background-image: linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent); background-size: 1rem 1rem; }
    .glass-input { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: white; transition: all 0.2s; }
    .glass-input:focus { border-color: #8b5cf6; background: rgba(0,0,0,0.5); outline: none; }
  `;

  return (
    <div className="flex h-screen w-screen antialiased overflow-hidden text-white bg-[#1a1a1a]">
      <style>{customStyles}</style>
      <div className="bg-blob top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20"></div>
      <div className="bg-blob bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20"></div>

      {/* --- SIDEBAR --- */}
      <aside className={`w-72 flex-shrink-0 lg:flex flex-col justify-between p-6 border-r border-white/5 bg-[#1a1a1a]/95 backdrop-blur-xl fixed h-full z-40 transition-all duration-300 ${mobileOpen ? 'flex' : 'hidden'}`}>
        <div>
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
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

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 lg:ml-72 flex flex-col h-full relative z-10">
        
        {/* Header */}
        <header className="flex-shrink-0 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#1a1a1a]/80 backdrop-blur-md sticky top-0 z-20 border-b border-white/5">
          <div className="w-full md:w-auto flex items-center justify-between">
            <div className="md:hidden flex items-center gap-2">
                <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-white hover:bg-white/10 rounded-lg"><i className="fa-solid fa-bars"></i></button>
                <span className="font-bold">Finora</span>
            </div>
            <div className="hidden md:block">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <span>Home</span> <i className="fa-solid fa-chevron-right text-[8px]"></i> <span className="text-purple-400">Saving Goals</span>
                </div>
                <h1 className="text-2xl font-bold">My Saving Goals</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/20 hover-lift">
                <i className="fa-solid fa-plus"></i> <span>New Goal</span>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 p-[2px] cursor-pointer">
               <img src="https://cdn-icons-png.flaticon.com/512/2922/2922510.png" alt="User" className="w-full h-full rounded-full object-cover border-2 border-[#1a1a1a]" />
            </div>
          </div>
        </header>

        {/* Dashboard Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scroll">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* 1. Overview Banner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><i className="fa-solid fa-vault text-6xl"></i></div>
                        <p className="text-gray-400 text-sm font-medium">Total Saved</p>
                        <h2 className="text-3xl font-bold mt-1">{formatCurrency(dashboardStats.totalSaved)}</h2>
                        <div className="mt-4 text-xs text-green-400 flex items-center gap-1">
                            <i className="fa-solid fa-arrow-trend-up"></i> +12% this month
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><i className="fa-solid fa-bullseye text-6xl"></i></div>
                        <p className="text-gray-400 text-sm font-medium">Total Target</p>
                        <h2 className="text-3xl font-bold mt-1">{formatCurrency(dashboardStats.totalTarget)}</h2>
                        <div className="mt-4 text-xs text-gray-400">Across {goals.length} active goals</div>
                    </div>

                    <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
                        <p className="text-gray-400 text-sm font-medium mb-2">Overall Completion</p>
                        <div className="flex items-end gap-2 mb-2">
                            <h2 className="text-3xl font-bold">{dashboardStats.overallProgress.toFixed(1)}%</h2>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                             <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full" style={{ width: `${dashboardStats.overallProgress}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* 2. Goal Cards Grid */}
                <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        Active Goals <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-gray-300">{goals.length}</span>
                    </h3>
                    
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1,2,3].map(i => <div key={i} className="h-64 bg-[#242424] rounded-3xl animate-pulse"></div>)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {goals.map((goal) => {
                                const percent = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
                                const isCompleted = percent >= 100;
                                
                                return (
                                    <div key={goal.id} className="glass-panel rounded-3xl p-6 hover-lift relative group overflow-hidden flex flex-col justify-between h-full">
                                        {/* Header */}
                                        <div className="flex justify-between items-start mb-6 z-10">
                                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${goal.color} flex items-center justify-center text-white text-2xl shadow-lg ${goal.shadow}`}>
                                                <i className={`fa-solid ${goal.icon}`}></i>
                                            </div>
                                            <div className="flex gap-2">
                                                 <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 transition-colors">
                                                    <i className="fa-solid fa-pencil text-xs"></i>
                                                </button>
                                                <button onClick={() => handleDeleteGoal(goal.id)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-gray-400 transition-colors">
                                                    <i className="fa-solid fa-trash text-xs"></i>
                                                </button>
                                             </div>
                                        </div>

                                        {/* Content */}
                                        <div className="z-10">
                                            <h4 className="text-xl font-bold truncate">{goal.title}</h4>
                                            <p className="text-sm text-gray-400 mb-4">{calculateDaysLeft(goal.deadline)}</p>

                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-2xl font-bold text-white">{formatCurrency(goal.savedAmount)}</span>
                                                <span className="text-xs text-gray-400 font-medium">of {formatCurrency(goal.targetAmount)}</span>
                                            </div>

                                            <div className="w-full bg-gray-700/50 rounded-full h-3 mb-2 overflow-hidden">
                                                <div className={`h-full rounded-full bg-gradient-to-r ${goal.color} transition-all duration-1000 ease-out progress-bar-striped`} style={{ width: `${percent}%` }}></div>
                                            </div>
                                            
                                            <div className="flex justify-between text-xs font-medium">
                                                <span className={isCompleted ? "text-green-400" : "text-purple-300"}>{percent.toFixed(0)}% Completed</span>
                                                {isCompleted && <span className="flex items-center gap-1 text-green-400"><i className="fa-solid fa-check-circle"></i> Done</span>}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-6 pt-4 border-t border-white/5 flex gap-2 z-10">
                                            <button className="flex-1 bg-white/5 hover:bg-white/10 py-2.5 rounded-xl text-sm font-medium transition-colors border border-white/5">
                                                History
                                            </button>
                                            <button 
                                                onClick={() => openFundModal(goal)}
                                                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg ${isCompleted ? 'bg-gray-700 cursor-not-allowed text-gray-400' : 'bg-white text-black hover:bg-gray-100'}`} disabled={isCompleted}>
                                                + Add Funds
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {/* Create New Card */}
                            <button onClick={() => setShowCreateModal(true)} className="rounded-3xl border-2 border-dashed border-white/10 hover:border-purple-500/50 hover:bg-white/5 transition-all p-6 flex flex-col items-center justify-center gap-4 text-gray-500 hover:text-white group h-full min-h-[300px]">
                                <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-purple-500 group-hover:text-white flex items-center justify-center transition-all text-2xl">
                                    <i className="fa-solid fa-plus"></i>
                                </div>
                                <span className="font-medium">Create New Goal</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </main>
      </div>

      {/* --- 1. CREATE GOAL MODAL (WIZARD) --- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
            <div className="relative w-full max-w-lg glass-modal rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold">Create New Goal</h3>
                        <p className="text-xs text-gray-400">Step {modalStep} of 3</p>
                    </div>
                    <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-xmark text-xl"></i></button>
                </div>
                <div className="p-6 overflow-y-auto custom-scroll">
                    {modalStep === 1 && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-300">What are you saving for?</p>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'wedding', label: 'Wedding', icon: 'fa-ring', color: 'bg-pink-500' },
                                    { id: 'Religion', label: 'Religion', icon: 'fa-kaaba', color: 'bg-emerald-500' },
                                    { id: 'education', label: 'Education', icon: 'fa-graduation-cap', color: 'bg-blue-500' },
                                    { id: 'emergency', label: 'Emergency', icon: 'fa-truck-medical', color: 'bg-red-500' },
                                    { id: 'tech', label: 'Gadget / Tech', icon: 'fa-laptop', color: 'bg-indigo-500' },
                                    { id: 'custom', label: 'Custom Goal', icon: 'fa-star', color: 'bg-gray-600' },
                                ].map(type => (
                                    <button key={type.id} onClick={() => selectType(type.id, type.label)} className="flex flex-col items-center gap-3 p-4 rounded-xl border border-white/10 hover:bg-white/5 hover:border-purple-500 transition-all group">
                                        <div className={`w-12 h-12 rounded-full ${type.color} bg-opacity-20 flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                                            <i className={`fa-solid ${type.icon}`}></i>
                                        </div>
                                        <span className="font-medium text-sm">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {modalStep === 2 && (
                        <div className="space-y-4">
                            <div><label className="block text-xs font-medium text-gray-400 mb-1">Goal Name</label><input type="text" value={newGoal.title} onChange={(e) => setNewGoal({...newGoal, title: e.target.value})} className="w-full glass-input rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-medium text-gray-400 mb-1">Target ($)</label><input type="number" value={newGoal.targetAmount} onChange={(e) => setNewGoal({...newGoal, targetAmount: e.target.value})} className="w-full glass-input rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" placeholder="5000" /></div>
                                <div><label className="block text-xs font-medium text-gray-400 mb-1">Saved ($)</label><input type="number" value={newGoal.savedAmount} onChange={(e) => setNewGoal({...newGoal, savedAmount: e.target.value})} className="w-full glass-input rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" placeholder="0" /></div>
                            </div>
                            <div><label className="block text-xs font-medium text-gray-400 mb-1">Deadline</label><input type="date" value={newGoal.deadline} onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})} className="w-full glass-input rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" /></div>
                        </div>
                    )}
                    {modalStep === 3 && (
                        <div className="text-center space-y-6">
                            <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${getGoalStyle(newGoal.type).gradient} flex items-center justify-center text-3xl shadow-xl`}><i className={`fa-solid ${newGoal.icon}`}></i></div>
                            <div><h2 className="text-2xl font-bold">{newGoal.title}</h2><p className="text-gray-400">Target: {formatCurrency(newGoal.targetAmount)} by {new Date(newGoal.deadline).toLocaleDateString()}</p></div>
                            <div className="bg-white/5 rounded-xl p-4 text-left border border-white/10"><h4 className="text-sm font-bold text-gray-300 mb-2">Recommendation</h4><div className="flex justify-between items-center"><span className="text-xs text-gray-400">Monthly Saving Needed:</span><span className="text-lg font-bold text-purple-400">{formatCurrency(calculateMonthlyNeed(newGoal.targetAmount, newGoal.savedAmount, newGoal.deadline))}</span></div></div>
                        </div>
                    )}
                </div>
                <div className="p-6 border-t border-white/10 flex justify-between">
                    {modalStep > 1 ? <button onClick={() => setModalStep(s => s - 1)} className="text-gray-400 hover:text-white font-medium px-4">Back</button> : <div></div>}
                    {modalStep < 3 ? <button onClick={() => setModalStep(s => s + 1)} disabled={modalStep===2 && (!newGoal.targetAmount || !newGoal.deadline)} className="bg-white text-black px-6 py-2 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50">Next</button> : <button onClick={handleCreateGoal} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-2 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-purple-500/25">Start Goal 🚀</button>}
                </div>
            </div>
        </div>
      )}

      {/* --- 2. ADD FUNDS MODAL (NEW FEATURE) --- */}
      {showFundModal && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowFundModal(false)}></div>
            <div className="relative w-full max-w-md glass-modal rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-fade-in-up">
                
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${selectedGoal.color} flex items-center justify-center text-lg shadow-md`}>
                            <i className={`fa-solid ${selectedGoal.icon}`}></i>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{selectedGoal.title}</h3>
                            <p className="text-xs text-gray-400">Add funds to this goal</p>
                        </div>
                    </div>
                    <button onClick={() => setShowFundModal(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    
                    {/* Visual Progress Feedback */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>Current: {formatCurrency(selectedGoal.savedAmount)}</span>
                            <span>Target: {formatCurrency(selectedGoal.targetAmount)}</span>
                        </div>
                        <div className="h-4 w-full bg-gray-700/50 rounded-full overflow-hidden relative">
                            {/* Existing Progress */}
                            <div 
                                className={`absolute left-0 top-0 h-full bg-gradient-to-r ${selectedGoal.color}`} 
                                style={{ width: `${Math.min((selectedGoal.savedAmount / selectedGoal.targetAmount) * 100, 100)}%` }}
                            ></div>
                            {/* Projected Progress (Pulse) */}
                            {depositAmount && (
                                <div 
                                    className={`absolute top-0 h-full bg-white/30 animate-pulse`} 
                                    style={{ 
                                        left: `${Math.min((selectedGoal.savedAmount / selectedGoal.targetAmount) * 100, 100)}%`,
                                        width: `${Math.min((Number(depositAmount) / selectedGoal.targetAmount) * 100, 100 - (selectedGoal.savedAmount / selectedGoal.targetAmount) * 100)}%` 
                                    }}
                                ></div>
                            )}
                        </div>
                        {depositAmount && (
                            <div className="text-right text-xs text-green-400 font-medium">
                                New Balance: {formatCurrency(selectedGoal.savedAmount + Number(depositAmount))}
                            </div>
                        )}
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Deposit Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-500">$</span>
                            <input 
                                type="number" 
                                value={depositAmount} 
                                onChange={(e) => setDepositAmount(e.target.value)}
                                className="w-full glass-input rounded-2xl py-4 pl-10 pr-4 text-3xl font-bold text-white placeholder-gray-700 focus:outline-none focus:border-green-500 transition-colors"
                                placeholder="0"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="grid grid-cols-4 gap-2">
                        {[50, 100, 500, 1000].map(amount => (
                            <button 
                                key={amount} 
                                onClick={() => addPresetAmount(amount)}
                                className="py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-medium transition-all hover:scale-105 active:scale-95"
                            >
                                +${amount}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-white/10">
                    <button 
                        onClick={handleDeposit}
                        disabled={!depositAmount || Number(depositAmount) <= 0}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg shadow-green-500/20 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <i className="fa-solid fa-coins"></i> Confirm Deposit
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}
