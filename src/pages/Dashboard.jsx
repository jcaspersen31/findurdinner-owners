import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api.js'
import { getOwner } from '../auth.js'

export default function Dashboard() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const owner = getOwner()
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('success')) {
      alert('Payment successful! Your listing has been upgraded.')
      window.history.replaceState({}, '', '/dashboard')
    }
    if (params.get('cancelled')) {
      alert('Payment cancelled.')
      window.history.replaceState({}, '', '/dashboard')
    }
    fetchRestaurants()
  }, [])

  async function fetchRestaurants() {
    setLoading(true)
    try {
      const res = await api.get('/owner/restaurants')
      setRestaurants(res.data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  async function upgrade(restaurantId, tierName) {
    try {
      const res = await api.post('/stripe/create-checkout', { restaurantId, tierName })
      window.location.href = res.data.url
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to start checkout')
    }
  }

  async function manageBilling() {
    try {
      const res = await api.post('/stripe/create-portal')
      window.location.href = res.data.url
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to open billing portal')
    }
  }

  const tierColors = {
    Featured: { bg: '#EEEDFE', color: '#3C3489' },
    Menu: { bg: '#E6F1FB', color: '#0C447C' },
    Free: { bg: '#F1EFE8', color: '#5F5E5A' },
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '4px' }}>
          Welcome, {owner?.name}
        </div>
        <div style={{ fontSize: '13px', color: '#888' }}>
          Manage your restaurant listings
        </div>
      </div>

      {loading ? (
        <div style={{ fontSize: '13px', color: '#888' }}>Loading...</div>
      ) : restaurants.length === 0 ? (
        <div style={{ background: '#fff', border: '0.5px solid #e0dfd8', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>No listings yet</div>
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>Your restaurant hasn't been added to FindUrDinner yet. Contact us to get listed.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {restaurants.map(r => (
            <div key={r.id} style={{ background: '#fff', border: '0.5px solid #e0dfd8', borderRadius: '12px', padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '2px' }}>{r.name}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{r.address}</div>
                </div>
                <span style={{
                  fontSize: '10px', padding: '2px 10px', borderRadius: '999px',
                  background: tierColors[r.tier?.name]?.bg || tierColors.Free.bg,
                  color: tierColors[r.tier?.name]?.color || tierColors.Free.color,
                }}>
                  {r.tier?.name || 'Free'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {r.eatIn && <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', background: '#EAF3DE', color: '#27500A' }}>Eat in</span>}
                {r.takeOut && <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', background: '#E6F1FB', color: '#0C447C' }}>Take out</span>}
                {r.delivery && <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', background: '#FAEEDA', color: '#633806' }}>Delivery</span>}
                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', background: '#F1EFE8', color: '#5F5E5A' }}>{r.priceRange}</span>
              </div>

              <div style={{ display: 'flex', gap: '8px', borderTop: '0.5px solid #f0efe8', paddingTop: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigate(`/restaurant/${r.id}`)}
                  style={{ padding: '6px 14px', background: '#fff', border: '0.5px solid #ccc', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', color: '#444' }}>
                  Edit listing
                </button>
                {r.tier?.name !== 'Free' && (
                  <button
                    onClick={manageBilling}
                    style={{ padding: '6px 14px', background: '#fff', border: '0.5px solid #ccc', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', color: '#444' }}>
                    Manage billing
                  </button>
                )}
                {r.tier?.name === 'Free' && (
                  <button
                    onClick={() => upgrade(r.id, 'Menu')}
                    style={{ padding: '6px 14px', background: '#E6F1FB', border: '0.5px solid #85B7EB', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', color: '#0C447C' }}>
                    Upgrade to Menu — $19/mo
                  </button>
                )}
                {(r.tier?.name === 'Free' || r.tier?.name === 'Menu') && (
                  <button
                    onClick={() => upgrade(r.id, 'Featured')}
                    style={{ padding: '6px 14px', background: '#EEEDFE', border: '0.5px solid #AFA9EC', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', color: '#3C3489' }}>
                    Upgrade to Featured — $49/mo
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}