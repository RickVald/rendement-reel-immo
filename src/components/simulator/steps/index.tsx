'use client'
import { ProjectInput, DispositifFiscal, DispositifParams, HoldingStructure } from '@/lib/calculator/types'
import { Input, Select, Toggle, Section, Grid2 } from '@/components/ui/FormField'
import { estimerFraisNotaire } from '@/lib/calculator'
import { DISPOSITIF_LABELS, DISPOSITIF_REGIME_COMPATIBLE, DISPOSITIF_REGIMES_COMPATIBLES } from '@/lib/calculator/dispositifs'
import { calculerLoyerPlafonné, getZone, ZONE_LABELS } from '@/lib/calculator/loyers-plafonds'
import { calculerEligibilite, ELIGIBILITY_STATUS_LABELS, ELIGIBILITY_STATUS_COLORS, CONDITION_STATUS_ICONS } from '@/lib/calculator/eligibilite'
import type { RegimeFiscal } from '@/lib/calculator/types'

type SP = { data: ProjectInput; onChange: (patch: Partial<ProjectInput>) => void }

// ── Table des régimes (déclarée ici pour être accessible au helper et aux steps) ─
const REGIME_OPTIONS: { value: RegimeFiscal; label: string; description: string; requiresNue?: boolean; requiresMeublee?: boolean }[] = [
  { value: 'micro_foncier',  label: 'Location nue — Micro-foncier (abattement 30%)',   description: 'Abattement forfaitaire de 30 % sur les loyers. Simple, mais moins avantageux si les charges dépassent 30 % des loyers. Revenus fonciers < 15 000 €/an.',                               requiresNue: true },
  { value: 'reel_foncier',   label: 'Location nue — Réel (déduction charges réelles)',  description: 'Déduction des charges réelles (taxe foncière, intérêts, travaux, gestion…). Génère souvent un déficit foncier imputable sur le revenu global (max 10 700 €/an).',                      requiresNue: true },
  { value: 'lmnp_micro_bic', label: 'LMNP — Micro-BIC (abattement 50%)',               description: 'Abattement de 50 % sur les recettes. Conditions : location meublée, recettes < 77 700 €/an.',                                                                                            requiresMeublee: true },
  { value: 'lmnp_reel',      label: 'LMNP — Réel (amortissements)',                    description: 'Amortissement du bien (30 ans) et du mobilier (7 ans). Permet souvent de ramener la base imposable à zéro pendant 10–15 ans. Nécessite un expert-comptable. LF 2025 : réintégration amortissements à la revente.',  requiresMeublee: true },
  { value: 'sci_ir',         label: 'SCI à l\'IR',                                      description: 'SCI transparente : résultats imposés chez les associés selon leur TMI, comme en réel foncier. Facilite la transmission patrimoniale.' },
  { value: 'sci_is',         label: 'SCI à l\'IS (15% PME / 25%)',                     description: 'Taux IS : 15 % jusqu\'à 42 500 € de bénéfice, 25 % au-delà. Utile pour la transmission. Attention : double imposition dividendes.' },
]

// ── Helper partagé : changement de dispositif → correction du régime ──────────
// Utilisé à la fois dans Step1 (sélection rapide) et Step7 (config détaillée).
function applyDispositifChange(
  newDispositif: DispositifFiscal,
  currentRegime: RegimeFiscal,
  locationType: string,
): { dispositif: DispositifFiscal; regime: RegimeFiscal } {
  const compatibles = DISPOSITIF_REGIMES_COMPATIBLES[newDispositif]
  const isNue     = locationType === 'nue'
  const isMeublee = ['meublee', 'colocation', 'courte_duree', 'bail_mobilite'].includes(locationType)
  const filtered = REGIME_OPTIONS
    .filter(opt => {
      if (!compatibles.includes(opt.value)) return false
      if (opt.requiresNue && !isNue) return false
      if (opt.requiresMeublee && !isMeublee) return false
      return true
    })
    .map(o => o.value)
  return {
    dispositif: newDispositif,
    regime: filtered.includes(currentRegime) ? currentRegime : (filtered[0] ?? 'reel_foncier'),
  }
}

