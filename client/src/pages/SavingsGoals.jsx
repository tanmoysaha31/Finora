import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function SavingsGoals() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // --- STATE MANAGEMENT ---
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [dashboardStats, setDashboardStats] = useState({ totalSaved: 0, totalTarget: 0, overallProgress: 0 });

  // Form State for New Goal
  const [newGoal, setNewGoal] = useState({
    type: '',
    title: '',
    targetAmount: '',
    savedAmount: '',
    deadline: '',
    icon: ''
  });

  // --- MOCK DATABASE & INIT ---
  useEffect(() => {
    // Simulate API Fetch
    setTimeout(() => {
      const mockGoals = [
        { id: 1, title: 'Wedding Fund', type: 'wedding', savedAmount: 12500, targetAmount: 30000, deadline: '2025-12-01', icon: 'fa-ring', color: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-500/20' },
        { id: 2, title: 'Hajj Pilgrimage', type: 'hajj', savedAmount: 4500, targetAmount: 8000, deadline: '2026-06-15', icon: 'fa-kaaba', color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20' },
        { id: 3, title: 'Emergency Fund', type: 'emergency', savedAmount: 5000, targetAmount: 10000, deadline: '2024-12-31', icon: 'fa-heart-pulse', color: 'from-red-500 to-orange-500', shadow: 'shadow-red-500/20' },
        { id: 4, title: 'New MacBook', type: 'tech', savedAmount: 1200, targetAmount: 2500, deadline: '2024-05-20', icon: 'fa-laptop', color: 'from-blue-500 to-indigo-500', shadow: 'shadow-blue-500/20' }
      ];
      setGoals(mockGoals);
      calculateStats(mockGoals);
      setLoading(false);
    }, 800);
  }, []);

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

  // --- HANDLERS ---
  const handleCreateGoal = (e) => {
    e.preventDefault();
    const goalData = {
      id: Date.now(),
      ...newGoal,
      savedAmount: Number(newGoal.savedAmount) || 0,
      targetAmount: Number(newGoal.targetAmount),
      // Auto-assign color based on type
      color: getGoalStyle(newGoal.type).gradient,
      shadow: getGoalStyle(newGoal.type).shadow
    };

    const updatedGoals = [...goals, goalData];
    setGoals(updatedGoals);
    calculateStats(updatedGoals);
    
    // Reset & Close
    setShowModal(false);
    setModalStep(1);
    setNewGoal({ type: '', title: '', targetAmount: '', savedAmount: '', deadline: '', icon: '' });
    alert("Goal created successfully!");
  };

  const getGoalStyle = (type) => {
    switch (type) {
      case 'wedding': return { gradient: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-500/20', icon: 'fa-ring' };
      case 'hajj': return { gradient: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20', icon: 'fa-kaaba' };
      case 'education': return { gradient: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/20', icon: 'fa-graduation-cap' };
      case 'emergency': return { gradient: 'from-red-500 to-orange-500', shadow: 'shadow-red-500/20', icon: 'fa-truck-medical' };
      default: return { gradient: 'from-purple-500 to-indigo-500', shadow: 'shadow-purple-500/20', icon: 'fa-star' };
    }
  };

  const selectType = (type, title) => {
    const style = getGoalStyle(type);
    setNewGoal({ ...newGoal, type, title, icon: style.icon });
    setModalStep(2);
  };

  // --- CSS STYLES (Injected) ---
  const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    
    body { font-family: 'Inter', sans-serif; background-color: #1a1a1a; color: white; }
    h1, h2, h3, h4 { font-family: 'Plus Jakarta Sans', sans-serif; }

    /* Glassmorphism & Cards */
    .glass-panel {
        background: rgba(36, 36, 36, 0.7);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.05);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
    }
    
    .glass-modal {
        background: rgba(26, 26, 26, 0.95);
        backdrop-filter: blur(20px);
    }

    .hover-lift { transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
    .hover-lift:hover { transform: translateY(-4px); }
    
    /* Background Blobs */
    .bg-blob { position: fixed; border-radius: 50%; filter: blur(100px); opacity: 0.15; z-index: -1; pointer-events: none; }
    .blob-1 { top: -10%; left: -10%; width: 600px; height: 600px; background: #7c3aed; animation: float 20s infinite alternate; }
    .blob-2 { bottom: -10%; right: -10%; width: 500px; height: 500px; background: #2563eb; animation: float 25s infinite alternate-reverse; }
    
    @keyframes float { 0% { transform: translate(0, 0); } 100% { transform: translate(40px, -40px); } }
    
    .progress-bar-striped {
      background-image: linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);
      background-size: 1rem 1rem;
    }
  `;

  return (
    <div className="flex h-screen w-screen antialiased overflow-hidden text-white bg-[#1a1a1a]">
      <style>{customStyles}</style>

      {/* Ambient Background */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>

      {/* --- SIDEBAR (Reused from Dashboard) --- */}
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
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/20 hover-lift">
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
                                            <button className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg ${isCompleted ? 'bg-gray-700 cursor-not-allowed text-gray-400' : 'bg-white text-black hover:bg-gray-100'}`} disabled={isCompleted}>
                                                + Add Funds
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {/* Empty State / Add New Card */}
                            <button onClick={() => setShowModal(true)} className="rounded-3xl border-2 border-dashed border-white/10 hover:border-purple-500/50 hover:bg-white/5 transition-all p-6 flex flex-col items-center justify-center gap-4 text-gray-500 hover:text-white group h-full min-h-[300px]">
                                <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-purple-500 group-hover:text-white flex items-center justify-center transition-all text-2xl">
                                    <i className="fa-solid fa-plus"></i>
                                </div>
                                <span className="font-medium">Create New Goal</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* 3. Simple Analytics / Insights */}
                <div className="glass-panel p-6 rounded-3xl">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <i className="fa-solid fa-lightbulb"></i>
                        </div>
                        <div>
                            <h4 className="font-bold">Smart Insights</h4>
                            <p className="text-xs text-gray-400">Based on your current progress</p>
                        </div>
                     </div>
                     <div className="p-4 bg-white/5 rounded-xl border-l-4 border-green-500 mb-2">
                        <p className="text-sm">🎉 You are on track to reach your <strong>Wedding Fund</strong> goal by Dec 2025. Keep it up!</p>
                     </div>
                     <div className="p-4 bg-white/5 rounded-xl border-l-4 border-yellow-500">
                        <p className="text-sm">⚠️ To reach your <strong>New MacBook</strong> goal on time, try increasing monthly contribution by <strong>$50</strong>.</p>
                     </div>
                </div>

            </div>
        </main>
      </div>

      {/* --- CREATE GOAL MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
            <div className="relative w-full max-w-lg glass-modal rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Modal Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold">Create New Goal</h3>
                        <p className="text-xs text-gray-400">Step {modalStep} of 3</p>
                    </div>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-xmark text-xl"></i></button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto custom-scroll">
                    
                    {/* STEP 1: Select Type */}
                    {modalStep === 1 && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-300">What are you saving for?</p>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'wedding', label: 'Wedding', icon: 'fa-ring', color: 'bg-pink-500' },
                                    { id: 'hajj', label: 'Hajj / Umrah', icon: 'fa-kaaba', color: 'bg-emerald-500' },
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

                    {/* STEP 2: Details */}
                    {modalStep === 2 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Goal Name</label>
                                <input type="text" value={newGoal.title} onChange={(e) => setNewGoal({...newGoal, title: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-white" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Target Amount ($)</label>
                                    <input type="number" value={newGoal.targetAmount} onChange={(e) => setNewGoal({...newGoal, targetAmount: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-white" placeholder="5000" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Saved Already ($)</label>
                                    <input type="number" value={newGoal.savedAmount} onChange={(e) => setNewGoal({...newGoal, savedAmount: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-white" placeholder="0" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Target Deadline</label>
                                <input type="date" value={newGoal.deadline} onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-white" />
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Confirm */}
                    {modalStep === 3 && (
                        <div className="text-center space-y-6">
                            <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${getGoalStyle(newGoal.type).gradient} flex items-center justify-center text-3xl shadow-xl`}>
                                <i className={`fa-solid ${newGoal.icon}`}></i>
                            </div>
                            
                            <div>
                                <h2 className="text-2xl font-bold">{newGoal.title}</h2>
                                <p className="text-gray-400">Target: {formatCurrency(newGoal.targetAmount)} by {new Date(newGoal.deadline).toLocaleDateString()}</p>
                            </div>

                            <div className="bg-white/5 rounded-xl p-4 text-left border border-white/10">
                                <h4 className="text-sm font-bold text-gray-300 mb-2">Recommendation</h4>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">Monthly Saving Needed:</span>
                                    <span className="text-lg font-bold text-purple-400">
                                        {formatCurrency(calculateMonthlyNeed(newGoal.targetAmount, newGoal.savedAmount, newGoal.deadline))}
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1">Calculated based on remaining time and amount.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-white/10 flex justify-between">
                    {modalStep > 1 ? (
                        <button onClick={() => setModalStep(s => s - 1)} className="text-gray-400 hover:text-white font-medium px-4">Back</button>
                    ) : (
                        <div></div>
                    )}

                    {modalStep < 3 ? (
                        <button onClick={() => setModalStep(s => s + 1)} disabled={modalStep===2 && (!newGoal.targetAmount || !newGoal.deadline)} className="bg-white text-black px-6 py-2 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50">
                            Next
                        </button>
                    ) : (
                        <button onClick={handleCreateGoal} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-2 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-purple-500/25">
                            Start Goal 🚀
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}