'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Asset, Liability } from '@/lib/types'
import { DEFAULT_ASSETS, DEFAULT_LIABILITIES } from '@/lib/data'
import { calcPortfolio, toEur, CLS_LABEL, CLS_COLOR } from '@/lib/calc'
import KpiCard from '@/components/KpiCard'
import DonutChart from '@/components/DonutChart'
import AssetModal from '@/components/AssetModal'
import LiabModal from '@/components/LiabModal'

const TABS = ['Overview', 'Activos', 'Pasivos', 'Detalle Cartera', 'Ajustes']

// Posiciones estáticas de carteras gestionadas (actualizadas Oct 2026)
const ANDBANK_POSITIONS = [
  { name: 'INCMT FND NARTEX EQ A AC EUR', tipo: 'Fondo', moneda: 'EUR', unidades: 176.54, precioActual: 125.34, valorActual: 22128 },
  { name: 'FRANKLIN TECHNOLOGY A ACC USD', tipo: 'Fondo', moneda: 'USD', unidades: 327.563, precioActual: 80.86, valorActual: 26487 },
  { name: 'PICTET JAPAN INDEX P ACC EUR', tipo: 'Fondo', moneda: 'EUR', unidades: 87.30, precioActual: 289.58, valorActual: 25281 },
  { name: 'HORIZON STRAT BD A2 ACC USD', tipo: 'Fondo', moneda: 'USD', unidades: 243.546, precioActual: 110.97, valorActual: 27026 },
  { name: 'CITI', tipo: 'Acción', moneda: 'USD', unidades: 190, precioActual: 130.23, valorActual: 24744 },
  { name: 'PETROLEO BRASILEIRO ADR', tipo: 'Acción', moneda: 'USD', unidades: 550, precioActual: 25.34, valorActual: 13937 },
  { name: 'AMAZON', tipo: 'Acción', moneda: 'USD', unidades: 56, precioActual: 261.17, valorActual: 14626 },
  { name: 'ISHARES PHYSICAL GOLD ETC', tipo: 'ETF', moneda: 'EUR', unidades: 263, precioActual: 72.27, valorActual: 19007 },
  { name: 'ETF ERP HI DIV C', tipo: 'ETF', moneda: 'EUR', unidades: 75, precioActual: 242.70, valorActual: 18203 },
  { name: 'NVIDIA', tipo: 'Acción', moneda: 'USD', unidades: 50, precioActual: 225.90, valorActual: 11295 },
  { name: 'MICROSOFT CORP', tipo: 'Acción', moneda: 'USD', unidades: 11, precioActual: 540.81, valorActual: 5949 },
  { name: 'ETF SPDR S&P US DVD ARISTOCRAT', tipo: 'ETF', moneda: 'USD', unidades: 190, precioActual: 82.81, valorActual: 15734 },
  { name: 'APPLE COMPUTER', tipo: 'Acción', moneda: 'USD', unidades: 18, precioActual: 341.09, valorActual: 6140 },
  { name: 'ETC WTI CRUDE OIL', tipo: 'ETF', moneda: 'EUR', unidades: 910, precioActual: 16.01, valorActual: 14569 },
  { name: 'BERKSHIRE HATHAWAY INC CL-B', tipo: 'Acción', moneda: 'USD', unidades: 14, precioActual: 516.25, valorActual: 7228 },
  { name: 'MERLIN PROPERTIES SOCIMI SA', tipo: 'Acción', moneda: 'EUR', unidades: 380, precioActual: 12.50, valorActual: 4750 },
  { name: 'COCA COLA', tipo: 'Acción', moneda: 'USD', unidades: 51, precioActual: 88.93, valorActual: 4535 },
  { name: 'TESLA', tipo: 'Acción', moneda: 'USD', unidades: 20, precioActual: 379.99, valorActual: 7600 },
  { name: 'FRANKLIN RESOURCES', tipo: 'Acción', moneda: 'USD', unidades: 178, precioActual: 32.88, valorActual: 5853 },
  { name: 'KKR Co', tipo: 'Acción', moneda: 'USD', unidades: 38, precioActual: 91.72, valorActual: 3485 },
  { name: 'BANK OF AMERICA', tipo: 'Acción', moneda: 'USD', unidades: 81, precioActual: 54.41, valorActual: 4407 },
  { name: 'T ROWE PRICE GROUP', tipo: 'Acción', moneda: 'USD', unidades: 41, precioActual: 102.53, valorActual: 4204 },
]

