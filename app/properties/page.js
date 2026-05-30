'use client'
import { useState } from 'react'
import { supabase } from '../supabase'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'

export default function AddProperty() {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const uploadImage = async (userId) => {
    if (!image) return null
    
    const fileExt = image.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`
    
    const { error: uploadError, data } = await supabase.storage
      .from('property-images')
      .upload(fileName, image)
    
    if (uploadError) {
      throw new Error(uploadError.message)
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(fileName)
    
    return publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    
    let imageUrl = null
    if (image) {
      setUploading(true)
      try {
        imageUrl = await uploadImage(user.id)
      } catch (err) {
        setError('Image upload failed: ' + err.message)
        setUploading(false)
        setLoading(false)
        return
      }
      setUploading(false)
    }

    const { error: saveError } = await supabase
      .from('properties')
      .insert({
        owner_id: user.id,
        name: name,
        location: location,
        price: parseFloat(price),
        description: description,
        image_url: imageUrl
      })

    if (saveError) {
      setError(saveError.message)
      setLoading(false)
    } else {
      router.push('/properties')
    }
  }

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>Add New Property</h1>
        
        {error && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Property Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Location *</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ width: '100%', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Monthly Rent (N$) *</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={{ width: '100%', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Property Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ width: '100%', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}
            />
            {imagePreview && (
              <div style={{ marginTop: '10px' }}>
                <img src={imagePreview} alt="Preview" style={{ width: '200px', height: '150px', objectFit: 'cover', borderRadius: '5px' }} />
              </div>
            )}
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              style={{ width: '100%', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || uploading}
            style={{ backgroundColor: '#2563eb', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {uploading ? 'Uploading Image...' : loading ? 'Saving...' : 'Add Property'}
          </button>
        </form>
      </div>
    </div>
  )
}