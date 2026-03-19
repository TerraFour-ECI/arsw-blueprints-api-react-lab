import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
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

  it('shows required-fields error when author or name are missing', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<BlueprintForm onSubmit={onSubmit} />)

    await act(async () => {
      fireEvent.submit(screen.getByText(/Save/i))
    })

    expect(screen.getByText(/Author and name are required/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows invalid JSON error when points payload is malformed', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<BlueprintForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText(/Author/i), { target: { value: 'john' } })
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'house' } })
    fireEvent.change(screen.getByLabelText(/Points/i), {
      target: { value: '{not-json}' },
    })

    await act(async () => {
      fireEvent.submit(screen.getByText(/Save/i))
    })

    expect(screen.getByText(/Invalid points JSON/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows array validation error when parsed points are not an array', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<BlueprintForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText(/Author/i), { target: { value: 'john' } })
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'house' } })
    fireEvent.change(screen.getByLabelText(/Points/i), {
      target: { value: '{"x":1,"y":2}' },
    })

    await act(async () => {
      fireEvent.submit(screen.getByText(/Save/i))
    })

    expect(screen.getByText(/Points must be a JSON array/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('resets fields after successful submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<BlueprintForm onSubmit={onSubmit} />)

    const authorInput = screen.getByLabelText(/Author/i)
    const nameInput = screen.getByLabelText(/Name/i)
    const pointsInput = screen.getByLabelText(/Points/i)

    fireEvent.change(authorInput, { target: { value: 'john' } })
    fireEvent.change(nameInput, { target: { value: 'house' } })
    fireEvent.change(pointsInput, {
      target: { value: '[{"x":4,"y":8}]' },
    })

    await act(async () => {
      fireEvent.submit(screen.getByText(/Save/i))
    })

    await waitFor(() => {
      expect(authorInput).toHaveValue('')
      expect(nameInput).toHaveValue('')
      expect(pointsInput).toHaveValue('[{"x":10,"y":10},{"x":40,"y":60}]')
    })
  })
})
