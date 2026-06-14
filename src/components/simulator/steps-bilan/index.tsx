'use client'
import { clsx } from 'clsx'
import { Input, Select, Toggle, Section, Grid2 } from '@/components/ui/FormField'
import type {
  ProjectInputBilan,
  ObjectifType,
  ObjectifPatrimonialBilanInput,
  BienPatrimonialInput,
  ActifFinancierInput,
  DetteInput,
} from '@/lib/calculator/types-bilan'

export type SPB = { data: ProjectInputBilan; onChange: (patch: Partial<ProjectInputBilan>) => void }

// ─── Libellés partagés ──────────────────────────────────────────────────────

export const OBJECTIF_LABELS: Record<ObjectifType, string> = {
  acheter_residence_principale: 'Acheter ma résidence principale',
  preparer_retraite: 'Préparer ma retraite',
  revenus_complementaires: 'Générer des revenus complémentaires',
  investir_immobilier: 'Investir dans l\'immobilier',
  reduire_fiscalite: 'Réduire ma fiscalité',
  proteger_famille: 'Protéger ma famille',
  transmettre_patrimoine: 'Transmettre mon patrimoine',
  vendre_arbitrer_bien: 'Vendre ou arbitrer un bien',
  developper_patrimoine_financier: 'Développer mon patrimoine financier',
  epargne_precaution: 'Constituer une épargne de précaution',
  autre: 'Autre objectif',
}

const HORIZON_OPTIONS = [
  { value: '<2', label: 'Moins de 2 ans' },
  { value: '2-5', label: '2 à 5 ans' },
  { value: '5-10', label: '5 à 10 ans' },
  { value: '>10', label: 'Plus de 10 ans' },
]

const PRIORITE_OPTIONS = [
  { value: 'faible', label: 'Faible' },
  { value: 'moyenne', label: 'Moyenne' },
  { value: 'forte', label: 'Forte' },
]

const NIVEAU_RISQUE_OPTIONS = [
  { value: 'faible', label: 'Faible' },
  { value: 'moyen', label: 'Moyen' },
  { value: 'eleve', label: 'Élevé' },
]

const NIVEAU_LIQUIDITE_OPTIONS = [
  { value: 'faible', label: 'Faible' },
  { value: 'moyen', label: 'Moyen' },
  { value: 'eleve', label: 'Élevé' },
]

const OUI_NON_INCONNU_OPTIONS = [
  { value: 'oui', label: 'Oui' },
  { value: 'non', label: 'Non' },
  { value: 'inconnu', label: 'Je ne sais pas' },
]

// ─── STEP 1 — Profil personnel ─────────────────────────────────────────────

