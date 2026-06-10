'use client'

import { useActionState, useState } from 'react'
import { createContactAction, type ActionState } from './actions'
import { CONTACT_TYPE_LABELS } from '@/lib/crm/types'

const initialState: ActionState = {}

interface OrgOption {
  id: string
  nom: string
}

export function NewContactForm({ organisations }: { organisations: OrgOption[] }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(createContactAction, initialState)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#0B1B2B] text-white hover:bg-[#0B1B2B]/90 transition-colors"
      >
        + Nouveau contact
      </button>
    )
  }

  return (
    <form action={formAction} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-sm text-[#0B1B2B]">Nouveau contact</h2>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-slate-400 hover:text-[#0B1B2B]">Annuler</button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Nom</label>
          <input name="nom" required className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
          <input name="email" type="email" required className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Type</label>
          <select name="type" required defaultValue="" className="w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-2">
            <option value="" disabled>Choisir...</option>
            {Object.entries(CONTACT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Organisation (optionnel)</label>
          <select name="organisationId" defaultValue="" className="w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-2">
            <option value="">— Aucune —</option>
            {organisations.map(o => (
              <option key={o.id} value={o.id}>{o.nom}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Rôle</label>
          <input name="role" className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Téléphone</label>
          <input name="telephone" className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">LinkedIn</label>
          <input name="linkedin" placeholder="linkedin.com/in/..." className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2" />
        </div>
      </div>

      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state.success && <p className="text-xs text-emerald-600">{state.success}</p>}

      <button
        type="submit"
        disabled={pending}
        className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#0B1B2B] text-white hover:bg-[#0B1B2B]/90 transition-colors disabled:opacity-50"
      >
        {pending ? 'Création...' : 'Créer le contact'}
      </button>
    </form>
  )
}
