import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage, LegalSection, ToComplete } from '@/components/ui/LegalPage'

export const metadata: Metadata = {
  title: 'Conditions générales de vente et d\'utilisation',
  robots: { index: false, follow: true },
}

export default function CGVPage() {
  return (
    <LegalPage title="Conditions générales de vente et d'utilisation" updated="10 juin 2026">

      <LegalSection title="Objet">
        <p>
          Les présentes conditions générales (« CGV ») régissent l&apos;accès et l&apos;utilisation du service
          Rendement Réel Immo, outil de simulation et de génération de rapports d&apos;arbitrage immobilier
          destiné aux professionnels (CGP, chasseurs immobiliers, courtiers, cabinets patrimoniaux et
          experts-comptables) ainsi qu&apos;aux particuliers via le simulateur en ligne.
        </p>
      </LegalSection>

      <LegalSection title="Description du service">
        <p>
          Le service permet de générer, à partir de données saisies par l&apos;utilisateur, des rapports
          d&apos;analyse comprenant notamment : rendement brut/net/net-net, cash-flow, TRI, VAN, fiscalité,
          dispositifs fiscaux, audit d&apos;éligibilité et stress tests. Il est proposé sous différentes
          formules détaillées sur la page <Link href="/tarifs" className="text-[#0B1B2B] underline">tarifs</Link>{' '}
          (Starter, Pro, Marque blanche), ainsi qu&apos;une offre pilote.
        </p>
      </LegalSection>

      <LegalSection title="Tarifs et facturation">
        <p>
          Les tarifs en vigueur sont indiqués sur la page <Link href="/tarifs" className="text-[#0B1B2B] underline">tarifs</Link>{' '}
          et sont exprimés hors taxes, sauf mention contraire. Les modalités de facturation et de paiement
          (périodicité, moyens de paiement, conditions de l&apos;offre pilote) sont précisées lors de la
          souscription.
        </p>
        <p>
          Modalités de paiement détaillées : <ToComplete>moyens de paiement acceptés, périodicité de facturation</ToComplete>.
        </p>
      </LegalSection>

      <LegalSection title="Durée, renouvellement et résiliation">
        <p>
          Sauf mention contraire au moment de la souscription, les abonnements sont conclus pour une durée
          mensuelle, renouvelable tacitement. Les conditions de résiliation (préavis, modalités) sont
          précisées : <ToComplete>conditions de résiliation et préavis applicables</ToComplete>.
        </p>
      </LegalSection>

      <LegalSection title="Nature de l'outil — exclusion de responsabilité">
        <p>
          Rendement Réel Immo fournit un outil de simulation et de documentation. Les rapports générés sont
          fondés sur les données saisies par l&apos;utilisateur et sur des hypothèses documentées
          (référentiel fiscal 2025-2026). Ils ne constituent pas un conseil en investissement, fiscal,
          juridique ou patrimonial personnalisé.
        </p>
        <p>
          Le professionnel utilisateur reste seul responsable de l&apos;analyse, de la connaissance client,
          de l&apos;adéquation de la recommandation au profil de son client et du respect de ses obligations
          réglementaires (notamment au regard de la réglementation applicable aux CGP, courtiers et autres
          professionnels du conseil).
        </p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle des rapports générés">
        <p>
          Les rapports générés par l&apos;utilisateur dans le cadre de son abonnement peuvent être librement
          utilisés, personnalisés (marque blanche) et diffusés à ses propres clients dans le cadre de son
          activité professionnelle. Le moteur de calcul, les modèles de rapport et l&apos;ensemble des
          éléments du site restent la propriété de l&apos;éditeur (voir{' '}
          <Link href="/mentions-legales" className="text-[#0B1B2B] underline">mentions légales</Link>).
        </p>
      </LegalSection>

      <LegalSection title="Droit applicable et litiges">
        <p>
          Les présentes CGV sont soumises au droit français. En cas de litige, et après tentative de
          résolution amiable, les tribunaux compétents seront ceux du ressort du siège de l&apos;éditeur,
          sauf disposition légale impérative contraire.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Pour toute question relative aux présentes CGV : <ToComplete>email de contact</ToComplete>.
        </p>
      </LegalSection>

    </LegalPage>
  )
}
