import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function ManageProfile() {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  const [user, setUser] = useState({ fullname: '', email: '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', content: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userId = localStorage.getItem('finora_user_id');
      if (!userId) return navigate('/login');
      const res = await fetch(`${API_BASE}/api/auth/profile?userId=${userId}`);
      const data = await res.json();
      if (res.ok) setUser({ fullname: data.fullname, email: data.email });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({});
    try {
      const userId = localStorage.getItem('finora_user_id');
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...user })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', content: 'Profile updated successfully' });
      } else {
        setMsg({ type: 'error', content: data.error || 'Failed to update profile' });
      }
    } catch (err) {
      setMsg({ type: 'error', content: 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
        return setMsg({ type: 'error', content: 'New passwords do not match' });
    }
    setLoading(true);
    setMsg({});
    try {
      const userId = localStorage.getItem('finora_user_id');
      const res = await fetch(`${API_BASE}/api/auth/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, currentPassword: passwords.current, newPassword: passwords.new })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', content: 'Password changed successfully' });
        setPasswords({ current: '', new: '', confirm: '' });
      } else {
        setMsg({ type: 'error', content: data.error || 'Failed to change password' });
      }
    } catch (err) {
      setMsg({ type: 'error', content: 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    try {
        const userId = localStorage.getItem('finora_user_id');
        await fetch(`${API_BASE}/api/auth/delete?userId=${userId}`, { method: 'DELETE' });
        localStorage.clear();
        navigate('/login');
    } catch (err) {
        alert('Failed to delete account');
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Manage Profile</h1>
            <Link to="/dashboard" className="text-sm text-purple-400 hover:text-purple-300">Back to Dashboard</Link>
        </div>

        {msg.content && (
            <div className={`p-4 rounded-xl mb-6 ${msg.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {msg.content}
            </div>
        )}

        {/* Profile Details */}
        <div className="bg-[#242424] border border-white/10 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Profile Details</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                    <input type="text" value={user.fullname} onChange={e => setUser({...user, fullname: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-white" required />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Email</label>
                    <input type="email" value={user.email} onChange={e => setUser({...user, email: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-white" required />
                </div>
                <button disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors">
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>

        {/* Change Password */}
        <div className="bg-[#242424] border border-white/10 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Current Password</label>
                    <input type="password" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-white" required />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">New Password</label>
                    <input type="password" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-white" required />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Confirm New Password</label>
                    <input type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-white" required />
                </div>
                <button disabled={loading} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition-colors">
                    Change Password
                </button>
            </form>
        </div>

        {/* Danger Zone */}
        <div className="border border-red-500/20 bg-red-500/5 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-red-500 mb-2">Danger Zone</h2>
            <p className="text-gray-400 text-sm mb-4">Once you delete your account, there is no going back. Please be certain.</p>
            <button onClick={handleDeleteAccount} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 font-bold py-3 rounded-xl transition-colors">
                Delete Account
            </button>
        </div>
      </div>
    </div>
  );
}
