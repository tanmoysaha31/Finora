import React, { useState, useEffect, useRef } from 'react';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Tag, 
  FileText, 
  Plus, 
  Save, 
  ArrowLeft, 
  Home, 
  PieChart, 
  Settings, 
  LogOut, 
  Wallet,
  Coffee,
  ShoppingBag,
  Zap,
  Car,
  Gamepad2,
  MoreHorizontal,
  CheckCircle2,
  X,
  ChevronDown,
  Smartphone
} from 'lucide-react';

/**
 * ------------------------------------------------------------------
 * CONFIGURATION & THEME
 * ------------------------------------------------------------------
 * Font Family: 'Work Sans', 'Inter', sans-serif (Per instructions)
 * Color Palette: Dark #0D0D12, Purple #7C3AED, Pink #DB2777, White
 */

const THEME = {
  colors: {
    bg: "bg-[#0B0B0F]", // Deep dark background like dashboard
    card: "bg-[#1A1A23]/60", // Glassmorphic card base
    cardHover: "bg-[#1A1A23]/80",
    primary: "from-purple-600 to-pink-600", // Gradient for main actions
    textMain: "text-white",
    textMuted: "text-gray-400",
    accentPurple: "text-purple-400",
    border: "border-white/5",
  }
};

/**
 * ------------------------------------------------------------------
 * MOCK DATA (MERN Placeholder)
 * ------------------------------------------------------------------
 * In a real MERN app, these would come from MongoDB collections:
 * - Categories collection
 * - PaymentMethods collection
 */
