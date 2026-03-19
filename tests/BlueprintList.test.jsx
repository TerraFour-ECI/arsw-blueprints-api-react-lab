import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import BlueprintList from '../src/components/BlueprintList.jsx'

describe('BlueprintList', () => {
  it('renders empty state when items are missing', () => {
    render(<BlueprintList items={[]} onSelect={vi.fn()} />)
    expect(screen.getByText(/No blueprints found for this author/i)).toBeInTheDocument()
  })

  it('renders cards and calls onSelect', () => {
    const onSelect = vi.fn()
    const items = [
      { author: 'john', name: 'house', points: [{ x: 1, y: 1 }] },
      {
        author: 'john',
        name: 'kite',
        points: [
          { x: 2, y: 2 },
          { x: 3, y: 3 },
        ],
      },
    ]

    render(<BlueprintList items={items} onSelect={onSelect} />)

    expect(screen.getByText('house')).toBeInTheDocument()
    expect(screen.getByText('kite')).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: /View details/i })[0])

    expect(onSelect).toHaveBeenCalledWith(items[0])
  })

  it('shows zero points when a blueprint has no points array', () => {
    render(<BlueprintList items={[{ author: 'maria', name: 'bridge' }]} onSelect={vi.fn()} />)

    expect(screen.getByText(/Points:/i)).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})
