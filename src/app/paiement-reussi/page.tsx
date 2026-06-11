import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { getRapportPack } from '@/lib/stripe'

export const metadata: Metadata = {
  title: 'Paiement confirmé',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function PaiementReussiPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id: sessionId } = await searchParams

  const achat = sessionId
    ? await prisma.achatRapport.findUnique({ where: { stripeSessionId: sessionId } })
    : null

  const pack = achat ? getRapportPack(achat.pack) : undefined

  return (
    <main className="min-h-screen bg-[#F8F7F4] flex items-center justify-center px-6 py-20">
      <div className="max-w-lg w-full bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4">
        <div className="text-4xl">✅</div>
        <h1 className="font-playfair text-2xl font-bold text-[#0B1B2B]">Merci pour votre achat</h1>
        {pack && achat ? (
          <p className="text-sm text-slate-500">
            Votre commande &laquo; {pack.nom} &raquo; ({achat.quotaRapports} rapport{achat.quotaRapports > 1 ? 's' : ''}) a bien été enregistrée.
            Un email de confirmation vous sera envoyé à <strong>{achat.email}</strong> avec les instructions pour générer vos rapports.
          </p>
        ) : (
          <p className="text-sm text-slate-500">
            Votre paiement a bien été pris en compte. Un email de confirmation vous sera envoyé prochainement avec les instructions pour générer votre rapport.
          </p>
        )}
        <Link
          href="/simulateur-rendement-locatif"
          className="inline-flex items-center gap-2 bg-[#0B1B2B] hover:bg-[#162840] text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          Lancer une simulation
        </Link>
      </div>
    </main>
  )
}
