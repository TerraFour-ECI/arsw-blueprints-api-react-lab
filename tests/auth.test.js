import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearSession,
  getCurrentUser,
  getStoredUsername,
  getToken,
  getUsernameFromToken,
  setSession,
} from '../src/services/auth.js'

function makeToken(payloadObj) {
  const payload = btoa(JSON.stringify(payloadObj))
  return `h.${payload}.s`
}

describe('auth service', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('reads token and stored username keys', () => {
    localStorage.setItem('token', 'abc')
    localStorage.setItem('username', 'student')

    expect(getToken()).toBe('abc')
    expect(getStoredUsername()).toBe('student')
  })

  it('extracts username (sub) from JWT payload', () => {
    const token = makeToken({ sub: 'student' })
    expect(getUsernameFromToken(token)).toBe('student')
  })

  it('returns null when token is malformed or payload cannot be parsed', () => {
    expect(getUsernameFromToken('not-a-jwt')).toBeNull()
    expect(getUsernameFromToken('a.invalid-base64.b')).toBeNull()
  })

  it('builds current user from stored username or token subject', () => {
    const token = makeToken({ sub: 'student' })
    localStorage.setItem('token', token)

    expect(getCurrentUser()).toEqual({ username: 'student', token })

    localStorage.setItem('username', 'override-name')
    expect(getCurrentUser()).toEqual({ username: 'override-name', token })
  })

  it('returns null current user when token or username cannot be resolved', () => {
    localStorage.setItem('token', 'bad-token')
    expect(getCurrentUser()).toBeNull()

    localStorage.clear()
    expect(getCurrentUser()).toBeNull()
  })

  it('setSession stores parsed username, then fallback, then default user', () => {
    const parsedToken = makeToken({ sub: 'jwt-user' })
    const parsed = setSession(parsedToken, 'fallback')
    expect(parsed.username).toBe('jwt-user')
    expect(localStorage.getItem('username')).toBe('jwt-user')

    const badToken = 'bad-token'
    const fallback = setSession(badToken, 'fallback-name')
    expect(fallback.username).toBe('fallback-name')

    const defaultUser = setSession(badToken)
    expect(defaultUser.username).toBe('user')
  })

  it('clearSession removes auth keys', () => {
    localStorage.setItem('token', 'abc')
    localStorage.setItem('username', 'student')

    clearSession()

    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('username')).toBeNull()
  })
})