// ── STEP 1 — Bien ────────────────────────────────────────────────────────────
export function Step1({ data, onChange }: SP) {
  const b = data.bien
  const f = data.fiscalite
  const set  = (patch: Partial<typeof b>) => onChange({ bien: { ...b, ...patch } })
  const setF = (patch: Partial<typeof f>) => onChange({ fiscalite: { ...f, ...patch } })

  const dispositif    = f?.dispositif ?? 'aucun'
  const locationType  = data.location?.type ?? 'nue'
  const isMeublee     = ['meublee', 'colocation', 'courte_duree', 'bail_mobilite'].includes(locationType)
  const needsAnnexes  = ['jeanbrun', 'denormandie', 'loc_avantages'].includes(dispositif)

  function handleDispositifChange(newDispositif: DispositifFiscal) {
    const { dispositif: d, regime: r } = applyDispositifChange(newDispositif, f.regime, locationType)
    setF({ dispositif: d, regime: r })
  }

  // Description courte du dispositif sélectionné
  const DISPOSITIF_DESC: Partial<Record<DispositifFiscal, string>> = {
    jeanbrun:                 `Amortissement déductible 3–5,5 %/an · Engagement 9 ans · Loyer plafonné · Neuf RE2020 ou ancien DPE A/B après travaux ≥ 30 %`,
    denormandie:              `Réduction 12/18/21% · Ancien + travaux ≥ 25% · Villes ACV/ORT · Jusqu'au 31/12/2026`,
    loc_avantages:            `Réduction 15/35/65% sur loyers · Convention Anah 6 ans · Loyer sous le marché`,
    malraux:                  `⚠ Mode expert — Réduction 30% (PSMV) ou 22% (PVAP) · Travaux restauration · Simulation indicative, validation notaire/fiscaliste requise`,
    monuments_historiques:    `⚠ Mode expert — Déduction intégrale charges · Engagement 15 ans · Simulation indicative, validation notaire/fiscaliste/DRAC requise`,
    deficit_foncier_renforce: `Plafond majoré 21 400€/an · Travaux réno énergétique F/G → D · 2023–2026`,
  }

  return (
    <div className="space-y-6">

      {/* ── 0. Dispositif fiscal — en premier car conditionne loyer, régime, champs ── */}
      <Section title="Stratégie fiscale">
        <Select
          label="Stratégie fiscale envisagée"
          value={dispositif}
          onChange={e => handleDispositifChange(e.target.value as DispositifFiscal)}
          options={Object.entries(DISPOSITIF_LABELS).map(([value, label]) => ({
            value,
            label,
            // Tous les dispositifs existants requièrent la location nue ; désactiver si meublée configurée
            disabled: value !== 'aucun' && isMeublee,
          }))}
          hint="Définissez d'abord votre stratégie — les étapes suivantes s'adaptent"
        />
        {isMeublee && dispositif !== 'aucun' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
            ⚠️ Vous avez configuré une location meublée à l&apos;étape Location. Les dispositifs fiscaux disponibles (Denormandie, Malraux, etc.) requièrent une location nue. Remettez le dispositif sur <strong>Aucun</strong> ou changez le type de location.
          </div>
        )}
        {dispositif !== 'aucun' && DISPOSITIF_DESC[dispositif] && (
          <div className={`rounded-lg px-3 py-2 text-xs space-y-0.5 ${
            ['malraux', 'monuments_historiques'].includes(dispositif)
              ? 'bg-amber-50 border border-amber-300 text-amber-900'
              : 'bg-blue-50 border border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center gap-2 font-semibold">
              {DISPOSITIF_LABELS[dispositif]}
              {['malraux', 'monuments_historiques'].includes(dispositif) && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 uppercase tracking-wide">
                  Expert requis
                </span>
              )}
            </div>
            <div className={['malraux', 'monuments_historiques'].includes(dispositif) ? 'text-amber-700' : 'text-blue-600'}>
              {DISPOSITIF_DESC[dispositif]}
            </div>
            <div className={['malraux', 'monuments_historiques'].includes(dispositif) ? 'text-amber-600' : 'text-blue-500'}>
              Régime imposable : {DISPOSITIF_REGIME_COMPATIBLE[dispositif]}
            </div>
          </div>
        )}
        <Toggle
          label="Comparer les régimes compatibles"
          hint="Le moteur simule tous les régimes compatibles et les classe selon le critère choisi (TRI, VAN, cash-flow, fiscalité…). Aucun régime n'est universellement optimal."
          checked={f.regimeAuto ?? false}
          onChange={v => setF({ regimeAuto: v })}
        />
        {f.regimeAuto && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-xs text-emerald-800">
            ✓ Les régimes compatibles seront comparés sur plusieurs critères. Le classement et les détails sont disponibles à l&apos;étape Fiscalité et dans les résultats.
          </div>
        )}
      </Section>

      {/* ── 1. Type et localisation du bien ── */}
      <Section title="Le bien">
        <Grid2>
          <Select label="Type" value={b.type} onChange={e => set({ type: e.target.value as typeof b.type })}
            options={[
              { value: 'appartement', label: 'Appartement' },
              { value: 'maison', label: 'Maison' },
              { value: 'studio', label: 'Studio' },
              { value: 'immeuble', label: 'Immeuble de rapport' },
              { value: 'parking', label: 'Parking / Garage' },
              { value: 'local', label: 'Local commercial' },
            ]}
          />
          <Input label="Surface habitable" type="number" min={1} value={b.surface}
            onChange={e => set({ surface: +e.target.value })} suffix="m²" />
        </Grid2>
        <Grid2>
          <Input label="Ville" value={b.ville} onChange={e => set({ ville: e.target.value })} placeholder="Paris, Lyon..." />
          <Input label="Code postal" value={b.codePostal} onChange={e => set({ codePostal: e.target.value })} placeholder="75001" />
        </Grid2>
        {needsAnnexes && (
          <Input
            label="Surface des annexes (balcons, terrasses, caves, parking couvert)"
            type="number" min={0} value={b.surfaceAnnexes ?? 0}
            onChange={e => set({ surfaceAnnexes: +e.target.value })} suffix="m²"
            hint="Comptées à 50 % dans la surface corrigée pour le calcul du loyer plafonné"
          />
        )}
      </Section>

      {/* ── 2. Caractéristiques ── */}
      <Section title="Caractéristiques">
        <Grid2>
          <Select label="DPE" value={b.dpe} onChange={e => set({ dpe: e.target.value as typeof b.dpe })}
            options={['A','B','C','D','E','F','G','inconnu'].map(v => ({ value: v, label: `DPE ${v}` }))}
          />
          <Select label="État général" value={b.etat} onChange={e => set({ etat: e.target.value as typeof b.etat })}
            options={[
              { value: 'neuf', label: 'Neuf / VEFA' },
              { value: 'bon_etat', label: 'Bon état' },
              { value: 'a_rafraichir', label: 'À rafraîchir' },
              { value: 'travaux_lourds', label: 'Travaux lourds' },
            ]}
          />
        </Grid2>
        <Grid2>
          <Input
            label={b.etat === 'neuf' ? 'Année de livraison (VEFA)' : 'Année de construction'}
            type="number"
            value={b.anneeConstruction}
            onChange={e => set({ anneeConstruction: +e.target.value })}
            hint={b.etat === 'neuf' ? 'Année de livraison prévue par le promoteur' : undefined}
          />
          <Toggle label="En copropriété" checked={b.copropriete} onChange={v => {
            set({ copropriete: v })
            if (!v && data.charges.chargesCoproAnnuelles !== 0) {
              onChange({ charges: { ...data.charges, chargesCoproAnnuelles: 0 } })
            }
          }} />
        </Grid2>
      </Section>

      {(b.dpe === 'F' || b.dpe === 'G') && (
        <div className={`rounded-lg p-4 text-sm ${b.dpe === 'G' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-orange-50 border border-orange-200 text-orange-700'}`}>
          {b.dpe === 'G'
            ? '🚨 DPE G — ce bien est interdit à la mise en location depuis janvier 2025. Prévoir des travaux de rénovation énergétique obligatoires.'
            : '⚠️ DPE F — ce bien sera interdit à la location à partir de 2028. Impact sur la rentabilité et la valeur de revente.'}
        </div>
      )}
    </div>
  )
}

// ── STEP PF — Profil fiscal ───────────────────────────────────────────────────
export function StepPF({ data, onChange }: SP) {
  const f = data.fiscalite
  const set = (patch: Partial<typeof f>) => onChange({ fiscalite: { ...f, ...patch } })

  const dispositif    = f.dispositif ?? 'aucun'
  const locationType  = data.location.type
  const isNue         = locationType === 'nue'
  const isMeublee     = ['meublee', 'colocation', 'courte_duree', 'bail_mobilite'].includes(locationType)

  // Régime effectif — pour afficher conditionnellement revenus fonciers & déficit
  const regimesCompatiblesDispositif = DISPOSITIF_REGIMES_COMPATIBLES[dispositif]
  const regimesFiltresPF = REGIME_OPTIONS.filter(opt => {
    if (!regimesCompatiblesDispositif.includes(opt.value)) return false
    if (opt.requiresNue && !isNue) return false
    if (opt.requiresMeublee && !isMeublee) return false
    return true
  })
  const regimeActuelCompatible = regimesFiltresPF.some(r => r.value === f.regime)
  const regimeEffectif = regimeActuelCompatible ? f.regime : (regimesFiltresPF[0]?.value ?? 'reel_foncier')

  const isSciIs        = regimeEffectif === 'sci_is'
  const isFoncierReel  = ['reel_foncier', 'sci_ir'].includes(regimeEffectif)
  const showDeficit    = !f.regimeAuto && (isFoncierReel || dispositif === 'deficit_foncier_renforce')
  const showAutresRevenusFonciers = !isSciIs && !['lmnp_micro_bic', 'lmnp_reel'].includes(regimeEffectif)

  // Dispositifs où le lien locataire est une condition d'éligibilité
  const showLienLocataire = ['denormandie', 'loc_avantages', 'jeanbrun', 'malraux', 'monuments_historiques'].includes(dispositif)

  return (
    <div className="space-y-6">

      {/* ── Note RGPD ── */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-800">
        <div className="font-semibold mb-1">🔒 Pourquoi ces informations ?</div>
        <p>Ces données fiscales restent dans votre navigateur et ne sont jamais transmises à des tiers. Elles nous permettent de vérifier votre éligibilité aux dispositifs fiscaux, de quantifier l&apos;avantage réellement utilisable (selon votre IR disponible), et d&apos;adapter le calcul à votre situation personnelle.</p>
      </div>

      {/* ── Niveau de détail ── */}
      <Section title="Niveau de détail">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => set({ parcours: 'simple' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              (f.parcours ?? 'simple') === 'simple'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Simple — TMI uniquement
          </button>
          <button
            type="button"
            onClick={() => set({ parcours: 'avance' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              f.parcours === 'avance'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Avancé — Profil fiscal complet
          </button>
        </div>
        {f.parcours === 'avance' && (
          <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            Le parcours avancé vérifie si les réductions d&apos;impôt sont absorbables par votre IR et quantifie l&apos;avantage utilisable vs perdu.
          </div>
        )}
      </Section>

      {/* ── Résidence fiscale ── */}
      <Section title="Résidence fiscale">
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
          <div>
            <span className="text-sm font-medium text-slate-800">Résidence fiscale française</span>
            <p className="text-xs text-slate-500 mt-0.5">Condition de base pour tous les dispositifs fiscaux français</p>
          </div>
          <div className="flex gap-2">
            {([true, false, undefined] as const).map(v => (
              <button
                key={String(v)}
                type="button"
                onClick={() => set({ residenceFiscaleFrancaise: v })}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  f.residenceFiscaleFrancaise === v
                    ? v === true ? 'bg-emerald-600 text-white' : v === false ? 'bg-red-500 text-white' : 'bg-slate-400 text-white'
                    : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {v === true ? 'Oui' : v === false ? 'Non' : 'NSP'}
              </button>
            ))}
          </div>
        </div>
        {f.residenceFiscaleFrancaise === false && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">
            ⚠️ Les dispositifs fiscaux français (Denormandie, Malraux, Loc&apos;Avantages…) sont réservés aux résidents fiscaux français. Certains calculs peuvent ne pas s&apos;appliquer à votre situation.
          </div>
        )}
      </Section>

      {/* ── Structure de détention ── */}
      <Section title="Structure de détention">
        <div className="grid grid-cols-2 gap-2">
          {([
            { value: 'nom_propre',  label: 'Nom propre',   desc: 'Achat direct — particulier' },
            { value: 'indivision',  label: 'Indivision',   desc: 'Plusieurs co-propriétaires' },
            { value: 'sci_ir',      label: 'SCI à l\'IR',  desc: 'SCI transparente — résultats imposés chez les associés' },
            { value: 'sci_is',      label: 'SCI à l\'IS',  desc: 'IS 15 %/25 % — bloque Denormandie, Loc\'Avantages, déficit foncier perso' },
          ] as { value: HoldingStructure; label: string; desc: string }[]).map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set({ holdingStructure: opt.value })}
              className={`text-left rounded-lg border px-3 py-2.5 transition-colors ${
                (f.holdingStructure ?? 'nom_propre') === opt.value
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-400'
              }`}
            >
              <div className="text-xs font-semibold">{opt.label}</div>
              <div className={`text-[11px] mt-0.5 ${(f.holdingStructure ?? 'nom_propre') === opt.value ? 'text-emerald-100' : 'text-slate-400'}`}>
                {opt.desc}
              </div>
            </button>
          ))}
        </div>
        {(f.holdingStructure === 'sci_is') && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
            ⚠️ SCI à l&apos;IS : incompatible avec Denormandie standard, Loc&apos;Avantages et le déficit foncier personnel. Ces dispositifs sont réservés aux personnes physiques.
          </div>
        )}
        {(f.holdingStructure === 'sci_ir') && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700">
            ℹ SCI à l&apos;IR : fonctionne comme le réel foncier. Les résultats sont imposés chez chaque associé selon sa TMI. Facilite la transmission patrimoniale.
          </div>
        )}
      </Section>

      {/* ── Imposition personnelle ── */}
      <Section title="Imposition personnelle">
        <Select
          label="Tranche marginale d'imposition (TMI)"
          value={String(f.tmi)}
          onChange={e => set({ tmi: +e.target.value })}
          options={[
            { value: '0',    label: '0 % (non imposable)' },
            { value: '0.11', label: '11 %' },
            { value: '0.3', label: '30 %' },
            { value: '0.41', label: '41 %' },
            { value: '0.45', label: '45 %' },
          ]}
        />
        {f.parcours === 'avance' && (
          <>
            <Grid2>
              <Input
                label="IR brut annuel (avant réductions)"
                type="number"
                value={f.irBrutAnnuel ?? ''}
                onChange={e => set({ irBrutAnnuel: e.target.value === '' ? undefined : +e.target.value })}
                suffix="€/an"
                hint="IR que vous payez AVANT toute réduction — visible sur votre avis d'imposition"
              />
              <Input
                label="Parts fiscales du foyer"
                type="number"
                step={0.5}
                value={f.partsFiscales ?? ''}
                onChange={e => set({ partsFiscales: e.target.value === '' ? undefined : +e.target.value })}
                hint="1 pour célibataire, 2 pour couple, +0,5 par enfant"
              />
            </Grid2>
            <Grid2>
              <Input
                label="Niches fiscales déjà consommées"
                type="number"
                value={f.nichesDejaConsommees ?? ''}
                onChange={e => set({ nichesDejaConsommees: e.target.value === '' ? undefined : +e.target.value })}
                suffix="€/an"
                hint="Montant des réductions/crédits déjà imputés (plafond global niches = 10 000 €/an)"
              />
              <Input
                label="Revenu fiscal de référence"
                type="number"
                value={f.revenuFiscalReference ?? ''}
                onChange={e => set({ revenuFiscalReference: e.target.value === '' ? undefined : +e.target.value })}
                suffix="€/an"
                hint="RFR visible sur l'avis d'imposition — utilisé pour certains plafonds"
              />
            </Grid2>
          </>
        )}
      </Section>

      {/* ── Revenus locatifs existants ── */}
      <Section title="Revenus locatifs existants">
        {showAutresRevenusFonciers && (
          <Input
            label="Autres revenus fonciers existants"
            type="number"
            value={f.autresRevenusFonciers}
            onChange={e => set({ autresRevenusFonciers: +e.target.value })}
            suffix="€/an"
            hint="Loyers perçus sur vos autres biens en location nue — impactent le calcul du déficit foncier"
          />
        )}
        {showDeficit && (
          <Input
            label="Déficit foncier reportable disponible"
            type="number"
            value={f.deficitFoncierDisponible}
            onChange={e => set({ deficitFoncierDisponible: +e.target.value })}
            suffix="€"
            hint="Déficit des années précédentes non encore imputé (reportable 10 ans)"
          />
        )}
        {f.parcours === 'avance' && (
          <Grid2>
            <Input
              label="Revenus LMNP / BIC meublés existants"
              type="number"
              value={f.autresRevenusBIC ?? ''}
              onChange={e => set({ autresRevenusBIC: e.target.value === '' ? undefined : +e.target.value })}
              suffix="€/an"
              hint="Recettes locatives meublées de vos autres biens — vérification seuil LMP (23 000 €/an)"
            />
            <Input
              label="Amortissements LMNP reportés disponibles"
              type="number"
              value={f.amortissementsLMNPReportes ?? ''}
              onChange={e => set({ amortissementsLMNPReportes: e.target.value === '' ? undefined : +e.target.value })}
              suffix="€"
              hint="Stock d'amortissements non utilisés sur vos autres biens en LMNP réel"
            />
          </Grid2>
        )}
        {isSciIs && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600">
            ℹ SCI à l&apos;IS : le résultat est imposé au niveau de la société (15 % PME / 25 %). Les revenus fonciers personnels et déficits fonciers ne s&apos;appliquent pas ici.
          </div>
        )}
      </Section>

      {/* ── Informations complémentaires (parcours avancé) ── */}
      {f.parcours === 'avance' && (
        <Section title="Informations complémentaires">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Autres dispositifs fiscaux en cours (non-cumul)
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Listez vos dispositifs actifs sur d&apos;autres biens pour vérifier la non-compatibilité.
            </p>
            <div className="flex flex-wrap gap-2">
              {['denormandie', 'loc_avantages', 'malraux', 'monuments_historiques', 'jeanbrun', 'pinel'].map(d => {
                const isSelected = (f.autresDisposiftifsEnCours ?? []).includes(d)
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      const current = f.autresDisposiftifsEnCours ?? []
                      set({ autresDisposiftifsEnCours: isSelected ? current.filter(x => x !== d) : [...current, d] })
                    }}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
                      isSelected
                        ? 'bg-amber-100 border-amber-400 text-amber-800'
                        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {d === 'pinel' ? 'Pinel' : d.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                )
              })}
            </div>
          </div>

          {showLienLocataire && (
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div>
                <span className="text-sm font-medium text-slate-800">Lien de parenté avec le futur locataire</span>
                <p className="text-xs text-slate-500 mt-0.5">
                  {['denormandie', 'jeanbrun'].includes(dispositif)
                    ? 'Location à un ascendant ou descendant interdite pour ce dispositif'
                    : dispositif === 'loc_avantages'
                    ? "Location à un membre du foyer fiscal interdite (Loc'Avantages)"
                    : 'Conditions de lien locataire à vérifier pour ce dispositif'}
                </p>
              </div>
              <div className="flex gap-2">
                {([false, true, undefined] as const).map(v => (
                  <button
                    key={String(v)}
                    type="button"
                    onClick={() => set({ lienLocataireExclu: v })}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                      f.lienLocataireExclu === v
                        ? v === true ? 'bg-red-500 text-white' : v === false ? 'bg-emerald-600 text-white' : 'bg-slate-400 text-white'
                        : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {v === true ? 'Oui' : v === false ? 'Non' : 'NSP'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}
    </div>
  )
}

// ── STEP 2 — Acquisition ─────────────────────────────────────────────────────
export function Step2({ data, onChange }: SP) {
  const a = data.acquisition
  const set = (patch: Partial<typeof a>) => onChange({ acquisition: { ...a, ...patch } })
  const neuf      = data.bien.etat === 'neuf'
  const dispositif = data.fiscalite?.dispositif ?? 'aucun'
  const locType   = data.location?.type ?? 'nue'
  const isMeublee = ['meublee', 'colocation', 'courte_duree', 'bail_mobilite'].includes(locType)

  const handlePrixChange = (prix: number) => {
    set({ prixAchat: prix, fraisNotaire: Math.round(estimerFraisNotaire(prix, neuf)) })
  }

  // Hint travaux adapté au dispositif
  const travauxHint =
    dispositif === 'denormandie'              ? 'Doit représenter ≥ 25 % du prix total (achat + travaux) — requis Denormandie' :
    dispositif === 'jeanbrun'                 ? "Doit representer >= 30 % du cout total pour l'ancien — requis Relance logement LF 2026" :
    dispositif === 'deficit_foncier_renforce' ? 'Inclure les travaux de renovation energetique eligibles (F/G vers D)' :
    dispositif === 'malraux'                  ? "Travaux de restauration (ABF) — a saisir aussi dans l'etape Fiscalite" :
    undefined

  const total = a.prixAchat + (a.fraisAgenceInclus ? 0 : a.fraisAgence) + a.fraisNotaire + a.fraisCourtage + a.fraisGarantieBancaire + a.fraisDossierBancaire + a.travauxInitiaux + a.mobilier + a.autresFrais

  return (
    <div className="space-y-6">
      {dispositif === 'deficit_foncier_renforce' && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 text-sm text-amber-900">
          <div className="font-semibold mb-1">⚠️ Déficit foncier renforcé — travaux à budgétiser ici</div>
          <p className="text-xs text-amber-800">
            Pour ce dispositif, le montant des travaux fait partie du <strong>coût total à financer</strong>.
            Saisissez vos travaux de rénovation énergétique ci-dessous <strong>avant</strong> de passer à l&apos;étape Financement,
            afin que l&apos;enveloppe de crédit soit calculée sur la bonne base (prix d&apos;achat + travaux).
          </p>
        </div>
      )}
      <Section title="Prix d'achat">
        <Input label={neuf ? "Prix d'achat VEFA" : "Prix d'achat"} type="number" value={a.prixAchat}
          onChange={e => handlePrixChange(+e.target.value)} suffix="€"
          hint={neuf ? "Prix de réservation promoteur (TTC)" : "Prix FAI ou hors frais d'agence"} />
        <Grid2>
          <Toggle label="Frais d'agence inclus dans le prix" checked={a.fraisAgenceInclus} onChange={v => set({ fraisAgenceInclus: v })} />
          {!a.fraisAgenceInclus && (
            <Input label="Frais d'agence" type="number" value={a.fraisAgence}
              onChange={e => set({ fraisAgence: +e.target.value })} suffix="€" />
          )}
        </Grid2>
      </Section>
      <Section title="Frais d'acquisition">
        <Grid2>
          <Input label="Frais de notaire" type="number" value={a.fraisNotaire}
            onChange={e => set({ fraisNotaire: +e.target.value })} suffix="€"
            hint={neuf ? 'Neuf/VEFA : ~2,5 % auto-estimé' : 'Ancien : ~7,8 % auto-estimé'} />
          <Input label="Frais de courtage" type="number" value={a.fraisCourtage}
            onChange={e => set({ fraisCourtage: +e.target.value })} suffix="€" />
          <Input label="Garantie bancaire" type="number" value={a.fraisGarantieBancaire}
            onChange={e => set({ fraisGarantieBancaire: +e.target.value })} suffix="€" />
          <Input label="Frais dossier bancaire" type="number" value={a.fraisDossierBancaire}
            onChange={e => set({ fraisDossierBancaire: +e.target.value })} suffix="€" />
        </Grid2>
      </Section>
      <Section title={isMeublee ? 'Travaux et mobilier' : 'Travaux initiaux'}>
        <Grid2>
          <Input label="Travaux initiaux" type="number" value={a.travauxInitiaux}
            onChange={e => set({ travauxInitiaux: +e.target.value })} suffix="€"
            hint={travauxHint} />
          {isMeublee && (
            <Input label="Mobilier et équipements" type="number" value={a.mobilier}
              onChange={e => set({ mobilier: +e.target.value })} suffix="€"
              hint="Meubles amortissables en LMNP réel (7 ans)" />
          )}
        </Grid2>
      </Section>
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-700">Coût total d'acquisition</span>
          <span className="text-xl font-bold text-emerald-700">{total.toLocaleString('fr-FR')} €</span>
        </div>
      </div>
    </div>
  )
}

// ── STEP 3 — Financement ─────────────────────────────────────────────────────
export function Step3({ data, onChange }: SP) {
  const f = data.financement
  const a = data.acquisition
  const set = (patch: Partial<typeof f>) => onChange({ financement: { ...f, ...patch } })

  // Coût total d'acquisition (même formule que Step2)
  const coutTotal = a.prixAchat + (a.fraisAgenceInclus ? 0 : a.fraisAgence) + a.fraisNotaire
    + a.fraisCourtage + a.fraisGarantieBancaire + a.fraisDossierBancaire
    + a.travauxInitiaux + a.mobilier + a.autresFrais

  const tauxMensuel = f.tauxNominal / 12
  const n = f.dureeCredit
  const mensualite = n > 0 && tauxMensuel > 0
    ? (f.montantEmprunte * tauxMensuel) / (1 - Math.pow(1 + tauxMensuel, -n))
    : 0
  const assuranceMensuelle = (f.montantEmprunte * f.tauxAssurance) / 12

  const dispositifFinancement = data.fiscalite?.dispositif ?? 'aucun'

  return (
    <div className="space-y-6">
      {dispositifFinancement === 'deficit_foncier_renforce' && a.travauxInitiaux === 0 && (
        <div className="bg-red-50 border border-red-300 rounded-xl px-4 py-3 text-sm text-red-900">
          <div className="font-semibold mb-1">⚠️ Travaux manquants</div>
          <p className="text-xs text-red-800">
            Vous avez sélectionné le <strong>déficit foncier renforcé</strong> mais n&apos;avez pas saisi de travaux à l&apos;étape précédente.
            Revenez à l&apos;étape Acquisition pour renseigner vos travaux de rénovation énergétique — ils doivent être inclus dans le coût total avant de définir votre financement.
          </p>
        </div>
      )}
      <Section title="Structure du financement">
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs text-slate-500 flex justify-between">
          <span>Coût total à financer</span>
          <span className="font-semibold text-slate-700">{coutTotal.toLocaleString('fr-FR')} €</span>
        </div>
        <Grid2>
          <Input label="Montant emprunté" type="number" value={f.montantEmprunte}
            onChange={e => {
              const montant = +e.target.value
              set({ montantEmprunte: montant, apport: Math.max(0, coutTotal - montant) })
            }} suffix="€"
            hint="Frais de notaire + travaux inclus si financés" />
          <Input label="Apport personnel" type="number" value={f.apport}
            onChange={e => {
              const apport = +e.target.value
              set({ apport, montantEmprunte: Math.max(0, coutTotal - apport) })
            }} suffix="€"
            hint={`Calculé automatiquement : coût total − emprunt`} />
        </Grid2>
        {Math.abs(f.apport + f.montantEmprunte - coutTotal) > 100 && (
          <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            ⚠️ Apport + emprunt = {(f.apport + f.montantEmprunte).toLocaleString('fr-FR')} € — différence de {Math.abs(f.apport + f.montantEmprunte - coutTotal).toLocaleString('fr-FR')} € avec le coût total. Ajustez si nécessaire.
          </div>
        )}
      </Section>
      <Section title="Conditions du prêt">
        <Grid2>
          <Input label="Durée du crédit" type="number" value={f.dureeCredit / 12}
            onChange={e => set({ dureeCredit: +e.target.value * 12 })} suffix="ans" hint="En années" />
          <Input label="Taux nominal" type="number" step="0.01" value={(f.tauxNominal * 100).toFixed(2)}
            onChange={e => set({ tauxNominal: +e.target.value / 100 })} suffix="%" />
          <Input label="Taux assurance emprunteur" type="number" step="0.01" value={(f.tauxAssurance * 100).toFixed(2)}
            onChange={e => set({ tauxAssurance: +e.target.value / 100 })} suffix="% / an" />
          <Select label="Différé de remboursement" value={f.differePeriode}
            onChange={e => set({ differePeriode: e.target.value as typeof f.differePeriode, dureesDiffere: e.target.value === 'aucun' ? 0 : f.dureesDiffere || 12 })}
            options={[
              { value: 'aucun', label: 'Aucun différé' },
              { value: 'partiel', label: 'Différé partiel (intérêts seuls)' },
              { value: 'total', label: 'Différé total (rien pendant N mois)' },
            ]}
          />
          {f.differePeriode !== 'aucun' && (
            <Input label="Durée du différé" type="number" min={1} max={36}
              value={f.dureesDiffere || ''} placeholder="Ex : 12"
              onChange={e => set({ dureesDiffere: +e.target.value })} suffix="mois"
              hint={f.differePeriode === 'partiel' ? 'Vous remboursez uniquement les intérêts' : 'Aucun remboursement pendant cette période'} />
          )}
        </Grid2>
      </Section>
      {mensualite > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-slate-500 mb-1">Mensualité hors assurance</div>
              <div className="text-lg font-bold text-slate-900">{Math.round(mensualite).toLocaleString('fr-FR')} €</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Assurance mensuelle</div>
              <div className="text-lg font-bold text-slate-900">{Math.round(assuranceMensuelle).toLocaleString('fr-FR')} €</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Mensualité totale</div>
              <div className="text-lg font-bold text-emerald-700">{Math.round(mensualite + assuranceMensuelle).toLocaleString('fr-FR')} €</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Dispositifs qui imposent la location nue (revenus fonciers uniquement)
const DISPOSITIFS_NUE_ONLY: DispositifFiscal[] = [
  'deficit_foncier_renforce', 'denormandie', 'jeanbrun',
  'malraux', 'monuments_historiques', 'loc_avantages',
]

// ── STEP 4 — Location ────────────────────────────────────────────────────────
export function Step4({ data, onChange }: SP) {
  const l = data.location
  const set = (patch: Partial<typeof l>) => onChange({ location: { ...l, ...patch } })

  // Dispositif sélectionné et contraintes
  const dispositif    = data.fiscalite?.dispositif ?? 'aucun'
  const locationType  = l.type   // alias pour lisibilité
  const forceNue      = DISPOSITIFS_NUE_ONLY.includes(dispositif)

  // Auto-correction si le type actuel est incompatible avec le dispositif
  const isMeubleeActuel = ['meublee', 'colocation', 'courte_duree', 'bail_mobilite'].includes(l.type)
  if (forceNue && isMeubleeActuel) {
    setTimeout(() => set({ type: 'nue' }), 0)
  }

  // Options de type de location filtrées
  const ALL_LOCATION_OPTIONS = [
    { value: 'nue',           label: 'Location nue (longue durée)' },
    { value: 'meublee',       label: 'Location meublée longue durée' },
    { value: 'colocation',    label: 'Colocation' },
    { value: 'courte_duree',  label: 'Courte durée (Airbnb...)' },
    { value: 'bail_mobilite', label: 'Bail mobilité' },
  ]
  const locationOptions = forceNue
    ? ALL_LOCATION_OPTIONS.filter(o => o.value === 'nue')
    : ALL_LOCATION_OPTIONS

  // Calcul du loyer plafonné si un dispositif le requiert
  const niveauJeanbrun = data.fiscalite?.dispositifParams?.jeanbrun_niveauLoyer ?? 'intermediaire'
  const niveauLocAv    = data.fiscalite?.dispositifParams?.locAvantages_niveau ?? 'intermediaire'
  const plafond = calculerLoyerPlafonné(
    data.bien.ville,
    data.bien.codePostal,
    data.bien.surface,
    data.bien.surfaceAnnexes ?? 0,
    dispositif,
    niveauJeanbrun,
    niveauLocAv,
  )

  return (
    <div className="space-y-6">
      <Section title="Type et loyers">
        {forceNue && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
            🔒 Le dispositif <strong>{DISPOSITIF_LABELS[dispositif]}</strong> impose la <strong>location nue</strong> (revenus fonciers). Les options meublées ne sont pas disponibles.
          </div>
        )}
        <Grid2>
          <Select label="Type de location" value={forceNue ? 'nue' : l.type}
            onChange={e => set({ type: e.target.value as typeof l.type })}
            options={locationOptions}
          />
          <Input label="Loyer mensuel hors charges" type="number" value={l.loyerMensuelHC}
            onChange={e => set({ loyerMensuelHC: +e.target.value })} suffix="€/mois" />
        </Grid2>

        {/* Encart loyer plafonné — affiché si un dispositif avec plafond est actif */}
        {plafond && (
          <div className={`rounded-xl border p-4 space-y-3 ${l.loyerMensuelHC > plafond.loyerPlafonneHC ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <div className={`text-xs font-semibold uppercase tracking-wide ${l.loyerMensuelHC > plafond.loyerPlafonneHC ? 'text-red-700' : 'text-blue-700'}`}>
                  Loyer plafonné — {DISPOSITIF_LABELS[dispositif].split('(')[0].trim()}
                </div>
                <div className="text-xs text-slate-500">{plafond.zoneLabel}</div>
              </div>
              <div className="text-right shrink-0">
                <div className={`text-xl font-bold ${l.loyerMensuelHC > plafond.loyerPlafonneHC ? 'text-red-700' : 'text-blue-800'}`}>
                  {plafond.loyerPlafonneHC.toLocaleString('fr-FR')} €
                  <span className="text-xs font-normal text-slate-500"> /mois HC max</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/70 rounded-lg px-2 py-1.5">
                <div className="text-xs text-slate-500">Plafond / m²</div>
                <div className="text-sm font-semibold text-slate-800">{plafond.plafondAuM2.toFixed(2)} €</div>
              </div>
              <div className="bg-white/70 rounded-lg px-2 py-1.5">
                <div className="text-xs text-slate-500">Surface corrigée</div>
                <div className="text-sm font-semibold text-slate-800">{plafond.surfaceCorrigeeM2} m²</div>
              </div>
              <div className="bg-white/70 rounded-lg px-2 py-1.5">
                <div className="text-xs text-slate-500">Coefficient</div>
                <div className="text-sm font-semibold text-slate-800">× {plafond.coefficient}</div>
              </div>
            </div>
            {l.loyerMensuelHC > plafond.loyerPlafonneHC ? (
              <div className="text-xs text-red-700 font-medium">
                ⚠️ Votre loyer actuel ({l.loyerMensuelHC} €) dépasse le plafond réglementaire. Le dispositif <strong>ne sera pas applicable</strong> à ce loyer.
              </div>
            ) : (
              <div className="text-xs text-blue-700">
                ✓ Votre loyer respecte le plafond {dispositif === 'jeanbrun' ? `(${l.loyerMensuelHC} € / ${plafond.loyerPlafonneHC} € max)` : ''}.
              </div>
            )}
            <button
              type="button"
              onClick={() => onChange({ location: { ...l, loyerMensuelHC: plafond.loyerPlafonneHC } })}
              className="w-full text-xs font-medium text-center py-1.5 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors"
            >
              Utiliser le loyer plafond : {plafond.loyerPlafonneHC.toLocaleString('fr-FR')} €/mois
            </button>
          </div>
        )}
        <Grid2>
          <Input label="Charges récupérables" type="number" value={l.chargesRecuperables}
            onChange={e => set({ chargesRecuperables: +e.target.value })} suffix="€/mois"
            hint="Payées par le locataire" />
          <Input label="Vacance locative estimée" type="number" step="0.5" value={l.vacanceLocativeMois}
            onChange={e => set({ vacanceLocativeMois: +e.target.value })} suffix="mois/an"
            hint="Moyenne : 1 à 2 mois/an" />
        </Grid2>
      </Section>
      <Section title="Revalorisation et gestion">
        <Grid2>
          <Input label="Revalorisation annuelle des loyers" type="number" step="0.1"
            value={(l.revalorisation * 100).toFixed(1)}
            onChange={e => set({ revalorisation: +e.target.value / 100 })} suffix="%" />
          <Toggle label="Gestion locative déléguée" checked={l.gestionLocative} onChange={v => set({ gestionLocative: v })} />
        </Grid2>
        {l.gestionLocative && (
          <Input label="Frais de gestion locative" type="number" step="0.5"
            value={(l.fraisGestionPct * 100).toFixed(1)}
            onChange={e => set({ fraisGestionPct: +e.target.value / 100 })} suffix="% des loyers" />
        )}
      </Section>
      <Section title="Assurances">
        <Grid2>
          <Input label="Assurance PNO annuelle" type="number" value={l.assurancePnoAnnuelle}
            onChange={e => set({ assurancePnoAnnuelle: +e.target.value })} suffix="€/an" />
          {/* GLI non pertinente en courte durée (pas de bail long terme) */}
          {locationType !== 'courte_duree' && (
            <Toggle
              label="Garantie loyers impayés (GLI)"
              hint={locationType === 'bail_mobilite' ? 'Optionnel — bail court, risque limité' : undefined}
              checked={l.gli}
              onChange={v => set({ gli: v })}
            />
          )}
        </Grid2>
        {l.gli && locationType !== 'courte_duree' && (
          <Input label="Taux GLI" type="number" step="0.1" value={(l.tauxGli * 100).toFixed(1)}
            onChange={e => set({ tauxGli: +e.target.value / 100 })} suffix="% des loyers"
            hint="En général 2,5 à 4,5 % des loyers bruts" />
        )}
      </Section>
    </div>
  )
}

// ── STEP 5 — Charges ─────────────────────────────────────────────────────────
export function Step5({ data, onChange }: SP) {
  const c = data.charges
  const set = (patch: Partial<typeof c>) => onChange({ charges: { ...c, ...patch } })

  const locType    = data.location?.type ?? 'nue'
  const regime     = data.fiscalite?.regime
  const regimeAuto = data.fiscalite?.regimeAuto ?? false
  const isMeublee  = ['meublee', 'colocation', 'courte_duree', 'bail_mobilite'].includes(locType)
  const isCourte   = locType === 'courte_duree'
  // Comptable fortement recommandé pour LMNP réel / SCI
  const needsComptable = regimeAuto || ['lmnp_reel', 'sci_ir', 'sci_is'].includes(regime ?? '')

  return (
    <div className="space-y-6">
      <Section title="Charges obligatoires">
        <Grid2>
          <Input label="Taxe foncière" type="number" value={c.taxeFonciere}
            onChange={e => set({ taxeFonciere: +e.target.value })} suffix="€/an"
            hint={data.bien.etat === 'neuf' ? "Souvent exonere 2 ans (VEFA) — 0 possible" : "Disponible sur votre avis d'imposition"} />
          {data.bien.copropriete && (
            <Input label="Charges de copropriété" type="number" value={c.chargesCoproAnnuelles}
              onChange={e => set({ chargesCoproAnnuelles: +e.target.value })} suffix="€/an" />
          )}
        </Grid2>
        {data.bien.copropriete && (
          <Input label="Part non récupérable des charges copro" type="number" step="5"
            value={c.partNonRecuperable * 100}
            onChange={e => set({ partNonRecuperable: +e.target.value / 100 })} suffix="%"
            hint="En général 30 à 50 % des charges totales" />
        )}
      </Section>
      <Section title="Charges courantes">
        <Grid2>
          <Input label="Entretien courant annuel" type="number" value={c.entretienAnnuel}
            onChange={e => set({ entretienAnnuel: +e.target.value })} suffix="€/an"
            hint={isMeublee ? 'Plus élevé en meublé (usure mobilier)' : undefined} />
          {/* Frais de relocation : non pertinent en courte durée (rotation gérée par la plateforme) */}
          {!isCourte && (
            <Input label="Frais de relocation" type="number" value={c.fraisRelocation}
              onChange={e => set({ fraisRelocation: +e.target.value })} suffix="€"
              hint="Par changement de locataire (état des lieux, annonces…)" />
          )}
          <Input label="Comptable / expert-comptable" type="number" value={c.comptableAnnuel}
            onChange={e => set({ comptableAnnuel: +e.target.value })} suffix="€/an"
            hint={needsComptable ? '⚠ Obligatoire en LMNP réel / SCI (800–2 000 €/an)' : 'Optionnel en micro-foncier ou micro-BIC'} />
          {/* CFE : due par les loueurs meublés professionnels et les SCI IS */}
          {(isMeublee || ['sci_is', 'sci_ir'].includes(regime ?? '')) && (
            <Input label="CFE (cotisation foncière des entreprises)" type="number" value={c.cfeEventuelle}
              onChange={e => set({ cfeEventuelle: +e.target.value })} suffix="€/an"
              hint="Varie selon commune et CA — exonération la 1ère année" />
          )}
          <Input label="Augmentation annuelle charges" type="number" step="0.5"
            value={(c.augmentationAnnuellePct * 100).toFixed(1)}
            onChange={e => set({ augmentationAnnuellePct: +e.target.value / 100 })} suffix="%"
            hint="Inflation sur les charges (ex : 2 %)" />
        </Grid2>
      </Section>
    </div>
  )
}

// ── STEP 6 — Travaux futurs ───────────────────────────────────────────────────
export function Step6({ data, onChange }: SP) {
  const t = data.travauxFuturs
  const set = (patch: Partial<typeof t>) => onChange({ travauxFuturs: { ...t, ...patch } })
  const duree = data.revente.dureeDetentionAns
  return (
    <div className="space-y-6">
      <Section title="Travaux récurrents">
        <Input label="Budget travaux récurrents annuels" type="number" value={t.travauxRecurrentsAnnuels}
          onChange={e => set({ travauxRecurrentsAnnuels: +e.target.value })} suffix="€/an"
          hint="Petites réparations, maintenance..." />
      </Section>
      <Section title="Travaux DPE">
        {(data.bien.dpe === 'E' || data.bien.dpe === 'F' || data.bien.dpe === 'G') && (() => {
          const surface = data.bien.surface || 0
          const estimations: Record<string, { fourchette: string; low: number; high: number; label: string }> = {
            E: { fourchette: '100–200 €/m²', low: 100, high: 200, label: 'isolation + ventilation' },
            F: { fourchette: '200–350 €/m²', low: 200, high: 350, label: 'isolation + chauffage' },
            G: { fourchette: '350–600 €/m²', low: 350, high: 600, label: 'rénovation globale' },
          }
          const est = estimations[data.bien.dpe]
          return (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800 mb-3 space-y-1">
              <p className="font-semibold">⚠️ DPE {data.bien.dpe} — rénovation énergétique à anticiper</p>
              <p className="text-xs text-orange-700">Estimation marché ({est.label}) : <strong>{est.fourchette}</strong>
                {surface > 0 && <> · soit <strong>{(est.low * surface).toLocaleString('fr-FR')} – {(est.high * surface).toLocaleString('fr-FR')} €</strong> pour {surface} m²</>}
              </p>
              <p className="text-xs text-orange-600">Ces fourchettes sont indicatives. Obtenez un devis pour affiner.</p>
            </div>
          )
        })()}
        <Grid2>
          <Input label="Année des travaux DPE" type="number" min={1} max={duree}
            value={t.travauxDpeAnnee ?? ''} placeholder="Ex : 5"
            onChange={e => set({ travauxDpeAnnee: e.target.value ? +e.target.value : undefined })} suffix="ème année" />
          <Input label="Montant travaux DPE" type="number" value={t.travauxDpeMontant ?? ''}
            placeholder="Ex : 25000"
            onChange={e => set({ travauxDpeMontant: e.target.value ? +e.target.value : undefined })} suffix="€" />
        </Grid2>
      </Section>
      <Section title="Gros travaux ponctuels">
        <p className="text-xs text-slate-500">Ajoutez les travaux ponctuels prévus (ravalement, toiture, ascenseur...)</p>
        {t.grosTravauxItems.map((item, i) => (
          <div key={i} className="bg-slate-50 rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Travaux #{i + 1}</span>
              <button type="button" onClick={() => set({ grosTravauxItems: t.grosTravauxItems.filter((_, j) => j !== i) })}
                className="text-red-400 hover:text-red-600 text-lg leading-none px-1">×</button>
            </div>
            <Input label="Libellé" value={item.libelle} placeholder="Ex : Ravalement de façade"
              onChange={e => { const items = [...t.grosTravauxItems]; items[i] = { ...items[i], libelle: e.target.value }; set({ grosTravauxItems: items }) }} />
            <Grid2>
              <Input label="Année de détention" type="number" min={1} max={duree} value={item.annee}
                onChange={e => { const items = [...t.grosTravauxItems]; items[i] = { ...items[i], annee: +e.target.value }; set({ grosTravauxItems: items }) }}
                suffix="ème année" />
              <Input label="Montant" type="number" value={item.montant}
                onChange={e => { const items = [...t.grosTravauxItems]; items[i] = { ...items[i], montant: +e.target.value }; set({ grosTravauxItems: items }) }}
                suffix="€" />
            </Grid2>
          </div>
        ))}
        <button type="button"
          onClick={() => set({ grosTravauxItems: [...t.grosTravauxItems, { libelle: '', annee: 5, montant: 0, impactVacanceMois: 0, deductible: true }] })}
          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
          + Ajouter des travaux ponctuels
        </button>
      </Section>
    </div>
  )
}

// ── STEP 7 — Fiscalité ────────────────────────────────────────────────────────
export function Step7({ data, onChange }: SP) {
  const f = data.fiscalite
  const set = (patch: Partial<typeof f>) => onChange({ fiscalite: { ...f, ...patch } })

  const dispositif = f.dispositif ?? 'aucun'
  const locationType = data.location.type
  const isNue     = locationType === 'nue'
  const isMeublee = ['meublee', 'colocation', 'courte_duree', 'bail_mobilite'].includes(locationType)

  // Régimes compatibles avec le dispositif sélectionné + type de location
  const regimesCompatiblesDispositif = DISPOSITIF_REGIMES_COMPATIBLES[dispositif]
  const regimesFiltres = REGIME_OPTIONS.filter(opt => {
    if (!regimesCompatiblesDispositif.includes(opt.value)) return false
    if (opt.requiresNue && !isNue) return false
    if (opt.requiresMeublee && !isMeublee) return false
    return true
  })

  // Si le régime actuel n'est plus compatible suite au changement de dispositif, on corrige
  const regimeActuelCompatible = regimesFiltres.some(r => r.value === f.regime)
  const regimeEffectif = regimeActuelCompatible ? f.regime : (regimesFiltres[0]?.value ?? 'reel_foncier')
  if (!regimeActuelCompatible) {
    // Correction silencieuse au prochain rendu
    setTimeout(() => set({ regime: regimeEffectif }), 0)
  }

  const isLmnpReel = regimeEffectif === 'lmnp_reel'
  const selectedRegimeDesc = REGIME_OPTIONS.find(r => r.value === regimeEffectif)?.description ?? ''

  // Quand on change le dispositif : corriger le régime si besoin (helper partagé)
  function handleDispositifChange(newDispositif: DispositifFiscal) {
    const { dispositif: d, regime: r } = applyDispositifChange(newDispositif, f.regime, locationType)
    set({ dispositif: d, regime: r })
  }

  // Règles de visibilité selon régime effectif
  const isMicroRegime  = ['micro_foncier', 'lmnp_micro_bic'].includes(regimeEffectif)

  return (
    <div className="space-y-6">
      {/* Rappel profil fiscal */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600">
        ℹ Votre profil fiscal (TMI, IR, revenus existants) est configuré à l&apos;étape 2 — Profil fiscal. Modifiez-le si besoin en revenant en arrière.
      </div>

      {/* ── 1. Stratégie fiscale — sélecteur (synchronisé avec étape 1) ── */}
      <Section title="Stratégie fiscale envisagée">
        <Select
          label="Stratégie fiscale envisagée"
          value={dispositif}
          onChange={e => handleDispositifChange(e.target.value as DispositifFiscal)}
          options={Object.entries(DISPOSITIF_LABELS).map(([value, label]) => ({ value, label }))}
          hint="Synchronisé avec l'étape 1 — modifiable ici également"
        />
        {dispositif !== 'aucun' && (
          <div className="text-xs bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-blue-800">
            <span className="font-semibold">Régime compatible : </span>
            {DISPOSITIF_REGIME_COMPATIBLE[dispositif]}
          </div>
        )}
        <DispositifFields dispositif={dispositif} params={f.dispositifParams} set={set} acquisition={data.acquisition} />
      </Section>

      {/* ── 2. Régime fiscal — filtré par le dispositif ── */}
      <Section title="Régime fiscal">
        <Toggle
          label="Comparer les régimes compatibles automatiquement"
          hint="Le moteur simulera tous les régimes compatibles et classera selon le critère choisi ci-dessous."
          checked={f.regimeAuto ?? false}
          onChange={v => set({ regimeAuto: v })}
        />
        {f.regimeAuto && (
          <>
            <Select
              label="Critère de classement"
              value={f.critereAuto ?? 'tri'}
              onChange={e => set({ critereAuto: e.target.value as typeof f.critereAuto })}
              options={[
                { value: 'tri',              label: 'Maximiser le TRI (rendement global + revente)' },
                { value: 'van',              label: 'Maximiser la VAN (valeur actualisée nette)' },
                { value: 'cashflow',         label: 'Maximiser le cash-flow mensuel moyen' },
                { value: 'impot',            label: 'Minimiser les impôts cumulés' },
                { value: 'simplicite',       label: 'Préférer la simplicité fiscale (micro > réel)' },
                { value: 'rendement_net_net', label: 'Maximiser le rendement net-net annuel' },
              ]}
              hint="Le régime retenu sera identifié dans les résultats avec sa justification"
            />
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-800">
              ℹ Régimes compatibles comparés : {regimesFiltres.map(r => r.label.split('—')[0].trim()).join(', ')}.
              Chaque critère peut produire un résultat différent — aucun n&apos;est universellement optimal.
            </div>
          </>
        )}
        {!f.regimeAuto && (
          <>
            <Select
              label="Régime d'imposition"
              value={regimeEffectif}
              onChange={e => set({ regime: e.target.value as RegimeFiscal, regimeAuto: false })}
              options={regimesFiltres.map(o => ({ value: o.value, label: o.label }))}
            />
            {selectedRegimeDesc && (
              <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">{selectedRegimeDesc}</div>
            )}
            {isMicroRegime && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-xs text-emerald-800">
                ✓ Régime micro : abattement forfaitaire appliqué automatiquement. Aucun justificatif de charges requis.
              </div>
            )}
            {regimesFiltres.length < REGIME_OPTIONS.filter(o => {
              if (o.requiresNue && !isNue) return false
              if (o.requiresMeublee && !isMeublee) return false
              return true
            }).length && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                ⚠️ Certains régimes sont masqués car incompatibles avec le dispositif <strong>{DISPOSITIF_LABELS[dispositif]}</strong>.
              </p>
            )}
          </>
        )}
      </Section>

      {/* ── 3. Amortissements (LMNP réel uniquement, hors auto) ── */}
      {isLmnpReel && !f.regimeAuto && (
        <Section title="Amortissements LMNP réel">
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
            ⚠ Depuis la LF 2025, les amortissements déduits en LMNP réel sont <strong>réintégrés dans le prix d'acquisition</strong> lors de la revente (plus-value augmentée). Consultez un expert-comptable.
          </div>
          <Grid2>
            <Input label="Durée amortissement immeuble" type="number" value={f.dureeAmortissementImmo}
              onChange={e => set({ dureeAmortissementImmo: +e.target.value })} suffix="ans"
              hint="En général 25 à 35 ans" />
            <Input label="Durée amortissement mobilier" type="number" value={f.dureeAmortissementMobilier}
              onChange={e => set({ dureeAmortissementMobilier: +e.target.value })} suffix="ans"
              hint="En général 5 à 10 ans" />
          </Grid2>
        </Section>
      )}
    </div>
  )
}

// ── Champs spécifiques par dispositif ───────────────────────────────────────
function DispositifFields({
  dispositif, params, set, acquisition,
}: {
  dispositif: DispositifFiscal
  params: DispositifParams
  set: (patch: Partial<{ dispositifParams: DispositifParams }>) => void
  acquisition?: { prixAchat: number; travauxInitiaux: number }
}) {
  const setP = (patch: Partial<DispositifParams>) =>
    set({ dispositifParams: { ...params, ...patch } })

  if (dispositif === 'aucun') return null

  return (
    <div className="space-y-4 mt-1">
      {/* ── Déficit foncier renforcé ── */}
      {dispositif === 'deficit_foncier_renforce' && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            Plafond majoré à <strong>21 400 €/an</strong> (vs 10 700 € standard) pour les travaux de rénovation énergétique permettant de passer d'une classe F ou G à au moins D. Travaux réalisés entre 2023 et 2026. Régime réel foncier uniquement.
          </div>
          <Grid2>
            <Input label="Montant travaux réno énergétique éligibles" type="number"
              value={params.deficitRenforce_montantTravauxEnergie}
              onChange={e => setP({ deficitRenforce_montantTravauxEnergie: +e.target.value })}
              suffix="€" hint="Isolation, chauffage, VMC… sur justificatifs" />
            <Input label="Durée d'engagement de location" type="number" min={3}
              value={params.deficitRenforce_engagementLocationAns}
              onChange={e => setP({ deficitRenforce_engagementLocationAns: +e.target.value })}
              suffix="ans" hint="Minimum 3 ans après les travaux" />
          </Grid2>
        </>
      )}

      {/* ── Denormandie ── */}
      {dispositif === 'denormandie' && (() => {
        // Auto-calcul du prix total retenu depuis les données d'acquisition
        const prixBrut    = (acquisition?.prixAchat ?? 0) + (acquisition?.travauxInitiaux ?? 0)
        const prixAuto    = Math.min(prixBrut, 300000)
        // Si l'utilisateur n'a pas encore personnalisé (valeur à 0), on utilise l'auto
        const prixEffectif = params.denormandie_prixTotalRetenu > 0
          ? params.denormandie_prixTotalRetenu
          : prixAuto
        return (
        <>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-700">
            Réduction d'impôt <strong>12 % / 18 % / 21 %</strong> du prix total (achat + travaux), étalée sur 6, 9 ou 12 ans. Plafond : 300 000 € et 5 500 €/m². Travaux ≥ 25 % du prix total. Dispositif jusqu'au 31/12/2026.
          </div>
          {/* Prix auto-calculé depuis l'acquisition */}
          {prixBrut > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 space-y-1">
              <div className="text-slate-500">Prix total calculé automatiquement (étape Acquisition)</div>
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-slate-900">{prixBrut.toLocaleString('fr-FR')} €</span>
                {prixBrut > 300000 && (
                  <span className="text-amber-700 font-medium">⚠ Plafonné à 300 000 €</span>
                )}
                {params.denormandie_prixTotalRetenu !== prixAuto && params.denormandie_prixTotalRetenu > 0 && (
                  <button type="button" className="text-emerald-700 font-medium hover:underline"
                    onClick={() => setP({ denormandie_prixTotalRetenu: prixAuto })}>
                    Remettre à {prixAuto.toLocaleString('fr-FR')} €
                  </button>
                )}
              </div>
            </div>
          )}
          <Grid2>
            <Input label="Prix total retenu (achat + travaux)" type="number"
              value={prixEffectif}
              onChange={e => setP({ denormandie_prixTotalRetenu: +e.target.value })}
              suffix="€" hint={prixBrut > 0 ? `Auto-calculé : ${prixAuto.toLocaleString('fr-FR')} € — modifiable` : 'Plafonné à 300 000 € et 5 500 €/m²'} />
            <Select label="Durée d'engagement"
              value={String(params.denormandie_dureeEngagement)}
              onChange={e => setP({ denormandie_dureeEngagement: +e.target.value as 6 | 9 | 12 })}
              options={[
                { value: '6',  label: '6 ans (réduction 12 %)' },
                { value: '9',  label: '9 ans (réduction 18 %)' },
                { value: '12', label: '12 ans (réduction 21 %)' },
              ]} />
          </Grid2>
          <Toggle label="Commune éligible (ACV ou ORT)"
            hint="Action Cœur de Ville ou Opération de Revitalisation du Territoire"
            checked={params.denormandie_villeEligible}
            onChange={v => setP({ denormandie_villeEligible: v })} />
          {!params.denormandie_villeEligible && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              ⚠️ Vérifiez l'éligibilité de la commune sur servicepublic.fr — le dispositif ne s'applique qu'aux villes ACV/ORT.
            </p>
          )}
        </>
        )
      })()}

      {/* ── Loc'Avantages ── */}
      {dispositif === 'loc_avantages' && (
        <>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-xs text-purple-700">
            Réduction d'impôt sur les loyers perçus en échange d'un loyer sous le marché. Nécessite une <strong>convention avec l'Anah</strong>. Durée minimale : 6 ans.
          </div>
          <Grid2>
            <Select label="Niveau de loyer"
              value={params.locAvantages_niveau}
              onChange={e => setP({ locAvantages_niveau: e.target.value as 'intermediaire' | 'social' | 'tres_social' })}
              options={[
                { value: 'intermediaire', label: 'Intermédiaire (réd. 15 %)' },
                { value: 'social',        label: 'Social (réd. 35 %)' },
                { value: 'tres_social',   label: 'Très social (réd. 65 %)' },
              ]} />
            <Input label="Loyer de marché de référence" type="number"
              value={params.locAvantages_loyerMarcheRef}
              onChange={e => setP({ locAvantages_loyerMarcheRef: +e.target.value })}
              suffix="€/mois HC" hint="Loyer libre pratiqué dans le secteur" />
          </Grid2>
          <Toggle label="Gestion par opérateur agréé Anah (+10 %)"
            hint="Mandat de gestion signé avec un opérateur social agréé"
            checked={params.locAvantages_gestionOperateur}
            onChange={v => setP({ locAvantages_gestionOperateur: v })} />
        </>
      )}

      {/* ── Malraux ── */}
      {dispositif === 'malraux' && (
        <>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
            Réduction d'impôt sur travaux de restauration : <strong>30 % (PSMV)</strong> ou <strong>22 % (PVAP)</strong>. Plafond travaux : 400 000 € sur 4 ans. Agrément ABF obligatoire. Engagement location 9 ans.
          </div>
          <Grid2>
            <Select label="Zone Malraux"
              value={params.malraux_zone}
              onChange={e => setP({ malraux_zone: e.target.value as 'psmv' | 'pvap' })}
              options={[
                { value: 'psmv', label: 'PSMV — Site Patrimonial Remarquable (30 %)' },
                { value: 'pvap', label: 'PVAP — Plan de Valorisation (22 %)' },
              ]} />
            <Input label="Montant travaux éligibles" type="number"
              value={params.malraux_montantTravaux}
              onChange={e => setP({ malraux_montantTravaux: +e.target.value })}
              suffix="€" hint="Plafond 400 000 € sur 4 ans max." />
            <Input label="Année de début des travaux" type="number" min={1} max={10}
              value={params.malraux_anneeDebut}
              onChange={e => setP({ malraux_anneeDebut: +e.target.value })}
              suffix="ème année" hint="Année de démarrage dans votre simulation" />
            <Input label="Durée des travaux" type="number" min={1} max={4}
              value={params.malraux_dureeTravauxAns}
              onChange={e => setP({ malraux_dureeTravauxAns: +e.target.value })}
              suffix="ans" hint="1 à 4 ans maximum" />
          </Grid2>
        </>
      )}

      {/* ── Monuments Historiques ── */}
      {dispositif === 'monuments_historiques' && (
        <>
          <div className="bg-slate-100 border border-slate-300 rounded-lg p-3 text-xs text-slate-700">
            Déduction <strong>intégrale et sans plafond</strong> des charges sur le revenu global. Engagement de conservation 15 ans. Consultation d'un notaire et fiscaliste spécialisé indispensable.
          </div>
          <Input label="Charges annuelles déductibles du revenu global" type="number"
            value={params.mh_montantChargesDeductibles}
            onChange={e => setP({ mh_montantChargesDeductibles: +e.target.value })}
            suffix="€/an" hint="Travaux + intérêts + charges courantes admissibles" />
        </>
      )}

      {/* ── Jeanbrun ── */}
      {dispositif === 'jeanbrun' && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 space-y-1">
            <p><strong>Dispositif Relance logement (LF 2026)</strong> — En vigueur depuis le 21/02/2026.</p>
            <p>Amortissement annuel déductible des revenus fonciers : <strong>80 % du prix d'achat</strong> (+ travaux pour l'ancien) × taux selon niveau de loyer. Déficit imputable sur revenu global jusqu'à <strong>10 700 €/an</strong>. Engagement de location <strong>9 ans minimum</strong>, location nue uniquement.</p>
            <p className="text-blue-600">⚠️ Les amortissements déduits sont réintégrés dans le prix d'acquisition à la revente (art. 150 VB III CGI).</p>
          </div>
          <Select label="Type de bien"
            value={params.jeanbrun_typeBien}
            onChange={e => setP({ jeanbrun_typeBien: e.target.value as 'neuf' | 'ancien' })}
            options={[
              { value: 'neuf',   label: 'Neuf — conforme RE2020 (taux : 3,5 % / 4,5 % / 5,5 %)' },
              { value: 'ancien', label: 'Ancien — travaux ≥ 30 %, DPE A/B après travaux (taux : 3,0 % / 3,5 % / 4,0 %)' },
            ]} />
          <Select label="Niveau de loyer pratiqué"
            value={params.jeanbrun_niveauLoyer}
            onChange={e => setP({ jeanbrun_niveauLoyer: e.target.value as 'intermediaire' | 'social' | 'tres_social' })}
            options={[
              { value: 'intermediaire', label: `Intermédiaire — plafond 8 000 €/an · taux ${params.jeanbrun_typeBien === 'neuf' ? '3,5' : '3,0'} %` },
              { value: 'social',        label: `Social — plafond 10 000 €/an · taux ${params.jeanbrun_typeBien === 'neuf' ? '4,5' : '3,5'} %` },
              { value: 'tres_social',   label: `Très social — plafond 12 000 €/an · taux ${params.jeanbrun_typeBien === 'neuf' ? '5,5' : '4,0'} %` },
            ]}
            hint="Plus le loyer est modéré, plus le taux d'amortissement est élevé" />
          {params.jeanbrun_typeBien === 'ancien' && (
            <Input label="Montant des travaux de rénovation" type="number"
              value={params.jeanbrun_montantTravauxAncien}
              onChange={e => setP({ jeanbrun_montantTravauxAncien: +e.target.value })}
              suffix="€" hint="Inclus dans la base amortissable. Travaux ≥ 30 % du prix d'achat, objectif DPE A ou B." />
          )}
          <Input label="Durée d'engagement de location" type="number" min={9} max={20}
            value={params.jeanbrun_engagementAns}
            onChange={e => setP({ jeanbrun_engagementAns: +e.target.value })}
            suffix="ans" hint="Minimum 9 ans. L'amortissement s'applique sur toute la durée d'engagement (location nue, résidence principale du locataire)." />
          <Toggle label="Le logement est situé dans un immeuble d'habitation collectif"
            hint="Maison individuelle = inéligible au dispositif Jeanbrun"
            checked={params.jeanbrun_batimentCollectif}
            onChange={v => setP({ jeanbrun_batimentCollectif: v })} />
          <Toggle label="Le locataire occupe le logement à titre de résidence principale"
            hint="Condition obligatoire du dispositif Jeanbrun"
            checked={params.jeanbrun_residencePrincipaleLocataire}
            onChange={v => setP({ jeanbrun_residencePrincipaleLocataire: v })} />
          <Toggle label="Le loyer pratiqué respecte le plafond Jeanbrun de la zone"
            hint="Plafonds définis selon le niveau de loyer choisi ci-dessus et la zone géographique"
            checked={params.jeanbrun_loyerRespectePlafond}
            onChange={v => setP({ jeanbrun_loyerRespectePlafond: v })} />
          <Toggle label="La date d'acquisition réelle est confirmée (entre le 21/02/2026 et le 31/12/2028)"
            hint="Sans confirmation, l'acquisition est supposée avoir lieu à la date du jour — à vérifier"
            checked={params.jeanbrun_dateAcquisitionConfirmee}
            onChange={v => setP({ jeanbrun_dateAcquisitionConfirmee: v })} />
        </>
      )}
    </div>
  )
}

// ── STEP 8 — Revente + Audit éligibilité ─────────────────────────────────────
export function Step8({ data, onChange }: SP) {
  const r = data.revente
  const set = (patch: Partial<typeof r>) => onChange({ revente: { ...r, ...patch } })

  // Audit d'éligibilité en temps réel
  const dispositif = data.fiscalite.dispositif ?? 'aucun'

  // Coût total d'acquisition (rappel contextuel)
  const a = data.acquisition
  const coutTotalAcq = a.prixAchat + (a.fraisAgenceInclus ? 0 : a.fraisAgence)
    + a.fraisNotaire + a.fraisCourtage + a.fraisGarantieBancaire
    + a.fraisDossierBancaire + a.travauxInitiaux + a.mobilier + a.autresFrais

  // Prix de revente : manuel ou formule
  const modeManuel = r.prixReventeManuel != null && r.prixReventeManuel > 0
  const prixRevente = modeManuel
    ? r.prixReventeManuel!
    : Math.round(a.prixAchat * Math.pow(1 + r.revalorisationAnnuelle, r.dureeDetentionAns))

  // Revalorisation implicite si mode manuel
  const revaloImplicite = modeManuel && a.prixAchat > 0 && r.dureeDetentionAns > 0
    ? (Math.pow(prixRevente / a.prixAchat, 1 / r.dureeDetentionAns) - 1) * 100
    : null
  const eligibilite = dispositif !== 'aucun' ? calculerEligibilite(data) : null
  const auditColors = eligibilite ? ELIGIBILITY_STATUS_COLORS[eligibilite.status] : null

  return (
    <div className="space-y-6">
      <Section title="Durée de détention">
        <Input label="Durée de détention envisagée" type="number" min={1} max={30} value={r.dureeDetentionAns}
          onChange={e => set({ dureeDetentionAns: +e.target.value })} suffix="ans" />
      </Section>

      <Section title="Valeur de marché (optionnel)">
        <p className="text-xs text-slate-500">
          Si vous disposez d&apos;une estimation de valeur (avis d&apos;agence, comparables, expertise),
          renseignez-la ici. La valeur post-travaux estimée remplace alors la base
          &laquo; prix d&apos;achat + travaux &raquo; pour projeter le prix de revente.
        </p>
        <Grid2>
          <Input label="Valeur de marché actuelle estimée" type="number"
            value={r.valeurMarcheActuelle ?? ''}
            onChange={e => set({ valeurMarcheActuelle: e.target.value === '' ? undefined : +e.target.value })}
            suffix="€"
            hint="Valeur du bien en l'état, avant travaux" />
          <Input label="Valeur post-travaux estimée" type="number"
            value={r.valeurPostTravauxEstimee ?? ''}
            onChange={e => set({ valeurPostTravauxEstimee: e.target.value === '' ? undefined : +e.target.value })}
            suffix="€"
            hint="Remplace prix d'achat + travaux comme base de projection de revente" />
        </Grid2>
        {(r.valeurMarcheActuelle || r.valeurPostTravauxEstimee) && (
          <Grid2>
            <Input label="Source de l'estimation" type="text"
              value={r.valeurMarcheSource ?? ''}
              onChange={e => set({ valeurMarcheSource: e.target.value === '' ? undefined : e.target.value })}
              placeholder="Avis d'agence, comparables, expertise..." />
            <Select label="Niveau de confiance" value={r.valeurMarcheFiabilite ?? 'estimation'}
              onChange={e => set({ valeurMarcheFiabilite: e.target.value as typeof r.valeurMarcheFiabilite })}
              options={[
                { value: 'élevée', label: 'Élevée (expertise/compromis récent)' },
                { value: 'moyenne', label: 'Moyenne (avis agence)' },
                { value: 'à vérifier', label: 'À vérifier' },
                { value: 'estimation', label: 'Estimation personnelle' },
              ]}
            />
          </Grid2>
        )}
      </Section>

      <Section title="Prix de revente">
        {/* Rappel de l'enveloppe d'acquisition */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs text-slate-600 space-y-1">
          <div className="flex justify-between">
            <span>Prix d&apos;achat</span>
            <span className="font-medium text-slate-800">{a.prixAchat.toLocaleString('fr-FR')} €</span>
          </div>
          {a.travauxInitiaux > 0 && (
            <div className="flex justify-between">
              <span>Travaux initiaux</span>
              <span className="font-medium text-slate-800">{a.travauxInitiaux.toLocaleString('fr-FR')} €</span>
            </div>
          )}
          <div className="flex justify-between border-t border-slate-200 pt-1 mt-1">
            <span className="font-semibold text-slate-700">Coût total d&apos;acquisition</span>
            <span className="font-bold text-slate-900">{coutTotalAcq.toLocaleString('fr-FR')} €</span>
          </div>
        </div>

        {/* Toggle mode : automatique / manuel */}
        <div className="flex items-center gap-3">
          <button type="button"
            onClick={() => set({ prixReventeManuel: undefined })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              !modeManuel ? 'bg-emerald-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}>
            Revalorisation automatique
          </button>
          <button type="button"
            onClick={() => set({ prixReventeManuel: prixRevente || a.prixAchat })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              modeManuel ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}>
            Prix libre (recommandé pour déficit foncier)
          </button>
        </div>

        {!modeManuel ? (
          <Input label="Revalorisation annuelle du bien" type="number" step="0.5"
            value={(r.revalorisationAnnuelle * 100).toFixed(1)}
            onChange={e => set({ revalorisationAnnuelle: +e.target.value / 100 })} suffix="%/an"
            hint="Inflation immobilière locale estimée (appliquée sur le prix d'achat seul)" />
        ) : (
          <Input label="Prix de revente envisagé" type="number"
            value={r.prixReventeManuel ?? ''}
            onChange={e => set({ prixReventeManuel: e.target.value === '' ? undefined : +e.target.value })}
            suffix="€"
            hint={`Votre estimation à ${r.dureeDetentionAns} ans (travaux inclus dans la valeur si rénovation)`} />
        )}

        {/* Résumé du prix de revente retenu */}
        {prixRevente > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Prix de revente retenu dans {r.dureeDetentionAns} ans</span>
              <span className="font-bold text-emerald-700">{prixRevente.toLocaleString('fr-FR')} €</span>
            </div>
            {revaloImplicite != null && (
              <div className="text-xs text-slate-500 mt-1">
                Soit{' '}
                <span className={`font-semibold ${revaloImplicite >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {revaloImplicite >= 0 ? '+' : ''}{revaloImplicite.toFixed(2)} %/an
                </span>
                {' '}de revalorisation annuelle implicite (vs prix d&apos;achat {a.prixAchat.toLocaleString('fr-FR')} €)
              </div>
            )}
            {!modeManuel && (
              <div className="text-xs text-slate-400 mt-1">
                Calculé sur le prix d&apos;achat seul × (1 + {(r.revalorisationAnnuelle * 100).toFixed(1)} %)^{r.dureeDetentionAns}
              </div>
            )}
          </div>
        )}
      </Section>
      <Section title="Hypothèses financières">
        <Grid2>
          <Input label="Frais de vente estimés" type="number" step="0.5"
            value={(r.fraisVentePct * 100).toFixed(1)}
            onChange={e => set({ fraisVentePct: +e.target.value / 100 })} suffix="%"
            hint="Agence + frais divers (~5-6%)" />
          <Input label="Taux d'actualisation (VAN)" type="number" step="0.5"
            value={(r.tauxActualisation * 100).toFixed(1)}
            onChange={e => set({ tauxActualisation: +e.target.value / 100 })} suffix="%"
            hint="Rendement de votre alternative de référence" />
        </Grid2>
      </Section>

      {/* ── Audit d'éligibilité fiscale (si un dispositif est sélectionné) ── */}
      {eligibilite && auditColors && (
        <div className={`rounded-xl border p-4 space-y-3 ${auditColors.bg} ${auditColors.border}`}>
          {/* En-tête statut */}
          <div className="flex items-center justify-between">
            <p className={`text-sm font-bold ${auditColors.text}`}>
              Audit d&apos;éligibilité — {DISPOSITIF_LABELS[dispositif]}
            </p>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${auditColors.bg} ${auditColors.text} ${auditColors.border}`}>
              {ELIGIBILITY_STATUS_LABELS[eligibilite.status]}
            </span>
          </div>

          {/* ── Ligne standardisée : avantage intégré dans TRI/VAN ── */}
          {(() => {
            const modeIndicatif = r.modeSimulationAvantage === 'indicatif'
            const avantageIntegre = eligibilite.status === 'eligible'
              || (modeIndicatif && eligibilite.status !== 'ineligible' && eligibilite.canGenerate)
            return (
              <div className="flex items-center justify-between text-xs rounded-lg px-3 py-2 bg-white/50 border border-current/10">
                <span className={`font-semibold ${auditColors.text}`}>Avantage fiscal intégré dans TRI / VAN</span>
                <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${avantageIntegre ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                  {avantageIntegre ? '✓ Oui' : '✗ Non'}
                  {modeIndicatif && avantageIntegre && eligibilite.status !== 'eligible' && (
                    <span className="ml-1 text-amber-700">(sous réserve)</span>
                  )}
                </span>
              </div>
            )
          })()}

          {/* ── Toggle mode prudent / indicatif ── */}
          {eligibilite.status !== 'eligible' && eligibilite.status !== 'ineligible' && eligibilite.canGenerate && (
            <div className="flex items-center gap-3 text-xs rounded-lg px-3 py-2 bg-white/50 border border-current/10">
              <span className={`font-medium ${auditColors.text}`}>Mode simulation :</span>
              <div className="flex gap-1">
                <button
                  onClick={() => set({ modeSimulationAvantage: 'prudent' })}
                  className={`px-2 py-1 rounded-md border text-xs font-semibold transition-colors ${
                    (r.modeSimulationAvantage ?? 'prudent') === 'prudent'
                      ? 'bg-slate-700 text-white border-slate-700'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  🛡 Prudent
                </button>
                <button
                  onClick={() => set({ modeSimulationAvantage: 'indicatif' })}
                  className={`px-2 py-1 rounded-md border text-xs font-semibold transition-colors ${
                    r.modeSimulationAvantage === 'indicatif'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  📊 Indicatif
                </button>
              </div>
              <span className="text-slate-500 italic">
                {r.modeSimulationAvantage === 'indicatif'
                  ? 'Avantage intégré sous réserve de vérification'
                  : 'Avantage exclu tant que conditions non validées'}
              </span>
            </div>
          )}

          {/* ── Données manquantes bloquantes ── */}
          {eligibilite.avertissements.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer text-xs font-semibold text-amber-800 select-none list-none flex items-center gap-1">
                <span className="group-open:hidden">▶</span>
                <span className="hidden group-open:inline">▼</span>
                {eligibilite.avertissements.length} donnée{eligibilite.avertissements.length > 1 ? 's' : ''} manquante{eligibilite.avertissements.length > 1 ? 's' : ''} — impact sur le calcul
              </summary>
              <div className="mt-1 overflow-hidden rounded-lg border border-amber-200">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-amber-100 text-amber-900">
                      <th className="text-left px-2 py-1 font-semibold">Donnée manquante</th>
                      <th className="text-left px-2 py-1 font-semibold">Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eligibilite.conditions
                      .filter(c => c.status === 'a_verifier')
                      .map((c, i) => (
                        <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-amber-50'} border-t border-amber-100`}>
                          <td className="px-2 py-1 font-medium text-slate-700">{c.label}</td>
                          <td className="px-2 py-1 text-amber-800">{c.note ?? 'À vérifier'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}

          {/* Blocages (toujours visibles si présents) */}
          {eligibilite.erreurs.length > 0 && (
            <div className="space-y-1">
              {eligibilite.erreurs.map((e, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-red-800 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
                  <span className="shrink-0">🚫</span>
                  <span>{e}</span>
                </div>
              ))}
            </div>
          )}

          {/* Toutes les conditions (accordéon minimal) */}
          <details className="group">
            <summary className={`cursor-pointer text-xs font-semibold ${auditColors.text} select-none list-none flex items-center gap-1`}>
              <span className="group-open:hidden">▶</span>
              <span className="hidden group-open:inline">▼</span>
              Voir les {eligibilite.conditions.length} conditions vérifiées
            </summary>
            <div className="mt-2 space-y-1">
              {eligibilite.conditions.map(c => (
                <div key={c.id} className="flex items-start gap-2 text-xs bg-white/60 rounded px-2 py-1.5">
                  <span className="shrink-0 w-4 text-center">{CONDITION_STATUS_ICONS[c.status]}</span>
                  <div>
                    <span className="font-medium text-slate-800">{c.label}</span>
                    {c.note && <span className="text-slate-500 ml-1">— {c.note}</span>}
                  </div>
                </div>
              ))}
            </div>
          </details>

          {/* Avantage fiscal — affiché selon le statut d'éligibilité */}
          {eligibilite.avantageTheorique > 0 && (
            <div className="space-y-2 pt-1 border-t border-current/10">
              {eligibilite.status === 'eligible' ? (
                /* ── Éligible : avantage utilisable confirmé ── */
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${auditColors.text}`}>
                      {eligibilite.avantageTheorique.toLocaleString('fr-FR')} €
                    </div>
                    <div className={`text-xs ${auditColors.text} opacity-70`}>Théorique</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-700">
                      {eligibilite.avantageUtilisable.toLocaleString('fr-FR')} €
                    </div>
                    <div className="text-xs text-emerald-600 opacity-70">Utilisable confirmé</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${eligibilite.avantagePerdu > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                      {eligibilite.avantagePerdu.toLocaleString('fr-FR')} €
                    </div>
                    <div className={`text-xs ${eligibilite.avantagePerdu > 0 ? 'text-red-500' : 'text-slate-400'} opacity-70`}>
                      {eligibilite.avantagePerdu > 0 ? 'Non absorbable' : 'Rien de perdu'}
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Inéligible / À vérifier : avantage non intégré ── */
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${auditColors.text}`}>
                      {eligibilite.avantageTheorique.toLocaleString('fr-FR')} €
                    </div>
                    <div className={`text-xs ${auditColors.text} opacity-70`}>Avantage théorique</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-400">0 €</div>
                    <div className="text-xs text-slate-400 opacity-70">Intégré dans TRI / VAN</div>
                  </div>
                </div>
              )}
              {eligibilite.status !== 'eligible' && (() => {
                const isMalrauxMH = dispositif === 'malraux' || dispositif === 'monuments_historiques'
                const irSaisi = data.fiscalite.irBrutAnnuel
                if (isMalrauxMH && irSaisi === undefined) {
                  return (
                    <div className="text-xs bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-amber-800">
                      ⚠️ <strong>Avantage non calculable</strong> : votre IR annuel n&apos;est pas renseigné. Sans IR, impossible de déterminer si la réduction de {eligibilite.avantageTheorique.toLocaleString('fr-FR')} € sera absorbable. Renseignez votre IR en parcours avancé (étape Profil fiscal). L&apos;avantage n&apos;est <strong>pas intégré</strong> dans le TRI et la VAN.
                    </div>
                  )
                }
                if (isMalrauxMH && irSaisi === 0) {
                  return (
                    <div className="text-xs bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-orange-800">
                      ℹ IR = 0 → <strong>avantage nul</strong> : la réduction d&apos;impôt de {eligibilite.avantageTheorique.toLocaleString('fr-FR')} € ne peut pas s&apos;appliquer sur un IR nul. Avantage intégré dans le TRI et la VAN : <strong>0 €</strong>.
                    </div>
                  )
                }
                return (
                  <div className="text-xs bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-amber-800">
                    ⚠️ L&apos;avantage de <strong>{eligibilite.avantageTheorique.toLocaleString('fr-FR')} € (potentiel sous réserve)</strong> n&apos;est <strong>pas intégré</strong> dans le TRI et la VAN tant que les conditions d&apos;éligibilité ne sont pas toutes validées.
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      )}

      {/* Prêt à analyser — message adapté au statut d'éligibilité */}
      {eligibilite && !eligibilite.canGenerate ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-red-800 mb-1">🚫 Simulation bloquée</p>
          <p className="text-sm text-red-700">
            Des conditions bloquantes empêchent la génération d&apos;un rapport fiable.
            Corrigez les points signalés en rouge ci-dessus avant de continuer.
          </p>
        </div>
      ) : eligibilite && eligibilite.status === 'a_verifier' ? (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 space-y-2">
          <p className="text-sm font-semibold text-amber-900">⚠️ Simulation indicative possible</p>
          <p className="text-sm text-amber-800">
            Des conditions restent à vérifier. En mode <strong>prudent</strong> (défaut), l&apos;avantage fiscal n&apos;est <strong>pas intégré</strong> dans le TRI et la VAN.
            Passez en mode <strong>indicatif</strong> ci-dessus pour simuler l&apos;avantage sous réserve, ou complétez l&apos;audit pour le valider.
          </p>
          {dispositif === 'deficit_foncier_renforce' && (
            <p className="text-xs text-amber-700 border-t border-amber-200 pt-2">
              ℹ Par défaut, le moteur applique le <strong>plafond standard de 10 700 €/an</strong>.
              Le plafond renforcé de 21 400 € n&apos;est activé que si le DPE avant travaux E/F/G <em>et</em> les travaux de rénovation énergétique éligibles sont confirmés.
            </p>
          )}
        </div>
      ) : eligibilite && eligibilite.status === 'indicative' ? (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
          <p className="text-sm font-semibold text-blue-900">ℹ Simulation indicative — validation expert obligatoire</p>
          {dispositif === 'monuments_historiques' ? (
            <p className="text-sm text-blue-800">
              <strong>Simulation indicative uniquement</strong> — aucun avantage fiscal n&apos;est intégré dans le TRI et la VAN
              tant que le statut juridique du monument, les charges déductibles, le revenu global et les justificatifs
              ne sont pas validés par un notaire/fiscaliste spécialisé. Le régime MH peut être très puissant
              (imputation dérogatoire sur revenu global) mais ne doit jamais être automatisé sans validation experte.
            </p>
          ) : (
            <p className="text-sm text-blue-800">
              Ce dispositif requiert une validation par notaire / fiscaliste avant toute décision.
              Les chiffres présentés sont indicatifs. L&apos;avantage fiscal n&apos;est <strong>pas intégré</strong> dans le TRI et la VAN.
            </p>
          )}
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-emerald-800 mb-1">✓ Prêt à analyser</p>
          <p className="text-sm text-emerald-700">
            Votre simulation sera calculée sur {r.dureeDetentionAns} ans avec {data.revente.dureeDetentionAns * 12} mois de projection détaillée.
            Rendement brut, net, net-net, TRI, VAN, cash-flow mensuel, verdict et analyse IA.
          </p>
        </div>
      )}
    </div>
  )
}
