import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import ChangePasswordPage from '../src/pages/ChangePasswordPage.jsx'

describe('ChangePasswordPage', () => {
  it('shows validation message when fields are missing', () => {
    render(<ChangePasswordPage />)

    fireEvent.click(screen.getByRole('button', { name: /Update password/i }))

    expect(screen.getByText(/Fill all password fields/i)).toBeInTheDocument()
  })

  it('shows success message and resets fields when both passwords are provided', () => {
    render(<ChangePasswordPage />)

    const currentInput = screen.getByLabelText(/Current password/i)
    const newInput = screen.getByLabelText(/New password/i)

    fireEvent.change(currentInput, { target: { value: 'old123' } })
    fireEvent.change(newInput, { target: { value: 'new456' } })
    fireEvent.click(screen.getByRole('button', { name: /Update password/i }))

    expect(screen.getByText(/Password change request sent/i)).toBeInTheDocument()
    expect(currentInput).toHaveValue('')
    expect(newInput).toHaveValue('')
  })
})