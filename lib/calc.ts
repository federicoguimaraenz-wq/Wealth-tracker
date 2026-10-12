import { Asset, Liability } from './types'

export const CLS_LABEL: Record<string, string> = {
  realestate: 'Real Estate',
  financial:  'Financiero',
  alternative:'Alternativos',
  cash:       'Liquidez',
}

export const CLS_COLOR: Record<string, string> = {
  realestate:  '#3B82F6',
  financial:   '#10B981',
  alternative: '#F59E0B',
  cash:        '#475569',
}

export function toEur(a: Asset, fx: number): number {
  return a.cur === 'USD' ? a.val / fx : a.val
}

export function calcPortfolio(assets: Asset[], liabs: Liability[], fx: number) {
  const active = assets.filter(a => a.is_active)
  const tA = active.reduce((s, a) => s + toEur(a, fx), 0)
  const tL = liabs.reduce((s, l) => s + l.bal, 0)
  const nav = tA - tL

  const ltv = tA > 0 ? (tL / tA) * 100 : 0

  const reAssets = active.filter(a => a.cls === 'realestate')
  const reDebt = liabs.filter(l => {
    const a = assets.find(x => x.name === l.linked)
    return a && a.cls === 'realestate'
  })
  const reVal = reAssets.reduce((s, a) => s + toEur(a, fx), 0)
  const reD = reDebt.reduce((s, l) => s + l.bal, 0)
  const ltvRE = reVal > 0 ? (reD / reVal) * 100 : 0

  const tInc = active.reduce((s, a) => s + (a.inc || 0), 0)
  const yld = tA > 0 ? (tInc / tA) * 100 : 0

  const byClass: Record<string, number> = {}
  for (const a of active) {
    byClass[a.cls] = (byClass[a.cls] || 0) + toEur(a, fx)
  }

  return { tA, tL, nav, ltv, ltvRE, tInc, yld, byClass }
}
