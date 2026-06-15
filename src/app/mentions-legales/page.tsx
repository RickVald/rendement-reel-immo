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
          <li>Raison sociale / nom : Rémy Ricaud</li>
          <li>Forme juridique : Entreprise individuelle</li>
          <li>Adresse du siège : Moulin de Carmenais, 56120 Saint-Servant</li>
          <li>SIREN : 883 055 857</li>
          <li>Immatriculation : RCS Vannes</li>
          <li>TVA intracommunautaire : <ToComplete>numéro de TVA intracommunautaire ou mention &laquo; TVA non applicable, art. 293 B du CGI &raquo; si franchise en base</ToComplete></li>
          <li>Email de contact : remy@rendementreelimmo.fr</li>
        </ul>
      </LegalSection>

      <LegalSection title="Directeur de la publication">
        <p>
          Le directeur de la publication est : Rémy Ricaud.
        </p>
      </LegalSection>

      <LegalSection title="Hébergement">
        <p>
          Le site est hébergé par :
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Hébergeur : Vercel Inc.</li>
          <li>Adresse : 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</li>
          <li>Site web : <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-[#0B1B2B] underline">vercel.com</a></li>
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

      <LegalSection title="Médiateur de la consommation">
        <p>
          Conformément aux articles L.616-1 et R.616-1 du Code de la consommation, en cas de litige avec un
          consommateur n&apos;ayant pu être résolu directement auprès de l&apos;éditeur, le consommateur peut
          recourir gratuitement au service de médiation suivant : CNPM &mdash; Médiation de la Consommation,
          27 avenue de la Libération, 42400 Saint-Chamond,{' '}
          <a href="https://cnpm-mediation-consommation.eu" target="_blank" rel="noreferrer" className="text-[#0B1B2B] underline">
            cnpm-mediation-consommation.eu
          </a>.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Pour toute question relative au site ou à son contenu : remy@rendementreelimmo.fr.
        </p>
      </LegalSection>

    </LegalPage>
  )
}
