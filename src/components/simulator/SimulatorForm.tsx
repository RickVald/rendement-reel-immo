'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { clsx } from 'clsx'
import { StepIndicator } from './StepIndicator'
import { Step1, StepPF, Step2, Step3, Step4, Step5, Step6, Step7, Step8 } from './steps'
import { DEFAULT_INPUT } from '@/data/defaults'
import type { ProjectInput } from '@/lib/calculator/types'

const STEP_TITLES = [
  { n: 1, title: 'Le bien', sub: 'Type, surface, DPE, localisation' },
  { n: 2, title: 'Profil fiscal', sub: 'TMI, résidence fiscale, revenus existants' },
  { n: 3, title: 'Acquisition', sub: 'Prix, frais de notaire, travaux initiaux' },
  { n: 4, title: 'Financement', sub: 'Apport, crédit, taux, mensualités' },
  { n: 5, title: 'Location', sub: 'Loyer, vacance, gestion' },
  { n: 6, title: 'Charges', sub: 'Taxe foncière, copropriété, entretien' },
  { n: 7, title: 'Travaux futurs', sub: 'DPE, gros travaux, récurrents' },
  { n: 8, title: 'Fiscalité', sub: 'Dispositif, régime, amortissements' },
  { n: 9, title: 'Revente', sub: 'Durée, revalorisation, hypothèses' },
]

export function SimulatorForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<ProjectInput>(DEFAULT_INPUT)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateData = (patch: Partial<ProjectInput>) => {
    setData(prev => {
      const next = { ...prev }
      for (const key of Object.keys(patch) as (keyof ProjectInput)[]) {
        const patchVal = patch[key]
        const prevVal = prev[key]
        // Deep-merge plain objects (fiscalite, bien, acquisition, etc.)
        // This ensures that if a step sends { fiscalite: { ...f_stale, x: newX } },
        // we merge from prev rather than blindly replacing, preserving keys set by other steps.
        if (
          patchVal !== null &&
          typeof patchVal === 'object' &&
          !Array.isArray(patchVal) &&
          prevVal !== null &&
          typeof prevVal === 'object' &&
          !Array.isArray(prevVal)
        ) {
          // Merge: prevVal baseline, then patchVal on top — patchVal wins on conflicts.
          // This is safe because each step only patches the slice it owns (fiscalite, bien…).
          ;(next as Record<string, unknown>)[key] = { ...prevVal, ...patchVal }
        } else {
          ;(next as Record<string, unknown>)[key] = patchVal
        }
      }
      return next
    })
  }

  const stepProps = { data, onChange: updateData }
  const STEPS = [Step1, StepPF, Step2, Step3, Step4, Step5, Step6, Step7, Step8]
  const CurrentStep = STEPS[step - 1]
  const currentTitle = STEP_TITLES[step - 1]

  const handleNext = () => {
    if (step < 9) setStep(s => s + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(await res.text())
      const analysis = await res.json()
      // Store in sessionStorage and redirect
      sessionStorage.setItem('rri_analysis', JSON.stringify(analysis))
      router.push('/resultats')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inattendue')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="mb-8">
        <StepIndicator current={step} />
      </div>

      {/* Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
          <h2 className="font-bold text-slate-900">{currentTitle.title}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{currentTitle.sub}</p>
        </div>

        {/* Card body */}
        <div className="px-6 py-6">
          <CurrentStep {...stepProps} />
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Précédent
          </button>

          <div className="text-xs text-slate-400">
            {step} / 9
          </div>

          {step < 9 ? (
            <button
              type="button"
              onClick={handleNext}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-2 rounded-lg text-sm transition-colors"
            >
              Suivant →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={clsx(
                'font-bold px-6 py-2 rounded-lg text-sm transition-all',
                loading
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-white'
              )}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                  Calcul en cours...
                </span>
              ) : (
                '🔍 Analyser mon projet'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-slate-400 text-center mt-4">
        Simulation indicative. Ne constitue pas un conseil en investissement ni un conseil fiscal.
      </p>
    </div>
  )
}
