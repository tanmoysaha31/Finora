import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Zap, Sparkles, CheckCircle2, AlertTriangle, 
  RotateCcw, History, Copy, BrainCircuit, 
  Fingerprint, Wand2, X, Activity, Info, 
  Calendar, Tag, Terminal, TrendingUp, Search,
  ChevronRight, Wallet, CreditCard, DollarSign, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * =================================================================================================
 * 🎨 FINORA DESIGN SYSTEM (Theme Engine)
 * =================================================================================================
 * Matching Dashboard.jsx exactly: Deep dark backgrounds, glassmorphism, and specific fonts.
 */
const THEME = {
  colors: {
    bg: "bg-[#0B0B0F]", // Deep dark base from Dashboard
    surface: "bg-[#121216]", // Slightly lighter surface
    border: "border-white/10",
    primary: "text-purple-500",
    primaryBg: "bg-purple-500",
    secondary: "text-pink-500",
    success: "text-emerald-400",
    successBg: "bg-emerald-500",
    warning: "text-amber-400",
    warningBg: "bg-amber-500",
    error: "text-red-400",
    info: "text-blue-400",
    textMain: "text-white",
    textMuted: "text-gray-400"
  },
  fonts: {
    display: "font-['Plus_Jakarta_Sans']",
    body: "font-['Inter']",
    mono: "font-['JetBrains_Mono']"
  }
};

const CATEGORIES = ['Food', 'Transport', 'Utilities', 'Shopping', 'Health', 'Tech', 'Entertainment', 'Transfer', 'Salary', 'Business'];

/**
 * =================================================================================================
 * 🧠 CMUE: COGNITIVE MESSAGE UNDERSTANDING ENGINE (Logic Core)
 * =================================================================================================
 * Robust parsing for English & Bengali financial SMS.
 */
const PATTERNS = {
  // Matches: BDT 500, Tk 500, 500.00, 500tk
  amount: /(?:BDT|Tk|Tk\.|৳)\s*([0-9,]+(?:\.[0-9]{2})?)|([0-9,]+(?:\.[0-9]{2})?)\s*(?:Tk|BDT|টাকা)/i,
  // Matches: TrxID, TxnID followed by alphanumeric
  trxId: /(?:TrxID|TxnID|Trans ID)\s*[:\-]?\s*([A-Z0-9]{8,})/i,
  // Matches: DD/MM/YYYY or DD-MM-YYYY
  date: /(\d{2})[\/\-](\d{2})[\/\-](\d{4})/, 
  // Matches: Fee, Charge
  fee: /(?:Fee|Charge)\s*[:\-]?\s*(?:BDT|Tk|৳)?\s*([0-9,]+(?:\.[0-9]{2})?)/i,
};

const INTENT_MAP = {
  'Cash Out': { type: 'expense', category: 'Transfer' },
  'Send Money': { type: 'expense', category: 'Transfer' },
  'Payment': { type: 'expense', category: 'Shopping' },
  'Mobile Recharge': { type: 'expense', category: 'Utilities' },
  'Pay Bill': { type: 'expense', category: 'Utilities' },
  'Cash In': { type: 'income', category: 'Deposit' },
  'Received': { type: 'income', category: 'Salary' },
  'Add Money': { type: 'income', category: 'Transfer' },
  'Remittance': { type: 'income', category: 'Salary' },
  // Bangla Support
  'সেন্ড মানি': { type: 'expense', category: 'Transfer' },
  'ক্যাশ আউট': { type: 'expense', category: 'Transfer' },
  'পেমেন্ট': { type: 'expense', category: 'Shopping' },
  'রিচার্জ': { type: 'expense', category: 'Utilities' },
  'ক্যাশ ইন': { type: 'income', category: 'Deposit' }
};

const normalizeDate = (value) => {
  if (!value) return null;
  // Accept ISO, yyyy-mm-dd, or dd/mm/yyyy
  const isoCandidate = new Date(value);
  if (!isNaN(isoCandidate)) return isoCandidate.toISOString().split('T')[0];
  const match = value.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
  if (match) {
    const [, dd, mm, yyyy] = match;
    return `${yyyy}-${mm}-${dd}`;
  }
  return null;
};

