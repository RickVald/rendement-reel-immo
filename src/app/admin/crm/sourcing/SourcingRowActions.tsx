'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { importerEnOrganisation, ignorerSourcingResult, enrichirSourcingResult } from './actions'

export function SourcingRowActions({
  id,
  statut,
  hasEmail,
  hasSite,
}: {
  id: string
  statut: string
  hasEmail: boolean
  hasSite: boolean
}) {
  const router = useRouter()
  const [importing, setImporting] = useState(false)
  const [ignoring, setIgnoring] = useState(false)
  const [enriching, setEnriching] = useState(false)
  const [enrichMsg, setEnrichMsg] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const isActif = statut === 'NOUVEAU' || statut === 'DOUBLON_POTENTIEL'

  const handleEnrich = async () => {
    setEnriching(true)
    setEnrichMsg(null)
    try {
      const r = await enrichirSourcingResult(id)
      const parts: string[] = []
      if (r.emails.length) parts.push(`📧 ${r.emails[0]}`)
      if (r.phones.length) parts.push(`📞 ${r.phones[0]}`)
      if (r.site && r.siteSource === 'brave') parts.push(`🌐 site trouvé`)
      setEnrichMsg(parts.length ? parts.join(' · ') : 'Rien de trouvé sur le site')
      router.refresh()
    } catch (e) {
      setEnrichMsg(`Erreur : ${e instanceof Error ? e.message : 'inconnue'}`)
    } finally {
      setEnriching(false)
    }
  }

  const handleImport = async () => {
    setImporting(true)
    try {
      await importerEnOrganisation(id)
      setDone(true)
      router.refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setImporting(false)
    }
  }

  const handleIgnore = async () => {
    setIgnoring(true)
    try {
      await ignorerSourcingResult(id)
      setDone(true)
      router.refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setIgnoring(false)
    }
  }

  const busy = importing || ignoring || enriching

  return (
    <div className="flex flex-col gap-1 min-w-[150px]">
      {/* Enrichir — toujours disponible tant que pas ignoré/importé */}
      {!done && statut !== 'IGNORE' && (
        <button
          type="button"
          onClick={handleEnrich}
          disabled={busy}
          className="text-xs font-medium px-2.5 py-1 rounded-lg border border-[#C9A96E]/40 text-[#b8966a] hover:border-[#C9A96E] hover:text-[#C9A96E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {enriching ? 'Recherche...' : '🔍 Enrichir'}
        </button>
      )}
      {enrichMsg && (
        <p className="text-[10px] text-slate-500 leading-snug max-w-[180px] break-words">{enrichMsg}</p>
      )}

      {/* Import / Ignore — seulement si actif */}
      {isActif && !done && (
        <>
          <button
            type="button"
            onClick={handleImport}
            disabled={busy}
            className="text-xs font-medium px-2.5 py-1 rounded-lg bg-[#0B1B2B] text-white hover:bg-[#1a2e44] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {importing ? '...' : 'Importer'}
          </button>
          <button
            type="button"
            onClick={handleIgnore}
            disabled={busy}
            className="text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 hover:text-[#0B1B2B] hover:border-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {ignoring ? '...' : 'Ignorer'}
          </button>
        </>
      )}

      {(done || statut === 'IMPORTE') && <span className="text-xs text-emerald-600 font-medium">✓ Importé</span>}
      {statut === 'IGNORE' && !done && <span className="text-xs text-slate-300 italic">Ignoré</span>}
    </div>
  )
}
