import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';

export default function Income() {
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const API_BASE = import.meta.env.VITE_API_URL || 'https://finora-1mgm.onrender.com'

  // --- STATE MANAGEMENT ---
  const [loading, setLoading] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    amount: '',
    source: '', // 'salary', 'business', 'gift', etc.
    date: new Date().toISOString().split('T')[0],
    note: '',
    isRecurring: false,
    paymentMethod: 'bank' // 'bank', 'cash'
  });

  const [incomeStats, setIncomeStats] = useState({ monthlyTotal: 0, lastMonthTotal: 0, sources: {}, recent: [] });
  const [aiSuggestion, setAiSuggestion] = useState('');

  // --- CONFIGURATION: Income Sources ---
  const sources = [
    { id: 'salary', label: 'Salary', icon: 'fa-briefcase', color: 'emerald', desc: 'Regular employment' },
    { id: 'business', label: 'Business', icon: 'fa-shop', color: 'blue', desc: 'Profit & Sales' },
    { id: 'freelance', label: 'Freelance', icon: 'fa-laptop-code', color: 'indigo', desc: 'Contract work' },
    { id: 'investment', label: 'Interest', icon: 'fa-chart-line', color: 'purple', desc: 'Dividends/Returns' },
    { id: 'gift', label: 'Gift', icon: 'fa-gift', color: 'pink', desc: 'Awards & Grants' },
    { id: 'other', label: 'Other', icon: 'fa-piggy-bank', color: 'gray', desc: 'Miscellaneous' },
  ];

  // --- EFFECTS ---
  useEffect(() => {
    setTimeout(() => setPageReady(true), 300);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        let userId = null
        try { userId = localStorage.getItem('finora_user_id') } catch (_) {}
        
        // Fetch Income Summary
        const url = userId ? `${API_BASE}/api/income/summary?userId=${encodeURIComponent(userId)}` : `${API_BASE}/api/income/summary`
        const r = await fetch(url)
        const d = await r.json()
        setIncomeStats({
          monthlyTotal: Number(d?.monthlyTotal || 0),
          lastMonthTotal: Number(d?.lastMonthTotal || 0),
          sources: d?.sources || {},
          recent: Array.isArray(d?.recent) ? d.recent : []
        })

        // Fetch AI Suggestion
        const aiUrl = userId ? `${API_BASE}/api/ai/income-advice?userId=${encodeURIComponent(userId)}` : `${API_BASE}/api/ai/income-advice`
        const aiRes = await fetch(aiUrl)
        const aiData = await aiRes.json()
        if (aiData?.suggestion) {
          setAiSuggestion(aiData.suggestion)
        }
      } catch (_) {}
    })()
  }, [])

  useEffect(() => {
    if (!pageReady || !chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const ctx = chartRef.current.getContext('2d');
    const labels = Object.keys(incomeStats.sources)
    const data = labels.map(l => Number(incomeStats.sources[l] || 0))
    const colorMap = {
      Salary: 'rgba(16, 185, 129, 0.8)',
      Freelance: 'rgba(99, 102, 241, 0.8)',
      Investment: 'rgba(168, 85, 247, 0.8)',
      Business: 'rgba(59, 130, 246, 0.8)',
      Gift: 'rgba(236, 72, 153, 0.8)',
      Other: 'rgba(156, 163, 175, 0.8)'
    }
    const colors = labels.map(l => colorMap[l] || colorMap.Other)
    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor: '#0F0F11',
          borderWidth: 5,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        cutout: '80%',
      }
    });

    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [pageReady, incomeStats]);

  // --- HANDLERS ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.source) return;
    setLoading(true);
    try {
      let userId = null
      try { userId = localStorage.getItem('finora_user_id') } catch (_) {}
      const r = await fetch(`${API_BASE}/api/income/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount: parseFloat(formData.amount),
          source: formData.source,
          date: formData.date,
          note: formData.note,
          paymentMethod: formData.paymentMethod,
          isRecurring: formData.isRecurring
        })
      })
      if (!r.ok) throw new Error('Failed to add income')
      setShowSuccess(true)
      const url = userId ? `${API_BASE}/api/income/summary?userId=${encodeURIComponent(userId)}` : `${API_BASE}/api/income/summary`
      const rr = await fetch(url)
      const d = await rr.json()
      setIncomeStats({
        monthlyTotal: Number(d?.monthlyTotal || 0),
        lastMonthTotal: Number(d?.lastMonthTotal || 0),
        sources: d?.sources || {},
        recent: Array.isArray(d?.recent) ? d.recent : []
      })
      setTimeout(() => { navigate('/dashboard') }, 2000)
    } finally {
      setLoading(false)
    }
  };

  const getSourceColor = (sourceId) => {
    const s = sources.find(x => x.id === sourceId);
    if (!s) return 'border-white/10 bg-white/5';
    const map = {
      emerald: 'border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      blue: 'border-blue-500 bg-blue-500/20 text-blue-400',
      indigo: 'border-indigo-500 bg-indigo-500/20 text-indigo-400',
      purple: 'border-purple-500 bg-purple-500/20 text-purple-400',
      pink: 'border-pink-500 bg-pink-500/20 text-pink-400',
      gray: 'border-gray-500 bg-gray-500/20 text-gray-400',
    };
    return map[s.color];
  };

  // --- STYLES ---
  const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #0F0F11; color: white; overflow-x: hidden; }
    h1, h2, h3, h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    
    .glass-panel { background: rgba(20, 20, 25, 0.6); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.05); }
    .glass-input { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: white; transition: all 0.2s; }
    .glass-input:focus { border-color: #10b981; background: rgba(0,0,0,0.5); outline: none; box-shadow: 0 0 20px rgba(16, 185, 129, 0.1); }

    .animate-pop { animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    @keyframes pop { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
    
    .animate-float-y { animation: floatY 4s ease-in-out infinite; }
    @keyframes floatY { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }

    /* Custom Toggle Switch */
    .toggle-checkbox:checked { right: 0; border-color: #10b981; }
    .toggle-checkbox:checked + .toggle-label { background-color: #10b981; }
  `;

  return (
    <div className="flex h-screen w-screen antialiased text-white bg-[#0F0F11]">
      <style>{customStyles}</style>
      
      {/* Wealth Glow Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px]"></div>
      </div>

      {/* --- SIDEBAR --- */}
      <aside className={`w-72 flex-shrink-0 lg:flex flex-col justify-between p-6 border-r border-white/5 bg-[#0F0F11]/95 backdrop-blur-xl fixed h-full z-40 transition-all duration-300 ${mobileOpen ? 'flex' : 'hidden'}`}>
        <div>
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              <i className="fa-solid fa-bolt"></i>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">Finora</span>
          </div>
          <nav className="space-y-1">
            <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all">
              <i className="fa-solid fa-grid-2 w-5 text-center"></i> <span>Dashboard</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/10 text-white font-medium border-l-4 border-emerald-500 shadow-inner">
              <i className="fa-solid fa-wallet w-5 text-center text-emerald-400"></i> <span>Add Income</span>
            </button>
            <button onClick={() => navigate('/add-expense')} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all">
              <i className="fa-solid fa-receipt w-5 text-center"></i> <span>Add Expense</span>
            </button>
            <button onClick={() => navigate('/debt')} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all">
              <i className="fa-solid fa-chart-simple w-5 text-center"></i> <span>Debt Tracker</span>
            </button>
            <button onClick={() => navigate('/goals')} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all">
              <i className="fa-solid fa-bullseye w-5 text-center"></i> <span>Savings Goals</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 lg:ml-72 flex flex-col h-full relative z-10">
        
        {/* Header */}
        <header className="flex-shrink-0 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#0F0F11]/80 backdrop-blur-md sticky top-0 z-20 border-b border-white/5">
          <div className="w-full md:w-auto flex items-center gap-4">
             <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg"><i className="fa-solid fa-bars"></i></button>
             <div>
                <h1 className="text-xl font-bold text-emerald-100">Add Income</h1>
                <p className="text-xs text-gray-400">Log your earnings & profits</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => navigate('/income-sources')} className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 shadow-lg">
                <i className="fa-solid fa-list"></i>
                <span className="text-sm">Income Sources</span>
             </button>
             <button onClick={() => navigate('/income-opportunities')} className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-lg">
                <i className="fa-solid fa-star"></i>
                <span className="text-sm">Opportunities</span>
             </button>
             <div onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 p-[2px] cursor-pointer hover:opacity-80 transition-opacity">
                 <img src="https://cdn-icons-png.flaticon.com/512/2922/2922510.png" alt="User" className="w-full h-full rounded-full object-cover border-2 border-[#1a1a1a]" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scroll">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- LEFT COLUMN: Input Form (2/3) --- */}
                <div className="lg:col-span-2 space-y-6">
                    
                    <div className={`glass-panel rounded-3xl p-6 md:p-8 ${pageReady ? 'animate-pop' : 'opacity-0'}`}>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            
                            {/* 1. Amount & Date Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Amount Earned</label>
                                    <div className="relative group">
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-bold text-emerald-600/50 group-focus-within:text-emerald-500 transition-colors">$</span>
                                        <input 
                                            type="number" 
                                            value={formData.amount}
                                            onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                            placeholder="0.00" 
                                            className="w-full bg-transparent border-b-2 border-white/10 text-4xl md:text-5xl font-bold text-white placeholder-gray-700 py-2 pl-8 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date Received</label>
                                    <input 
                                        type="date" 
                                        value={formData.date}
                                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                                        className="w-full glass-input rounded-xl px-4 py-3 text-sm font-medium"
                                    />
                                    
                                    {/* Recurring Toggle */}
                                    <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-emerald-500/20 p-1.5 rounded-lg text-emerald-400"><i className="fa-solid fa-repeat text-xs"></i></div>
                                            <div>
                                                <p className="text-xs font-bold text-white">Recurring?</p>
                                                <p className="text-[10px] text-gray-500">Is this monthly?</p>
                                            </div>
                                        </div>
                                        <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                            <input 
                                                type="checkbox" 
                                                checked={formData.isRecurring}
                                                onChange={(e) => setFormData({...formData, isRecurring: e.target.checked})}
                                                className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300 left-0 top-0"
                                            />
                                            <label className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-700 cursor-pointer"></label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Source Selection (Grid) */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Income Source</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {sources.map(source => (
                                        <div 
                                            key={source.id} 
                                            onClick={() => setFormData({...formData, source: source.id})}
                                            className={`relative overflow-hidden flex flex-col items-center gap-2 p-4 rounded-2xl border cursor-pointer transition-all duration-300 group
                                                ${formData.source === source.id ? getSourceColor(source.id) : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}
                                            `}
                                        >
                                            <div className={`text-2xl mb-1 ${formData.source === source.id ? 'animate-float-y' : ''}`}>
                                                <i className={`fa-solid ${source.icon}`}></i>
                                            </div>
                                            <span className="text-xs font-bold">{source.label}</span>
                                            <span className="text-[9px] opacity-60 font-medium">{source.desc}</span>
                                            
                                            {/* Checkmark decoration */}
                                            {formData.source === source.id && (
                                                <div className="absolute top-2 right-2 text-xs opacity-50"><i className="fa-solid fa-check"></i></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 3. Note & Method */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reference / Note</label>
                                    <input 
                                        type="text" 
                                        value={formData.note}
                                        onChange={(e) => setFormData({...formData, note: e.target.value})}
                                        placeholder="e.g. October Salary" 
                                        className="w-full glass-input rounded-xl px-4 py-3.5 text-sm" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Deposit To</label>
                                    <div className="flex bg-black/30 p-1 rounded-xl">
                                        <button 
                                            type="button"
                                            onClick={() => setFormData({...formData, paymentMethod: 'bank'})}
                                            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${formData.paymentMethod === 'bank' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                        >
                                            Bank
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setFormData({...formData, paymentMethod: 'cash'})}
                                            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${formData.paymentMethod === 'cash' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                        >
                                            Cash
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button 
                                    type="submit" 
                                    disabled={loading || !formData.amount || !formData.source}
                                    className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2 relative overflow-hidden group
                                        ${formData.amount && formData.source
                                            ? `bg-white text-black hover:bg-emerald-50` 
                                            : 'bg-[#2a2a2a] text-gray-500 cursor-not-allowed border border-white/5'}`}
                                >
                                    {loading ? (
                                        <><i className="fa-solid fa-circle-notch fa-spin"></i> Processing...</>
                                    ) : (
                                        <>
                                            <span className="relative z-10">Confirm Deposit</span> 
                                            <i className="fa-solid fa-arrow-right relative z-10"></i>
                                            {/* Hover shine effect */}
                                            {formData.amount && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>}
                                        </>
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: Insights & Context (1/3) --- */}
                <div className="space-y-6">
                    
                    {/* 1. Monthly Overview Chart */}
                    <div className="glass-panel rounded-3xl p-6 relative overflow-hidden flex flex-col items-center">
                        <h3 className="text-sm font-bold text-gray-300 w-full mb-2">Income Stream</h3>
                        <div className="relative w-48 h-48 my-4">
                            <canvas ref={chartRef}></canvas>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xl font-bold text-white font-mono">${incomeStats.monthlyTotal.toLocaleString()}</span>
                                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">+8.3%</span>
                            </div>
                        </div>
                        <div className="w-full text-center">
                            <p className="text-xs text-gray-500">This Month's Total</p>
                        </div>
                    </div>

                    {/* 2. Goal Impact (Calculator) */}
                    <div className="glass-panel rounded-3xl p-6 border-l-4 border-emerald-500">
                        <div className="flex items-center gap-2 mb-3">
                             <i className="fa-solid fa-rocket text-emerald-400"></i>
                             <h4 className="font-bold text-sm text-white">Income Insight (AI)</h4>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed mb-3">
                            {aiSuggestion || "Analyzing your income patterns to provide smart suggestions..."}
                        </p>
                        {formData.amount && (
                            <div className="bg-emerald-500/10 rounded-xl p-3 flex justify-between items-center border border-emerald-500/20">
                                <span className="text-xs text-emerald-200">Recommended Savings:</span>
                                <span className="font-mono font-bold text-emerald-400">${(formData.amount * 0.2).toFixed(0)}</span>
                            </div>
                        )}
                    </div>

                    {/* 3. Recent Deposits */}
                    <div className="glass-panel rounded-3xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-sm">Recent Activity</h3>
                        </div>
                        <div className="space-y-3">
                            {incomeStats.recent.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs">
                                            <i className={`fa-solid ${item.type === 'salary' ? 'fa-briefcase' : 'fa-laptop'}`}></i>
                                        </div>
                                        <div>
                                            <h5 className="text-xs font-bold text-white">{item.title}</h5>
                                            <p className="text-[10px] text-gray-500">{item.date}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-emerald-400">+${item.amount}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </main>

        {/* Success Modal */}
        {showSuccess && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
                <div className="bg-[#1a1a1a] border border-emerald-500/30 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-pop relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-400"></div>
                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-black text-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                        <i className="fa-solid fa-check"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Money Added!</h2>
                    <p className="text-gray-400 text-sm mb-6">Your balance has been updated.</p>
                    <button onClick={() => setShowSuccess(false)} className="w-full py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20">Close</button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}
