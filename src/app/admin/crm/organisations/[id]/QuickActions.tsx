'use client'

import { useActionState, useState } from 'react'
import {
  createOpportuniteAction, createTaskAction, logActivityAction, scheduleFollowupAction, advanceStageAction, markLostAction, addObjectionAction,
  createPiloteAction, createAbonnementAction, assignLeadB2CAction,
  type ActionState,
} from './actions'
import { ACTIVITE_TYPE_LABELS, PIPELINE_STAGES, type PipelineStage } from '@/lib/crm/types'

const initialState: ActionState = {}

interface OppOption {
  id: string
  offre: string
  etape: PipelineStage
}

interface LeadB2COption {
  id: string
  nom: string
  ville: string
  statut: string
  consentementPartenaire: string
}

const today = () => new Date().toISOString().slice(0, 10)

function FormFeedback({ state }: { state: ActionState }) {
  return (
    <>
      {state.error && <p className="text-xs text-red-600 mt-2">{state.error}</p>}
      {state.success && <p className="text-xs text-emerald-600 mt-2">{state.success}</p>}
    </>
  )
}

function OppSelect({ opportunites, name = 'opportuniteId', required = false }: { opportunites: OppOption[]; name?: string; required?: boolean }) {
  if (opportunites.length === 0) return null
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1">Opportunité{required ? '' : ' (optionnel)'}</label>
      <select name={name} required={required} className="text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 min-w-[220px]">
        {!required && <option value="">— Aucune —</option>}
        {opportunites.map(o => (
          <option key={o.id} value={o.id}>{o.offre}</option>
        ))}
      </select>
    </div>
  )
}

const ACTIONS = [
  { id: 'opportunite', label: 'Nouvelle opportunité' },
  { id: 'task', label: 'Créer une tâche' },
  { id: 'activity', label: 'Noter une activité' },
  { id: 'followup', label: 'Programmer une relance' },
  { id: 'advance', label: 'Étape suivante' },
  { id: 'lost', label: 'Marquer perdu' },
  { id: 'objection', label: 'Enregistrer une objection' },
  { id: 'pilote', label: 'Créer un pilote' },
  { id: 'abonnement', label: 'Convertir en abonnement' },
  { id: 'lead-b2c', label: 'Associer un lead B2C' },
] as const

