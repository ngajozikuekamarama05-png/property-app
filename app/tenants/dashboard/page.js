'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useRouter } from 'next/navigation'

export default function TenantDashboard() {
  const [user, setUser] = useState(null)
  const [tenant, setTenant] = useState(null)
  const [property, setProperty] = useState(null)
  const [complaints, setComplaints] = useState([])
  const [payments, setPayments] = useState([])
  const [showComplaintForm, setShowComplaintForm] = useState(false)
  const [complaintSubject, setComplaintSubject] = useState('')
  const [complaintMessage, setComplaintMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/tenant-login')
      } else {
        setUser(user)
        loadTenantData(user.email)
      }
    }
    getUser()
  }, [])

  const loadTenantData = async (email) => {
    // Get tenant info
    const { data: tenantData } = await supabase
      .from('tenants')
      .select('*, properties(*)')
      .eq('email', email)
      .single()
    
    if (tenantData) {
      setTenant(tenantData)
      setProperty(tenantData.properties)
      
      // Get complaints for this tenant
      const { data: complaintsData } = await supabase
        .from('complaints')
        .select('*')
        .eq('tenant_id', tenantData.id)
        .order('created_at', { ascending: false })
      
      setComplaints(complaintsData || [])
      
      // Get rent payments
      const { data: paymentsData } = await supabase
        .from('rent_payments')
        .select('*')
        .eq('tenant_id', tenantData.id)
        .order('created_at', { ascending: false })
      
      setPayments(paymentsData || [])
    }
  }

  const submitComplaint = async (e) => {
    e.preventDefault()
    
    const { error } = await supabase
      .from('complaints')
      .insert({
        tenant_id: tenant.id,
        property_id: property.id,
        owner_id: property.owner_id,
        subject: complaintSubject,
        message: complaintMessage,
        status: 'open'
      })

    if (error) {
      alert('Error: ' + error.message)
    } else {
      setShowComplaintForm(false)
      setComplaintSubject('')
      setComplaintMessage('')
      loadTenantData(user.email)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/tenant-login')
  }

  if (!user) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Tenant Navbar */}
      <nav style={{ background: '#1a1a1a', color: 'white', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px', fontWeight: '700' }}>🏠 Tenant Portal</span>
        </div>
        <button onClick={handleLogout} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px' }}>
        {/* Welcome Section */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>Welcome, {tenant?.name || user.email}</h1>
          <p style={{ color: '#6b7280' }}>Your rental dashboard</p>
        </div>

        {/* Property Card */}
        {property && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '32px', border: '1px solid #eaeaea' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Your Rental Property</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>Property Name</p>
                <p style={{ fontWeight: '500' }}>{property.name}</p>
              </div>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>Location</p>
                <p style={{ fontWeight: '500' }}>{property.location}</p>
              </div>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>Monthly Rent</p>
                <p style={{ fontWeight: '500', color: '#0066cc' }}>N${property.price?.toLocaleString()}</p>
              </div>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>Lease Period</p>
                <p style={{ fontWeight: '500' }}>{tenant.lease_start || 'N/A'} to {tenant.lease_end || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          <button onClick={() => setShowComplaintForm(true)} style={{ background: '#0066cc', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
            + Report Issue / Complaint
          </button>
        </div>

        {/* Complaint Form Modal */}
        {showComplaintForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '500px', maxWidth: '90%' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Report an Issue</h2>
              <form onSubmit={submitComplaint}>
                <input
                  type="text"
                  placeholder="Subject (e.g., Water Leakage, Electricity Issue)"
                  value={complaintSubject}
                  onChange={(e) => setComplaintSubject(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '16px' }}
                  required
                />
                <textarea
                  placeholder="Describe the issue in detail..."
                  value={complaintMessage}
                  onChange={(e) => setComplaintMessage(e.target.value)}
                  rows="5"
                  style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '24px' }}
                  required
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" style={{ background: '#0066cc', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Submit</button>
                  <button type="button" onClick={() => setShowComplaintForm(false)} style={{ background: '#9ca3af', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* My Complaints */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '32px', border: '1px solid #eaeaea' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>My Complaints</h2>
          {complaints.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No complaints submitted yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {complaints.map(complaint => (
                <div key={complaint.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <h3 style={{ fontWeight: '600', marginBottom: '8px' }}>{complaint.subject}</h3>
                    <span style={{ 
                      background: complaint.status === 'open' ? '#fef3c7' : '#dcfce7', 
                      color: complaint.status === 'open' ? '#d97706' : '#10b981',
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {complaint.status === 'open' ? 'Pending' : 'Resolved'}
                    </span>
                  </div>
                  <p style={{ color: '#4b5563', marginBottom: '12px' }}>{complaint.message}</p>
                  {complaint.response && (
                    <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', marginTop: '12px' }}>
                      <p style={{ fontWeight: '500', marginBottom: '4px' }}>Landlord Response:</p>
                      <p style={{ color: '#4b5563' }}>{complaint.response}</p>
                    </div>
                  )}
                  <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '12px' }}>Submitted: {new Date(complaint.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rent Payment History */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #eaeaea' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Rent Payment History</h2>
          {payments.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No payment records yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr><th>Month</th><th>Year</th><th>Amount</th><th>Status</th></tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment.id}>
                    <td>{new Date(2000, payment.month - 1, 1).toLocaleString('default', { month: 'long' })}</td>
                    <td>{payment.year}</td>
                    <td>N${payment.amount?.toLocaleString()}</td>
                    <td style={{ color: '#10b981' }}>✓ Paid</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}