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
  const [menu, setMenu] = useState(null)
  const [hasTier, setHasTier] = useState(false)
  const [tierName, setTierName] = useState('Free')
  const [menuUploading, setMenuUploading] = useState(false)
  const [menuDeleting, setMenuDeleting] = useState(false)
  const [cuisinesList, setCuisinesList] = useState([])
  const [cuisineGroups, setCuisineGroups] = useState([])
  const [cuisineOther, setCuisineOther] = useState('')
  const [showCuisineOther, setShowCuisineOther] = useState(false)
  const [secondaryCuisineIds, setSecondaryCuisineIds] = useState([])
  const [cuisineDirty, setCuisineDirty] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/owner/restaurants/${id}`)
        const r = res.data
        // Load menu info
        try {
          const menuRes = await api.get(`/owner/restaurants/${id}/menu`)
          setMenu(menuRes.data.menu)
          setHasTier(menuRes.data.hasTier)
          setTierName(menuRes.data.tierName || 'Free')
        } catch (e) { /* no menu yet */ }
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
          servesBeer: r.servesBeer || false,
          servesWine: r.servesWine || false,
          servesCocktails: r.servesCocktails || false,
        })
          try {
            const cuisineRes = await fetch('https://api.findurdinner.com/cuisines')
            const cuisines = await cuisineRes.json()
            setCuisinesList(cuisines)
            const groupRes = await fetch('https://api.findurdinner.com/cuisines/grouped')
            const groups = await groupRes.json()
            setCuisineGroups(groups)
            // Pre-populate secondary cuisines from existing data
            setSecondaryCuisineIds(r.cuisines?.map(c => c.cuisineId) || [])
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
      await api.patch(`/owner/restaurants/${id}`, {
        ...form,
        ...(cuisineDirty ? { cuisineIds: secondaryCuisineIds } : {}),
      })
      
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
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#666', marginBottom: '6px' }}>
              Additional cuisines
              <span style={{ fontWeight: 400, color: '#aaa', marginLeft: '6px' }}>e.g. an Italian restaurant that also serves pizza</span>
            </label>
            {cuisineGroups.map(group => {
              const groupCuisines = group.cuisines.filter(c => c.name !== form.cuisineSpecific)
              if (!groupCuisines.length) return null
              return (
                <div key={group.broad} style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '4px' }}>{group.broad}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {groupCuisines.map(c => {
                      const sel = secondaryCuisineIds.includes(c.id)
                      return (
                        <button key={c.id} type="button"
                          onClick={() => {
                            setCuisineDirty(true)
                            setSecondaryCuisineIds(prev =>
                              prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id]
                            )
                          }}
                          style={{
                            padding: '3px 10px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer',
                            border: `1px solid ${sel ? '#D85A30' : '#ddd'}`,
                            background: sel ? '#FAECE7' : '#f9f9f9',
                            color: sel ? '#993C1D' : '#666',
                            fontWeight: sel ? 600 : 400,
                          }}>
                          {c.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
            {secondaryCuisineIds.length > 0 && (
              <button type="button" onClick={() => { setCuisineDirty(true); setSecondaryCuisineIds([]) }}
                style={{ fontSize: '11px', color: '#D85A30', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: '4px' }}>
                Clear all
              </button>
            )}
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

            <div style={{ marginTop: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#666', marginBottom: '6px' }}>Drinks served</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { field: 'servesBeer', label: '🍺 Beer' },
                  { field: 'servesWine', label: '🍷 Wine' },
                  { field: 'servesCocktails', label: '🍸 Cocktails' },
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hours</div>
            {tierName === 'Free' && (
              <span style={{ fontSize: '11px', color: '#D85A30' }}>Subscriber feature</span>
            )}
          </div>
          {tierName === 'Free' ? (
            <div>
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>
                Update your hours to appear higher in spin results when you're open. Available with the <strong>Subscriber</strong> plan.
              </div>
              <button type="button" onClick={async () => {
                try {
                  const res = await api.post('/stripe/create-checkout', { tierName: 'Subscriber', restaurantId: id })
                  window.location.href = res.data.url
                } catch (err) { alert('Failed to start checkout') }
              }}
                style={{ padding: '7px 14px', background: '#D85A30', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                Upgrade to Subscriber — $9/mo
              </button>
            </div>
          ) : (
            DAYS.map(day => (
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
            ))
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{ padding: '9px 24px', background: saved ? '#639922' : '#D85A30', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s' }}>
          {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save changes'}
        </button>
      </form>

      {/* Menu section */}
      <div style={{ background: '#fff', border: '0.5px solid #e0dfd8', borderRadius: '12px', padding: '16px 20px', marginTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Menu</div>
            {!hasTier && (
              <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                Upload your menu with the <strong>Subscriber tier</strong> ($9/mo)
              </div>
            )}
          </div>
          {!hasTier && (
            <button
              onClick={async () => {
                try {
                  const res = await api.post('/stripe/create-checkout', { tierName: 'Subscriber', restaurantId: id })
                  window.location.href = res.data.url
                } catch (err) { alert('Failed to start checkout') }
              }}
              style={{ padding: '7px 14px', background: '#378ADD', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              Upgrade to Subscriber — $9/mo
            </button>
          )}
        </div>

        {hasTier && (
          <div>
            {menu?.pdfUrl ? (
              <div>
                {/* Menu preview */}
                <img
                  src={menu.pdfUrl}
                  alt="Menu page 1"
                  style={{ width: '100%', borderRadius: '8px', border: '0.5px solid #e0dfd8', marginBottom: '8px' }}
                />
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>
                  {menu.pageCount} page{menu.pageCount !== 1 ? 's' : ''} · Last updated {new Date(menu.updatedAt).toLocaleDateString()}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <label style={{ padding: '7px 14px', background: '#f5f4f0', border: '0.5px solid #ddd', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}>
                    Replace menu
                    <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={async e => {
                      const file = e.target.files[0]
                      if (!file) return
                      setMenuUploading(true)
                      const fd = new FormData()
                      fd.append('menu', file)
                      try {
                        const res = await api.post(`/owner/restaurants/${id}/menu/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
                        setMenu(res.data.menu)
                      } catch (err) { alert('Upload failed — make sure the file is a PDF under 30MB') }
                      setMenuUploading(false)
                      e.target.value = ''
                    }} />
                  </label>
                  <button
                    onClick={async () => {
                      if (!confirm('Remove your menu?')) return
                      setMenuDeleting(true)
                      try {
                        await api.delete(`/owner/restaurants/${id}/menu`)
                        setMenu(null)
                      } catch (err) { alert('Failed to remove menu') }
                      setMenuDeleting(false)
                    }}
                    disabled={menuDeleting}
                    style={{ padding: '7px 14px', background: '#fff', border: '0.5px solid #ddd', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', color: '#888' }}>
                    {menuDeleting ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                  Upload your menu as a PDF. It will be displayed as images in the FindUrDinner app — customers see your original menu with all its formatting and photos.
                </div>
                <label style={{
                  display: 'inline-block', padding: '9px 20px',
                  background: menuUploading ? '#eee' : '#D85A30',
                  color: menuUploading ? '#999' : '#fff',
                  border: 'none', borderRadius: '8px', fontSize: '13px',
                  fontWeight: 600, cursor: menuUploading ? 'default' : 'pointer'
                }}>
                  {menuUploading ? 'Uploading...' : '📄 Upload menu PDF'}
                  <input type="file" accept=".pdf" style={{ display: 'none' }} disabled={menuUploading}
                    onChange={async e => {
                      const file = e.target.files[0]
                      if (!file) return
                      setMenuUploading(true)
                      const fd = new FormData()
                      fd.append('menu', file)
                      try {
                        const res = await api.post(`/owner/restaurants/${id}/menu/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
                        setMenu(res.data.menu)
                      } catch (err) { alert('Upload failed — make sure the file is a PDF under 30MB') }
                      setMenuUploading(false)
                      e.target.value = ''
                    }} />
                </label>
                <div style={{ fontSize: '11px', color: '#aaa', marginTop: '8px' }}>PDF only · Max 30MB</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}