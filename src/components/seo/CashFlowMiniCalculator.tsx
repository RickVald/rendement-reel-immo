'use client'

import { useState } from 'react'
import Link from 'next/link'

function toNumber(value: string): number {
  const n = Number(value.replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

export function CashFlowMiniCalculator() {
  const [loyer, setLoyer] = useState('750')
  const [credit, setCredit] = useState('620')
  const [charges, setCharges] = useState('40')
  const [taxeFonciere, setTaxeFonciere] = useState('900')
  const [assurance, setAssurance] = useState('15')

  const cashFlowMensuel =
    toNumber(loyer) - toNumber(credit) - toNumber(charges) - toNumber(taxeFonciere) / 12 - toNumber(assurance)
  const cashFlowAnnuel = cashFlowMensuel * 12

  return (
    <section className="my-12 bg-[#0B1B2B] rounded-2xl px-6 py-8 md:px-10 md:py-10 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent" />
      <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-2">Estimation rapide</p>
      <h2 className="font-playfair text-xl md:text-2xl font-bold text-white mb-6 leading-tight">
        Estimez rapidement votre cash-flow immobilier
      </h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <label className="block">
          <span className="text-xs text-slate-400 mb-1.5 block">Loyer mensuel (€)</span>
          <input
            type="text"
            inputMode="decimal"
            value={loyer}
            onChange={(e) => setLoyer(e.target.value)}
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A96E]"
          />
        </label>
        <label className="block">
          <span className="text-xs text-slate-400 mb-1.5 block">Mensualité de crédit (€)</span>
          <input
            type="text"
            inputMode="decimal"
            value={credit}
            onChange={(e) => setCredit(e.target.value)}
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A96E]"
          />
        </label>
        <label className="block">
          <span className="text-xs text-slate-400 mb-1.5 block">Charges non récupérables (€/mois)</span>
          <input
            type="text"
            inputMode="decimal"
            value={charges}
            onChange={(e) => setCharges(e.target.value)}
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A96E]"
          />
        </label>
        <label className="block">
          <span className="text-xs text-slate-400 mb-1.5 block">Taxe foncière (€/an)</span>
          <input
            type="text"
            inputMode="decimal"
            value={taxeFonciere}
            onChange={(e) => setTaxeFonciere(e.target.value)}
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A96E]"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs text-slate-400 mb-1.5 block">Assurance (€/mois)</span>
          <input
            type="text"
            inputMode="decimal"
            value={assurance}
            onChange={(e) => setAssurance(e.target.value)}
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A96E]"
          />
        </label>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span className="text-sm text-slate-300">Cash-flow avant impôts (estimation)</span>
        <span className={`font-playfair text-2xl font-bold ${cashFlowMensuel >= 0 ? 'text-[#C9A96E]' : 'text-red-400'}`}>
          {cashFlowMensuel >= 0 ? '+' : ''}{cashFlowMensuel.toFixed(0)} €/mois
          <span className="text-sm text-slate-400 font-normal ml-2">
            ({cashFlowAnnuel >= 0 ? '+' : ''}{cashFlowAnnuel.toFixed(0)} €/an)
          </span>
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Ce résultat ne tient pas compte de la fiscalité, de la vacance locative ni de la provision
        pour travaux. Pour un calcul complet (cash-flow net après impôts, TRI, VAN, prix cible), utilisez
        le simulateur.
      </p>
      <Link
        href="/simulateur"
        className="inline-flex items-center gap-2 bg-[#C9A96E] hover:bg-[#d4b87a] text-[#0B1B2B] font-semibold text-sm px-6 py-3 rounded-full transition-colors"
      >
        Faire le calcul complet avec fiscalité
      </Link>
    </section>
  )
}
