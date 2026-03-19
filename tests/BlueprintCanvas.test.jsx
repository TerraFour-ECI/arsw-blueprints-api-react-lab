import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
import BlueprintCanvas from '../src/components/BlueprintCanvas.jsx'

describe('BlueprintCanvas', () => {
  it('renders a canvas and calls getContext', () => {
    const spy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
    const { container } = render(
      <BlueprintCanvas
        points={[
          { x: 10, y: 10 },
          { x: 50, y: 60 },
        ]}
      />,
    )
    expect(container.querySelector('canvas')).toBeInTheDocument()
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('calls onAddPoint with click coordinates when there are no points', () => {
    const onAddPoint = vi.fn()
    const { container } = render(<BlueprintCanvas points={[]} onAddPoint={onAddPoint} />)
    const canvas = container.querySelector('canvas')

    canvas.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      width: 520,
      height: 360,
    })

    fireEvent.click(canvas, { clientX: 100, clientY: 80 })

    expect(onAddPoint).toHaveBeenCalledWith({ x: 100, y: 80 })
  })

  it('does not fail when clicking without onAddPoint handler', () => {
    const { container } = render(<BlueprintCanvas points={[]} />)
    const canvas = container.querySelector('canvas')
    expect(() => fireEvent.click(canvas, { clientX: 10, clientY: 10 })).not.toThrow()
  })

  it('reverse-maps click coordinates when bounds/scaling are active', () => {
    const onAddPoint = vi.fn()
    const points = [
      { x: 10, y: 10 },
      { x: 20, y: 20 },
    ]

    const { container } = render(<BlueprintCanvas points={points} onAddPoint={onAddPoint} />)
    const canvas = container.querySelector('canvas')

    canvas.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      width: 520,
      height: 360,
    })

    fireEvent.click(canvas, { clientX: 24, clientY: 24 })

    expect(onAddPoint).toHaveBeenCalledWith({ x: 10, y: 10 })
  })

  it('renders safely when only one point exists', () => {
    const { container } = render(<BlueprintCanvas points={[{ x: 5, y: 5 }]} />)
    expect(container.querySelector('canvas')).toBeInTheDocument()
  })

  it('returns early when canvas context is unavailable', () => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null)

    const { container } = render(<BlueprintCanvas points={[{ x: 1, y: 1 }]} />)
    expect(container.querySelector('canvas')).toBeInTheDocument()

    HTMLCanvasElement.prototype.getContext = original
  })
})
