import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import App from '../src/App.jsx'

vi.mock('../src/pages/BlueprintsPage.jsx', () => ({
  default: () => <div>blueprints page</div>,
}))

vi.mock('../src/pages/BlueprintDetailPage.jsx', () => ({
  default: () => <div>blueprint detail page</div>,
}))

vi.mock('../src/pages/LoginPage.jsx', () => ({
  default: () => <div>login page</div>,
}))

vi.mock('../src/pages/NotFound.jsx', () => ({
  default: () => <div>not found page</div>,
}))

describe('App routing', () => {
  it('shows user menu with username when session exists', () => {
    localStorage.setItem('token', 'jwt-token')
    localStorage.setItem('username', 'student')

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByText('student')).toBeInTheDocument()
  })

  it('opens menu and navigates to profile', () => {
    localStorage.setItem('token', 'jwt-token')
    localStorage.setItem('username', 'student')

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /student/i }))
    fireEvent.click(screen.getByText(/Edit profile/i))

    expect(screen.getByText(/Edit profile/i)).toBeInTheDocument()
  })

  it('logs out and sends user to login view', () => {
    localStorage.setItem('token', 'jwt-token')
    localStorage.setItem('username', 'student')

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /student/i }))
    fireEvent.click(screen.getByRole('button', { name: /Logout/i }))

    expect(localStorage.getItem('token')).toBeNull()
    expect(screen.getByText(/login page/i)).toBeInTheDocument()
  })

  it('shows login page route', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByText(/login page/i)).toBeInTheDocument()
  })

  it('redirects protected root route to login when token is missing', () => {
    localStorage.removeItem('token')

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByText(/login page/i)).toBeInTheDocument()
  })

  it('renders protected detail route when token exists', () => {
    localStorage.setItem('token', 'jwt-token')

    render(
      <MemoryRouter initialEntries={['/blueprints/john/house']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByText(/blueprint detail page/i)).toBeInTheDocument()
  })

  it('renders protected change-password route when token exists', () => {
    localStorage.setItem('token', 'jwt-token')
    localStorage.setItem('username', 'student')

    render(
      <MemoryRouter initialEntries={['/change-password']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByText(/Change password/i)).toBeInTheDocument()
  })

  it('renders not found route', () => {
    render(
      <MemoryRouter initialEntries={['/unknown-route']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByText(/not found page/i)).toBeInTheDocument()
  })
})
