import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BlueprintForm from '../src/components/BlueprintForm.jsx'

describe('BlueprintForm', () => {
  it('submits the form with parsed points', () => {
    const onSubmit = vi.fn()
    render(<BlueprintForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText(/Author/i), { target: { value: 'john' } })
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'house' } })
    fireEvent.change(screen.getByLabelText(/Points/i), {
      target: { value: '[{"x":1,"y":2}]' },
    })
    fireEvent.submit(screen.getByText(/Save/i))

    expect(onSubmit).toHaveBeenCalledWith({
      author: 'john',
      name: 'house',
      points: [{ x: 1, y: 2 }],
    })
  })
})
