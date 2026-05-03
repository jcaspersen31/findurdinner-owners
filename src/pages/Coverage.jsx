import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

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
        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '0.5px solid #e0dfd8', marginBottom: '12px', height: '480px' }}>
          <MapContainer center={[40.5, -76.0]} zoom={7} style={{ height: '100%', width: '100%' }}>
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
    </div>
  )
}
