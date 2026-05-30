'use client'
import { useState } from 'react'
import { supabase } from '../supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '24px', width: '420px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>Login</h1>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>Welcome back to Farmer BJ Enterprises</p>
        </div>
        
        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}
        
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            style={{ marginBottom: '16px' }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            style={{ marginBottom: '24px' }}
            required
          />
          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px' }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '24px', color: '#6b7280' }}>
          Don't have an account? <a href="/register" style={{ color: '#0066cc', textDecoration: 'none' }}>Register</a>
        </p>
      </div>
    </div>
  )
}