import { NavLink, Route, Routes } from 'react-router-dom'
import BlueprintsPage from './pages/BlueprintsPage.jsx'
import BlueprintDetailPage from './pages/BlueprintDetailPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
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
          <NavLink to="/login">Login</NavLink>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<BlueprintsPage />} />
        <Route path="/blueprints/:author/:name" element={<BlueprintDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}
