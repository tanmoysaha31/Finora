import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';

export default function Dashboard() {
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // --- STATE MANAGEMENT ---
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: ''
  });
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // --- UTILITIES ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getIconForCategory = (category) => {
    const map = {
      food: 'fa-burger',
      'food & dining': 'fa-burger',
      transport: 'fa-car',
      transportation: 'fa-car',
      shopping: 'fa-bag-shopping',
      entertainment: 'fa-film',
      utility: 'fa-bolt',
      utilities: 'fa-bolt',
      salary: 'fa-money-bill-wave',
      'income': 'fa-money-bill-wave',
      tech: 'fa-laptop-code',
      health: 'fa-heart-pulse',
      others: 'fa-ellipsis',
      'others': 'fa-ellipsis'
    };
    return map[(category || '').toLowerCase()] || 'fa-circle-dollar-to-slot';
  };

  const handleLogout = () => {
    localStorage.removeItem('finora_token');
    localStorage.removeItem('finora_user_id');
    navigate('/login');
  };

  const handleDeleteTransaction = async (id) => {
    try {
      const r = await fetch(`${API_BASE}/api/transactions/${id}`, { method: 'DELETE' });
      if (r.ok) {
        const response = await r.json();
        const deletedAmount = response.amount || 0;
        
        // Filter out the deleted transaction
        const updatedTransactions = data.transactions.filter(t => t.id !== id);
        
        // Recalculate balance
        const newBalance = data.user.totalBalance - deletedAmount;
        
        // Update data with new transactions and balance
        setData({ 
          ...data, 
          transactions: updatedTransactions,
          user: {
            ...data.user,
            totalBalance: Number(newBalance.toFixed(2))
          }
        });
      }
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  // --- FILTER LOGIC ---
  // Calculate active filters count
  useEffect(() => {
    let count = 0;
    if (search) count++;
    if (filters.category) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    if (filters.minAmount) count++;
    if (filters.maxAmount) count++;
    setActiveFiltersCount(count);
  }, [search, filters]);

  const filteredTransactions = (data?.transactions || []).filter(t => {
    const query = search.toLowerCase().trim();
    const matchesSearch = !query || t.title.toLowerCase().includes(query) || t.category.toLowerCase().includes(query);
    
    const matchesCategory = !filters.category || t.category.toLowerCase() === filters.category.toLowerCase();
    
    let matchesDate = true;
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      matchesDate = matchesDate && new Date(t.date) >= startDate;
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && new Date(t.date) <= end;
    }

    let matchesAmount = true;
    const absAmount = Math.abs(t.amount);
    if (filters.minAmount !== '') matchesAmount = matchesAmount && absAmount >= Number(filters.minAmount);
    if (filters.maxAmount !== '') matchesAmount = matchesAmount && absAmount <= Number(filters.maxAmount);

    return matchesSearch && matchesCategory && matchesDate && matchesAmount;
  });

  const resetFilters = () => {
    setSearch('');
    setFilters({ category: '', startDate: '', endDate: '', minAmount: '', maxAmount: '' });
    setShowAdvancedSearch(false);
  };

  // --- DATA FETCHING ---
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        let userId = null;
        try { userId = localStorage.getItem('finora_user_id'); } catch (_) {}
        
        const url = userId ? `${API_BASE}/api/dashboard?userId=${encodeURIComponent(userId)}` : `${API_BASE}/api/dashboard`;
        const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
        const payload = await res.json();
        
        if (!res.ok || !payload?.user) throw new Error(payload?.error || 'Failed to load dashboard');
        setData(payload);
      } catch (err) {
        setData({ 
            user: { username: 'Guest', plan: 'Free', avatar: '', totalBalance: 0 }, 
            chartData: { labels: [], income: [], expense: [] }, 
            goals: [], transactions: [], contacts: [] 
        });
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  // --- CHART RENDERING ---
  useEffect(() => {
    if (!data || !chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const ctx = chartRef.current.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(124, 58, 237, 0.4)');
    gradient.addColorStop(1, 'rgba(124, 58, 237, 0.0)');

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.chartData.labels,
        datasets: [
          {
            label: 'Income',
            data: data.chartData.income,
            borderColor: '#d946ef',
            backgroundColor: gradient,
            borderWidth: 3,
            pointBackgroundColor: '#1a1a1a',
            pointBorderColor: '#d946ef',
            pointBorderWidth: 2,
            pointRadius: 6,
            fill: true,
            tension: 0.4
          },
          {
            label: 'Expenses',
            data: data.chartData.expense,
            borderColor: 'rgba(255,255,255,0.3)',
            borderDash: [6, 6],
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: 'rgba(255, 255, 255, 0.03)' }, ticks: { color: '#6b7280', font: { size: 10 }, callback: v => '$' + v }, border: { display: false } },
          x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 10 } } }
        }
      }
    });

    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [data]);

  // --- STYLES ---
  const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #1a1a1a; }
    h1, h2, h3, h4, h5, h6 { font-family: 'Plus Jakarta Sans', sans-serif; }
    .glass-panel { background: rgba(36, 36, 36, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3); transition: all 0.3s ease; }
    .glass-panel:hover { border-color: rgba(255, 255, 255, 0.08); box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4); }
    .purple-card-gradient { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%); }
    .hover-lift { transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
    .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3); }
    .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .bg-blob { position: fixed; border-radius: 50%; filter: blur(100px); opacity: 0.15; z-index: -1; pointer-events: none; }
    .blob-1 { top: -10%; left: -10%; width: 600px; height: 600px; background: #7c3aed; }
    .blob-2 { bottom: -10%; right: -10%; width: 500px; height: 500px; background: #2563eb; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .skeleton { background: linear-gradient(90deg, #2a2a2a 25%, #333333 50%, #2a2a2a 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    
    /* Animation for Advanced Search Panel */
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-slide-down { animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `;

  return (
    <div className="flex h-screen w-screen antialiased selection:bg-purple-500 selection:text-white overflow-hidden text-white bg-[#1a1a1a]">
      <style>{customStyles}</style>

      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>

      {mobileOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden" onClick={() => setMobileOpen(false)}></div>}

      {/* SIDEBAR */}
      <aside className={`w-72 flex-shrink-0 lg:flex flex-col justify-between p-6 border-r border-white/5 bg-[#1a1a1a]/95 backdrop-blur-xl fixed h-full z-40 transition-all duration-300 ${mobileOpen ? 'flex' : 'hidden'}`}>
        <div>
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              <i className="fa-solid fa-bolt"></i>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white font-display">Finora</span>
          </div>

          <div className="purple-card-gradient rounded-3xl p-6 mb-8 shadow-xl hover-lift cursor-pointer relative group">
            <div className="absolute -top-2 -right-2 p-4 opacity-20 transform rotate-12 group-hover:rotate-6 transition-transform duration-500">
              <i className="fa-solid fa-wallet text-7xl text-white"></i>
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-white/90 uppercase tracking-widest bg-white/20 px-2 py-1 rounded-md backdrop-blur-md">Balance</span>
                <i className="fa-solid fa-eye text-white/60 hover:text-white cursor-pointer transition-colors"></i>
              </div>
              <div>
                {loading ? <div className="skeleton h-8 w-3/4 mb-2 rounded"></div> : (
                  <>
                    <h2 className="text-3xl font-bold text-white tracking-tight animate-fade-in">{formatCurrency(data?.user?.totalBalance || 0)}</h2>
                    <p className="text-indigo-200 text-xs mt-1 font-mono tracking-wider">**** **** **** 4289</p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 mt-4 text-white/80 text-xs">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span>Live Updated</span>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">Main Menu</p>
            <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/10 text-white font-medium border-l-4 border-purple-500 shadow-inner transition-all group">
              <i className="fa-solid fa-grid-2 w-5 text-center group-hover:text-purple-400 transition-colors"></i> <span>Dashboard</span>
            </Link>
            <Link to="/addnewexpense" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group border-l-4 border-transparent">
              <i className="fa-solid fa-plus w-5 text-center group-hover:text-purple-400 transition-colors"></i> <span>Add new expense</span>
            </Link>
            <Link to="/goals" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group border-l-4 border-transparent">
              <i className="fa-solid fa-bullseye w-5 text-center group-hover:text-purple-400 transition-colors"></i> <span>Saving Goal</span>
            </Link>
            <Link to="/budget" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group border-l-4 border-transparent">
              <i className="fa-solid fa-scale-balanced w-5 text-center group-hover:text-purple-400 transition-colors"></i> <span>Budget Planner</span>
            </Link>
            <Link to="/transactions" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group border-l-4 border-transparent">
              <i className="fa-solid fa-list w-5 text-center group-hover:text-purple-400 transition-colors"></i> <span>Transactions</span>
            </Link>
            <Link to="/income" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group border-l-4 border-transparent">
              <i className="fa-solid fa-money-bill-wave w-5 text-center group-hover:text-purple-400 transition-colors"></i> <span>Income</span>
            </Link>
            <Link to="/debt" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group border-l-4 border-transparent">
              <i className="fa-solid fa-chart-simple w-5 text-center group-hover:text-purple-400 transition-colors"></i> <span>Debt Tracker</span>
            </Link>
            <Link to="/payments" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group border-l-4 border-transparent">
              <i className="fa-regular fa-credit-card w-5 text-center group-hover:text-purple-400 transition-colors"></i> <span>Payments</span>
            </Link>
            <Link to="/cards" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group border-l-4 border-transparent">
              <i className="fa-solid fa-wallet w-5 text-center group-hover:text-purple-400 transition-colors"></i> <span>My Cards</span>
            </Link>
          </nav>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Preferences</p>
          <Link to="/account" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all">
            <i className="fa-regular fa-user w-5 text-center"></i> Account
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all mt-2 w-full text-left">
            <i className="fa-solid fa-arrow-right-from-bracket w-5 text-center"></i> Log Out
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER & MAIN CONTENT */}
      <div className="flex-1 lg:ml-72 flex flex-col h-full relative z-10 transition-all duration-300">
        
        {/* HEADER */}
        <header className="flex-shrink-0 px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-3 flex flex-col md:flex-row justify-between items-center gap-2 md:gap-3 bg-[#1a1a1a]/80 backdrop-blur-md sticky top-0 z-20 border-b border-white/5">
          <div className="flex w-full md:hidden justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm"><i className="fa-solid fa-bolt"></i></div>
              <span className="font-bold text-lg">Finora</span>
            </div>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"><i className="fa-solid fa-bars text-xl"></i></button>
          </div>

          {/* === SEARCH & ADVANCED FILTERS === */}
          <div className="relative w-full md:w-96 group z-50">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <input 
                      type="text" 
                      placeholder="Search transactions..." 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onFocus={() => setShowAdvancedSearch(true)}
                      className="w-full bg-[#242424] border border-white/10 text-gray-300 rounded-2xl py-3.5 pl-12 pr-4
                                 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:bg-[#2a2a2a] transition-all
                                 placeholder:text-gray-600 text-sm font-medium shadow-sm"
                    />
                    <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors"></i>
                </div>
                
                {/* Advanced Toggle with Active Filters Badge */}
                <button 
                    onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                    className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all relative ${showAdvancedSearch || activeFiltersCount > 0 ? 'bg-purple-500 text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                >
                    <i className="fa-solid fa-sliders text-sm"></i>
                    {activeFiltersCount > 0 && <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold shadow-lg">{activeFiltersCount}</span>}
                </button>
            </div>

            {/* Advanced Search Panel */}
            {showAdvancedSearch && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl animate-slide-down overflow-hidden z-50">
                    <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                          <i className="fa-solid fa-filter text-purple-400"></i>
                          Advanced Filters {activeFiltersCount > 0 && <span className="bg-purple-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold">{activeFiltersCount} Active</span>}
                        </h4>
                        <button onClick={resetFilters} className="text-[10px] text-red-400 hover:text-red-300 font-medium transition-colors flex items-center gap-1">
                          <i className="fa-solid fa-rotate-right"></i> Reset All
                        </button>
                    </div>
                    
                    <div className="space-y-5">
                        {/* 1. Category Selection */}
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-2">
                              <i className="fa-solid fa-tag text-purple-400"></i> Category
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {['Food','Transport','Shopping','Entertainment','Utility','Health','Tech','Salary','Others'].map(cat => (
                                    <button 
                                        key={cat} 
                                        onClick={() => setFilters({...filters, category: filters.category === cat ? '' : cat})}
                                        className={`py-2.5 rounded-lg text-xs font-semibold transition-all border text-center transform hover:scale-105 ${filters.category === cat ? 'bg-purple-500/30 border-purple-500 text-purple-200 shadow-lg shadow-purple-500/20' : 'bg-[#242424] border-white/5 text-gray-400 hover:bg-white/5 hover:border-white/10'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Date Range */}
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-2">
                              <i className="fa-solid fa-calendar text-purple-400"></i> Date Range
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <input 
                                      type="date" 
                                      value={filters.startDate} 
                                      onChange={e => setFilters({...filters, startDate: e.target.value})} 
                                      className="w-full bg-[#242424] border border-white/10 text-white text-xs rounded-lg px-3 py-2.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all" 
                                      placeholder="From" 
                                    />
                                    <span className="text-[8px] text-gray-500 mt-1 block">Start Date</span>
                                </div>
                                <div>
                                    <input 
                                      type="date" 
                                      value={filters.endDate} 
                                      onChange={e => setFilters({...filters, endDate: e.target.value})} 
                                      className="w-full bg-[#242424] border border-white/10 text-white text-xs rounded-lg px-3 py-2.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all" 
                                      placeholder="To" 
                                    />
                                    <span className="text-[8px] text-gray-500 mt-1 block">End Date</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. Amount Range */}
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-2">
                              <i className="fa-solid fa-dollar-sign text-purple-400"></i> Amount Range
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <input 
                                      type="number" 
                                      placeholder="Min Amount" 
                                      value={filters.minAmount} 
                                      onChange={e => setFilters({...filters, minAmount: e.target.value})} 
                                      className="w-full bg-[#242424] border border-white/10 text-white text-xs rounded-lg px-3 py-2.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all" 
                                    />
                                    <span className="text-[8px] text-gray-500 mt-1 block">Minimum</span>
                                </div>
                                <div>
                                    <input 
                                      type="number" 
                                      placeholder="Max Amount" 
                                      value={filters.maxAmount} 
                                      onChange={e => setFilters({...filters, maxAmount: e.target.value})} 
                                      className="w-full bg-[#242424] border border-white/10 text-white text-xs rounded-lg px-3 py-2.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all" 
                                    />
                                    <span className="text-[8px] text-gray-500 mt-1 block">Maximum</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* View Results Button */}
                    <button onClick={() => setShowAdvancedSearch(false)} className="w-full mt-6 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-sm py-3 rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg flex items-center justify-center gap-2 transform hover:scale-105">
                        <i className="fa-solid fa-eye"></i>
                        <span>View Results</span>
                        <span className="bg-black/30 px-2.5 py-0.5 rounded-lg text-xs font-semibold">{filteredTransactions.length}</span>
                    </button>
                </div>
            )}
          </div>

          {/* Profile & Actions */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            <Link 
              to="/quiz" 
              className="hidden md:inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out border border-purple-400/20 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
              <i className="fa-solid fa-brain text-base relative z-10 group-hover:rotate-12 transition-transform duration-300"></i>
              <span className="text-sm relative z-10 tracking-wide">Take a Quiz</span>
              <div className="absolute -right-1 -top-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            </Link>
            <Link 
              to="/finance-knowledge" 
              className="hidden md:inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-yellow-500 to-amber-500 text-white font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out border border-orange-400/20 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
              <i className="fa-solid fa-lightbulb text-base relative z-10 group-hover:rotate-12 transition-transform duration-300"></i>
              <span className="text-sm relative z-10 tracking-wide">Finance Knowledge</span>
            </Link>
            <button className="w-11 h-11 rounded-full bg-[#242424] border border-white/5 text-gray-400 hover:text-white hover:bg-white/5 hover:border-purple-500/30 transition-all relative flex items-center justify-center group">
              <i className="fa-solid fa-bell group-hover:animate-swing"></i>
              <span className="absolute top-2.5 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#242424] shadow-sm"></span>
            </button>
            <div className="h-8 w-[1px] bg-white/10 mx-2 hidden sm:block"></div>
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="text-right hidden md:block">
                {loading ? <div className="skeleton h-8 w-24"></div> : (
                  <>
                    <p className="text-sm font-bold text-white leading-tight">{data?.user?.username}</p>
                    <p className="text-xs text-gray-500">{data?.user?.plan}</p>
                  </>
                )}
              </div>
              <div className="w-11 h-11 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 p-[2px]">
                 {data?.user?.avatar ? <img src={data.user.avatar} className="w-full h-full rounded-full object-cover border-2 border-[#1a1a1a]" /> : <div className="w-full h-full rounded-full bg-[#242424] flex items-center justify-center"><i className="fa-solid fa-user text-gray-500"></i></div>}
              </div>
            </div>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-hidden p-2 md:p-3 custom-scroll min-h-0">
          <div className="max-w-7xl mx-auto h-full flex flex-col min-h-0">
            
            {/* GRID LAYOUT */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 lg:gap-3 flex-1 min-h-0">
                
              {/* LEFT: CHARTS & GOALS */}
              <div className="xl:col-span-2 space-y-2.5 lg:space-y-3 flex flex-col min-h-0">
                
                {/* CHART */}
                <div className="glass-panel rounded-3xl p-5 md:p-6 relative overflow-hidden group flex-shrink-0">
                  <div className="flex flex-row justify-between items-center mb-4 z-10 relative">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-1.5">Savings Overview</h3>
                      <p className="text-sm md:text-base text-gray-500">Compare your income vs expenses</p>
                    </div>
                    <select className="bg-black/30 border border-white/10 text-gray-300 text-base md:text-lg rounded-xl px-5 py-2.5 focus:outline-none focus:border-purple-500"><option>This Year</option></select>
                  </div>
                  <div className="relative w-full h-[260px] md:h-[300px]">
                    <canvas ref={chartRef}></canvas>
                  </div>
                </div>

                {/* GOALS */}
                <div className="glass-panel rounded-3xl p-2 md:p-2.5 flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-1 flex-shrink-0">
                    <h3 className="text-base md:text-lg font-bold text-white mb-0">Saving Goals</h3>
                    <button onClick={() => navigate('/goals')} className="w-5 h-5 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400"><i className="fa-solid fa-arrow-right text-[9px]"></i></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-1.5 flex-1 min-h-0 overflow-y-auto custom-scroll">
                    {loading ? (
                        <>
                            <div className="bg-[#242424] h-full min-h-[60px] rounded-lg skeleton opacity-50"></div>
                            <div className="bg-[#242424] h-full min-h-[60px] rounded-lg skeleton opacity-50"></div>
                        </>
                    ) : (
                        data?.goals?.map(goal => (
                            <div key={goal.id} className="bg-white text-gray-900 rounded-lg p-1.5 flex justify-between items-center shadow-lg hover-lift cursor-pointer group h-full relative overflow-hidden min-h-[60px]">
                                <div className="absolute -right-2 -bottom-2 opacity-5 text-3xl md:text-4xl select-none pointer-events-none"><i className={`fa-solid ${goal.icon}`}></i></div>
                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div>
                                        <h4 className="text-base md:text-lg font-bold tracking-tight text-gray-800">{formatCurrency(goal.target)}</h4>
                                        <p className="text-[11px] md:text-xs font-semibold text-gray-500 uppercase tracking-wide mt-0.5">{goal.title}</p>
                                    </div>
                                    <p className="text-[9px] md:text-[11px] font-medium text-gray-400 mt-1 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-green-500"></span> {goal.items}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1 relative z-10">
                                    <div className={`w-6 h-6 md:w-7 md:h-7 rounded-md ${goal.bg} flex items-center justify-center text-white shadow-md`}><i className={`fa-solid ${goal.icon} text-[10px] md:text-xs`}></i></div>
                                    <span className="text-[9px] md:text-[11px] font-bold text-indigo-600 group-hover:underline">View</span>
                                </div>
                                <div className="absolute bottom-0 left-0 h-[2px] bg-gray-100 w-full"><div className={`h-full ${goal.bg} opacity-50`} style={{ width: `${(goal.current/goal.target)*100}%` }}></div></div>
                            </div>
                        ))
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT: TRANSACTIONS & FREQUENT */}
              <div className="space-y-2 lg:space-y-3 flex flex-col h-full min-h-0">
                
                {/* TRANSACTIONS */}
                <div className="glass-panel rounded-3xl p-3 md:p-4 flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-3 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg md:text-xl font-bold text-white">Transactions</h3>
                      {filteredTransactions.length > 0 && filteredTransactions.length < (data?.transactions?.length || 0) && (
                        <span className="bg-purple-500/20 border border-purple-500/30 text-purple-200 text-xs px-2.5 py-1 rounded-full font-semibold">
                          {filteredTransactions.length} of {data?.transactions?.length}
                        </span>
                      )}
                    </div>
                    <button onClick={() => navigate('/transactions')} className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors flex items-center gap-1">
                      <span>View All</span> <i className="fa-solid fa-arrow-right text-[10px]"></i>
                    </button>
                  </div>
                  
                  {/* Filter Tags Display */}
                  {activeFiltersCount > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5 flex-shrink-0">
                      {search && (
                        <div className="inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-200 px-2 py-1 rounded-lg text-[10px] font-medium">
                          <i className="fa-solid fa-magnifying-glass text-[9px]"></i>
                          <span>{search}</span>
                          <button onClick={() => setSearch('')} className="hover:text-blue-100 ml-0.5"><i className="fa-solid fa-x text-[8px]"></i></button>
                        </div>
                      )}
                      {filters.category && (
                        <div className="inline-flex items-center gap-1.5 bg-green-500/20 border border-green-500/30 text-green-200 px-2 py-1 rounded-lg text-[10px] font-medium">
                          <i className="fa-solid fa-tag text-[9px]"></i>
                          <span>{filters.category}</span>
                          <button onClick={() => setFilters({...filters, category: ''})} className="hover:text-green-100 ml-0.5"><i className="fa-solid fa-x text-[8px]"></i></button>
                        </div>
                      )}
                      {(filters.startDate || filters.endDate) && (
                        <div className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-200 px-2 py-1 rounded-lg text-[10px] font-medium">
                          <i className="fa-solid fa-calendar text-[9px]"></i>
                          <span>{filters.startDate || 'Start'} to {filters.endDate || 'End'}</span>
                          <button onClick={() => setFilters({...filters, startDate: '', endDate: ''})} className="hover:text-amber-100 ml-0.5"><i className="fa-solid fa-x text-[8px]"></i></button>
                        </div>
                      )}
                      {(filters.minAmount || filters.maxAmount) && (
                        <div className="inline-flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 text-red-200 px-2 py-1 rounded-lg text-[10px] font-medium">
                          <i className="fa-solid fa-dollar-sign text-[9px]"></i>
                          <span>${filters.minAmount || '0'} - ${filters.maxAmount || '∞'}</span>
                          <button onClick={() => setFilters({...filters, minAmount: '', maxAmount: ''})} className="hover:text-red-100 ml-0.5"><i className="fa-solid fa-x text-[8px]"></i></button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="space-y-1.5 overflow-y-auto pr-2 flex-1 min-h-0 scrollbar-hide">
                    {loading ? <div className="skeleton h-10 w-full rounded-lg"></div> : (
                      filteredTransactions.length > 0 ? filteredTransactions.map((tx, index) => {
                        const icon = tx.icon || getIconForCategory(tx.category);
                        const isPositive = tx.amount > 0;
                        return (
                          <div key={tx.id}>
                            <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-white/5 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-[#2a2a2a] flex items-center justify-center text-gray-400 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-inner flex-shrink-0"><i className={`fa-solid ${icon} text-sm`}></i></div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-xs md:text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">{tx.title}</h4>
                                  <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 truncate">{tx.category} • {formatDate(tx.date)}</p>
                                </div>
                              </div>
                              <div className="flex items-center flex-none gap-2 ml-2">
                                <div className={`w-[80px] md:w-[96px] text-right font-display font-bold text-xs md:text-sm ${isPositive ? 'text-emerald-400' : 'text-white'}`}>{isPositive ? '+' : ''}{formatCurrency(tx.amount)}</div>
                                <button onClick={() => handleDeleteTransaction(tx.id)} className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-white/10 hover:bg-red-500/30 text-gray-300 hover:text-white flex items-center justify-center transition-colors flex-shrink-0"><i className="fa-solid fa-trash text-[10px]"></i></button>
                                <button onClick={() => navigate(`/emotional-state/${tx.id}`)} className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-white/10 hover:bg-purple-600 text-gray-300 hover:text-white flex items-center justify-center transition-colors flex-shrink-0"><i className="fa-solid fa-chevron-right text-[10px]"></i></button>
                              </div>
                            </div>
                            {index !== filteredTransactions.length - 1 && <div className="h-[1px] bg-white/5 w-[90%] mx-auto my-0.5"></div>}
                          </div>
                        )
                      }) : (
                        <div className="h-full flex flex-col items-center justify-center text-center py-10">
                          <i className="fa-solid fa-inbox text-4xl text-gray-600 mb-3"></i>
                          <p className="text-gray-500 text-sm font-medium">No transactions match your filters.</p>
                          <button onClick={resetFilters} className="text-purple-400 hover:text-purple-300 text-xs font-semibold mt-3 transition-colors flex items-center gap-1">
                            <i className="fa-solid fa-rotate-right"></i> Clear Filters
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* FREQUENT PAYS */}
                <div className="glass-panel rounded-3xl p-3 md:p-4 flex-shrink-0">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg md:text-xl font-bold text-white">Frequent Pays</h3>
                    <button className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400"><i className="fa-solid fa-gear text-xs"></i></button>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
                    {loading ? <div className="skeleton w-14 h-14 rounded-full flex-shrink-0"></div> : (
                      <>
                        {data?.contacts?.map(c => (
                          <div key={c.id} className="flex flex-col items-center gap-2 min-w-[70px] cursor-pointer group">
                            <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-600 p-[3px] flex items-center justify-center relative group-hover:border-purple-500 group-hover:rotate-12 transition-all duration-500">
                              <div className="w-full h-full rounded-full overflow-hidden transform group-hover:-rotate-12 transition-transform duration-500">
                                {c.avatar ? <img src={c.avatar} alt={c.name} className="w-full h-full rounded-full object-cover" /> : <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold">{c.name.charAt(0)}</div>}
                              </div>
                              <div className="absolute -bottom-1 -right-1 bg-purple-500 w-4 h-4 rounded-full flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"><i className="fa-solid fa-check text-white"></i></div>
                            </div>
                            <span className="text-xs text-gray-400 group-hover:text-white font-medium transition-colors">{c.name}</span>
                          </div>
                        ))}
                        <div className="flex flex-col items-center gap-2 cursor-pointer group min-w-[70px]">
                          <div className="w-14 h-14 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-purple-600 group-hover:text-white transition-all hover:rotate-90 duration-300"><i className="fa-solid fa-plus"></i></div>
                          <span className="text-xs text-gray-500 group-hover:text-white transition-colors">Add New</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}