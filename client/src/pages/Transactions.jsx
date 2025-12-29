import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Transactions() {
  const API_BASE = import.meta.env.VITE_API_URL || 'https://finora-1mgm.onrender.com'
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (category) params.set('category', category)
      if (start) params.set('start', start)
      if (end) params.set('end', end)
      if (minAmount) params.set('minAmount', minAmount)
      if (maxAmount) params.set('maxAmount', maxAmount)
      params.set('limit', '200')
      let userId = null
      try { userId = localStorage.getItem('finora_user_id') } catch (_) {}
      if (userId) params.set('userId', userId)
      const res = await fetch(`${API_BASE}/api/transactions?${params.toString()}`)
      const data = await res.json()
      setItems(data.items || [])
    } catch (_) {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const formatCurrency = v => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(v || 0))

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">All Transactions</h1>
          <Link to="/dashboard" className="text-sm text-purple-400">Back to Dashboard</Link>
        </div>
        <div className="glass-panel rounded-2xl p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Keyword" className="bg-[#242424] border border-white/10 text-gray-300 text-sm rounded-lg px-3 py-2" />
            <select value={category} onChange={e => setCategory(e.target.value)} className="bg-[#242424] border border-white/10 text-gray-300 text-sm rounded-lg px-3 py-2">
              <option value="">All</option>
              <option>Food</option>
              <option>Transport</option>
              <option>Shopping</option>
              <option>Entertainment</option>
              <option>Utility</option>
              <option>Salary</option>
              <option>Tech</option>
              <option>Savings</option>
              <option>Others</option>
            </select>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-gray-500">From</span>
              <input type="date" value={start} onChange={e => setStart(e.target.value)} className="bg-[#242424] border border-white/10 text-gray-300 text-sm rounded-lg px-3 py-2" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-gray-500">To</span>
              <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="bg-[#242424] border border-white/10 text-gray-300 text-sm rounded-lg px-3 py-2" />
            </div>
            <input type="number" value={minAmount} onChange={e => setMinAmount(e.target.value)} placeholder="Min amount" className="bg-[#242424] border border-white/10 text-gray-300 text-sm rounded-lg px-3 py-2" />
            <input type="number" value={maxAmount} onChange={e => setMaxAmount(e.target.value)} placeholder="Max amount" className="bg-[#242424] border border-white/10 text-gray-300 text-sm rounded-lg px-3 py-2" />
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={load} className="px-4 py-2 bg-purple-600 rounded-lg text-sm">Apply</button>
            <button onClick={() => { setQ(''); setCategory(''); setStart(''); setEnd(''); setMinAmount(''); setMaxAmount(''); setTimeout(load, 0) }} className="px-4 py-2 bg-white/10 rounded-lg text-sm">Reset</button>
          </div>
        </div>
        <div className="glass-panel rounded-2xl p-4">
          {loading ? (
            <div className="text-sm text-gray-400">Loading...</div>
          ) : items.length ? (
            <div className="space-y-2">
              {items.map(it => (
                <div key={it.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div>
                    <div className="text-sm font-bold">{it.title}</div>
                    <div className="text-xs text-gray-500">{it.category} • {it.date}</div>
                  </div>
                  <div className="text-sm font-bold">{formatCurrency(it.amount)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400">No transactions found.</div>
          )}
        </div>
      </div>
    </div>
  )
}
