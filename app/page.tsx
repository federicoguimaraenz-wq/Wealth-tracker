'use client'
import { useState } from 'react'

interface Slice { label: string; value: number; color: string }

export default function DonutChart({ slices, centerLabel, centerSub }: {
  slices: Slice[]
  centerLabel: string
  centerSub?: string
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  const total = slices.reduce((s, x) => s + x.value, 0)
  const cx = 110, cy = 110, r = 80, ri = 52
  let angle = -Math.PI / 2

  const paths = slices.map((s, i) => {
    const pct = s.value / total
    const a0 = angle
    const a1 = angle + pct * 2 * Math.PI
    angle = a1
    const large = pct > 0.5 ? 1 : 0
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0)
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1)
    const xi0 = cx + ri * Math.cos(a0), yi0 = cy + ri * Math.sin(a0)
    const xi1 = cx + ri * Math.cos(a1), yi1 = cy + ri * Math.sin(a1)
    const d = `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} L ${xi1} ${yi1} A ${ri} ${ri} 0 ${large} 0 ${xi0} ${yi0} Z`
    return { d, color: s.color, label: s.label, value: s.value, pct }
  })

  const fmt = (n: number) => n >= 1e6
    ? `€${(n/1e6).toFixed(2)}M`
    : `€${Math.round(n).toLocaleString('es-ES')}`

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="w-full sm:w-auto flex-shrink-0" style={{maxWidth: 200}}>
        <svg viewBox="0 0 220 220" width="100%" style={{display:'block'}}>
          {paths.map((p, i) => (
            <path
              key={i} d={p.d} fill={p.color}
              opacity={hovered === null || hovered === i ? 1 : 0.4}
              stroke="#0F172A" strokeWidth="2"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{cursor:'pointer', transition:'opacity 0.15s'}}
            />
          ))}
          <text x={cx} y={cy - 6} textAnchor="middle" fill="#E2E8F0" fontSize="15" fontWeight="700">{centerLabel}</text>
          {centerSub && <text x={cx} y={cy + 14} textAnchor="middle" fill="#64748B" fontSize="11">{centerSub}</text>}
        </svg>
      </div>
      <div className="flex flex-col gap-2 w-full">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-sm"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{opacity: hovered === null || hovered === i ? 1 : 0.4, cursor:'default', transition:'opacity 0.15s'}}>
            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{background: s.color}} />
            <span className="text-slate-300">{s.label}</span>
            <span className="text-slate-400 text-xs ml-auto pl-4">{fmt(s.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
