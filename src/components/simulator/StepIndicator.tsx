'use client'
import { clsx } from 'clsx'

const STEPS = [
  { n: 1, label: 'Bien' },
  { n: 2, label: 'Acquisition' },
  { n: 3, label: 'Financement' },
  { n: 4, label: 'Location' },
  { n: 5, label: 'Charges' },
  { n: 6, label: 'Travaux' },
  { n: 7, label: 'Fiscalité' },
  { n: 8, label: 'Revente' },
]

export function StepIndicator({ current }: { current: number }) {
  return (
    <div className="w-full">
      {/* Mobile: progress bar */}
      <div className="md:hidden">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Étape {current} sur {STEPS.length}</span>
          <span>{STEPS[current - 1]?.label}</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full">
          <div
            className="h-1.5 bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${(current / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop: step list */}
      <div className="hidden md:flex items-center justify-between">
        {STEPS.map((step, i) => (
          <div key={step.n} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  step.n < current
                    ? 'bg-emerald-500 text-white'
                    : step.n === current
                    ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                    : 'bg-slate-100 text-slate-400'
                )}
              >
                {step.n < current ? '✓' : step.n}
              </div>
              <span
                className={clsx(
                  'text-xs whitespace-nowrap',
                  step.n === current ? 'text-emerald-600 font-semibold' : 'text-slate-400'
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={clsx(
                  'flex-1 h-0.5 mx-2 mb-5 transition-all',
                  step.n < current ? 'bg-emerald-400' : 'bg-slate-200'
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
