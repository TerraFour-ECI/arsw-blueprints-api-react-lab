import { describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import PrivateRoute from '../src/components/PrivateRoute.jsx'

describe('PrivateRoute', () => {
  it('redirects to login when token is missing', () => {
    localStorage.removeItem('token')

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <div>private content</div>
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<div>login page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText(/login page/i)).toBeInTheDocument()
  })

  it('renders children when token exists', () => {
    localStorage.setItem('token', 'demo-token')

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <div>private content</div>
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<div>login page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText(/private content/i)).toBeInTheDocument()
  })
})
