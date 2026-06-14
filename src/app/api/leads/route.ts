import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendEmail, getLeadNotificationRecipients } from '@/lib/email/brevo'
import type { ProjectInput } from '@/lib/calculator/types'

export const dynamic = 'force-dynamic'

/** Reprend les seuls champs utilisés ci-dessous pour la notification — commun aux
 *  Parcours A (`ProjectInput`) et B (`ProjectInputDetenu`). */
interface LeadInputShape {
  bien?: Partial<ProjectInput['bien']>
  acquisition?: Partial<ProjectInput['acquisition']>
}

interface LeadPayload {
  profil: 'particulier' | 'pro'
  nom: string
  email: string
  telephone?: string
  societe?: string
  metier?: string
  volume?: string
  besoin?: string
  input?: LeadInputShape
}

const fmtEur = (n?: number) => (typeof n === 'number' ? `${Math.round(n).toLocaleString('fr-FR')} €` : '—')

export async function POST(req: Request) {
  let body: LeadPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 })
  }

  const profil = body.profil === 'pro' ? 'pro' : 'particulier'
  const nom = String(body.nom ?? '').trim()
  const email = String(body.email ?? '').trim()
  const telephone = String(body.telephone ?? '').trim() || undefined
  const societe = String(body.societe ?? '').trim() || undefined
  const metier = String(body.metier ?? '').trim() || undefined
  const volume = String(body.volume ?? '').trim() || undefined
  const besoin = String(body.besoin ?? '').trim() || undefined
  const input = body.input

  if (!nom) return NextResponse.json({ error: 'Le nom est requis.' }, { status: 400 })
  if (!email || !email.includes('@')) return NextResponse.json({ error: 'Email invalide.' }, { status: 400 })

  const ville = input?.bien?.ville || '—'
  const typeBien = input?.bien?.type
  const budget = input?.acquisition?.prixAchat

  try {
    if (profil === 'particulier') {
      const lead = await prisma.leadB2C.create({
        data: {
          nom,
          email,
          telephone,
          ville,
          budget,
          typeBien,
          source: 'SIMULATEUR',
          statut: 'NOUVEAU',
          scoreLead: 50,
        },
      })

      await sendEmail({
        to: getLeadNotificationRecipients(),
        subject: `Nouveau lead particulier — ${nom}`,
        html: `
          <h2>Nouveau lead via le simulateur (particulier)</h2>
          <p><strong>Nom :</strong> ${nom}</p>
          <p><strong>Email :</strong> ${email}</p>
          <p><strong>Téléphone :</strong> ${telephone ?? '—'}</p>
          <p><strong>Ville du projet :</strong> ${ville}</p>
          <p><strong>Type de bien :</strong> ${typeBien ?? '—'}</p>
          <p><strong>Budget (prix d'achat) :</strong> ${fmtEur(budget)}</p>
          <p><a href="https://rendementreelimmo.fr/admin/crm/leads-b2c/${lead.id}">Voir la fiche dans le CRM</a></p>
        `,
      })

      return NextResponse.json({ ok: true, profil })
    }

    // Profil pro : organisation + contact + opportunité + tâche de rappel
    const org = await prisma.organisation.create({
      data: {
        nom: societe || nom,
        segment: 'AUTRE',
        taille: volume,
        ville: ville !== '—' ? ville : undefined,
        source: 'simulateur',
      },
    })

    await prisma.contact.create({
      data: {
        organisationId: org.id,
        type: 'PROSPECT_SAAS_B2B',
        nom,
        role: metier,
        email,
        telephone,
      },
    })

    await prisma.opportunite.create({
      data: {
        organisationId: org.id,
        offre: besoin ? `Démo SaaS — ${besoin}` : 'Démo SaaS (demande via simulateur)',
        etape: 'PROSPECT_IDENTIFIE',
        scoreICP: 50,
      },
    })

    const rappelDate = new Date()
    rappelDate.setDate(rappelDate.getDate() + 1)
    await prisma.activite.create({
      data: {
        organisationId: org.id,
        type: 'TACHE',
        date: rappelDate,
        resume: `Rappeler ${nom} (${email}${telephone ? `, ${telephone}` : ''}) suite à une demande de démo`
          + `${metier ? ` — métier : ${metier}` : ''}${volume ? `, ${volume} dossiers/mois` : ''}${besoin ? `, besoin : ${besoin}` : ''}.`,
        owner: process.env.SEED_ADMIN_EMAIL || 'admin@rendementreelimmo.fr',
        fait: false,
      },
    })

    await sendEmail({
      to: getLeadNotificationRecipients(),
      subject: `Nouvelle demande de démo (pro) — ${societe || nom}`,
      html: `
        <h2>Nouvelle demande de démo via le simulateur (professionnel)</h2>
        <p><strong>Nom :</strong> ${nom}</p>
        <p><strong>Société :</strong> ${societe ?? '—'}</p>
        <p><strong>Métier :</strong> ${metier ?? '—'}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Téléphone :</strong> ${telephone ?? '—'}</p>
        <p><strong>Ville du projet :</strong> ${ville}</p>
        <p><strong>Dossiers investisseurs / mois :</strong> ${volume ?? '—'}</p>
        <p><strong>Besoin :</strong> ${besoin ?? '—'}</p>
        <p><a href="https://rendementreelimmo.fr/admin/crm/organisations/${org.id}">Voir la fiche dans le CRM</a></p>
      `,
    })

    return NextResponse.json({ ok: true, profil })
  } catch (err) {
    console.error('[api/leads] Erreur:', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
