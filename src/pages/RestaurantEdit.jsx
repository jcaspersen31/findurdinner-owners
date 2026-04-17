import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api.js'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function RestaurantEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [cuisinesList, setCuisinesList] = useState([])
  const [cuisineOther, setCuisineOther] = useState('')
  const [showCuisineOther, setShowCuisineOther] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/owner/restaurants/${id}`)
        const r = res.data
        setForm({
          name: r.name,
          address: r.address,
          phone: r.phone || '',
          website: r.website || '',
          priceRange: r.priceRange || '$$',
          eatIn: r.eatIn,
          takeOut: r.takeOut,
          delivery: r.delivery,
          deliveryUrl: r.deliveryUrl || '',
          hours: r.hours || { Mon: '', Tue: '', Wed: '', Thu: '', Fri: '', Sat: '', Sun: '' },
          cuisineBroad: r.cuisineBroad || '',
          cuisineSpecific: r.cuisineSpecific || '',
          atmosphere: r.atmosphere || '',
          vegetarianFriendly: r.vegetarianFriendly || false,
          veganFriendly: r.veganFriendly || false,
          glutenFreeFriendly: r.glutenFreeFriendly || false,
          halalFriendly: r.halalFriendly || false,
          kosherFriendly: r.kosherFriendly || false,
        })
          try {
            const cuisineRes = await fetch('https://api.findurdinner.com/cuisines')
            const cuisines = await cuisineRes.json()
            setCuisinesList(cuisines)
            const inList = cuisines.some(c => c.name === r.cuisineSpecific)
            if (r.cuisineSpecific && !inList) {
              setShowCuisineOther(true)
            }
          } catch (err) {
            console.error(err)
          }
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    load()
  }, [id])


  function update(field, val) {
    setForm(f => ({ ...f, [field]: val }))
    setSaved(false)
  }

  function updateHours(day, val) {
    setForm(f => ({ ...f, hours: { ...f.hours, [day]: val } }))
    setSaved(false)
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch(`/owner/restaurants/${id}`, form)
      
      // If owner used a custom cuisine, flag it for admin review
      if (showCuisineOther && form.cuisineSpecific) {
        await api.post('/reports', {
          restaurantId: id,
          issue: 'Missing information',
          notes: `Owner suggested new cuisine type: "${form.cuisineSpecific}" — please review and add to taxonomy if appropriate.`,
        })
      }
      
      setSaved(true)
      setShowCuisineOther(false)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      alert(err.response?.data?.error || 'Save failed')
    }
    setSaving(false)
  }

  if (loading) return <div style={{ fontSize: '13px', color: '#888', padding: '24px' }}>Loading...</div>

  return (
    <div style={{ maxWidth: '560px' }}>
      <button
        onClick={() => navigate('/dashboard')}
        style={{ fontSize: '12px', color: '#888', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '16px', padding: 0 }}>
        ← Back to dashboard
      </button>

      <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '20px' }}>{form.name}</div>

      <form onSubmit={save}>
        <div style={{ background: '#fff', border: '0.5px solid #e0dfd8', borderRadius: '12px', padding: '16px 20px', marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Basic info</div>

          {[
            { field: 'name', label: 'Restaurant name', type: 'text' },
            { field: 'address', label: 'Address', type: 'text' },
            { field: 'phone', label: 'Phone', type: 'text' },
            { field: 'website', label: 'Website', type: 'text' },
          ].map(({ field, label, type }) => (
            <div key={field} style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#666', marginBottom: '3px' }}>{label}</label>
              <input
                type={type}
                value={form[field]}
                onChange={e => update(field, e.target.value)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '0.5px solid #ccc', fontSize: '13px' }}
              />
            </div>
          ))}

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#666', marginBottom: '3px' }}>Price range</label>
            <select
              value={form.priceRange}
              onChange={e => update('priceRange', e.target.value)}
              style={{ padding: '7px 10px', borderRadius: '8px', border: '0.5px solid #ccc', fontSize: '13px' }}>
                <option value="$">$ — Under $10</option>
                <option value="$$">$$ — $10–$25</option>
                <option value="$$$">$$$ — $25–$50</option>
                <option value="$$$$">$$$$ — $50+</option>
            </select>
          </div>
        </div>

        <div style={{ background: '#fff', border: '0.5px solid #e0dfd8', borderRadius: '12px', padding: '16px 20px', marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Cuisine & atmosphere</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#666', marginBottom: '3px' }}>Broad category</label>
              <select value={form.cuisineBroad} onChange={e => update('cuisineBroad', e.target.value)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '0.5px solid #ccc', fontSize: '13px' }}>
                <option value="">Select...</option>
                {['American', 'Asian', 'European', 'Latin', 'Mediterranean', 'Indian', 'Middle Eastern', 'African', 'Fast Food', 'Cafe/Bakery'].map(b => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
           <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#666', marginBottom: '3px' }}>Specific cuisine</label>
              <select
                value={showCuisineOther ? 'other' : form.cuisineSpecific}
                onChange={e => {
                  if (e.target.value === 'other') {
                    setShowCuisineOther(true)
                    update('cuisineSpecific', '')
                  } else {
                    setShowCuisineOther(false)
                    update('cuisineSpecific', e.target.value)
                  }
                }}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '0.5px solid #ccc', fontSize: '13px', marginBottom: showCuisineOther ? '6px' : '0' }}>
                <option value="">Select...</option>
                {cuisinesList
                  .filter(c => !form.cuisineBroad || c.broad === form.cuisineBroad)
                  .map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                <option value="other">Other — not listed</option>
              </select>
              {showCuisineOther && (
                <input
                  type="text"
                  value={form.cuisineSpecific}
                  onChange={e => update('cuisineSpecific', e.target.value)}
                  placeholder="Describe your cuisine type..."
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '0.5px solid #D85A30', fontSize: '13px' }}
                />
              )}
              {showCuisineOther && (
                <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                  We'll review your cuisine type and add it to our list.
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#666', marginBottom: '3px' }}>Atmosphere</label>
            <select value={form.atmosphere} onChange={e => update('atmosphere', e.target.value)}
              style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '0.5px solid #ccc', fontSize: '13px' }}>
              <option value="">Select...</option>
              {['Casual', 'Fine Dining', 'Fast Casual', 'Bar/Pub', 'Cafe', 'Food Truck'].map(a => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#666', marginBottom: '6px' }}>Dietary options</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { field: 'vegetarianFriendly', label: 'Vegetarian friendly' },
                { field: 'veganFriendly', label: 'Vegan friendly' },
                { field: 'glutenFreeFriendly', label: 'Gluten-free friendly' },
                { field: 'halalFriendly', label: 'Halal friendly' },
                { field: 'kosherFriendly', label: 'Kosher friendly' },
              ].map(({ field, label }) => (
                <label key={field} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form[field] || false}
                    onChange={e => update(field, e.target.checked)} />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', border: '0.5px solid #e0dfd8', borderRadius: '12px', padding: '16px 20px', marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Service modes</div>
          {[
            { field: 'eatIn', label: 'Eat in' },
            { field: 'takeOut', label: 'Take out' },
            { field: 'delivery', label: 'Delivery' },
          ].map(({ field, label }) => (
            <div key={field} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <input
                type="checkbox"
                checked={form[field]}
                onChange={e => update(field, e.target.checked)}
                style={{ width: '14px', height: '14px', cursor: 'pointer' }}
              />
              <label style={{ fontSize: '13px', cursor: 'pointer' }}>{label}</label>
            </div>
          ))}
          {form.delivery && (
            <div style={{ marginTop: '8px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#666', marginBottom: '3px' }}>Delivery URL</label>
              <input
                type="text"
                value={form.deliveryUrl}
                onChange={e => update('deliveryUrl', e.target.value)}
                placeholder="e.g. doordash.com/store/..."
                style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '0.5px solid #ccc', fontSize: '13px' }}
              />
            </div>
          )}
        </div>

        <div style={{ background: '#fff', border: '0.5px solid #e0dfd8', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Hours</div>
          {DAYS.map(day => (
            <div key={day} style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#666' }}>{day}</span>
              <input
                type="text"
                value={form.hours[day] || ''}
                onChange={e => updateHours(day, e.target.value)}
                placeholder="e.g. 11am–9pm or Closed"
                style={{ padding: '5px 8px', borderRadius: '6px', border: '0.5px solid #ccc', fontSize: '12px' }}
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{ padding: '9px 24px', background: saved ? '#639922' : '#D85A30', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s' }}>
          {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}