export function QuickActions({ organisationId, opportunites, leadsB2C = [] }: { organisationId: string; opportunites: OppOption[]; leadsB2C?: LeadB2COption[] }) {
  const [open, setOpen] = useState<string | null>(null)
  const advanceable = opportunites.filter(o => o.etape !== 'PERDU' && o.etape !== PIPELINE_STAGES[PIPELINE_STAGES.length - 2].id)
  const losable = opportunites.filter(o => o.etape !== 'PERDU')

  const [oppState, oppAction, oppPending] = useActionState(createOpportuniteAction, initialState)
  const [taskState, taskAction, taskPending] = useActionState(createTaskAction, initialState)
  const [activityState, activityAction, activityPending] = useActionState(logActivityAction, initialState)
  const [followupState, followupAction, followupPending] = useActionState(scheduleFollowupAction, initialState)
  const [advanceState, advanceAction, advancePending] = useActionState(advanceStageAction, initialState)
  const [lostState, lostAction, lostPending] = useActionState(markLostAction, initialState)
  const [objectionState, objectionAction, objectionPending] = useActionState(addObjectionAction, initialState)
  const [piloteState, piloteAction, pilotePending] = useActionState(createPiloteAction, initialState)
  const [abonnementState, abonnementAction, abonnementPending] = useActionState(createAbonnementAction, initialState)
  const [leadB2CState, leadB2CAction, leadB2CPending] = useActionState(assignLeadB2CAction, initialState)

  const transmissibleLeads = leadsB2C.filter(l => l.consentementPartenaire === 'OPT_IN')

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map(a => (
          <button
            key={a.id}
            type="button"
            onClick={() => setOpen(o => (o === a.id ? null : a.id))}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
              open === a.id
                ? 'border-[#C9A96E] text-[#0B1B2B] bg-[#C9A96E]/10'
                : 'border-slate-200 text-slate-600 hover:text-[#0B1B2B] hover:border-[#C9A96E]'
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {open === 'opportunite' && (
        <form action={oppAction} className="rounded-lg border border-slate-200 p-4 space-y-3">
          <input type="hidden" name="organisationId" value={organisationId} />
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Offre</label>
              <input name="offre" required className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2" placeholder="Ex : Abonnement SaaS" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Montant (€, optionnel)</label>
              <input type="number" name="montant" min={0} className="text-sm rounded-lg border border-slate-200 px-3 py-2" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Score ICP (0-100)</label>
              <input type="number" name="scoreICP" min={0} max={100} defaultValue={50} className="text-sm rounded-lg border border-slate-200 px-3 py-2 w-24" />
            </div>
          </div>
          <button type="submit" disabled={oppPending} className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#0B1B2B] text-white hover:bg-[#0B1B2B]/90 transition-colors disabled:opacity-50">
            {oppPending ? '...' : 'Créer l\'opportunité'}
          </button>
          <FormFeedback state={oppState} />
        </form>
      )}

      {open === 'task' && (
        <form action={taskAction} className="rounded-lg border border-slate-200 p-4 space-y-3">
          <input type="hidden" name="organisationId" value={organisationId} />
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Tâche</label>
              <input name="resume" required className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2" placeholder="Ex : Préparer la démo" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
              <input type="date" name="date" required defaultValue={today()} className="text-sm rounded-lg border border-slate-200 px-3 py-2" />
            </div>
            <OppSelect opportunites={opportunites} />
          </div>
          <button type="submit" disabled={taskPending} className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#0B1B2B] text-white hover:bg-[#0B1B2B]/90 transition-colors disabled:opacity-50">
            {taskPending ? '...' : 'Créer la tâche'}
          </button>
          <FormFeedback state={taskState} />
        </form>
      )}

      {open === 'activity' && (
        <form action={activityAction} className="rounded-lg border border-slate-200 p-4 space-y-3">
          <input type="hidden" name="organisationId" value={organisationId} />
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Type</label>
              <select name="type" defaultValue="NOTE" className="text-sm rounded-lg border border-slate-200 bg-white px-3 py-2">
                {(['EMAIL', 'APPEL', 'LINKEDIN', 'DEMO', 'NOTE'] as const).map(t => (
                  <option key={t} value={t}>{ACTIVITE_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Résultat</label>
              <select name="resultat" defaultValue="" className="text-sm rounded-lg border border-slate-200 bg-white px-3 py-2">
                <option value="">—</option>
                <option value="POSITIF">Positif</option>
                <option value="NEGATIF">Négatif</option>
                <option value="SANS_REPONSE">Sans réponse</option>
                <option value="A_RELANCER">À relancer</option>
                <option value="OK">OK</option>
              </select>
            </div>
            <OppSelect opportunites={opportunites} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Résumé</label>
            <textarea name="resume" required rows={2} className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2" placeholder="Ce qui s'est passé..." />
          </div>
          <button type="submit" disabled={activityPending} className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#0B1B2B] text-white hover:bg-[#0B1B2B]/90 transition-colors disabled:opacity-50">
            {activityPending ? '...' : 'Enregistrer'}
          </button>
          <FormFeedback state={activityState} />
        </form>
      )}

      {open === 'followup' && (
        <form action={followupAction} className="rounded-lg border border-slate-200 p-4 space-y-3">
          <input type="hidden" name="organisationId" value={organisationId} />
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Date de relance</label>
              <input type="date" name="date" required defaultValue={today()} className="text-sm rounded-lg border border-slate-200 px-3 py-2" />
            </div>
            <div className="flex-1 min-w-[220px]">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Note (optionnel)</label>
              <input name="resume" className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2" placeholder="Ex : Relancer après envoi de la proposition" />
            </div>
            <OppSelect opportunites={opportunites} />
          </div>
          <button type="submit" disabled={followupPending} className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#0B1B2B] text-white hover:bg-[#0B1B2B]/90 transition-colors disabled:opacity-50">
            {followupPending ? '...' : 'Programmer'}
          </button>
          <FormFeedback state={followupState} />
        </form>
      )}

      {open === 'advance' && (
        <form action={advanceAction} className="rounded-lg border border-slate-200 p-4 space-y-3">
          <input type="hidden" name="organisationId" value={organisationId} />
          {advanceable.length === 0
            ? <p className="text-sm text-slate-400">Aucune opportunité à faire avancer.</p>
            : (
              <div className="flex flex-wrap gap-3 items-end">
                <OppSelect opportunites={advanceable} required />
                <button type="submit" disabled={advancePending} className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#0B1B2B] text-white hover:bg-[#0B1B2B]/90 transition-colors disabled:opacity-50">
                  {advancePending ? '...' : 'Passer à l\'étape suivante'}
                </button>
              </div>
            )}
          <FormFeedback state={advanceState} />
        </form>
      )}

      {open === 'lost' && (
        <form action={lostAction} className="rounded-lg border border-slate-200 p-4 space-y-3">
          <input type="hidden" name="organisationId" value={organisationId} />
          {losable.length === 0
            ? <p className="text-sm text-slate-400">Aucune opportunité active à marquer perdue.</p>
            : (
              <>
                <div className="flex flex-wrap gap-3">
                  <OppSelect opportunites={losable} required />
                  <div className="flex-1 min-w-[220px]">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Raison de la perte</label>
                    <input name="raisonPerte" required className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2" placeholder="Ex : Budget insuffisant" />
                  </div>
                </div>
                <button type="submit" disabled={lostPending} className="text-sm font-semibold px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50">
                  {lostPending ? '...' : 'Marquer perdu'}
                </button>
              </>
            )}
          <FormFeedback state={lostState} />
        </form>
      )}

      {open === 'objection' && (
        <form action={objectionAction} className="rounded-lg border border-slate-200 p-4 space-y-3">
          <input type="hidden" name="organisationId" value={organisationId} />
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Catégorie</label>
              <input name="categorie" required className="text-sm rounded-lg border border-slate-200 px-3 py-2" placeholder="Ex : prix" />
            </div>
            <OppSelect opportunites={opportunites} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Objection</label>
            <textarea name="texte" required rows={2} className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2" placeholder="Ce que le prospect a dit..." />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Réponse apportée (optionnel)</label>
            <textarea name="reponse" rows={2} className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2" />
          </div>
          <button type="submit" disabled={objectionPending} className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#0B1B2B] text-white hover:bg-[#0B1B2B]/90 transition-colors disabled:opacity-50">
            {objectionPending ? '...' : 'Enregistrer'}
          </button>
          <FormFeedback state={objectionState} />
        </form>
      )}

      {open === 'pilote' && (
        <form action={piloteAction} className="rounded-lg border border-slate-200 p-4 space-y-3">
          <input type="hidden" name="organisationId" value={organisationId} />
          {opportunites.length === 0
            ? <p className="text-sm text-slate-400">Crée d&apos;abord une opportunité pour pouvoir lancer un pilote.</p>
            : (
              <div className="flex flex-wrap gap-3 items-end">
                <OppSelect opportunites={opportunites} required />
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Début</label>
                  <input type="date" name="dateDebut" required defaultValue={today()} className="text-sm rounded-lg border border-slate-200 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Fin</label>
                  <input type="date" name="dateFin" required className="text-sm rounded-lg border border-slate-200 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Quota de rapports</label>
                  <input type="number" name="quotaRapports" min={0} defaultValue={10} className="text-sm rounded-lg border border-slate-200 px-3 py-2 w-28" />
                </div>
                <button type="submit" disabled={pilotePending} className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#0B1B2B] text-white hover:bg-[#0B1B2B]/90 transition-colors disabled:opacity-50">
                  {pilotePending ? '...' : 'Démarrer le pilote'}
                </button>
              </div>
            )}
          <FormFeedback state={piloteState} />
        </form>
      )}

      {open === 'abonnement' && (
        <form action={abonnementAction} className="rounded-lg border border-slate-200 p-4 space-y-3">
          <input type="hidden" name="organisationId" value={organisationId} />
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Plan</label>
              <input name="plan" required className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2" placeholder="Ex : Pro mensuel" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Niveau</label>
              <select name="niveauAbonnement" defaultValue="PRO" className="text-sm rounded-lg border border-slate-200 bg-white px-3 py-2">
                <option value="PRO">Pro</option>
                <option value="CABINET">Cabinet</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">MRR (€)</label>
              <input type="number" name="mrr" min={0} required className="text-sm rounded-lg border border-slate-200 px-3 py-2 w-28" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Début</label>
              <input type="date" name="dateDebut" required defaultValue={today()} className="text-sm rounded-lg border border-slate-200 px-3 py-2" />
            </div>
            <OppSelect opportunites={opportunites} />
          </div>
          <button type="submit" disabled={abonnementPending} className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#0B1B2B] text-white hover:bg-[#0B1B2B]/90 transition-colors disabled:opacity-50">
            {abonnementPending ? '...' : 'Convertir en abonnement'}
          </button>
          <FormFeedback state={abonnementState} />
        </form>
      )}

      {open === 'lead-b2c' && (
        <form action={leadB2CAction} className="rounded-lg border border-slate-200 p-4 space-y-3">
          <input type="hidden" name="organisationId" value={organisationId} />
          {transmissibleLeads.length === 0
            ? <p className="text-sm text-slate-400">Aucun lead B2C avec consentement de transmission disponible pour l&apos;instant.</p>
            : (
              <>
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="flex-1 min-w-[220px]">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Lead B2C</label>
                    <select name="leadId" required className="w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-2">
                      {transmissibleLeads.map(l => (
                        <option key={l.id} value={l.id}>{l.nom} — {l.ville} ({l.statut})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Prix du lead (€, optionnel)</label>
                    <input type="number" name="prixLead" min={0} className="text-sm rounded-lg border border-slate-200 px-3 py-2 w-32" />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-600 pb-2">
                    <input type="checkbox" name="exclusive" className="rounded border-slate-300" />
                    Exclusif
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Note (optionnel)</label>
                  <input name="note" className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2" placeholder="Ex : transmis suite à appel du..." />
                </div>
                <button type="submit" disabled={leadB2CPending} className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#0B1B2B] text-white hover:bg-[#0B1B2B]/90 transition-colors disabled:opacity-50">
                  {leadB2CPending ? '...' : 'Associer & transmettre'}
                </button>
              </>
            )}
          <FormFeedback state={leadB2CState} />
        </form>
      )}
    </div>
  )
}
