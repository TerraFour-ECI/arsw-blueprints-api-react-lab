import { useState } from 'react'
import { getCurrentUser } from '../services/auth.js'

export default function ProfilePage() {
  const current = getCurrentUser()
  const [displayName, setDisplayName] = useState(current?.username || '')
  const [message, setMessage] = useState('')

  const onSubmit = (e) => {
    e.preventDefault()
    localStorage.setItem('username', displayName.trim() || 'user')
    window.dispatchEvent(new Event('auth-changed'))
    setMessage('Profile updated locally.')
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      <h2 style={{ marginTop: 0 }}>Edit profile</h2>
      <p className="muted">This updates your local UI profile name.</p>
      <label htmlFor="display-name">Display name</label>
      <input
        id="display-name"
        className="input"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
      />
      {message && <p className="form-success">{message}</p>}
      <button className="btn primary" style={{ marginTop: 12 }}>
        Save changes
      </button>
    </form>
  )
}