export function StepProfilPersonnel({ data, onChange }: SPB) {
  const p = data.profil
  const set = (patch: Partial<typeof p>) => onChange({ profil: { ...p, ...patch } })

  return (
    <div className="space-y-6">
      <Section title="Vous">
        <Grid2>
          <Input label="Âge" type="number" min={18} value={p.age} onChange={e => set({ age: +e.target.value })} suffix="ans" />
          <Select label="Situation familiale" value={p.situationFamiliale}
            onChange={e => set({ situationFamiliale: e.target.value as typeof p.situationFamiliale })}
            options={[
              { value: 'celibataire', label: 'Célibataire' },
              { value: 'concubinage', label: 'En concubinage' },
              { value: 'pacs', label: 'Pacsé(e)' },
              { value: 'marie', label: 'Marié(e)' },
              { value: 'divorce', label: 'Divorcé(e)' },
              { value: 'veuf', label: 'Veuf / Veuve' },
            ]}
          />
        </Grid2>
        <Grid2>
          <Input label="Nombre d'enfants" type="number" min={0} value={p.nombreEnfants} onChange={e => set({ nombreEnfants: +e.target.value })} />
          <Select label="Régime matrimonial" value={p.situationMatrimoniale}
            onChange={e => set({ situationMatrimoniale: e.target.value as typeof p.situationMatrimoniale })}
            options={[
              { value: 'communaute', label: 'Communauté' },
              { value: 'separation_biens', label: 'Séparation de biens' },
              { value: 'communaute_universelle', label: 'Communauté universelle' },
              { value: 'inconnu', label: 'Je ne sais pas / non applicable' },
            ]}
          />
        </Grid2>
      </Section>

      <Section title="Activité professionnelle">
        <Select label="Statut professionnel" value={p.statutProfessionnel}
          onChange={e => set({ statutProfessionnel: e.target.value as typeof p.statutProfessionnel })}
          options={[
            { value: 'salarie_prive', label: 'Salarié(e) du privé' },
            { value: 'salarie_public', label: 'Salarié(e) de la fonction publique' },
            { value: 'independant', label: 'Indépendant(e) / freelance' },
            { value: 'chef_entreprise', label: 'Chef(fe) d\'entreprise' },
            { value: 'retraite', label: 'Retraité(e)' },
            { value: 'sans_emploi', label: 'Sans emploi' },
            { value: 'etudiant', label: 'Étudiant(e)' },
            { value: 'autre', label: 'Autre' },
          ]}
        />
        <Input label="Pays de résidence fiscale" value={p.paysResidenceFiscale} onChange={e => set({ paysResidenceFiscale: e.target.value })} />
      </Section>

      <Section title="Budget global du foyer">
        <Grid2>
          <Input label="Revenus mensuels nets du foyer" type="number" value={p.revenusMensuelsNetsFoyer}
            onChange={e => set({ revenusMensuelsNetsFoyer: +e.target.value })} suffix="€/mois" />
          <Input label="Charges mensuelles du foyer" type="number" value={p.chargesMensuelles}
            onChange={e => set({ chargesMensuelles: +e.target.value })} suffix="€/mois" />
        </Grid2>
        <Input label="Capacité d'épargne mensuelle estimée" type="number" value={p.capaciteEpargneEstimee}
          onChange={e => set({ capaciteEpargneEstimee: +e.target.value })} suffix="€/mois" />
        <Toggle label="Vous êtes propriétaire de votre résidence principale" checked={p.residencePrincipale}
          onChange={v => set({ residencePrincipale: v })} />
      </Section>
    </div>
  )
}

// ─── STEP 2 — Objectifs patrimoniaux ───────────────────────────────────────

const DEFAULT_OBJECTIF: Omit<ObjectifPatrimonialBilanInput, 'type'> = {
  priorite: 'moyenne',
  horizon: '2-5',
  niveauRisqueAccepte: 'moyen',
  besoinLiquidite: 'moyen',
}

