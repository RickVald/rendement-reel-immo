import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage, LegalSection, ToComplete } from '@/components/ui/LegalPage'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  robots: { index: false, follow: true },
}

export default function PolitiqueConfidentialitePage() {
  return (
    <LegalPage title="Politique de confidentialité" updated="10 juin 2026">

      <LegalSection title="Responsable du traitement">
        <p>
          Le responsable du traitement des données est : <ToComplete>raison sociale / nom</ToComplete>,
          contact : <ToComplete>email de contact</ToComplete>. Voir aussi les{' '}
          <Link href="/mentions-legales" className="text-[#0B1B2B] underline">mentions légales</Link>.
        </p>
      </LegalSection>

      <LegalSection title="Données traitées par le simulateur">
        <p>
          Les informations saisies dans le simulateur (caractéristiques du bien, financement, fiscalité,
          hypothèses de revente, etc.) sont transmises de façon sécurisée (HTTPS) à nos serveurs uniquement
          pour effectuer les calculs et générer le rapport demandé. Ces données ne sont pas stockées de
          façon permanente ni revendues.
        </p>
        <p>
          Lorsque la synthèse automatique du dossier est activée, un résumé anonymisé des résultats peut être
          transmis à un prestataire d&apos;intelligence artificielle (Anthropic) pour générer une interprétation
          en langage clair. Aucune donnée d&apos;identification personnelle (nom, coordonnées) n&apos;est transmise
          à ce prestataire.
        </p>
      </LegalSection>

      <LegalSection title="Données collectées via le formulaire de demande de démo">
        <p>
          Le formulaire de demande de démo (page « Professionnels ») collecte : nom, société, métier, email
          professionnel, volume de dossiers et besoin exprimé. Ces informations sont transmises directement
          par email à l&apos;équipe Rendement Réel Immo (via le client de messagerie de l&apos;utilisateur) et
          ne transitent pas par une base de données du site.
        </p>
        <p>
          Ces données sont utilisées uniquement pour répondre à la demande de démonstration et ne sont
          conservées que le temps nécessaire au traitement de la demande commerciale.
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
          Les données saisies dans le simulateur ne sont pas conservées au-delà de la session nécessaire au
          calcul et à la génération du rapport. Les demandes de démo transmises par email sont conservées le
          temps de la relation commerciale, puis supprimées ou archivées conformément aux obligations légales.
        </p>
      </LegalSection>

      <LegalSection title="Vos droits">
        <p>
          Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi « Informatique
          et Libertés », vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression, de
          limitation et d&apos;opposition concernant vos données personnelles. Pour exercer ces droits,
          contactez : <ToComplete>email de contact dédié RGPD</ToComplete>.
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
