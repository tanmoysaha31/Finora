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
      const response = await fetch('http://localhost:5000/api/auth/login', {
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
