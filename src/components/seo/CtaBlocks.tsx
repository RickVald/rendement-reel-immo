import Link from 'next/link'

export function CalculatorCTA({
  title = 'Calculez votre rendement réel en 2 minutes',
  description = 'Simulez le cash-flow, la fiscalité, le TRI et le prix cible de votre projet locatif avec notre simulateur gratuit.',
  buttonText = 'Lancer le simulateur',
  subtext,
}: {
  title?: string
  description?: string
  buttonText?: string
  subtext?: string
}) {
  return (
    <div className="my-10 rounded-2xl bg-[#0B1B2B] px-6 py-8 md:px-10 md:py-10 text-center relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent" />
      <h3 className="font-playfair text-xl md:text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-300 mb-6 max-w-xl mx-auto leading-relaxed">{description}</p>
      <Link
        href="/simulateur"
        className="inline-flex items-center gap-2 bg-[#C9A96E] hover:bg-[#d4b87a] text-[#0B1B2B] font-semibold text-sm px-6 py-3 rounded-full transition-colors"
      >
        {buttonText}
      </Link>
      {subtext && <p className="text-xs text-slate-400 mt-4">{subtext}</p>}
    </div>
  )
}

export function ProCTA({
  title = 'Vous êtes CGP, chasseur ou courtier ?',
  description = 'Générez des rapports d\'arbitrage professionnels pour vos clients, en marque blanche.',
}: {
  title?: string
  description?: string
}) {
  return (
    <div className="my-10 rounded-2xl border border-[#C9A96E]/30 bg-[#F8F7F4] px-6 py-8 md:px-10 md:py-10 text-center">
      <h3 className="font-playfair text-xl md:text-2xl font-bold text-[#0B1B2B] mb-2">{title}</h3>
      <p className="text-sm text-slate-600 mb-6 max-w-xl mx-auto leading-relaxed">{description}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/exemple-rapport"
          className="inline-flex items-center justify-center gap-2 border border-[#0B1B2B]/15 hover:border-[#0B1B2B]/30 text-[#0B1B2B] font-semibold text-sm px-6 py-3 rounded-full transition-colors"
        >
          Voir un rapport exemple
        </Link>
        <Link
          href="/professionnels#demo"
          className="inline-flex items-center justify-center gap-2 bg-[#0B1B2B] hover:bg-[#16283c] text-white font-semibold text-sm px-6 py-3 rounded-full transition-colors"
        >
          Demander une démo pro
        </Link>
      </div>
    </div>
  )
}
