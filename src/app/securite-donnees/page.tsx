import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage, LegalSection } from '@/components/ui/LegalPage'

export const metadata: Metadata = {
  title: 'Sécurité des données',
  description: 'Comment Rendement Réel Immo protège les données saisies dans le simulateur et les rapports générés.',
  robots: { index: false, follow: true },
}

export default function SecuriteDonneesPage() {
  return (
    <LegalPage title="Sécurité des données" updated="10 juin 2026">

      <LegalSection title="Chiffrement des échanges">
        <p>
          L&apos;ensemble des échanges entre votre navigateur et nos serveurs est chiffré via HTTPS/TLS.
          Aucune donnée n&apos;est transmise en clair sur le réseau.
        </p>
      </LegalSection>

      <LegalSection title="Données du simulateur : pas de stockage permanent">
        <p>
          Les données saisies dans le simulateur (caractéristiques du bien, financement, fiscalité,
          hypothèses de revente, etc.) sont traitées de façon transitoire pour réaliser les calculs et
          générer le rapport demandé. Tant qu&apos;aucune coordonnée n&apos;est renseignée, elles ne sont pas
          écrites dans une base de données et ne sont pas conservées au-delà de la session de calcul.
        </p>
      </LegalSection>

      <LegalSection title="Synthèse automatique (IA)">
        <p>
          Lorsque la synthèse automatique est activée, un résumé des résultats du dossier (sans donnée
          d&apos;identification personnelle) peut être transmis à un prestataire d&apos;intelligence
          artificielle (Anthropic) pour générer une interprétation en langage clair. Ce traitement est
          ponctuel et n&apos;entraîne pas de stockage persistant côté Rendement Réel Immo.
        </p>
      </LegalSection>

      <LegalSection title="Rapports PDF">
        <p>
          Les rapports PDF sont générés à la demande et téléchargés directement par l&apos;utilisateur.
          Ils ne sont pas stockés sur nos serveurs après leur génération.
        </p>
      </LegalSection>

      <LegalSection title="Demandes de démo et formulaires">
        <p>
          Le formulaire de demande de démo et le formulaire affiché avant les résultats détaillés du
          simulateur enregistrent les informations saisies (nom, email, téléphone, résumé du projet) dans
          notre CRM interne, hébergé sur une base de données Postgres (Neon, hébergement Union européenne).
          Une notification est également envoyée à notre équipe par email via notre prestataire d&apos;envoi
          transactionnel (Brevo). L&apos;accès à ce CRM est protégé par authentification et réservé à notre équipe.
        </p>
      </LegalSection>

      <LegalSection title="Paiement (Stripe)">
        <p>
          Les paiements liés à l&apos;achat de rapports sont traités par Stripe, prestataire de paiement
          certifié PCI-DSS. Les coordonnées bancaires sont saisies sur l&apos;interface sécurisée de Stripe et
          ne transitent jamais par nos serveurs ni par notre base de données.
        </p>
      </LegalSection>

      <LegalSection title="Hébergement">
        <p>
          Le site et l&apos;application sont hébergés chez Vercel Inc., infrastructure cloud reposant sur des
          datacenters certifiés, avec chiffrement systématique en transit (HTTPS/TLS) et surveillance continue.
          La base de données du CRM (Neon Postgres) est hébergée dans l&apos;Union européenne. Les données du
          simulateur transitent par cette infrastructure sans y être stockées de façon permanente lorsqu&apos;aucune
          coordonnée n&apos;est renseignée (voir ci-dessus).
        </p>
      </LegalSection>

      <LegalSection title="Accès en marque blanche et multi-utilisateurs">
        <p>
          Les espaces professionnels sont protégés par authentification. Les données sont cloisonnées par
          compte utilisateur / cabinet dans la base applicative.
        </p>
      </LegalSection>

      <LegalSection title="Pour aller plus loin">
        <p>
          Voir également notre <Link href="/politique-confidentialite" className="text-[#0B1B2B] underline">politique de confidentialité</Link>{' '}
          et nos <Link href="/mentions-legales" className="text-[#0B1B2B] underline">mentions légales</Link>.
          Pour toute question de sécurité, contactez : remy@rendementreelimmo.fr.
        </p>
      </LegalSection>

    </LegalPage>
  )
}
