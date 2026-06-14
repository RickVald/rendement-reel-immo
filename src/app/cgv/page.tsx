import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage, LegalSection } from '@/components/ui/LegalPage'

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
          Pour les particuliers, les rapports à l&apos;unité ou en pack sont payables en une fois par carte
          bancaire via notre prestataire de paiement Stripe. Pour les professionnels, les abonnements sont
          facturés selon la périodicité convenue lors de la souscription.
        </p>
      </LegalSection>

      <LegalSection title="Durée, renouvellement et résiliation">
        <p>
          Sauf mention contraire au moment de la souscription, les abonnements sont conclus pour une durée
          mensuelle, renouvelable tacitement, sans engagement de durée. Ils sont résiliables à tout moment
          depuis l&apos;espace client ou sur simple demande par email à remy@rendementreelimmo.fr. La
          résiliation prend effet à la fin de la période mensuelle en cours. Aucun remboursement au prorata
          temporis n&apos;est dû, sauf accord contraire.
        </p>
      </LegalSection>

      <LegalSection title="Nature du service — simulation indicative, pas de conseil personnalisé">
        <p>
          Le Service fournit des simulations chiffrées automatisées à partir des données saisies par
          l&apos;utilisateur. Les résultats, rapports, scores, TRI, VAN, cash-flows, prix cibles et
          comparaisons de régimes ne constituent ni un conseil en investissement, ni un conseil fiscal, ni un
          conseil juridique, ni une recommandation personnalisée d&apos;acquisition, de vente, de financement
          ou de structuration patrimoniale.
        </p>
        <p>
          Les rapports générés sont fondés sur les données saisies par l&apos;utilisateur et sur des
          hypothèses documentées (référentiel fiscal 2025-2026).
        </p>
      </LegalSection>

      <LegalSection title="Responsabilité des données saisies par l'utilisateur">
        <p>
          L&apos;utilisateur est seul responsable de l&apos;exactitude, de l&apos;exhaustivité et de
          l&apos;actualité des données saisies : prix, loyers, charges, fiscalité personnelle, travaux, DPE,
          financement, copropriété, valeur de revente, dispositifs fiscaux, durée de détention. Une donnée
          inexacte ou incomplète peut produire un résultat erroné ou non exploitable.
        </p>
      </LegalSection>

      <LegalSection title="Résultats non garantis">
        <p>
          Les projections sont fondées sur des hypothèses et ne garantissent ni la rentabilité future du
          bien, ni son prix de revente, ni l&apos;obtention d&apos;un financement, ni l&apos;éligibilité
          effective à un régime fiscal ou dispositif public.
        </p>
      </LegalSection>

      <LegalSection title="Prix cible et seuils de simulation">
        <p>
          Le prix cible affiché est un seuil mathématique de simulation calculé selon les hypothèses et
          objectifs saisis. Il ne constitue pas une estimation de marché, une expertise immobilière, une
          offre d&apos;achat recommandée ni une indication de valeur vénale.
        </p>
      </LegalSection>

      <LegalSection title="Fiscalité — informations fournies sous réserve">
        <p>
          Les calculs fiscaux sont fournis à titre indicatif selon les règles modélisées à la date de
          génération du rapport. Ils ne remplacent pas une validation par un expert-comptable, un notaire, un
          avocat fiscaliste ou l&apos;administration fiscale. Les dispositifs fiscaux affichés peuvent être
          soumis à des conditions d&apos;éligibilité, plafonds, engagements de durée, zones géographiques,
          non-cumul et justificatifs non vérifiables automatiquement par le Service.
        </p>
      </LegalSection>

      <LegalSection title="Rapports « Non arbitrable en l'état »">
        <p>
          Lorsqu&apos;un rapport indique « Non arbitrable en l&apos;état », les résultats associés ne doivent
          pas être utilisés comme base de décision. L&apos;utilisateur doit corriger ou compléter les
          hypothèses avant toute interprétation.
        </p>
      </LegalSection>

      <LegalSection title="Limitation de responsabilité">
        <p>
          La responsabilité de l&apos;éditeur ne peut être engagée du fait d&apos;une décision
          d&apos;investissement, de financement, de vente, d&apos;achat ou de montage fiscal prise sur la base
          du Service, notamment lorsque cette décision repose sur des données incomplètes, erronées, non
          vérifiées ou sur des hypothèses futures.
        </p>
        <p>
          Cette limitation ne saurait exclure la responsabilité de l&apos;éditeur dans les cas où la loi
          l&apos;interdit (notamment en cas de faute lourde ou dolosive, ou d&apos;atteinte aux droits du
          consommateur prévus par le Code de la consommation).
        </p>
      </LegalSection>

      <LegalSection title="Utilisateurs professionnels et clients finaux">
        <p>
          Lorsque le Service est utilisé par un professionnel (CGP, chasseur immobilier, courtier, agent
          immobilier, expert-comptable, etc.) pour accompagner un client final, le professionnel demeure seul
          responsable de son devoir de conseil, de la vérification des données, de l&apos;adéquation du projet
          à la situation du client et de la présentation du rapport à ce dernier.
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

      <LegalSection title="Droit de rétractation (consommateurs)">
        <p>
          Conformément au Code de la consommation, le consommateur dispose en principe d&apos;un délai de 14
          jours pour exercer son droit de rétractation sur un contrat conclu à distance. Toutefois, lorsque le
          rapport est généré et mis à disposition avant l&apos;expiration de ce délai, à la demande expresse du
          consommateur et avec son accord préalable, le consommateur reconnaît que le service est pleinement
          exécuté et renonce expressément à son droit de rétractation.
        </p>
        <p>
          Au moment de la commande, il est demandé au consommateur de cocher une case du type : « Je demande
          l&apos;exécution immédiate du service avant la fin du délai de rétractation et reconnais qu&apos;une
          fois le rapport généré, je renonce à mon droit de rétractation pour ce service pleinement exécuté. »
          À défaut de cette demande expresse, le droit de rétractation de 14 jours s&apos;applique dans les
          conditions prévues par la loi.
        </p>
      </LegalSection>

      <LegalSection title="Disponibilité du service et anomalies">
        <p>
          L&apos;éditeur peut corriger, faire évoluer ou suspendre temporairement le Service, notamment pour
          des opérations de maintenance ou d&apos;amélioration. Malgré les contrôles réalisés, des erreurs,
          anomalies d&apos;affichage, indisponibilités ou incohérences peuvent survenir. L&apos;utilisateur
          s&apos;engage à signaler toute incohérence manifeste avant toute utilisation décisionnelle du
          rapport, à remy@rendementreelimmo.fr.
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
          Pour toute question relative aux présentes CGV : remy@rendementreelimmo.fr.
        </p>
      </LegalSection>

    </LegalPage>
  )
}
