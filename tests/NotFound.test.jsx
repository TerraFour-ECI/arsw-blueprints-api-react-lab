import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import NotFound from '../src/pages/NotFound.jsx'

describe('NotFound page', () => {
  it('renders 404 message', () => {
    render(<NotFound />)
    expect(screen.getByText(/404: Page not found/i)).toBeInTheDocument()
  })
})