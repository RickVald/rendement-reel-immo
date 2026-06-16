'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { importerEnOrganisation, ignorerSourcingResult, enrichirSourcingResult } from './actions'

export function LinkedInButton({ nom, dirigeant, ville }: { nom: string; dirigeant?: string; ville?: string }) {
  const q = encodeURIComponent([dirigeant ?? nom, dirigeant ? nom : '', ville ?? ''].filter(Boolean).join(' ').trim())
  return (
    <a
      href={`https://www.linkedin.com/search/results/people/?keywords=${q}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border border-[#0077B5]/30 text-[#0077B5] hover:border-[#0077B5] hover:bg-[#0077B5]/5 transition-colors whitespace-nowrap"
      title="Rechercher sur LinkedIn"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
      LinkedIn
    </a>
  )
}

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
