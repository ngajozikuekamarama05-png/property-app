'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'

export default function RentTracking() {
  const [user, setUser] = useState(null)
  const [tenants, setTenants] = useState([])
  const [payments, setPayments] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState('')
  const [amount, setAmount] = useState('')
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        loadTenants(user.id)
        loadPayments(user.id)
      }
    }
    getUser()
  }, [])

  const loadTenants = async (userId) => {
    const { data } = await supabase
      .from('tenants')
      .select('*, properties(name)')
      .eq('owner_id', userId)
    setTenants(data || [])
  }

  const loadPayments = async (userId) => {
    const { data } = await supabase
      .from('rent_payments')
      .select('*, tenants(name), properties(name)')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })
    setPayments(data || [])
  }

  const recordPayment = async (e) => {
    e.preventDefault()
    
    const selectedTenantData = tenants.find(t => t.id === selectedTenant)
    
    const { error } = await supabase
      .from('rent_payments')
      .insert({
        owner_id: user.id,
        tenant_id: selectedTenant,
        property_id: selectedTenantData?.property_id,
        amount: parseFloat(amount),
        month: month,
        year: year,
        status: 'paid',
        paid_at: new Date().toISOString(),
        due_date: `${year}-${month}-01`
      })

    if (error) {
      alert('Error: ' + error.message)
    } else {
      setShowForm(false)
      setSelectedTenant('')
      setAmount('')
      loadPayments(user.id)
    }
  }

  const getMonthName = (month) => {
    return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' })
  }

  if (!user) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>

  return (
    <div>
      <Navbar />
      <div style={{ padding: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '32px' }}>Rent Tracking</h1>
          <button 
            onClick={() => setShowForm(true)}
            style={{ backgroundColor: '#22c55e', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            + Record Payment
          </button>
        </div>

        {/* Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#f3f4f6', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
            <h3>Total Tenants</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{tenants.length}</p>
          </div>
          <div style={{ backgroundColor: '#f3f4f6', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
            <h3>Total Collected</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0', color: '#22c55e' }}>
              N${payments.reduce((sum, p) => sum + p.amount, 0)}
            </p>
          </div>
          <div style={{ backgroundColor: '#f3f4f6', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
            <h3>Payments Made</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{payments.length}</p>
          </div>
        </div>

        {/* Payment History */}
        <h2 style={{ fontSize: '24px', marginBottom: '15px' }}>Payment History</h2>
        {payments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#f3f4f6', borderRadius: '10px' }}>
            <p>No payments recorded yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {payments.map(payment => (
              <div key={payment.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0' }}>{payment.tenants?.name}</h3>
                    <p style={{ margin: '5px 0', color: '#666' }}>🏠 {payment.properties?.name}</p>
                    <p style={{ margin: '5px 0', color: '#666' }}>📅 {getMonthName(payment.month)} {payment.year}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e', margin: '0' }}>N${payment.amount}</p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#22c55e' }}>✓ Paid</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Record Payment Modal */}
        {showForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', width: '450px', maxWidth: '90%' }}>
              <h2 style={{ marginBottom: '20px' }}>Record Rent Payment</h2>
              <form onSubmit={recordPayment}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Select Tenant *</label>
                  <select 
                    value={selectedTenant} 
                    onChange={(e) => setSelectedTenant(e.target.value)}
                    style={{ width: '100%', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}
                    required
                  >
                    <option value="">Select a tenant</option>
                    {tenants.map(tenant => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.name} - {tenant.properties?.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Amount Paid (N$) *</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{ width: '100%', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Month *</label>
                  <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} style={{ width: '100%', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                      <option key={m} value={m}>{getMonthName(m)}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Year *</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    style={{ width: '100%', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button type="submit" style={{ backgroundColor: '#22c55e', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    Record Payment
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} style={{ backgroundColor: '#9ca3af', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}