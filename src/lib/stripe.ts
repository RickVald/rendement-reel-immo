import Stripe from 'stripe'

export const STRIPE_ENABLED = !!process.env.STRIPE_SECRET_KEY

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

export interface RapportPack {
  id: string
  nom: string
  description: string
  prixCents: number
  quotaRapports: number
}

export const RAPPORT_PACKS: Record<string, RapportPack> = {
  rapport_unique: {
    id: 'rapport_unique',
    nom: 'Rapport unique',
    description: '1 rapport PDF complet : cash-flow, TRI, VAN, fiscalité, revente, prix cible, stress tests.',
    prixCents: 6900,
    quotaRapports: 1,
  },
  pack3: {
    id: 'pack3',
    nom: 'Pack 3 rapports',
    description: '3 biens à analyser, rapport PDF complet pour chacun, idéal avant visites ou négociation.',
    prixCents: 9900,
    quotaRapports: 3,
  },
  pack5: {
    id: 'pack5',
    nom: 'Pack 5 rapports',
    description: '5 rapports complets pour un investisseur actif qui sélectionne le meilleur projet.',
    prixCents: 14900,
    quotaRapports: 5,
  },
}

export function getRapportPack(packId: string): RapportPack | undefined {
  return RAPPORT_PACKS[packId]
}
