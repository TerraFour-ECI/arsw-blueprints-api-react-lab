import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import ProfilePage from '../src/pages/ProfilePage.jsx'

describe('ProfilePage', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('token', 'jwt-token')
    localStorage.setItem('username', 'student')
  })

  it('initializes display name from current user', () => {
    render(<ProfilePage />)

    expect(screen.getByDisplayValue('student')).toBeInTheDocument()
  })

  it('saves profile name and emits auth-changed event', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')
    render(<ProfilePage />)

    fireEvent.change(screen.getByLabelText(/Display name/i), {
      target: { value: 'Student Updated' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Save changes/i }))

    expect(localStorage.getItem('username')).toBe('Student Updated')
    expect(screen.getByText(/Profile updated locally/i)).toBeInTheDocument()
    expect(dispatchSpy).toHaveBeenCalled()

    dispatchSpy.mockRestore()
  })

  it('falls back to user when display name is empty', () => {
    render(<ProfilePage />)

    fireEvent.change(screen.getByLabelText(/Display name/i), {
      target: { value: '   ' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Save changes/i }))

    expect(localStorage.getItem('username')).toBe('user')
  })
})
