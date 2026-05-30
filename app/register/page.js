'use client'
import { useState } from 'react'
import { supabase } from '../supabase'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          company_name: name
        }
      }
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess('Registration successful! Redirecting to login...')
      setTimeout(() => router.push('/login'), 2000)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', width: '450px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', textAlign: 'center', marginBottom: '30px' }}>Register</h1>
        
        {error && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>{error}</div>}
        {success && <div style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>{success}</div>}
        
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Company Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', border: '1px solid #ccc', padding: '12px', borderRadius: '5px', marginBottom: '15px' }}
            required
          />
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', border: '1px solid #ccc', padding: '12px', borderRadius: '5px', marginBottom: '15px' }}
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', border: '1px solid #ccc', padding: '12px', borderRadius: '5px', marginBottom: '15px' }}
            required
          />
          
          <button type="submit" style={{ width: '100%', backgroundColor: '#22c55e', color: 'white', padding: '12px', borderRadius: '5px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
            Register
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          <a href="/login" style={{ color: '#2563eb' }}>Login</a>
        </p>
      </div>
    </div>
  )
}