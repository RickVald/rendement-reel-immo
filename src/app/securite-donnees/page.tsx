import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage, LegalSection, ToComplete } from '@/components/ui/LegalPage'

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
          générer le rapport demandé. Elles ne sont pas écrites dans une base de données et ne sont pas
          conservées au-delà de la session de calcul.
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
          Le formulaire de demande de démo transmet les informations saisies directement par email, via
          le client de messagerie de l&apos;utilisateur, sans passer par une base de données du site.
        </p>
      </LegalSection>

      <LegalSection title="Hébergement">
        <p>
          Le site est hébergé chez : <ToComplete>nom de l'hébergeur (ex. Vercel)</ToComplete>, infrastructure
          conforme aux standards de sécurité usuels du secteur (datacenters certifiés, sauvegardes,
          surveillance).
        </p>
      </LegalSection>

      <LegalSection title="Accès en marque blanche et multi-utilisateurs">
        <p>
          Pour les offres marque blanche et multi-utilisateurs, l&apos;accès aux espaces clients est protégé
          par authentification. Les détails techniques (gestion des accès, séparation des données entre
          cabinets) sont précisés lors de la mise en place : <ToComplete>détails sur l'authentification et l'isolation des données par cabinet, le cas échéant</ToComplete>.
        </p>
      </LegalSection>

      <LegalSection title="Pour aller plus loin">
        <p>
          Voir également notre <Link href="/politique-confidentialite" className="text-[#0B1B2B] underline">politique de confidentialité</Link>{' '}
          et nos <Link href="/mentions-legales" className="text-[#0B1B2B] underline">mentions légales</Link>.
          Pour toute question de sécurité, contactez : <ToComplete>email de contact sécurité</ToComplete>.
        </p>
      </LegalSection>

    </LegalPage>
  )
}
