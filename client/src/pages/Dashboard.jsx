import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';

export default function Dashboard() {
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // State Management
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- Utility Functions (Ported from HTML Script) ---
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
      transport: 'fa-car',
      shopping: 'fa-bag-shopping',
      entertainment: 'fa-film',
      utility: 'fa-bolt',
      salary: 'fa-money-bill-wave',
      tech: 'fa-laptop-code'
    };
    return map[(category || '').toLowerCase()] || 'fa-circle-dollar-to-slot';
  };

  const handleLogout = () => {
    // Add your logout logic here
    navigate('/login');
  };

  // --- 1. Data Fetching Effect (Server) ---
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        let userId = null;
        try {
          userId = localStorage.getItem('finora_user_id');
        } catch (_) {}
        const url = userId ? `${API_BASE}/api/dashboard?userId=${encodeURIComponent(userId)}` : `${API_BASE}/api/dashboard`;
        const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
        const payload = await res.json();
        if (!res.ok || !payload?.user) throw new Error(payload?.error || 'Failed to load dashboard');
        setData(payload);
      } catch (err) {
        setData({ user: { username: 'Guest', plan: 'Free', avatar: 'https://cdn-icons-png.flaticon.com/512/2922/2922510.png', totalBalance: 0 }, chartData: { labels: [], income: [], expense: [] }, goals: [], transactions: [], contacts: [] });
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  // --- 2. Chart Rendering Effect ---
  useEffect(() => {
    if (!data || !chartRef.current) return;

    // Destroy existing chart to prevent memory leaks/glitches
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    // Create Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(124, 58, 237, 0.4)'); // Purple
    gradient.addColorStop(1, 'rgba(124, 58, 237, 0.0)');

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.chartData.labels,
        datasets: [
          {
            label: 'Income',
            data: data.chartData.income,
            borderColor: '#d946ef', // Pink/Purple
            backgroundColor: gradient,
            borderWidth: 3,
            pointBackgroundColor: '#1a1a1a',
            pointBorderColor: '#d946ef',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
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
            pointHoverRadius: 6,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleColor: '#fff',
            bodyColor: '#ccc',
            padding: 10,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
              }
            }
          }
        },
        scales: {
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.03)' },
            ticks: { 
              color: '#6b7280',
              font: { family: 'Inter', size: 10 },
              callback: function(value) { return '$' + value; }
            },
            border: { display: false }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#6b7280', font: { family: 'Inter', size: 10 } }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [data]);

  // Filter Transactions Logic
  const filteredTransactions = data?.transactions?.filter(t => {
    if (!search) return true;
    const query = search.toLowerCase();
    return t.title.toLowerCase().includes(query) || t.category.toLowerCase().includes(query);
  }) || [];

  // --- Styles from HTML (Ported) ---
  const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    
    :root {
        --accent-purple: #7c3aed;
        --accent-purple-light: #8b5cf6;
        --accent-pink: #d946ef;
        --accent-blue: #2563eb;
    }
    
    body { font-family: 'Inter', sans-serif; background-color: #1a1a1a; }
    h1, h2, h3, h4, h5, h6 { font-family: 'Plus Jakarta Sans', sans-serif; }

    /* Glassmorphism */
    .glass-panel {
        background: rgba(36, 36, 36, 0.7);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.05);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
    }
    .glass-panel:hover {
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
    }

    .purple-card-gradient {
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
    }

    /* Animations */
    .hover-lift { transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
    .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.1); }
    
    .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    /* Background Blobs */
    .bg-blob {
        position: fixed;
        border-radius: 50%;
        filter: blur(100px);
        opacity: 0.15;
        z-index: -1;
        pointer-events: none;
        will-change: transform;
    }
    .blob-1 { top: -10%; left: -10%; width: 600px; height: 600px; background: #7c3aed; animation: float 20s infinite alternate ease-in-out; }
    .blob-2 { bottom: -10%; right: -10%; width: 500px; height: 500px; background: #2563eb; animation: float 25s infinite alternate-reverse ease-in-out; }
    .blob-3 { top: 40%; left: 40%; width: 400px; height: 400px; background: #d946ef; opacity: 0.08; animation: float 22s infinite alternate ease-in-out; }
    @keyframes float { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(40px, -40px) scale(1.05); } }

    /* Custom Scrollbar */
    .custom-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
    .custom-scroll::-webkit-scrollbar-track { background: transparent; }
    .custom-scroll::-webkit-scrollbar-thumb { background: #444; border-radius: 10px; }
    .custom-scroll::-webkit-scrollbar-thumb:hover { background: #555; }
    
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

    /* Skeleton Loading */
    .skeleton {
        background: linear-gradient(90deg, #2a2a2a 25%, #333333 50%, #2a2a2a 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 0.5rem;
    }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  `;

  return (
    <div className="flex h-screen w-screen antialiased selection:bg-purple-500 selection:text-white overflow-hidden text-white bg-[#1a1a1a]">
      <style>{customStyles}</style>

      {/* Ambient Background */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <div className="bg-blob blob-3"></div>

      {/* OVERLAY (Mobile) */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden" 
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside className={`w-72 flex-shrink-0 lg:flex flex-col justify-between p-6 border-r border-white/5 bg-[#1a1a1a]/95 backdrop-blur-xl fixed h-full z-40 transition-all duration-300 ${mobileOpen ? 'flex' : 'hidden'}`}>
        <div>
          {/* Brand */}
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/20">
              <i className="fa-solid fa-bolt"></i>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white font-display">Finora</span>
          </div>

          {/* Total Balance Card */}
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
                {loading ? (
                  <div className="skeleton h-8 w-3/4 mb-2 rounded"></div>
                ) : (
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

          {/* Navigation Menu */}
          <nav className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">Main Menu</p>
            
            <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/10 text-white font-medium border-l-4 border-purple-500 shadow-inner transition-all group">
              <i className="fa-solid fa-grid-2 w-5 text-center group-hover:text-purple-400 transition-colors"></i> 
              <span>Dashboard</span>
            </Link>
            
            <Link to="/addnewexpense" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group border-l-4 border-transparent">
              <i className="fa-solid fa-plus w-5 text-center group-hover:text-purple-400 transition-colors"></i> 
              <span>Add new expense</span>
            </Link>
            
            <Link to="/goals" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group border-l-4 border-transparent">
              <i className="fa-solid fa-bullseye w-5 text-center group-hover:text-purple-400 transition-colors"></i> 
              <span>Saving Goal</span>
            </Link>
            
            <Link to="/budget" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group border-l-4 border-transparent">
              <i className="fa-solid fa-scale-balanced w-5 text-center group-hover:text-purple-400 transition-colors"></i> 
              <span>Budget Planner</span>
            </Link>
            
            <Link to="/payments" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group border-l-4 border-transparent">
              <i className="fa-regular fa-credit-card w-5 text-center group-hover:text-purple-400 transition-colors"></i> 
              <span>Payments</span>
            </Link>
            
            <Link to="/cards" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group border-l-4 border-transparent">
              <i className="fa-solid fa-wallet w-5 text-center group-hover:text-purple-400 transition-colors"></i> 
              <span>My Cards</span>
            </Link>
          </nav>
        </div>

        {/* Bottom Preferences */}
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
        
        {/* TOP NAVIGATION BAR */}
        <header className="flex-shrink-0 px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-3 flex flex-col md:flex-row justify-between items-center gap-2 md:gap-3 bg-[#1a1a1a]/80 backdrop-blur-md sticky top-0 z-20 border-b border-white/5">
            
          {/* Mobile Toggle & Brand */}
          <div className="flex w-full md:hidden justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm">
                <i className="fa-solid fa-bolt"></i>
              </div>
              <span className="font-bold text-lg">Finora</span>
            </div>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
              <i className="fa-solid fa-bars text-xl"></i>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-96 group">
            <input 
              type="text" 
              placeholder="Search transactions, bills..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#242424] border border-white/10 text-gray-300 rounded-full py-3.5 pl-12 pr-4
                         focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:bg-[#2a2a2a] transition-all
                         placeholder:text-gray-600 text-sm font-medium shadow-sm"
            />
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors"></i>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:block">
              <span className="text-[10px] bg-white/5 text-gray-500 px-2 py-1 rounded border border-white/5">⌘ K</span>
            </div>
          </div>

          {/* Profile & Actions */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            <button className="w-11 h-11 rounded-full bg-[#242424] border border-white/5 text-gray-400 hover:text-white hover:bg-white/5 hover:border-purple-500/30 transition-all relative flex items-center justify-center group">
              <i className="fa-solid fa-bell group-hover:animate-swing"></i>
              <span className="absolute top-2.5 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#242424] shadow-sm"></span>
            </button>

            <button className="w-11 h-11 rounded-full bg-[#242424] border border-white/5 text-gray-400 hover:text-white hover:bg-white/5 hover:border-purple-500/30 transition-all flex items-center justify-center hidden sm:flex">
              <i className="fa-solid fa-headset"></i>
            </button>

            <div className="h-8 w-[1px] bg-white/10 mx-2 hidden sm:block"></div>

            {/* User Profile */}
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="text-right hidden md:block">
                {loading ? (
                  <>
                    <div className="skeleton h-4 w-24 mb-1 ml-auto"></div>
                    <div className="skeleton h-3 w-16 ml-auto"></div>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold text-white leading-tight">{data?.user?.username}</p>
                    <p className="text-xs text-gray-500">{data?.user?.plan}</p>
                  </>
                )}
              </div>
              
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 p-[2px]">
                   {data?.user?.avatar ? (
                     <img src={data.user.avatar} alt="User" className="w-full h-full rounded-full object-cover border-2 border-[#1a1a1a]" />
                   ) : (
                     <div className="w-full h-full rounded-full bg-[#242424] flex items-center justify-center">
                       <i className="fa-solid fa-user text-gray-500"></i>
                     </div>
                   )}
                </div>
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#1a1a1a] shadow-sm"></div>
              </div>
            </div>
          </div>
        </header>

        {/* DASHBOARD SCROLLABLE AREA */}
        <main className="flex-1 overflow-hidden p-2 md:p-3 custom-scroll min-h-0">
          <div className="max-w-7xl mx-auto h-full flex flex-col min-h-0">
              
            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 lg:gap-3 flex-1 min-h-0">
                
              {/* LEFT COLUMN (Charts & Goals) */}
              <div className="xl:col-span-2 space-y-2.5 lg:space-y-3 flex flex-col min-h-0">

                {/* CHART SECTION */}
                <div className="glass-panel rounded-3xl p-5 md:p-6 relative overflow-hidden group flex-shrink-0">
                  <div className="flex flex-row justify-between items-center mb-4 z-10 relative">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-1.5">Savings Overview</h3>
                      <p className="text-sm md:text-base text-gray-500">Compare your income vs expenses</p>
                    </div>
                    <select className="bg-black/30 border border-white/10 text-gray-300 text-base md:text-lg rounded-xl px-5 py-2.5 focus:outline-none focus:border-purple-500 transition-colors cursor-pointer hover:bg-black/40">
                      <option>This Year</option>
                      <option>Last 6 Months</option>
                    </select>
                  </div>
                  
                  <div className="relative w-full h-[260px] md:h-[300px]">
                    {loading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#242424]/50 rounded-xl z-20 backdrop-blur-sm transition-opacity duration-300">
                        <div className="flex flex-col items-center gap-3">
                          <i className="fa-solid fa-circle-notch fa-spin text-purple-500 text-2xl"></i>
                          <span className="text-xs text-gray-400">Loading Data...</span>
                        </div>
                      </div>
                    )}
                    <canvas ref={chartRef}></canvas>
                  </div>
                </div>

                {/* GOALS SECTION */}
                <div className="glass-panel rounded-3xl p-2 md:p-2.5 flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-1 flex-shrink-0">
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-white mb-0">Saving Goals</h3>
                      <p className="text-xs md:text-sm text-gray-500">Track your dream purchases</p>
                    </div>
                    <button className="w-5 h-5 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 transition-colors">
                      <i className="fa-solid fa-ellipsis text-[9px]"></i>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-1 flex-1 min-h-0 overflow-y-auto custom-scroll">
                    {loading ? (
                      <>
                        <div className="bg-[#242424] h-full min-h-[60px] rounded-lg skeleton opacity-50"></div>
                        <div className="bg-[#242424] h-full min-h-[60px] rounded-lg skeleton opacity-50"></div>
                      </>
                    ) : (
                      data?.goals?.map(goal => (
                        <div key={goal.id} className="bg-white text-gray-900 rounded-lg p-1.5 flex justify-between items-center shadow-lg hover-lift cursor-pointer group h-full relative overflow-hidden min-h-[60px]">
                          {/* Background Pattern */}
                          <div className="absolute -right-2 -bottom-2 opacity-5 text-3xl md:text-4xl select-none pointer-events-none">
                            <i className={`fa-solid ${goal.icon}`}></i>
                          </div>

                          <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                              <h4 className="text-base md:text-lg font-bold tracking-tight text-gray-800">{formatCurrency(goal.target)}</h4>
                              <p className="text-[11px] md:text-xs font-semibold text-gray-500 uppercase tracking-wide mt-0.5">{goal.title}</p>
                            </div>
                            <p className="text-[9px] md:text-[11px] font-medium text-gray-400 mt-1 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-green-500"></span> {goal.items}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-1 relative z-10">
                            <div className={`w-6 h-6 md:w-7 md:h-7 rounded-md ${goal.bg} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                              <i className={`fa-solid ${goal.icon} text-[10px] md:text-xs`}></i>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] md:text-[11px] font-bold text-indigo-600 group-hover:underline">View</span>
                            </div>
                          </div>
                          
                          <div className="absolute bottom-0 left-0 h-[2px] bg-gray-100 w-full">
                            <div className={`h-full ${goal.bg} opacity-50`} style={{ width: `${(goal.current/goal.target)*100}%` }}></div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN (Transactions & Transfer) */}
              <div className="space-y-2 lg:space-y-3 flex flex-col h-full min-h-0">

                {/* TRANSACTIONS LIST */}
                <div className="glass-panel rounded-3xl p-3 md:p-4 flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-2 flex-shrink-0">
                    <h3 className="text-lg md:text-xl font-bold text-white">Transactions</h3>
                    <button className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors">View All</button>
                  </div>
                  
                  <div className="space-y-1.5 overflow-y-auto pr-2 flex-1 min-h-0 scrollbar-hide">
                    {loading ? (
                       <>
                         <div className="flex gap-4 items-center mt-2">
                             <div className="skeleton w-10 h-10 rounded-lg flex-shrink-0"></div>
                             <div className="flex-1 space-y-2">
                                 <div className="skeleton h-3 w-20"></div>
                                 <div className="skeleton h-2 w-12"></div>
                             </div>
                         </div>
                         <div className="flex gap-4 items-center mt-4">
                             <div className="skeleton w-10 h-10 rounded-lg flex-shrink-0"></div>
                             <div className="flex-1 space-y-2">
                                 <div className="skeleton h-3 w-20"></div>
                                 <div className="skeleton h-2 w-12"></div>
                             </div>
                         </div>
                       </>
                    ) : (
                      filteredTransactions.length > 0 ? filteredTransactions.map((tx, index) => {
                        const icon = tx.icon || getIconForCategory(tx.category);
                        const isPositive = tx.amount > 0;
                        return (
                          <div key={tx.id}>
                            <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-white/5 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[#2a2a2a] flex items-center justify-center text-gray-400 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-inner flex-shrink-0">
                                  <i className={`fa-solid ${icon} text-sm`}></i>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-xs md:text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">{tx.title}</h4>
                                  <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 truncate">{tx.category} • {formatDate(tx.date)}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={`font-display font-bold text-xs md:text-sm ${isPositive ? 'text-emerald-400' : 'text-white'}`}>
                                  {isPositive ? '+' : ''}{formatCurrency(tx.amount)}
                                </span>
                                <button className="w-7 h-7 rounded-lg bg-white/5 hover:bg-purple-600 text-gray-400 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0">
                                  <i className="fa-solid fa-chevron-right text-[10px]"></i>
                                </button>
                              </div>
                            </div>
                            {index !== filteredTransactions.length - 1 && <div className="h-[1px] bg-white/5 w-[90%] mx-auto my-0.5"></div>}
                          </div>
                        )
                      }) : (
                        <div className="text-center text-gray-500 py-10 text-sm">No transactions found.</div>
                      )
                    )}
                  </div>
                </div>

                {/* FREQUENT PAYS */}
                <div className="glass-panel rounded-3xl p-3 md:p-4 flex-shrink-0">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg md:text-xl font-bold text-white">Frequent Pays</h3>
                    <button className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 transition-colors">
                      <i className="fa-solid fa-gear text-xs"></i>
                    </button>
                  </div>
                  
                  <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
                    {loading ? (
                      <>
                        <div className="skeleton w-14 h-14 rounded-full flex-shrink-0"></div>
                        <div className="skeleton w-14 h-14 rounded-full flex-shrink-0"></div>
                        <div className="skeleton w-14 h-14 rounded-full flex-shrink-0"></div>
                      </>
                    ) : (
                      <>
                        {data?.contacts?.map(c => (
                          <div key={c.id} className="flex flex-col items-center gap-2 min-w-[70px] cursor-pointer group">
                            <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-600 p-[3px] flex items-center justify-center relative group-hover:border-purple-500 group-hover:rotate-12 transition-all duration-500">
                              <div className="w-full h-full rounded-full overflow-hidden transform group-hover:-rotate-12 transition-transform duration-500">
                                {c.avatar ? (
                                  <img src={c.avatar} alt={c.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold">{c.name.charAt(0)}</div>
                                )}
                              </div>
                              <div className="absolute -bottom-1 -right-1 bg-purple-500 w-4 h-4 rounded-full flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">
                                <i className="fa-solid fa-check text-white"></i>
                              </div>
                            </div>
                            <span className="text-xs text-gray-400 group-hover:text-white font-medium transition-colors">{c.name}</span>
                          </div>
                        ))}
                        <div className="flex flex-col items-center gap-2 cursor-pointer group min-w-[70px]">
                          <div className="w-14 h-14 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-purple-600 group-hover:text-white transition-all hover:rotate-90 duration-300">
                            <i className="fa-solid fa-plus"></i>
                          </div>
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
