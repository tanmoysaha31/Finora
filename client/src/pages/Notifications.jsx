import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Notifications() {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || 'https://finora-1mgm.onrender.com';
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('finora_user_id');
      if (!userId) return;
      const res = await fetch(`${API_BASE}/api/notifications?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_BASE}/api/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(notifications.map(n => n._id === id ? {...n, isRead: true} : n));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await fetch(`${API_BASE}/api/notifications/${id}`, { method: 'DELETE' });
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  const markAllRead = async () => {
    try {
      const userId = localStorage.getItem('finora_user_id');
      await fetch(`${API_BASE}/api/notifications/mark-all-read`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all read", err);
    }
  };

  const clearAll = async () => {
    try {
      const userId = localStorage.getItem('finora_user_id');
      await fetch(`${API_BASE}/api/notifications/clear-all?userId=${encodeURIComponent(userId)}`, { method: 'DELETE' });
      setNotifications([]);
    } catch (err) {
      console.error("Failed to clear all", err);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const handleLogout = () => {
    localStorage.removeItem('finora_token');
    localStorage.removeItem('finora_user_id');
    navigate('/login');
  };

  const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #1a1a1a; }
    h1, h2, h3, h4, h5, h6 { font-family: 'Plus Jakarta Sans', sans-serif; }
    .glass-panel { background: rgba(36, 36, 36, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3); transition: all 0.3s ease; }
    .glass-panel:hover { border-color: rgba(255, 255, 255, 0.08); box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4); }
    .purple-card-gradient { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%); }
    .bg-blob { position: fixed; border-radius: 50%; filter: blur(100px); opacity: 0.15; z-index: -1; pointer-events: none; }
    .blob-1 { top: -10%; left: -10%; width: 600px; height: 600px; background: #7c3aed; }
    .blob-2 { bottom: -10%; right: -10%; width: 500px; height: 500px; background: #2563eb; }
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

          <nav className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">Main Menu</p>
            <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group border-l-4 border-transparent">
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
            <Link to="/bills" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group border-l-4 border-transparent">
              <i className="fa-regular fa-calendar-check w-5 text-center group-hover:text-purple-400 transition-colors"></i> <span>Bills & Reminders</span>
            </Link>
            <Link to="/notifications" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/10 text-white font-medium border-l-4 border-purple-500 shadow-inner transition-all group">
              <i className="fa-solid fa-bell w-5 text-center group-hover:text-purple-400 transition-colors"></i> <span>Notifications</span>
            </Link>
          </nav>
        </div>

        <div>
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-2xl p-4 mb-4 border border-white/5 relative overflow-hidden group cursor-pointer hover:border-white/10 transition-colors">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><i className="fa-solid fa-crown text-4xl"></i></div>
              <div className="relative z-10">
                <h4 className="font-bold text-white mb-1 text-sm">Upgrade to Pro</h4>
                <p className="text-xs text-indigo-200 mb-3">Get advanced insights</p>
                <button className="text-xs bg-white text-purple-900 font-bold py-1.5 px-3 rounded-lg hover:bg-gray-100 transition-colors w-full">View Plans</button>
              </div>
            </div>

            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all w-full group">
              <i className="fa-solid fa-arrow-right-from-bracket w-5 text-center group-hover:text-red-400 transition-colors"></i> <span className="font-medium text-sm">Log Out</span>
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 lg:ml-72 h-full overflow-y-auto bg-[#1a1a1a] relative scroll-smooth">
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen pb-20">
          
          {/* HEADER */}
          <header className="flex justify-between items-center mb-8 sticky top-0 z-20 bg-[#1a1a1a]/80 backdrop-blur-md py-4 -mx-4 px-4 md:-mx-8 md:px-8 border-b border-white/5">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileOpen(true)} className="lg:hidden w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                <i className="fa-solid fa-bars"></i>
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Notifications</h1>
                <p className="text-gray-400 text-sm mt-1">Stay updated with your financial alerts</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="hidden md:flex items-center gap-2 bg-white/5 rounded-xl p-1 border border-white/5">
                 <button onClick={() => setFilter('all')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === 'all' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>All</button>
                 <button onClick={() => setFilter('unread')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === 'unread' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Unread</button>
               </div>
            </div>
          </header>

          <div className="glass-panel rounded-3xl p-6 relative overflow-hidden min-h-[500px]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <i className="fa-solid fa-bell text-purple-400"></i> All Alerts
                    <span className="bg-white/10 text-xs px-2 py-0.5 rounded-full text-gray-300">{filteredNotifications.length}</span>
                </h3>
                <div className="flex gap-2">
                    <button onClick={markAllRead} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-300 hover:text-white transition-colors border border-white/5 flex items-center gap-2">
                        <i className="fa-solid fa-check-double"></i> Mark all read
                    </button>
                    <button onClick={clearAll} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-xs font-medium text-gray-300 hover:text-red-400 transition-colors border border-white/5 flex items-center gap-2">
                        <i className="fa-solid fa-trash"></i> Clear all
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-2xl w-full"></div>)}
                </div>
            ) : filteredNotifications.length > 0 ? (
                <div className="space-y-3">
                    {filteredNotifications.map(n => (
                        <div key={n._id} className={`p-4 rounded-2xl border transition-all duration-300 group hover:translate-x-1 ${n.isRead ? 'bg-white/5 border-white/5' : 'bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border-purple-500/30'}`}>
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${n.type === 'bill' ? 'bg-rose-500/20 text-rose-400' : n.type === 'debt' ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                        <i className={`fa-solid ${n.type === 'bill' ? 'fa-file-invoice-dollar' : n.type === 'debt' ? 'fa-hand-holding-dollar' : 'fa-bullseye'}`}></i>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className={`font-bold text-sm ${n.isRead ? 'text-gray-300' : 'text-white'}`}>{n.title}</h4>
                                            {!n.isRead && <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>}
                                        </div>
                                        <p className="text-gray-400 text-sm mb-2 leading-relaxed">{n.message}</p>
                                        <span className="text-xs text-gray-500 font-mono">{new Date(n.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!n.isRead && (
                                        <button onClick={() => markAsRead(n._id)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors" title="Mark as read">
                                            <i className="fa-solid fa-check text-xs"></i>
                                        </button>
                                    )}
                                    <button onClick={() => deleteNotification(n._id)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 flex items-center justify-center transition-colors" title="Delete">
                                        <i className="fa-solid fa-trash text-xs"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <i className="fa-regular fa-bell-slash text-3xl text-gray-600"></i>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No notifications</h3>
                    <p className="text-gray-400 text-sm max-w-xs">You're all caught up! Check back later for updates on your bills and goals.</p>
                </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}