import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { stripe, STRIPE_ENABLED } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  if (!STRIPE_ENABLED || !stripe) {
    return NextResponse.json({ error: 'Stripe non configuré.' }, { status: 503 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook non configuré.' }, { status: 503 })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) return NextResponse.json({ error: 'Signature manquante.' }, { status: 400 })

  const rawBody = await req.text()

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    console.error('[api/stripe/webhook] Signature invalide:', err)
    return NextResponse.json({ error: 'Signature invalide.' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as { id: string; metadata?: Record<string, string> | null }
    const achatId = session.metadata?.achatId

    try {
      if (achatId) {
        await prisma.achatRapport.update({
          where: { id: achatId },
          data: { statut: 'PAYE' },
        })
      } else {
        await prisma.achatRapport.updateMany({
          where: { stripeSessionId: session.id },
          data: { statut: 'PAYE' },
        })
      }
    } catch (err) {
      console.error('[api/stripe/webhook] Erreur mise à jour achat:', err)
      return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
