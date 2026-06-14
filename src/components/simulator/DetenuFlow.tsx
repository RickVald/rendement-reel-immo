'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { clsx } from 'clsx'
import { StepIndicator } from './StepIndicator'
import { LeadGateModal } from './LeadGateModal'
import {
  StepBienDetenu, StepHistorique, StepPretEnCours,
  StepPerformanceActuelle, StepValeurActuelle, StepAlternativeObjectif,
} from './steps-detenu'
import { DEFAULT_INPUT_DETENU } from '@/data/defaults-detenu'
import type { ProjectInputDetenu } from '@/lib/calculator/types'

const STEPS = [StepBienDetenu, StepHistorique, StepPretEnCours, StepPerformanceActuelle, StepValeurActuelle, StepAlternativeObjectif]

const STEP_TITLES = [
  { n: 1, title: 'Le bien', sub: 'Caractéristiques et mode de détention', label: 'Bien' },
  { n: 2, title: "Historique d'acquisition", sub: 'Prix initial, travaux, amortissements, déficits', label: 'Historique' },
  { n: 3, title: 'Prêt en cours', sub: 'Capital restant dû, conditions, remboursement anticipé', label: 'Prêt' },
  { n: 4, title: 'Performance actuelle', sub: 'Loyer, vacance, charges réelles, DPE', label: 'Performance' },
  { n: 5, title: 'Valeur actuelle & vente', sub: 'Valeur de marché, frais de vente, projet de cession', label: 'Valeur' },
  { n: 6, title: 'Réemploi & objectif', sub: 'Alternative de placement et objectif patrimonial', label: 'Objectif' },
]

export function DetenuFlow({ onBack }: { onBack: () => void }) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<ProjectInputDetenu>(DEFAULT_INPUT_DETENU)
  const [gateOpen, setGateOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const topRef = useRef<HTMLDivElement>(null)

  const scrollToTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const updateData = (patch: Partial<ProjectInputDetenu>) => {
    setData(prev => {
      const next = { ...prev }
      for (const key of Object.keys(patch) as (keyof ProjectInputDetenu)[]) {
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

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/analyze-detenu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(await res.text())
      const analysis = await res.json()
      sessionStorage.setItem('rri_analysis_detenu', JSON.stringify(analysis))
      router.push('/resultats-detenu')
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
                  Nous avons tout ce qu&apos;il faut pour comparer la conservation de votre bien à sa
                  vente immédiate, réinvestie dans l&apos;alternative que vous avez indiquée.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
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
                '🔍 Analyser : Conserver ou Vendre ?'
              )}
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center mt-4">
        Simulation indicative. Ne constitue pas un conseil en investissement ni un conseil fiscal.
      </p>

      <LeadGateModal
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        onUnlockParticulier={() => {
          setGateOpen(false)
          handleAnalyze()
        }}
        onUnlockComplet={() => {
          setGateOpen(false)
          handleAnalyze()
        }}
        input={data}
      />
    </div>
  )
}
