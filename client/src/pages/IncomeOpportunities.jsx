import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';

export default function IncomeOpportunities() {
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('freelance');
  
  const [userSkills] = useState(['Design', 'React', 'Writing']);
  const [location] = useState('Remote');
  
  const [opportunities] = useState([
    { 
      id: 1, 
      title: 'UI/UX Designer for Fintech', 
      company: 'NeoBank Corp', 
      platform: 'Upwork',
      rate: '$45 - $60 / hr', 
      type: 'freelance',
      matchScore: 98, 
      skills: ['Design', 'Figma', 'Finance'],
      posted: '2h ago',
      logo: '🎨'
    },
    { 
      id: 2, 
      title: 'Frontend React Developer', 
      company: 'TechFlow', 
      platform: 'LinkedIn',
      rate: '$85,000 / yr', 
      type: 'fulltime',
      matchScore: 94, 
      skills: ['React', 'JS', 'Tailwind'],
      posted: '5h ago',
      logo: '💻'
    },
    { 
      id: 3, 
      title: 'Technical Blog Writer', 
      company: 'DevTo', 
      platform: 'Freelance',
      rate: '$200 / article', 
      type: 'side-hustle',
      matchScore: 88, 
      skills: ['Writing', 'Tech', 'SEO'],
      posted: '1d ago',
      logo: '📰'
    },
    { 
      id: 4, 
      title: 'Logo Designer', 
      company: 'StartUp Inc', 
      platform: 'Fiverr',
      rate: '$150 fixed', 
      type: 'freelance',
      matchScore: 76, 
      skills: ['Design', 'Brand'],
      posted: '3d ago',
      logo: '🎭'
    }
  ]);

  const [filteredOpp, setFilteredOpp] = useState([]);

  useEffect(() => {
    setTimeout(() => {
        setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    const filtered = opportunities.filter(op => 
        (activeTab === 'all' || op.type === activeTab)
    ).sort((a, b) => b.matchScore - a.matchScore);
    setFilteredOpp(filtered);
  }, [activeTab, opportunities]);

  useEffect(() => {
    if (loading || !chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const ctx = chartRef.current.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Current', '+1 Gig', '+2 Gigs', '+3 Gigs'],
        datasets: [{
          label: 'Projected Monthly Income',
          data: [5200, 5800, 6500, 7400],
          borderColor: '#10b981',
          backgroundColor: gradient,
          borderWidth: 3,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#10b981',
          pointRadius: 5,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { display: false },
          x: { grid: { display: false }, ticks: { color: '#6b7280' } }
        }
      }
    });

    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [loading]);

  const getMatchColor = (score) => {
    if (score >= 90) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 75) return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
  };

  const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #0F0F11; color: white; overflow-x: hidden; }
    h1, h2, h3, h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
    
    .glass-panel { background: rgba(30, 30, 35, 0.6); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.05); transition: all 0.3s ease; }
    .glass-panel:hover { border-color: rgba(255, 255, 255, 0.1); box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5); }
    
    .glass-input { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: white; transition: all 0.2s; }
    .glass-input:focus { border-color: #10b981; background: rgba(0,0,0,0.5); outline: none; }

    .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; transform: translateY(20px); }
    @keyframes slideUp { to { opacity: 1; transform: translateY(0); } }

    .bg-blob { position: fixed; border-radius: 50%; filter: blur(100px); opacity: 0.15; z-index: -1; pointer-events: none; }
    
    .tag-btn { transition: all 0.2s; }
    .tag-btn:hover { transform: translateY(-2px); }
    
    .custom-scroll::-webkit-scrollbar { width: 4px; }
    .custom-scroll::-webkit-scrollbar-track { background: transparent; }
    .custom-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
  `;

  return (
    <div className="flex h-screen w-screen antialiased text-white bg-[#0F0F11]">
      <style>{customStyles}</style>
      
      <div className="bg-blob top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-900/10"></div>
      <div className="bg-blob bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10"></div>

      <aside className={`w-72 flex-shrink-0 lg:flex flex-col justify-between p-6 border-r border-white/5 bg-[#0F0F11]/95 backdrop-blur-xl fixed h-full z-40 transition-all duration-300 ${mobileOpen ? 'flex' : 'hidden'}`}>
        <div>
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              ⚡
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">Finora</span>
          </div>
          <nav className="space-y-1">
            <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all"><span className="w-5 text-center">📊</span> <span>Dashboard</span></button>
            <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/10 text-white font-medium border-l-4 border-emerald-500 shadow-inner"><span className="w-5 text-center">💼</span> <span>Opportunities</span></button>
            <button onClick={() => navigate('/income-sources')} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all"><span className="w-5 text-center">💰</span> <span>Income Sources</span></button>
          </nav>
        </div>
      </aside>

      <div className="flex-1 lg:ml-72 flex flex-col h-full relative z-10">
        
        <header className="flex-shrink-0 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#0F0F11]/80 backdrop-blur-md sticky top-0 z-20 border-b border-white/5">
          <div className="w-full md:w-auto flex items-center gap-4">
             <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg">☰</button>
             <div>
                <h1 className="text-xl font-bold">Income Opportunities</h1>
                <p className="text-xs text-gray-400">AI-curated gigs to boost your wealth</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-white/5 p-1 rounded-xl flex">
                 {['freelance', 'fulltime', 'side-hustle'].map(t => (
                     <button 
                        key={t}
                        onClick={() => setActiveTab(t)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${activeTab === t ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                     >
                        {t.replace('-', ' ')}
                     </button>
                 ))}
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scroll">
            <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                <div className="xl:col-span-2 space-y-6">
                    
                    <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 text-8xl">🤖</div>
                        <div className="relative z-10">
                            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wide mb-3">Your Profile Match</h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {userSkills.map(skill => (
                                    <span key={skill} className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1">
                                        ✓ {skill}
                                    </span>
                                ))}
                                <button className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs hover:bg-white/10 hover:text-white transition-colors">
                                    + Add Skill
                                </button>
                            </div>
                            <div className="flex gap-4 text-xs text-gray-400">
                                <span>📍 {location}</span>
                                <span>⏰ 10h/week available</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            [1,2,3].map(i => <div key={i} className="h-32 bg-[#1A1A23] rounded-2xl animate-pulse"></div>)
                        ) : (
                            filteredOpp.map((job, index) => (
                                <div 
                                    key={job.id} 
                                    className="glass-panel rounded-2xl p-5 hover:border-emerald-500/30 transition-all duration-300 group animate-slide-up"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl border border-white/10 group-hover:scale-110 transition-transform">
                                                {job.logo}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-lg group-hover:text-emerald-300 transition-colors">{job.title}</h4>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                    <span className="font-medium text-gray-400">{job.company}</span>
                                                    <span>•</span>
                                                    <span>{job.platform}</span>
                                                    <span>•</span>
                                                    <span>{job.posted}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {job.skills.map(s => (
                                                        <span key={s} className="px-2 py-0.5 rounded-md bg-black/30 text-[10px] text-gray-400 border border-white/5">{s}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right flex flex-col items-end">
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold border mb-2 flex items-center gap-1.5 ${getMatchColor(job.matchScore)}`}>
                                                ✨ {job.matchScore}% Match
                                            </div>
                                            <span className="block font-mono text-lg font-bold text-white mb-3">{job.rate}</span>
                                            
                                            <div className="flex gap-2">
                                                <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                                                    🔖
                                                </button>
                                                <button className="px-4 py-1.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-emerald-400 transition-colors shadow-lg">
                                                    Apply Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                </div>

                <div className="space-y-6">
                    
                    <div className="glass-panel rounded-3xl p-6 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wide">Potential Impact</h3>
                            <span className="text-xs font-bold text-emerald-400">+ $2,200/mo</span>
                        </div>
                        <div className="relative w-full h-40">
                             <canvas ref={chartRef}></canvas>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-4 text-center">
                            Taking just 2 of these gigs could boost your annual income by <strong>$26k</strong>.
                        </p>
                    </div>

                    <div className="glass-panel rounded-3xl p-6 border-l-4 border-blue-500">
                        <div className="flex items-center gap-3 mb-3">
                             <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">🎓</div>
                             <h4 className="font-bold text-white">Skill Unlock</h4>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed mb-4">
                            You are matching 80% of "Senior Designer" roles. The missing piece?
                        </p>
                        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 flex justify-between items-center cursor-pointer hover:bg-blue-500/20 transition-colors">
                            <div>
                                <h5 className="font-bold text-white text-sm">Learn TypeScript</h5>
                                <p className="text-[10px] text-blue-300">+ $15/hr potential increase</p>
                            </div>
                            <span className="text-blue-400 text-xs">→</span>
                        </div>
                    </div>

                    <div className="glass-panel rounded-3xl p-6">
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Connected Platforms</h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <span className="text-blue-500">🔗</span> LinkedIn
                                </div>
                                <span className="text-[10px] text-green-400">● Active</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <span className="text-green-500">🔗</span> Upwork
                                </div>
                                <span className="text-[10px] text-green-400">● Active</span>
                            </div>
                            <button className="w-full mt-2 py-2 rounded-lg border border-dashed border-white/20 text-xs text-gray-500 hover:text-white hover:border-white/40 transition-all">
                                + Connect Fiverr
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </main>
      </div>
    </div>
  );
}