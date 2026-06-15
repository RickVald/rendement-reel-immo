'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { clsx } from 'clsx'
import { StepIndicator } from './StepIndicator'
import { LeadGateModal } from './LeadGateModal'
import { TypeAnalyseStep, type TypeAnalyse } from './TypeAnalyseStep'
import { ComingSoonAnalyse } from './ComingSoonAnalyse'
import { DetenuFlow } from './DetenuFlow'
import { CoherenceFlow } from './CoherenceFlow'
import { Step1, StepPF, Step2, Step3, Step4, Step5, Step6, Step7, Step8 } from './steps'
import { DEFAULT_INPUT } from '@/data/defaults'
import { QA_SCENARIOS, applyScenario } from '@/data/qa-scenarios'
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
  const [typeAnalyse, setTypeAnalyse] = useState<TypeAnalyse | null>(null)
  const [step, setStep] = useState(1)
  const [data, setData] = useState<ProjectInput>(DEFAULT_INPUT)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [gateOpen, setGateOpen] = useState(false)
  const [isQa, setIsQa] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mode QA : ?qa=1 désactive le formulaire de contact (lead gate) et active
  // les outils d'audit (import/export JSON, scénarios pré-chargés).
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('qa') === '1') {
      setIsQa(true)
      sessionStorage.setItem('rri_qa', 'true')
    }
  }, [])

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

  const topRef = useRef<HTMLDivElement>(null)

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleNext = () => {
    if (step < 9) setStep(s => s + 1)
    scrollToTop()
  }

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1)
    scrollToTop()
  }

  const handleSubmit = async (opts?: { simplifie?: boolean }) => {
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
      if (opts?.simplifie) {
        sessionStorage.setItem('rri_simplified', 'true')
      } else {
        sessionStorage.removeItem('rri_simplified')
      }
      router.push('/resultats')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inattendue')
      setLoading(false)
    }
  }

  const handleAnalyzeClick = () => {
    if (isQa) {
      handleSubmit()
      return
    }
    setGateOpen(true)
  }

  const handleLoadScenario = (id: string) => {
    const scenario = QA_SCENARIOS.find(s => s.id === id)
    if (!scenario) return
    setData(applyScenario(scenario.overrides))
    setStep(1)
    scrollToTop()
  }

  const handleExportInput = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rri-scenario-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportInput = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as ProjectInput
      setData(parsed)
      setStep(1)
      setError(null)
      scrollToTop()
    } catch {
      setError('Fichier JSON invalide.')
    }
  }

  const header = typeAnalyse === 'detenu'
    ? {
        eyebrow: 'Parcours conserver ou vendre — gratuit',
        title: 'Conserver ou vendre : analysez l\'arbitrage de votre bien',
        sub: 'Performance locative actuelle · Fiscalité de cession · Comparaison conserver/vendre · Verdict indicatif',
      }
    : typeAnalyse === 'audit_global'
    ? {
        eyebrow: 'Préparer un rendez-vous — gratuit',
        title: 'Préparez votre rendez-vous avec un professionnel',
        sub: 'Profil, objectifs, patrimoine, dettes, protection, transmission · Points d\'attention indicatifs',
      }
    : {
        eyebrow: 'Simulateur complet — gratuit',
        title: 'Analysez la rentabilité réelle de votre projet',
        sub: '9 étapes · Rendement net-net · Cash-flow · TRI · VAN · Verdict · Synthèse automatique',
      }

  return (
    <>
    {/* Header section */}
    <div className="bg-[#0F1B2D] text-white py-12">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <p className="text-emerald-400 font-mono text-xs tracking-widest uppercase mb-3">
          {header.eyebrow}
        </p>
        <h1 className="text-3xl font-bold mb-3">
          {header.title}
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed">
          {header.sub}
        </p>
      </div>
    </div>

    {/* Form */}
    <div className="py-10 px-6">
    <div className="max-w-2xl mx-auto">
      {/* Scroll anchor: jumps here on step change so mobile users land at the top of the form */}
      <div ref={topRef} className="scroll-mt-20" />

      {/* Bandeau mode QA */}
      {isQa && (
        <div className="mb-6 bg-amber-50 border border-amber-300 rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">
            Mode QA — paiement et lead gate désactivés
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <select
              onChange={e => { if (e.target.value) handleLoadScenario(e.target.value) }}
              defaultValue=""
              className="text-sm rounded-lg border border-amber-300 px-3 py-2 bg-white"
            >
              <option value="">Charger un scénario test...</option>
              {QA_SCENARIOS.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleExportInput}
              className="text-sm font-medium px-3 py-2 rounded-lg border border-amber-300 bg-white hover:bg-amber-100 transition-colors"
            >
              Exporter JSON (entrées)
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-medium px-3 py-2 rounded-lg border border-amber-300 bg-white hover:bg-amber-100 transition-colors"
            >
              Importer un scénario JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) handleImportInput(file)
                e.target.value = ''
              }}
            />
          </div>
          <p className="text-xs text-amber-700">
            Le bouton « Analyser » génère directement le rapport complet, sans formulaire de contact.
            Sur la page de résultats, utilisez « Exporter JSON (résultats) » pour récupérer les calculs source.
          </p>
        </div>
      )}

      {typeAnalyse === 'detenu' ? (
        <DetenuFlow onBack={() => setTypeAnalyse(null)} />
      ) : typeAnalyse === 'audit_global' ? (
        <CoherenceFlow onBack={() => setTypeAnalyse(null)} />
      ) : (
      <>
      {/* Step indicator */}
      {typeAnalyse === 'achat' && (
        <div className="mb-8">
          <StepIndicator current={step} />
        </div>
      )}

      {/* Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Card header */}
        {typeAnalyse === 'achat' && (
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
            <h2 className="font-bold text-slate-900">{currentTitle.title}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{currentTitle.sub}</p>
          </div>
        )}

        {/* Card body */}
        <div className="px-6 py-6">
          {typeAnalyse === null ? (
            <TypeAnalyseStep onSelect={setTypeAnalyse} />
          ) : typeAnalyse === 'achat' ? (
            <CurrentStep {...stepProps} />
          ) : (
            <ComingSoonAnalyse type={typeAnalyse} onBack={() => setTypeAnalyse(null)} />
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Navigation */}
        {typeAnalyse === 'achat' && (
          <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Précédent
            </button>

            <div className="text-xs text-slate-400 whitespace-nowrap shrink-0">
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
                onClick={handleAnalyzeClick}
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
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-slate-400 text-center mt-4">
        Simulation indicative. Ne constitue pas un conseil en investissement ni un conseil fiscal.
      </p>

      <LeadGateModal
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        onUnlockParticulier={() => {
          setGateOpen(false)
          handleSubmit({ simplifie: true })
        }}
        onUnlockComplet={() => {
          setGateOpen(false)
          handleSubmit()
        }}
        input={data}
      />
      </>
      )}
    </div>
    </div>
    </>
  )
}
