import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  
  // State management
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Development shortcut: accept `test` / `test` locally and navigate
    if (formData.username === 'test' && formData.password === 'test') {
      // set a mock token so other parts of the app can detect auth if needed
      localStorage.setItem('token', 'dev-token');
      setLoading(false);
      navigate('/dashboard');
      return;
    }

    try {
      // Replace with your actual Backend URL
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login Error:', err);
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Custom CSS styles injected directly into the component
  const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    .font-inter { font-family: 'Inter', sans-serif; }
    
    .gradient-bg {
      background: linear-gradient(135deg, #e9d5ff 0%, #f3e8ff 50%, #ddd6fe 100%);
    }

    .gradient-purple {
      background: linear-gradient(135deg, #6b21a8 0%, #7c3aed 50%, #8b5cf6 100%);
    }

    .glass-effect {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
    }

    .input-focus:focus {
      outline: none;
      border-color: #7c3aed;
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
    }

    /* Floating Animation */
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(5deg); }
    }
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-float-delayed { animation: float 6s ease-in-out 2s infinite; }

    /* Hover Effects */
    .btn-hover { transition: all 0.3s ease; }
    .btn-hover:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(107, 33, 168, 0.3);
    }
    .btn-hover:active { transform: translateY(0); }

    .link-hover { position: relative; transition: all 0.3s ease; }
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

    /* Decorative Shapes */
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

    /* Utilities */
    .input-group { transition: transform 0.3s ease; }
    .input-group:focus-within { transform: scale(1.02); }
    .checkbox-custom:checked { background-color: #7c3aed; border-color: #7c3aed; }
  `;

  return (
    <div className="font-inter gradient-bg min-h-screen flex items-center justify-center p-4">
      {/* Inject Styles Here */}
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
              <Link to="/login" className="font-semibold text-purple-700 border-b-2 border-purple-700">LOG IN</Link>
            </div>

            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden pt-4 pb-2 space-y-2">
              <Link to="/" className="block text-gray-600 py-2 hover:bg-purple-50 px-2 rounded">HOME</Link>
              <Link to="/about" className="block text-gray-600 py-2 hover:bg-purple-50 px-2 rounded">ABOUT US</Link>
              <Link to="/contact" className="block text-gray-600 py-2 hover:bg-purple-50 px-2 rounded">CONTACT</Link>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="w-full max-w-6xl mx-auto mt-20">
        <div className="glass-effect rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            
            {/* Left Side: Form */}
            <div className="p-8 md:p-12 lg:p-16">
              <div className="max-w-md mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">Log in</h1>
                <p className="text-gray-600 mb-8">Welcome back! Please enter your details.</p>

                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Username */}
                  <div className="relative input-group">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                      </span>
                      <input 
                        type="text" 
                        id="username" 
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Enter your username"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl input-focus transition-all bg-white"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="relative input-group">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                      </span>
                      <input 
                        type={showPassword ? "text" : "password"}
                        id="password" 
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl input-focus transition-all bg-white"
                        required
                      />
                      <span 
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:opacity-70 transition-opacity" 
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 checkbox-custom cursor-pointer" />
                      <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900">Remember Me</span>
                    </label>
                    <Link to="/forgot-password" class="text-sm text-purple-600 hover:text-purple-700 link-hover font-medium">Forgot Password?</Link>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full gradient-purple text-white font-semibold py-3 rounded-xl btn-hover shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Logging in...' : 'Log in'}
                  </button>

                  {/* Social Login Section */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">or continue with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {/* Google */}
                    <button type="button" className="flex items-center justify-center py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all hover:shadow-md">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </button>
                    {/* Facebook */}
                    <button type="button" className="flex items-center justify-center py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all hover:shadow-md">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                      </svg>
                    </button>
                    {/* Apple */}
                    <button type="button" className="flex items-center justify-center py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all hover:shadow-md">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </button>
                  </div>

                  <p className="text-center text-sm text-gray-600">
                    Don't have an account? 
                    <Link to="/signup" className="text-purple-600 hover:text-purple-700 font-semibold link-hover ml-1">Sign up</Link>
                  </p>
                </form>
              </div>
            </div>

            {/* Right Side: Decorative Image Section */}
            <div className="hidden md:block relative overflow-hidden gradient-purple p-12">
              <div className="decorative-shape shape-1 animate-float"></div>
              <div className="decorative-shape shape-2 animate-float-delayed"></div>
              <div className="decorative-shape shape-3 animate-float"></div>
              
              <div className="relative z-10 h-full flex flex-col justify-center items-center text-white text-center">
                <div className="mb-8">
                  <img src="/login2.png" alt="Hero" className="w-32 h-32 object-contain rounded-full bg-white/10 p-4 border border-white/20" />
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
};

export default Login;