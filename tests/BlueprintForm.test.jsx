import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import BlueprintForm from '../src/components/BlueprintForm.jsx'

describe('BlueprintForm', () => {
  it('submits the form with parsed points', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<BlueprintForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText(/Author/i), { target: { value: 'john' } })
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'house' } })
    fireEvent.change(screen.getByLabelText(/Points/i), {
      target: { value: '[{"x":1,"y":2}]' },
    })
    await act(async () => {
      fireEvent.submit(screen.getByText(/Save/i))
    })

    expect(onSubmit).toHaveBeenCalledWith({
      author: 'john',
      name: 'house',
      points: [{ x: 1, y: 2 }],
    })
  })
})