const parseMessage = (text) => {
  const result = {
    amount: '',
    trxId: '',
    date: new Date().toISOString().split('T')[0], // Default to today
    fee: 0,
    merchant: '',
    intent: 'expense', // Default
    category: 'Others',
    confidence: 0,
    insights: [],
    tags: []
  };

  if (!text) return result;

  try {
    // 1. Amount Extraction
    const amtMatch = text.match(PATTERNS.amount);
    if (amtMatch) {
      let rawAmt = amtMatch[1] || amtMatch[2];
      if (rawAmt) {
        // Convert Bangla Numerals to English
        rawAmt = rawAmt.replace(/[০-৯]/g, d => "০১২৩৪৫৬৭৮৯".indexOf(d));
        result.amount = rawAmt.replace(/,/g, '');
        result.confidence += 30;
      }
    }

    // 2. TrxID Extraction
    const trxMatch = text.match(PATTERNS.trxId);
    if (trxMatch) {
        result.trxId = trxMatch[1];
        result.confidence += 20;
    }

    // 3. Date Extraction & Conversion
    const dateMatch = text.match(PATTERNS.date);
    if (dateMatch) {
      const day = dateMatch[1];
      const month = dateMatch[2];
      const year = dateMatch[3];
      result.date = `${year}-${month}-${day}`; 
      result.confidence += 10;
    }

    // 4. Intent & Category Detection
    for (const [key, meta] of Object.entries(INTENT_MAP)) {
      if (text.toLowerCase().includes(key.toLowerCase())) {
        result.intent = meta.type;
        result.category = meta.category;
        result.confidence += 30;
        break;
      }
    }

    // 5. Merchant Extraction (Heuristic)
    // Looks for words after "to" (expense) or "from" (income)
    const words = text.split(/\s+/);
    const toIndex = words.findIndex(w => w.toLowerCase() === 'to');
    const fromIndex = words.findIndex(w => w.toLowerCase() === 'from');
    
    if (result.intent === 'expense' && toIndex > -1 && words[toIndex + 1]) {
      // Grab next 2 words, remove punctuation
      result.merchant = words.slice(toIndex + 1, toIndex + 3).join(' ').replace(/[.,]/g, '');
      result.confidence += 10;
    } else if (result.intent === 'income' && fromIndex > -1 && words[fromIndex + 1]) {
      result.merchant = words.slice(fromIndex + 1, fromIndex + 3).join(' ').replace(/[.,]/g, '');
      result.confidence += 10;
    }

    // 6. Generate Insights
    if (result.category === 'Utilities') result.insights.push("Recurring utility bill detected.");
    if (parseFloat(result.amount) > 5000) result.insights.push("High-value transaction.");
    if (result.intent === 'income') result.insights.push("Positive cash flow detected.");
    if (!result.amount) result.insights.push("Could not detect amount. Please enter manually.");

    // Cap confidence
    result.confidence = Math.min(result.confidence, 100);

  } catch (e) {
    console.error("Parsing logic error:", e);
  }

  return result;
};

/**
 * =================================================================================================
 * 📉 COMPONENT: ELEGANT CONFIDENCE METER
 * =================================================================================================
 */
