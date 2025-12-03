import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();
  
  // State for form fields
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirm: ''
  });

  // State for UI toggles
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Submission
  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirm) {
      alert('Passwords do not match!');
      return;
    }

    // Demo/Dummy Logic (Preserved from your original JSX)
    const isDummy = formData.email === 'demo@finora.com' && formData.password === 'demo123';
    if (isDummy) {
      navigate('/dashboard');
      return;
    }

    setLoading(true);
    
    try {
      const r = await fetch('http://localhost:5000/api/auth/signup', { // Updated to likely backend port
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fullname: formData.fullname, 
          email: formData.email, 
          password: formData.password 
        })
      });
      
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error || 'Signup failed');
      
      // Success
      alert('Account created successfully!');
      navigate('/dashboard'); // or /login
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // CSS Styles from your HTML file
  const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    .font-inter { font-family: 'Inter', sans-serif; }

    .gradient-bg {
        background: linear-gradient(135deg, #e9d5ff 0%, #f3e8ff 50%, #ddd6fe 100%);
    }

    .gradient-purple {
        background: linear-gradient(135deg, #6b21a8 0%, #7c3aed 50%, #8b5cf6 100%);
    }

    .input-focus:focus {
        outline: none;
        border-color: #7c3aed;
        box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
    }

    /* Floating Animations */
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-float-delayed { animation: float 6s ease-in-out 2s infinite; }

    @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(5deg); }
    }

    .glass-effect {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
    }

    .password-toggle {
        cursor: pointer;
        transition: all 0.3s ease;
    }
    .password-toggle:hover { opacity: 0.7; }

    .btn-hover {
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }
    .btn-hover:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(107, 33, 168, 0.3);
    }
    .btn-hover:active { transform: translateY(0); }

    .link-hover {
        transition: all 0.3s ease;
        position: relative;
    }
    .link-hover::after {
        content: '';
        position: absolute;
        width: 0;
        height: 2px;
        bottom: -2px;
        left: 0;
        background-color: #7c3aed;
        transition: width 0.3s ease;
    }
    .link-hover:hover::after { width: 100%; }

    .decorative-shape {
        position: absolute;
        border-radius: 50%;
        filter: blur(60px);
        opacity: 0.3;
        z-index: 0;
    }

    .shape-1 { width: 300px; height: 300px; background: #a78bfa; top: -50px; right: -50px; }
    .shape-2 { width: 250px; height: 250px; background: #c084fc; bottom: -80px; left: -80px; }
    .shape-3 { width: 200px; height: 200px; background: #e9d5ff; top: 50%; right: 10%; }
  `;

  return (
    <div className="font-inter gradient-bg min-h-screen flex items-center justify-center p-4">
      <style>{customStyles}</style>
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="Finora Logo" className="w-10 h-10 object-contain rounded-md" />
              <span className="text-2xl font-bold text-gray-800">Finora</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-600 hover:text-gray-900 link-hover">HOME</Link>
              <Link to="/about" className="text-gray-600 hover:text-gray-900 link-hover">ABOUT US</Link>
              <Link to="/contact" className="text-gray-600 hover:text-gray-900 link-hover">CONTACT</Link>
              <Link to="/signup" className="font-semibold text-purple-700 border-b-2 border-purple-700">SIGN UP</Link>
            </div>

            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <div className="w-full max-w-6xl mx-auto mt-20">
        <div className="glass-effect rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            
            {/* Left Side: Form */}
            <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full">
                <h1 className="text-4xl md:text-5xl font-bold text-purple-950 mb-8">Sign up</h1>
                
                <form onSubmit={onSubmit} className="space-y-5">
                  
                  {/* Full Name */}
                  <div className="relative">
                    <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input 
                      type="text" 
                      id="fullname" 
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleChange}
                      placeholder="Daniel Gallego"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl input-focus transition-all bg-gray-50/50"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="hello@reallygreatsite.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl input-focus transition-all bg-gray-50/50"
                      required
                    />
                  </div>

                  {/* Password Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Password */}
                    <div className="relative">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                      <div className="relative">
                        <input 
                          type={showPwd ? 'text' : 'password'}
                          id="password" 
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="**********"
                          className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl input-focus transition-all bg-gray-50/50"
                          required
                        />
                        <span 
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 password-toggle" 
                          onClick={() => setShowPwd(!showPwd)}
                        >
                          {showPwd ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                      <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                      <div className="relative">
                        <input 
                          type={showConfirm ? 'text' : 'password'}
                          id="confirm" 
                          name="confirm"
                          value={formData.confirm}
                          onChange={handleChange}
                          placeholder="**********"
                          className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl input-focus transition-all bg-gray-50/50"
                          required
                        />
                        <span 
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 password-toggle" 
                          onClick={() => setShowConfirm(!showConfirm)}
                        >
                          {showConfirm ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-[#3f0d6e] hover:bg-[#2e0952] text-white font-medium py-3 rounded-full btn-hover shadow-lg mt-4 disabled:opacity-60"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>

                  <p className="text-center text-sm text-gray-600">
                    or <Link to="/login" className="text-gray-800 hover:text-purple-700 transition-colors font-bold ml-1">Log in</Link>
                  </p>
                  
                  {/* Preserved Demo Note */}
                  <p className="text-center text-xs text-gray-500 mt-2">Use demo@finora.com and demo123 to continue without signup.</p>
                </form>
              </div>
            </div>

            {/* Right Side: Decorative */}
            <div className="hidden md:block relative overflow-hidden gradient-purple p-12">
              <div className="decorative-shape shape-1 animate-float"></div>
              <div className="decorative-shape shape-2 animate-float-delayed"></div>
              <div className="decorative-shape shape-3 animate-float"></div>
              
              <div className="relative z-10 h-full flex flex-col justify-center items-center text-white text-center">
                <div className="mb-8">
                  <img src="/login2.png" alt="Finora Logo" className="w-32 h-32 object-contain rounded-full bg-white/10 p-4 border border-white/20" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Welcome to Finora</h2>
                <p className="text-lg text-purple-100 max-w-sm">
                  Your trusted platform for financial management and growth. Start your journey today.
                </p>
                <div className="mt-12 flex space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}