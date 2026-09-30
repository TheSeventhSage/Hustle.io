import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { formatCompactNumber, formatReportDate } from '../financialReport.utils.js'

const HEIGHT = 170
const PAD = { top: 8, right: 2, bottom: 8, left: 46 }
const TICKS = 4
const INNER_HEIGHT = HEIGHT - PAD.top - PAD.bottom
const BASELINE = PAD.top + INNER_HEIGHT

// Round tick step (1/2/2.5/5 × 10^n) so axis labels read 0, 1k, 2k… and the
// top tick sits just above the peak instead of leaving the chart half empty.
function niceScale(value, integerOnly) {
  if (value <= 0) return { step: 1, max: TICKS }
  const factors = integerOnly ? [1, 2, 5, 10] : [1, 2, 2.5, 5, 10]
  const raw = value / TICKS
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const ceilStep = factors.find((f) => f * magnitude >= raw) * magnitude
  const floorStep = [...factors].reverse().find((f) => f * magnitude <= raw) * magnitude
  let step = Math.ceil(value / floorStep) <= TICKS + 1 ? floorStep : ceilStep
  if (integerOnly) step = Math.max(1, Math.round(step))
  return { step, max: Math.ceil(value / step) * step }
}

// Catmull-Rom → cubic bezier for the smooth curve in the design. Control
// points are clamped to the baseline so the curve never dips below zero.
function smoothPath(points) {
  if (points.length < 2) return ''
  let d = `M${points[0].x},${points[0].y}`
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C${c1x},${Math.min(c1y, BASELINE)} ${c2x},${Math.min(c2y, BASELINE)} ${p2.x},${p2.y}`
  }
  return d
}

function useElementWidth() {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    setWidth(node.clientWidth)
    if (typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return [ref, width]
}

/**
 * TrendChart
 * Responsive SVG area chart for charts.revenue / charts.hustles.
 * series: Array<{ date: 'YYYY-MM-DD', value: number }>
 */
export function TrendChart({ series, formatValue = String, axisPrefix = '', emptyLabel = 'No activity in this period' }) {
  const [containerRef, width] = useElementWidth()
  const [hoverIndex, setHoverIndex] = useState(null)
  const gradientId = useId().replace(/:/g, '')

  const layout = useMemo(() => {
    if (!width || !series.length) return null
    const plotWidth = Math.max(width - PAD.left - PAD.right, 1)
    const values = series.map((point) => point.value)
    const { step, max } = niceScale(Math.max(...values), values.every(Number.isInteger))
    const stepX = series.length > 1 ? plotWidth / (series.length - 1) : 0

    const points = series.map((point, index) => ({
      ...point,
      x: PAD.left + (series.length > 1 ? index * stepX : plotWidth / 2),
      y: BASELINE - (point.value / max) * INNER_HEIGHT,
    }))

    const ticks = Array.from({ length: Math.round(max / step) + 1 }, (_, index) => {
      const value = step * index
      return { value, y: BASELINE - (value / max) * INNER_HEIGHT }
    })

    const line = smoothPath(points)
    const area = line
      ? `${line} L${points.at(-1).x},${BASELINE} L${points[0].x},${BASELINE} Z`
      : ''

    return { points, ticks, line, area }
  }, [series, width])

  const handleMove = (event) => {
    if (!layout) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - bounds.left
    let nearest = 0
    layout.points.forEach((point, index) => {
      if (Math.abs(point.x - x) < Math.abs(layout.points[nearest].x - x)) nearest = index
    })
    setHoverIndex(nearest)
  }

  const hovered = layout && hoverIndex !== null ? layout.points[hoverIndex] : null

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: HEIGHT }}>
      {!series.length ? (
        <div className="flex h-full items-center justify-center rounded-lg bg-mist/60 text-[12.5px] text-text-3">{emptyLabel}</div>
      ) : layout && (
        <>
          <svg
            width={width}
            height={HEIGHT}
            role="img"
            aria-label="Trend chart"
            onMouseMove={handleMove}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-success)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="var(--color-success)" stopOpacity="0.03" />
              </linearGradient>
            </defs>

            {layout.ticks.map((tick) => (
              <g key={tick.value}>
                <line x1={PAD.left} x2={width - PAD.right} y1={tick.y} y2={tick.y} stroke="var(--color-border)" strokeDasharray="3 4" />
                <text x={PAD.left - 8} y={tick.y + 3} textAnchor="end" fontSize="9" fill="var(--color-text-2)">
                  {tick.value === 0 ? '0' : `${axisPrefix}${formatCompactNumber(tick.value)}`}
                </text>
              </g>
            ))}

            {layout.area && <path d={layout.area} fill={`url(#${gradientId})`} />}
            {layout.line && <path d={layout.line} fill="none" stroke="var(--color-success)" strokeWidth="1.25" />}
            {layout.points.length === 1 && (
              <circle cx={layout.points[0].x} cy={layout.points[0].y} r="3.5" fill="var(--color-success)" />
            )}

            {hovered && (
              <g>
                <line x1={hovered.x} x2={hovered.x} y1={PAD.top} y2={BASELINE} stroke="var(--color-text-4)" strokeDasharray="2 3" />
                <circle cx={hovered.x} cy={hovered.y} r="3.5" fill="var(--color-surface)" stroke="var(--color-success)" strokeWidth="1.5" />
              </g>
            )}

          </svg>

          {hovered && (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[11px] shadow-[var(--shadow-md)]"
              style={{ left: Math.min(Math.max(hovered.x, 64), width - 64), top: hovered.y - 8 }}
            >
              <div className="text-text-3">{formatReportDate(hovered.date)}</div>
              <div className="text-[12px] font-semibold text-text-1">{formatValue(hovered.value)}</div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
