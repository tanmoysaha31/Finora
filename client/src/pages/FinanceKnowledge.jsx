import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';

export default function FinanceKnowledge() {
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Quiz State
  const [activeLesson, setActiveLesson] = useState(null); // Which lesson is open
  const [quizMode, setQuizMode] = useState(false); // Is quiz active?
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});

  // --- STATE: Lessons & Progress ---
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState({
    completedLessons: [], 
    totalScore: 0 
  });

  const userId = localStorage.getItem('finora_user_id');
  
  // Get backend URL - use window location in production, relative path in dev
  const getBackendURL = () => {
    if (import.meta.env.DEV) {
      return '' // Local dev: use relative path (vite proxy handles it)
    }
    // Production: construct full backend URL
    // Check if we have a backend URL in environment or derive from current domain
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://finora-api.onrender.com'
    return backendUrl
  }

  // --- INIT ---
  useEffect(() => {
    const backendURL = getBackendURL();
    
    // Fetch Lessons
    fetch(`${backendURL}/api/knowledge/lessons`)
      .then(res => res.json())
      .then(data => setLessons(data))
      .catch(err => console.error("Error fetching lessons:", err));

    // Fetch Progress
    if (userId) {
        fetch(`${backendURL}/api/knowledge/progress?userId=${userId}`)
            .then(res => res.json())
            .then(data => {
                if (data) {
                    setProgress({
                        completedLessons: data.completedLessons || [],
                        totalScore: data.totalScore || 0
                    });
                }
            })
            .catch(err => console.error("Error fetching progress:", err))
            .finally(() => setLoading(false));
    } else {
        setLoading(false);
    }
  }, [userId]);

  // --- CHART (Progress) ---
  useEffect(() => {
    if (loading || !chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const ctx = chartRef.current.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 160);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'Remaining'],
        datasets: [{
          data: [progress.completedLessons.length, lessons.length - progress.completedLessons.length],
          backgroundColor: ['#10b981', '#1f2937'],
          borderColor: '#0F0F11',
          borderWidth: 4,
          cutout: '75%',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    });

    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [loading, progress, lessons]);

  // --- HANDLERS ---
  const startQuiz = (lesson) => {
    setActiveLesson(lesson);
    setQuizMode(true);
    setCurrentQIndex(0);
    setScore(0);
    setShowResult(false);
    setUserAnswers({});
  };

  const handleAnswer = (optionIndex) => {
    const q = activeLesson.quiz[currentQIndex];
    const isCorrect = optionIndex === q.answer;
    
    if (isCorrect) setScore(s => s + 1);
    
    // Move to next
    if (currentQIndex < activeLesson.quiz.length - 1) {
        setCurrentQIndex(c => c + 1);
    } else {
        finishQuiz(isCorrect ? score + 1 : score);
    }
  };

  const finishQuiz = async (finalScore) => {
    setShowResult(true);
    // If perfect score, unlock lesson
    if (finalScore >= 2 && !progress.completedLessons.includes(activeLesson.id)) {
        const newScore = progress.totalScore + (finalScore * 10);
        const newCompleted = [...progress.completedLessons, activeLesson.id];

        setProgress(p => ({
            ...p,
            completedLessons: newCompleted,
            totalScore: newScore
        }));

        // Save to DB
        if (userId) {
            try {
                const backendURL = import.meta.env.DEV ? '' : (import.meta.env.VITE_BACKEND_URL || 'https://finora-api.onrender.com');
                const res = await fetch(`${backendURL}/api/knowledge/complete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId,
                        lessonId: activeLesson.id,
                        scoreEarned: finalScore * 10
                    })
                });
                const savedData = await res.json();
                
                // Sync state with server source of truth to ensure consistency
                if (savedData && savedData.completedLessons) {
                    setProgress({
                        completedLessons: savedData.completedLessons,
                        totalScore: savedData.totalScore
                    });
                }
            } catch (err) {
                console.error("Error saving progress:", err);
            }
        }
    }
  };

  const closeQuiz = () => {
    setQuizMode(false);
    setActiveLesson(null);
  };

  // --- STYLES ---
  const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    /* Bengali Font Fallback */
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap');

    body { font-family: 'Inter', 'Noto Sans Bengali', sans-serif; background-color: #0F0F11; color: white; overflow-x: hidden; }
    h1, h2, h3, h4 { font-family: 'Plus Jakarta Sans', 'Noto Sans Bengali', sans-serif; }
    
    .glass-panel { background: rgba(30, 30, 35, 0.6); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.05); }
    .glass-modal { background: rgba(20, 20, 25, 0.95); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); }
    
    .animate-pop { animation: pop 0.3s ease-out forwards; }
    @keyframes pop { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

    .bg-blob { position: fixed; border-radius: 50%; filter: blur(100px); opacity: 0.15; z-index: -1; pointer-events: none; }
    
    .custom-scroll::-webkit-scrollbar { width: 4px; }
    .custom-scroll::-webkit-scrollbar-track { background: transparent; }
    .custom-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
  `;

  return (
    <div className="flex h-screen w-screen antialiased text-white bg-[#0F0F11]">
      <style>{customStyles}</style>
      
      <div className="bg-blob top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-900/10"></div>
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
            <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all"><i className="fa-solid fa-grid-2 w-5 text-center"></i> <span>Dashboard</span></button>
            <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/10 text-white font-medium border-l-4 border-emerald-500 shadow-inner"><i className="fa-solid fa-book-open-reader w-5 text-center text-emerald-400"></i> <span>Finance Knowledge</span></button>
            <button onClick={() => navigate('/quiz')} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all"><i className="fa-solid fa-brain w-5 text-center"></i> <span>Personality Quiz</span></button>
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 lg:ml-72 flex flex-col h-full relative z-10">
        
        {/* Header */}
        <header className="flex-shrink-0 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#0F0F11]/80 backdrop-blur-md sticky top-0 z-20 border-b border-white/5">
          <div className="w-full md:w-auto flex items-center gap-4">
             <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg"><i className="fa-solid fa-bars"></i></button>
             <div>
                <h1 className="text-xl font-bold">সহজ বাংলায় টাকা-পয়সা শেখা</h1>
                <p className="text-xs text-gray-400">Financial Literacy in Bengali</p>
             </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scroll">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- LEFT: LESSONS LIST (2/3) --- */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {lessons.map((lesson) => {
                            const isCompleted = progress.completedLessons.includes(lesson.id);
                            return (
                                <div key={lesson.id} className="glass-panel p-5 rounded-2xl hover:bg-white/5 transition-all group relative overflow-hidden">
                                    {/* Completion Badge */}
                                    {isCompleted && (
                                        <div className="absolute top-3 right-3 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/20">
                                            <i className="fa-solid fa-check mr-1"></i> Completed
                                        </div>
                                    )}

                                    <div className="flex items-start gap-4 mb-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-${lesson.color}-500/20 text-${lesson.color}-400 border border-${lesson.color}-500/30`}>
                                            <i className={`fa-solid ${lesson.icon}`}></i>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-white mb-1">{lesson.title}</h3>
                                            <p className="text-xs text-gray-400 line-clamp-2">{lesson.desc}</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 mt-4">
                                        <button 
                                            onClick={() => setActiveLesson(lesson)}
                                            className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors"
                                        >
                                            <i className="fa-solid fa-book-open mr-2"></i> পড়ুন (Read)
                                        </button>
                                        <button 
                                            onClick={() => startQuiz(lesson)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${isCompleted ? 'bg-emerald-600 text-white' : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'}`}
                                        >
                                            <i className="fa-solid fa-puzzle-piece mr-2"></i> কুইজ (Quiz)
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* --- RIGHT: PROGRESS & STATS (1/3) --- */}
                <div className="space-y-6">
                    
                    {/* Progress Chart */}
                    <div className="glass-panel rounded-3xl p-6 flex flex-col items-center relative">
                        <h3 className="text-sm font-bold text-gray-300 w-full mb-4 uppercase tracking-wider">Your Progress</h3>
                        <div className="relative w-40 h-40">
                            <canvas ref={chartRef}></canvas>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                {lessons.length === 0 ? (
                                    <>
                                        <span className="text-xl font-bold text-white">0%</span>
                                        <span className="text-[10px] text-gray-500 uppercase">No Lessons</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-3xl font-bold text-white">{Math.round((progress.completedLessons.length / lessons.length) * 100)}%</span>
                                        <span className="text-[10px] text-gray-500 uppercase">Learned</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Total Score Card */}
                    <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-white/10 rounded-3xl p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-purple-300 font-bold uppercase mb-1">Knowledge Points</p>
                            <h2 className="text-3xl font-bold text-white">{progress.totalScore}</h2>
                        </div>
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-yellow-400 text-xl shadow-[0_0_15px_rgba(250,204,21,0.3)]">
                            <i className="fa-solid fa-trophy"></i>
                        </div>
                    </div>

                </div>
            </div>
        </main>
      </div>

      {/* --- LESSON / QUIZ MODAL --- */}
      {(activeLesson || quizMode) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeQuiz}></div>
            <div className="relative w-full max-w-2xl glass-modal rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-pop">
                
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#15151a]">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${activeLesson.color}-500/20 text-${activeLesson.color}-400`}>
                            <i className={`fa-solid ${quizMode ? 'fa-puzzle-piece' : activeLesson.icon}`}></i>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{quizMode ? "কুইজ টেস্ট" : activeLesson.title}</h3>
                            <p className="text-xs text-gray-400">{quizMode ? `Question ${currentQIndex + 1} of ${activeLesson.quiz.length}` : "Lesson Content"}</p>
                        </div>
                    </div>
                    <button onClick={closeQuiz} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 transition-colors"><i className="fa-solid fa-xmark"></i></button>
                </div>

                {/* Content Body */}
                <div className="p-6 overflow-y-auto custom-scroll bg-[#0F0F11]">
                    
                    {!quizMode ? (
                        /* READING MODE */
                        <div className="space-y-6">
                            <div className="bg-white/5 p-4 rounded-xl border-l-4 border-emerald-500">
                                <h4 className="text-emerald-400 font-bold mb-2">📌 পরিচিতি</h4>
                                <p className="text-gray-300 text-sm leading-relaxed">{activeLesson.content.intro}</p>
                            </div>
                            
                            {activeLesson.content.importance && (
                                <div>
                                    <h4 className="text-white font-bold mb-2">📌 কেন গুরুত্বপূর্ণ?</h4>
                                    <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                                        {activeLesson.content.importance.map((pt, i) => <li key={i}>{pt}</li>)}
                                    </ul>
                                </div>
                            )}

                            {activeLesson.content.types && (
                                <div>
                                    <h4 className="text-white font-bold mb-2">📌 প্রকারভেদ</h4>
                                    <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                                        {activeLesson.content.types.map((pt, i) => <li key={i}>{pt}</li>)}
                                    </ul>
                                </div>
                            )}

                            <div className="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20">
                                <h4 className="text-yellow-400 font-bold mb-1"><i className="fa-solid fa-lightbulb mr-2"></i> উদাহরণ</h4>
                                <p className="text-gray-300 text-sm">{activeLesson.content.example}</p>
                            </div>

                            <button onClick={() => startQuiz(activeLesson)} className="w-full py-3 mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-bold shadow-lg hover:scale-[1.02] transition-transform">
                                পড়া শেষ? কুইজ দিন!
                            </button>
                        </div>
                    ) : (
                        /* QUIZ MODE */
                        <div className="flex flex-col h-full">
                            {!showResult ? (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-center leading-relaxed">
                                        {activeLesson.quiz[currentQIndex].q}
                                    </h2>
                                    
                                    <div className="space-y-3">
                                        {activeLesson.quiz[currentQIndex].options.map((opt, i) => (
                                            <button 
                                                key={i}
                                                onClick={() => handleAnswer(i)}
                                                className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500 transition-all flex items-center justify-between group"
                                            >
                                                <span className="text-sm font-medium text-gray-300 group-hover:text-white">{opt}</span>
                                                <i className="fa-solid fa-chevron-right text-gray-600 group-hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                /* RESULT SCREEN */
                                <div className="text-center py-8">
                                    <div className="w-24 h-24 mx-auto bg-white/10 rounded-full flex items-center justify-center text-4xl mb-4">
                                        {score >= 2 ? '🎉' : '😐'}
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">
                                        {score >= 2 ? 'দারুণ! (Great Job!)' : 'চেষ্টা চালিয়ে যান!'}
                                    </h2>
                                    <p className="text-gray-400 mb-6">
                                        You got <span className="text-white font-bold">{score}</span> out of <span className="text-white font-bold">{activeLesson.quiz.length}</span> correct.
                                    </p>
                                    
                                    <div className="flex gap-3">
                                        <button onClick={() => { setShowResult(false); setQuizMode(false); }} className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-bold">
                                            আবার পড়ুন (Read Again)
                                        </button>
                                        <button onClick={closeQuiz} className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg">
                                            সমাপ্ত (Finish)
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

    </div>
  );
}