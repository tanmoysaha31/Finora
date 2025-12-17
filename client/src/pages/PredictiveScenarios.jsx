import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function PredictiveScenarios() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const quickScenarios = [
    "What if I save 1000 BDT more per month?",
    "What if I pay off my smallest debt first?",
    "What if I cut my dining out expenses by 50%?",
    "How fast can I reach my wedding goal if I save $200/month?",
    "What if I invest 10% of my income?"
  ];

  const handlePredict = async (selectedQuery) => {
    const q = selectedQuery || query;
    if (!q) return;
    
    setLoading(true);
    setError('');
    setResult('');
    setQuery(q); // Update input if quick scenario clicked

    try {
      const userId = localStorage.getItem('finora_user_id');
      const res = await fetch(`${API_BASE}/api/ai/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, query: q })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get prediction');
      
      setResult(data.prediction);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
    .glass-input { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: white; transition: all 0.2s; }
    .glass-input:focus { border-color: #8b5cf6; background: rgba(0,0,0,0.5); outline: none; }
    .bg-blob { position: fixed; border-radius: 50%; filter: blur(100px); opacity: 0.15; z-index: -1; pointer-events: none; }
    .blob-1 { top: -10%; left: -10%; width: 600px; height: 600px; background: #7c3aed; }
    .blob-2 { bottom: -10%; right: -10%; width: 500px; height: 500px; background: #2563eb; }
    .typing-cursor::after { content: '|'; animation: blink 1s step-start infinite; }
    @keyframes blink { 50% { opacity: 0; } }
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
            <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
              <i className="fa-solid fa-grid-2 w-5 text-center group-hover:text-purple-400 transition-colors"></i> <span>Dashboard</span>
            </Link>
            <Link to="/goals" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
              <i className="fa-solid fa-bullseye w-5 text-center group-hover:text-purple-400 transition-colors"></i> <span>Saving Goal</span>
            </Link>
            <Link to="/budget" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
              <i className="fa-solid fa-scale-balanced w-5 text-center group-hover:text-purple-400 transition-colors"></i> <span>Budget Planner</span>
            </Link>
            <Link to="/transactions" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
              <i className="fa-solid fa-list w-5 text-center group-hover:text-purple-400 transition-colors"></i> <span>Transactions</span>
            </Link>
            
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6 px-3">Advanced Insights</p>
            <Link to="/predict" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/10 text-white font-medium border-l-4 border-purple-500 shadow-inner transition-all group">
              <i className="fa-solid fa-crystal-ball w-5 text-center text-purple-400"></i> <span>Scenario Simulator</span>
            </Link>
            <Link to="/finance-knowledge" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
              <i className="fa-solid fa-lightbulb w-5 text-center group-hover:text-purple-400 transition-colors"></i> <span>Finance Knowledge</span>
            </Link>
          </nav>
        </div>
        
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all w-full group">
          <i className="fa-solid fa-arrow-right-from-bracket w-5 text-center group-hover:text-red-400 transition-colors"></i> <span className="font-medium text-sm">Log Out</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 lg:ml-72 h-full overflow-y-auto bg-[#1a1a1a] relative scroll-smooth">
        <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen pb-20 flex flex-col justify-center">
          
          <div className="text-center mb-10">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-purple-500/30 mb-4">
              <i className="fa-solid fa-wand-magic-sparkles text-white"></i>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Predictive Scenarios</h1>
            <p className="text-gray-400 text-lg">Ask "What if" questions and let Finora Intelligence simulate your financial future.</p>
          </div>

          {/* INPUT AREA */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden mb-8 border border-purple-500/20 shadow-2xl shadow-purple-900/20">
            <div className="relative">
              <textarea 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="E.g., What if I save $500 more this month? or What if I pay off my credit card now?"
                className="w-full h-32 glass-input rounded-2xl p-5 text-lg resize-none placeholder-gray-600 focus:ring-2 focus:ring-purple-500/50"
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-3">
                 <span className="text-xs text-gray-500">{query.length} chars</span>
                 <button 
                  onClick={() => handlePredict()}
                  disabled={!query || loading}
                  className="bg-white text-black px-6 py-2 rounded-xl font-bold hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                 >
                   {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                   Simulate
                 </button>
              </div>
            </div>
          </div>

          {/* RESULT AREA */}
          {result && (
            <div className="glass-panel rounded-3xl p-8 border-l-4 border-purple-500 animate-fade-in-up mb-8">
               <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                 <i className="fa-solid fa-wand-magic-sparkles"></i> Finora Analysis
               </h3>
               <p className="text-lg leading-relaxed text-gray-200 typing-cursor">{result}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-center mb-8">
              <i className="fa-solid fa-circle-exclamation mr-2"></i> {error}
            </div>
          )}

          {/* QUICK SCENARIOS */}
          <div>
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 text-center">Try a Quick Scenario</h4>
            <div className="flex flex-wrap justify-center gap-3">
              {quickScenarios.map((s, i) => (
                <button 
                  key={i} 
                  onClick={() => handlePredict(s)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/50 transition-all text-sm text-gray-300 hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
