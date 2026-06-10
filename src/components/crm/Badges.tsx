import {
  SEGMENT_LABELS, PIPELINE_STAGES, icpTier, prioriteTier, computePrioriteCommerciale,
  leadPrioriteTier, LEAD_B2C_STATUS_LABELS, LEAD_B2C_STATUS_COLORS,
  type Segment, type PipelineStage, type LeadB2CStatus,
} from '@/lib/crm/types'

export function SegmentBadge({ segment }: { segment: Segment }) {
  return (
    <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 whitespace-nowrap">
      {SEGMENT_LABELS[segment]}
    </span>
  )
}

const STAGE_COLORS: Record<PipelineStage, string> = {
  PROSPECT_IDENTIFIE: 'bg-slate-100 text-slate-600',
  CONTACTE: 'bg-sky-100 text-sky-700',
  REPONSE: 'bg-indigo-100 text-indigo-700',
  DEMO_BOOKEE: 'bg-violet-100 text-violet-700',
  DEMO_FAITE: 'bg-purple-100 text-purple-700',
  PILOTE_PROPOSE: 'bg-amber-100 text-amber-700',
  PILOTE_SIGNE: 'bg-orange-100 text-orange-700',
  ACTIVE: 'bg-teal-100 text-teal-700',
  ABONNEMENT: 'bg-emerald-100 text-emerald-700',
  PERDU: 'bg-red-100 text-red-700',
}

export function StageBadge({ stage }: { stage: PipelineStage }) {
  const label = PIPELINE_STAGES.find(s => s.id === stage)?.label ?? stage
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${STAGE_COLORS[stage]}`}>
      {label}
    </span>
  )
}

export function IcpBadge({ score }: { score: number }) {
  const tier = icpTier(score)
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${tier.color}`}>
      {score} · {tier.label}
    </span>
  )
}

export function PrioriteBadge({ icpFit, engagement, closing }: { icpFit: number; engagement?: number; closing?: number }) {
  const score = computePrioriteCommerciale(icpFit, engagement, closing)
  const tier = prioriteTier(score)
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${tier.color}`} title={tier.action}>
      {score} · {tier.label}
    </span>
  )
}

export function ScoreTriple({ icpFit, engagement, closing }: { icpFit: number; engagement?: number; closing?: number }) {
  return (
    <div className="flex items-center gap-3 text-xs text-slate-500">
      <span title="ICP Fit : est-ce la bonne cible ?">ICP <strong className="text-[#0B1B2B]">{icpFit}</strong></span>
      <span title="Engagement : a-t-il répondu, cliqué, booké ?">Engagement <strong className="text-[#0B1B2B]">{engagement ?? '—'}</strong></span>
      <span title="Closing probability : va-t-il payer ?">Closing <strong className="text-[#0B1B2B]">{closing ?? '—'}</strong></span>
    </div>
  )
}

export function LeadStatusBadge({ statut }: { statut: LeadB2CStatus }) {
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${LEAD_B2C_STATUS_COLORS[statut]}`}>
      {LEAD_B2C_STATUS_LABELS[statut]}
    </span>
  )
}

export function LeadPrioriteBadge({ score }: { score: number }) {
  const tier = leadPrioriteTier(score)
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${tier.color}`}>
      {score} · {tier.label}
    </span>
  )
}

export function Card({ title, value, sub }: { title: string; value: string; sub?: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">{title}</p>
      <p className="font-playfair text-3xl font-bold text-[#0B1B2B]">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}
