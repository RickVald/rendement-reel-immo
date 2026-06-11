import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { stripe, STRIPE_ENABLED, getRapportPack } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

interface CheckoutPayload {
  pack?: string
  email?: string
}

export async function POST(req: Request) {
  if (!STRIPE_ENABLED || !stripe) {
    return NextResponse.json({ error: 'Le paiement en ligne n\'est pas encore activé sur ce site.' }, { status: 503 })
  }

  let body: CheckoutPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 })
  }

  const email = String(body.email ?? '').trim()
  const packId = String(body.pack ?? '').trim()

  if (!email || !email.includes('@')) return NextResponse.json({ error: 'Email invalide.' }, { status: 400 })

  const pack = getRapportPack(packId)
  if (!pack) return NextResponse.json({ error: 'Offre invalide.' }, { status: 400 })

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rendementreelimmo.fr'

  try {
    const achat = await prisma.achatRapport.create({
      data: {
        email,
        pack: pack.id,
        quotaRapports: pack.quotaRapports,
        montant: pack.prixCents,
        statut: 'EN_ATTENTE',
      },
    })

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: pack.prixCents,
            product_data: {
              name: pack.nom,
              description: pack.description,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { achatId: achat.id, pack: pack.id },
      success_url: `${siteUrl}/paiement-reussi?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/tarifs`,
    })

    await prisma.achatRapport.update({
      where: { id: achat.id },
      data: { stripeSessionId: session.id },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[api/checkout] Erreur:', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
