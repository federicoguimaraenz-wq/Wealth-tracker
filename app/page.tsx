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
  { name: 'INCMT FND NARTEX EQ A AC EUR', tipo: 'Fondo', moneda: 'EUR', unidades: 176.54, precioActual: 125.34, valorActual: 20648 },
  { name: 'FRANKLIN TECHNOLOGY A ACC USD', tipo: 'Fondo', moneda: 'USD', unidades: 327.563, precioActual: 80.86, valorActual: 24710 },
  { name: 'PICTET JAPAN INDEX P ACC EUR', tipo: 'Fondo', moneda: 'EUR', unidades: 87.30, precioActual: 289.58, valorActual: 23585 },
  { name: 'HORIZON STRAT BD A2 ACC USD', tipo: 'Fondo', moneda: 'USD', unidades: 243.546, precioActual: 110.97, valorActual: 25213 },
  { name: 'CITI', tipo: 'Acción', moneda: 'USD', unidades: 190, precioActual: 130.23, valorActual: 23084 },
  { name: 'PETROLEO BRASILEIRO ADR', tipo: 'Acción', moneda: 'USD', unidades: 550, precioActual: 25.34, valorActual: 13002 },
  { name: 'AMAZON', tipo: 'Acción', moneda: 'USD', unidades: 56, precioActual: 261.17, valorActual: 13645 },
  { name: 'ISHARES PHYSICAL GOLD ETC', tipo: 'ETF', moneda: 'EUR', unidades: 263, precioActual: 72.27, valorActual: 17732 },
  { name: 'ETF ERP HI DIV C', tipo: 'ETF', moneda: 'EUR', unidades: 75, precioActual: 242.70, valorActual: 16982 },
  { name: 'NVIDIA', tipo: 'Acción', moneda: 'USD', unidades: 50, precioActual: 225.90, valorActual: 10537 },
  { name: 'MICROSOFT CORP', tipo: 'Acción', moneda: 'USD', unidades: 11, precioActual: 540.81, valorActual: 5550 },
  { name: 'ETF SPDR S&P US DVD ARISTOCRAT', tipo: 'ETF', moneda: 'USD', unidades: 190, precioActual: 82.81, valorActual: 14679 },
  { name: 'APPLE COMPUTER', tipo: 'Acción', moneda: 'USD', unidades: 18, precioActual: 341.09, valorActual: 5728 },
  { name: 'ETC WTI CRUDE OIL', tipo: 'ETF', moneda: 'EUR', unidades: 910, precioActual: 16.01, valorActual: 13592 },
  { name: 'BERKSHIRE HATHAWAY INC CL-B', tipo: 'Acción', moneda: 'USD', unidades: 14, precioActual: 516.25, valorActual: 6743 },
  { name: 'MERLIN PROPERTIES SOCIMI SA', tipo: 'Acción', moneda: 'EUR', unidades: 380, precioActual: 12.50, valorActual: 4431 },
  { name: 'COCA COLA', tipo: 'Acción', moneda: 'USD', unidades: 51, precioActual: 88.93, valorActual: 4231 },
  { name: 'TESLA', tipo: 'Acción', moneda: 'USD', unidades: 20, precioActual: 379.99, valorActual: 7090 },
  { name: 'FRANKLIN RESOURCES', tipo: 'Acción', moneda: 'USD', unidades: 178, precioActual: 32.88, valorActual: 5460 },
  { name: 'KKR Co', tipo: 'Acción', moneda: 'USD', unidades: 38, precioActual: 91.72, valorActual: 3251 },
  { name: 'BANK OF AMERICA', tipo: 'Acción', moneda: 'USD', unidades: 81, precioActual: 54.41, valorActual: 4111 },
  { name: 'T ROWE PRICE GROUP', tipo: 'Acción', moneda: 'USD', unidades: 41, precioActual: 102.53, valorActual: 3922 },
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

