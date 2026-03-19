import { useEffect, useState } from 'react'
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import BlueprintsPage from './pages/BlueprintsPage.jsx'
import BlueprintDetailPage from './pages/BlueprintDetailPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotFound from './pages/NotFound.jsx'
import PrivateRoute from './components/PrivateRoute.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import ChangePasswordPage from './pages/ChangePasswordPage.jsx'
import { clearSession, getCurrentUser } from './services/auth.js'

export default function App() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser())
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const syncAuth = () => setCurrentUser(getCurrentUser())
    window.addEventListener('auth-changed', syncAuth)
    window.addEventListener('storage', syncAuth)
    return () => {
      window.removeEventListener('auth-changed', syncAuth)
      window.removeEventListener('storage', syncAuth)
    }
  }, [])

  const logout = () => {
    clearSession()
    setCurrentUser(null)
    setMenuOpen(false)
    navigate('/login')
  }

  return (
    <div className="container">
      <header className="app-header">
        <div>
          <h1>ECI Blueprints Studio</h1>
          <p className="muted" style={{ marginTop: 4, marginBottom: 0 }}>
            React + Redux Toolkit + Canvas + JWT-ready API client
          </p>
        </div>
        <nav className="main-nav">
          <NavLink to="/" end>
            Blueprints
          </NavLink>
          {!currentUser && <NavLink to="/login">Login</NavLink>}
          {currentUser && (
            <div className="user-menu-wrap">
              <button
                className="user-menu-button"
                onClick={() => setMenuOpen((v) => !v)}
                type="button"
              >
                <span className="user-avatar">U</span>
                <span>{currentUser.username}</span>
              </button>
              {menuOpen && (
                <div className="user-menu-popover">
                  <NavLink to="/profile" onClick={() => setMenuOpen(false)}>
                    Edit profile
                  </NavLink>
                  <NavLink to="/change-password" onClick={() => setMenuOpen(false)}>
                    Change password
                  </NavLink>
                  <button className="user-menu-logout" onClick={logout} type="button">
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </header>
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <BlueprintsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/blueprints/:author/:name"
          element={
            <PrivateRoute>
              <BlueprintDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <PrivateRoute>
              <ChangePasswordPage />
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}
