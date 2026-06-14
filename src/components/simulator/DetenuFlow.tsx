'use client'
import { useRef, useState } from 'react'
import { clsx } from 'clsx'
import { StepIndicator } from './StepIndicator'
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
  const [step, setStep] = useState(1)
  const [data, setData] = useState<ProjectInputDetenu>(DEFAULT_INPUT_DETENU)
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
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

  const handleSubmit = async () => {
    if (!email.trim() || !email.includes('@')) {
      setStatus('error')
      return
    }
    setStatus('loading')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profil: 'particulier',
          nom: nom.trim() || 'Analyse Conserver/Vendre',
          email: email.trim(),
          besoin: 'Demande d\'analyse Conserver/Vendre — bien déjà détenu',
          input: data,
        }),
      })
      if (!res.ok) throw new Error()
      setStatus('done')
    } catch {
      setStatus('error')
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
                <span className="inline-block text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full mb-3">
                  Analyse en cours de finalisation
                </span>
                <h2 className="font-playfair text-2xl font-bold text-[#0B1B2B]">Merci pour ces informations</h2>
                <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                  Le moteur de calcul de l&apos;arbitrage Conserver/Vendre est en cours de finalisation.
                  Laissez vos coordonnées : dès qu&apos;il sera disponible, nous générerons votre rapport
                  d&apos;aide à la décision à partir des informations que vous venez de saisir.
                </p>
              </div>

              {status === 'done' ? (
                <p className="text-sm text-emerald-600 font-medium">Merci ! Nous vous tiendrons informé dès que votre rapport sera disponible.</p>
              ) : (
                <div className="max-w-sm mx-auto space-y-2">
                  <input
                    type="text"
                    value={nom}
                    onChange={e => setNom(e.target.value)}
                    placeholder="Votre nom (facultatif)"
                    className="w-full text-sm rounded-lg px-3 py-2 border border-slate-200"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Votre email"
                    className="w-full text-sm rounded-lg px-3 py-2 border border-slate-200"
                  />
                  {status === 'error' && <p className="text-xs text-red-500">Indiquez un email valide.</p>}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={status === 'loading'}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-2 rounded-lg text-sm transition-colors disabled:opacity-60"
                  >
                    {status === 'loading' ? '...' : 'Être prévenu(e) et recevoir mon rapport'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

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
            <div className="w-24" />
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center mt-4">
        Simulation indicative. Ne constitue pas un conseil en investissement ni un conseil fiscal.
      </p>
    </div>
  )
}
