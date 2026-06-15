'use client'

import { useState } from 'react'

const IconDownload = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>

const PDF_URL = '/exemples/rapport-exemple-anonymise.pdf'

export function DownloadGate() {
  const [open, setOpen] = useState(false)
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!nom.trim()) { setError('Indiquez votre nom.'); return }
    if (!email.trim() || !email.includes('@')) { setError('Indiquez un email valide.'); return }
    if (!telephone.trim()) { setError('Indiquez votre numéro de téléphone.'); return }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profil: 'particulier',
          nom,
          email,
          telephone,
          source: 'EXEMPLE_RAPPORT',
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Erreur, veuillez réessayer.')
      }

      const a = document.createElement('a')
      a.href = PDF_URL
      a.download = ''
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      setOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inattendue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 bg-[#C9A96E] hover:bg-[#d4b87a] text-[#0B1B2B] font-bold px-7 py-3.5 rounded-lg text-sm transition-colors shadow-lg shadow-[#C9A96E]/20"
      >
        Télécharger le PDF d&apos;exemple <IconDownload />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden text-left">
            <div className="bg-[#0B1B2B] text-white px-6 py-5">
              <h2 className="text-lg font-bold">Recevez le rapport d&apos;exemple</h2>
              <p className="text-sm text-slate-300 mt-1">
                Indiquez vos coordonnées pour télécharger le PDF complet (17 pages).
              </p>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nom</label>
                <input value={nom} onChange={e => setNom(e.target.value)} className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Téléphone</label>
                <input value={telephone} onChange={e => setTelephone(e.target.value)} className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2" />
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <p className="text-[11px] text-slate-400">
                En continuant, vous acceptez d&apos;être contacté(e) au sujet de votre projet. Voir notre{' '}
                <a href="/politique-confidentialite" target="_blank" className="underline">politique de confidentialité</a>.
              </p>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="text-sm text-slate-400 hover:text-slate-600">
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="font-bold px-6 py-2 rounded-lg text-sm transition-all bg-[#C9A96E] hover:bg-[#d4b87a] text-[#0B1B2B] disabled:opacity-50"
                >
                  {loading ? '...' : 'Télécharger le PDF'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
