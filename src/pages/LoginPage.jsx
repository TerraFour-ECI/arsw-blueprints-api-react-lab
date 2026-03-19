import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/apiClient.js'
import { getToken, setSession } from '../services/auth.js'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const getAuthBaseUrl = () => {
  if (apiBaseUrl.endsWith('/api')) {
    return apiBaseUrl.slice(0, -4)
  }
  return apiBaseUrl
}

const requestLogin = async (credentials) => {
  const authBaseUrl = getAuthBaseUrl()
  const candidates = [
    `${authBaseUrl}/auth/login`,
    '/auth/login',
  ]

  let lastError = null
  for (const endpoint of candidates) {
    try {
      return await api.post(endpoint, credentials)
    } catch (e) {
      lastError = e
      const status = e?.response?.status
      // Stop early for auth failures; only continue on route-not-found style issues.
      if (status && status !== 404) {
        throw e
      }
    }
  }

  throw lastError || new Error('Unable to reach auth endpoint')
}

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (getToken()) {
      navigate('/', { replace: true })
    }
  }, [navigate])

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const { data } = await requestLogin({ username, password })
      const token = data?.access_token || data?.token
      if (!token) {
        throw new Error('Token missing in response')
      }
      setSession(token, username)
      window.dispatchEvent(new Event('auth-changed'))
      alert('Login successful')
      navigate('/', { replace: true })
    } catch (e) {
      setError('Invalid credentials or server unavailable')
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2 style={{ marginTop: 0 }}>Login</h2>
      <div className="grid cols-2">
        <div>
          <label>Username</label>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      <button className="btn primary" style={{ marginTop: 12 }}>
        Sign in
      </button>
    </form>
  )
}
