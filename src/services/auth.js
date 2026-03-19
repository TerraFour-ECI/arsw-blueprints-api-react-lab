const TOKEN_KEY = 'token'
const USERNAME_KEY = 'username'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUsername() {
  return localStorage.getItem(USERNAME_KEY)
}

function parseJwtPayload(token) {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length < 2) return null

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

export function getUsernameFromToken(token) {
  const payload = parseJwtPayload(token)
  return payload?.sub || null
}

export function getCurrentUser() {
  const token = getToken()
  const username = getStoredUsername() || getUsernameFromToken(token)
  if (!token || !username) return null
  return { username, token }
}

export function setSession(token, fallbackUsername) {
  const username = getUsernameFromToken(token) || fallbackUsername || 'user'
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USERNAME_KEY, username)
  return { username, token }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USERNAME_KEY)
}
