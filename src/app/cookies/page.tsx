import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage, LegalSection } from '@/components/ui/LegalPage'

export const metadata: Metadata = {
  title: 'Cookies',
  robots: { index: false, follow: true },
}

export default function CookiesPage() {
  return (
    <LegalPage title="Cookies" updated="10 juin 2026">

      <LegalSection title="Utilisation actuelle">
        <p>
          À la date de mise à jour de cette page, Rendement Réel Immo n&apos;utilise pas de cookies de
          mesure d&apos;audience, de publicité ou de profilage. Seuls des cookies techniques strictement
          nécessaires au fonctionnement du site (par exemple, la mémorisation de votre progression dans le
          simulateur au sein de votre session) peuvent être utilisés.
        </p>
      </LegalSection>

      <LegalSection title="Cookies techniques">
        <p>
          Ces cookies ne nécessitent pas de consentement préalable car ils sont indispensables à la
          navigation et au bon fonctionnement du simulateur. Ils ne permettent pas de vous identifier
          personnellement et ne sont pas transmis à des tiers.
        </p>
      </LegalSection>

      <LegalSection title="Mesure d'audience">
        <p>
          Aucun outil de mesure d&apos;audience non strictement nécessaire n&apos;est utilisé à ce jour.
        </p>
        <p>
          Si une solution de mesure d&apos;audience est mise en place, elle sera privilégiée dans une
          configuration respectueuse de la vie privée (données anonymisées, sans cookie de traçage
          individuel) lorsque cela est possible. Si un consentement préalable est requis, un bandeau
          dédié sera ajouté sur le site et cette page sera mise à jour en conséquence.
        </p>
      </LegalSection>

      <LegalSection title="Gestion de vos préférences">
        <p>
          Vous pouvez à tout moment configurer votre navigateur pour refuser les cookies ou être averti
          avant qu&apos;un cookie ne soit déposé. Pour toute question, voir notre{' '}
          <Link href="/politique-confidentialite" className="text-[#0B1B2B] underline">politique de confidentialité</Link>.
        </p>
      </LegalSection>

    </LegalPage>
  )
}
