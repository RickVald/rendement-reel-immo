'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { parseOriasCSV, type OriasRecord } from '@/lib/crm/orias'

const SEGMENT_LABEL: Record<string, string> = {
  CGP_IMMOBILIER: 'CGP / CIF',
  COURTIER_INVESTISSEUR: 'Courtier / IOBSP',
}

export function OriasImportForm() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<OriasRecord[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ nbResultats: number; nbNouveaux: number; nbDoublons: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setResult(null)
    setError(null)
    setPreview(null)

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string
        const records = parseOriasCSV(text)
        if (records.length === 0) {
          setError('Aucun enregistrement trouvé pour la Bretagne/44 — vérifiez que le fichier est bien le CSV ORIAS complet (séparateur ; ou ,).')
        } else {
          setPreview(records)
        }
      } catch {
        setError('Erreur de lecture du fichier CSV.')
      }
    }
    reader.readAsText(file, 'UTF-8')
  }

  const handleImport = async () => {
    if (!preview) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/sourcing/orias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preview),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error ?? 'Erreur')
      setResult({ nbResultats: data.nbResultats, nbNouveaux: data.nbNouveaux, nbDoublons: data.nbDoublons })
      setPreview(null)
      if (fileRef.current) fileRef.current.value = ''
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const cgpCount = preview?.filter(r => r.segment === 'CGP_IMMOBILIER').length ?? 0
  const courtierCount = preview?.filter(r => r.segment === 'COURTIER_INVESTISSEUR').length ?? 0
  const withEmail = preview?.filter(r => r.email).length ?? 0
  const withPhone = preview?.filter(r => r.telephone).length ?? 0

  return (
    <div>
      <div className="px-5 py-4 space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
              Fichier CSV ORIAS
            </label>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFile}
              className="text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-slate-200 file:text-xs file:font-semibold file:bg-white file:text-slate-600 hover:file:bg-slate-50 cursor-pointer"
            />
          </div>
          {preview && (
            <button
              type="button"
              onClick={handleImport}
              disabled={loading}
              className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#0B1B2B] text-white hover:bg-[#1a2e44] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Import en cours...' : `Importer ${preview.length} prospects`}
            </button>
          )}
        </div>

        {/* Preview stats */}
        {preview && (
          <div className="bg-[#F8F7F4] rounded-xl p-4 flex flex-wrap gap-6 text-sm">
            <div><span className="font-bold text-[#0B1B2B]">{preview.length}</span> <span className="text-slate-500">prospects (Bretagne + 44)</span></div>
            <div><span className="font-bold text-[#0B1B2B]">{cgpCount}</span> <span className="text-slate-500">CGP / CIF</span></div>
            <div><span className="font-bold text-[#0B1B2B]">{courtierCount}</span> <span className="text-slate-500">Courtiers / IOBSP</span></div>
            <div><span className="font-bold text-emerald-600">{withEmail}</span> <span className="text-slate-500">avec email</span></div>
            <div><span className="font-bold text-[#C9A96E]">{withPhone}</span> <span className="text-slate-500">avec téléphone</span></div>
          </div>
        )}

        {/* Aperçu des 5 premiers */}
        {preview && preview.length > 0 && (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs min-w-[700px]">
              <thead>
                <tr className="bg-[#F8F7F4] text-left text-slate-400 uppercase tracking-wide">
                  <th className="px-3 py-2 font-semibold">Nom</th>
                  <th className="px-3 py-2 font-semibold">Catégories</th>
                  <th className="px-3 py-2 font-semibold">Ville</th>
                  <th className="px-3 py-2 font-semibold">Email</th>
                  <th className="px-3 py-2 font-semibold">Téléphone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {preview.slice(0, 5).map((r, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 font-medium text-[#0B1B2B] truncate max-w-[200px]">{r.nom}</td>
                    <td className="px-3 py-2 text-slate-500">{r.categories.join(', ')}</td>
                    <td className="px-3 py-2 text-slate-500">{r.ville}</td>
                    <td className="px-3 py-2 text-emerald-600">{r.email ?? '—'}</td>
                    <td className="px-3 py-2 text-slate-500">{r.telephone ?? '—'}</td>
                  </tr>
                ))}
                {preview.length > 5 && (
                  <tr><td colSpan={5} className="px-3 py-2 text-center text-slate-400">... et {preview.length - 5} autres</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {result && (
          <div className="flex gap-4 text-sm">
            <span className="text-slate-600">{result.nbResultats} enregistrements ORIAS</span>
            <span className="text-emerald-600 font-medium">{result.nbNouveaux} nouveaux</span>
            {result.nbDoublons > 0 && <span className="text-amber-600">{result.nbDoublons} doublons ignorés</span>}
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <p className="px-5 pb-4 text-xs text-slate-400">
        Télécharge le fichier CSV sur{' '}
        <a href="https://www.orias.fr/web/guest/search" target="_blank" rel="noreferrer" className="underline hover:text-slate-600">
          registre.orias.fr
        </a>
        {' '}→ Recherche avancée → Export CSV (filtrer par région ou télécharger le fichier complet France).
        Seuls les enregistrements des départements 22, 29, 35, 56 et 44 sont importés.
        Les doublons CIF + IOBSP du même cabinet sont fusionnés automatiquement.
      </p>
    </div>
  )
}
