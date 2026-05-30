export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div className="hero">
        <h1>Farmer BJ Enterprises</h1>
        <p>Modern Property Management Platform</p>
        <p style={{ fontSize: '16px', maxWidth: '600px', margin: '0 auto 32px auto' }}>
          Streamlined Solutions for Real Estate Professionals
        </p>
        <div className="hero-buttons">
          <a href="/login" className="hero-btn-primary">Owner Login</a>
          <a href="/tenant-login" className="hero-btn-secondary">Tenant Portal</a>
          <a href="/register" className="hero-btn-secondary">Register Property</a>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <p>© 2025 Farmer BJ Enterprises. All rights reserved.</p>
      </div>
    </div>
  )
}