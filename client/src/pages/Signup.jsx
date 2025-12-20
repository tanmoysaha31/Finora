import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Signup() {
  const navigate = useNavigate()
  const [fullname, setFullname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pwdError, setPwdError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    const p1 = (password || '').trim()
    const p2 = (confirm || '').trim()
    if (p1 !== p2) {
      setPwdError('Passwords do not match')
      return
    }
    const isDummy = email === 'demo@finora.com' && password === 'demo123'
    if (isDummy) {
      navigate('/dashboard')
      return
    }
    setLoading(true)
    try {
      const r = await fetch('http://localhost:1641/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname, email, password })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d?.error || 'Signup failed')
      if (d?.id) {
        try { localStorage.setItem('finora_user_id', d.id) } catch (_) {}
      }
      navigate('/dashboard')
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'linear-gradient(135deg, #e9d5ff 0%, #f3e8ff 50%, #ddd6fe 100%)'}}>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="Finora Logo" className="w-10 h-10 object-contain rounded-md" />
              <span className="text-2xl font-bold text-gray-800">Finora</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-600 hover:text-gray-900">HOME</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">ABOUT US</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">CONTACT</a>
              <a href="#" className="font-semibold text-purple-700 border-b-2 border-purple-700">SIGN UP</a>
            </div>
          </div>
        </div>
      </nav>

      <div className="w-full max-w-6xl mx-auto mt-20">
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full">
                <h1 className="text-4xl md:text-5xl font-bold text-purple-950 mb-8">Sign up</h1>
                <form className="space-y-5" onSubmit={onSubmit}>
                  <div>
                    <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input id="fullname" type="text" placeholder="Daniel Gallego" className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50/50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200" value={fullname} onChange={e=>setFullname(e.target.value)} required />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input id="email" type="email" placeholder="hello@reallygreatsite.com" className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50/50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200" value={email} onChange={e=>setEmail(e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                      <div className="relative">
                        <input id="password" type={showPwd? 'text':'password'} placeholder="**********" className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl bg-gray-50/50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200" value={password} onChange={e=>{ const v=e.target.value; setPassword(v); const p2=(confirm||'').trim(); const p1=(v||'').trim(); setPwdError(p1 && p2 && p1!==p2 ? 'Passwords do not match':'' ) }} required />
                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={()=>setShowPwd(s=>!s)}>
                          {showPwd? 'Hide':'Show'}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                      <div className="relative">
                        <input id="confirm" type={showConfirm? 'text':'password'} placeholder="**********" className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl bg-gray-50/50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200" value={confirm} onChange={e=>{ const v=e.target.value; setConfirm(v); const p1=(password||'').trim(); const p2=(v||'').trim(); setPwdError(p1 && p2 && p1!==p2 ? 'Passwords do not match':'' ) }} required />
                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={()=>setShowConfirm(s=>!s)}>
                          {showConfirm? 'Hide':'Show'}
                        </button>
                      </div>
                      {pwdError ? (<p className="text-red-600 text-xs mt-1">{pwdError}</p>) : null}
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-[#3f0d6e] hover:bg-[#2e0952] text-white font-medium py-3 rounded-full shadow-lg mt-4 disabled:opacity-60">
                    {loading? 'Creating Account...':'Create Account'}
                  </button>
                  <p className="text-center text-xs text-gray-500 mt-2">Use demo@finora.com and demo123 to continue without signup.</p>
                </form>
              </div>
            </div>
            <div className="hidden md:block relative overflow-hidden p-12" style={{background: 'linear-gradient(135deg, #6b21a8 0%, #7c3aed 50%, #8b5cf6 100%)'}}>
              <div className="relative z-10 h-full flex flex-col justify-center items-center text-white text-center">
                <div className="mb-8">
                  <img src="/login2.png" alt="Finora Logo" className="w-32 h-32 object-contain rounded-full bg-white/10 p-4 border border-white/20" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Welcome to Finora</h2>
                <p className="text-lg text-purple-100 max-w-sm">Your trusted platform for financial management and growth. Start your journey today.</p>
                <div className="mt-12 flex space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
