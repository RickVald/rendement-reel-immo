'use client'
import { useState } from 'react'
import type { TypeAnalyse } from './TypeAnalyseStep'

const LABELS: Record<TypeAnalyse, string> = {
  achat: 'Analyse achat',
  detenu: 'Conserver ou vendre un bien déjà détenu',
  audit_global: 'Audit patrimonial global',
}

export function ComingSoonAnalyse({ type, onBack }: { type: TypeAnalyse; onBack: () => void }) {
  const [email, setEmail] = useState('')
  const [nom, setNom] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const handleSubmit = async () => {
    if (!email.trim() || !email.includes('@')) {
      setStatus('error')
      return
    }
    setStatus('loading')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profil: 'particulier',
          nom: nom.trim() || "Liste d'attente",
          email: email.trim(),
          besoin: `Liste d'attente — ${LABELS[type]}`,
        }),
      })
      if (!res.ok) throw new Error()
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="space-y-5 text-center py-4">
      <div>
        <span className="inline-block text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full mb-3">
          Bientôt disponible
        </span>
        <h2 className="font-playfair text-2xl font-bold text-[#0B1B2B]">{LABELS[type]}</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
          Cette analyse est en cours de développement. Laissez votre email pour être prévenu dès qu&apos;elle sera disponible.
        </p>
      </div>

      {status === 'done' ? (
        <p className="text-sm text-emerald-600 font-medium">Merci ! Nous vous tiendrons informé.</p>
      ) : (
        <div className="max-w-sm mx-auto space-y-2">
          <input
            type="text"
            value={nom}
            onChange={e => setNom(e.target.value)}
            placeholder="Votre nom (facultatif)"
            className="w-full text-sm rounded-lg px-3 py-2 border border-slate-200"
          />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Votre email"
            className="w-full text-sm rounded-lg px-3 py-2 border border-slate-200"
          />
          {status === 'error' && <p className="text-xs text-red-500">Indiquez un email valide.</p>}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={status === 'loading'}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-2 rounded-lg text-sm transition-colors disabled:opacity-60"
          >
            {status === 'loading' ? '...' : 'Me prévenir'}
          </button>
        </div>
      )}

      <button type="button" onClick={onBack} className="text-sm text-slate-500 hover:text-slate-700 underline">
        ← Choisir un autre type d&apos;analyse
      </button>
    </div>
  )
}
