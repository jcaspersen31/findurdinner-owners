import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api.js'
import { setToken, setOwner } from '../auth.js'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/owner/login', { email, password })
      setToken(res.data.token)
      setOwner(res.data.owner)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f8' }}>
      <div style={{ background: '#fff', border: '0.5px solid #e0dfd8', borderRadius: '16px', padding: '32px', width: '320px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '22px', fontWeight: 500, marginBottom: '4px' }}>
            <span style={{ color: '#D85A30' }}>FindUr</span>Dinner
          </div>
          <div style={{ fontSize: '12px', color: '#888' }}>Restaurant owner portal</div>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#666', marginBottom: '4px' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '0.5px solid #ccc', fontSize: '13px' }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#666', marginBottom: '4px' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '0.5px solid #ccc', fontSize: '13px' }}
            />
          </div>
          {error && <div style={{ fontSize: '12px', color: '#A32D2D', marginBottom: '12px' }}>{error}</div>}
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '10px', background: '#D85A30', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#888' }}>
  New restaurant owner?{' '}
  <Link to="/register" style={{ color: '#D85A30', textDecoration: 'none' }}>Create an account</Link>
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <Link to="/coverage" style={{ fontSize: '12px', color: '#888', textDecoration: 'none' }}>
          📍 View coverage map
        </Link>
      </div>
</div>
      </div>
    </div>
  )
}