'use client'
import { ReactNode } from 'react'
import { clsx } from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  prefix?: string
  suffix?: string
  error?: string
}

export function Input({ label, hint, prefix, suffix, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
      <div className="flex items-center border border-slate-200 rounded-lg bg-white focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-100 transition-all">
        {prefix && <span className="px-3 text-slate-400 text-sm border-r border-slate-200 bg-slate-50 rounded-l-lg py-2">{prefix}</span>}
        <input
          className={clsx('flex-1 px-3 py-2 text-sm text-slate-900 bg-transparent outline-none rounded-lg', className)}
          {...props}
        />
        {suffix && <span className="px-3 text-slate-400 text-sm border-l border-slate-200 bg-slate-50 rounded-r-lg py-2">{suffix}</span>}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  hint?: string
  options: { value: string; label: string; disabled?: boolean }[]
}

export function Select({ label, hint, options, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
      <select
        className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 outline-none transition-all"
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

interface ToggleProps {
  label: string
  hint?: string
  checked: boolean
  onChange: (v: boolean) => void
}

export function Toggle({ label, hint, checked, onChange }: ToggleProps) {
  return (
    <div className="flex items-start justify-between gap-3 w-full">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-slate-700 leading-snug">{label}</div>
        {hint && <div className="text-xs text-slate-400 mt-0.5 leading-snug">{hint}</div>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none mt-0.5',
          checked ? 'bg-emerald-500' : 'bg-slate-200'
        )}
      >
        <span
          className={clsx(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  )
}

interface SectionProps { title: string; children: ReactNode }
export function Section({ title, children }: SectionProps) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

export function Grid2({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
}
