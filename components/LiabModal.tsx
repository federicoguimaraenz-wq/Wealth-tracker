'use client'
import { useState, useEffect } from 'react'
import { Liability, Asset } from '@/lib/types'

interface Props {
  liab?: Liability | null
  assets: Asset[]
  onSave: (l: Partial<Liability>) => void
  onClose: () => void
}

export default function LiabModal({ liab, assets, onSave, onClose }: Props) {
  const blank: Partial<Liability> = { name:'', tipo:'hipoteca', bal:0, rate:0, linked:'', monthly:0 }
  const [form, setForm] = useState<Partial<Liability>>(liab || blank)
  useEffect(() => { setForm(liab || blank) }, [liab])

  function set(k: keyof Liability, v: unknown) { setForm(f => ({ ...f, [k]: v })) }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:'rgba(0,0,0,0.7)'}}>
      <div style={{background:'#1E293B',border:'1px solid #334155'}} className="rounded-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-white">{liab ? 'Editar pasivo' : 'Nuevo pasivo'}</h2>
          <button className="btn-ghost text-xl leading-none px-2 py-0" onClick={onClose}>×</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Nombre</label>
            <input value={form.name || ''} onChange={e => set('name', e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Tipo</label>
              <select value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                {['hipoteca','pignorado','provision','workingcapital','otro'].map(t =>
                  <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Vinculado a</label>
              <select value={form.linked} onChange={e => set('linked', e.target.value)}>
                <option value="">— ninguno —</option>
                {assets.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Saldo</label>
              <input type="number" value={form.bal || 0} onChange={e => set('bal', +e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Tipo interés (%)</label>
              <input type="number" step="0.1" value={form.rate || 0} onChange={e => set('rate', +e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Cuota mensual</label>
              <input type="number" value={form.monthly || 0} onChange={e => set('monthly', +e.target.value)} />
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