const PERSHING_POSITIONS = [
  { name: 'URTH (iShares MSCI World ETF)', tipo: 'ETF', moneda: 'USD', unidades: 36, precioActual: null, valorActual: null },
  { name: 'INDA (iShares MSCI India ETF)', tipo: 'ETF', moneda: 'USD', unidades: 123, precioActual: null, valorActual: null },
  { name: 'PBR (Petrobras ADR)', tipo: 'Acción', moneda: 'USD', unidades: 198, precioActual: null, valorActual: null },
  { name: 'B (Barrick Gold)', tipo: 'Acción', moneda: 'USD', unidades: 482, precioActual: null, valorActual: null },
  { name: 'C (Citigroup)', tipo: 'Acción', moneda: 'USD', unidades: 84, precioActual: null, valorActual: null },
  { name: 'FBTC (Fidelity Bitcoin ETF)', tipo: 'ETF', moneda: 'USD', unidades: 164, precioActual: null, valorActual: null },
  { name: 'G5011U458 (Renta Fija Inst.)', tipo: 'RF Institucional', moneda: 'USD', unidades: null, precioActual: null, valorActual: null },
  { name: 'G36346537 (Renta Fija Inst.)', tipo: 'RF Institucional', moneda: 'USD', unidades: null, precioActual: null, valorActual: null },
  { name: 'G0819V626 (Renta Fija Inst.)', tipo: 'RF Institucional', moneda: 'USD', unidades: null, precioActual: null, valorActual: null },
  { name: 'G0819V253 (Renta Fija Inst.)', tipo: 'RF Institucional', moneda: 'USD', unidades: null, precioActual: null, valorActual: null },
]

const INVESTORTRUST_POSITIONS = [
  // Cuenta 9001
  { name: 'ISWO (iShares MSCI World)', tipo: 'ETF', cuenta: '9001', unidades: 44.55, valorActual: 3856 },
  { name: 'MANT (Man TargetRisk)', tipo: 'Fondo', cuenta: '9001', unidades: 20.87, valorActual: 2494 },
  { name: 'ISUU2 (iShares US Utilities)', tipo: 'ETF', cuenta: '9001', unidades: 17.40, valorActual: 1862 },
  { name: 'JPUV (JPM US Value)', tipo: 'Fondo', cuenta: '9001', unidades: 35.31, valorActual: 1442 },
  { name: 'JHHY (JH Horizon Global High Yield)', tipo: 'Fondo', cuenta: '9001', unidades: 3.14, valorActual: 551 },
  { name: 'MSGB (MS Global Brands)', tipo: 'Fondo', cuenta: '9001', unidades: 1.89, valorActual: 444 },
  { name: 'MSGO (MS Global Opportunity)', tipo: 'Fondo', cuenta: '9001', unidades: 3.57, valorActual: 590 },
  { name: 'SCSC (SCH Global Smaller Cos.)', tipo: 'Fondo', cuenta: '9001', unidades: 1.06, valorActual: 304 },
  { name: 'BREB (BR Emerging Markets Bond)', tipo: 'Fondo', cuenta: '9001', unidades: 10.61, valorActual: 227 },
  { name: 'AHLG (Man AHL Diversified)', tipo: 'Fondo', cuenta: '9001', unidades: 94.75, valorActual: 148 },
  // Cuenta 9118
  { name: 'ABEI (AB European Income)', tipo: 'Fondo', cuenta: '9118', unidades: 106.78, valorActual: 2286 },
  { name: 'FINF (FT India)', tipo: 'Fondo', cuenta: '9118', unidades: 18.32, valorActual: 1278 },
  { name: 'FTCF (FT Technology)', tipo: 'Fondo', cuenta: '9118', unidades: 86.11, valorActual: 4886 },
  { name: 'ISPG (iShares Physical Gold)', tipo: 'ETF', cuenta: '9118', unidades: 54.64, valorActual: 3558 },
  { name: 'MFEV (MFS European Value)', tipo: 'Fondo', cuenta: '9118', unidades: 69.05, valorActual: 2676 },
  { name: 'MFVF (MFS US Value)', tipo: 'Fondo', cuenta: '9118', unidades: 84.83, valorActual: 3822 },
]
const FX_DEFAULT = 1.154

