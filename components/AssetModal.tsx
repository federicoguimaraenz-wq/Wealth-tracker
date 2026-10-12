'use client'
import { useState, useEffect } from 'react'
import { Asset, AssetClass } from '@/lib/types'

interface Props {
  asset?: Asset | null
  onSave: (a: Partial<Asset>) => void
  onClose: () => void
}

const CLS_OPTIONS: { value: AssetClass; label: string }[] = [
  { value: 'realestate',  label: 'Real Estate' },
  { value: 'financial',   label: 'Financiero' },
  { value: 'alternative', label: 'Alternativos' },
  { value: 'cash',        label: 'Liquidez' },
]

export default function AssetModal({ asset, onSave, onClose }: Props) {
  const blank: Partial<Asset> = {
    cls: 'realestate', name: '', cur: 'EUR',
    val: 0, cost: 0, inc: 0, inc_monthly: 0,
    risk: 3, tgt: 0, is_active: true, notes: ''
  }
  const [form, setForm] = useState<Partial<Asset>>(asset || blank)

  useEffect(() => { setForm(asset || blank) }, [asset])

  function set(k: keyof Asset, v: unknown) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:'rgba(0,0,0,0.7)'}}>
      <div style={{background:'#1E293B',border:'1px solid #334155'}} className="rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-white">{asset ? 'Editar activo' : 'Nuevo activo'}</h2>
          <button className="btn-ghost text-xl leading-none px-2 py-0" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1">Nombre</label>
              <input value={form.name || ''} onChange={e => set('name', e.target.value)} required />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Clase</label>
              <select value={form.cls} onChange={e => set('cls', e.target.value as AssetClass)}>
                {CLS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Moneda</label>
              <select value={form.cur} onChange={e => set('cur', e.target.value as 'EUR'|'USD')}>
                <option value="EUR">EUR €</option>
                <option value="USD">USD $</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Valor actual</label>
              <input type="number" value={form.val || 0} onChange={e => set('val', +e.target.value)} />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Precio adquisición (coste)</label>
              <input type="number" value={form.cost || 0} onChange={e => set('cost', +e.target.value)} />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Ingresos anuales</label>
              <input type="number" value={form.inc || 0} onChange={e => set('inc', +e.target.value)} />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Ingresos mensuales</label>
              <input type="number" value={form.inc_monthly || 0} onChange={e => set('inc_monthly', +e.target.value)} />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Riesgo (1-5)</label>
              <select value={form.risk} onChange={e => set('risk', +e.target.value)}>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Yield objetivo (%)</label>
              <input type="number" step="0.1" value={form.tgt || 0} onChange={e => set('tgt', +e.target.value)} />
            </div>

            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1">Notas / Tesis</label>
              <textarea rows={3} value={form.notes || ''} onChange={e => set('notes', e.target.value)}
                style={{resize:'vertical'}} />
            </div>

            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => set('is_active', e.target.checked)}
                style={{width:'auto'}} />
              <label htmlFor="is_active" className="text-sm text-slate-300">Activo (incluir en cálculos)</label>
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <button type="submit" className="btn-primary flex-1">Guardar</button>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
