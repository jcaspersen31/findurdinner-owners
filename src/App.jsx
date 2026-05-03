import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { isLoggedIn, clearToken, getOwner } from './auth.js'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import RestaurantEdit from './pages/RestaurantEdit'
import Coverage from './pages/Coverage'

function RequireAuth({ children }) {
  const location = useLocation()
  if (!isLoggedIn()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}

function OwnerLayout({ children }) {
  const navigate = useNavigate()
  const owner = getOwner()

  function logout() {
    clearToken()
    navigate('/login')
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f9f9f8' }}>
      <div style={{ background: '#fff', borderBottom: '0.5px solid #e0dfd8', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontWeight: 500, fontSize: '15px' }}>
          <span style={{ color: '#D85A30' }}>FindUr</span>Dinner
          <span style={{ fontSize: '11px', color: '#888', marginLeft: '6px' }}>Owner portal</span>
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#888' }}>{owner?.name}</span>
        <button onClick={() => navigate('/coverage')}
          style={{ fontSize: '12px', padding: '4px 12px', border: '0.5px solid #ccc', borderRadius: '6px', background: '#fff', cursor: 'pointer', color: '#666' }}>
          Coverage
        </button>
        <button
          onClick={logout}
          style={{ fontSize: '12px', padding: '4px 12px', border: '0.5px solid #ccc', borderRadius: '6px', background: '#fff', cursor: 'pointer', color: '#666' }}>
          Sign out
        </button>
      </div>
      <div style={{ padding: '24px', maxWidth: '720px', margin: '0 auto' }}>{children}</div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/coverage" element={<Coverage />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <OwnerLayout>
              <Dashboard />
            </OwnerLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/restaurant/:id"
        element={
          <RequireAuth>
            <OwnerLayout>
              <RestaurantEdit />
            </OwnerLayout>
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/register" replace />} />
    </Routes>
  )
}