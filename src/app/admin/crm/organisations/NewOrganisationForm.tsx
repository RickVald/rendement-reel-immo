'use client'

import { useActionState, useState } from 'react'
import { createOrganisationAction, type ActionState } from './actions'
import { SEGMENT_LABELS } from '@/lib/crm/types'

const initialState: ActionState = {}

export function NewOrganisationForm() {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(createOrganisationAction, initialState)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#0B1B2B] text-white hover:bg-[#0B1B2B]/90 transition-colors"
      >
        + Nouvelle organisation
      </button>
    )
  }

  return (
    <form action={formAction} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-sm text-[#0B1B2B]">Nouvelle organisation</h2>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-slate-400 hover:text-[#0B1B2B]">Annuler</button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Nom</label>
          <input name="nom" required className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Segment</label>
          <select name="segment" required defaultValue="" className="w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-2">
            <option value="" disabled>Choisir...</option>
            {Object.entries(SEGMENT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Ville</label>
          <input name="ville" className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Taille</label>
          <input name="taille" placeholder="Ex : 4 conseillers" className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Site web</label>
          <input name="site" placeholder="exemple.fr" className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Source</label>
          <input name="source" placeholder="outbound, inbound, referral..." className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Potentiel (€/mois, optionnel)</label>
          <input name="potentiel" type="number" min={0} className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2" />
        </div>
      </div>

      {state.error && <p className="text-xs text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#0B1B2B] text-white hover:bg-[#0B1B2B]/90 transition-colors disabled:opacity-50"
      >
        {pending ? 'Création...' : 'Créer l\'organisation'}
      </button>
    </form>
  )
}
