interface KpiCardProps {
  label: string
  value: string
  sub?: string
  accent?: string
}

export default function KpiCard({ label, value, sub, accent }: KpiCardProps) {
  return (
    <div style={{background:'#1E293B', border:'1px solid #334155'}} className="rounded-xl p-5">
      <div className="text-xs text-slate-400 mb-1 uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-bold" style={{color: accent || '#E2E8F0'}}>{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  )
}