const CATEGORIES = [
  { id: 'cat_1', name: 'Food & Dining', icon: Coffee, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { id: 'cat_2', name: 'Shopping', icon: ShoppingBag, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  { id: 'cat_3', name: 'Transportation', icon: Car, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'cat_4', name: 'Entertainment', icon: Gamepad2, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 'cat_5', name: 'Utilities', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { id: 'cat_6', name: 'Others', icon: MoreHorizontal, color: 'text-gray-400', bg: 'bg-gray-500/10' },
];

const PAYMENT_METHODS = [
  { id: 'pm_1', name: 'Cash', icon: Wallet },
  { id: 'pm_2', name: 'Credit Card', icon: CreditCard },
  { id: 'pm_3', name: 'Debit Card', icon: CreditCard },
  { id: 'pm_4', name: 'Mobile Banking', icon: Smartphone },
];

const QUICK_ADDS = [
  { id: 'qa_1', name: 'Regular Transport', amount: 200, category: 'cat_3', icon: Car },
  { id: 'qa_2', name: 'Morning Coffee', amount: 150, category: 'cat_1', icon: Coffee },
  { id: 'qa_3', name: 'Netflix Sub', amount: 1200, category: 'cat_4', icon: Gamepad2 },
];

// ------------------------------------------------------------------
// COMPONENT: NAV ITEM
// ------------------------------------------------------------------
const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`
      flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-300 group
      ${active 
        ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white border border-white/5 shadow-[0_0_15px_rgba(124,58,237,0.1)]' 
        : 'text-gray-400 hover:text-white hover:bg-white/5'}
    `}
  >
    <Icon size={20} className={`transition-transform duration-300 group-hover:scale-110 ${active ? 'text-purple-400' : ''}`} />
    <span className="font-medium">{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />}
  </button>
);

// ------------------------------------------------------------------
// COMPONENT: MAIN APP
// ------------------------------------------------------------------
export default function App() {
  const [activeTab, setActiveTab] = useState('add-expense');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- STATE MANAGEMENT (MERN READY) ---
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    paymentMethod: 'pm_1',
    note: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (catId) => {
    setFormData(prev => ({ ...prev, category: catId }));
  };

  const handlePaymentSelect = (methodId) => {
    setFormData(prev => ({ ...prev, paymentMethod: methodId }));
  };

  const handleQuickAdd = (qa) => {
    setFormData({
      title: qa.name,
      amount: qa.amount.toString(),
      date: new Date().toISOString().split('T')[0],
      category: qa.category,
      paymentMethod: formData.paymentMethod, // Keep current preferred method
      note: 'Quick added from suggestions'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // ---------------------------------------------------------
    // MERN STACK IMPLEMENTATION NOTE:
    // This is where you would make your Axios/Fetch call.
    // ---------------------------------------------------------
    // try {
    //   const response = await axios.post('/api/expenses/add', formData, {
    //     headers: { Authorization: `Bearer ${token}` }
    //   });
    //   if (response.data.success) { ... }
    // } catch (err) { ... }
    
    // Simulating API delay for UI demonstration
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Reset after success animation
      setTimeout(() => {
        setShowSuccess(false);
        setFormData(prev => ({ ...prev, title: '', amount: '', note: '', category: '' }));
      }, 2000);
    }, 1500);
  };

  return (
    <div className={`min-h-screen ${THEME.colors.bg} font-sans text-white overflow-x-hidden selection:bg-purple-500/30 selection:text-white`}>
      {/* Background Gradients & Blurs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-900/10 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
        <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 w-[60%] h-[20%] bg-blue-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        
        {/* --- SIDEBAR (Desktop) --- */}
        <aside className="hidden lg:flex flex-col w-72 h-full border-r border-white/5 bg-[#0B0B0F]/90 backdrop-blur-xl p-6">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Zap className="text-white" size={20} fill="currentColor" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Finora</h1>
          </div>

          <div className="space-y-2 flex-1">
            <NavItem icon={Home} label="Dashboard" onClick={() => setActiveTab('dashboard')} />
            <NavItem icon={PieChart} label="Transactions" onClick={() => setActiveTab('transactions')} />
            <NavItem icon={Wallet} label="My Cards" onClick={() => setActiveTab('cards')} />
            <div className="pt-4 pb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-3 mb-2">Actions</p>
              <NavItem icon={Plus} label="Add Expense" active={true} onClick={() => {}} />
              <NavItem icon={ArrowLeft} label="Income" onClick={() => {}} />
            </div>
            <NavItem icon={Settings} label="Preferences" onClick={() => setActiveTab('settings')} />
          </div>

          <div className="mt-auto pt-6 border-t border-white/5">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 overflow-hidden">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-purple-300 transition-colors">Tanmoy Saha</p>
                <p className="text-xs text-gray-500 truncate">Premium Plan</p>
              </div>
              <LogOut size={16} className="text-gray-500 group-hover:text-red-400 transition-colors" />
            </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          
          {/* Header Mobile/Desktop */}
          <header className="sticky top-0 z-30 flex items-center justify-between p-6 lg:px-10 border-b border-white/5 bg-[#0B0B0F]/80 backdrop-blur-md">
            <div className="lg:hidden flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <Zap size={16} fill="currentColor" />
               </div>
               <span className="font-bold text-lg">Finora</span>
            </div>
            
            <div className="hidden lg:block">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Add New Expense</h2>
              <p className="text-sm text-gray-500">Track your daily spending easily</p>
            </div>

            <div className="flex items-center gap-4">
              <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-sm font-medium hover:bg-white/10 transition-all">
                 <Wallet size={16} className="text-purple-400" />
                 <span>Balance: <span className="text-white font-bold">$124,592.50</span></span>
              </button>
              <button className="p-2 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 hover:scale-110 transition-all relative">
                <div className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 border border-[#0B0B0F]" />
                <Settings size={20} />
              </button>
            </div>
          </header>

          <div className="p-4 lg:p-10 max-w-7xl mx-auto">
            
            {/* --- LAYOUT GRID --- */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* LEFT COLUMN: MAIN FORM */}
              <div className="xl:col-span-2 space-y-6">
                
                {/* 1. Category Selector */}
                <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  <label className="text-sm font-medium text-gray-400 ml-1">Select Category</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategorySelect(cat.id)}
                        className={`
                          relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all duration-300
                          ${formData.category === cat.id 
                            ? 'bg-white/10 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)] transform scale-105' 
                            : 'bg-[#1A1A23]/40 border-white/5 hover:bg-[#1A1A23]/80 hover:border-white/10'}
                        `}
                      >
                        <div className={`p-2 rounded-full ${cat.bg} ${cat.color} ${formData.category === cat.id ? 'animate-bounce-short' : ''}`}>
                          <cat.icon size={20} />
                        </div>
                        <span className={`text-xs font-medium ${formData.category === cat.id ? 'text-white' : 'text-gray-400'}`}>
                          {cat.name}
                        </span>
                        {formData.category === cat.id && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#0B0B0F]">
                            <CheckCircle2 size={12} className="text-[#0B0B0F]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Amount & Name Card */}
                <div className={`
                  p-6 rounded-3xl border border-white/5 bg-[#1A1A23]/40 backdrop-blur-md relative overflow-hidden group
                  animate-slide-up
                `} style={{ animationDelay: '0.2s' }}>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/10 transition-all duration-700" />
                  
                  <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Amount Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Amount Spent</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={24} />
                        <input
                          type="number"
                          name="amount"
                          value={formData.amount}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-black/20 border border-white/5 text-3xl font-bold text-white placeholder-gray-700 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                        />
                      </div>
                    </div>

                    {/* Expense Name Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Expense Title</label>
                      <div className="relative h-full">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Tag className="text-gray-500" size={18} />
                         </div>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="Eg: Hangout at Chillox"
                          className="w-full h-[74px] pl-12 pr-4 rounded-2xl bg-black/20 border border-white/5 text-lg text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Details Row (Date & Payment) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                  
                  {/* Date Picker (Styled) */}
                  <div className="p-6 rounded-3xl border border-white/5 bg-[#1A1A23]/40 backdrop-blur-md hover:border-white/10 transition-all group">
                    <label className="block text-sm font-medium text-gray-400 mb-4 group-hover:text-purple-400 transition-colors">Date of Transaction</label>
                    <div className="relative">
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full p-4 pl-12 rounded-xl bg-black/20 border border-white/5 text-white focus:outline-none focus:border-purple-500/50 transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                      />
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500 pointer-events-none" size={20} />
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={16} />
                    </div>
                    {/* Visual Calendar Grid Hint (Decorative) */}
                    <div className="mt-4 flex justify-between px-2 text-[10px] text-gray-600 font-mono">
                      <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="p-6 rounded-3xl border border-white/5 bg-[#1A1A23]/40 backdrop-blur-md hover:border-white/10 transition-all">
                    <label className="block text-sm font-medium text-gray-400 mb-4">Payment Method</label>
                    <div className="space-y-2">
                      <div className="relative">
                        <button 
                          className="w-full p-4 pl-12 pr-10 rounded-xl bg-black/20 border border-white/5 text-left text-white flex items-center justify-between group hover:border-purple-500/30 transition-all"
                        >
                          <span className="flex items-center gap-2">
                             {/* Dynamic Icon based on selection would go here */}
                             {PAYMENT_METHODS.find(p => p.id === formData.paymentMethod)?.name || 'Select Method'}
                          </span>
                          <Settings className="text-gray-600 group-hover:text-white transition-colors" size={16} />
                        </button>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-purple-500/20 rounded-lg text-purple-400">
                           <CreditCard size={14} />
                        </div>
                      </div>
                      
                      {/* Dropdown Options (Simulated as list for now) */}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {PAYMENT_METHODS.map(pm => (
                          <button
                            key={pm.id}
                            onClick={() => handlePaymentSelect(pm.id)}
                            className={`
                              flex items-center gap-2 p-2 rounded-lg text-xs font-medium transition-all
                              ${formData.paymentMethod === pm.id 
                                ? 'bg-white/10 text-white border border-white/10' 
                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}
                            `}
                          >
                            <pm.icon size={12} />
                            {pm.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Notes Section */}
                <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                  <div className="p-1 rounded-2xl bg-gradient-to-r from-white/5 to-transparent">
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      placeholder="Add a note (optional)..."
                      rows={3}
                      className="w-full p-4 rounded-xl bg-[#1A1A23]/60 border border-white/5 text-white placeholder-gray-600 focus:outline-none focus:border-white/20 resize-none transition-all"
                    />
                  </div>
                </div>

                {/* 5. Submit Action */}
                <div className="pt-4 animate-slide-up" style={{ animationDelay: '0.5s' }}>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`
                      relative w-full py-4 rounded-2xl font-bold text-lg tracking-wide overflow-hidden group transition-all duration-300
                      ${isSubmitting ? 'cursor-not-allowed opacity-90' : 'hover:shadow-[0_0_40px_rgba(219,39,119,0.3)] hover:scale-[1.01]'}
                    `}
                  >
                    {/* Button Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 animate-gradient-x" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                    
                    {/* Content */}
                    <div className="relative flex items-center justify-center gap-2 text-white">
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Adding...</span>
                        </>
                      ) : showSuccess ? (
                        <>
                          <CheckCircle2 size={24} className="animate-bounce" />
                          <span>Added Successfully!</span>
                        </>
                      ) : (
                        <>
                          <Plus size={24} />
                          <span>Add Expense</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>

              </div>

              {/* RIGHT COLUMN: PREDICTIONS & QUICK ADDS */}
              <div className="xl:col-span-1 space-y-6">
                
                {/* AI Suggestion Card */}
                <div className="p-6 rounded-3xl bg-gradient-to-b from-purple-900/20 to-transparent border border-white/5 relative overflow-hidden animate-fade-in-right delay-200">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                      <Zap size={20} className="text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Smart Suggestions</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        Based on your spending on <span className="text-white font-medium">Wednesdays</span>, you might want to add these:
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Add List */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider pl-2">Quick Add</h3>
                  {QUICK_ADDS.map((qa, index) => (
                    <div 
                      key={qa.id}
                      onClick={() => handleQuickAdd(qa)}
                      className="group p-4 rounded-2xl bg-[#1A1A23]/40 border border-white/5 hover:border-purple-500/30 hover:bg-[#1A1A23]/80 cursor-pointer transition-all duration-300 animate-fade-in-right"
                      style={{ animationDelay: `${0.2 + (index * 0.1)}s` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300">
                             <qa.icon size={20} className="text-gray-400 group-hover:text-purple-400 transition-colors" />
                          </div>
                          <div>
                            <h4 className="font-medium text-white group-hover:text-purple-200 transition-colors">{qa.name}</h4>
                            <p className="text-xs text-gray-500">Regular • {qa.category === 'cat_1' ? 'Food' : qa.category === 'cat_3' ? 'Transport' : 'Entertainment'}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-white">${qa.amount}</span>
                          <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center mt-1 group-hover:bg-purple-500 group-hover:text-white transition-all">
                             <Plus size={12} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Custom 'Other' Option */}
                  <div className="p-4 rounded-2xl border border-dashed border-white/10 hover:border-white/30 hover:bg-white/5 cursor-pointer transition-all flex items-center justify-center gap-2 text-gray-500 hover:text-white">
                    <Plus size={16} />
                    <span className="text-sm font-medium">Create Custom Preset</span>
                  </div>
                </div>

                {/* Monthly Limit Mini-Chart */}
                <div className="p-6 rounded-3xl bg-[#1A1A23]/40 border border-white/5 mt-8 animate-fade-in-right delay-500">
                  <div className="flex justify-between items-end mb-4">
                     <div>
                        <p className="text-xs text-gray-400 mb-1">Monthly Budget</p>
                        <h3 className="text-xl font-bold text-white">65% Used</h3>
                     </div>
                     <div className="text-right">
                        <p className="text-xs text-purple-400 font-mono">$1,240 / $2,000</p>
                     </div>
                  </div>
                  <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden">
                     <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600 w-[65%] rounded-full shadow-[0_0_10px_rgba(219,39,119,0.5)]" />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-3 text-center">You are on track to save $760 this month</p>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>

      {/* --- CUSTOM ANIMATION STYLES --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700&family=Inter:wght@400;500;600&display=swap');
        
        body {
          font-family: 'Work Sans', sans-serif;
        }

        .animate-pulse-slow {
          animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
          opacity: 0; /* Start hidden */
        }
        
        .animate-fade-in-right {
          animation: fade-in-right 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        
        .animate-bounce-short {
          animation: bounce-short 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}