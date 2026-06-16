'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SEGMENT_LABELS } from '@/lib/crm/types'
import { VILLES_CIBLES } from '@/lib/crm/sourcing'

type ScanResult = { source: string; nbResultats: number; nbNouveaux: number; nbDoublons: number }

export function ScanForm({ defaultSegment = '', defaultVille = '' }: { defaultSegment?: string; defaultVille?: string }) {
  const router = useRouter()
  const [segment, setSegment] = useState(defaultSegment)
  const [ville, setVille] = useState(defaultVille)
  const [loading, setLoading] = useState<string | null>(null)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runScan = async (endpoint: string, label: string) => {
    setLoading(endpoint)
    setResult(null)
    setError(null)
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segment, ville }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error ?? `Erreur lors du scan ${label}`)
      setResult({ source: label, nbResultats: data.nbResultats, nbNouveaux: data.nbNouveaux, nbDoublons: data.nbDoublons })
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setLoading(null)
    }
  }

  const handleFilter = () => {
    const params = new URLSearchParams()
    if (segment) params.set('segment', segment)
    if (ville) params.set('ville', ville)
    router.push(`/admin/crm/sourcing?${params.toString()}`)
  }

  return (
    <div>
      <div className="px-5 py-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Catégorie</label>
          <select
            value={segment}
            onChange={e => setSegment(e.target.value)}
            className="text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 min-w-[200px]"
          >
            <option value="">Toutes les catégories</option>
            {Object.entries(SEGMENT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Ville / zone</label>
          <select
            value={ville}
            onChange={e => setVille(e.target.value)}
            className="text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 min-w-[220px]"
          >
            <option value="">Sélectionner une zone...</option>
            {VILLES_CIBLES.map(v => (
              <option key={v.ville} value={v.ville}>{v.label}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => runScan('/api/admin/sourcing/scan', 'Pappers')}
          disabled={!!loading}
          className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#0B1B2B] text-white hover:bg-[#1a2e44] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === '/api/admin/sourcing/scan' ? 'Scan en cours...' : 'Scan Pappers'}
        </button>
        <button
          type="button"
          onClick={() => runScan('/api/admin/sourcing/websearch', 'Web (DDG)')}
          disabled={!!loading}
          className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#C9A96E] text-white hover:bg-[#b8966a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === '/api/admin/sourcing/websearch' ? 'Recherche en cours...' : '🔍 Scan Web'}
        </button>
        <button
          type="button"
          onClick={handleFilter}
          className="text-sm font-semibold px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:text-[#0B1B2B] transition-colors"
        >
          Filtrer les résultats
        </button>
      </div>
      {error && (
        <p className="px-5 pb-3 text-sm text-red-500">{error}</p>
      )}
      {result && (
        <div className="px-5 pb-3 flex gap-4 text-sm">
          <span className="text-slate-500 text-xs">Source : {result.source}</span>
          <span className="text-slate-600">{result.nbResultats} résultats</span>
          <span className="text-emerald-600 font-medium">{result.nbNouveaux} nouveaux</span>
          {result.nbDoublons > 0 && <span className="text-amber-600">{result.nbDoublons} doublons ignorés</span>}
        </div>
      )}
      <p className="px-5 pb-4 text-xs text-slate-400">
        <strong>Pappers</strong> : registre SIRENE/RCS — nom, ville, dirigeant, téléphone, site (pas d&apos;email).
        <strong className="ml-2">Scan Web</strong> : DuckDuckGo sans clé API — cherche des cabinets sur le web et scrape email + téléphone.
      </p>
    </div>
  )
}
