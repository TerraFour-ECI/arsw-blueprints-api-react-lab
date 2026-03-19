import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import LoginPage from '../src/pages/LoginPage.jsx'
import api from '../src/services/apiClient.js'

vi.mock('../src/services/apiClient.js', () => ({
  default: {
    post: vi.fn(),
  },
}))

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('stores access_token and shows success alert after login', async () => {
    api.post.mockResolvedValue({ data: { access_token: 'jwt-token' } })
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    const { container } = render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    const [usernameInput, passwordInput] = container.querySelectorAll('input')
    fireEvent.change(usernameInput, { target: { value: 'camilo' } })
    fireEvent.change(passwordInput, { target: { value: 'password' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('http://localhost:8080/auth/login', {
        username: 'camilo',
        password: 'password',
      })
      expect(localStorage.getItem('token')).toBe('jwt-token')
      expect(alertSpy).toHaveBeenCalledWith('Login successful')
    })

    alertSpy.mockRestore()
  })

  it('shows error message when login fails', async () => {
    api.post.mockRejectedValue(new Error('invalid credentials'))

    const { container } = render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    const [usernameInput, passwordInput] = container.querySelectorAll('input')
    fireEvent.change(usernameInput, { target: { value: 'camilo' } })
    fireEvent.change(passwordInput, { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))

    expect(
      await screen.findByText(/Invalid credentials or server unavailable/i),
    ).toBeInTheDocument()
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('falls back to /auth/login when absolute auth endpoint returns 404', async () => {
    api.post
      .mockRejectedValueOnce({ response: { status: 404 } })
      .mockResolvedValueOnce({ data: { token: 'fallback-token' } })

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    const { container } = render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    const [usernameInput, passwordInput] = container.querySelectorAll('input')
    fireEvent.change(usernameInput, { target: { value: 'student' } })
    fireEvent.change(passwordInput, { target: { value: 'student123' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))

    await waitFor(() => {
      expect(api.post).toHaveBeenNthCalledWith(1, 'http://localhost:8080/auth/login', {
        username: 'student',
        password: 'student123',
      })
      expect(api.post).toHaveBeenNthCalledWith(2, '/auth/login', {
        username: 'student',
        password: 'student123',
      })
      expect(localStorage.getItem('token')).toBe('fallback-token')
      expect(alertSpy).toHaveBeenCalledWith('Login successful')
    })

    alertSpy.mockRestore()
  })

  it('shows error when login response does not include token fields', async () => {
    api.post.mockResolvedValue({ data: { token_type: 'Bearer' } })

    const { container } = render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    const [usernameInput, passwordInput] = container.querySelectorAll('input')
    fireEvent.change(usernameInput, { target: { value: 'student' } })
    fireEvent.change(passwordInput, { target: { value: 'student123' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))

    expect(
      await screen.findByText(/Invalid credentials or server unavailable/i),
    ).toBeInTheDocument()
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('redirects away from login when session token already exists', () => {
    localStorage.setItem('token', 'jwt-token')

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div>home page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText(/home page/i)).toBeInTheDocument()
  })
})
