import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Chart from 'chart.js/auto'

export default function BudgetPlanner() {
  const navigate = useNavigate()
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const [loading, setLoading] = useState(false)
  const [pageReady, setPageReady] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showSaveToast, setShowSaveToast] = useState(false)
  const [income, setIncome] = useState(5000)
  const [categories, setCategories] = useState([
    { id: 'cat_1', name: 'Housing & Rent', icon: 'fa-house', color: 'purple', spent: 1200, limit: 1200 },
    { id: 'cat_2', name: 'Food & Dining', icon: 'fa-burger', color: 'yellow', spent: 450, limit: 600 },
    { id: 'cat_3', name: 'Transportation', icon: 'fa-car', color: 'blue', spent: 180, limit: 200 },
    { id: 'cat_4', name: 'Entertainment', icon: 'fa-gamepad', color: 'pink', spent: 220, limit: 150 },
    { id: 'cat_5', name: 'Shopping', icon: 'fa-bag-shopping', color: 'orange', spent: 300, limit: 400 },
    { id: 'cat_6', name: 'Savings & Invest', icon: 'fa-piggy-bank', color: 'green', spent: 500, limit: 1000 }
  ])
  const [stats, setStats] = useState({ totalBudgeted: 0, totalSpent: 0, remainingBudget: 0, unallocatedIncome: 0 })

  useEffect(() => {
    const budgeted = categories.reduce((acc, cat) => acc + (parseFloat(cat.limit) || 0), 0)
    const spent = categories.reduce((acc, cat) => acc + (parseFloat(cat.spent) || 0), 0)
    setStats({ totalBudgeted: budgeted, totalSpent: spent, remainingBudget: budgeted - spent, unallocatedIncome: income - budgeted })
    if (!pageReady) setTimeout(() => setPageReady(true), 300)
  }, [categories, income])

  useEffect(() => {
    if (!pageReady || !chartRef.current) return
    if (chartInstance.current) chartInstance.current.destroy()
    const ctx = chartRef.current.getContext('2d')
    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categories.map(c => c.name),
        datasets: [{
          data: categories.map(c => c.limit),
          backgroundColor: [
            'rgba(168, 85, 247, 0.8)',
            'rgba(234, 179, 8, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(249, 115, 22, 0.8)',
            'rgba(34, 197, 94, 0.8)'
          ],
          borderColor: '#1e1e23',
          borderWidth: 4,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(0,0,0,0.9)', callbacks: { label: (c) => ` $${c.raw}` } } },
        cutout: '75%'
      }
    })
    return () => { if (chartInstance.current) chartInstance.current.destroy() }
  }, [categories, pageReady])

  const handleLimitChange = (id, newLimit) => {
    const value = parseFloat(newLimit) || 0
    setCategories(prev => prev.map(c => c.id === id ? { ...c, limit: value } : c))
  }

  const handleSave = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setIsEditing(false)
      setShowSaveToast(true)
      setTimeout(() => setShowSaveToast(false), 3000)
    }, 800)
  }

  const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #0F0F11; color: white; overflow-x: hidden; }
    h1, h2, h3, h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    .glass-panel { background: rgba(30, 30, 35, 0.6); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.05); }
    .glass-input { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: white; transition: all 0.2s; }
    .glass-input:focus { border-color: #8b5cf6; background: rgba(0,0,0,0.5); outline: none; box-shadow: 0 0 15px rgba(139, 92, 246, 0.1); }
    .progress-track { background: rgba(255,255,255,0.05); border-radius: 6px; overflow: hidden; }
    .progress-fill { transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
    .animate-fade-up { animation: fadeUp 0.6s ease-out forwards; opacity: 0; transform: translateY(10px); }
    @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
    .edit-glow { animation: pulseBorder 2s infinite; }
    @keyframes pulseBorder { 0% { border-color: rgba(139, 92, 246, 0.3); } 50% { border-color: rgba(139, 92, 246, 0.8); } 100% { border-color: rgba(139, 92, 246, 0.3); } }
  `

  return (
    <div className="flex h-screen w-screen antialiased text-white bg-[#0F0F11]">
      <style>{customStyles}</style>
      <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>
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
            <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/10 text-white font-medium border-l-4 border-purple-500 shadow-inner">
              <i className="fa-solid fa-scale-balanced w-5 text-center text-purple-400"></i> <span>Budget Planner</span>
            </button>
          </nav>
        </div>
      </aside>
      <div className="flex-1 lg:ml-72 flex flex-col h-full relative z-10">
        <header className="flex-shrink-0 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#0F0F11]/80 backdrop-blur-md sticky top-0 z-20 border-b border-white/5">
          <div className="w-full md:w-auto flex items-center gap-4">
             <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-white hover:bg:white/10 rounded-lg"><i className="fa-solid fa-bars"></i></button>
             <div>
                <h1 className="text-xl font-bold">Monthly Budget</h1>
                <p className="text-xs text-gray-400">Plan your spending limits</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             {isEditing ? (
                 <div className="flex items-center gap-2">
                     <span className="text-xs text-gray-400 mr-2 hidden sm:inline">Unallocated: <span className={`${stats.unallocatedIncome < 0 ? 'text-red-400' : 'text-green-400'} font-mono`}>${stats.unallocatedIncome}</span></span>
                     <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-gray-400 hover:text:white transition-colors">Cancel</button>
                     <button onClick={handleSave} className="bg-green-500 hover:bg-green-400 text-black px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-green-500/20 transition-all flex items-center gap-2">
                        {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <><i className="fa-solid fa-check"></i> Save Plan</>}
                     </button>
                 </div>
             ) : (
                 <button onClick={() => setIsEditing(true)} className="bg:white text-black px-5 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors shadow-lg flex items-center gap-2">
                    <i className="fa-solid fa-pen-to-square"></i> Adjust Limits
                 </button>
             )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5"><i className="fa-solid fa-coins text-8xl text-white"></i></div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Budgeted</p>
                                <h2 className="text-3xl font-mono font-bold text-white">${stats.totalBudgeted.toLocaleString()}</h2>
                                <p className="text-[10px] text-gray-500 mt-1">out of ${income} income</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Actual Spent</p>
                                <h2 className="text-3xl font-mono font-bold text:white">${stats.totalSpent.toLocaleString()}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{ width: `${Math.min((stats.totalSpent/stats.totalBudgeted)*100, 100)}%` }}></div>
                                    </div>
                                    <span className="text-[10px] text-blue-400">{Math.round((stats.totalSpent/stats.totalBudgeted)*100)}%</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Remaining</p>
                                <h2 className={`${stats.remainingBudget < 0 ? 'text-red-400' : 'text-green-400'} text-3xl font-mono font-bold`}>${stats.remainingBudget.toLocaleString()}</h2>
                                <p className="text-[10px] text-gray-500 mt-1">Safe to spend</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-bold text-lg">Allocations</h3>
                            {isEditing && <span className="text-xs text-purple-400 animate-pulse"><i className="fa-solid fa-circle text-[8px] mr-1"></i> Editing Mode Active</span>}
                        </div>
                        {categories.map((cat, index) => {
                            const percent = Math.min((cat.spent / cat.limit) * 100, 100)
                            const isOver = cat.spent > cat.limit
                            const colorMap = { purple: 'bg-purple-500', yellow: 'bg-yellow-500', blue: 'bg-blue-500', pink: 'bg-pink-500', orange: 'bg-orange-500', green: 'bg-green-500' }
                            const barColor = isOver ? 'bg-red-500' : (colorMap[cat.color] || 'bg-gray-500')
                            return (
                                <div key={cat.id} className={`glass-panel rounded-2xl p-4 transition-all duration-300 ${pageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: `${index * 50}ms` }}>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        <div className="flex items-center gap-4 w-48 shrink-0">
                                            <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg ${isOver ? 'text-red-400' : 'text-gray-300'}`}>
                                                <i className={`fa-solid ${cat.icon}`}></i>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-white">{cat.name}</h4>
                                                <p className="text-[10px] text-gray-500 font-mono">Spent: <span className={isOver ? 'text-red-400' : 'text-gray-300'}>${cat.spent}</span></p>
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-2 min-w-[150px]">
                                            <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500"><span>Progress</span><span className={isOver ? 'text-red-400' : ''}>{Math.round(percent)}%</span></div>
                                            <div className="h-2 w-full progress-track relative">
                                                <div className={`h-full rounded-full progress-fill ${barColor}`} style={{ width: `${percent}%` }}></div>
                                                {!isOver && <div className="absolute top-0 bottom-0 w-0.5 bg-white/30 z-10" style={{ left: `${percent}%` }}></div>}
                                            </div>
                                        </div>
                                        <div className="w-full sm:w-32 shrink-0 text-right">
                                            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Planned Limit</p>
                                            {isEditing ? (
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                                                    <input type="number" value={cat.limit} onChange={(e) => handleLimitChange(cat.id, e.target.value)} className={`w-full glass-input rounded-lg py-2 pl-6 pr-2 text-right font-mono font-bold text-sm ${isOver ? 'border-red-500/50 text-red-100' : 'border-white/10'}`} />
                                                </div>
                                            ) : (
                                                <div className="py-2 pr-2"><span className="font-mono font-bold text-lg">${cat.limit}</span></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        {isEditing && (
                            <button className="w-full py-4 rounded-2xl border border-dashed border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                                <i className="fa-solid fa-plus"></i> <span>Add New Category</span>
                            </button>
                        )}
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="glass-panel rounded-3xl p-6 flex flex-col items-center">
                        <h3 className="text-sm font-bold text-gray-300 w-full mb-4">Allocation Breakdown</h3>
                        <div className="relative w-48 h-48">
                            <canvas ref={chartRef}></canvas>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold text-white">{categories.length}</span>
                                <span className="text-[10px] text-gray-500 uppercase">Categories</span>
                            </div>
                        </div>
                    </div>
                    <div className={`glass-panel rounded-3xl p-6 border-l-4 ${stats.unallocatedIncome === 0 ? 'border-green-500' : stats.unallocatedIncome > 0 ? 'border-yellow-500' : 'border-red-500'}`}>
                        <div className="flex items-center gap-2 mb-2"><i className="fa-solid fa-scale-balanced text-gray-400"></i><h4 className="font-bold text-sm text-white">Budget Balance</h4></div>
                        {stats.unallocatedIncome === 0 ? (
                            <p className="text-sm text-gray-300">Perfect! You have a <span className="text-green-400 font-bold">Zero-Based Budget</span>. Every dollar has a job.</p>
                        ) : stats.unallocatedIncome > 0 ? (
                            <div>
                                <p className="text-sm text-gray-300 mb-2">You have <span className="text-yellow-400 font-bold">${stats.unallocatedIncome}</span> unallocated from income. Consider increasing savings or limits.</p>
                                <div className="flex items-center gap-2"><button onClick={() => setIncome(i => i + 100)} className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20">+ Add to Savings</button><button onClick={() => setIsEditing(true)} className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20">Adjust Limits</button></div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-sm text-gray-300 mb-2">You are <span className="text-red-400 font-bold">${Math.abs(stats.unallocatedIncome)}</span> over-allocated. Reduce some category limits.</p>
                                <button onClick={() => setIsEditing(true)} className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20">Adjust Limits</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
      </div>
      {showSaveToast && (
        <div className="fixed bottom-6 right-6 bg-white text-black px-4 py-2 rounded-xl shadow-lg">Saved successfully</div>
      )}
    </div>
  )
}
