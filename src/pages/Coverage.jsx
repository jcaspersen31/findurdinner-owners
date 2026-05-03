import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function AreaRequestForm() {
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!city.trim()) return
    setSubmitting(true)
    try {
      await fetch(`${API}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'area_request', city: city.trim(), state: state.trim(), userEmail: email.trim() }),
      })
      setSubmitted(true)
    } catch (err) { console.error(err) }
    setSubmitting(false)
  }

  if (submitted) return (
    <div style={{ background: '#EAF3DE', borderRadius: '10px', padding: '14px 16px', marginTop: '16px' }}>
      <div style={{ fontWeight: 600, color: '#27500A', marginBottom: '4px' }}>✓ Request submitted!</div>
      <div style={{ fontSize: '13px', color: '#3B6D11' }}>We'll prioritize importing {city} and notify you when it's live.</div>
    </div>
  )

  return (
    <div style={{ background: '#fff', border: '0.5px solid #e0dfd8', borderRadius: '12px', padding: '20px', marginTop: '16px' }}>
      <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>📍 Request your area</div>
      <div style={{ fontSize: '13px', color: '#888', marginBottom: '14px' }}>
        Don't see your city? Let us know and we'll prioritize importing restaurants there.
      </div>
      <form onSubmit={submit}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <input
            value={city} onChange={e => setCity(e.target.value)}
            placeholder="City *" required
            style={{ flex: 2, padding: '9px 12px', borderRadius: '8px', border: '0.5px solid #ddd', fontSize: '13px' }} />
          <input
            value={state} onChange={e => setState(e.target.value)}
            placeholder="State" maxLength={2}
            style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '0.5px solid #ddd', fontSize: '13px', textTransform: 'uppercase' }} />
        </div>
        <input
          value={email} onChange={e => setEmail(e.target.value)}
          placeholder="Email (optional — we'll notify you when it's live)"
          type="email"
          style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '0.5px solid #ddd', fontSize: '13px', marginBottom: '10px', boxSizing: 'border-box' }} />
        <button type="submit" disabled={submitting || !city.trim()}
          style={{ padding: '9px 20px', background: '#D85A30', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, fontSize: '13px', cursor: 'pointer', opacity: !city.trim() ? 0.5 : 1 }}>
          {submitting ? 'Submitting...' : 'Request this area'}
        </button>
      </form>
    </div>
  )
}

export default function Coverage() {
  const [clusters, setClusters] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${API}/restaurants/clusters`).then(r => r.json()),
      fetch(`${API}/restaurants/stats/public`).then(r => r.json()),
    ]).then(([clusterData, statsData]) => {
      setClusters(Array.isArray(clusterData) ? clusterData : [])
      setTotal(statsData.active || 0)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>Coverage map</div>
        <div style={{ fontSize: '13px', color: '#888' }}>
          FindUrDinner is live in these areas with {total.toLocaleString()} restaurants and growing.
          Don't see your area? <a href="/register" style={{ color: '#D85A30' }}>Register</a> and we'll prioritize importing it.
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: '#888', fontSize: '13px' }}>Loading map...</div>
      ) : (
        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '0.5px solid #e0dfd8', marginBottom: '12px', height: '480px', position: 'relative' }}>
          <MapContainer center={[40.5, -76.0]} zoom={7} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {clusters.map((cluster, i) => (
              <CircleMarker
                key={i}
                center={[cluster.lat, cluster.lng]}
                radius={Math.min(5 + Math.sqrt(cluster.count) * 1.5, 18)}
                pathOptions={{ fillColor: '#D85A30', fillOpacity: 0.65, color: '#993C1D', weight: 1 }}>
                <Tooltip>
                  <div style={{ fontSize: '12px' }}>
                    <strong>{cluster.count} restaurant{cluster.count !== 1 ? 's' : ''}</strong>
                  </div>
                </Tooltip>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      )}

      <div style={{ display: 'flex', gap: '24px', fontSize: '12px', color: '#888' }}>
        <span>🟠 Each dot represents a covered area</span>
        <span>Larger dots = more restaurants</span>
        <span>{clusters.length} areas covered</span>
      </div>

      <AreaRequestForm />
    </div>
  )
}
