// Moteur d'alertes — branché sur Prisma/Postgres (Neon).
// En Phase 1, ces règles tourneront en cron (cf. CRM_DESIGN.md, section 7
// "Automatisations" — colonne "Mode V1").
import {
  getOrganisations, getContacts, getOpportunites, getPilotes, getLeadsB2C, getObjections,
} from './data'
import type { Organisation } from './types'

// Date de référence : aujourd'hui (réel).
export const TODAY = new Date().toISOString().slice(0, 10)

function daysBetween(a: string, b: string): number {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay)
}

export type AlertSeverity = 'urgente' | 'haute' | 'moyenne'

export interface CrmAlert {
  id: string
  severity: AlertSeverity
  titre: string
  description: string
  href: string
}

export async function getAlerts(): Promise<CrmAlert[]> {
  const [organisations, contacts, opportunites, pilotes, leadsB2C, objections] = await Promise.all([
    getOrganisations(), getContacts(), getOpportunites(), getPilotes(), getLeadsB2C(), getObjections(),
  ])
  const orgMap = new Map<string, Organisation>(organisations.map(o => [o.id, o]))
  const getOrganisation = (id: string) => orgMap.get(id)

  const alerts: CrmAlert[] = []

  // 1. Démo faite sans prochaine action
  for (const o of opportunites) {
    if (o.etape === 'DEMO_FAITE' && !o.prochainPas) {
      const org = getOrganisation(o.organisationId)
      alerts.push({
        id: `demo-sans-action-${o.id}`,
        severity: 'urgente',
        titre: `Démo faite sans prochaine action — ${org?.nom}`,
        description: 'Définir un prochain pas immédiatement après une démo, sinon le deal stagne.',
        href: `/admin/crm/organisations/${o.organisationId}`,
      })
    }
  }

  // 2. Pilote actif mais 0 rapport après 3 jours
  for (const p of pilotes) {
    if (p.rapportsGeneres === 0 && daysBetween(p.dateDebut, TODAY) >= 3) {
      const org = getOrganisation(p.organisationId)
      alerts.push({
        id: `pilote-sans-usage-${p.id}`,
        severity: 'urgente',
        titre: `Pilote sans usage depuis ${daysBetween(p.dateDebut, TODAY)} jours — ${org?.nom}`,
        description: 'Relancer pour de l\'aide à l\'onboarding : générer un premier rapport ensemble.',
        href: `/admin/crm/organisations/${p.organisationId}`,
      })
    }
  }

  // 3. Pilote finit dans <= 5 jours
  for (const p of pilotes) {
    const reste = daysBetween(TODAY, p.dateFin)
    if (reste >= 0 && reste <= 5) {
      const org = getOrganisation(p.organisationId)
      alerts.push({
        id: `pilote-fin-proche-${p.id}`,
        severity: 'haute',
        titre: `Pilote se termine dans ${reste} jour(s) — ${org?.nom}`,
        description: 'Préparer la proposition de conversion en abonnement avant la fin du pilote.',
        href: `/admin/crm/organisations/${p.organisationId}`,
      })
    }
  }

  // 4. Prospect ICP > 80 sans relance programmée (ou relance en retard)
  for (const o of opportunites) {
    if (o.scoreICP > 80 && o.etape !== 'PERDU' && o.etape !== 'ABONNEMENT') {
      const enRetard = !o.prochainPasDate || o.prochainPasDate < TODAY
      if (!o.prochainPas || enRetard) {
        const org = getOrganisation(o.organisationId)
        alerts.push({
          id: `icp-fort-sans-relance-${o.id}`,
          severity: 'haute',
          titre: `Prospect à fort potentiel sans relance — ${org?.nom} (ICP ${o.scoreICP})`,
          description: 'Score ICP élevé : prioriser une relance personnalisée.',
          href: `/admin/crm/organisations/${o.organisationId}`,
        })
      }
    }
  }

  // 5. Email bounce à corriger
  for (const c of contacts) {
    if (c.statutEmail === 'BOUNCE') {
      const org = c.organisationId ? getOrganisation(c.organisationId) : undefined
      alerts.push({
        id: `bounce-${c.id}`,
        severity: 'moyenne',
        titre: `Email en bounce — ${c.nom}${org ? ` (${org.nom})` : ''}`,
        description: 'Vérifier/corriger l\'adresse email avant de relancer la séquence.',
        href: org ? `/admin/crm/organisations/${org.id}` : '/admin/crm/contacts',
      })
    }
  }

  // 6. Lead B2C chaud non traité
  for (const l of leadsB2C) {
    if (l.scoreLead >= 80 && l.statut === 'NOUVEAU') {
      alerts.push({
        id: `lead-chaud-${l.id}`,
        severity: 'urgente',
        titre: `Lead B2C chaud non traité — ${l.nom} (${l.ville})`,
        description: 'Score lead élevé : à rappeler sous 2h pour maximiser la conversion / la valeur de revente.',
        href: `/admin/crm/leads-b2c/${l.id}`,
      })
    }
  }

  // 7. Client avec usage élevé → opportunité d'upsell
  for (const p of pilotes) {
    const ratio = p.quotaRapports < 999 ? p.rapportsGeneres / p.quotaRapports : (p.rapportsGeneres >= 5 ? 1 : 0)
    if (ratio >= 0.4 && p.statut === 'ACTIVE_OK') {
      const org = getOrganisation(p.organisationId)
      alerts.push({
        id: `upsell-${p.id}`,
        severity: 'moyenne',
        titre: `Usage élevé — opportunité d'upsell : ${org?.nom}`,
        description: `${p.rapportsGeneres} rapport(s) générés${p.quotaRapports < 999 ? ` sur ${p.quotaRapports}` : ''} : bon moment pour proposer la conversion / un palier supérieur.`,
        href: `/admin/crm/organisations/${p.organisationId}`,
      })
    }
  }

  // 8. Objection répétée >= 3 fois → signal produit / copywriting
  const counts = new Map<string, number>()
  for (const o of objections) counts.set(o.categorie, (counts.get(o.categorie) ?? 0) + 1)
  for (const [categorie, count] of counts) {
    if (count >= 3) {
      alerts.push({
        id: `objection-repetee-${categorie}`,
        severity: 'moyenne',
        titre: `Objection répétée ${count} fois : ${categorie}`,
        description: 'Signal produit / copywriting : envisager une réponse standard ou une évolution du produit.',
        href: '/admin/crm/objections',
      })
    }
  }

  const order: Record<AlertSeverity, number> = { urgente: 0, haute: 1, moyenne: 2 }
  return alerts.sort((a, b) => order[a.severity] - order[b.severity])
}

