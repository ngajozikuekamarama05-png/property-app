'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [properties, setProperties] = useState([])
  const [tenants, setTenants] = useState([])
  const [payments, setPayments] = useState([])
  const [complaints, setComplaints] = useState([])
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        loadData(user.id)
      }
    }
    getUser()
  }, [])

  const loadData = async (userId) => {
    const { data: propertiesData } = await supabase.from('properties').select('*').eq('owner_id', userId)
    const { data: tenantsData } = await supabase.from('tenants').select('*').eq('owner_id', userId)
    const { data: paymentsData } = await supabase.from('rent_payments').select('*').eq('owner_id', userId)
    const { data: complaintsData } = await supabase.from('complaints').select('*').eq('owner_id', userId)
    
    setProperties(propertiesData || [])
    setTenants(tenantsData || [])
    setPayments(paymentsData || [])
    setComplaints(complaintsData || [])
  }

  if (!user) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>

  const totalRentCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const openComplaints = complaints.filter(c => c.status === 'open').length

  return (
    <div>
      <Navbar />
      <div className="container">
        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>TOTAL PROPERTIES</h3>
            <div className="number">{properties.length}</div>
          </div>
          <div className="stat-card">
            <h3>ACTIVE TENANTS</h3>
            <div className="number">{tenants.length}</div>
          </div>
          <div className="stat-card">
            <h3>RENT COLLECTED</h3>
            <div className="number">N${totalRentCollected.toLocaleString()}</div>
            <div className="sub">This month</div>
          </div>
          <div className="stat-card">
            <h3>OPEN COMPLAINTS</h3>
            <div className="number" style={{ color: openComplaints > 0 ? '#dc2626' : '#10b981' }}>{openComplaints}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Quick Actions</h2>
          <div className="quick-actions">
            <a href="/properties/new" className="quick-action-btn">+ Add Property</a>
            <a href="/tenants" className="quick-action-btn">+ Add Tenant</a>
            <a href="/rent" className="quick-action-btn">Record Payment</a>
            <button className="quick-action-btn" onClick={() => alert('Report feature coming soon')}>Generate Report</button>
            <button className="quick-action-btn" onClick={() => alert('Analytics coming soon')}>View Analytics</button>
          </div>
        </div>

        {/* Recent Properties */}
        <div className="card">
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Recent Properties</h2>
          {properties.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No properties yet. Click "Add Property" to get started.</p>
          ) : (
            <table className="table">
              <thead>
                <tr><th>Property Name</th><th>Location</th><th>Rent</th><th>Status</th></tr>
              </thead>
              <tbody>
                {properties.slice(0, 5).map(prop => (
                  <tr key={prop.id}>
                    <td style={{ fontWeight: '500' }}>{prop.name}</td>
                    <td>{prop.location}</td>
                    <td>N${prop.price?.toLocaleString()}</td>
                    <td style={{ color: '#10b981' }}>Active</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <div className="footer">
        <p>© 2025 Farmer BJ Enterprises. All rights reserved.</p>
      </div>
    </div>
  )
}