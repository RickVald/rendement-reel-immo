import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage, LegalSection } from '@/components/ui/LegalPage'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  robots: { index: false, follow: true },
}

export default function PolitiqueConfidentialitePage() {
  return (
    <LegalPage title="Politique de confidentialité" updated="10 juin 2026">

      <LegalSection title="Responsable du traitement">
        <p>
          Le responsable du traitement des données est : Rémy Ricaud (entreprise individuelle),
          contact : remy@rendementreelimmo.fr. Voir aussi les{' '}
          <Link href="/mentions-legales" className="text-[#0B1B2B] underline">mentions légales</Link>.
        </p>
      </LegalSection>

      <LegalSection title="Données traitées par le simulateur">
        <p>
          Les informations saisies dans le simulateur (caractéristiques du bien, financement, fiscalité,
          hypothèses de revente, etc.) sont transmises de façon sécurisée (HTTPS) à nos serveurs uniquement
          pour effectuer les calculs et générer le rapport demandé. Tant qu&apos;aucune coordonnée n&apos;est
          renseignée, ces données ne sont pas stockées de façon permanente ni revendues.
        </p>
        <p>
          Lorsque la synthèse automatique du dossier est activée, un résumé anonymisé des résultats peut être
          transmis à un prestataire d&apos;intelligence artificielle (Anthropic) pour générer une interprétation
          en langage clair. Aucune donnée d&apos;identification personnelle (nom, coordonnées) n&apos;est transmise
          à ce prestataire.
        </p>
      </LegalSection>

      <LegalSection title="Données collectées via les formulaires (résultats, démo)">
        <p>
          Avant l&apos;affichage du résultat détaillé du simulateur, ou via le formulaire de demande de démo
          (page « Professionnels »), nous collectons : nom, email, téléphone, société le cas échéant, ainsi
          qu&apos;un résumé du projet immobilier saisi (ville, budget, type de bien).
        </p>
        <p>
          Ces informations sont enregistrées dans notre outil de gestion de la relation client (CRM interne),
          hébergé sur une base de données Postgres (Neon, hébergement Union européenne), et une notification
          est envoyée à notre équipe par email via notre prestataire d&apos;envoi transactionnel (Brevo).
        </p>
        <p>
          Ces données sont utilisées pour répondre à votre demande, vous transmettre le rapport ou l&apos;accès
          demandé, assurer le suivi commercial, et le cas échéant vous proposer (avec votre consentement) la
          mise en relation avec un partenaire professionnel pertinent pour votre projet (chasseur, courtier,
          CGP...). Cette mise en relation n&apos;a lieu qu&apos;en cas de consentement explicite (« opt-in »)
          de votre part.
        </p>
      </LegalSection>

      <LegalSection title="Paiement des rapports (Stripe)">
        <p>
          L&apos;achat d&apos;un rapport ou d&apos;un pack de rapports est traité par notre prestataire de
          paiement Stripe. Les coordonnées bancaires sont saisies directement sur la page de paiement sécurisée
          de Stripe et ne transitent jamais par nos serveurs. Nous recevons uniquement la confirmation du
          paiement, l&apos;email associé à la commande et l&apos;offre achetée, conservés dans notre CRM pour
          le suivi de votre commande et l&apos;émission de vos rapports.
        </p>
      </LegalSection>

      <LegalSection title="Cookies et mesure d'audience">
        <p>
          Le site n&apos;utilise pas, à ce jour, de cookies de suivi publicitaire ou de profilage. Une solution
          de mesure d&apos;audience pourra être mise en place ultérieurement ; le cas échéant, ce point sera mis
          à jour et un bandeau de consentement sera ajouté si requis. Voir la page{' '}
          <Link href="/cookies" className="text-[#0B1B2B] underline">cookies</Link> pour le détail à jour.
        </p>
      </LegalSection>

      <LegalSection title="Base légale et finalités">
        <ul className="list-disc pl-5 space-y-1">
          <li>Exécution du service demandé (génération de rapports de simulation)</li>
          <li>Réponse aux demandes de démonstration et de contact (intérêt légitime / mesures précontractuelles)</li>
          <li>Amélioration du produit (statistiques agrégées et anonymisées)</li>
        </ul>
      </LegalSection>

      <LegalSection title="Durée de conservation">
        <p>
          Les données saisies dans le simulateur (sans coordonnées) ne sont pas conservées au-delà de la
          session nécessaire au calcul et à la génération du rapport. Les données issues des formulaires
          (résultats, démo) et enregistrées dans le CRM sont conservées le temps de la relation commerciale,
          dans la limite de 3 ans à compter du dernier contact, puis supprimées ou anonymisées.
        </p>
      </LegalSection>

      <LegalSection title="Vos droits">
        <p>
          Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi « Informatique
          et Libertés », vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression, de
          limitation et d&apos;opposition concernant vos données personnelles. Pour exercer ces droits,
          contactez : remy@rendementreelimmo.fr.
        </p>
        <p>
          Vous disposez également du droit d&apos;introduire une réclamation auprès de la Commission Nationale
          de l&apos;Informatique et des Libertés (CNIL — www.cnil.fr).
        </p>
      </LegalSection>

      <LegalSection title="Hébergement et sécurité">
        <p>
          Les échanges entre votre navigateur et nos serveurs sont chiffrés (HTTPS/TLS). Pour plus de détails,
          voir la page <Link href="/securite-donnees" className="text-[#0B1B2B] underline">sécurité des données</Link>.
        </p>
      </LegalSection>

    </LegalPage>
  )
}
