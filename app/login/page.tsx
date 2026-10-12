'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    })
    if (error) { setError(error.message); setLoading(false) }
    else setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div style={{background:'#1E293B',border:'1px solid #334155'}} className="rounded-xl p-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-2xl font-bold text-white mb-1">Wealth Tracker</div>
          <div className="text-sm text-slate-400">Panel de patrimonio personal</div>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="text-4xl mb-4">✉️</div>
            <p className="text-slate-300 text-sm">
              Hemos enviado un enlace mágico a <strong className="text-white">{email}</strong>.
              Haz click en él para entrar.
            </p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Enviando...' : 'Entrar con enlace mágico'}
            </button>
            <p className="text-xs text-slate-500 text-center">
              Recibirás un email con un enlace de acceso. Sin contraseñas.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
