import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Bills() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const API_BASE = import.meta.env.VITE_API_URL || 'https://finora-1mgm.onrender.com'
  
  // --- STATE MANAGEMENT ---
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [newBill, setNewBill] = useState({
    title: '',
    amount: '',
    dueDate: '',
    category: 'Utility',
    isRecurring: false,
    frequency: 'monthly'
  });

  // --- DATA FETCHING ---
  const fetchBills = async () => {
    try {
      setLoading(true);
      let userId = null;
      try { userId = localStorage.getItem('finora_user_id') } catch (_) {}
      if (!userId) return;

      const res = await fetch(`${API_BASE}/api/bills?userId=${userId}`);
      const data = await res.json();
      if (data.bills) setBills(data.bills);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // --- HANDLERS ---
  const handleCreateBill = async (e) => {
    e.preventDefault();
    try {
      let userId = null;
      try { userId = localStorage.getItem('finora_user_id') } catch (_) {}
      
      const res = await fetch(`${API_BASE}/api/bills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newBill, userId })
      });
      
      if (res.ok) {
        setShowModal(false);
        setNewBill({ title: '', amount: '', dueDate: '', category: 'Utility', isRecurring: false, frequency: 'monthly' });
        fetchBills();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsPaid = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/bills/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' })
      });
      if (res.ok) fetchBills();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this bill?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/bills/${id}`, { method: 'DELETE' });
      if (res.ok) fetchBills();
    } catch (err) { console.error(err); }
  };

  // --- HELPERS ---
  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const getDaysLeft = (dateStr) => {
    const diff = new Date(dateStr) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return <span className="text-red-500 font-bold">Overdue by {Math.abs(days)} days</span>;
    if (days === 0) return <span className="text-orange-500 font-bold">Due Today</span>;
    return <span className={days <= 3 ? "text-orange-400" : "text-green-400"}>{days} days left</span>;
  };

  // --- STYLES ---
  const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #1a1a1a; color: white; }
    h1, h2, h3, h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
    .glass-panel { background: rgba(36, 36, 36, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3); }
    .glass-modal { background: rgba(20, 20, 25, 0.95); backdrop-filter: blur(20px); }
    .glass-input { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: white; transition: all 0.2s; }
    .glass-input:focus { border-color: #8b5cf6; background: rgba(0,0,0,0.5); outline: none; }
    .bg-blob { position: fixed; border-radius: 50%; filter: blur(100px); opacity: 0.15; z-index: -1; pointer-events: none; }
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
            <Link to="/addnewexpense" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
              <i className="fa-solid fa-plus w-5 text-center"></i> <span>Add new expense</span>
            </Link>
            <Link to="/goals" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
              <i className="fa-solid fa-bullseye w-5 text-center"></i> <span>Saving Goal</span>
            </Link>
            <Link to="/budget" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
              <i className="fa-solid fa-scale-balanced w-5 text-center"></i> <span>Budget Planner</span>
            </Link>
            <Link to="/transactions" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
              <i className="fa-solid fa-list w-5 text-center"></i> <span>Transactions</span>
            </Link>
            <Link to="/income" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
              <i className="fa-solid fa-money-bill-wave w-5 text-center"></i> <span>Income</span>
            </Link>
            <Link to="/debt" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
              <i className="fa-solid fa-chart-simple w-5 text-center"></i> <span>Debt Tracker</span>
            </Link>
            <Link to="/bills" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/10 text-white font-medium border-l-4 border-purple-500 shadow-inner">
              <i className="fa-regular fa-calendar-check w-5 text-center text-purple-400"></i> <span>Bills & Reminders</span>
            </Link>
            <Link to="/cards" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
               <i className="fa-solid fa-wallet w-5 text-center"></i> <span>My Cards</span>
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
                <h1 className="text-2xl font-bold">Bills & Reminders</h1>
                <p className="text-xs text-gray-500">Track your upcoming payments and avoid penalties</p>
            </div>
          </div>
          
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/20">
            <i className="fa-solid fa-plus"></i> <span>Add Bill</span>
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scroll">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-xl"><i className="fa-solid fa-circle-exclamation"></i></div>
                 <div>
                    <p className="text-gray-400 text-xs uppercase font-bold">Unpaid Amount</p>
                    <h3 className="text-2xl font-bold">{formatCurrency(bills.filter(b => b.status === 'unpaid').reduce((acc, b) => acc + b.amount, 0))}</h3>
                 </div>
              </div>
              <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xl"><i className="fa-solid fa-calendar-day"></i></div>
                 <div>
                    <p className="text-gray-400 text-xs uppercase font-bold">Upcoming (7 Days)</p>
                    <h3 className="text-2xl font-bold">{bills.filter(b => b.status === 'unpaid' && new Date(b.dueDate) <= new Date(Date.now() + 7 * 86400000)).length} Bills</h3>
                 </div>
              </div>
              <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xl"><i className="fa-solid fa-check"></i></div>
                 <div>
                    <p className="text-gray-400 text-xs uppercase font-bold">Paid This Month</p>
                    <h3 className="text-2xl font-bold">{formatCurrency(bills.filter(b => b.status === 'paid').reduce((acc, b) => acc + b.amount, 0))}</h3>
                 </div>
              </div>
            </div>

            {/* List */}
            <div className="glass-panel rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-lg font-bold">Your Bills</h3>
                </div>
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : bills.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <i className="fa-regular fa-calendar-check text-4xl mb-4 opacity-30"></i>
                        <p>No bills added yet. Create one to get started!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {bills.map(bill => (
                            <div key={bill._id} className={`p-5 flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-white/5 transition-colors ${bill.status === 'paid' ? 'opacity-50' : ''}`}>
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg ${bill.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-[#242424] text-white border border-white/10'}`}>
                                        <i className={`fa-solid ${bill.category === 'Utility' ? 'fa-bolt' : bill.category === 'Rent' ? 'fa-house' : bill.category === 'Subscription' ? 'fa-tv' : 'fa-file-invoice-dollar'}`}></i>
                                    </div>
                                    <div>
                                        <h4 className={`font-bold text-lg ${bill.status === 'paid' ? 'line-through text-gray-500' : 'text-white'}`}>{bill.title}</h4>
                                        <div className="flex items-center gap-3 text-xs text-gray-400">
                                            <span className="bg-white/5 px-2 py-0.5 rounded">{bill.category}</span>
                                            {bill.isRecurring && <span className="flex items-center gap-1"><i className="fa-solid fa-rotate"></i> {bill.frequency}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between w-full md:w-auto gap-8">
                                    <div className="text-right">
                                        <p className="font-bold text-xl">{formatCurrency(bill.amount)}</p>
                                        <p className="text-xs mt-1">{bill.status === 'paid' ? <span className="text-green-500">Paid on {formatDate(bill.updatedAt)}</span> : getDaysLeft(bill.dueDate)}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {bill.status === 'unpaid' && (
                                            <button onClick={() => handleMarkAsPaid(bill._id)} className="w-10 h-10 rounded-full bg-green-500/20 hover:bg-green-500 hover:text-white text-green-500 flex items-center justify-center transition-all" title="Mark as Paid">
                                                <i className="fa-solid fa-check"></i>
                                            </button>
                                        )}
                                        <button onClick={() => handleDelete(bill._id)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-gray-400 flex items-center justify-center transition-all">
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

          </div>
        </main>
      </div>

      {/* --- MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
            <div className="relative w-full max-w-md glass-modal rounded-3xl border border-white/10 shadow-2xl p-6">
                <h3 className="text-xl font-bold mb-6">Add New Bill</h3>
                <form onSubmit={handleCreateBill} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Bill Title</label>
                        <input required type="text" value={newBill.title} onChange={e => setNewBill({...newBill, title: e.target.value})} className="w-full glass-input rounded-xl px-4 py-3" placeholder="e.g. Electric Bill" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Amount ($)</label>
                            <input required type="number" value={newBill.amount} onChange={e => setNewBill({...newBill, amount: e.target.value})} className="w-full glass-input rounded-xl px-4 py-3" placeholder="0.00" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Due Date</label>
                            <input required type="date" value={newBill.dueDate} onChange={e => setNewBill({...newBill, dueDate: e.target.value})} className="w-full glass-input rounded-xl px-4 py-3" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
                        <select value={newBill.category} onChange={e => setNewBill({...newBill, category: e.target.value})} className="w-full glass-input rounded-xl px-4 py-3 bg-[#1a1a1a]">
                            <option value="Utility">Utility</option>
                            <option value="Rent">Rent</option>
                            <option value="Subscription">Subscription</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                        <input type="checkbox" checked={newBill.isRecurring} onChange={e => setNewBill({...newBill, isRecurring: e.target.checked})} className="w-4 h-4 rounded border-gray-600 bg-transparent text-purple-600 focus:ring-purple-500" />
                        <span className="text-sm">Recurring Bill?</span>
                        {newBill.isRecurring && (
                            <select value={newBill.frequency} onChange={e => setNewBill({...newBill, frequency: e.target.value})} className="ml-auto glass-input rounded-lg px-2 py-1 text-xs bg-[#1a1a1a]">
                                <option value="monthly">Monthly</option>
                                <option value="weekly">Weekly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        )}
                    </div>
                    <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-500/20 transition-all mt-2">
                        Create Bill
                    </button>
                </form>
                <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><i className="fa-solid fa-xmark"></i></button>
            </div>
        </div>
      )}
    </div>
  );
}
