import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';

export default function FinancialPersonalityQuiz() {
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // --- STATE MANAGEMENT ---
  const [gameState, setGameState] = useState('start'); // 'start', 'quiz', 'analyzing', 'result'
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { q1: score, q2: score... }
  const [result, setResult] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // --- MOCK DB: QUESTIONS ---
  // Designed to measure: Discipline, Risk Tolerance, Knowledge, Mindfulness
  const questions = [
    {
      id: 1,
      text: "When you receive your paycheck, what is your very first instinct?",
      options: [
        { text: "Pay bills and save immediately.", traits: { discipline: 10, mindfulness: 8 } },
        { text: "Treat myself to something nice, then pay bills.", traits: { discipline: 2, mindfulness: 3 } },
        { text: "Invest a portion, then budget the rest.", traits: { discipline: 8, risk: 7, knowledge: 8 } },
        { text: "I don't really have a plan, I just spend as needed.", traits: { discipline: 0, mindfulness: 1 } }
      ]
    },
    {
      id: 2,
      text: "The stock market just crashed by 20%. What do you do?",
      options: [
        { text: "Panic and sell everything to save what's left.", traits: { risk: 0, knowledge: 2 } },
        { text: "Do nothing. I'm in it for the long haul.", traits: { risk: 5, knowledge: 7, discipline: 8 } },
        { text: "Buy more! Everything is on sale.", traits: { risk: 10, knowledge: 9 } },
        { text: "I don't have investments.", traits: { knowledge: 0, risk: 0 } }
      ]
    },
    {
      id: 3,
      text: "How do you track your monthly expenses?",
      options: [
        { text: "I track every single penny in a spreadsheet/app.", traits: { discipline: 10, mindfulness: 10 } },
        { text: "I check my bank balance occasionally.", traits: { discipline: 4, mindfulness: 4 } },
        { text: "I have a mental estimate, but nothing written.", traits: { discipline: 2, mindfulness: 3 } },
        { text: "I honestly have no idea where my money goes.", traits: { discipline: 0, mindfulness: 0 } }
      ]
    },
    {
      id: 4,
      text: "You see a luxury item you really want but didn't plan for. You...",
      options: [
        { text: "Buy it immediately. YOLO!", traits: { mindfulness: 0, discipline: 0 } },
        { text: "Wait 24 hours to see if I still want it.", traits: { mindfulness: 7, discipline: 6 } },
        { text: "Save up for it over a few months.", traits: { discipline: 10, mindfulness: 8 } },
        { text: "Check if I can find a cheaper alternative.", traits: { knowledge: 6, mindfulness: 6 } }
      ]
    },
    {
      id: 5,
      text: "What does 'Emergency Fund' mean to you?",
      options: [
        { text: "I have 6 months of expenses saved up.", traits: { discipline: 10, risk: 2 } },
        { text: "I have a credit card for emergencies.", traits: { discipline: 3, knowledge: 3 } },
        { text: "I have about $500 - $1000 cash.", traits: { discipline: 6, risk: 4 } },
        { text: "I rely on family or friends if things get tough.", traits: { discipline: 1, risk: 8 } }
      ]
    },
    {
      id: 6,
      text: "How confident are you in your understanding of compound interest?",
      options: [
        { text: "I could teach a class on it.", traits: { knowledge: 10 } },
        { text: "I understand the basic concept.", traits: { knowledge: 6 } },
        { text: "I've heard of it, but not sure how it works.", traits: { knowledge: 3 } },
        { text: "Compound what?", traits: { knowledge: 0 } }
      ]
    },
    {
      id: 7,
      text: "Your goal for next year is to...",
      options: [
        { text: "Grow my net worth aggressively.", traits: { risk: 8, discipline: 8 } },
        { text: "Just get by without debt.", traits: { risk: 2, discipline: 5 } },
        { text: "Travel and enjoy life, money is secondary.", traits: { mindfulness: 8, discipline: 2 } },
        { text: "Buy a house or major asset.", traits: { discipline: 9, knowledge: 5 } }
      ]
    },
    {
      id: 8,
      text: "How do you feel about debt?",
      options: [
        { text: "Avoid it at all costs.", traits: { risk: 1, discipline: 9 } },
        { text: "It's a useful tool if used strategically (leverage).", traits: { knowledge: 9, risk: 6 } },
        { text: "It's a necessary evil to live the life I want.", traits: { discipline: 3, mindfulness: 2 } },
        { text: "I'm drowning in it and ignore the statements.", traits: { discipline: 0, knowledge: 1 } }
      ]
    },
    {
      id: 9,
      text: "You unexpectedly receive $1,000. What do you do?",
      options: [
        { text: "Invest it all.", traits: { discipline: 7, risk: 6 } },
        { text: "Pay off debt or put in savings.", traits: { discipline: 9, risk: 1 } },
        { text: "Spend half, save half.", traits: { mindfulness: 6, discipline: 5 } },
        { text: "Book a weekend getaway.", traits: { mindfulness: 3, discipline: 1 } }
      ]
    },
    {
      id: 10,
      text: "How often do you talk about money with family/friends?",
      options: [
        { text: "Openly and often to learn/share.", traits: { knowledge: 8, mindfulness: 9 } },
        { text: "Only when necessary.", traits: { mindfulness: 5 } },
        { text: "Never, it's taboo or uncomfortable.", traits: { mindfulness: 1, knowledge: 2 } },
        { text: "I complain about being broke, mostly.", traits: { discipline: 2, mindfulness: 3 } }
      ]
    }
  ];

  // --- MOCK DB: PERSONALITY TYPES ---
  const personalities = {
    wealth_architect: {
      title: "The Wealth Architect",
      desc: "You are disciplined, strategic, and knowledgeable. You view money as a tool to build a fortress of security and growth.",
      color: "purple",
      icon: "fa-chess-rook"
    },
    savvy_investor: {
      title: "The Savvy Investor",
      desc: "You aren't afraid of risk and understand that growth requires action. You have a sharp eye for opportunity.",
      color: "green",
      icon: "fa-chart-line"
    },
    balanced_realist: {
      title: "The Balanced Realist",
      desc: "You enjoy life today while keeping an eye on tomorrow. You have a healthy relationship with money but could optimize further.",
      color: "blue",
      icon: "fa-scale-balanced"
    },
    spontaneous_spender: {
      title: "The Spontaneous Spirit",
      desc: "You prioritize experiences and the present moment. While you live life to the fullest, your future self might need some help.",
      color: "orange",
      icon: "fa-ticket"
    },
    cautious_guardian: {
      title: "The Cautious Guardian",
      desc: "Safety is your number one priority. You are excellent at saving but might be missing out on growth due to fear of risk.",
      color: "teal",
      icon: "fa-shield-halved"
    }
  };

  // --- LOGIC ---
  const handleAnswer = (option) => {
    // 1. Accumulate scores
    const newAnswers = { ...answers };
    // Add traits from selection to current running total (simplified logic)
    for (const [key, value] of Object.entries(option.traits)) {
      newAnswers[key] = (newAnswers[key] || 0) + value;
    }
    setAnswers(newAnswers);

    // 2. Next Question or Finish
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      finishQuiz(newAnswers);
    }
  };

  const finishQuiz = (finalAnswers) => {
    setGameState('analyzing');
    
    // Simulate AI Processing
    setTimeout(() => {
      // Simple Logic to determine persona based on highest traits
      let personaKey = 'balanced_realist';
      const { discipline = 0, risk = 0, knowledge = 0 } = finalAnswers;

      if (discipline > 60 && risk < 30) personaKey = 'cautious_guardian';
      else if (discipline > 60 && knowledge > 50) personaKey = 'wealth_architect';
      else if (risk > 50 && knowledge > 40) personaKey = 'savvy_investor';
      else if (discipline < 30) personaKey = 'spontaneous_spender';
      
      setResult({
        ...personalities[personaKey],
        scores: finalAnswers
      });
      setGameState('result');
    }, 2500);
  };

  // --- CHART RENDERING (Results Page) ---
  useEffect(() => {
    if (gameState === 'result' && result && chartRef.current) {
      if (chartInstance.current) chartInstance.current.destroy();

      const ctx = chartRef.current.getContext('2d');
      // Radar Chart for Traits
      chartInstance.current = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: ['Discipline', 'Risk Taking', 'Financial IQ', 'Mindfulness'],
          datasets: [{
            label: 'Your Profile',
            data: [
              result.scores.discipline || 20, 
              result.scores.risk || 20, 
              result.scores.knowledge || 20, 
              result.scores.mindfulness || 20
            ],
            backgroundColor: 'rgba(124, 58, 237, 0.4)', // Purple Area
            borderColor: '#8b5cf6',
            pointBackgroundColor: '#fff',
            pointBorderColor: '#8b5cf6',
          }]
        },
        options: {
          scales: {
            r: {
              angleLines: { color: 'rgba(255,255,255,0.1)' },
              grid: { color: 'rgba(255,255,255,0.1)' },
              pointLabels: { color: '#fff', font: { size: 12 } },
              suggestedMin: 0,
              suggestedMax: 80,
              ticks: { display: false }
            }
          },
          plugins: { legend: { display: false } }
        }
      });
    }
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [gameState, result]);

  // --- DYNAMIC STYLES & THEME ---
  const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #0F0F11; color: white; overflow-x: hidden; }
    h1, h2, h3, h4 { font-family: 'Plus Jakarta Sans', sans-serif; }

    .glass-card { 
        background: rgba(30, 30, 35, 0.6); 
        backdrop-filter: blur(24px); 
        border: 1px solid rgba(255, 255, 255, 0.05); 
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
    }
    
    /* Option Card Hover Effect */
    .option-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .option-card:hover {
        transform: translateY(-4px) scale(1.01);
        background: rgba(139, 92, 246, 0.1); /* Purple tint */
        border-color: rgba(139, 92, 246, 0.4);
    }

    /* Animations */
    .animate-slide-in { animation: slideIn 0.5s ease-out forwards; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    .animate-pulse-slow { animation: pulse 3s infinite; }
    @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }

    .bg-blob { position: fixed; border-radius: 50%; filter: blur(120px); opacity: 0.15; z-index: -1; pointer-events: none; }

    .progress-bar { transition: width 0.5s ease-in-out; }
  `;

  // --- RENDER COMPONENTS ---

  const renderStartScreen = () => (
    <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto p-6 animate-slide-in">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(124,58,237,0.4)]">
            <i className="fa-solid fa-brain text-4xl text-white"></i>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            What's Your Money Mindset?
        </h1>
        <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            Finora AI will analyze your financial psychology based on 10 strategic questions. 
            Discover your strengths, blind spots, and personalized path to wealth.
        </p>
        <button 
            onClick={() => setGameState('quiz')}
            className="group relative px-8 py-4 rounded-full bg-white text-black font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
        >
            <span className="relative z-10 flex items-center gap-2">
                Start Analysis <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-blue-200 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
    </div>
  );

  const renderQuizScreen = () => {
    const q = questions[currentQIndex];
    const progress = ((currentQIndex + 1) / questions.length) * 100;

    return (
        <div className="max-w-3xl mx-auto h-full flex flex-col justify-center p-4 animate-slide-in">
            {/* Header / Progress */}
            <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-purple-400 uppercase tracking-widest">Question {currentQIndex + 1} / {questions.length}</span>
                    <span className="text-xs text-gray-500">{Math.round(progress)}% Complete</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-600 to-blue-500 progress-bar" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            {/* Question Card */}
            <div className="glass-card p-8 rounded-3xl mb-6 relative">
                <div className="absolute -top-6 left-8 bg-[#0F0F11] px-4 py-1 rounded-full border border-white/10 text-2xl">
                    🧐
                </div>
                <h2 className="text-2xl md:text-3xl font-bold leading-tight mt-2">{q.text}</h2>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-4">
                {q.options.map((opt, i) => (
                    <button 
                        key={i} 
                        onClick={() => handleAnswer(opt)}
                        className="option-card text-left p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 group"
                    >
                        <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-sm font-bold text-gray-400 group-hover:bg-purple-500 group-hover:text-white group-hover:border-purple-500 transition-all">
                            {String.fromCharCode(65 + i)}
                        </div>
                        <span className="text-base md:text-lg text-gray-200 group-hover:text-white transition-colors">{opt.text}</span>
                    </button>
                ))}
            </div>
        </div>
    );
  };

  const renderAnalyzingScreen = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="relative w-32 h-32 mb-8">
            <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
            <div className="absolute inset-4 bg-white/5 rounded-full backdrop-blur-md flex items-center justify-center animate-pulse-slow">
                <i className="fa-solid fa-wand-magic-sparkles text-3xl text-purple-400"></i>
            </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Analyzing your responses...</h2>
        <p className="text-gray-400">Comparing with 5 financial models</p>
    </div>
  );

  const renderResultScreen = () => (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-slide-in">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left: The Persona */}
            <div className="glass-card p-8 rounded-3xl border-t-4 border-purple-500 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-purple-500/20 to-transparent pointer-events-none"></div>
                
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 relative z-10 border border-white/10 shadow-[0_0_30px_rgba(124,58,237,0.3)]">
                    <i className={`fa-solid ${result.icon} text-4xl text-purple-300`}></i>
                </div>
                
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Your Financial Archetype</p>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{result.title}</h1>
                <p className="text-gray-300 text-lg leading-relaxed mb-8">
                    {result.desc}
                </p>

                <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="bg-green-500/10 p-4 rounded-2xl border border-green-500/20">
                        <h4 className="text-green-400 font-bold mb-1"><i className="fa-solid fa-thumbs-up mr-1"></i> Strength</h4>
                        <p className="text-xs text-gray-400">High potential for rapid growth.</p>
                    </div>
                    <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                        <h4 className="text-red-400 font-bold mb-1"><i className="fa-solid fa-triangle-exclamation mr-1"></i> Watch Out</h4>
                        <p className="text-xs text-gray-400">Tendency to over-leverage.</p>
                    </div>
                </div>
            </div>

            {/* Right: The Data & CTA */}
            <div className="space-y-6">
                
                {/* Radar Chart Panel */}
                <div className="glass-card p-6 rounded-3xl flex flex-col items-center">
                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 w-full text-left">Psychological Map</h3>
                    <div className="relative w-full h-[300px]">
                        <canvas ref={chartRef}></canvas>
                    </div>
                </div>

                {/* AI Recommendation CTA */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-white/10 flex items-center justify-between gap-4">
                    <div>
                        <h4 className="font-bold text-white text-lg">Your Next Move</h4>
                        <p className="text-sm text-gray-400">Based on your results, we recommend setting a strict budget.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/budget')}
                        className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors shadow-lg whitespace-nowrap"
                    >
                        Open Planner
                    </button>
                </div>

            </div>
        </div>

        <div className="text-center mt-12">
            <button onClick={() => window.location.reload()} className="text-gray-500 hover:text-white transition-colors text-sm underline">
                Retake Quiz
            </button>
        </div>
    </div>
  );

  return (
    <div className="flex h-screen w-screen antialiased text-white bg-[#0F0F11]">
      <style>{customStyles}</style>
      
      {/* Background Ambience */}
      <div className="bg-blob top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20"></div>
      <div className="bg-blob bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20"></div>

      {/* --- SIDEBAR --- */}
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
             <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/10 text-white font-medium border-l-4 border-purple-500 shadow-inner"><i className="fa-solid fa-brain w-5 text-center text-purple-400"></i> <span>Personality Quiz</span></button>
          </nav>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 lg:ml-72 flex flex-col h-full relative z-10">
        
        {/* Header (Simplified for Quiz Focus) */}
        <header className="flex-shrink-0 px-6 py-4 flex items-center justify-between bg-[#0F0F11]/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
             <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg"><i className="fa-solid fa-bars"></i></button>
             <h1 className="text-lg font-bold text-gray-300">
                {gameState === 'start' ? 'Finora AI Analysis' : gameState === 'result' ? 'Analysis Complete' : 'Questionnaire'}
             </h1>
          </div>
          <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 hover:text-white">Exit</button>
        </header>

        {/* Dynamic Main Stage */}
        <main className="flex-1 overflow-y-auto custom-scroll relative">
            {gameState === 'start' && renderStartScreen()}
            {gameState === 'quiz' && renderQuizScreen()}
            {gameState === 'analyzing' && renderAnalyzingScreen()}
            {gameState === 'result' && renderResultScreen()}
        </main>

      </div>
    </div>
  );
}