'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'

export default function Navbar() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav style={{ background: 'white', padding: '16px 32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <img 
            src="/logo.png" 
            alt="Logo" 
            style={{ height: '40px', width: 'auto' }}
            onError={(e) => { console.log('Logo not found'); e.target.style.display = 'none' }}
          />
          <span style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a' }}>Farmer BJ <span style={{ color: '#0066cc' }}>Enterprises</span></span>
        </Link>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <Link href="/dashboard" style={{ color: '#1a1a1a', textDecoration: 'none', fontWeight: '500' }}>Dashboard</Link>
          <Link href="/properties" style={{ color: '#1a1a1a', textDecoration: 'none', fontWeight: '500' }}>Properties</Link>
          <Link href="/tenants" style={{ color: '#1a1a1a', textDecoration: 'none', fontWeight: '500' }}>Tenants</Link>
          <Link href="/rent" style={{ color: '#1a1a1a', textDecoration: 'none', fontWeight: '500' }}>Rent</Link>
          <Link href="/complaints" style={{ color: '#1a1a1a', textDecoration: 'none', fontWeight: '500' }}>Complaints</Link>
          <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid #dc2626', color: '#dc2626', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Logout</button>
        </div>
      </div>
    </nav>
  )
}