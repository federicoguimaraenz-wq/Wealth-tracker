export type AssetClass = 'realestate' | 'financial' | 'alternative' | 'cash'
export type RiskLevel = 1 | 2 | 3 | 4 | 5

export interface Asset {
  id: number
  cls: AssetClass
  name: string
  cur: 'EUR' | 'USD'
  val: number
  cost: number
  inc: number
  inc_monthly: number
  risk: RiskLevel
  tgt: number
  is_active: boolean
  notes?: string
}

export interface Liability {
  id: number
  name: string
  tipo: string
  bal: number
  rate: number
  linked: string
  monthly: number
}

export interface Settings {
  fx_eur_usd: number
}
