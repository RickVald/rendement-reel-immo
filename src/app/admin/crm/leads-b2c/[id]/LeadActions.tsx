'use client'

import { useActionState } from 'react'
import { updateLeadStatusAction, updateConsentementAction, transmitLeadAction, type ActionState } from './actions'
import { LEAD_B2C_STATUS_LABELS, type LeadB2CStatus, type ConsentementStatus } from '@/lib/crm/types'

const initialState: ActionState = {}

const LEAD_STATUSES: LeadB2CStatus[] = ['NOUVEAU', 'QUALIFIE', 'RAPPELE', 'TRANSMIS', 'ACCEPTE', 'VENDU', 'REFUSE', 'EXPIRE']
const CONSENTEMENTS: { id: ConsentementStatus; label: string }[] = [
  { id: 'INCONNU', label: 'Inconnu' },
  { id: 'OPT_IN', label: 'Opt-in' },
  { id: 'OPT_OUT', label: 'Opt-out' },
]

function FormFeedback({ state }: { state: ActionState }) {
  if (state.error) return <p className="text-xs text-red-600 mt-1.5">{state.error}</p>
  if (state.success) return <p className="text-xs text-emerald-600 mt-1.5">{state.success}</p>
  return null
}

export function LeadStatusActions({ leadId, statut, consentementPartenaire }: { leadId: string; statut: LeadB2CStatus; consentementPartenaire: ConsentementStatus }) {
  const [statusState, statusAction, statusPending] = useActionState(updateLeadStatusAction, initialState)
  const [consentState, consentAction, consentPending] = useActionState(updateConsentementAction, initialState)

  return (
    <div className="flex flex-wrap items-start gap-4 mt-3">
      <form action={statusAction} className="flex items-center gap-2">
        <input type="hidden" name="leadId" value={leadId} />
        <label className="text-xs text-slate-500">Statut</label>
        <select name="statut" defaultValue={statut} className="text-xs border border-slate-200 rounded-lg px-2 py-1">
          {LEAD_STATUSES.map(s => (
            <option key={s} value={s}>{LEAD_B2C_STATUS_LABELS[s]}</option>
          ))}
        </select>
        <button type="submit" disabled={statusPending} className="text-xs px-2.5 py-1 rounded-lg bg-[#0B1B2B] text-white disabled:opacity-50">
          {statusPending ? '...' : 'Mettre à jour'}
        </button>
        <FormFeedback state={statusState} />
      </form>

      <form action={consentAction} className="flex items-center gap-2">
        <input type="hidden" name="leadId" value={leadId} />
        <label className="text-xs text-slate-500">Consentement</label>
        <select name="consentementPartenaire" defaultValue={consentementPartenaire} className="text-xs border border-slate-200 rounded-lg px-2 py-1">
          {CONSENTEMENTS.map(c => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <button type="submit" disabled={consentPending} className="text-xs px-2.5 py-1 rounded-lg bg-[#0B1B2B] text-white disabled:opacity-50">
          {consentPending ? '...' : 'Mettre à jour'}
        </button>
        <FormFeedback state={consentState} />
      </form>
    </div>
  )
}

export function TransmitForm({ leadId, organisationId, organisationNom, prixLead }: { leadId: string; organisationId: string; organisationNom: string; prixLead?: number }) {
  const [state, action, pending] = useActionState(transmitLeadAction, initialState)

  return (
    <form action={action} className="mt-2 pt-2 border-t border-slate-100 space-y-1.5">
      <input type="hidden" name="leadId" value={leadId} />
      <input type="hidden" name="organisationId" value={organisationId} />
      <div className="flex items-center gap-2">
        <input
          type="number"
          name="prixLead"
          defaultValue={prixLead}
          placeholder="Prix lead (€)"
          min="0"
          step="0.01"
          className="text-xs border border-slate-200 rounded-lg px-2 py-1 w-28"
        />
        <label className="flex items-center gap-1 text-xs text-slate-500">
          <input type="checkbox" name="exclusive" />
          Exclusif
        </label>
        <button type="submit" disabled={pending} className="text-xs px-2.5 py-1 rounded-lg bg-[#C9A96E] text-[#0B1B2B] font-semibold disabled:opacity-50">
          {pending ? '...' : `Transmettre à ${organisationNom}`}
        </button>
      </div>
      <input
        type="text"
        name="note"
        placeholder="Note (optionnel)"
        className="text-xs border border-slate-200 rounded-lg px-2 py-1 w-full"
      />
      <FormFeedback state={state} />
    </form>
  )
}