const ConfidenceMeter = ({ score }) => {
  const getStyle = () => {
    if (score >= 80) return { text: "High Confidence", color: "text-emerald-400", bg: "bg-emerald-500" };
    if (score >= 50) return { text: "Review Needed", color: "text-amber-400", bg: "bg-amber-500" };
    return { text: "Low Confidence", color: "text-red-400", bg: "bg-red-500" };
  };

  const style = getStyle();

  return (
    <div className="w-full bg-[#1A1A23]/60 rounded-xl p-5 border border-white/5 shadow-lg">
      <div className="flex justify-between items-end mb-3">
        <div className="flex items-center gap-2">
          <Activity size={16} className={style.color} />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">AI Confidence</span>
        </div>
        <span className={`text-2xl font-bold ${style.color} ${THEME.fonts.mono}`}>{score}%</span>
      </div>
      
      {/* Progress Bar */}
      <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full ${style.bg} shadow-[0_0_10px_rgba(255,255,255,0.3)]`} 
        />
      </div>
      
      <div className="flex justify-between mt-2">
        <p className={`text-[10px] ${style.color} font-medium`}>{style.text}</p>
        <p className="text-[10px] text-gray-600">Based on pattern match</p>
      </div>
    </div>
  );
};

/**
 * =================================================================================================
 * ✍️ COMPONENT: TYPEWRITER INSIGHTS CONSOLE
 * =================================================================================================
 */
const TypewriterPanel = ({ insights }) => {
  const [text, setText] = useState('');
  
  useEffect(() => {
    if (!insights || insights.length === 0) {
      setText('');
      return;
    }
    
    const fullText = insights.join("  •  ");
    let i = 0;
    setText('');
    
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setText(prev => prev + fullText.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 30); // Typing speed

    return () => clearInterval(timer);
  }, [insights]);

  if (!insights.length) return null;

  return (
    <div className="h-full w-full bg-[#0A0A0F] border border-purple-500/20 rounded-2xl p-5 font-mono text-xs text-purple-200 shadow-inner">
      <div className="flex items-center gap-2 mb-2 opacity-50">
        <Sparkles size={12} />
        <span className="uppercase tracking-widest font-bold text-[10px]">AI Analysis Log</span>
      </div>
      <div className="leading-relaxed">
        <span className="text-purple-500 mr-2">{'>'}</span>
        {text}
        <span className="inline-block w-1.5 h-3 bg-purple-500 ml-1 animate-pulse align-middle"></span>
      </div>
    </div>
  );
};

/**
 * =================================================================================================
 * ⚛️ MAIN PAGE: AUTO EXPENSE
 * =================================================================================================
 */
export default function AutoExpense() {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || 'https://finora-1mgm.onrender.com';

  // --- STATE ---
  const [rawInput, setRawInput] = useState('');
  const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'success', 'error'
  const [aiStatus, setAiStatus] = useState('idle'); // idle | loading | ready | error
  const [aiSource, setAiSource] = useState(null);
  const aiController = useRef(null);
  
  // Transaction State
  const [transaction, setTransaction] = useState({
    amount: '',
    merchant: '',
    category: 'Others',
    date: new Date().toISOString().split('T')[0],
    trxId: '',
    intent: 'expense',
    fee: 0,
    confidence: 0,
    insights: []
  });

  // --- LOGIC: Parsing Trigger ---
  useEffect(() => {
    if (!rawInput.trim()) {
      setAiStatus('idle');
      setAiSource(null);
      if (aiController.current) aiController.current.abort();
      setTransaction(prev => ({ 
        ...prev, 
        amount: '', merchant: '', trxId: '', confidence: 0, insights: [] 
      }));
      return;
    }

    const controller = new AbortController();
    aiController.current = controller;
    setAiStatus('loading');

    const run = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/ai/parse-sms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: rawInput }),
          signal: controller.signal
        });

        if (!res.ok) throw new Error('AI parse failed');

        const data = await res.json();
        const parsed = data.parsed || {};

        const fallback = parseMessage(rawInput);
        const amount = parsed.amount || fallback.amount;
        const merchant = parsed.merchant || fallback.merchant;
        const trxId = parsed.trxId || fallback.trxId;
        const date = normalizeDate(parsed.date) || fallback.date || transaction.date;
        const intent = parsed.type === 'income' ? 'income' : parsed.type === 'expense' ? 'expense' : fallback.intent;
        const category = parsed.category || fallback.category;
        const confidence = parsed.confidence ?? fallback.confidence ?? 0;
        const insights = Array.isArray(parsed.insights) && parsed.insights.length ? parsed.insights : fallback.insights;

        setTransaction(prev => ({
          ...prev,
          amount: amount || prev.amount,
          merchant: merchant || prev.merchant,
          date: date || prev.date,
          trxId: trxId || prev.trxId,
          intent: intent || prev.intent,
          category: category || prev.category,
          confidence,
          insights
        }));

        setAiStatus('ready');
        setAiSource(data.source || 'gemini');
      } catch (err) {
        if (controller.signal.aborted) return;
        const fallback = parseMessage(rawInput);
        setTransaction(prev => ({
          ...prev,
          amount: fallback.amount || prev.amount,
          merchant: fallback.merchant || prev.merchant,
          date: fallback.date || prev.date,
          trxId: fallback.trxId || prev.trxId,
          intent: fallback.intent || prev.intent,
          category: fallback.category || prev.category,
          confidence: fallback.confidence,
          insights: fallback.insights
        }));
        setAiStatus('error');
        setAiSource('fallback');
      }
    };

    run();
    return () => controller.abort();
  }, [rawInput, API_BASE]);

  // --- HANDLERS ---
  const handleSave = async () => {
    if (!transaction.amount) {
      alert("Please enter a valid amount.");
      return;
    }
    
    setSaveStatus('saving');
    
    try {
      const userId = (() => { try { const v = localStorage.getItem('finora_user_id'); return v && v !== 'null' && v !== 'undefined' ? v : null } catch(_) { return null } })();
      // Choose endpoint and shape payload according to server contracts
      const isIncome = transaction.intent === 'income';
      const endpoint = isIncome ? '/api/income/add' : '/api/expenses/add';

      // Map AutoExpense fields to API requirements
      const incomeSourceMap = {
        Salary: 'salary',
        Business: 'business',
        Freelance: 'freelance',
        Investment: 'investment',
        Gift: 'gift'
      };
      const source = incomeSourceMap[transaction.category] || 'other';

      // Normalize expense categories to canonical dashboard set
      const normalizeCategory = (c) => {
        const s = String(c || 'Others').toLowerCase()
        if (s === 'utilities') return 'Utility'
        if (s === 'food & dining' || s === 'food') return 'Food'
        if (s === 'transportation' || s === 'transport') return 'Transport'
        if (s === 'entertainment') return 'Entertainment'
        if (s === 'shopping') return 'Shopping'
        if (s === 'salary') return 'Salary'
        if (s === 'tech') return 'Tech'
        if (s === 'others') return 'Others'
        return c || 'Others'
      }

      const payload = isIncome
        ? {
            userId,
            amount: Number(transaction.amount),
            source,
            date: transaction.date,
            note: transaction.merchant || 'AutoExpense Income',
            paymentMethod: 'Mobile Banking',
            isRecurring: false
          }
        : {
            userId,
            title: transaction.merchant || 'Unknown Transaction',
            amount: Number(transaction.amount),
            date: transaction.date,
            category: normalizeCategory(transaction.category),
            paymentMethod: 'Mobile Banking',
            note: `Auto-parsed via CMUE. TrxID: ${transaction.trxId}`
          };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSaveStatus('success');
        // Show success message, then navigate to dashboard to display new transaction
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } else {
        const errorData = await res.json();
        setSaveStatus('error');
        console.error('Save failed:', errorData);
        setTimeout(() => setSaveStatus(null), 2000);
      }
    } catch (e) {
      console.error('Error saving transaction:', e);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 2000);
    }
  };

  // --- CSS STYLES ---
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    
    body { font-family: 'Inter', sans-serif; background-color: #0B0B0F; color: white; }
    h1, h2, h3, h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    
    .glass-panel {
      background: rgba(26, 26, 35, 0.6);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.05);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
    }
    
    .console-input {
      background: #0A0A0F;
      border: 1px solid rgba(255,255,255,0.1);
      color: #E2E8F0;
      font-family: 'JetBrains Mono', monospace;
      line-height: 1.6;
      transition: all 0.3s ease;
    }
    .console-input:focus {
      border-color: #7C3AED;
      box-shadow: 0 0 0 1px rgba(124, 58, 237, 0.3);
      outline: none;
    }

    .custom-scroll::-webkit-scrollbar { width: 4px; }
    .custom-scroll::-webkit-scrollbar-track { background: transparent; }
    .custom-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
  `;

  return (
    <div className={`min-h-screen ${THEME.colors.bg} text-white overflow-hidden`}>
      <style>{styles}</style>
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        
        {/* --- HEADER --- */}
        <header className="px-8 py-5 flex justify-between items-center bg-[#0B0B0F]/90 backdrop-blur-md border-b border-white/5 z-50">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5">
              <ArrowLeft size={18} className="text-gray-400 group-hover:text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <BrainCircuit size={22} className="text-purple-500" />
                AutoExpense AI
              </h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Finora's Own Automated Transaction Detection System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-400">
               CMUE: <span className="text-green-400">ONLINE</span>
             </div>
             <div className="px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-semibold text-purple-200 uppercase tracking-wide">
               AI {aiStatus === 'loading' ? 'Parsing…' : aiStatus === 'ready' ? 'Ready' : aiStatus === 'error' ? 'Fallback' : 'Idle'}{aiSource ? ` · ${aiSource}` : ''}
             </div>
          </div>
        </header>

        {/* --- MAIN WORKSPACE --- */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-6 lg:p-10 gap-8">
          
          {/* --- LEFT COLUMN: CONSOLE & CONFIDENCE (40%) --- */}
          <div className="w-full lg:w-5/12 flex flex-col gap-6">
            
            {/* 1. Message Console */}
            <div className="flex-1 glass-panel rounded-3xl p-1 relative flex flex-col min-h-[300px]">
              <div className="absolute top-4 left-6 z-10 flex items-center gap-2">
                <Terminal size={14} className="text-purple-400" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Message Console</span>
              </div>
              
              <div className="absolute top-4 right-6 z-10 flex items-center gap-3">
                <button 
                  onClick={() => setRawInput("Payment successful to Foodpanda. Amount BDT 1,250.00. TrxID 8FH5G6H7. 27/12/2025")} 
                  className="text-[10px] text-purple-400 hover:text-white transition-colors font-bold flex items-center gap-1 uppercase"
                >
                  <Wand2 size={10} /> Demo
                </button>
                {rawInput && <button onClick={() => setRawInput('')} className="text-[10px] text-red-400 hover:text-white transition-colors font-bold uppercase">Clear</button>}
                {saveStatus === 'saving' && <span className="text-[10px] text-blue-400 font-semibold animate-pulse">Saving...</span>}
                {aiStatus === 'loading' && <span className="text-[10px] text-yellow-400 font-semibold">AI parsing…</span>}
              </div>

              <textarea
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder="// Paste Transaction SMS here..."
                className="w-full h-full console-input rounded-[20px] p-6 pt-12 text-sm resize-none focus:ring-0 placeholder:text-gray-700 text-gray-300"
                spellCheck="false"
              />
              
              {/* Regex Tags Overlay */}
              {rawInput && (
                <div className="absolute bottom-4 right-4 flex gap-2 pointer-events-none">
                  {transaction.amount && <span className="px-2 py-1 rounded bg-green-500/10 border border-green-500/20 text-[10px] font-mono text-green-400">AMT: {transaction.amount}</span>}
                  {transaction.trxId && <span className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono text-blue-400">ID: {transaction.trxId}</span>}
                </div>
              )}
            </div>

            {/* 2. Confidence Meter (Conditional) */}
            <AnimatePresence>
              {rawInput.trim().length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: 10 }}
                >
                  <ConfidenceMeter score={transaction.confidence} />
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* --- RIGHT COLUMN: FORM & INSIGHTS (60%) --- */}
          <div className="w-full lg:w-7/12 h-full flex flex-col gap-6">
            
            {/* 3. Transaction Details Form */}
            <div className="flex-1 glass-panel rounded-3xl p-8 bg-[#16161D]/40 border border-white/5 relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><Activity size={18} /></div>
                  <h2 className="text-lg font-bold text-white">Parsed Details</h2>
                </div>
                {transaction.merchant && <span className="text-xs bg-white/5 px-3 py-1 rounded-full text-gray-400 font-mono">{transaction.trxId || 'NO_ID'}</span>}
              </div>

              <div className="space-y-6">
                
                {/* Merchant Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Merchant / Title</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400 transition-colors">
                      <Tag size={18} />
                    </div>
                    <input 
                      value={transaction.merchant}
                      onChange={(e) => setTransaction({...transaction, merchant: e.target.value})}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#0A0A0F] border border-white/10 text-white font-medium focus:border-purple-500 focus:outline-none transition-all placeholder:text-gray-700"
                      placeholder="Unknown Source"
                    />
                  </div>
                </div>

                {/* Amount & Type Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Amount</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                        <span className="text-lg font-mono font-bold">৳</span>
                      </div>
                      <input 
                        type="number"
                        value={transaction.amount}
                        onChange={(e) => setTransaction({...transaction, amount: e.target.value})}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#0A0A0F] border border-white/10 text-white font-mono text-xl font-bold focus:border-green-500 focus:outline-none transition-all placeholder:text-gray-700"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Transaction Type</label>
                    <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => setTransaction({...transaction, intent: 'expense'})}
                          className={`w-full py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all flex justify-between px-4 ${
                            transaction.intent === 'expense' 
                              ? 'bg-red-500/10 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                              : 'bg-white/5 border-white/5 text-gray-600 hover:text-gray-400'
                          }`}
                        >
                          <span>Expense</span>
                          {transaction.intent === 'expense' && <CheckCircle2 size={14} />}
                        </button>
                        <button 
                          onClick={() => setTransaction({...transaction, intent: 'income'})}
                          className={`w-full py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all flex justify-between px-4 ${
                            transaction.intent === 'income' 
                              ? 'bg-green-500/10 border-green-500/50 text-green-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                              : 'bg-white/5 border-white/5 text-gray-600 hover:text-gray-400'
                          }`}
                        >
                          <span>Income</span>
                          {transaction.intent === 'income' && <CheckCircle2 size={14} />}
                        </button>
                    </div>
                  </div>
                </div>

                {/* Date & Category Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Date</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                        <Calendar size={18} />
                      </div>
                      <input 
                        type="date"
                        value={transaction.date}
                        onChange={(e) => setTransaction({...transaction, date: e.target.value})}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#0A0A0F] border border-white/10 text-gray-300 text-sm focus:border-purple-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      value={transaction.category}
                      onChange={(e) => setTransaction({...transaction, category: e.target.value})}
                      className="w-full px-4 py-3.5 rounded-xl bg-[#0A0A0F] border border-white/10 text-gray-300 text-sm focus:border-purple-500 focus:outline-none transition-all appearance-none cursor-pointer"
                    >
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      <option value="Others">Others</option>
                    </select>
                  </div>
                </div>

                {/* 4. Action Button */}
                <div className="pt-6 border-t border-white/5">
                  <button 
                    onClick={handleSave}
                    disabled={!transaction.amount}
                    className={`
                      w-full py-4 rounded-xl font-bold text-sm shadow-xl flex items-center justify-center gap-3 transition-all duration-300
                      ${saveStatus === 'success' 
                        ? 'bg-green-500 text-black scale-[0.98]' 
                        : saveStatus === 'error'
                          ? 'bg-red-500 text-white'
                          : transaction.intent === 'income' 
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20' 
                            : 'bg-white text-black hover:bg-gray-200 shadow-white/10'
                      }
                      ${(!transaction.amount) && 'opacity-50 cursor-not-allowed'}
                    `}
                  >
                    {saveStatus === 'success' ? (
                      <> <CheckCircle2 size={18} /> Saved Successfully </>
                    ) : saveStatus === 'error' ? (
                      <> <AlertTriangle size={18} /> Failed to Save </>
                    ) : (
                      <> 
                        {transaction.intent === 'income' ? <ShieldCheck size={18} /> : <CheckCircle2 size={18} />} 
                        Confirm {transaction.intent === 'income' ? 'Income' : 'Expense'}
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>

            {/* 5. AI Insights (Bottom Right) */}
            <AnimatePresence>
              {transaction.insights.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: 10 }}
                  className="h-auto min-h-[100px]"
                >
                  <TypewriterPanel insights={transaction.insights} />
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </div>
    </div>
  );
}