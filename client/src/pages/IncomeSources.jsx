import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';

export default function IncomeSources() {
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  
  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [monthlyGoal, setMonthlyGoal] = useState(6000); // User Target
  
  // MOCK DB: Sources
  const [sources, setSources] = useState([
    { id: 'src_1', name: 'Tech Solutions Inc.', type: 'Salary', amount: 4000, frequency: 'Monthly', icon: 'fa-briefcase', color: 'emerald' },
    { id: 'src_2', name: 'Upwork Freelance', type: 'Freelance', amount: 850, frequency: 'Variable', icon: 'fa-laptop-code', color: 'blue' },
    { id: 'src_3', name: 'Stock Dividends', type: 'Investment', amount: 150, frequency: 'Quarterly', icon: 'fa-chart-line', color: 'purple' }
  ]);

  // Derived Analytics
  const totalMonthlyIncome = sources.reduce((acc, src) => acc + (src.frequency === 'Monthly' ? src.amount : src.amount / 3), 0); // Simplified calc
  const progressToGoal = Math.min((totalMonthlyIncome / monthlyGoal) * 100, 100);

  // --- CHART LOGIC ---
  useEffect(() => {
    if (loading || !chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const ctx = chartRef.current.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)'); // Emerald
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Total Income',
            data: [4800, 4950, 4200, 5100, 5300, totalMonthlyIncome],
            borderColor: '#10b981',
            backgroundColor: gradient,
            borderWidth: 3,
            pointBackgroundColor: '#064e3b',
            pointBorderColor: '#10b981',
            pointRadius: 6,
            fill: true,
            tension: 0.4
          },
          {
            label: 'Goal',
            data: Array(6).fill(monthlyGoal),
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            borderDash: [5, 5],
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b7280', callback: v => '$' + v } },
          x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
        }
      }
    });

    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [loading, sources, monthlyGoal]);

  useEffect(() => setTimeout(() => setLoading(false), 800), []);

  // --- HANDLERS ---
  const handleSaveSource = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newSrc = {
      id: editingSource ? editingSource.id : Date.now(),
      name: formData.get('name'),
      type: formData.get('type'),
      amount: Number(formData.get('amount')),
      frequency: formData.get('frequency'),
      icon: 'fa-wallet', // Default icon logic can be expanded
      color: 'blue'      // Default color
    };

    if (editingSource) {
      setSources(sources.map(s => s.id === newSrc.id ? newSrc : s));
    } else {
      setSources([...sources, newSrc]);
    }
    setShowManageModal(false);
    setEditingSource(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Remove this income source?")) {
      setSources(sources.filter(s => s.id !== id));
    }
  };

  const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #0F0F11; color: white; overflow-x: hidden; }
    h1, h2, h3, h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
    
    .glass-panel { background: rgba(30, 30, 35, 0.6); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.05); }
    .glass-modal { background: rgba(20, 20, 25, 0.95); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); }
    .glass-input { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: white; transition: all 0.2s; }
    .glass-input:focus { border-color: #10b981; background: rgba(0,0,0,0.5); outline: none; }
    
    .animate-pop { animation: pop 0.3s ease-out forwards; }
    @keyframes pop { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

    .bg-blob { position: fixed; border-radius: 50%; filter: blur(100px); opacity: 0.15; z-index: -1; pointer-events: none; }
    
    .custom-scroll::-webkit-scrollbar { width: 4px; }
    .custom-scroll::-webkit-scrollbar-track { background: transparent; }
    .custom-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
  `;

  return (
    <div className="flex h-screen w-screen antialiased text-white bg-[#0F0F11]">
      <style>{customStyles}</style>
      
      <div className="bg-blob top-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-900/10"></div>
      <div className="bg-blob bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/10"></div>

      {/* SIDEBAR */}
      <aside className={`w-72 flex-shrink-0 lg:flex flex-col justify-between p-6 border-r border-white/5 bg-[#0F0F11]/95 backdrop-blur-xl fixed h-full z-40 transition-all duration-300 ${mobileOpen ? 'flex' : 'hidden'}`}>
        <div>
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              <i className="fa-solid fa-bolt"></i>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">Finora</span>
          </div>
          <nav className="space-y-1">
            <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all"><i className="fa-solid fa-grid-2 w-5 text-center"></i> <span>Dashboard</span></button>
            <button onClick={() => navigate('/income')} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all"><i className="fa-solid fa-plus w-5 text-center"></i> <span>Add Income</span></button>
            <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/10 text-white font-medium border-l-4 border-emerald-500 shadow-inner"><i className="fa-solid fa-chart-line w-5 text-center text-emerald-400"></i> <span>Income Sources</span></button>
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 lg:ml-72 flex flex-col h-full relative z-10">
        
        <header className="flex-shrink-0 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#0F0F11]/80 backdrop-blur-md sticky top-0 z-20 border-b border-white/5">
          <div className="w-full md:w-auto flex items-center gap-4">
             <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg"><i className="fa-solid fa-bars"></i></button>
             <div>
                <h1 className="text-xl font-bold">Income Overview</h1>
                <p className="text-xs text-gray-400">Manage & track your revenue streams</p>
             </div>
          </div>
          <button onClick={() => { setEditingSource(null); setShowManageModal(true); }} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20">
             <i className="fa-solid fa-plus"></i> <span>Add Source</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scroll">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* 1. HERO METRICS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500"><i className="fa-solid fa-wallet text-6xl text-emerald-400"></i></div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Projected Monthly</p>
                        <h2 className="text-3xl font-mono font-bold text-white">${totalMonthlyIncome.toLocaleString()}</h2>
                        <div className="flex items-center gap-2 mt-3">
                             <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${progressToGoal}%` }}></div></div>
                             <span className="text-[10px] text-gray-400">{Math.round(progressToGoal)}% of Goal</span>
                        </div>
                    </div>
                    
                    <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Active Streams</p>
                        <h2 className="text-3xl font-mono font-bold text-white">{sources.length}</h2>
                        <p className="text-[10px] text-gray-500 mt-2">Diversification Score: <span className="text-emerald-400 font-bold">Good</span></p>
                    </div>

                    <div className="glass-panel p-6 rounded-3xl border-l-4 border-blue-500">
                        <div className="flex items-center gap-2 mb-2">
                             <i className="fa-solid fa-wand-magic-sparkles text-blue-400"></i>
                             <h4 className="font-bold text-sm text-white">Smart Insight</h4>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed">
                            Your <strong>Freelance</strong> income fluctuates by 20%. Consider stabilizing it or increasing your <strong>Emergency Fund</strong>.
                        </p>
                    </div>
                </div>

                {/* 2. MAIN LAYOUT: LIST & CHART */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    
                    {/* LEFT: SOURCES LIST (2/3) */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold">Your Streams</h3>
                            <button className="text-xs text-gray-400 hover:text-white"><i className="fa-solid fa-sort mr-1"></i> Sort by Amount</button>
                        </div>

                        <div className="space-y-4">
                            {sources.map((src) => (
                                <div key={src.id} className="glass-panel p-5 rounded-2xl hover:bg-white/5 transition-all group flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-${src.color}-500/20 text-${src.color}-400 border border-${src.color}-500/30`}>
                                            <i className={`fa-solid ${src.icon}`}></i>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-base">{src.name}</h4>
                                            <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                                                <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">{src.type}</span>
                                                <span>• {src.frequency}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-lg font-bold font-mono text-white">${src.amount.toLocaleString()}</p>
                                            <p className="text-[10px] text-emerald-400 font-medium">+ Stable</p>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setEditingSource(src); setShowManageModal(true); }} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/20 flex items-center justify-center text-gray-300 transition-colors"><i className="fa-solid fa-pen text-xs"></i></button>
                                            <button onClick={() => handleDelete(src.id)} className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/30 flex items-center justify-center text-red-400 transition-colors"><i className="fa-solid fa-trash text-xs"></i></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            <button onClick={() => { setEditingSource(null); setShowManageModal(true); }} className="w-full py-4 rounded-2xl border border-dashed border-white/10 text-gray-500 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                                <i className="fa-solid fa-plus"></i> <span>Add New Stream</span>
                            </button>
                        </div>
                    </div>

                    {/* RIGHT: CHART (1/3) */}
                    <div className="space-y-6">
                        <div className="glass-panel p-6 rounded-3xl flex flex-col h-80">
                            <h3 className="text-sm font-bold text-gray-300 mb-4">Growth Trend</h3>
                            <div className="flex-1 relative w-full">
                                <canvas ref={chartRef}></canvas>
                            </div>
                        </div>

                        <div className="glass-panel p-6 rounded-3xl">
                            <h3 className="text-sm font-bold text-gray-300 mb-4">Target Goal</h3>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-gray-400">Current</span>
                                <span className="text-xs text-white font-bold">${totalMonthlyIncome.toLocaleString()} / ${monthlyGoal.toLocaleString()}</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" max="10000" 
                                value={monthlyGoal} 
                                onChange={(e) => setMonthlyGoal(Number(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                            <p className="text-[10px] text-gray-500 mt-2 text-center">Adjust your monthly target to see gap analysis.</p>
                        </div>
                    </div>

                </div>
            </div>
        </main>
      </div>

      {/* --- MANAGE SOURCE MODAL --- */}
      {showManageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowManageModal(false)}></div>
            <div className="relative w-full max-w-md glass-modal rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-pop">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-lg font-bold">{editingSource ? 'Edit Source' : 'New Income Stream'}</h3>
                    <button onClick={() => setShowManageModal(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-xmark"></i></button>
                </div>
                <form onSubmit={handleSaveSource} className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Source Name</label>
                        <input name="name" defaultValue={editingSource?.name} required className="w-full glass-input rounded-xl p-3 mt-1" placeholder="e.g. Google Salary" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Type</label>
                            <select name="type" defaultValue={editingSource?.type || 'Salary'} className="w-full glass-input rounded-xl p-3 mt-1 bg-[#1a1a1a]">
                                <option>Salary</option><option>Freelance</option><option>Business</option><option>Investment</option><option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Frequency</label>
                            <select name="frequency" defaultValue={editingSource?.frequency || 'Monthly'} className="w-full glass-input rounded-xl p-3 mt-1 bg-[#1a1a1a]">
                                <option>Monthly</option><option>Weekly</option><option>Bi-Weekly</option><option>One-time</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Expected Amount</label>
                        <div className="relative mt-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <input type="number" name="amount" defaultValue={editingSource?.amount} required className="w-full glass-input rounded-xl py-3 pl-8" placeholder="0.00" />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg transition-all mt-4">
                        {editingSource ? 'Update Source' : 'Add Source'}
                    </button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}
