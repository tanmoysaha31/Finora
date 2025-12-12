import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';

export default function DebtTracker() {
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // --- STATE MANAGEMENT ---
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [strategy, setStrategy] = useState('snowball'); // 'snowball' or 'avalanche'

  // --- MOCK DB: Debts Data ---
  // Schema: { id, lender, type, totalAmount, remaining, interestRate, minPayment, dueDate, color, icon, history: [] }
  const [debts, setDebts] = useState([
    { 
      id: 'd1', lender: 'Chase Sapphire', type: 'Credit Card', 
      totalAmount: 5000, remaining: 2450, interestRate: 24.99, 
      minPayment: 150, dueDate: '2025-10-15', 
      color: 'pink', icon: 'fa-credit-card',
      history: [{ date: '2023-09-15', amount: 200 }, { date: '2023-08-15', amount: 150 }]
    },
    { 
      id: 'd2', lender: 'Federal Student Aid', type: 'Student Loan', 
      totalAmount: 25000, remaining: 18200, interestRate: 4.5, 
      minPayment: 220, dueDate: '2030-05-20', 
      color: 'blue', icon: 'fa-graduation-cap',
      history: [{ date: '2023-09-01', amount: 220 }]
    },
    { 
      id: 'd3', lender: 'Toyota Financial', type: 'Auto Loan', 
      totalAmount: 15000, remaining: 9800, interestRate: 6.9, 
      minPayment: 310, dueDate: '2027-11-01', 
      color: 'orange', icon: 'fa-car',
      history: []
    }
  ]);

  // Form State for New Debt
  const [newDebt, setNewDebt] = useState({
    lender: '', totalAmount: '', interestRate: '', minPayment: '', dueDate: '', type: 'Personal Loan'
  });

  // --- STATS CALCULATION ---
  const totalDebt = debts.reduce((acc, d) => acc + d.remaining, 0);
  const totalOriginal = debts.reduce((acc, d) => acc + d.totalAmount, 0);
  const paidOff = totalOriginal - totalDebt;
  const progressPercentage = Math.round((paidOff / totalOriginal) * 100) || 0;
  const monthlyCommitment = debts.reduce((acc, d) => acc + d.minPayment, 0);

  // --- EFFECTS ---
  useEffect(() => {
    // Simulate API Fetch
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  // Chart: Debt Composition
  useEffect(() => {
    if (loading || !chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: debts.map(d => d.lender),
        datasets: [{
          data: debts.map(d => d.remaining),
          backgroundColor: [
            'rgba(236, 72, 153, 0.8)', // Pink
            'rgba(59, 130, 246, 0.8)', // Blue
            'rgba(249, 115, 22, 0.8)', // Orange
            'rgba(168, 85, 247, 0.8)', // Purple
          ],
          borderColor: '#1a1a1a',
          borderWidth: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        cutout: '75%',
      }
    });

    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [debts, loading]);

  // --- HANDLERS ---
  const handleAddDebt = (e) => {
    e.preventDefault();
    const created = {
      id: `d${Date.now()}`,
      ...newDebt,
      remaining: Number(newDebt.totalAmount),
      totalAmount: Number(newDebt.totalAmount),
      interestRate: Number(newDebt.interestRate),
      minPayment: Number(newDebt.minPayment),
      color: 'purple', icon: 'fa-money-bill-transfer',
      history: []
    };
    setDebts([...debts, created]);
    setShowAddModal(false);
    setNewDebt({ lender: '', totalAmount: '', interestRate: '', minPayment: '', dueDate: '', type: 'Personal Loan' });
  };

  const handlePayment = () => {
    if (!selectedDebt || !paymentAmount) return;
    const amount = Number(paymentAmount);
    
    setDebts(prev => prev.map(d => {
      if (d.id === selectedDebt.id) {
        return {
          ...d,
          remaining: Math.max(0, d.remaining - amount),
          history: [{ date: new Date().toISOString().split('T')[0], amount }, ...d.history]
        };
      }
      return d;
    }));

    setShowPayModal(false);
    setPaymentAmount('');
    setSelectedDebt(null);
  };

  // Sort Debts based on Strategy
  const sortedDebts = [...debts].sort((a, b) => {
    if (strategy === 'snowball') return a.remaining - b.remaining; // Lowest balance first
    if (strategy === 'avalanche') return b.interestRate - a.interestRate; // Highest interest first
    return 0;
  });

  // --- FORMATTERS ---
  const formatMoney = (amt) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amt);

  // --- STYLES ---
  const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #0F0F11; color: white; overflow-x: hidden; }
    h1, h2, h3, h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
    
    .glass-panel { background: rgba(30, 30, 35, 0.6); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.05); }
    .glass-modal { background: rgba(20, 20, 25, 0.95); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); }
    .glass-input { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: white; transition: all 0.2s; }
    .glass-input:focus { border-color: #ef4444; background: rgba(0,0,0,0.5); outline: none; box-shadow: 0 0 15px rgba(239, 68, 68, 0.1); }

    .progress-bar { transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }
    .animate-pop { animation: pop 0.3s ease-out forwards; }
    @keyframes pop { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
    
    .bg-blob { position: fixed; border-radius: 50%; filter: blur(120px); opacity: 0.15; z-index: -1; }
    .custom-scroll::-webkit-scrollbar { width: 4px; }
    .custom-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
  `;

  return (
    <div className="flex h-screen w-screen antialiased text-white bg-[#0F0F11]">
      <style>{customStyles}</style>
      <div className="bg-blob top-[-10%] left-[-10%] w-[600px] h-[600px] bg-red-900/10"></div>
      <div className="bg-blob bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10"></div>

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
            <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all">
              <i className="fa-solid fa-grid-2 w-5 text-center"></i> <span>Dashboard</span>
            </Link>
            <Link to="/debt" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/10 text-white font-medium border-l-4 border-red-500 shadow-inner">
              <i className="fa-solid fa-chart-simple w-5 text-center text-red-400"></i> <span>Debt Tracker</span>
            </Link>
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 lg:ml-72 flex flex-col h-full relative z-10">
        
        {/* Header */}
        <header className="flex-shrink-0 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#0F0F11]/80 backdrop-blur-md sticky top-0 z-20 border-b border-white/5">
          <div className="flex items-center gap-4 w-full md:w-auto">
             <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg"><i className="fa-solid fa-bars"></i></button>
             <div>
                <h1 className="text-xl font-bold">Debt Tracker</h1>
                <p className="text-xs text-gray-400">Strategize your path to financial freedom</p>
             </div>
          </div>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-all shadow-lg">
             <i className="fa-solid fa-plus"></i> <span>Add New Loan</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scroll">
            <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* --- LEFT COLUMN: LIST & STRATEGY (2/3) --- */}
                <div className="xl:col-span-2 space-y-6">
                    
                    {/* 1. Summary Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><i className="fa-solid fa-sack-dollar text-5xl"></i></div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Remaining</p>
                            <h2 className="text-3xl font-mono font-bold text-white mt-1">{formatMoney(totalDebt)}</h2>
                            <p className="text-[10px] text-red-400 mt-1 font-medium"><i className="fa-solid fa-arrow-trend-down"></i> {100 - progressPercentage}% left to pay</p>
                        </div>
                        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Monthly Minimums</p>
                            <h2 className="text-3xl font-mono font-bold text-white mt-1">{formatMoney(monthlyCommitment)}</h2>
                            <p className="text-[10px] text-gray-500 mt-1">Fixed obligations</p>
                        </div>
                        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Progress</p>
                            <div className="flex items-end gap-2 mt-1">
                                <h2 className="text-3xl font-mono font-bold text-green-400">{progressPercentage}%</h2>
                                <span className="text-xs text-gray-500 mb-1">Debt Free</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-700 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-green-500" style={{ width: `${progressPercentage}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Strategy & List */}
                    <div className="glass-panel rounded-3xl p-6 min-h-[400px]">
                        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                            <h3 className="font-bold text-lg">Active Loans ({debts.length})</h3>
                            <div className="flex bg-black/30 p-1 rounded-xl">
                                <button onClick={() => setStrategy('snowball')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${strategy === 'snowball' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Snowball (Smallest 1st)</button>
                                <button onClick={() => setStrategy('avalanche')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${strategy === 'avalanche' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Avalanche (Highest Interest)</button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {sortedDebts.map((debt, index) => {
                                const pct = Math.round(((debt.totalAmount - debt.remaining) / debt.totalAmount) * 100);
                                return (
                                    <div key={debt.id} className="glass-panel rounded-2xl p-5 hover:bg-white/5 transition-colors group">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-${debt.color}-500/20 text-${debt.color}-400`}>
                                                    <i className={`fa-solid ${debt.icon}`}></i>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white text-base">{debt.lender}</h4>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <span className="bg-white/10 px-1.5 py-0.5 rounded">{debt.type}</span>
                                                        <span>• {debt.interestRate}% APR</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold font-mono text-white">{formatMoney(debt.remaining)}</p>
                                                <p className="text-xs text-gray-500">of {formatMoney(debt.totalAmount)}</p>
                                            </div>
                                        </div>

                                        {/* Progress */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold uppercase text-gray-500">
                                                <span>Payoff Progress</span>
                                                <span className="text-white">{pct}%</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full progress-bar bg-${debt.color}-500`} style={{ width: `${pct}%` }}></div>
                                            </div>
                                        </div>

                                        {/* Footer Actions */}
                                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                            <div className="text-xs text-gray-400">
                                                Next Due: <span className="text-white font-medium">{new Date(debt.dueDate).toLocaleDateString()}</span>
                                            </div>
                                            <button 
                                                onClick={() => { setSelectedDebt(debt); setShowPayModal(true); }}
                                                className="px-4 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-gray-200 transition-colors shadow-lg"
                                            >
                                                Pay Now
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: ANALYTICS (1/3) --- */}
                <div className="space-y-6">
                    
                    {/* 1. Debt Breakdown Chart */}
                    <div className="glass-panel rounded-3xl p-6 flex flex-col items-center">
                        <h3 className="text-sm font-bold text-gray-300 w-full mb-4 uppercase tracking-wider">Composition</h3>
                        <div className="relative w-48 h-48">
                            <canvas ref={chartRef}></canvas>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xl font-bold text-white">{debts.length}</span>
                                <span className="text-[10px] text-gray-500 uppercase">Loans</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Debt Free Projection */}
                    <div className="glass-panel rounded-3xl p-6 border-l-4 border-green-500">
                        <div className="flex items-center gap-2 mb-3">
                             <i className="fa-solid fa-calendar-check text-green-400"></i>
                             <h4 className="font-bold text-sm text-white">Debt Free Projection</h4>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed mb-4">
                            Based on your current payment rate, you will be debt free by:
                        </p>
                        <div className="bg-black/30 p-4 rounded-xl text-center">
                            <span className="block text-2xl font-bold text-white">August 2028</span>
                            <span className="text-[10px] text-gray-500">3 years, 8 months remaining</span>
                        </div>
                    </div>

                    {/* 3. Pro Tip */}
                    <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-3xl p-6 border border-white/5">
                        <h4 className="font-bold text-sm text-indigo-300 mb-2"><i className="fa-solid fa-lightbulb mr-1"></i> Strategy Tip</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Paying an extra <strong>$50/mo</strong> towards your <strong>{sortedDebts[0]?.lender}</strong> loan will save you roughly <strong>$420</strong> in interest this year.
                        </p>
                    </div>

                </div>
            </div>
        </main>
      </div>

      {/* --- MODALS --- */}
      
      {/* 1. PAY MODAL */}
      {showPayModal && selectedDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowPayModal(false)}></div>
            <div className="relative w-full max-w-sm glass-modal rounded-3xl p-6 animate-pop shadow-2xl">
                <div className="text-center mb-6">
                    <div className={`w-14 h-14 mx-auto rounded-full bg-${selectedDebt.color}-500/20 text-${selectedDebt.color}-400 flex items-center justify-center text-2xl mb-3`}>
                        <i className={`fa-solid ${selectedDebt.icon}`}></i>
                    </div>
                    <h3 className="text-lg font-bold text-white">Pay {selectedDebt.lender}</h3>
                    <p className="text-xs text-gray-400">Current Balance: {formatMoney(selectedDebt.remaining)}</p>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Payment Amount</label>
                        <div className="relative mt-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-500">$</span>
                            <input 
                                type="number" 
                                value={paymentAmount} 
                                onChange={(e) => setPaymentAmount(e.target.value)} 
                                className="w-full glass-input rounded-xl py-3 pl-10 pr-4 text-2xl font-bold text-white" 
                                placeholder="0.00" autoFocus 
                            />
                        </div>
                    </div>
                    <button onClick={handlePayment} disabled={!paymentAmount} className="w-full py-3.5 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors">Confirm Payment</button>
                </div>
            </div>
        </div>
      )}

      {/* 2. ADD DEBT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
            <div className="relative w-full max-w-md glass-modal rounded-3xl p-6 animate-pop shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                    <h3 className="text-lg font-bold">Add New Loan</h3>
                    <button onClick={() => setShowAddModal(false)}><i className="fa-solid fa-xmark text-gray-400 hover:text-white"></i></button>
                </div>
                <form onSubmit={handleAddDebt} className="space-y-4">
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Lender Name</label><input required type="text" className="w-full glass-input rounded-xl p-3 mt-1" value={newDebt.lender} onChange={e=>setNewDebt({...newDebt, lender:e.target.value})} placeholder="e.g. Chase Bank" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Total Amount</label><input required type="number" className="w-full glass-input rounded-xl p-3 mt-1" value={newDebt.totalAmount} onChange={e=>setNewDebt({...newDebt, totalAmount:e.target.value})} placeholder="0.00" /></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Interest Rate (%)</label><input required type="number" className="w-full glass-input rounded-xl p-3 mt-1" value={newDebt.interestRate} onChange={e=>setNewDebt({...newDebt, interestRate:e.target.value})} placeholder="0.0" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Min Payment</label><input required type="number" className="w-full glass-input rounded-xl p-3 mt-1" value={newDebt.minPayment} onChange={e=>setNewDebt({...newDebt, minPayment:e.target.value})} placeholder="0.00" /></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Due Date</label><input required type="date" className="w-full glass-input rounded-xl p-3 mt-1 text-sm" value={newDebt.dueDate} onChange={e=>setNewDebt({...newDebt, dueDate:e.target.value})} /></div>
                    </div>
                    <button type="submit" className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold mt-4 shadow-lg hover:opacity-90">Add Debt Tracker</button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}