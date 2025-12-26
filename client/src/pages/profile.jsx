import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * =================================================================================================
 * API CONFIGURATION
 * =================================================================================================
 */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * =================================================================================================
 * COMPONENT: TILT CARD (3D INTERACTION ENGINE)
 * ------------------------------------------------------------------------------------------------
 * This component handles the 3D physics calculations for the tilt effect.
 * It tracks mouse movement relative to the card's center and applies a CSS transform.
 * It also generates a dynamic "glare" effect based on the cursor position.
 * =================================================================================================
 */
const TiltCard = ({ children, className = "", intensity = 15 }) => {
  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation based on cursor distance from center
    const rotateX = ((y - centerY) / centerY) * -intensity; // Invert Y for natural tilt
    const rotateY = ((x - centerX) / centerX) * intensity;

    setRotate({ x: rotateX, y: rotateY });
    setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 1 });
  };

  const handleMouseLeave = () => {
    // Reset to neutral position on leave
    setRotate({ x: 0, y: 0 });
    setGlare(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative transition-transform duration-200 ease-out preserve-3d ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
      }}
    >
      {/* Holographic Glare Layer */}
      <div 
        className="absolute inset-0 pointer-events-none z-50 rounded-[inherit] mix-blend-overlay transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 80%)`,
          opacity: glare.opacity
        }}
      />
      {children}
    </div>
  );
};

/**
 * =================================================================================================
 * MAIN PAGE: PROFILE SETTINGS
 * =================================================================================================
 */
