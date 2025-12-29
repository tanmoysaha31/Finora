import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.username === 'test' && formData.password === 'test') {
      try { localStorage.setItem('token', 'dev-token'); } catch (_) {}
      setLoading(false);
      navigate('/dashboard');
      return;
    }

    try {
      const response = await fetch('https://finora-1mgm.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        try { localStorage.setItem('token', data.token); } catch (_) {}
        if (data?.id) {
          try { localStorage.setItem('finora_user_id', data.id) } catch (_) {}
        }
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    .font-inter { font-family: 'Inter', sans-serif; }
    .gradient-bg { background: linear-gradient(135deg, #e9d5ff 0%, #f3e8ff 50%, #ddd6fe 100%); }
    .gradient-purple { background: linear-gradient(135deg, #6b21a8 0%, #7c3aed 50%, #8b5cf6 100%); }
    .glass-effect { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); }
    .input-focus:focus { outline: none; border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1); }
    @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(5deg); } }
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-float-delayed { animation: float 6s ease-in-out 2s infinite; }
    .btn-hover { transition: all 0.3s ease; }
    .btn-hover:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(107, 33, 168, 0.3); }
    .btn-hover:active { transform: translateY(0); }
    .link-hover { position: relative; transition: all 0.3s ease; }
    .link-hover::after { content: ''; position: absolute; width: 0; height: 2px; bottom: -2px; left: 0; background-color: #7c3aed; transition: width 0.3s ease; }
    .link-hover:hover::after { width: 100%; }
    .decorative-shape { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.3; z-index: 0; }
    .shape-1 { width: 300px; height: 300px; background: #a78bfa; top: -50px; right: -50px; }
    .shape-2 { width: 250px; height: 250px; background: #c084fc; bottom: -80px; left: -80px; }
    .shape-3 { width: 200px; height: 200px; background: #e9d5ff; top: 50%; right: 10%; }
    .input-group { transition: transform 0.3s ease; }
    .input-group:focus-within { transform: scale(1.02); }
    .checkbox-custom:checked { background-color: #7c3aed; border-color: #7c3aed; }
  `;

  return (
    <div className="font-inter gradient-bg min-h-screen flex items-center justify-center p-4">
      <style>{customStyles}</style>
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
      <div className="w-full max-w-6xl mx-auto mt-20">
        <div className="glass-effect rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-8 md:p-12 lg:p-16">
              <div className="max-w-md mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">Log in</h1>
                <p className="text-gray-600 mb-8">Welcome back! Please enter your details.</p>
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">{error}</div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="relative input-group">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                      </span>
                      <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} placeholder="Enter your username" className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50/50 input-focus" required />
                    </div>
                  </div>
                  <div className="relative input-group">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3zm0 2c3.866 0 7 3.134 7 7H5c0-3.866 3.134-7 7-7z"></path>
                        </svg>
                      </span>
                      <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50/50 input-focus" required />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 password-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center text-gray-600 text-sm">
                      <input type="checkbox" className="mr-2 checkbox-custom" /> Remember me
                    </label>
                    <a href="#" className="text-purple-700 text-sm font-medium link-hover">Forgot password?</a>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button type="submit" disabled={loading} className="w-1/2 gradient-purple text-white font-medium py-3 rounded-full shadow-lg btn-hover disabled:opacity-60">
                      {loading ? 'Logging in...' : 'Log In'}
                    </button>
                    <button type="button" onClick={() => navigate('/signup')} className="w-1/2 gradient-purple text-white font-medium py-3 rounded-full shadow-lg btn-hover">
                      Sign Up
                    </button>
                  </div>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">or continue with</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <button type="button" className="flex items-center justify-center py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all hover:shadow-md">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </button>
                    <button type="button" className="flex items-center justify-center py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all hover:shadow-md">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                      </svg>
                    </button>
                    <button type="button" className="flex items-center justify-center py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all hover:shadow-md">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 .5C5.73.5.5 5.73.5 12.02c0 5.1 3.29 9.42 7.86 10.94.58.11.79-.25.79-.56v-2.18c-3.2.7-3.87-1.36-3.87-1.36-.53-1.35-1.3-1.71-1.3-1.71-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.77 2.73 1.26 3.39.96.11-.76.41-1.26.75-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.2-3.1-.12-.3-.52-1.52.11-3.18 0 0 .98-.31 3.21 1.18.93-.26 1.93-.39 2.93-.39 1 0 2 .13 2.93.39 2.23-1.49 3.21-1.18 3.21-1.18.63 1.66.23 2.88.11 3.18.75.81 1.2 1.84 1.2 3.1 0 4.43-2.69 5.41-5.25 5.7.43.37.8 1.1.8 2.22v3.28c0 .31.21.68.8.56 4.57-1.52 7.86-5.84 7.86-10.94C23.5 5.73 18.27.5 12 .5z"/>
                      </svg>
                    </button>
                  </div>
                  <p className="text-center text-xs text-gray-500 mt-2">Use test/test for dev login.</p>
                </form>
              </div>
            </div>
            <div className="hidden md:block relative overflow-hidden p-12 gradient-purple">
              <div className="relative z-10 h-full flex flex-col justify-center items-center text-white text-center">
                <div className="mb-8">
                  <img src="/login2.png" alt="Finora" className="w-32 h-32 object-contain rounded-full bg-white/10 p-4 border border-white/20" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Welcome to Finora</h2>
                <p className="text-lg text-purple-100 max-w-sm">Your trusted platform for financial management and growth. Start your journey today.</p>
                <div className="mt-12 flex space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-float"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-float-delayed"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-float" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
              <div className="decorative-shape shape-1"></div>
              <div className="decorative-shape shape-2"></div>
              <div className="decorative-shape shape-3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
