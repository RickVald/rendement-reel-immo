import type { Metadata } from 'next'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'Connexion',
  robots: { index: false, follow: false },
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const params = await searchParams
  const redirectTo = params.redirect || '/admin/crm'

  return (
    <main className="min-h-screen bg-[#0B1B2B] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-lg font-bold tracking-tight text-white">
            Rendement Réel<span style={{ color: '#C9A96E' }}> Immo</span>
          </div>
          <div className="text-[10px] tracking-[0.18em] uppercase mt-1 text-slate-400">Espace interne</div>
        </div>
        <div className="bg-white rounded-2xl px-6 py-8 shadow-xl">
          <h1 className="font-playfair text-xl font-bold text-[#0B1B2B] mb-6 text-center">Connexion</h1>
          <LoginForm redirectTo={redirectTo} />
        </div>
      </div>
    </main>
  )
}