export function StepObjectifsPatrimoniaux({ data, onChange }: SPB) {
  const objectifs = data.objectifs

  const toggle = (type: ObjectifType) => {
    if (objectifs.some(o => o.type === type)) {
      onChange({ objectifs: objectifs.filter(o => o.type !== type) })
    } else {
      onChange({ objectifs: [...objectifs, { type, ...DEFAULT_OBJECTIF }] })
    }
  }

  const update = (type: ObjectifType, patch: Partial<ObjectifPatrimonialBilanInput>) => {
    onChange({ objectifs: objectifs.map(o => (o.type === type ? { ...o, ...patch } : o)) })
  }

  return (
    <div className="space-y-4">
      <Section title="Vos objectifs patrimoniaux">
        <p className="text-xs text-slate-500">
          Sélectionnez les objectifs qui correspondent à votre situation (plusieurs choix possibles).
        </p>
        <div className="space-y-3">
          {(Object.keys(OBJECTIF_LABELS) as ObjectifType[]).map(type => {
            const objectif = objectifs.find(o => o.type === type)
            return (
              <div
                key={type}
                className={clsx(
                  'border rounded-xl p-3 transition-colors',
                  objectif ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-200 bg-white'
                )}
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-emerald-600" checked={!!objectif} onChange={() => toggle(type)} />
                  <span className="text-sm font-medium text-slate-800">{OBJECTIF_LABELS[type]}</span>
                </label>
                {objectif && (
                  <div className="mt-3 space-y-3 pl-1">
                    {type === 'autre' && (
                      <Input label="Précisez votre objectif" value={objectif.libellePersonnalise ?? ''}
                        onChange={e => update(type, { libellePersonnalise: e.target.value })} />
                    )}
                    <Grid2>
                      <Select label="Priorité" value={objectif.priorite}
                        onChange={e => update(type, { priorite: e.target.value as typeof objectif.priorite })}
                        options={PRIORITE_OPTIONS} />
                      <Select label="Horizon" value={objectif.horizon}
                        onChange={e => update(type, { horizon: e.target.value as typeof objectif.horizon })}
                        options={HORIZON_OPTIONS} />
                    </Grid2>
                    <Grid2>
                      <Input label="Montant visé (facultatif)" type="number" value={objectif.montantVise ?? ''}
                        placeholder="Non précisé"
                        onChange={e => update(type, { montantVise: e.target.value === '' ? undefined : +e.target.value })}
                        suffix="€" />
                      <Select label="Niveau de risque accepté" value={objectif.niveauRisqueAccepte}
                        onChange={e => update(type, { niveauRisqueAccepte: e.target.value as typeof objectif.niveauRisqueAccepte })}
                        options={NIVEAU_RISQUE_OPTIONS} />
                    </Grid2>
                    <Select label="Besoin de liquidité" value={objectif.besoinLiquidite}
                      onChange={e => update(type, { besoinLiquidite: e.target.value as typeof objectif.besoinLiquidite })}
                      options={NIVEAU_LIQUIDITE_OPTIONS} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Section>
    </div>
  )
}

// ─── STEP 3 — Revenus, charges, épargne ────────────────────────────────────

export function StepRevenusChargesEpargne({ data, onChange }: SPB) {
  const r = data.revenusChargesEpargne
  const set = (patch: Partial<typeof r>) => onChange({ revenusChargesEpargne: { ...r, ...patch } })

  const chargesTotales = r.chargesFixes + r.mensualitesCredit + r.impotsMensuels
  const resteAVivre = r.revenusMensuelsNets - chargesTotales
  const tauxEpargne = r.revenusMensuelsNets > 0 ? r.capaciteEpargneMensuelle / r.revenusMensuelsNets : 0
  const moisSecurite = chargesTotales > 0 ? r.epargneDisponible / chargesTotales : null

  return (
    <div className="space-y-6">
      <Section title="Revenus et charges mensuelles">
        <Grid2>
          <Input label="Revenus mensuels nets" type="number" value={r.revenusMensuelsNets}
            onChange={e => set({ revenusMensuelsNets: +e.target.value })} suffix="€/mois" />
          <Input label="Charges fixes (hors crédits et impôts)" type="number" value={r.chargesFixes}
            onChange={e => set({ chargesFixes: +e.target.value })} suffix="€/mois" />
        </Grid2>
        <Grid2>
          <Input label="Mensualités de crédits" type="number" value={r.mensualitesCredit}
            onChange={e => set({ mensualitesCredit: +e.target.value })} suffix="€/mois" />
          <Input label="Impôts mensuels (mensualisés)" type="number" value={r.impotsMensuels}
            onChange={e => set({ impotsMensuels: +e.target.value })} suffix="€/mois" />
        </Grid2>
      </Section>

      <Section title="Épargne">
        <Grid2>
          <Input label="Capacité d'épargne mensuelle" type="number" value={r.capaciteEpargneMensuelle}
            onChange={e => set({ capaciteEpargneMensuelle: +e.target.value })} suffix="€/mois" />
          <Input label="Épargne disponible (livrets, comptes courants...)" type="number" value={r.epargneDisponible}
            onChange={e => set({ epargneDisponible: +e.target.value })} suffix="€" />
        </Grid2>
        <Select label="Stabilité des revenus" value={r.stabiliteRevenus}
          onChange={e => set({ stabiliteRevenus: e.target.value as typeof r.stabiliteRevenus })}
          options={[
            { value: 'stable', label: 'Stable' },
            { value: 'variable', label: 'Variable' },
            { value: 'incertaine', label: 'Incertaine' },
          ]}
        />
      </Section>

      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600 space-y-1">
        <p>Reste à vivre estimé : <strong>{Math.round(resteAVivre).toLocaleString('fr-FR')} € / mois</strong></p>
        <p>Taux d&apos;épargne estimé : <strong>{Math.round(tauxEpargne * 100)} %</strong></p>
        <p>Épargne de précaution estimée : <strong>{moisSecurite === null ? 'N/A' : `${moisSecurite.toFixed(1)} mois de charges`}</strong></p>
        <p className="text-xs text-slate-400">Ces indicateurs sont calculés à titre indicatif à partir des informations saisies.</p>
      </div>
    </div>
  )
}

// ─── STEP 4 — Patrimoine immobilier ────────────────────────────────────────

const TYPE_BIEN_OPTIONS = [
  { value: 'residence_principale', label: 'Résidence principale' },
  { value: 'investissement_locatif', label: 'Investissement locatif' },
  { value: 'residence_secondaire', label: 'Résidence secondaire' },
  { value: 'scpi', label: 'SCPI détenue en direct' },
  { value: 'autre', label: 'Autre' },
]

const REGIME_FISCAL_OPTIONS = [
  { value: 'micro_foncier', label: 'Micro-foncier' },
  { value: 'reel_foncier', label: 'Réel foncier' },
  { value: 'lmnp_micro', label: 'LMNP micro-BIC' },
  { value: 'lmnp_reel', label: 'LMNP réel' },
  { value: 'sci_is', label: 'SCI à l\'IS' },
  { value: 'non_applicable', label: 'Non applicable' },
  { value: 'inconnu', label: 'Je ne sais pas' },
]

const DPE_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'inconnu'].map(v => ({ value: v, label: v === 'inconnu' ? 'Je ne sais pas' : `DPE ${v}` }))

function nouveauBien(): BienPatrimonialInput {
  return {
    id: crypto.randomUUID(),
    type: 'investissement_locatif',
    valeurEstimee: 0,
    creditRestant: 0,
    mensualite: 0,
    loyerPercu: 0,
    chargesAnnuelles: 0,
    taxeFonciere: 0,
    regimeFiscal: 'inconnu',
    travauxPrevus: 0,
    dpe: 'inconnu',
  }
}

export function StepPatrimoineImmobilier({ data, onChange }: SPB) {
  const { biens } = data.patrimoineImmobilier
  const set = (next: BienPatrimonialInput[]) => onChange({ patrimoineImmobilier: { biens: next } })
  const objectifOptions = [{ value: '', label: 'Aucun objectif associé' }, ...data.objectifs.map(o => ({ value: o.type, label: OBJECTIF_LABELS[o.type] }))]

  return (
    <div className="space-y-4">
      <Section title="Patrimoine immobilier">
        <p className="text-xs text-slate-500">Déclarez chaque bien immobilier détenu (résidence principale, investissements locatifs, SCPI...).</p>
        {biens.map((b, i) => (
          <div key={b.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Bien #{i + 1}</span>
              <button type="button" onClick={() => set(biens.filter(x => x.id !== b.id))} className="text-red-400 hover:text-red-600 text-lg leading-none px-1">×</button>
            </div>
            <Grid2>
              <Select label="Type de bien" value={b.type}
                onChange={e => set(biens.map(x => x.id === b.id ? { ...x, type: e.target.value as typeof b.type } : x))}
                options={TYPE_BIEN_OPTIONS} />
              <Input label="Valeur estimée" type="number" value={b.valeurEstimee}
                onChange={e => set(biens.map(x => x.id === b.id ? { ...x, valeurEstimee: +e.target.value } : x))} suffix="€" />
            </Grid2>
            <Grid2>
              <Input label="Crédit restant dû" type="number" value={b.creditRestant}
                onChange={e => set(biens.map(x => x.id === b.id ? { ...x, creditRestant: +e.target.value } : x))} suffix="€" />
              <Input label="Mensualité de crédit" type="number" value={b.mensualite}
                onChange={e => set(biens.map(x => x.id === b.id ? { ...x, mensualite: +e.target.value } : x))} suffix="€/mois" />
            </Grid2>
            <Grid2>
              <Input label="Loyer perçu (0 si non locatif)" type="number" value={b.loyerPercu}
                onChange={e => set(biens.map(x => x.id === b.id ? { ...x, loyerPercu: +e.target.value } : x))} suffix="€/mois" />
              <Input label="Charges annuelles" type="number" value={b.chargesAnnuelles}
                onChange={e => set(biens.map(x => x.id === b.id ? { ...x, chargesAnnuelles: +e.target.value } : x))} suffix="€/an" />
            </Grid2>
            <Grid2>
              <Input label="Taxe foncière" type="number" value={b.taxeFonciere}
                onChange={e => set(biens.map(x => x.id === b.id ? { ...x, taxeFonciere: +e.target.value } : x))} suffix="€/an" />
              <Input label="Travaux prévus" type="number" value={b.travauxPrevus}
                onChange={e => set(biens.map(x => x.id === b.id ? { ...x, travauxPrevus: +e.target.value } : x))} suffix="€" />
            </Grid2>
            <Grid2>
              <Select label="Régime fiscal" value={b.regimeFiscal}
                onChange={e => set(biens.map(x => x.id === b.id ? { ...x, regimeFiscal: e.target.value as typeof b.regimeFiscal } : x))}
                options={REGIME_FISCAL_OPTIONS} />
              <Select label="DPE" value={b.dpe}
                onChange={e => set(biens.map(x => x.id === b.id ? { ...x, dpe: e.target.value as typeof b.dpe } : x))}
                options={DPE_OPTIONS} />
            </Grid2>
            <Select label="Objectif associé (facultatif)" value={b.objectifAssocie ?? ''}
              onChange={e => set(biens.map(x => x.id === b.id ? { ...x, objectifAssocie: e.target.value === '' ? undefined : e.target.value as typeof b.objectifAssocie } : x))}
              options={objectifOptions} />
          </div>
        ))}
        <button type="button" onClick={() => set([...biens, nouveauBien()])} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
          + Ajouter un bien immobilier
        </button>
      </Section>
    </div>
  )
}

// ─── STEP 5 — Patrimoine financier ─────────────────────────────────────────

const CATEGORIE_ACTIF_OPTIONS = [
  { value: 'livret', label: 'Livret (A, LDDS...)' },
  { value: 'fonds_euros', label: 'Fonds en euros' },
  { value: 'assurance_vie', label: 'Assurance-vie (unités de compte)' },
  { value: 'pea', label: 'PEA' },
  { value: 'compte_titres', label: 'Compte-titres' },
  { value: 'per', label: 'PER' },
  { value: 'crypto', label: 'Cryptoactifs' },
  { value: 'epargne_salariale', label: 'Épargne salariale' },
  { value: 'scpi_financier', label: 'SCPI (via contrat)' },
  { value: 'autre', label: 'Autre' },
]

function nouvelActif(): ActifFinancierInput {
  return {
    id: crypto.randomUUID(),
    categorie: 'livret',
    montant: 0,
    disponibilite: 'eleve',
    niveauRisque: 'faible',
    horizon: '2-5',
    fraisConnus: 'inconnu',
  }
}

export function StepPatrimoineFinancier({ data, onChange }: SPB) {
  const { actifs } = data.patrimoineFinancier
  const set = (next: ActifFinancierInput[]) => onChange({ patrimoineFinancier: { actifs: next } })
  const objectifOptions = [{ value: '', label: 'Aucun objectif associé' }, ...data.objectifs.map(o => ({ value: o.type, label: OBJECTIF_LABELS[o.type] }))]

  return (
    <div className="space-y-4">
      <Section title="Patrimoine financier">
        <p className="text-xs text-slate-500">Déclarez vos placements financiers (livrets, assurance-vie, PEA, PER...).</p>
        {actifs.map((a, i) => (
          <div key={a.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Actif #{i + 1}</span>
              <button type="button" onClick={() => set(actifs.filter(x => x.id !== a.id))} className="text-red-400 hover:text-red-600 text-lg leading-none px-1">×</button>
            </div>
            <Grid2>
              <Select label="Catégorie" value={a.categorie}
                onChange={e => set(actifs.map(x => x.id === a.id ? { ...x, categorie: e.target.value as typeof a.categorie } : x))}
                options={CATEGORIE_ACTIF_OPTIONS} />
              <Input label="Montant" type="number" value={a.montant}
                onChange={e => set(actifs.map(x => x.id === a.id ? { ...x, montant: +e.target.value } : x))} suffix="€" />
            </Grid2>
            <Grid2>
              <Select label="Disponibilité" value={a.disponibilite}
                onChange={e => set(actifs.map(x => x.id === a.id ? { ...x, disponibilite: e.target.value as typeof a.disponibilite } : x))}
                options={NIVEAU_LIQUIDITE_OPTIONS} />
              <Select label="Niveau de risque" value={a.niveauRisque}
                onChange={e => set(actifs.map(x => x.id === a.id ? { ...x, niveauRisque: e.target.value as typeof a.niveauRisque } : x))}
                options={NIVEAU_RISQUE_OPTIONS} />
            </Grid2>
            <Grid2>
              <Select label="Horizon de placement" value={a.horizon}
                onChange={e => set(actifs.map(x => x.id === a.id ? { ...x, horizon: e.target.value as typeof a.horizon } : x))}
                options={HORIZON_OPTIONS} />
              <Select label="Frais connus ?" value={a.fraisConnus}
                onChange={e => set(actifs.map(x => x.id === a.id ? { ...x, fraisConnus: e.target.value as typeof a.fraisConnus } : x))}
                options={OUI_NON_INCONNU_OPTIONS} />
            </Grid2>
            <Grid2>
              <Input label="Établissement (facultatif)" value={a.etablissement ?? ''}
                onChange={e => set(actifs.map(x => x.id === a.id ? { ...x, etablissement: e.target.value || undefined } : x))} />
              <Select label="Objectif associé (facultatif)" value={a.objectifAssocie ?? ''}
                onChange={e => set(actifs.map(x => x.id === a.id ? { ...x, objectifAssocie: e.target.value === '' ? undefined : e.target.value as typeof a.objectifAssocie } : x))}
                options={objectifOptions} />
            </Grid2>
          </div>
        ))}
        <button type="button" onClick={() => set([...actifs, nouvelActif()])} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
          + Ajouter un actif financier
        </button>
      </Section>
    </div>
  )
}

// ─── STEP 6 — Dettes ────────────────────────────────────────────────────────

const TYPE_DETTE_OPTIONS = [
  { value: 'credit_immobilier', label: 'Crédit immobilier (hors biens déclarés)' },
  { value: 'credit_consommation', label: 'Crédit à la consommation' },
  { value: 'pret_personnel', label: 'Prêt personnel' },
  { value: 'credit_pro_garanti', label: 'Crédit professionnel garanti sur le patrimoine personnel' },
]

function nouvelleDette(): DetteInput {
  return {
    id: crypto.randomUUID(),
    type: 'credit_consommation',
    mensualite: 0,
    taux: 0,
    dureeRestanteMois: 0,
    typeTaux: 'fixe',
    assuranceEmprunteur: 'inconnu',
  }
}

export function StepDettes({ data, onChange }: SPB) {
  const { dettes } = data.dettes
  const set = (next: DetteInput[]) => onChange({ dettes: { dettes: next } })

  const mensualitesDettes = dettes.reduce((s, d) => s + d.mensualite, 0)
  const mensualitesBiens = data.patrimoineImmobilier.biens.reduce((s, b) => s + b.mensualite, 0)
  const mensualitesTotal = mensualitesDettes + mensualitesBiens
  const revenus = data.revenusChargesEpargne.revenusMensuelsNets
  const ratio = revenus > 0 ? mensualitesTotal / revenus : 0

  return (
    <div className="space-y-4">
      <Section title="Dettes (hors crédits immobiliers déjà déclarés)">
        <p className="text-xs text-slate-500">Déclarez vos autres crédits en cours (consommation, prêt personnel, crédit professionnel garanti...).</p>
        {dettes.map((d, i) => (
          <div key={d.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Dette #{i + 1}</span>
              <button type="button" onClick={() => set(dettes.filter(x => x.id !== d.id))} className="text-red-400 hover:text-red-600 text-lg leading-none px-1">×</button>
            </div>
            <Grid2>
              <Select label="Type" value={d.type}
                onChange={e => set(dettes.map(x => x.id === d.id ? { ...x, type: e.target.value as typeof d.type } : x))}
                options={TYPE_DETTE_OPTIONS} />
              <Input label="Mensualité" type="number" value={d.mensualite}
                onChange={e => set(dettes.map(x => x.id === d.id ? { ...x, mensualite: +e.target.value } : x))} suffix="€/mois" />
            </Grid2>
            <Grid2>
              <Input label="Taux" type="number" step="0.01" value={(d.taux * 100).toFixed(2)}
                onChange={e => set(dettes.map(x => x.id === d.id ? { ...x, taux: +e.target.value / 100 } : x))} suffix="%" />
              <Input label="Durée restante" type="number" value={d.dureeRestanteMois}
                onChange={e => set(dettes.map(x => x.id === d.id ? { ...x, dureeRestanteMois: +e.target.value } : x))} suffix="mois" />
            </Grid2>
            <Grid2>
              <Select label="Type de taux" value={d.typeTaux}
                onChange={e => set(dettes.map(x => x.id === d.id ? { ...x, typeTaux: e.target.value as typeof d.typeTaux } : x))}
                options={[{ value: 'fixe', label: 'Fixe' }, { value: 'variable', label: 'Variable' }]} />
              <Select label="Assurance emprunteur" value={d.assuranceEmprunteur}
                onChange={e => set(dettes.map(x => x.id === d.id ? { ...x, assuranceEmprunteur: e.target.value as typeof d.assuranceEmprunteur } : x))}
                options={OUI_NON_INCONNU_OPTIONS} />
            </Grid2>
            <Input label="Capital restant dû estimé (facultatif)" type="number" value={d.capitalRestantEstime ?? ''}
              placeholder="Non précisé"
              onChange={e => set(dettes.map(x => x.id === d.id ? { ...x, capitalRestantEstime: e.target.value === '' ? undefined : +e.target.value } : x))}
              suffix="€" />
          </div>
        ))}
        <button type="button" onClick={() => set([...dettes, nouvelleDette()])} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
          + Ajouter une dette
        </button>
      </Section>

      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600 space-y-1">
        <p>Mensualités totales (biens + dettes) : <strong>{Math.round(mensualitesTotal).toLocaleString('fr-FR')} € / mois</strong></p>
        <p>Ratio mensualités / revenus estimé : <strong>{Math.round(ratio * 100)} %</strong></p>
        <p className="text-xs text-slate-400">Ces indicateurs sont calculés à titre indicatif à partir des informations saisies.</p>
      </div>
    </div>
  )
}

// ─── STEP 7 — Protection du foyer ──────────────────────────────────────────

export function StepProtectionFoyer({ data, onChange }: SPB) {
  const p = data.protectionFoyer
  const set = (patch: Partial<typeof p>) => onChange({ protectionFoyer: { ...p, ...patch } })

  return (
    <div className="space-y-6">
      <Section title="Assurances et prévoyance">
        <Grid2>
          <Select label="Assurance décès" value={p.assuranceDeces}
            onChange={e => set({ assuranceDeces: e.target.value as typeof p.assuranceDeces })} options={OUI_NON_INCONNU_OPTIONS} />
          <Select label="Prévoyance (incapacité, invalidité)" value={p.prevoyance}
            onChange={e => set({ prevoyance: e.target.value as typeof p.prevoyance })} options={OUI_NON_INCONNU_OPTIONS} />
        </Grid2>
        <Grid2>
          <Select label="Assurance emprunteur" value={p.assuranceEmprunteur}
            onChange={e => set({ assuranceEmprunteur: e.target.value as typeof p.assuranceEmprunteur })} options={OUI_NON_INCONNU_OPTIONS} />
          <Select label="Mutuelle santé" value={p.mutuelle}
            onChange={e => set({ mutuelle: e.target.value as typeof p.mutuelle })} options={OUI_NON_INCONNU_OPTIONS} />
        </Grid2>
        <Select label="Protection du conjoint en cas de décès" value={p.protectionConjoint}
          onChange={e => set({ protectionConjoint: e.target.value as typeof p.protectionConjoint })} options={OUI_NON_INCONNU_OPTIONS} />
      </Section>

      <Section title="Personnes à charge">
        <Grid2>
          <Input label="Nombre d'enfants à charge" type="number" min={0} value={p.enfantsACharge}
            onChange={e => set({ enfantsACharge: +e.target.value })} />
          <div className="flex items-center">
            <Toggle label="Une personne est dépendante financièrement de vous" checked={p.personneDependanteFinancierement}
              onChange={v => set({ personneDependanteFinancierement: v })} />
          </div>
        </Grid2>
      </Section>
    </div>
  )
}

// ─── STEP 8 — Transmission ──────────────────────────────────────────────────

export function StepTransmission({ data, onChange }: SPB) {
  const t = data.transmission
  const set = (patch: Partial<typeof t>) => onChange({ transmission: { ...t, ...patch } })

  return (
    <div className="space-y-6">
      <Section title="Situation familiale">
        <Grid2>
          <Toggle label="Vous avez des enfants" checked={t.aEnfants} onChange={v => set({ aEnfants: v })} />
          <Toggle label="Vous avez un conjoint / une conjointe" checked={t.aConjoint} onChange={v => set({ aConjoint: v })} />
        </Grid2>
        <Toggle label="Vous êtes dans une situation de famille recomposée" checked={t.familleRecomposee} onChange={v => set({ familleRecomposee: v })} />
      </Section>

      <Section title="Organisation successorale">
        <Grid2>
          <Select label="Avez-vous rédigé un testament ?" value={t.testament}
            onChange={e => set({ testament: e.target.value as typeof t.testament })} options={OUI_NON_INCONNU_OPTIONS} />
          <Select label="Clauses bénéficiaires d'assurance-vie connues ?" value={t.assuranceVieClauseBeneficiaireConnue}
            onChange={e => set({ assuranceVieClauseBeneficiaireConnue: e.target.value as typeof t.assuranceVieClauseBeneficiaireConnue })} options={OUI_NON_INCONNU_OPTIONS} />
        </Grid2>
        <Grid2>
          <Toggle label="Une donation a déjà été réalisée" checked={t.donationDejaRealisee} onChange={v => set({ donationDejaRealisee: v })} />
          <Toggle label="Un bien est détenu en indivision ou via une SCI" checked={t.immobilierEnIndivisionOuSci} onChange={v => set({ immobilierEnIndivisionOuSci: v })} />
        </Grid2>
        <Toggle label="La transmission de votre patrimoine est un objectif pour vous" checked={t.objectifTransmission} onChange={v => set({ objectifTransmission: v })} />
      </Section>
    </div>
  )
}
