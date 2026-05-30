'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'

export default function Tenants() {
  const [user, setUser] = useState(null)
  const [properties, setProperties] = useState([])
  const [tenants, setTenants] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [leaseStart, setLeaseStart] = useState('')
  const [leaseEnd, setLeaseEnd] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        loadProperties(user.id)
        loadTenants(user.id)
      }
    }
    getUser()
  }, [])

  const loadProperties = async (userId) => {
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('owner_id', userId)
    setProperties(data || [])
  }

  const loadTenants = async (userId) => {
    setLoading(true)
    const { data } = await supabase
      .from('tenants')
      .select('*, properties(name)')
      .eq('owner_id', userId)
    setTenants(data || [])
    setLoading(false)
  }

  const addTenant = async (e) => {
    e.preventDefault()
    
    const { error } = await supabase
      .from('tenants')
      .insert({
        owner_id: user.id,
        property_id: selectedProperty,
        name: name,
        email: email,
        phone: phone,
        lease_start: leaseStart,
        lease_end: leaseEnd
      })

    if (error) {
      alert('Error: ' + error.message)
    } else {
      setShowForm(false)
      setName('')
      setEmail('')
      setPhone('')
      setSelectedProperty('')
      setLeaseStart('')
      setLeaseEnd('')
      loadTenants(user.id)
    }
  }

  if (!user) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>

  return (
    <div>
      <Navbar />
      <div style={{ padding: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '32px' }}>Tenant Management</h1>
          <button 
            onClick={() => setShowForm(true)}
            style={{ backgroundColor: '#22c55e', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            + Add Tenant
          </button>
        </div>

        {/* Tenant List */}
        {loading ? (
          <p>Loading...</p>
        ) : tenants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#f3f4f6', borderRadius: '10px' }}>
            <p>No tenants yet. Click "Add Tenant" to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {tenants.map(tenant => (
              <div key={tenant.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '10px' }}>
                <h3 style={{ margin: '0 0 5px 0' }}>{tenant.name}</h3>
                <p style={{ margin: '5px 0', color: '#666' }}>📧 {tenant.email}</p>
                <p style={{ margin: '5px 0', color: '#666' }}>📞 {tenant.phone}</p>
                <p style={{ margin: '5px 0', color: '#666' }}>🏠 Property: {tenant.properties?.name}</p>
                <p style={{ margin: '5px 0', color: '#666' }}>📅 Lease: {tenant.lease_start} to {tenant.lease_end}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add Tenant Modal */}
        {showForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', width: '500px', maxWidth: '90%' }}>
              <h2 style={{ marginBottom: '20px' }}>Add New Tenant</h2>
              <form onSubmit={addTenant}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Select Property *</label>
                  <select 
                    value={selectedProperty} 
                    onChange={(e) => setSelectedProperty(e.target.value)}
                    style={{ width: '100%', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}
                    required
                  >
                    <option value="">Select a property</option>
                    {properties.map(prop => (
                      <option key={prop.id} value={prop.id}>{prop.name} - {prop.location}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tenant Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Lease Start Date</label>
                  <input
                    type="date"
                    value={leaseStart}
                    onChange={(e) => setLeaseStart(e.target.value)}
                    style={{ width: '100%', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Lease End Date</label>
                  <input
                    type="date"
                    value={leaseEnd}
                    onChange={(e) => setLeaseEnd(e.target.value)}
                    style={{ width: '100%', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button type="submit" style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    Save Tenant
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