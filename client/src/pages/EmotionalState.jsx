import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Chart from 'chart.js/auto';

export default function EmotionalState() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the Transaction ID from the URL
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // --- STATE MANAGEMENT ---
  const [loading, setLoading] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [fetchingData, setFetchingData] = useState(true); // Loading state for initial fetch
  const [selectedMood, setSelectedMood] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);

  // --- FORM STATE (New Data Points) ---
  const [necessity, setNecessity] = useState('want'); 
  const [socialContext, setSocialContext] = useState('solo');

  // --- DYNAMIC DATA STATE ---
  const [currentExpense, setCurrentExpense] = useState(null);
  const [categoryStats, setCategoryStats] = useState(null);

  // --- CONFIGURATION ---
  const emotions = [
    { id: 'happy', label: 'Happy', emoji: '😄', color: 'yellow', gradient: 'from-yellow-400 to-amber-500', insight: "Positive reinforcement! You tend to spend on experiences when happy." },
    { id: 'excited', label: 'Excited', emoji: '🤩', color: 'purple', gradient: 'from-purple-400 to-pink-500', insight: "High energy often leads to higher-value 'celebration' purchases." },
    { id: 'neutral', label: 'Neutral', emoji: '😐', color: 'gray', gradient: 'from-gray-400 to-slate-500', insight: "A routine purchase. Good for maintaining stability." },
    { id: 'bored', label: 'Bored', emoji: '🥱', color: 'indigo', gradient: 'from-indigo-400 to-blue-500', insight: "Dopamine seeking? 40% of your small purchases happen when bored." },
    { id: 'sad', label: 'Sad', emoji: '😢', color: 'blue', gradient: 'from-blue-400 to-cyan-500', insight: "Retail therapy detected. Be gentle with yourself today." },
    { id: 'stressed', label: 'Stressed', emoji: '😣', color: 'orange', gradient: 'from-orange-400 to-red-500', insight: "Buying convenience/comfort is a common stress response." },
    { id: 'angry', label: 'Angry', emoji: '😡', color: 'red', gradient: 'from-red-500 to-rose-600', insight: "Frustration spending is often impulsive. Pause for a moment." },
    { id: 'confused', label: 'Confused', emoji: '🤔', color: 'teal', gradient: 'from-teal-400 to-emerald-500', insight: "Unsure about value? Mark this to review later." },
  ];

  const socialOptions = [
    { id: 'solo', label: 'Solo', icon: 'fa-user' },
    { id: 'friends', label: 'Friends', icon: 'fa-user-group' },
    { id: 'partner', label: 'Partner', icon: 'fa-heart' },
    { id: 'work', label: 'Work', icon: 'fa-briefcase' },
  ];

  // --- FETCH DATA ON MOUNT ---
  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        if (!id) return; // Handle direct access without ID
        
        // Use your API URL
        const response = await fetch(`http://localhost:5000/api/transactions/${id}`);
        const result = await response.json();

        if (result.success && result.data) {
          const data = result.data;
          
          // Map DB data to UI structure
          setCurrentExpense({
            id: data._id,
            title: data.title,
            amount: data.amount,
            category: data.category,
            // Map category names to icons
            icon: getCategoryIcon(data.category),
            date: new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            time: new Date(data.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          });

          setCategoryStats({
            categoryName: data.category,
            monthlyTotal: data.context?.monthlyTotal || data.amount, // Fallback
            monthlyBudget: data.context?.monthlyBudget || 500,
            similarMoments: [] // Keep empty or fetch separate history if needed
          });
        }
      } catch (error) {
        console.error("Failed to load expense:", error);
      } finally {
        setFetchingData(false);
        setTimeout(() => setPageReady(true), 100);
      }
    };

    fetchTransactionDetails();
  }, [id]);

  // Helper for Category Icons
  const getCategoryIcon = (catName) => {
    const map = {
      'Food & Dining': 'fa-burger',
      'Shopping': 'fa-bag-shopping',
      'Transportation': 'fa-car',
      'Entertainment': 'fa-gamepad',
      'Utilities': 'fa-bolt',
      'Health': 'fa-heart-pulse',
      'Others': 'fa-ellipsis'
    };
    return map[catName] || 'fa-receipt';
  };

  // --- SAVE HANDLER (DB Integration) ---
  const handleSave = async () => {
    if (!selectedMood) return;
    setLoading(true);

    const payload = {
        userId: localStorage.getItem('finora_user_id'), // Ensure user linkage
        expenseId: id, // Use the ID from URL
        mood: selectedMood.id,
        necessityScore: necessity,
        socialContext: socialContext,
        timestamp: new Date()
    };

    try {
        const response = await fetch('http://localhost:5000/api/emotions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            setLoading(false);
            setShowSuccess(true);
            setTimeout(() => {
                setAnimateOut(true);
                setTimeout(() => navigate('/dashboard'), 500);
            }, 1500);
        } else {
            setLoading(false);
            alert("Failed to save mood. Please try again.");
        }
    } catch (error) {
        console.error("Error saving mood:", error);
        setLoading(false);
    }
  };

  // --- CHART LOGIC (Re-enabled) ---
  useEffect(() => {
    if (!pageReady || !chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const ctx = chartRef.current.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(234, 179, 8, 0.5)'); 
    gradient.addColorStop(1, 'rgba(234, 179, 8, 0.0)');

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Stressed', 'Happy', 'Impulsive', 'Neutral'],
        datasets: [{
          data: [450, 350, 120, 200], // Mock analytics data for now
          backgroundColor: [
            'rgba(249, 115, 22, 0.9)', 
            'rgba(234, 179, 8, 0.9)',  
            'rgba(168, 85, 247, 0.9)', 
            'rgba(156, 163, 175, 0.9)', 
          ],
          borderColor: '#1a1a1a',
          borderWidth: 0,
          cutout: '70%',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    });

    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [pageReady]);

  // --- THEME HELPER ---
  const getTheme = () => {
    if (!selectedMood) return { accent: 'text-purple-400', border: 'border-white/10', glow: 'bg-purple-500/5', button: 'bg-[#2a2a2a] text-gray-500' };
    const c = selectedMood.color;
    const map = {
      yellow: { accent: 'text-yellow-400', border: 'border-yellow-500/50', glow: 'bg-yellow-500/20', button: 'bg-yellow-500 text-black shadow-yellow-500/20' },
      purple: { accent: 'text-purple-400', border: 'border-purple-500/50', glow: 'bg-purple-500/20', button: 'bg-purple-600 text-white shadow-purple-500/20' },
      gray:   { accent: 'text-gray-400',   border: 'border-gray-500/50',   glow: 'bg-gray-500/20',   button: 'bg-gray-600 text-white shadow-gray-500/20' },
      indigo: { accent: 'text-indigo-400', border: 'border-indigo-500/50', glow: 'bg-indigo-500/20', button: 'bg-indigo-600 text-white shadow-indigo-500/20' },
      blue:   { accent: 'text-blue-400',   border: 'border-blue-500/50',   glow: 'bg-blue-500/20',   button: 'bg-blue-600 text-white shadow-blue-500/20' },
      orange: { accent: 'text-orange-400', border: 'border-orange-500/50', glow: 'bg-orange-500/20', button: 'bg-orange-500 text-white shadow-orange-500/20' },
      red:    { accent: 'text-red-400',    border: 'border-red-500/50',    glow: 'bg-red-500/20',    button: 'bg-red-600 text-white shadow-red-500/20' },
      teal:   { accent: 'text-teal-400',   border: 'border-teal-500/50',   glow: 'bg-teal-500/20',   button: 'bg-teal-600 text-white shadow-teal-500/20' },
    };
    return map[c];
  };
  const theme = getTheme();

  // --- STYLES ---
  const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #0F0F11; color: white; overflow-x: hidden; }
    h1, h2, h3, h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    
    .glass-card { background: rgba(30, 30, 35, 0.6); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.05); }
    
    .receipt-edge { 
        background-image: linear-gradient(135deg, #1E1E23 50%, transparent 50%), linear-gradient(45deg, #1E1E23 50%, transparent 50%);
        background-position: bottom left; background-repeat: repeat-x; background-size: 16px 16px;
    }
    .animate-unroll { animation: unroll 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; transform-origin: top; }
    @keyframes unroll { from { transform: scaleY(0); opacity: 0; } to { transform: scaleY(1); opacity: 1; } }

    .mood-chip:hover { transform: translateY(-4px) scale(1.05); }
    .mood-chip:active { transform: scale(0.95); }
    
    .segment-btn { transition: all 0.2s ease; }
    .segment-btn.active { background: white; color: black; box-shadow: 0 4px 12px rgba(255,255,255,0.2); }
    
    .custom-scroll::-webkit-scrollbar { width: 4px; }
    .custom-scroll::-webkit-scrollbar-track { background: transparent; }
    .custom-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
  `;

  // --- RENDER ---
  if (fetchingData) {
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-[#0F0F11] text-white">
            <div className="flex flex-col items-center gap-4">
                <i className="fa-solid fa-circle-notch fa-spin text-4xl text-purple-500"></i>
                <p className="text-gray-400 animate-pulse">Retrieving expense details...</p>
            </div>
        </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen w-screen antialiased text-white transition-opacity duration-500 ${animateOut ? 'opacity-0' : 'opacity-100'}`}>
      <style>{customStyles}</style>
      
      {/* Background Ambient Glow */}
      <div className={`fixed inset-0 z-0 bg-[#0F0F11]`}>
         <div className={`absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] transition-all duration-1000 ${theme.glow} opacity-40`}></div>
         <div className={`absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] transition-all duration-1000 ${theme.glow} opacity-30`}></div>
      </div>

      <header className="relative z-20 flex-shrink-0 px-6 py-5 flex items-center justify-between">
        <button onClick={() => navigate('/dashboard')} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h1 className="text-lg font-bold font-display tracking-tight">Emotional Check-in</h1>
        <div className="w-10"></div>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto px-4 pb-32 custom-scroll">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">

          {/* === LEFT COLUMN: Context & Selection === */}
          <div className="space-y-8">
            
            {/* 1. DIGITAL RECEIPT (Real Expense Context) */}
            <div className={`relative ${pageReady ? 'animate-unroll' : 'opacity-0'}`}>
                <div className="bg-[#1E1E23] rounded-t-2xl p-6 pb-8 border border-white/5 shadow-2xl relative z-10">
                    <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-4">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center">
                                <i className={`fa-solid ${currentExpense?.icon} text-xl text-gray-400`}></i>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white font-mono uppercase tracking-tight">{currentExpense?.title}</h2>
                                <p className="text-xs text-gray-500 font-mono">{currentExpense?.date} • {currentExpense?.time}</p>
                            </div>
                        </div>
                        <span className="font-mono text-2xl font-bold text-white">${currentExpense?.amount.toFixed(2)}</span>
                    </div>
                    
                    {/* Monthly Progress Bar within Receipt */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-mono text-gray-500 uppercase">
                            <span>{categoryStats?.categoryName} Budget</span>
                            <span>{Math.round((categoryStats?.monthlyTotal/categoryStats?.monthlyBudget)*100)}% Used</span>
                        </div>
                        <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                            <div className="h-full bg-white/30 rounded-full" style={{ width: `${Math.min((categoryStats?.monthlyTotal/categoryStats?.monthlyBudget)*100, 100)}%` }}></div>
                        </div>
                    </div>
                </div>
                {/* Jagged Edge Effect */}
                <div className="h-4 w-full receipt-edge opacity-100 relative -top-1 z-0"></div>
            </div>

            {/* 2. MOOD SELECTOR */}
            <div className={`transition-all duration-500 delay-100 ${pageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <h3 className="text-2xl font-bold mb-1">How did you feel?</h3>
                <p className="text-gray-400 mb-5 text-sm">Tap the emotion that drove this transaction.</p>
                
                <div className="grid grid-cols-4 gap-3">
                    {emotions.map((mood) => {
                        const isSelected = selectedMood?.id === mood.id;
                        return (
                            <button
                                key={mood.id}
                                onClick={() => setSelectedMood(mood)}
                                className={`mood-chip relative flex flex-col items-center justify-center gap-2 aspect-square rounded-2xl border transition-all duration-300
                                    ${isSelected 
                                        ? `bg-gradient-to-br ${mood.gradient} border-transparent shadow-[0_0_20px_rgba(0,0,0,0.3)] scale-105 z-10` 
                                        : 'bg-[#1E1E23] border-white/5 hover:bg-[#25252A] hover:border-white/10'
                                    }`}
                            >
                                <span className={`text-3xl ${isSelected ? 'scale-110' : 'grayscale opacity-70'}`}>{mood.emoji}</span>
                                <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-white' : 'text-gray-500'}`}>{mood.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 3. NEW: SOCIAL CONTEXT (Who were you with?) */}
            <div className={`glass-card rounded-2xl p-4 flex items-center justify-between transition-all duration-500 delay-200 ${pageReady ? 'opacity-100' : 'opacity-0'}`}>
                <span className="text-sm font-bold text-gray-400">Who were you with?</span>
                <div className="flex gap-2 bg-black/20 p-1 rounded-xl">
                    {socialOptions.map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => setSocialContext(opt.id)}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all
                                ${socialContext === opt.id ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                            title={opt.label}
                        >
                            <i className={`fa-solid ${opt.icon}`}></i>
                        </button>
                    ))}
                </div>
            </div>

          </div>

          {/* === RIGHT COLUMN: Deep Analysis === */}
          <div className={`space-y-6 transition-all duration-500 delay-300 ${pageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
             
             {/* 1. DYNAMIC INSIGHT CARD */}
             <div className={`glass-card rounded-3xl p-6 border-l-4 transition-all duration-500 ${selectedMood ? `opacity-100 translate-y-0 ${theme.border}` : 'opacity-50 translate-y-4 border-transparent'}`}>
                <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-black/30 ${theme.accent}`}>
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-sm uppercase tracking-wide">Live Insight</h4>
                        <p className="text-xs text-gray-400">Based on psychology</p>
                    </div>
                </div>
                <p className="text-lg font-medium text-gray-200 leading-relaxed">
                    {selectedMood ? selectedMood.insight : "Select an emotion to unlock financial psychology insights."}
                </p>
             </div>

             {/* 2. VALUE ASSESSMENT */}
             <div className="glass-card rounded-3xl p-6">
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-scale-balanced text-gray-500 text-xs"></i>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Value Assessment</h4>
                    </div>
                 </div>
                 
                 <div className="flex bg-black/30 p-1.5 rounded-xl">
                     <button onClick={() => setNecessity('need')} className={`segment-btn flex-1 py-2.5 rounded-lg text-xs font-bold ${necessity === 'need' ? 'active' : 'text-gray-500 hover:text-gray-300'}`}>Need</button>
                     <button onClick={() => setNecessity('want')} className={`segment-btn flex-1 py-2.5 rounded-lg text-xs font-bold ${necessity === 'want' ? 'active' : 'text-gray-500 hover:text-gray-300'}`}>Want</button>
                     <button onClick={() => setNecessity('regret')} className={`segment-btn flex-1 py-2.5 rounded-lg text-xs font-bold ${necessity === 'regret' ? 'active bg-red-500/10 text-red-400' : 'text-gray-500 hover:text-red-400'}`}>Regret</button>
                 </div>
                 <p className="text-[10px] text-gray-500 mt-3 text-center">This helps calculate your "Impulse Score" later.</p>
             </div>

             {/* 3. TRENDS VISUALIZATION */}
             <div className="glass-card rounded-2xl p-6 relative h-64 flex flex-col items-center">
                 <h4 className="text-xs font-bold text-gray-400 uppercase w-full mb-2">Spending Trends</h4>
                 <div className="flex-1 relative w-full h-full">
                     <canvas ref={chartRef}></canvas>
                 </div>
             </div>

          </div>
        </div>
      </main>

      {/* --- STICKY SUBMIT BAR --- */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-4 lg:pl-0 bg-gradient-to-t from-[#0F0F11] via-[#0F0F11] to-transparent pt-12 pointer-events-none">
         <div className="max-w-md mx-auto pointer-events-auto">
             <button
                onClick={handleSave}
                disabled={!selectedMood || loading}
                className={`w-full h-14 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 flex items-center justify-center gap-2
                    ${theme.button} 
                    ${!selectedMood ? 'opacity-50 cursor-not-allowed transform scale-95' : 'opacity-100 hover:scale-[1.02]'}
                `}
             >
                {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <span>Save Reflection</span>}
             </button>
         </div>
      </div>

      {/* --- SUCCESS OVERLAY --- */}
      {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl animate-fade-in">
              <div className="text-center">
                  <div className="w-24 h-24 mx-auto bg-green-500 rounded-full flex items-center justify-center text-4xl text-black shadow-[0_0_50px_rgba(34,197,94,0.5)] mb-6 animate-bounce-in">
                      <i className="fa-solid fa-check"></i>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2 font-display">Log Saved!</h2>
                  <p className="text-gray-400">Insight added to your analytics.</p>
              </div>
          </div>
      )}
    </div>
  );
}