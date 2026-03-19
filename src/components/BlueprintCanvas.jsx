import { useEffect, useRef } from 'react'

export default function BlueprintCanvas({ points = [], width = 520, height = 360 }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#0b1220'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = 'rgba(148,163,184,0.15)'
    ctx.lineWidth = 1
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    const normalized = points.map((point) => ({ x: Number(point.x), y: Number(point.y) }))

    const bounds = normalized.reduce(
      (acc, point) => ({
        minX: Math.min(acc.minX, point.x),
        minY: Math.min(acc.minY, point.y),
        maxX: Math.max(acc.maxX, point.x),
        maxY: Math.max(acc.maxY, point.y),
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
    )

    const hasValidBounds = Number.isFinite(bounds.minX)
    const drawAreaWidth = canvas.width - 48
    const drawAreaHeight = canvas.height - 48
    const scaleX = hasValidBounds ? drawAreaWidth / Math.max(bounds.maxX - bounds.minX, 1) : 1
    const scaleY = hasValidBounds ? drawAreaHeight / Math.max(bounds.maxY - bounds.minY, 1) : 1
    const scale = Math.min(scaleX, scaleY)

    const mapPoint = (point) => ({
      x: hasValidBounds ? 24 + (point.x - bounds.minX) * scale : point.x,
      y: hasValidBounds ? 24 + (point.y - bounds.minY) * scale : point.y,
    })

    if (normalized.length > 1) {
      ctx.strokeStyle = '#93c5fd'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      const first = mapPoint(normalized[0])
      ctx.moveTo(first.x, first.y)
      for (let i = 1; i < normalized.length; i++) {
        const p = mapPoint(normalized[i])
        ctx.lineTo(p.x, p.y)
      }
      ctx.stroke()
    }
    ctx.fillStyle = '#fbbf24'
    for (const p of normalized) {
      const mapped = mapPoint(p)
      ctx.beginPath()
      ctx.arc(mapped.x, mapped.y, 4.6, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [points])

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      style={{
        background: '#0b1220',
        border: '1px solid #334155',
        borderRadius: 12,
        width: '100%',
        maxWidth: width,
      }}
    />
  )
}
