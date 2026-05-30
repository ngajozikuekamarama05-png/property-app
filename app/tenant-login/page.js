'use client'
import { useState } from 'react'
import { supabase } from '../supabase'
import { useRouter } from 'next/navigation'

export default function TenantLogin() {
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
      // Check if user is a tenant
      const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('email', email)
        .single()
      
      if (tenant) {
        router.push('/tenant-dashboard')
      } else {
        setError('No tenant account found with this email')
        setLoading(false)
      }
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '16px', width: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>Tenant Portal</h1>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>Login to manage your rental</p>
        </div>
        
        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}
        
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '16px' }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '24px' }}
            required
          />
          <button type="submit" disabled={loading} style={{ width: '100%', background: '#0066cc', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
            {loading ? 'Logging in...' : 'Login to Tenant Portal'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '24px', color: '#6b7280' }}>
          <a href="/login" style={{ color: '#0066cc', textDecoration: 'none' }}>Property Owner? Login here →</a>
        </p>
      </div>
    </div>
  )
}