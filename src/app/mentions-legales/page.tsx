import type { Metadata } from 'next'
import { LegalPage, LegalSection, ToComplete } from '@/components/ui/LegalPage'

export const metadata: Metadata = {
  title: 'Mentions légales',
  robots: { index: false, follow: true },
}

export default function MentionsLegalesPage() {
  return (
    <LegalPage title="Mentions légales" updated="10 juin 2026">

      <LegalSection title="Éditeur du site">
        <p>
          Le site Rendement Réel Immo (https://rendementreelimmo.fr) est édité par :
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Raison sociale / nom : <ToComplete>raison sociale ou nom et prénom</ToComplete></li>
          <li>Forme juridique : <ToComplete>ex. auto-entreprise, SASU, SARL...</ToComplete></li>
          <li>Adresse du siège : <ToComplete>adresse postale</ToComplete></li>
          <li>SIRET / SIREN : <ToComplete>numéro d'immatriculation</ToComplete></li>
          <li>TVA intracommunautaire : <ToComplete>numéro de TVA si applicable</ToComplete></li>
          <li>Email de contact : <ToComplete>adresse email professionnelle</ToComplete></li>
          <li>Téléphone : <ToComplete>numéro de téléphone (facultatif)</ToComplete></li>
        </ul>
      </LegalSection>

      <LegalSection title="Directeur de la publication">
        <p>
          Le directeur de la publication est : <ToComplete>nom et prénom du responsable</ToComplete>.
        </p>
      </LegalSection>

      <LegalSection title="Hébergement">
        <p>
          Le site est hébergé par :
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Hébergeur : <ToComplete>ex. Vercel Inc.</ToComplete></li>
          <li>Adresse : <ToComplete>adresse de l'hébergeur</ToComplete></li>
          <li>Site web : <ToComplete>URL de l'hébergeur</ToComplete></li>
        </ul>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          L&apos;ensemble des éléments du site (textes, design, logo, charte graphique, moteur de calcul,
          modèles de rapports) est la propriété exclusive de l&apos;éditeur, sauf mention contraire.
          Toute reproduction, représentation, modification ou adaptation, totale ou partielle, est interdite
          sans autorisation préalable écrite.
        </p>
        <p>
          Les rapports générés via le simulateur ou en marque blanche peuvent être utilisés et diffusés
          librement par les utilisateurs professionnels dans le cadre de leur activité, dans les conditions
          prévues par les <a href="/cgv" className="text-[#0B1B2B] underline">conditions générales</a>.
        </p>
      </LegalSection>

      <LegalSection title="Nature de l'outil et limitation de responsabilité">
        <p>
          Rendement Réel Immo est un outil de simulation et de documentation destiné à faciliter l&apos;analyse
          de projets immobiliers locatifs. Les résultats produits (rendements, cash-flow, TRI, VAN, fiscalité,
          dispositifs fiscaux, audits d&apos;éligibilité, etc.) sont calculés à partir des données saisies par
          l&apos;utilisateur et d&apos;hypothèses documentées.
        </p>
        <p>
          Ces résultats ne constituent ni un conseil en investissement, ni un conseil juridique, fiscal ou
          patrimonial personnalisé. L&apos;utilisateur professionnel reste seul responsable de l&apos;analyse,
          de la connaissance client, de l&apos;adéquation de la recommandation et du respect de ses obligations
          réglementaires. L&apos;éditeur ne saurait être tenu responsable des décisions prises sur la base des
          rapports générés.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Pour toute question relative au site ou à son contenu : <ToComplete>email de contact</ToComplete>.
        </p>
      </LegalSection>

    </LegalPage>
  )
}
