import { useState } from 'react'

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')

  const onSubmit = (e) => {
    e.preventDefault()
    if (!currentPassword || !newPassword) {
      setMessage('Fill all password fields.')
      return
    }

    setMessage('Password change request sent (UI demo).')
    setCurrentPassword('')
    setNewPassword('')
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      <h2 style={{ marginTop: 0 }}>Change password</h2>
      <p className="muted">Backend endpoint is optional for this lab UI.</p>

      <label htmlFor="current-password">Current password</label>
      <input
        id="current-password"
        className="input"
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />

      <label htmlFor="new-password" style={{ marginTop: 12, display: 'block' }}>
        New password
      </label>
      <input
        id="new-password"
        className="input"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      {message && <p className="form-success">{message}</p>}

      <button className="btn primary" style={{ marginTop: 12 }}>
        Update password
      </button>
    </form>
  )
}