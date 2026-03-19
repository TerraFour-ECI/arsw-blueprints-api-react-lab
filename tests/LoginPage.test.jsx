import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
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

  it('stores token and shows success alert after login', async () => {
    api.post.mockResolvedValue({ data: { token: 'jwt-token' } })
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    const { container } = render(<LoginPage />)

    const [usernameInput, passwordInput] = container.querySelectorAll('input')
    fireEvent.change(usernameInput, { target: { value: 'camilo' } })
    fireEvent.change(passwordInput, { target: { value: 'password' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
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

    const { container } = render(<LoginPage />)

    const [usernameInput, passwordInput] = container.querySelectorAll('input')
    fireEvent.change(usernameInput, { target: { value: 'camilo' } })
    fireEvent.change(passwordInput, { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))

    expect(await screen.findByText(/Invalid credentials or server unavailable/i)).toBeInTheDocument()
    expect(localStorage.getItem('token')).toBeNull()
  })
})