'use client'

import { useState, useRef } from 'react'
import { track } from '@/lib/analytics'

const BESOINS = [
  'Rapport client (Starter / Pro)',
  'Marque blanche',
  'Intégration / API',
  'Je ne sais pas encore',
]

export function ContactForm() {
  const [form, setForm] = useState({
    nom: '',
    societe: '',
    metier: '',
    email: '',
    telephone: '',
    volume: '',
    besoin: BESOINS[0],
  })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const started = useRef(false)

  const update = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleFirstFocus = () => {
    if (!started.current) {
      started.current = true
      track('demo_form_start')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profil: 'pro',
          nom: form.nom,
          societe: form.societe,
          metier: form.metier,
          email: form.email,
          telephone: form.telephone,
          volume: form.volume,
          besoin: form.besoin,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Erreur, veuillez réessayer.')
      track('demo_form_submit', { besoin: form.besoin })
      setSent(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inattendue')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-white/5 border border-white/15 focus:border-[#C9A96E] rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-colors"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <input required placeholder="Nom" value={form.nom} onChange={update('nom')} onFocus={handleFirstFocus} className={inputClass} />
        <input required placeholder="Société / cabinet" value={form.societe} onChange={update('societe')} className={inputClass} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <input required placeholder="Métier (CGP, chasseur, courtier...)" value={form.metier} onChange={update('metier')} className={inputClass} />
        <input required type="email" placeholder="Email professionnel" value={form.email} onChange={update('email')} className={inputClass} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <input required type="tel" placeholder="Téléphone" value={form.telephone} onChange={update('telephone')} className={inputClass} />
        <input placeholder="Nombre de dossiers investisseurs / mois" value={form.volume} onChange={update('volume')} className={inputClass} />
      </div>
      <select value={form.besoin} onChange={update('besoin')} className={inputClass}>
        {BESOINS.map((b) => (
          <option key={b} value={b} className="bg-[#0B1B2B]">{b}</option>
        ))}
      </select>
      {error && <p className="text-center text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={loading || sent}
        className="w-full bg-[#C9A96E] hover:bg-[#d4b87a] text-[#0B1B2B] font-bold py-3.5 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
        {loading ? 'Envoi...' : sent ? 'Demande envoyée' : 'Envoyer ma demande'}
      </button>
      {sent && (
        <p className="text-center text-sm text-slate-400">
          Merci ! Votre demande a bien été reçue, nous revenons vers vous rapidement.
        </p>
      )}
      <p className="text-center text-xs text-slate-600 leading-relaxed">
        Données de simulation non conservées sans coordonnées renseignées · PDF générés à la demande, non stockés après génération.{' '}
        <a href="/securite-donnees" className="underline hover:text-slate-400 transition-colors">Sécurité des données</a>
      </p>
    </form>
  )
}
