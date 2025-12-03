import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Chart from 'chart.js/auto'

export default function Dashboard() {
  const chartRef = useRef(null)
  const [data, setData] = useState(null)
  const [search, setSearch] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [chartReady, setChartReady] = useState(false)

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount)
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  const getIconForCategory = (category) => {
    const map = { food: 'fa-burger', transport: 'fa-car', shopping: 'fa-bag-shopping', entertainment: 'fa-film', utility: 'fa-bolt', salary: 'fa-money-bill-wave', tech: 'fa-laptop-code' }
    return map[(category || '').toLowerCase()] || 'fa-circle-dollar-to-slot'
  }

  useEffect(() => {
    const mock = {
      user: { username: 'Tanmoy Saha', plan: 'Premium Plan', avatar: 'https://cdn-icons-png.flaticon.com/512/2922/2922510.png', totalBalance: 124592.5 },
      chartData: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'], income: [100, 260, 290, 280, 330, 400, 380], expense: [120, 70, 170, 290, 100, 150, 210] },
      goals: [
        { id: 1, title: 'PlayStation 5', current: 350, target: 500, items: 'Console & Game', icon: 'fa-gamepad', bg: 'bg-indigo-600' },
        { id: 2, title: 'Home Renovation', current: 8500, target: 15000, items: 'Roof & Paint', icon: 'fa-paint-roller', bg: 'bg-emerald-600' },
        { id: 3, title: 'Japan Trip', current: 2500, target: 5000, items: 'Flight & Hotel', icon: 'fa-plane', bg: 'bg-rose-600' },
        { id: 4, title: 'New MacBook', current: 1200, target: 2500, items: 'Macbook Pro M3 Max', icon: 'fa-laptop', bg: 'bg-gray-700' }
      ],
      transactions: [
        { id: 't1', title: 'Apple Store', category: 'Tech', amount: -999.0, date: '2023-10-26' },
        { id: 't2', title: 'Upwork Earnings', category: 'Salary', amount: 2450.0, date: '2023-10-25' },
        { id: 't3', title: 'Starbucks', category: 'Food', amount: -15.5, date: '2023-10-25' },
        { id: 't4', title: 'Uber Ride', category: 'Transport', amount: -24.0, date: '2023-10-24' },
        { id: 't5', title: 'Netflix Sub', category: 'Entertainment', amount: -19.99, date: '2023-10-23' },
        { id: 't6', title: 'Whole Foods', category: 'Shopping', amount: -142.8, date: '2023-10-22' },
        { id: 't7', title: 'Electric Bill', category: 'Utility', amount: -85.0, date: '2023-10-20' }
      ],
      contacts: [
        { id: 'c1', name: 'Mom', avatarType: 'icon', icon: 'fa-solid fa-user', avatar: 'https://cdn-icons-png.flaticon.com/512/6997/6997662.png' },
        { id: 'c2', name: 'Rent', avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135706.png' },
        { id: 'c3', name: 'Groceries', avatar: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png' },
        { id: 'c4', name: 'Coffee', avatar: 'https://cdn-icons-png.flaticon.com/512/590/590836.png' },
        { id: 'c5', name: 'Anna', avatar: null }
      ]
    }
    setData(mock)
  }, [])

  useEffect(() => {
    if (!data) return
    try {
      const ctx = chartRef.current?.getContext('2d')
      if (!ctx) return
      const gradient = ctx.createLinearGradient(0, 0, 0, 300)
      gradient.addColorStop(0, 'rgba(124, 58, 237, 0.4)')
      gradient.addColorStop(1, 'rgba(124, 58, 237, 0.0)')
      const c = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.chartData.labels,
          datasets: [
            { label: 'Income', data: data.chartData.income, borderColor: '#d946ef', backgroundColor: gradient, borderWidth: 3, pointBackgroundColor: '#1a1a1a', pointBorderColor: '#d946ef', pointBorderWidth: 2, pointRadius: 6, pointHoverRadius: 8, fill: true, tension: 0.4 },
            { label: 'Expenses', data: data.chartData.expense, borderColor: 'rgba(255,255,255,0.3)', borderDash: [6, 6], borderWidth: 2, pointRadius: 0, pointHoverRadius: 6, tension: 0.4 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#6b7280', font: { family: 'Inter', size: 10 }, callback: (v) => '$' + v }, border: { display: false } }, x: { grid: { display: false }, ticks: { color: '#6b7280', font: { family: 'Inter', size: 10 } } } }
        }
      })
      setChartReady(true)
      return () => c.destroy()
    } catch (_) {}
  }, [data])

  return (
    <div className="flex h-screen w-screen antialiased selection:bg-purple-500 selection:text-white overflow-hidden" style={{ backgroundColor: '#0B0B0F', color: 'white' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-900/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[60%] h-[20%] bg-blue-900/10 rounded-full blur-[100px]"></div>
      </div>

      <aside className={`w-72 ${mobileOpen ? 'flex' : 'hidden'} lg:flex flex-col justify-between p-6 border-r border-white/5 bg-[#0B0B0F]/90 backdrop-blur-xl fixed h-full z-40 transition-all`}>
        <div>
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/20">
              <i className="fa-solid fa-bolt"></i>
            </div>
            <span className="text-2xl font-bold tracking-tight">Finora</span>
          </div>
          <div className="purple-card-gradient rounded-3xl p-6 mb-8 shadow-xl relative group">
            <div className="absolute -top-2 -right-2 p-4 opacity-20 transform rotate-12 group-hover:rotate-6 transition-transform duration-500">
              <i className="fa-solid fa-wallet text-7xl text-white"></i>
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-white/90 uppercase tracking-widest bg-white/20 px-2 py-1 rounded-md">Balance</span>
                <i className="fa-solid fa-eye text-white/60"></i>
              </div>
              <div>
                {!data ? (
                  <div className="skeleton h-8 w-3/4 mb-2 rounded"></div>
                ) : (
                  <h2 className="text-3xl font-bold text-white tracking-tight">{formatCurrency(data.user.totalBalance)}</h2>
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
            <a href="#" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/10 text-white font-medium border-l-4 border-purple-500">
              <i className="fa-solid fa-grid-2 w-5 text-center"></i>
              <span>Dashboard</span>
            </a>
            <Link to="/addnewexpense" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white">
              <i className="fa-solid fa-clock-rotate-left w-5 text-center"></i>
              <span>Transactions</span>
            </Link>
            <a href="#" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white">
              <i className="fa-regular fa-credit-card w-5 text-center"></i>
              <span>Payments</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white">
              <i className="fa-solid fa-wallet w-5 text-center"></i>
              <span>My Cards</span>
            </a>
          </nav>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Preferences</p>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white"> 
            <i className="fa-regular fa-user w-5 text-center"></i> Account
          </a>
        </div>
      </aside>

      <div className="flex-1 lg:ml-72 flex flex-col h-full relative z-10">
        <header className="sticky top-0 z-30 flex items-center justify-between p-6 lg:px-10 border-b border-white/5 bg-[#0B0B0F]/80 backdrop-blur-md">
          <div className="flex w-full md:hidden justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm">
                <i className="fa-solid fa-bolt"></i>
              </div>
              <span className="font-bold text-lg">Finora</span>
            </div>
            <button onClick={()=>setMobileOpen(v=>!v)} className="p-2 text-white hover:bg-white/10 rounded-lg">
              <i className="fa-solid fa-bars text-xl"></i>
            </button>
          </div>
          <div className="relative w-full md:w-96 group">
            <input value={search} onChange={(e)=>setSearch(e.target.value)} type="text" placeholder="Search transactions, bills..." 
              className="w-full bg-[#242424] border border-white/10 text-gray-300 rounded-full py-3.5 pl-12 pr-4 
                         focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:bg-[#2a2a2a] transition-all 
                         placeholder:text-gray-600 text-sm font-medium shadow-sm" />
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors"></i>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:block">
              <span className="text-[10px] bg-white/5 text-gray-500 px-2 py-1 rounded border border-white/5">⌘ K</span>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            <button className="w-11 h-11 rounded-full bg-[#242424] border border-white/5 text-gray-400">
              <i className="fa-solid fa-bell"></i>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 p-[2px]">
                {data?.user?.avatar ? (<img src={data.user.avatar} alt="User" className="w-full h-full rounded-full object-cover" />) : (
                  <div className="w-full h-full rounded-full bg-[#242424] flex items-center justify-center">
                    <i className="fa-solid fa-user text-gray-500"></i>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="p-4 lg:p-10 max-w-7xl mx-auto">
            <div className="max-w-7xl mx-auto h-full flex flex-col">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 space-y-6">
                <div className="glass-panel rounded-3xl p-5 md:p-6 relative overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <div className="flex flex-row justify-between items-center mb-4">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold">Savings Overview</h3>
                      <p className="text-sm md:text-base text-gray-500">Compare your income vs expenses</p>
                    </div>
                    <select className="bg-black/30 border border-white/10 text-gray-300 text-base md:text-lg rounded-xl px-5 py-2.5 focus:outline-none">
                      <option>This Year</option>
                      <option>Last 6 Months</option>
                    </select>
                  </div>
                  <div className="relative w-full h-[260px] md:h-[300px]">
                    {!chartReady && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#242424]/50 rounded-xl z-20 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-3">
                          <i className="fa-solid fa-circle-notch fa-spin text-purple-500 text-2xl"></i>
                          <span className="text-xs text-gray-400">Loading Data...</span>
                        </div>
                      </div>
                    )}
                    <canvas ref={chartRef}></canvas>
                  </div>
                </div>
                <div className="glass-panel rounded-3xl p-2 md:p-2.5 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <h3 className="text-base md:text-lg font-bold">Saving Goals</h3>
                      <p className="text-xs md:text-sm text-gray-500">Track your dream purchases</p>
                    </div>
                    <button className="w-5 h-5 rounded-full bg-white/5 text-gray-400">
                      <i className="fa-solid fa-ellipsis text-[9px]"></i>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-1.5">
                    {(data?.goals || []).map((goal)=> (
                      <div key={goal.id} className="bg-white text-gray-900 rounded-lg p-2 flex justify-between items-center shadow-lg group h-full relative overflow-hidden">
                        <div className="absolute -right-2 -bottom-2 opacity-5 text-4xl md:text-5xl select-none pointer-events-none">
                          <i className={`fa-solid ${goal.icon}`}></i>
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                          <div>
                            <h4 className="text-lg md:text-xl font-bold tracking-tight text-gray-800">{formatCurrency(goal.target)}</h4>
                            <p className="text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wide mt-0.5">{goal.title}</p>
                          </div>
                          <p className="text-[10px] md:text-xs font-medium text-gray-400 mt-1.5 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-green-500"></span> {goal.items}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 relative z-10">
                          <div className={`w-7 h-7 md:w-8 md:h-8 rounded-md ${goal.bg} flex items-center justify-center text-white shadow-md`}>
                            <i className={`fa-solid ${goal.icon} text-xs md:text-sm`}></i>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] md:text-xs font-bold text-indigo-600">View Details</span>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 h-[2px] bg-gray-100 w-full">
                          <div className={`h-full ${goal.bg} opacity-50`} style={{ width: `${(goal.current/goal.target)*100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="glass-panel rounded-3xl p-3 md:p-4 animate-fade-in-right" style={{ animationDelay: '0.2s' }}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg md:text-xl font-bold">Transactions</h3>
                    <button className="text-xs text-purple-400 font-medium">View All</button>
                  </div>
                  <div className="space-y-1.5 overflow-y-auto pr-2 flex-1 min-h-0 max-h-[420px] scrollbar-hide">
                    {((data?.transactions || []).filter(t => {
                      const q = search.toLowerCase()
                      return !q || t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
                    })).map((tx, index) => {
                      const icon = getIconForCategory(tx.category)
                      const isPositive = tx.amount > 0
                      return (
                        <div key={tx.id}>
                          <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-white/5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-[#2a2a2a] flex items-center justify-center text-gray-400 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-inner flex-shrink-0">
                                <i className={`fa-solid ${icon} text-sm`}></i>
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs md:text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">{tx.title}</div>
                                <div className="text-[10px] md:text-xs text-gray-500">{tx.category} • {formatDate(tx.date)}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`font-display font-bold text-xs md:text-sm ${isPositive ? 'text-emerald-400' : 'text-white'}`}>{isPositive ? '+' : ''}{formatCurrency(tx.amount)}</span>
                              <button className="w-7 h-7 rounded-lg bg-white/5 hover:bg-purple-600 text-gray-400 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0">
                                <i className="fa-solid fa-chevron-right text-[10px]"></i>
                              </button>
                            </div>
                          </div>
                          {index !== (data.transactions.length - 1) ? <div className="h-[1px] bg-white/5 w-[90%] mx-auto my-0.5"></div> : null}
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="glass-panel rounded-3xl p-3 md:p-4 animate-fade-in-right" style={{ animationDelay: '0.5s' }}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg md:text-xl font-bold">Frequent Pays</h3>
                    <button className="w-7 h-7 rounded-full bg-white/5 text-gray-400">
                      <i className="fa-solid fa-gear text-xs"></i>
                    </button>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
                    {(data?.contacts || []).map(c => (
                      <div key={c.id} className="flex flex-col items-center gap-2 min-w-[70px] cursor-pointer group">
                        <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-600 p-[3px] flex items-center justify-center relative group-hover:border-purple-500 group-hover:rotate-12 transition-all duration-500">
                          <div className="w-full h-full rounded-full overflow-hidden transform group-hover:-rotate-12 transition-transform duration-500">
                            {c.avatar ? (<img src={c.avatar} className="w-full h-full rounded-full object-cover" />) : (<div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold">{c.name.charAt(0)}</div>)}
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
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </main>
      </div>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden" onClick={()=>setMobileOpen(false)}></div>
      )}
    </div>
  )
}
