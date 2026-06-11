'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import type { ProjectInput } from '@/lib/calculator/types'

type Profil = 'particulier' | 'pro'

// Emails internes : accès direct au rapport complet (sans paiement), pour les tests.
const TEST_EMAILS = ['remy@rendementreelimmo.fr']

interface LeadGateModalProps {
  open: boolean
  onClose: () => void
  /** Appelé après l'enregistrement réussi du lead "particulier" — doit lancer le calcul et afficher le résultat simplifié. */
  onUnlockParticulier: () => void
  /** Appelé pour les emails de test internes — lance le calcul et affiche le rapport complet (sans paiement). */
  onUnlockComplet: () => void
  input: ProjectInput
}

export function LeadGateModal({ open, onClose, onUnlockParticulier, onUnlockComplet, input }: LeadGateModalProps) {
  const [profil, setProfil] = useState<Profil>('particulier')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [societe, setSociete] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<Profil | null>(null)

  if (!open) return null

  const handleSubmit = async () => {
    if (!nom.trim()) { setError('Indiquez votre nom.'); return }
    if (!email.trim() || !email.includes('@')) { setError('Indiquez un email valide.'); return }

    if (TEST_EMAILS.includes(email.trim().toLowerCase())) {
      onUnlockComplet()
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profil, nom, email, telephone, societe, input }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Erreur, veuillez réessayer.')
      }
      if (profil === 'particulier') {
        onUnlockParticulier()
      } else {
        setDone('pro')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inattendue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
        {done === 'pro' ? (
          <div className="p-8 text-center space-y-4">
            <div className="text-4xl">✅</div>
            <h2 className="text-lg font-bold text-slate-900">Merci, votre demande est enregistrée</h2>
            <p className="text-sm text-slate-500">
              Notre équipe vous recontacte sous 24h pour organiser une démo personnalisée du simulateur et de nos outils professionnels.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-2 rounded-lg text-sm transition-colors"
            >
              Fermer
            </button>
          </div>
        ) : (
          <>
            <div className="bg-[#0F1B2D] text-white px-6 py-5">
              <h2 className="text-lg font-bold">Encore une étape avant votre résultat</h2>
              <p className="text-sm text-slate-300 mt-1">
                Débloquez votre analyse complète, ou laissez vos coordonnées pour la recevoir / être recontacté.
              </p>
            </div>

            <div className="p-6 space-y-5">
              {/* Option payante */}
              <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Accès complet immédiat</p>
                  <p className="text-xs text-slate-500 mt-0.5">Rapport détaillé + PDF + synthèse IA, à partir de 69 €.</p>
                </div>
                <a
                  href="/tarifs#particuliers"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold px-4 py-2 rounded-lg bg-[#0B1B2B] hover:bg-[#162840] text-white transition-colors whitespace-nowrap"
                >
                  Voir les offres
                </a>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-xs text-slate-400 uppercase tracking-wide">ou</span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              {/* Profil */}
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">Vous êtes...</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setProfil('particulier')}
                    className={clsx(
                      'flex-1 text-sm font-medium px-3 py-2 rounded-lg border transition-colors',
                      profil === 'particulier'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    )}
                  >
                    Un particulier
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfil('pro')}
                    className={clsx(
                      'flex-1 text-sm font-medium px-3 py-2 rounded-lg border transition-colors',
                      profil === 'pro'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    )}
                  >
                    Un professionnel de l&apos;immobilier
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Nom</label>
                    <input value={nom} onChange={e => setNom(e.target.value)} className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Téléphone</label>
                    <input value={telephone} onChange={e => setTelephone(e.target.value)} className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2" />
                </div>
                {profil === 'pro' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Société (optionnel)</label>
                    <input value={societe} onChange={e => setSociete(e.target.value)} className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2" />
                  </div>
                )}
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <p className="text-[11px] text-slate-400">
                En continuant, vous acceptez d&apos;être contacté(e) au sujet de votre projet. Voir notre{' '}
                <a href="/politique-confidentialite" target="_blank" className="underline">politique de confidentialité</a>.
              </p>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button type="button" onClick={onClose} className="text-sm text-slate-400 hover:text-slate-600">
                  Retour au formulaire
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className={clsx(
                    'font-bold px-6 py-2 rounded-lg text-sm transition-all',
                    loading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 text-white'
                  )}
                >
                  {loading
                    ? '...'
                    : profil === 'particulier' ? 'Voir mon résultat' : 'Demander une démo'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
