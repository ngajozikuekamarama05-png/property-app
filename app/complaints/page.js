'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'

export default function Complaints() {
  const [user, setUser] = useState(null)
  const [complaints, setComplaints] = useState([])
  const [tenants, setTenants] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [showResponse, setShowResponse] = useState(null)
  const [selectedTenant, setSelectedTenant] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [responseText, setResponseText] = useState('')
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        loadComplaints(user.id)
        loadTenants(user.id)
      }
    }
    getUser()
  }, [])

  const loadComplaints = async (userId) => {
    const { data } = await supabase
      .from('complaints')
      .select('*, tenants(name), properties(name)')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })
    setComplaints(data || [])
  }

  const loadTenants = async (userId) => {
    const { data } = await supabase
      .from('tenants')
      .select('*, properties(name)')
      .eq('owner_id', userId)
    setTenants(data || [])
  }

  const submitComplaint = async (e) => {
    e.preventDefault()
    
    const selectedTenantData = tenants.find(t => t.id === selectedTenant)
    
    const { error } = await supabase
      .from('complaints')
      .insert({
        owner_id: user.id,
        tenant_id: selectedTenant,
        property_id: selectedTenantData?.property_id,
        subject: subject,
        message: message,
        status: 'open'
      })

    if (error) {
      alert('Error: ' + error.message)
    } else {
      setShowForm(false)
      setSelectedTenant('')
      setSubject('')
      setMessage('')
      loadComplaints(user.id)
    }
  }

  const submitResponse = async (complaintId) => {
    const { error } = await supabase
      .from('complaints')
      .update({
        response: responseText,
        status: 'resolved',
        responded_at: new Date().toISOString()
      })
      .eq('id', complaintId)

    if (error) {
      alert('Error: ' + error.message)
    } else {
      setShowResponse(null)
      setResponseText('')
      loadComplaints(user.id)
    }
  }

  const getStatusColor = (status) => {
    return status === 'open' ? '#eab308' : '#22c55e'
  }

  if (!user) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>

  return (
    <div>
      <Navbar />
      <div style={{ padding: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '32px' }}>Complaints & Requests</h1>
          <button 
            onClick={() => setShowForm(true)}
            style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            + New Complaint
          </button>
        </div>

        {/* Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#f3f4f6', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
            <h3>Open Complaints</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0', color: '#eab308' }}>
              {complaints.filter(c => c.status === 'open').length}
            </p>
          </div>
          <div style={{ backgroundColor: '#f3f4f6', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
            <h3>Resolved</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0', color: '#22c55e' }}>
              {complaints.filter(c => c.status === 'resolved').length}
            </p>
          </div>
        </div>

        {/* Complaints List */}
        <h2 style={{ fontSize: '24px', marginBottom: '15px' }}>All Complaints</h2>
        {complaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#f3f4f6', borderRadius: '10px' }}>
            <p>No complaints yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {complaints.map(complaint => (
              <div key={complaint.id} style={{ border: `2px solid ${getStatusColor(complaint.status)}`, padding: '20px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0' }}>{complaint.subject}</h3>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      From: {complaint.tenants?.name} • Property: {complaint.properties?.name}
                    </p>
                    <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                      Submitted: {new Date(complaint.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span style={{ backgroundColor: getStatusColor(complaint.status), color: 'white', padding: '5px 10px', borderRadius: '5px', fontSize: '12px' }}>
                      {complaint.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <p style={{ margin: '15px 0', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '5px' }}>
                  {complaint.message}
                </p>

                {complaint.response && (
                  <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#dcfce7', borderRadius: '5px' }}>
                    <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>Response:</p>
                    <p style={{ margin: '0' }}>{complaint.response}</p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
                      Responded: {new Date(complaint.responded_at).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {complaint.status === 'open' && showResponse !== complaint.id && (
                  <button 
                    onClick={() => setShowResponse(complaint.id)}
                    style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}
                  >
                    Respond
                  </button>
                )}

                {showResponse === complaint.id && (
                  <div style={{ marginTop: '15px' }}>
                    <textarea
                      placeholder="Type your response here..."
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      rows="3"
                      style={{ width: '100%', border: '1px solid #ccc', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => submitResponse(complaint.id)}
                        style={{ backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer' }}
                      >
                        Send Response
                      </button>
                      <button 
                        onClick={() => setShowResponse(null)}
                        style={{ backgroundColor: '#9ca3af', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* New Complaint Modal */}
        {showForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', width: '500px', maxWidth: '90%' }}>
              <h2 style={{ marginBottom: '20px' }}>New Complaint</h2>
              <form onSubmit={submitComplaint}>
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
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Subject *</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    style={{ width: '100%', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Message *</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows="4"
                    style={{ width: '100%', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button type="submit" style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    Submit Complaint
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