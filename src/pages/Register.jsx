import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api.js'
import { setToken, setOwner } from '../auth.js'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function update(field, val) {
    setForm(f => ({ ...f, [field]: val }))
  }

  async function handleRegister(e) {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/owner/register', {
        name: form.name,
        email: form.email,
        password: form.password,
      })
      setToken(res.data.token)
      setOwner(res.data.owner)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f8' }}>
      <div style={{ background: '#fff', border: '0.5px solid #e0dfd8', borderRadius: '16px', padding: '32px', width: '340px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '22px', fontWeight: 500, marginBottom: '4px' }}>
            <span style={{ color: '#D85A30' }}>FindUr</span>Dinner
          </div>
          <div style={{ fontSize: '12px', color: '#888' }}>Create your owner account</div>
        </div>

        <form onSubmit={handleRegister}>
          {[
            { field: 'name', label: 'Your name', type: 'text' },
            { field: 'email', label: 'Email', type: 'email' },
            { field: 'password', label: 'Password', type: 'password' },
            { field: 'confirm', label: 'Confirm password', type: 'password' },
          ].map(({ field, label, type }) => (
            <div key={field} style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#666', marginBottom: '4px' }}>{label}</label>
              <input
                type={type}
                value={form[field]}
                onChange={e => update(field, e.target.value)}
                required
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '0.5px solid #ccc', fontSize: '13px' }}
              />
            </div>
          ))}
          {error && <div style={{ fontSize: '12px', color: '#A32D2D', marginBottom: '12px' }}>{error}</div>}
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '10px', background: '#D85A30', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', marginTop: '4px' }}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#888' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#D85A30', textDecoration: 'none' }}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}