export default function Profile() {
  const navigate = useNavigate();
  
  // --- GLOBAL STATE MANAGEMENT ---
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [pageReady, setPageReady] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToast, setShowToast] = useState({ visible: false, message: '', type: 'success' });
  const [apiError, setApiError] = useState(null);
  
  // --- MOCK DATABASE: USER PROFILE ---
  // Will be replaced with data from backend
  const [user, setUser] = useState({
    _id: '',
    fullName: 'Loading...',
    email: 'Loading...',
    username: '',
    bio: '',
    avatar: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Default',
    avatarVibe: 'creative', 
    accountCreated: new Date(),
    daysActive: 0,
    accountStatus: 'Verified',
    theme: 'dark',
    notifications: { email: true, push: false, monthlyReport: true },
    securityHealth: 92,
  });

  // --- MOCK DATABASE: AUDIT LOG ---
  // Tracks security events for the user
  const [auditLog, setAuditLog] = useState([
    { 
      id: 1, 
      action: 'Security Checkup', 
      date: 'Yesterday', 
      icon: 'fa-shield-halved', 
      color: 'green' 
    },
    { 
      id: 2, 
      action: 'Password Changed', 
      date: '3 days ago', 
      icon: 'fa-key', 
      color: 'orange' 
    }
  ]);

  // --- FORM STATES ---
  const [formData, setFormData] = useState({ ...user });
  
  // Password Management State
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: '', color: 'gray' });
  const [matchStatus, setMatchStatus] = useState({ isMatch: true, message: '' });

  // UI States
  const [bioTone, setBioTone] = useState('Neutral');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // --- AVATAR STUDIO STATE ---
  const [pendingAvatar, setPendingAvatar] = useState('');
  const [pendingVibe, setPendingVibe] = useState('');
  const [avatarTab, setAvatarTab] = useState('masculine');

  // --- CURATED AVATAR DATASETS ---
  const avatarCollections = {
    masculine: [
      "https://api.dicebear.com/9.x/adventurer/svg?seed=Destiny",
      'https://api.dicebear.com/9.x/adventurer/svg?seed=Mason',
      'https://api.dicebear.com/9.x/micah/svg?seed=Oliver',
      'https://api.dicebear.com/9.x/micah/svg?seed=Adrian',
      'https://api.dicebear.com/9.x/dylan/svg?seed=Jude',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack'
    ],
    feminine: [
      'https://api.dicebear.com/9.x/adventurer/svg?seed=Riley',
      'https://api.dicebear.com/9.x/adventurer/svg?seed=Aidan',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Kylie',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Liliana',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoey',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Emery',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella'
    ],
    neutral: [
      'https://api.dicebear.com/7.x/bottts/svg?seed=Willow',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Oliver',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Leo',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Gizmo',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Sasha',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Coco',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Max',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Toby'
    ]
  };

  // Vibe Configurations
  const vibes = [
    { id: 'calm', label: 'Calm', color: 'bg-teal-500', gradient: 'from-teal-400 to-emerald-600', shadow: 'shadow-teal-500/50', border: 'border-teal-500/30' },
    { id: 'creative', label: 'Creative', color: 'bg-purple-500', gradient: 'from-purple-400 to-pink-600', shadow: 'shadow-purple-500/50', border: 'border-purple-500/30' },
    { id: 'professional', label: 'Professional', color: 'bg-blue-600', gradient: 'from-blue-500 to-indigo-700', shadow: 'shadow-blue-600/50', border: 'border-blue-600/30' },
    { id: 'energetic', label: 'Energetic', color: 'bg-orange-500', gradient: 'from-orange-400 to-red-600', shadow: 'shadow-orange-500/50', border: 'border-orange-500/30' },
  ];

  // --- INITIALIZATION ---
  useEffect(() => { 
    // Fetch user profile from backend
    const fetchProfile = async () => {
      try {
        setInitialLoading(true);
        const userId = localStorage.getItem('finora_user_id');
        
        if (!userId) {
          setApiError('User ID not found. Please login again.');
          setInitialLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/api/profile?userId=${encodeURIComponent(userId)}`);
        const data = await res.json();

        if (data.success && data.user) {
          setUser(data.user);
          setFormData(data.user);
          setApiError(null);
        } else {
          setApiError(data.error || 'Failed to load profile');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setApiError('Failed to load profile. Please try again.');
      } finally {
        setInitialLoading(false);
        setTimeout(() => setPageReady(true), 500);
      }
    };

    fetchProfile();
  }, []);

  // --- LOGIC: Profile Completion Calculation ---
  const calculateCompletion = () => {
    const fields = ['fullName', 'email', 'username', 'bio', 'avatar'];
    const filled = fields.filter(f => user[f] && user[f].length > 0).length;
    return Math.round((filled / fields.length) * 100);
  };
  const completion = calculateCompletion();

  // --- LOGIC: "AI" Bio Tone Analysis ---
  useEffect(() => {
    const text = formData.bio.toLowerCase();
    if (text.length === 0) setBioTone('Neutral');
    else if (text.includes('!') || text.includes('love') || text.includes('fun') || text.includes('happy')) setBioTone('Energetic ⚡');
    else if (text.includes('manage') || text.includes('business') || text.includes('finance') || text.includes('goal')) setBioTone('Professional 💼');
    else if (text.includes('help') || text.includes('chat') || text.includes('hello') || text.includes('friend')) setBioTone('Friendly 😊');
    else setBioTone('Casual 🙂');
  }, [formData.bio]);

  // --- LOGIC: Sarcastic Password Strength Engine ---
  useEffect(() => {
    const pass = passwordForm.new;
    
    // Evaluate Strength
    let score = 0;
    if (pass.length > 0) score++;
    if (pass.length > 5) score++;
    if (pass.length > 8 && /[A-Z]/.test(pass)) score++;
    if (pass.length > 10 && /[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score++;

    // Sarcastic Responses
    const responses = [
      { msg: "Type something, genius.", color: 'gray' },
      { msg: "My cat types better passwords.", color: 'red' }, // Weak
      { msg: "Mediocre. A toddler could crack this.", color: 'yellow' }, // Fair
      { msg: "Getting there... but I'm yawning.", color: 'blue' }, // Good
      { msg: "Now THAT is a fortress. God-tier.", color: 'green' } // Strong
    ];

    setPasswordStrength({ 
        score, 
        message: responses[score].msg, 
        color: responses[score].color 
    });

    // Check Match Sarcasm
    if (passwordForm.confirm.length > 0) {
        if (passwordForm.new !== passwordForm.confirm) {
            setMatchStatus({ 
                isMatch: false, 
                message: "Do you have short-term memory loss? They don't match." 
            });
        } else {
            setMatchStatus({ 
                isMatch: true, 
                message: "Finally, you typed it correctly. Miracles exist." 
            });
        }
    } else {
        setMatchStatus({ isMatch: true, message: '' });
    }

  }, [passwordForm.new, passwordForm.confirm]);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Open Modal and Initialize Temp State
  const openAvatarModal = () => {
    setPendingAvatar(user.avatar);
    setPendingVibe(user.avatarVibe);
    setShowAvatarModal(true);
  };

  // Confirm Avatar Changes (Gamified Save)
  const saveAvatarChanges = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('finora_user_id');
      
      const res = await fetch(`${API_BASE}/api/profile/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          avatar: pendingAvatar,
          avatarVibe: pendingVibe
        })
      });

      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        setFormData(data.user);
        addToLog('Identity Updated');
        setShowAvatarModal(false);
        showToastMsg('Your new identity is live!', 'success');
      } else {
        showToastMsg(data.error || 'Failed to update avatar', 'error');
      }
    } catch (err) {
      console.error('Error saving avatar:', err);
      showToastMsg('Failed to update avatar. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRandomizeAvatar = () => {
    const categories = ['masculine', 'feminine', 'neutral'];
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const randomUrl = avatarCollections[cat][Math.floor(Math.random() * 8)];
    const randomVibe = vibes[Math.floor(Math.random() * vibes.length)].id;
    setPendingAvatar(randomUrl);
    setPendingVibe(randomVibe);
    setAvatarTab(cat);
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('finora_user_id');
      
      const res = await fetch(`${API_BASE}/api/profile/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          fullName: formData.fullName,
          username: formData.username,
          bio: formData.bio,
          avatar: formData.avatar,
          avatarVibe: formData.avatarVibe,
          theme: formData.theme,
          notifications: formData.notifications,
          privacy: formData.privacy
        })
      });

      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        addToLog('Profile Details Updated');
        showToastMsg('Profile saved successfully.', 'success');
      } else {
        showToastMsg(data.error || 'Failed to save profile', 'error');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      showToastMsg('Failed to save profile. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.new !== passwordForm.confirm) return showToastMsg("Passwords don't match", "error");
    if (passwordForm.new.length < 8) return showToastMsg("Password too short", "error");
    
    setLoading(true);
    try {
      const userId = localStorage.getItem('finora_user_id');
      
      const res = await fetch(`${API_BASE}/api/profile/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          currentPassword: passwordForm.current,
          newPassword: passwordForm.new
        })
      });

      const data = await res.json();

      if (data.success) {
        setPasswordForm({ current: '', new: '', confirm: '' });
        addToLog('Security Credentials Updated');
        showToastMsg('Password changed securely.', 'success');
      } else {
        showToastMsg(data.error || 'Failed to change password', 'error');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      showToastMsg('Failed to change password. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addToLog = (action) => {
    const newLog = { 
        id: Date.now(), 
        action, 
        date: 'Just now', 
        icon: 'fa-pen-to-square',
        color: 'blue'
    };
    // Keep only last 2 entries
    setAuditLog(prev => [newLog, ...prev].slice(0, 2));
  };

  const showToastMsg = (msg, type) => {
    setShowToast({ visible: true, message: msg, type });
    setTimeout(() => setShowToast({ ...showToast, visible: false }), 4000);
  };

  // --- THEME HELPERS ---
  const getVibeStyle = (vibeId) => vibes.find(v => v.id === vibeId) || vibes[0];
  const activeVibeStyle = getVibeStyle(user.avatarVibe);
  const pendingVibeStyle = getVibeStyle(pendingVibe);

  // --- STYLES (Advanced CSS-in-JS Engine) ---
  const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    
    :root {
      --glass-border: rgba(255, 255, 255, 0.08);
      --glass-bg: rgba(20, 20, 25, 0.7);
      --glass-highlight: rgba(255, 255, 255, 0.03);
    }

    body { font-family: 'Inter', sans-serif; background-color: #050507; color: white; overflow-x: hidden; }
    h1, h2, h3, h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    
    /* 3D Space */
    .perspective-container { perspective: 2000px; }
    .preserve-3d { transform-style: preserve-3d; }
    
    /* Advanced Glassmorphism */
    .glass-panel { 
        background: var(--glass-bg); 
        backdrop-filter: blur(40px); 
        border: 1px solid var(--glass-border); 
        box-shadow: 0 20px 50px -10px rgba(0,0,0,0.5);
    }
    
    .glass-modal { 
        background: rgba(15, 15, 20, 0.95); 
        backdrop-filter: blur(50px); 
        border: 1px solid rgba(255, 255, 255, 0.1); 
        box-shadow: 0 0 100px rgba(0,0,0,0.8);
    }

    /* Inputs */
    .glass-input { 
        background: rgba(0,0,0,0.4); 
        border: 1px solid rgba(255,255,255,0.08); 
        color: white; 
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
    }
    .glass-input:focus { 
        border-color: #7c3aed; 
        background: rgba(0,0,0,0.6); 
        outline: none; 
        box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
        transform: translateY(-1px);
    }
    .glass-input:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Completion Ring Animation */
    .completion-ring circle { 
        transition: stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1); 
        filter: drop-shadow(0 0 4px #10b981);
    }

    /* Animations */
    .animate-pop { animation: pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; opacity: 0; }
    @keyframes pop { 0% { transform: scale(0.9) translateY(20px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
    
    .animate-float { animation: float 6s ease-in-out infinite; }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

    /* Avatar Grid */
    .avatar-option { 
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
        border: 2px solid transparent; 
        position: relative;
        overflow: hidden;
    }
    .avatar-option:hover { transform: translateY(-4px) scale(1.05); z-index: 10; }
    .avatar-option.selected { 
        border-color: white; 
        background: rgba(255,255,255,0.1); 
        transform: scale(1.05); 
        box-shadow: 0 0 20px rgba(255,255,255,0.2);
    }
    
    /* Vibe Buttons */
    .vibe-btn { position: relative; overflow: hidden; }
    .vibe-btn::after {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
        transform: translateX(-100%);
        transition: transform 0.6s;
    }
    .vibe-btn:hover::after { transform: translateX(100%); }

    /* Custom Checkbox */
    .toggle-checkbox:checked { right: 0; border-color: #10b981; }
    .toggle-checkbox:checked + .toggle-label { background-color: #10b981; }
    
    /* Background Ambience */
    .bg-blob { position: fixed; border-radius: 50%; filter: blur(120px); opacity: 0.15; z-index: -1; pointer-events: none; }
    .blob-1 { animation: drift 20s infinite alternate; }
    .blob-2 { animation: drift 25s infinite alternate-reverse; }
    @keyframes drift { from { transform: translate(0,0); } to { transform: translate(30px, -30px); } }

    /* Dynamic Password Bars */
    .strength-bar { transition: width 0.5s ease-out, background-color 0.5s ease-out; }

    .custom-scroll::-webkit-scrollbar { width: 6px; }
    .custom-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
    .custom-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; border: 2px solid rgba(0,0,0,0); background-clip: content-box; }
    .custom-scroll::-webkit-scrollbar-thumb:hover { background-color: #555; }
  `;

  return (
    <div className="flex h-screen w-screen antialiased text-white bg-[#050507] perspective-container overflow-hidden">
      <style>{customStyles}</style>
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="bg-blob blob-1 top-[-10%] left-[-10%] w-[800px] h-[800px] bg-purple-900/20 mix-blend-screen"></div>
         <div className="bg-blob blob-2 bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-900/20 mix-blend-screen"></div>
         <div className="bg-blob top-[40%] left-[30%] w-[400px] h-[400px] bg-pink-900/10 mix-blend-screen animate-pulse"></div>
      </div>

      {/* --- SIDEBAR --- */}
      <aside className="w-72 flex-shrink-0 hidden lg:flex flex-col justify-between p-6 border-r border-white/5 bg-[#08080a]/80 backdrop-blur-xl z-20">
        <div>
          <div className="flex items-center gap-3 mb-12 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_rgba(124,58,237,0.3)]">
              <i className="fa-solid fa-bolt"></i>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white font-display">Finora</span>
          </div>
          <nav className="space-y-2">
            <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
                <i className="fa-solid fa-grid-2 w-5 text-center group-hover:text-purple-400 transition-colors"></i> 
                <span className="font-medium">Dashboard</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/5 text-white font-medium border-l-4 border-purple-500 shadow-[0_0_30px_rgba(124,58,237,0.1)]">
                <i className="fa-solid fa-user w-5 text-center text-purple-400"></i> 
                <span>Profile</span>
            </button>
          </nav>
        </div>
        <div className="px-2">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-white/10">
                <p className="text-xs text-gray-400 mb-2">Logged in as</p>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-[1px]">
                        <img src={user.avatar} className="w-full h-full rounded-full object-cover bg-black" />
                    </div>
                    <p className="text-sm font-bold text-white truncate w-24">{user.username}</p>
                </div>
            </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
        
        {/* Header */}
        <header className="flex-shrink-0 px-8 py-5 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
             <button onClick={() => navigate('/dashboard')} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all border border-white/5 hover:border-white/10 hover:scale-105 active:scale-95">
                <i className="fa-solid fa-arrow-left"></i>
             </button>
             <div>
                 <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Manage Profile</h1>
                 <p className="text-xs text-gray-500">Personalize your Finora experience</p>
             </div>
          </div>
        </header>

        {apiError && (
          <div className="px-8 py-4 bg-red-500/10 border border-red-500/30 rounded-lg mx-4 mt-4">
            <p className="text-red-400 text-sm font-medium">{apiError}</p>
          </div>
        )}

        {initialLoading ? (
          <main className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading your profile...</p>
            </div>
          </main>
        ) : (
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scroll relative">
            <div className="max-w-6xl mx-auto space-y-8 pb-20">
                
                {/* 1. IDENTITY HUB (Hero Section with 3D Tilt) */}
                <TiltCard className={`glass-panel p-8 md:p-10 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-10 overflow-hidden relative group ${pageReady ? 'animate-pop' : 'opacity-0'}`}>
                    
                    {/* Background Vibe Effect */}
                    <div className={`absolute top-0 right-0 w-full h-full opacity-20 bg-gradient-to-br ${activeVibeStyle.gradient} blur-3xl pointer-events-none transition-all duration-1000`}></div>
                    
                    {/* Interactive Avatar */}
                    <div className="relative group/avatar cursor-pointer z-10" onClick={openAvatarModal}>
                        {/* Glow Ring */}
                        <div className={`absolute -inset-1 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-all duration-500 blur-md ${activeVibeStyle.color}`}></div>
                        
                        <div className="relative w-40 h-40 rounded-full p-1.5 bg-[#121215] shadow-2xl border border-white/10 group-hover/avatar:scale-105 transition-transform duration-300">
                            <div className={`w-full h-full rounded-full overflow-hidden bg-gradient-to-br ${activeVibeStyle.gradient} p-[2px]`}>
                                <div className="w-full h-full bg-[#1a1a1a] rounded-full relative overflow-hidden">
                                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                                </div>
                            </div>
                            
                            {/* Completion Ring Overlay */}
                            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none completion-ring z-20" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                                <circle cx="50" cy="50" r="46" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="289" strokeDashoffset={289 - (289 * completion / 100)} strokeLinecap="round" />
                            </svg>
                        </div>
                        
                        {/* Edit Badge */}
                        <div className="absolute bottom-1 right-1 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center border-4 border-[#121215] shadow-lg group-hover/avatar:rotate-12 transition-transform z-30">
                            <i className="fa-solid fa-wand-magic-sparkles text-sm"></i>
                        </div>
                    </div>
                    
                    {/* User Info & Stats */}
                    <div className="text-center md:text-left flex-1 space-y-4 z-10">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">{user.fullName}</h2>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400 text-sm">
                                <i className="fa-solid fa-envelope opacity-50"></i> {user.email} 
                                <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20 uppercase tracking-wider">Verified</span>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                            <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3 hover:bg-white/10 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs shadow-lg"><i className="fa-solid fa-calendar-day"></i></div>
                                <div className="text-left">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Journey</p>
                                    <p className="text-sm font-bold text-white">{user.daysActive} Days</p>
                                </div>
                            </div>
                            
                            <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3 hover:bg-white/10 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs shadow-lg"><i className="fa-solid fa-chart-pie"></i></div>
                                <div className="text-left">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Status</p>
                                    <p className="text-sm font-bold text-white">{completion}% Complete</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="hidden md:flex group relative px-6 py-3 rounded-2xl bg-white text-black font-bold overflow-hidden hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)]" onClick={openAvatarModal}>
                        <span className="relative z-10 flex items-center gap-2">Customize <i className="fa-solid fa-palette"></i></span>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-300 via-pink-300 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                </TiltCard>

                {/* 2. MAIN CONTENT GRID */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    
                    {/* --- LEFT COLUMN: PROFILE DETAILS (2/3 Width) --- */}
                    <div className="xl:col-span-2 space-y-6">
                        
                        {/* Profile Details Card */}
                        <div className="glass-panel p-8 rounded-[2rem]">
                            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><i className="fa-regular fa-id-card"></i></div>
                                    <h3 className="text-lg font-bold text-white">Public Profile</h3>
                                </div>
                                <div className={`text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono transition-all flex items-center gap-2 ${bioTone.includes('Professional') ? 'text-blue-400 border-blue-500/30' : 'text-purple-400 border-purple-500/30'}`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                                    AI Tone: {bioTone}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                                    <div className="relative group">
                                        <i className="fa-regular fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors"></i>
                                        <input name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full glass-input rounded-2xl py-3.5 pl-10 pr-4 text-sm font-medium" />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Username</label>
                                    <div className="relative group">
                                        <i className="fa-solid fa-at absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors"></i>
                                        <input name="username" value={formData.username} onChange={handleInputChange} className="w-full glass-input rounded-2xl py-3.5 pl-10 pr-4 text-sm font-medium" />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email</label>
                                    <div className="relative">
                                        <i className="fa-regular fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
                                        <input value={formData.email} disabled className="w-full glass-input rounded-2xl py-3.5 pl-10 pr-10 text-sm font-medium opacity-60 cursor-not-allowed bg-black/20" />
                                        <i className="fa-solid fa-lock absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-xs"></i>
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Bio / About</label>
                                    <textarea name="bio" rows="3" value={formData.bio} onChange={handleInputChange} className="w-full glass-input rounded-2xl p-4 text-sm font-medium resize-none leading-relaxed" maxLength="200" placeholder="Tell the world who you are..." />
                                    <div className="flex justify-end">
                                        <span className={`text-[10px] font-bold ${formData.bio.length > 180 ? 'text-red-400' : 'text-gray-600'}`}>{formData.bio.length}/200</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button 
                                    onClick={handleSaveChanges} 
                                    disabled={loading} 
                                    className="px-8 py-3.5 rounded-xl bg-white text-black font-bold shadow-lg hover:shadow-white/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <><i className="fa-solid fa-check"></i> Save Changes</>}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN: SECURITY (1/3 Width) --- */}
                    <div className="space-y-6">
                        
                        {/* Sarcastic Security Health Dashboard */}
                        <TiltCard className="glass-panel p-6 rounded-3xl border-t-4 border-emerald-500 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none"><i className="fa-solid fa-shield-cat text-8xl text-white"></i></div>
                            
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Security</h3>
                                    <p className="text-xs text-gray-400 mt-1">Status: <span className="text-emerald-400 font-bold">Excellent</span></p>
                                </div>
                                <div className="text-right">
                                    <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 flex items-center justify-center relative">
                                        <span className="text-sm font-bold text-white">{user.securityHealth}</span>
                                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                                            <path className="text-emerald-500" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/5 relative z-10">
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Update Password</h4>
                                <div className="space-y-4">
                                    <input type="password" placeholder="Current Password" value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current:e.target.value})} className="w-full glass-input rounded-xl p-3 text-xs placeholder:text-gray-600" />
                                    
                                    {/* New Password & Sarcasm */}
                                    <div>
                                        <input type="password" placeholder="New Password" value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new:e.target.value})} className="w-full glass-input rounded-xl p-3 text-xs placeholder:text-gray-600" />
                                        {passwordForm.new && (
                                            <div className="mt-1">
                                                <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                                                    <div className={`h-full strength-bar bg-${passwordStrength.color}-500`} style={{ width: `${(passwordStrength.score / 4) * 100}%` }}></div>
                                                </div>
                                                <p className={`text-[10px] mt-1 font-bold italic text-${passwordStrength.color}-400`}>
                                                    {passwordStrength.message}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm Password & Mockery */}
                                    <div>
                                        <input type="password" placeholder="Confirm" value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm:e.target.value})} className="w-full glass-input rounded-xl p-3 text-xs placeholder:text-gray-600" />
                                        {passwordForm.confirm && (
                                            <p className={`text-[10px] mt-1 font-bold italic ${matchStatus.isMatch ? 'text-green-400' : 'text-red-400'}`}>
                                                {matchStatus.message}
                                            </p>
                                        )}
                                    </div>

                                    <button onClick={handlePasswordChange} disabled={!passwordForm.current} className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-bold text-xs border border-white/10 transition-all hover:border-white/20">
                                        Change Password
                                    </button>
                                </div>
                            </div>
                        </TiltCard>

                        {/* Recent Changes (Limited to 2) */}
                        <div className="glass-panel p-6 rounded-3xl">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Latest Activity</h3>
                            <div className="space-y-4">
                                {auditLog.map((log) => (
                                    <div key={log.id} className="flex items-start gap-3 relative pl-4 border-l-2 border-white/5">
                                        <div className={`absolute -left-[5px] top-0 w-2 h-2 rounded-full ${log.id === 1 ? 'bg-blue-500' : 'bg-gray-600'} ring-4 ring-[#0F0F11]`}></div>
                                        <div>
                                            <p className="text-xs font-bold text-white">{log.action}</p>
                                            <p className="text-[10px] text-gray-500">{log.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="p-5 rounded-3xl border border-red-500/10 bg-red-500/5 group hover:bg-red-500/10 transition-colors cursor-pointer" onClick={() => setShowDeleteModal(true)}>
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-sm font-bold text-red-500">Delete Account</h3>
                                <i className="fa-solid fa-chevron-right text-red-500/50 text-xs group-hover:translate-x-1 transition-transform"></i>
                            </div>
                            <p className="text-[10px] text-gray-500 group-hover:text-red-400/70 transition-colors">
                                Irreversible action. Be careful.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </main>
        )}
      </div>

      {/* --- AVATAR MODAL (Game-like Studio) --- */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowAvatarModal(false)}></div>
            <div className="relative w-full max-w-4xl h-[80vh] glass-modal rounded-[2rem] shadow-2xl overflow-hidden animate-pop flex flex-col md:flex-row">
                
                {/* LEFT: PREVIEW STAGE */}
                <div className="w-full md:w-1/3 bg-[#0a0a0c] border-r border-white/5 relative flex flex-col items-center justify-center p-8 overflow-hidden">
                    {/* Dynamic Background */}
                    <div className={`absolute inset-0 transition-all duration-700 opacity-30 bg-gradient-to-br ${pendingVibeStyle.gradient}`}></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                    
                    <div className="relative z-10 text-center">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">Preview</div>
                        
                        <div className="relative w-48 h-48 mx-auto mb-8 group">
                            <div className={`absolute -inset-4 rounded-full blur-2xl opacity-60 transition-all duration-500 animate-pulse ${pendingVibeStyle.color}`}></div>
                            <div className="w-full h-full rounded-full p-1 bg-[#1a1a1a] relative z-10 border-4 border-white/10 shadow-2xl">
                                <img src={pendingAvatar} className="w-full h-full rounded-full bg-[#151515] object-cover" />
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-2">{user.fullName}</h3>
                        <p className={`text-xs px-3 py-1 rounded-full border inline-block font-bold uppercase tracking-wide transition-all ${pendingVibeStyle.color.replace('bg-', 'text-').replace('500', '400')} border-white/10 bg-white/5`}>
                            {pendingVibeStyle.label} Vibe
                        </p>
                    </div>
                </div>

                {/* RIGHT: CONTROLS */}
                <div className="w-full md:w-2/3 bg-[#0F0F11] flex flex-col">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">Identity Studio</h3>
                        <button onClick={() => setShowAvatarModal(false)} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"><i className="fa-solid fa-xmark text-gray-400"></i></button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scroll p-6 space-y-8">
                        
                        {/* 1. Vibe Selector */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Atmosphere</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {vibes.map(v => (
                                    <button 
                                        key={v.id} 
                                        onClick={() => setPendingVibe(v.id)}
                                        className={`vibe-btn p-3 rounded-xl border transition-all relative overflow-hidden group ${pendingVibe === v.id ? 'border-white bg-white/10' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                                    >
                                        <div className={`w-3 h-3 rounded-full mb-2 ${v.color} shadow-lg shadow-${v.color}/50`}></div>
                                        <span className="text-xs font-bold text-white">{v.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Avatar Grid */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Avatar Style</label>
                                <div className="flex gap-2">
                                    {['masculine', 'feminine', 'neutral'].map(tab => (
                                        <button 
                                            key={tab} 
                                            onClick={() => setAvatarTab(tab)}
                                            className={`text-[10px] font-bold px-3 py-1 rounded-full capitalize transition-colors ${avatarTab === tab ? 'bg-white text-black' : 'text-gray-500 hover:text-white bg-white/5'}`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                <button 
                                    onClick={handleRandomizeAvatar}
                                    className="aspect-square rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center gap-2 hover:bg-white/5 text-gray-500 hover:text-white transition-colors group"
                                >
                                    <i className="fa-solid fa-dice text-lg group-hover:rotate-180 transition-transform duration-500"></i>
                                    <span className="text-[9px] font-bold">Random</span>
                                </button>
                                {avatarCollections[avatarTab].map((url, i) => (
                                    <div 
                                        key={i} 
                                        onClick={() => setPendingAvatar(url)} 
                                        className={`avatar-option w-full aspect-square rounded-xl p-1 cursor-pointer bg-[#151518] relative ${pendingAvatar === url ? 'selected ring-2 ring-white ring-offset-2 ring-offset-[#0F0F11]' : 'opacity-70 hover:opacity-100'}`}
                                    >
                                        <img src={url} alt="Avatar option" className="w-full h-full rounded-lg" />
                                        {pendingAvatar === url && (
                                            <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#151518] flex items-center justify-center">
                                                <i className="fa-solid fa-check text-[8px] text-white"></i>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-white/10 bg-[#0a0a0c] flex justify-between items-center">
                        <button onClick={handleRandomizeAvatar} className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-2">
                            <i className="fa-solid fa-shuffle"></i> Surprise Me
                        </button>
                        <div className="flex gap-3">
                            <button onClick={() => setShowAvatarModal(false)} className="px-6 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Discard</button>
                            <button onClick={saveAvatarChanges} disabled={loading} className="px-8 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-gray-200 transition-colors shadow-lg shadow-white/10 flex items-center gap-2">
                                {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <span>Save Identity</span>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* --- DELETE CONFIRM MODAL --- */}
      {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowDeleteModal(false)}></div>
              <div className="relative w-full max-w-md bg-[#1a1a1a] border border-red-500/30 rounded-3xl p-8 shadow-2xl animate-pop text-center">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                      <i className="fa-solid fa-triangle-exclamation text-2xl text-red-500"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Delete Account?</h2>
                  <p className="text-sm text-gray-400 mb-6">Type <strong className="text-white">DELETE</strong> to confirm.</p>
                  <input value={deleteConfirmation} onChange={e => setDeleteConfirmation(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-center text-white font-bold mb-4 focus:border-red-500 focus:outline-none" placeholder="DELETE" />
                  
                  <div className="flex gap-3">
                      <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-bold text-xs">Cancel</button>
                      <button disabled={deleteConfirmation !== 'DELETE'} className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs disabled:opacity-50">Confirm</button>
                  </div>
              </div>
          </div>
      )}

      {/* --- TOAST --- */}
      {showToast.visible && (
        <div className={`fixed bottom-10 right-10 px-6 py-3 rounded-xl shadow-2xl font-bold flex items-center gap-3 animate-pop z-50 ${showToast.type === 'error' ? 'bg-red-500 text-white' : 'bg-white text-black'}`}>
            <i className={`fa-solid ${showToast.type === 'error' ? 'fa-circle-xmark' : 'fa-circle-check'}`}></i>
            <span>{showToast.message}</span>
        </div>
      )}

    </div>
  );
}