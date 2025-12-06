import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function EmotionalState() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [pageReady, setPageReady] = useState(false)
  const [selectedMood, setSelectedMood] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [animateOut, setAnimateOut] = useState(false)
  const [necessity, setNecessity] = useState('want')
  const [socialContext, setSocialContext] = useState('solo')

  const currentExpense = { id: 'exp_12345', title: 'Starbucks Coffee', amount: 6.2, category: 'Food & Drinks', icon: 'fa-mug-hot', date: 'Today', time: '2:15 PM', merchant_logo: 'https://cdn-icons-png.flaticon.com/512/5977/5977591.png' }
  const similarMoments = [
    { id: 1, title: 'Dunkin Donuts', amount: 4.5, date: 'Last Tue', mood: 'bored' },
    { id: 2, title: 'McDonalds', amount: 12.2, date: '2 weeks ago', mood: 'stressed' }
  ]
  const categoryStats = { categoryName: 'Food & Drinks', monthlyTotal: 145.5, monthlyBudget: 200.0, moodCorrelation: { happy: 60, bored: 25, stressed: 15 } }

  const emotions = [
    { id: 'happy', label: 'Happy', emoji: '😄', color: 'yellow', gradient: 'from-yellow-400 to-amber-500', insight: 'Positive reinforcement! You tend to spend on experiences when happy.' },
    { id: 'excited', label: 'Excited', emoji: '🤩', color: 'purple', gradient: 'from-purple-400 to-pink-500', insight: "High energy often leads to higher-value 'celebration' purchases." },
    { id: 'neutral', label: 'Neutral', emoji: '😐', color: 'gray', gradient: 'from-gray-400 to-slate-500', insight: 'A routine purchase. Good for maintaining stability.' },
    { id: 'bored', label: 'Bored', emoji: '🥱', color: 'indigo', gradient: 'from-indigo-400 to-blue-500', insight: 'Dopamine seeking? 40% of your small purchases happen when bored.' },
    { id: 'sad', label: 'Sad', emoji: '😢', color: 'blue', gradient: 'from-blue-400 to-cyan-500', insight: 'Retail therapy detected. Be gentle with yourself today.' },
    { id: 'stressed', label: 'Stressed', emoji: '😣', color: 'orange', gradient: 'from-orange-400 to-red-500', insight: 'Buying convenience/comfort is a common stress response.' },
    { id: 'angry', label: 'Angry', emoji: '😡', color: 'red', gradient: 'from-red-500 to-rose-600', insight: 'Frustration spending is often impulsive. Pause for a moment.' },
    { id: 'confused', label: 'Confused', emoji: '🤔', color: 'teal', gradient: 'from-teal-400 to-emerald-500', insight: 'Unsure about value? Mark this to review later.' }
  ]
  const socialOptions = [
    { id: 'solo', label: 'Solo', icon: 'fa-user' },
    { id: 'friends', label: 'Friends', icon: 'fa-user-group' },
    { id: 'partner', label: 'Partner', icon: 'fa-heart' },
    { id: 'work', label: 'Work', icon: 'fa-briefcase' }
  ]

  useEffect(() => { setTimeout(() => setPageReady(true), 300) }, [])

  const handleSave = () => {
    if (!selectedMood) return
    setLoading(true)
    const payload = { expenseId: currentExpense.id, mood: selectedMood.id, necessityScore: necessity, socialContext, timestamp: new Date() }
    console.log('Saving to MongoDB:', payload)
    setTimeout(() => {
      setLoading(false)
      setShowSuccess(true)
      setTimeout(() => {
        setAnimateOut(true)
        setTimeout(() => navigate('/dashboard'), 500)
      }, 2000)
    }, 1200)
  }

  const getTheme = () => {
    if (!selectedMood) return { accent: 'text-purple-400', border: 'border-white/10', glow: 'bg-purple-500/5', button: 'bg-[#2a2a2a] text-gray-500' }
    const c = selectedMood.color
    const map = {
      yellow: { accent: 'text-yellow-400', border: 'border-yellow-500/50', glow: 'bg-yellow-500/20', button: 'bg-yellow-500 text-black shadow-yellow-500/20' },
      purple: { accent: 'text-purple-400', border: 'border-purple-500/50', glow: 'bg-purple-500/20', button: 'bg-purple-600 text-white shadow-purple-500/20' },
      gray:   { accent: 'text-gray-400',   border: 'border-gray-500/50',   glow: 'bg-gray-500/20',   button: 'bg-gray-600 text-white shadow-gray-500/20' },
      indigo: { accent: 'text-indigo-400', border: 'border-indigo-500/50', glow: 'bg-indigo-500/20', button: 'bg-indigo-600 text-white shadow-indigo-500/20' },
      blue:   { accent: 'text-blue-400',   border: 'border-blue-500/50',   glow: 'bg-blue-500/20',   button: 'bg-blue-600 text-white shadow-blue-500/20' },
      orange: { accent: 'text-orange-400', border: 'border-orange-500/50', glow: 'bg-orange-500/20', button: 'bg-orange-500 text-white shadow-orange-500/20' },
      red:    { accent: 'text-red-400',    border: 'border-red-500/50',    glow: 'bg-red-500/20',    button: 'bg-red-600 text-white shadow-red-500/20' },
      teal:   { accent: 'text-teal-400',   border: 'border-teal-500/50',   glow: 'bg-teal-500/20',   button: 'bg-teal-600 text-white shadow-teal-500/20' }
    }
    return map[c]
  }
  const theme = getTheme()

  const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #0F0F11; color: white; overflow-x: hidden; }
    h1, h2, h3, h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    .glass-card { background: rgba(30, 30, 35, 0.6); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.05); }
    .receipt-edge { background-image: linear-gradient(135deg, #1E1E23 50%, transparent 50%), linear-gradient(45deg, #1E1E23 50%, transparent 50%); background-position: bottom left; background-repeat: repeat-x; background-size: 16px 16px; }
    .animate-unroll { animation: unroll 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; transform-origin: top; }
    @keyframes unroll { from { transform: scaleY(0); opacity: 0; } to { transform: scaleY(1); opacity: 1; } }
    .mood-chip:hover { transform: translateY(-4px) scale(1.05); }
    .mood-chip:active { transform: scale(0.95); }
    .segment-btn { transition: all 0.2s ease; }
    .segment-btn.active { background: white; color: black; box-shadow: 0 4px 12px rgba(255,255,255,0.2); }
  `

  return (
    <div className={`flex flex-col h-screen w-screen antialiased text-white transition-opacity duration-500 ${animateOut ? 'opacity-0' : 'opacity-100'}`}>
      <style>{customStyles}</style>
      <div className={`fixed inset-0 z-0 bg-[#0F0F11]`}>
         <div className={`absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] transition-all duration-1000 ${theme.glow} opacity-40`}></div>
         <div className={`absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] transition-all duration-1000 ${theme.glow} opacity-30`}></div>
      </div>
      <header className="relative z-20 flex-shrink-0 px-6 py-5 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"><i className="fa-solid fa-arrow-left"></i></button>
        <h1 className="text-lg font-bold font-display tracking-tight">Emotional Check-in</h1>
        <div className="w-10"></div>
      </header>
      <main className="relative z-10 flex-1 overflow-y-auto px-4 pb-32">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
          <div className="space-y-8">
            <div className={`relative ${pageReady ? 'animate-unroll' : 'opacity-0'}`}>
                <div className="bg-[#1E1E23] rounded-t-2xl p-6 pb-8 border border-white/5 shadow-2xl relative z-10">
                    <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-4">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center">
                                <i className={`fa-solid ${currentExpense.icon} text-xl text-gray-400`}></i>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white font-mono uppercase tracking-tight">{currentExpense.title}</h2>
                                <p className="text-xs text-gray-500 font-mono">{currentExpense.date} • {currentExpense.time}</p>
                            </div>
                        </div>
                        <span className="font-mono text-2xl font-bold text-white">${currentExpense.amount.toFixed(2)}</span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-mono text-gray-500 uppercase"><span>{categoryStats.categoryName} Budget</span><span>{Math.round((categoryStats.monthlyTotal/categoryStats.monthlyBudget)*100)}% Used</span></div>
                        <div className="w-full h-1.5 bg-black rounded-full overflow-hidden"><div className="h-full bg-white/30 rounded-full" style={{ width: '72%' }}></div></div>
                    </div>
                </div>
                <div className="h-4 w-full receipt-edge opacity-100 relative -top-1 z-0"></div>
            </div>
            <div className={`transition-all duration-500 delay-100 ${pageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <h3 className="text-2xl font-bold mb-1">How did you feel?</h3>
                <p className="text-gray-400 mb-5 text-sm">Tap the emotion that drove this transaction.</p>
                <div className="grid grid-cols-4 gap-3">
                    {emotions.map((mood) => {
                        const isSelected = selectedMood?.id === mood.id
                        return (
                            <button key={mood.id} onClick={() => setSelectedMood(mood)} className={`mood-chip relative flex flex-col items-center justify-center gap-2 aspect-square rounded-2xl border transition-all duration-300 ${isSelected ? 'bg-white text-black border-white shadow-lg' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'}`}>
                                <span className="text-2xl">{mood.emoji}</span>
                                <span className="text-xs font-bold">{mood.label}</span>
                                {isSelected && <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#0F0F11]"><i className="fa-solid fa-check text-[#0F0F11] text-[10px]"></i></div>}
                            </button>
                        )
                    })}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="glass-card rounded-2xl p-4">
                    <p className="text-xs text-gray-400 mb-2">Necessity</p>
                    <div className="flex items-center gap-2">
                        {['need','want','regret'].map(v => (
                          <button key={v} onClick={() => setNecessity(v)} className={`segment-btn px-3 py-1 rounded-full text-xs ${necessity===v ? 'active' : 'bg-white/10 text-white'}`}>{v}</button>
                        ))}
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-4">
                    <p className="text-xs text-gray-400 mb-2">Social Context</p>
                    <div className="flex items-center gap-2">
                        {socialOptions.map(o => (
                          <button key={o.id} onClick={() => setSocialContext(o.id)} className={`segment-btn px-3 py-1 rounded-full text-xs ${socialContext===o.id ? 'active' : 'bg-white/10 text-white'}`}><i className={`fa-solid ${o.icon} mr-1`}></i>{o.label}</button>
                        ))}
                    </div>
                </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs text-gray-400 mb-2">Insight</p>
              <p className="text-sm text-white">{selectedMood ? emotions.find(e=>e.id===selectedMood.id)?.insight : 'Select a mood to see insights'}</p>
            </div>
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2"><p className="text-xs text-gray-400">Category Progress</p><p className="text-xs text-gray-400">{Math.round((categoryStats.monthlyTotal/categoryStats.monthlyBudget)*100)}%</p></div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-purple-500" style={{ width: `${Math.min((categoryStats.monthlyTotal/categoryStats.monthlyBudget)*100, 100)}%` }}></div></div>
              <p className="text-[10px] text-gray-500 mt-2">${categoryStats.monthlyTotal} / ${categoryStats.monthlyBudget}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleSave} disabled={!selectedMood || loading} className={`px-5 py-3 rounded-xl font-bold ${selectedMood ? theme.button : 'bg-white/10 text-gray-400'} transition-all`}>{loading ? 'Saving...' : 'Save Check-in'}</button>
              {showSuccess && <span className="text-green-400 text-sm">Saved!</span>}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
