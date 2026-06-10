'use client'

import { useState } from 'react'

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
    volume: '',
    besoin: BESOINS[0],
  })
  const [sent, setSent] = useState(false)

  const update = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Demande de démo pro — ${form.societe || form.nom}`)
    const body = encodeURIComponent(
      `Nom : ${form.nom}\n` +
      `Société : ${form.societe}\n` +
      `Métier : ${form.metier}\n` +
      `Email : ${form.email}\n` +
      `Dossiers investisseurs / mois : ${form.volume}\n` +
      `Besoin : ${form.besoin}\n`
    )
    window.location.href = `mailto:contact@rendement-reel-immo.fr?subject=${subject}&body=${body}`
    setSent(true)
  }

  const inputClass = "w-full bg-white/5 border border-white/15 focus:border-[#C9A96E] rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-colors"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <input required placeholder="Nom" value={form.nom} onChange={update('nom')} className={inputClass} />
        <input required placeholder="Société / cabinet" value={form.societe} onChange={update('societe')} className={inputClass} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <input required placeholder="Métier (CGP, chasseur, courtier...)" value={form.metier} onChange={update('metier')} className={inputClass} />
        <input required type="email" placeholder="Email professionnel" value={form.email} onChange={update('email')} className={inputClass} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <input placeholder="Nombre de dossiers investisseurs / mois" value={form.volume} onChange={update('volume')} className={inputClass} />
        <select value={form.besoin} onChange={update('besoin')} className={inputClass}>
          {BESOINS.map((b) => (
            <option key={b} value={b} className="bg-[#0B1B2B]">{b}</option>
          ))}
        </select>
      </div>
      <button type="submit"
        className="w-full bg-[#C9A96E] hover:bg-[#d4b87a] text-[#0B1B2B] font-bold py-3.5 rounded-lg text-sm transition-colors">
        Envoyer ma demande
      </button>
      {sent && (
        <p className="text-center text-sm text-slate-400">
          Votre messagerie va s&apos;ouvrir avec les informations pré-remplies — il ne reste qu&apos;à envoyer.
        </p>
      )}
    </form>
  )
}
