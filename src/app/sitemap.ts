import type { MetadataRoute } from 'next'

const BASE = 'https://rendementreelimmo.fr'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/simulateur`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/professionnels`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.95 },
    { url: `${BASE}/cgp-arbitrage-immobilier`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.95 },
    { url: `${BASE}/tarifs`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/tarifs-particuliers`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/white-label`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE}/exemple-rapport`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE}/qui-sommes-nous`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/guides`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE}/cash-flow-immobilier`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/simulateur-rendement-locatif`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/calcul-rentabilite-locative`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE}/rendement-brut-net-net`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE}/tri-immobilier`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE}/prix-cible-investissement-locatif`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/lmnp-reel-ou-micro-bic`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE}/logiciel-rentabilite-locative-professionnel`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
  ]
}
