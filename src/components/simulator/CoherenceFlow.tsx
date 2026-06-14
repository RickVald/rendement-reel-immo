'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { clsx } from 'clsx'
import { StepIndicator } from './StepIndicator'
import { LeadGateModal } from './LeadGateModal'
import {
  StepProfilPersonnel, StepObjectifsPatrimoniaux, StepRevenusChargesEpargne,
  StepPatrimoineImmobilier, StepPatrimoineFinancier, StepDettes,
  StepProtectionFoyer, StepTransmission,
} from './steps-bilan'
import { DEFAULT_INPUT_BILAN } from '@/data/defaults-bilan'
import type { ProjectInputBilan } from '@/lib/calculator/types-bilan'

const STEPS = [
  StepProfilPersonnel, StepObjectifsPatrimoniaux, StepRevenusChargesEpargne,
  StepPatrimoineImmobilier, StepPatrimoineFinancier, StepDettes,
  StepProtectionFoyer, StepTransmission,
]

const STEP_TITLES = [
  { n: 1, title: 'Votre profil', sub: 'Situation familiale, professionnelle et budget global', label: 'Profil' },
  { n: 2, title: 'Vos objectifs patrimoniaux', sub: 'Ce que vous souhaitez accomplir, et à quel horizon', label: 'Objectifs' },
  { n: 3, title: 'Revenus, charges et épargne', sub: 'Votre situation budgétaire mensuelle', label: 'Budget' },
  { n: 4, title: 'Patrimoine immobilier', sub: 'Les biens immobiliers que vous détenez', label: 'Immobilier' },
  { n: 5, title: 'Patrimoine financier', sub: 'Vos placements financiers (livrets, AV, PEA, PER...)', label: 'Financier' },
  { n: 6, title: 'Dettes', sub: 'Vos autres crédits en cours', label: 'Dettes' },
  { n: 7, title: 'Protection du foyer', sub: 'Assurances et prévoyance', label: 'Protection' },
  { n: 8, title: 'Transmission', sub: 'Organisation successorale', label: 'Transmission' },
]

export function CoherenceFlow({ onBack }: { onBack: () => void }) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<ProjectInputBilan>(DEFAULT_INPUT_BILAN)
  const [gateOpen, setGateOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const nomRef = useRef('')

  const scrollToTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const updateData = (patch: Partial<ProjectInputBilan>) => {
    setData(prev => {
      const next = { ...prev }
      for (const key of Object.keys(patch) as (keyof ProjectInputBilan)[]) {
        const patchVal = patch[key]
        const prevVal = prev[key]
        if (
          patchVal !== null && typeof patchVal === 'object' && !Array.isArray(patchVal) &&
          prevVal !== null && typeof prevVal === 'object' && !Array.isArray(prevVal)
        ) {
          ;(next as Record<string, unknown>)[key] = { ...prevVal, ...patchVal }
        } else {
          ;(next as Record<string, unknown>)[key] = patchVal
        }
      }
      return next
    })
  }

  const TOTAL = STEPS.length + 1 // + écran de synthèse / envoi
  const CurrentStep = STEPS[step - 1]
  const currentTitle = STEP_TITLES[step - 1]

  const handleNext = () => { if (step < TOTAL) setStep(s => s + 1); scrollToTop() }
  const handleBack = () => { if (step > 1) setStep(s => s - 1); scrollToTop() }

  const handleAnalyze = async (nom: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/analyze-coherence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(await res.text())
      const analysis = await res.json()
      sessionStorage.setItem('rri_analysis_bilan', JSON.stringify(analysis))
      sessionStorage.setItem('rri_bilan_nom', nom)
      router.push('/resultats-bilan')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inattendue')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div ref={topRef} className="scroll-mt-20" />

      <div className="mb-8">
        <StepIndicator
          current={Math.min(step, STEPS.length)}
          steps={STEP_TITLES.map(s => ({ n: s.n, label: s.label }))}
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {step <= STEPS.length && (
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
            <h2 className="font-bold text-slate-900">{currentTitle.title}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{currentTitle.sub}</p>
          </div>
        )}

        <div className="px-6 py-6">
          {step <= STEPS.length ? (
            <CurrentStep data={data} onChange={updateData} />
          ) : (
            <div className="space-y-5 text-center py-4">
              <div>
                <h2 className="font-playfair text-2xl font-bold text-[#0B1B2B]">Merci pour ces informations</h2>
                <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                  Nous avons tout ce qu&apos;il faut pour établir votre bilan indicatif de cohérence
                  patrimoniale, pilier par pilier, à partir des informations que vous avez déclarées.
                </p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mx-6 mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={step === 1 ? onBack : handleBack}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            ← {step === 1 ? "Choisir un autre type d'analyse" : 'Précédent'}
          </button>

          <div className="text-xs text-slate-400 whitespace-nowrap shrink-0">
            {step} / {TOTAL}
          </div>

          {step < TOTAL ? (
            <button
              type="button"
              onClick={handleNext}
              className={clsx('bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-2 rounded-lg text-sm transition-colors')}
            >
              Suivant →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setGateOpen(true)}
              disabled={loading}
              className={clsx(
                'font-bold px-6 py-2 rounded-lg text-sm transition-all',
                loading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 text-white'
              )}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                  Calcul en cours...
                </span>
              ) : (
                '📊 Générer mon bilan de cohérence'
              )}
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center mt-4">
        Bilan indicatif basé sur les informations déclarées. Ne constitue pas un conseil patrimonial,
        financier, fiscal, juridique ou assurantiel personnalisé.
      </p>

      <LeadGateModal
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        bilanMode
        onNomSaisi={nom => { nomRef.current = nom }}
        onUnlockParticulier={() => {
          setGateOpen(false)
          handleAnalyze(nomRef.current)
        }}
        onUnlockComplet={() => {
          setGateOpen(false)
          handleAnalyze(nomRef.current)
        }}
        input={data}
      />
    </div>
  )
}