function fmt(n: number, decimals = 0) {
  return '€' + n.toLocaleString('es-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}
function fmtPct(n: number) { return n.toFixed(1) + '%' }

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState(0)
  const [fx, setFx] = useState(FX_DEFAULT)
  const [showUSD, setShowUSD] = useState(false)

  const [assets, setAssets] = useState<Asset[]>([])
  const [liabs, setLiabs] = useState<Liability[]>([])

  const [editAsset, setEditAsset] = useState<Asset | null | undefined>(undefined)
  const [editLiab, setEditLiab] = useState<Liability | null | undefined>(undefined)

  // Auth check
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push('/login'); return }
      const u = { id: data.session.user.id, email: data.session.user.email }
      setUser(u)
      loadData(u.id)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) router.push('/login')
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function loadData(userId: string) {
    setLoading(true)
    const [{ data: aData }, { data: lData }] = await Promise.all([
      supabase.from('assets').select('*').eq('user_id', userId).order('id'),
      supabase.from('liabilities').select('*').eq('user_id', userId).order('id'),
    ])

    if (!aData || aData.length === 0) {
      // Seed with defaults
      const toInsert = DEFAULT_ASSETS.map(a => ({ ...a, user_id: userId }))
      const { data: inserted } = await supabase.from('assets').insert(toInsert).select()
      setAssets(inserted || [])
    } else {
      setAssets(aData)
    }

    if (!lData || lData.length === 0) {
      const toInsert = DEFAULT_LIABILITIES.map(l => ({ ...l, user_id: userId }))
      const { data: inserted } = await supabase.from('liabilities').insert(toInsert).select()
      setLiabs(inserted || [])
    } else {
      setLiabs(lData)
    }
    setLoading(false)
  }

  async function saveAsset(form: Partial<Asset>) {
    if (!user) return
    if (editAsset?.id) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...formWithoutId } = form as Asset
      const { data, error } = await supabase
        .from('assets')
        .update(formWithoutId)
        .eq('id', editAsset.id)
        .select()
        .single()
      if (error) { console.error('Error updating asset:', error); return }
      if (data) setAssets(prev => prev.map(a => a.id === data.id ? data : a))
    } else {
      const { data, error } = await supabase
        .from('assets')
        .insert({ ...form, user_id: user.id })
        .select()
        .single()
      if (error) { console.error('Error inserting asset:', error); return }
      if (data) setAssets(prev => [...prev, data])
    }
    setEditAsset(undefined)
  }

  async function deleteAsset(id: number) {
    if (!confirm('¿Eliminar este activo?')) return
    await supabase.from('assets').delete().eq('id', id)
    setAssets(prev => prev.filter(a => a.id !== id))
  }

  async function saveLiab(form: Partial<Liability>) {
    if (!user) return
    if (editLiab?.id) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...formWithoutId } = form as Liability
      const { data, error } = await supabase
        .from('liabilities')
        .update(formWithoutId)
        .eq('id', editLiab.id)
        .select()
        .single()
      if (error) { console.error('Error updating liability:', error); return }
      if (data) setLiabs(prev => prev.map(l => l.id === data.id ? data : l))
    } else {
      const { data, error } = await supabase
        .from('liabilities')
        .insert({ ...form, user_id: user.id })
        .select()
        .single()
      if (error) { console.error('Error inserting liability:', error); return }
      if (data) setLiabs(prev => [...prev, data])
    }
    setEditLiab(undefined)
  }

  async function deleteLiab(id: number) {
    if (!confirm('¿Eliminar este pasivo?')) return
    await supabase.from('liabilities').delete().eq('id', id)
    setLiabs(prev => prev.filter(l => l.id !== id))
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-slate-400">Cargando...</div>
    </div>
  )

  const { tA, tL, nav, ltv, ltvRE, tInc, yld, byClass } = calcPortfolio(assets, liabs, fx)

  const donutSlices = Object.entries(byClass)
    .map(([cls, val]) => ({ label: CLS_LABEL[cls] || cls, value: val, color: CLS_COLOR[cls] || '#888' }))
    .sort((a, b) => b.value - a.value)

  const navFmt = nav >= 1e6 ? `€${(nav/1e6).toFixed(2)}M` : fmt(nav)

  return (
    <div className="min-h-screen" style={{background:'#0F172A'}}>
      {/* Header */}
      <header style={{background:'#1E293B', borderBottom:'1px solid #334155'}} className="sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold text-lg">Wealth Tracker</span>
          <span className="text-xs text-slate-500">|</span>
          <span className="text-xs text-slate-400">FX EUR/USD: {fx}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">{user?.email}</span>
          <button className="btn-ghost text-xs px-3 py-1" onClick={signOut}>Salir</button>
        </div>
        </div>
      </header>

      {/* Tabs */}
      <div style={{borderBottom:'1px solid #334155'}}>
        <div className="max-w-6xl mx-auto px-6 flex">
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)}
            className="px-4 py-3 text-sm font-medium"
            style={{
              color: tab === i ? '#3B82F6' : '#94A3B8',
              borderBottom: tab === i ? '2px solid #3B82F6' : '2px solid transparent',
              background: 'transparent',
              borderRadius: 0,
            }}>
            {t}
          </button>
        ))}
        </div>
      </div>

      <main className="px-6 py-6 max-w-6xl mx-auto">

        {/* OVERVIEW */}
        {tab === 0 && (
          <div className="flex flex-col gap-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <KpiCard label="Patrimonio Neto" value={navFmt} accent="#10B981" />
              <KpiCard label="Activos Totales" value={tA >= 1e6 ? `€${(tA/1e6).toFixed(2)}M` : fmt(tA)} />
              <KpiCard label="Pasivos" value={fmt(tL)} accent="#EF4444" />
              <KpiCard label="Yield Cartera" value={fmtPct(yld)} sub={`€${Math.round(tInc).toLocaleString('es-ES')} / año`} />
              <KpiCard label="LTV Global" value={fmtPct(ltv)} sub={`RE: ${fmtPct(ltvRE)}`} accent={ltv > 50 ? '#F59E0B' : '#E2E8F0'} />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div style={{background:'#1E293B',border:'1px solid #334155'}} className="rounded-xl p-5">
                <div className="text-sm font-semibold text-slate-300 mb-4">Distribución por clase</div>
                <DonutChart slices={donutSlices} centerLabel={navFmt} centerSub="NAV" />
              </div>

              <div style={{background:'#1E293B',border:'1px solid #334155'}} className="rounded-xl p-5">
                <div className="text-sm font-semibold text-slate-300 mb-4">Yield vs Objetivo</div>
                <div className="flex flex-col gap-2">
                  {assets.filter(a => a.is_active && a.tgt > 0).map(a => {
                    const valEur = toEur(a, fx)
                    const costBase = a.cost > 0 ? a.cost : valEur
                    // ROI sobre coste; fallback a valor si no hay coste registrado
                    const actualYield = costBase > 0 ? (a.inc / costBase) * 100 : 0
                    const ok = actualYield >= a.tgt
                    return (
                      <div key={a.id} className="flex items-center gap-3">
                        <div className="text-xs text-slate-400 w-28 truncate">{a.name}</div>
                        <div className="flex-1 relative h-5">
                          <div className="absolute inset-0 rounded" style={{background:'#0F172A'}} />
                          <div className="absolute top-0 left-0 h-full rounded"
                            style={{width: `${Math.min(actualYield/20*100, 100)}%`, background: ok ? '#10B981' : '#EF4444', opacity:0.8}} />
                          <div className="absolute top-0 h-full border-l-2 border-dashed border-slate-400"
                            style={{left: `${Math.min(a.tgt/20*100, 100)}%`}} />
                        </div>
                        <div className="text-xs w-16 text-right" style={{color: ok ? '#10B981' : '#EF4444'}}>
                          {actualYield.toFixed(1)}% / {a.tgt}%
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Risk distribution */}
            <div style={{background:'#1E293B',border:'1px solid #334155'}} className="rounded-xl p-5">
              <div className="text-sm font-semibold text-slate-300 mb-4">Distribución por riesgo</div>
              <div className="flex flex-col gap-2">
                {[1,2,3,4,5].map(r => {
                  const val = assets.filter(a => a.is_active && a.risk === r).reduce((s,a) => s + toEur(a, fx), 0)
                  const pct = tA > 0 ? val / tA * 100 : 0
                  const colors = ['#10B981','#3B82F6','#F59E0B','#F97316','#EF4444']
                  return (
                    <div key={r} className="flex items-center gap-3">
                      <div className="text-xs text-slate-400 w-16">Riesgo {r}</div>
                      <div className="flex-1 h-4 rounded overflow-hidden" style={{background:'#0F172A'}}>
                        <div className="h-full rounded" style={{width:`${pct}%`, background:colors[r-1]}} />
                      </div>
                      <div className="text-xs text-slate-400 w-20 text-right">{fmt(val)} ({pct.toFixed(0)}%)</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ACTIVOS */}
        {tab === 1 && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-slate-300">
                {assets.filter(a => a.is_active).length} activos activos · {assets.filter(a => !a.is_active).length} inactivos
              </h2>
              <button className="btn-primary text-sm" onClick={() => setEditAsset(null)}>+ Nuevo activo</button>
            </div>

            {(['realestate','financial','alternative','cash'] as const).map(cls => {
              const group = assets.filter(a => a.cls === cls)
              if (!group.length) return null
              return (
                <div key={cls}>
                  <div className="text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{color: CLS_COLOR[cls]}}>{CLS_LABEL[cls]}</div>
                  <div style={{background:'#1E293B',border:'1px solid #334155'}} className="rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{borderBottom:'1px solid #334155'}}>
                          <th className="text-left px-4 py-2 text-xs text-slate-400 font-medium">Activo</th>
                          <th className="text-right px-4 py-2 text-xs text-slate-400 font-medium">Valor</th>
                          <th className="text-right px-4 py-2 text-xs text-slate-400 font-medium" title="Return on Investment: renta / coste adquisición">ROI</th>
                          <th className="text-right px-4 py-2 text-xs text-slate-400 font-medium" title="Return on Equity: renta / (coste − deuda vinculada)">ROE</th>
                          <th className="text-right px-4 py-2 text-xs text-slate-400 font-medium" title="Return on Value: renta / valor de mercado">ROV</th>
                          <th className="text-right px-4 py-2 text-xs text-slate-400 font-medium">Plusvalía</th>
                          <th className="text-right px-4 py-2 text-xs text-slate-400 font-medium">Riesgo</th>
                          <th className="px-4 py-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {group.map(a => {
                          const valEur = toEur(a, fx)
                          const cost = a.cost > 0 ? a.cost : null
                          // deuda vinculada a este activo
                          const linkedDebt = liabs
                            .filter(l => l.linked === a.name)
                            .reduce((s, l) => s + l.bal, 0)
                          const roi = cost && a.inc > 0 ? (a.inc / cost) * 100 : null
                          const equity = cost ? cost - linkedDebt : null
                          const roe = equity && equity > 0 && a.inc > 0 ? (a.inc / equity) * 100 : null
                          const rov = valEur > 0 && a.inc > 0 ? (a.inc / valEur) * 100 : null
                          const plusvalia = cost ? valEur - cost : null
                          const pctColor = (v: number) => v >= a.tgt ? '#10B981' : '#F59E0B'
                          return (
                            <tr key={a.id} style={{borderBottom:'1px solid #1E293B', opacity: a.is_active ? 1 : 0.45}}>
                              <td className="px-4 py-3">
                                <span className="text-white font-medium">{a.name}</span>
                                {!a.is_active && <span className="ml-2 text-xs text-slate-500 border border-slate-600 rounded px-1">INACTIVO</span>}
                                {a.notes && <div className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{a.notes}</div>}
                              </td>
                              <td className="px-4 py-3 text-right text-white font-medium">
                                {a.cur === 'USD'
                                  ? <><span className="text-slate-400 text-xs">${a.val.toLocaleString('es-ES')} </span>{fmt(valEur)}</>
                                  : fmt(valEur)}
                              </td>
                              <td className="px-4 py-3 text-right text-xs">
                                {roi !== null
                                  ? <span style={{color: pctColor(roi)}}>{roi.toFixed(1)}%</span>
                                  : <span className="text-slate-600">—</span>}
                              </td>
                              <td className="px-4 py-3 text-right text-xs">
                                {roe !== null
                                  ? <span style={{color: pctColor(roe)}}>{roe.toFixed(1)}%</span>
                                  : <span className="text-slate-600">—</span>}
                              </td>
                              <td className="px-4 py-3 text-right text-xs">
                                {rov !== null
                                  ? <span style={{color: pctColor(rov)}}>{rov.toFixed(1)}%</span>
                                  : <span className="text-slate-600">—</span>}
                              </td>
                              <td className="px-4 py-3 text-right text-xs">
                                {plusvalia !== null
                                  ? <span style={{color: plusvalia >= 0 ? '#10B981' : '#EF4444'}}>{plusvalia >= 0 ? '+' : ''}{fmt(plusvalia)}</span>
                                  : <span className="text-slate-600">—</span>}
                              </td>
                              <td className="px-4 py-3 text-right text-slate-400">{a.risk}</td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex gap-2 justify-end">
                                  <button className="btn-ghost text-xs px-2 py-1" onClick={() => setEditAsset(a)}>Editar</button>
                                  <button className="btn-danger text-xs px-2 py-1" onClick={() => deleteAsset(a.id)}>×</button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* PASIVOS */}
        {tab === 2 && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-slate-300">Total deuda: {fmt(tL)}</h2>
              <button className="btn-primary text-sm" onClick={() => setEditLiab(null)}>+ Nuevo pasivo</button>
            </div>
            <div style={{background:'#1E293B',border:'1px solid #334155'}} className="rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{borderBottom:'1px solid #334155'}}>
                    <th className="text-left px-4 py-2 text-xs text-slate-400 font-medium">Pasivo</th>
                    <th className="text-left px-4 py-2 text-xs text-slate-400 font-medium">Tipo</th>
                    <th className="text-left px-4 py-2 text-xs text-slate-400 font-medium">Vinculado a</th>
                    <th className="text-right px-4 py-2 text-xs text-slate-400 font-medium">Saldo</th>
                    <th className="text-right px-4 py-2 text-xs text-slate-400 font-medium">Interés</th>
                    <th className="text-right px-4 py-2 text-xs text-slate-400 font-medium">Cuota/mes</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {liabs.map(l => (
                    <tr key={l.id} style={{borderBottom:'1px solid #0F172A'}}>
                      <td className="px-4 py-3 text-white font-medium">{l.name}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{l.tipo}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{l.linked || '—'}</td>
                      <td className="px-4 py-3 text-right text-red-400 font-medium">{fmt(l.bal)}</td>
                      <td className="px-4 py-3 text-right text-slate-400">{l.rate > 0 ? `${l.rate}%` : '—'}</td>
                      <td className="px-4 py-3 text-right text-slate-400">{l.monthly > 0 ? fmt(l.monthly) : '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button className="btn-ghost text-xs px-2 py-1" onClick={() => setEditLiab(l)}>Editar</button>
                          <button className="btn-danger text-xs px-2 py-1" onClick={() => deleteLiab(l.id)}>×</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DETALLE CARTERA */}
        {tab === 3 && (
          <div className="flex flex-col gap-6">
            {/* Andbank */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-base font-semibold text-white">Andbank España</span>
                <span className="text-xs text-slate-500">· Oct 2026 · {ANDBANK_POSITIONS.length} posiciones</span>
              </div>
              <div style={{background:'#1E293B',border:'1px solid #334155'}} className="rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{borderBottom:'1px solid #334155'}}>
                      <th className="text-left px-4 py-2 text-xs text-slate-400 font-medium">Nombre</th>
                      <th className="text-left px-4 py-2 text-xs text-slate-400 font-medium">Tipo</th>
                      <th className="text-right px-4 py-2 text-xs text-slate-400 font-medium">Moneda</th>
                      <th className="text-right px-4 py-2 text-xs text-slate-400 font-medium">Unidades</th>
                      <th className="text-right px-4 py-2 text-xs text-slate-400 font-medium">Precio</th>
                      <th className="text-right px-4 py-2 text-xs text-slate-400 font-medium">Valor (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ANDBANK_POSITIONS.map((p, i) => (
                      <tr key={i} style={{borderBottom:'1px solid #0F172A'}}>
                        <td className="px-4 py-2 text-white">{p.name}</td>
                        <td className="px-4 py-2 text-slate-400 text-xs">{p.tipo}</td>
                        <td className="px-4 py-2 text-right text-xs text-slate-400">{p.moneda}</td>
                        <td className="px-4 py-2 text-right text-xs text-slate-300">{p.unidades.toLocaleString('es-ES', {maximumFractionDigits: 2})}</td>
                        <td className="px-4 py-2 text-right text-xs text-slate-300">{p.moneda === 'USD' ? '$' : '€'}{p.precioActual.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td className="px-4 py-2 text-right text-xs font-medium text-white">${p.valorActual.toLocaleString('es-ES')}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{borderTop:'1px solid #334155'}}>
                      <td colSpan={5} className="px-4 py-2 text-xs text-slate-400 font-semibold">TOTAL ANDBANK</td>
                      <td className="px-4 py-2 text-right text-xs font-bold text-white">
                        ${ANDBANK_POSITIONS.reduce((s,p) => s + p.valorActual, 0).toLocaleString('es-ES')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Pershing / Holistic */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-base font-semibold text-white">Pershing / Holistic Brokerage</span>
                <span className="text-xs text-slate-500">· Oct 2026 · USA</span>
              </div>
              <div style={{background:'#1E293B',border:'1px solid #334155'}} className="rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{borderBottom:'1px solid #334155'}}>
                      <th className="text-left px-4 py-2 text-xs text-slate-400 font-medium">Nombre</th>
                      <th className="text-left px-4 py-2 text-xs text-slate-400 font-medium">Tipo</th>
                      <th className="text-right px-4 py-2 text-xs text-slate-400 font-medium">Moneda</th>
                      <th className="text-right px-4 py-2 text-xs text-slate-400 font-medium">Unidades</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PERSHING_POSITIONS.map((p, i) => (
                      <tr key={i} style={{borderBottom:'1px solid #0F172A'}}>
                        <td className="px-4 py-2 text-white">{p.name}</td>
                        <td className="px-4 py-2 text-slate-400 text-xs">{p.tipo}</td>
                        <td className="px-4 py-2 text-right text-xs text-slate-400">{p.moneda}</td>
                        <td className="px-4 py-2 text-right text-xs text-slate-300">
                          {p.unidades !== null ? p.unidades.toLocaleString('es-ES') : <span className="text-slate-600">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-4 py-2 text-xs text-slate-500 border-t border-slate-700">
                  * Valores de mercado no disponibles directamente. Valor consolidado incluido en activo «Holistic Brokerage».
                </div>
              </div>
            </div>

            {/* Investor Trust */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-base font-semibold text-white">Investor Trust</span>
                <span className="text-xs text-slate-500">· Oct 2026 · Cuentas 9001 & 9118</span>
              </div>
              <div style={{background:'#1E293B',border:'1px solid #334155'}} className="rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{borderBottom:'1px solid #334155'}}>
                      <th className="text-left px-4 py-2 text-xs text-slate-400 font-medium">Nombre</th>
                      <th className="text-left px-4 py-2 text-xs text-slate-400 font-medium">Tipo</th>
                      <th className="text-right px-4 py-2 text-xs text-slate-400 font-medium">Cuenta</th>
                      <th className="text-right px-4 py-2 text-xs text-slate-400 font-medium">Unidades</th>
                      <th className="text-right px-4 py-2 text-xs text-slate-400 font-medium">Valor (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['9001','9118'].map(cuenta => {
                      const positions = INVESTORTRUST_POSITIONS.filter(p => p.cuenta === cuenta)
                      const subtotal = positions.reduce((s,p) => s + p.valorActual, 0)
                      return [
                        <tr key={`hdr-${cuenta}`} style={{background:'#0F172A'}}>
                          <td colSpan={5} className="px-4 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Cuenta {cuenta}
                          </td>
                        </tr>,
                        ...positions.map((p, i) => (
                          <tr key={`${cuenta}-${i}`} style={{borderBottom:'1px solid #0F172A'}}>
                            <td className="px-4 py-2 text-white">{p.name}</td>
                            <td className="px-4 py-2 text-slate-400 text-xs">{p.tipo}</td>
                            <td className="px-4 py-2 text-right text-xs text-slate-500">{p.cuenta}</td>
                            <td className="px-4 py-2 text-right text-xs text-slate-300">{p.unidades.toLocaleString('es-ES', {maximumFractionDigits: 2})}</td>
                            <td className="px-4 py-2 text-right text-xs font-medium text-white">${p.valorActual.toLocaleString('es-ES')}</td>
                          </tr>
                        )),
                        <tr key={`sub-${cuenta}`} style={{borderTop:'1px solid #1E3A5F', background:'#0F1E2E'}}>
                          <td colSpan={4} className="px-4 py-1 text-xs text-slate-500">Subtotal {cuenta}</td>
                          <td className="px-4 py-1 text-right text-xs text-slate-300 font-semibold">${subtotal.toLocaleString('es-ES')}</td>
                        </tr>
                      ]
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{borderTop:'1px solid #334155'}}>
                      <td colSpan={4} className="px-4 py-2 text-xs text-slate-400 font-semibold">TOTAL INVESTOR TRUST</td>
                      <td className="px-4 py-2 text-right text-xs font-bold text-white">
                        ${INVESTORTRUST_POSITIONS.reduce((s,p) => s + p.valorActual, 0).toLocaleString('es-ES')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* AJUSTES */}
        {tab === 4 && (
          <div className="max-w-md flex flex-col gap-4">
            <div style={{background:'#1E293B',border:'1px solid #334155'}} className="rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Tipo de cambio</h3>
              <div>
                <label className="block text-xs text-slate-400 mb-1">EUR / USD</label>
                <input type="number" step="0.001" value={fx}
                  onChange={e => setFx(+e.target.value)}
                  className="w-40" />
                <p className="text-xs text-slate-500 mt-2">
                  Actualiza este valor manualmente cuando haya un cambio significativo.
                  Actualmente: 1 USD = €{(1/fx).toFixed(4)}
                </p>
              </div>
            </div>
            <div style={{background:'#1E293B',border:'1px solid #334155'}} className="rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-2">Acceso</h3>
              <p className="text-xs text-slate-400 mb-3">
                Para dar acceso a otra persona, tienen que ir a{' '}
                <strong className="text-slate-300">[tu-dominio]/login</strong> y entrar con su email.
                Solo podrán ver datos (no editar) si quieres restringirlo — avísame y lo configuro.
              </p>
              <p className="text-xs text-slate-500">Sesión activa: {user?.email}</p>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {editAsset !== undefined && (
        <AssetModal asset={editAsset} onSave={saveAsset} onClose={() => setEditAsset(undefined)} />
      )}
      {editLiab !== undefined && (
        <LiabModal liab={editLiab} assets={assets} onSave={saveLiab} onClose={() => setEditLiab(undefined)} />
      )}
    </div>
  )
}