export interface TodayAction {
  id: string
  titre: string
  href: string
  meta?: string
}

export interface TodaySection {
  titre: string
  actions: TodayAction[]
}

export async function getTodaySections(): Promise<TodaySection[]> {
  const [organisations, contacts, opportunites, pilotes, leadsB2C] = await Promise.all([
    getOrganisations(), getContacts(), getOpportunites(), getPilotes(), getLeadsB2C(),
  ])
  const orgMap = new Map<string, Organisation>(organisations.map(o => [o.id, o]))
  const getOrganisation = (id: string) => orgMap.get(id)

  const sections: TodaySection[] = []

  // Relances dues
  const relances = opportunites.filter(o => o.prochainPasDate && o.prochainPasDate <= TODAY && o.etape !== 'PERDU' && o.etape !== 'ABONNEMENT')
  sections.push({
    titre: 'Relances dues',
    actions: relances.map(o => {
      const org = getOrganisation(o.organisationId)
      return { id: o.id, titre: `${org?.nom} — ${o.prochainPas}`, href: `/admin/crm/organisations/${o.organisationId}`, meta: o.prochainPasDate }
    }),
  })

  // Démos du jour / à venir cette semaine
  const demos = opportunites.filter(o => o.etape === 'DEMO_BOOKEE')
  sections.push({
    titre: 'Démos à préparer',
    actions: demos.map(o => {
      const org = getOrganisation(o.organisationId)
      return { id: o.id, titre: `Démo — ${org?.nom}`, href: `/admin/crm/organisations/${o.organisationId}`, meta: o.prochainPasDate }
    }),
  })

  // Pilotes à risque (sans usage ou fin proche)
  const pilotesARisque = pilotes.filter(p => {
    const reste = daysBetween(TODAY, p.dateFin)
    return p.rapportsGeneres === 0 || (reste >= 0 && reste <= 5)
  })
  sections.push({
    titre: 'Pilotes à risque / à convertir',
    actions: pilotesARisque.map(p => {
      const org = getOrganisation(p.organisationId)
      const reste = daysBetween(TODAY, p.dateFin)
      return { id: p.id, titre: `${org?.nom} — fin dans ${reste} j, ${p.rapportsGeneres} rapport(s)`, href: `/admin/crm/organisations/${p.organisationId}` }
    }),
  })

  // Prospects chauds sans prochaine action
  const chauds = opportunites.filter(o => o.scoreICP > 80 && !o.prochainPas && o.etape !== 'PERDU' && o.etape !== 'ABONNEMENT')
  sections.push({
    titre: 'Prospects chauds sans prochaine action',
    actions: chauds.map(o => {
      const org = getOrganisation(o.organisationId)
      return { id: o.id, titre: `${org?.nom} (ICP ${o.scoreICP})`, href: `/admin/crm/organisations/${o.organisationId}` }
    }),
  })

  // Leads B2C à rappeler
  const leadsARappeler = leadsB2C.filter(l => l.statut === 'NOUVEAU' || l.statut === 'QUALIFIE')
  sections.push({
    titre: 'Leads B2C à rappeler',
    actions: leadsARappeler.map(l => ({ id: l.id, titre: `${l.nom} (${l.ville}) — score ${l.scoreLead}`, href: `/admin/crm/leads-b2c/${l.id}` })),
  })

  // Clients à convertir (pilote actif → abonnement)
  const aConvertir = opportunites.filter(o => o.etape === 'ACTIVE')
  sections.push({
    titre: 'Clients à convertir en abonnement',
    actions: aConvertir.map(o => {
      const org = getOrganisation(o.organisationId)
      return { id: o.id, titre: `${org?.nom} — ${o.offre}`, href: `/admin/crm/organisations/${o.organisationId}` }
    }),
  })

  // Bounces à corriger
  const bounces = contacts.filter(c => c.statutEmail === 'BOUNCE')
  sections.push({
    titre: 'Bounces à corriger',
    actions: bounces.map(c => {
      const org = c.organisationId ? getOrganisation(c.organisationId) : undefined
      return { id: c.id, titre: `${c.nom}${org ? ` (${org.nom})` : ''}`, href: org ? `/admin/crm/organisations/${org.id}` : '/admin/crm/contacts' }
    }),
  })

  return sections.filter(s => s.actions.length > 0)
}
