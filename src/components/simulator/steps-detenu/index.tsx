'use client'
import { ProjectInputDetenu, HoldingStructure } from '@/lib/calculator/types'
import { Input, Select, Toggle, Section, Grid2 } from '@/components/ui/FormField'

export type SPD = { data: ProjectInputDetenu; onChange: (patch: Partial<ProjectInputDetenu>) => void }

// ── STEP 1 — Le bien détenu + mode de détention ────────────────────────────
export function StepBienDetenu({ data, onChange }: SPD) {
  const b = data.bien
  const f = data.fiscalite
  const set = (patch: Partial<typeof b>) => onChange({ bien: { ...b, ...patch } })
  const setF = (patch: Partial<typeof f>) => onChange({ fiscalite: { ...f, ...patch } })

  return (
    <div className="space-y-6">
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
      </Section>

      <Section title="Caractéristiques">
        <Grid2>
          <Select label="État général" value={b.etat} onChange={e => set({ etat: e.target.value as typeof b.etat })}
            options={[
              { value: 'neuf', label: 'Neuf' },
              { value: 'bon_etat', label: 'Bon état' },
              { value: 'a_rafraichir', label: 'À rafraîchir' },
              { value: 'travaux_lourds', label: 'Travaux lourds' },
            ]}
          />
          <Input label="Année de construction" type="number" value={b.anneeConstruction}
            onChange={e => set({ anneeConstruction: +e.target.value })} />
        </Grid2>
        <Toggle label="En copropriété" checked={b.copropriete} onChange={v => set({ copropriete: v })} />
        <p className="text-xs text-slate-400">
          Le DPE actuel du bien sera renseigné à l&apos;étape &quot;Performance actuelle&quot;.
        </p>
      </Section>

      <Section title="Mode de détention">
        <div className="grid grid-cols-2 gap-2">
          {([
            { value: 'nom_propre', label: 'Nom propre', desc: 'Achat direct — particulier' },
            { value: 'indivision', label: 'Indivision', desc: 'Plusieurs co-propriétaires' },
            { value: 'sci_ir', label: "SCI à l'IR", desc: 'SCI transparente — résultats imposés chez les associés' },
            { value: 'sci_is', label: "SCI à l'IS", desc: 'IS 15 %/25 % — fiscalité de cession différente' },
            { value: 'demembrement', label: 'Démembrement', desc: 'Usufruit / nue-propriété séparés' },
            { value: 'sarl_famille', label: 'SARL de famille', desc: 'Société familiale soumise à l\'IR' },
            { value: 'sas_is', label: "Société à l'IS (SAS...)", desc: "Hors SCI — société soumise à l'IS" },
            { value: 'autre', label: 'Autre', desc: 'À préciser auprès d\'un professionnel' },
          ] as { value: HoldingStructure; label: string; desc: string }[]).map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setF({ holdingStructure: opt.value })}
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
        <p className="text-xs text-slate-400">
          Conditionne le calcul de la fiscalité de cession (plus-value des particuliers vs IS) et certaines règles d&apos;amortissement.
        </p>
      </Section>
    </div>
  )
}

// ── STEP 2 — Historique d'acquisition ──────────────────────────────────────
export function StepHistorique({ data, onChange }: SPD) {
  const h = data.historique
  const set = (patch: Partial<typeof h>) => onChange({ historique: { ...h, ...patch } })

  const isLmnpReel = data.fiscalite.regime === 'lmnp_reel'

  return (
    <div className="space-y-6">
      <Section title="Acquisition initiale">
        <Grid2>
          <Input label="Date d'achat" type="date" value={h.dateAchat}
            onChange={e => set({ dateAchat: e.target.value })}
            hint="Si elle n'est pas renseignée, la fiscalité de cession ne sera pas calculée (affichée comme non applicable)." />
          <Input label="Prix d'achat initial" type="number" value={h.prixAchatInitial}
            onChange={e => set({ prixAchatInitial: +e.target.value })} suffix="€" />
        </Grid2>
        <Grid2>
          <Input label="Frais initiaux (notaire, agence, garantie...)" type="number" value={h.fraisInitiaux}
            onChange={e => set({ fraisInitiaux: +e.target.value })} suffix="€" />
          <Input label="Travaux réalisés depuis l'acquisition" type="number" value={h.travauxDepuisAcquisition}
            onChange={e => set({ travauxDepuisAcquisition: +e.target.value })} suffix="€" />
        </Grid2>
      </Section>

      <Section title="Situation fiscale accumulée">
        {isLmnpReel && (
          <Input
            label="Amortissements déjà pratiqués (cumul)"
            type="number" value={h.amortissementsDejaPratiques}
            onChange={e => set({ amortissementsDejaPratiques: +e.target.value })} suffix="€"
            hint="Cumul des amortissements déjà déduits en LMNP réel — réintégrés dans la plus-value de cession (LF 2025)"
          />
        )}
        <Input
          label="Déficits fonciers reportables (stock non imputé)"
          type="number" value={h.deficitsFonciersReportables}
          onChange={e => set({ deficitsFonciersReportables: +e.target.value })} suffix="€"
          hint="Déficits des années précédentes encore en report (reportables 10 ans)"
        />
        <Input
          label="Durée de détention actuelle (si différente de la date d'achat)"
          type="number" min={0} value={h.dureeDetentionActuelleAns ?? ''}
          placeholder="Calculée automatiquement depuis la date d'achat"
          onChange={e => set({ dureeDetentionActuelleAns: e.target.value === '' ? undefined : +e.target.value })}
          suffix="ans"
        />
      </Section>
    </div>
  )
}

// ── STEP 3 — Prêt en cours ──────────────────────────────────────────────────
export function StepPretEnCours({ data, onChange }: SPD) {
  const p = data.pretEnCours
  const set = (patch: Partial<typeof p>) => onChange({ pretEnCours: { ...p, ...patch } })

  return (
    <div className="space-y-6">
      <Section title="Financement en cours">
        <Toggle
          label="Le bien est encore financé par un crédit en cours"
          checked={p.pretEnCours}
          onChange={v => set({ pretEnCours: v })}
        />
      </Section>

      {p.pretEnCours && (
        <>
          <Section title="Capital et mensualités">
            <Grid2>
              <Input label="Capital restant dû" type="number" value={p.capitalRestantDu}
                onChange={e => set({ capitalRestantDu: +e.target.value })} suffix="€" />
              <Input label="Mensualité actuelle (avec assurance)" type="number" value={p.mensualiteActuelle}
                onChange={e => set({ mensualiteActuelle: +e.target.value })} suffix="€/mois" />
            </Grid2>
            <Grid2>
              <Input label="Taux nominal" type="number" step="0.01" value={(p.tauxNominal * 100).toFixed(2)}
                onChange={e => set({ tauxNominal: +e.target.value / 100 })} suffix="%" />
              <Input label="Taux assurance emprunteur" type="number" step="0.01" value={(p.tauxAssurance * 100).toFixed(2)}
                onChange={e => set({ tauxAssurance: +e.target.value / 100 })} suffix="% / an" />
            </Grid2>
            <Grid2>
              <Input label="Durée restante" type="number" value={p.dureeRestanteMois / 12}
                onChange={e => set({ dureeRestanteMois: +e.target.value * 12 })} suffix="ans" hint="En années" />
              <Input label="Date de fin de prêt" type="date" value={p.dateFinPret ?? ''}
                onChange={e => set({ dateFinPret: e.target.value || undefined })} />
            </Grid2>
            <Select label="Type de prêt" value={p.typePret}
              onChange={e => set({ typePret: e.target.value as typeof p.typePret })}
              options={[
                { value: 'amortissable', label: 'Amortissable (classique)' },
                { value: 'in_fine', label: 'In fine (capital remboursé à terme)' },
                { value: 'differe', label: 'Différé en cours' },
                { value: 'relais', label: 'Prêt relais' },
              ]}
            />
          </Section>

          <Section title="Remboursement anticipé">
            <Toggle
              label="Remboursement anticipé total possible en cas de vente"
              checked={p.remboursementAnticipePossible}
              onChange={v => set({ remboursementAnticipePossible: v })}
            />
            {p.remboursementAnticipePossible && (
              <Input
                label="Indemnité de remboursement anticipé (IRA) estimée"
                type="number" value={p.indemniteRemboursementAnticipe ?? ''}
                placeholder="Ex : 3000"
                onChange={e => set({ indemniteRemboursementAnticipe: e.target.value === '' ? undefined : +e.target.value })}
                suffix="€"
                hint="Plafond légal : 3 % du capital restant dû ou 6 mois d'intérêts (le plus faible des deux)"
              />
            )}
            <Grid2>
              <Select label="Garantie" value={p.garantie ?? 'hypotheque'}
                onChange={e => set({ garantie: e.target.value as typeof p.garantie })}
                options={[
                  { value: 'hypotheque', label: 'Hypothèque' },
                  { value: 'caution', label: 'Caution (organisme)' },
                  { value: 'ppd', label: 'Privilège de prêteur de deniers (PPD)' },
                  { value: 'autre', label: 'Autre' },
                ]}
              />
              <Toggle
                label="Renégociation envisagée plutôt qu'une vente"
                checked={p.renegociationEnvisagee ?? false}
                onChange={v => set({ renegociationEnvisagee: v })}
              />
            </Grid2>
          </Section>
        </>
      )}
    </div>
  )
}

// ── STEP 4 — Performance actuelle ───────────────────────────────────────────
export function StepPerformanceActuelle({ data, onChange }: SPD) {
  const perf = data.performanceActuelle
  const set = (patch: Partial<typeof perf>) => onChange({ performanceActuelle: { ...perf, ...patch } })

  // Synchronise les valeurs « réelles » avec les hypothèses de projection
  // (location/charges) qui serviront de point de départ au scénario "Conserver".
  const syncLocation = (patch: Partial<typeof data.location>) =>
    onChange({ location: { ...data.location, ...patch } })
  const syncCharges = (patch: Partial<typeof data.charges>) =>
    onChange({ charges: { ...data.charges, ...patch } })

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-800">
        Renseignez les chiffres <strong>réellement constatés</strong> sur les 12 derniers mois — ils servent de base
        au calcul du rendement réel actuel et du scénario &quot;Conserver&quot;.
      </div>

      <Section title="Loyers et occupation">
        <Grid2>
          <Input label="Loyer mensuel actuel (hors charges)" type="number" value={perf.loyerActuelMensuel}
            onChange={e => {
              const v = +e.target.value
              set({ loyerActuelMensuel: v })
              syncLocation({ loyerMensuelHC: v })
            }} suffix="€/mois" />
          <Input label="Taux de vacance réel" type="number" step="0.5" value={(perf.tauxVacanceReel * 100).toFixed(1)}
            onChange={e => set({ tauxVacanceReel: +e.target.value / 100 })} suffix="%"
            hint="Vacance constatée sur les 12 derniers mois" />
        </Grid2>
        <Input label="Impayés constatés sur 12 mois" type="number" value={perf.impayesAnnuelsReels ?? ''}
          placeholder="0" onChange={e => set({ impayesAnnuelsReels: e.target.value === '' ? undefined : +e.target.value })} suffix="€/an" />
      </Section>

      <Section title="Charges réelles">
        <Grid2>
          <Input label="Taxe foncière réelle" type="number" value={perf.taxeFonciereReelle}
            onChange={e => {
              const v = +e.target.value
              set({ taxeFonciereReelle: v })
              syncCharges({ taxeFonciere: v })
            }} suffix="€/an" />
          {data.bien.copropriete && (
            <Input label="Charges de copropriété réelles" type="number" value={perf.chargesCoproReellesAnnuelles}
              onChange={e => {
                const v = +e.target.value
                set({ chargesCoproReellesAnnuelles: v })
                syncCharges({ chargesCoproAnnuelles: v })
              }} suffix="€/an" />
          )}
        </Grid2>
        <Grid2>
          <Input label="Assurance PNO réelle" type="number" value={perf.assurancePnoReelleAnnuelle ?? ''}
            placeholder="0" onChange={e => set({ assurancePnoReelleAnnuelle: e.target.value === '' ? undefined : +e.target.value })} suffix="€/an" />
          <Input label="Frais de gestion réels" type="number" value={perf.fraisGestionReelsAnnuels ?? ''}
            placeholder="0" onChange={e => set({ fraisGestionReelsAnnuels: e.target.value === '' ? undefined : +e.target.value })} suffix="€/an" />
        </Grid2>
      </Section>

      <Section title="DPE actuel">
        <Select label="DPE actuel du bien" value={perf.dpeActuel}
          onChange={e => {
            const v = e.target.value as typeof perf.dpeActuel
            set({ dpeActuel: v })
            onChange({ bien: { ...data.bien, dpe: v } })
          }}
          options={['A','B','C','D','E','F','G','inconnu'].map(v => ({ value: v, label: `DPE ${v}` }))}
        />
        {(perf.dpeActuel === 'F' || perf.dpeActuel === 'G') && (
          <div className={`rounded-lg p-3 text-sm ${perf.dpeActuel === 'G' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-orange-50 border border-orange-200 text-orange-700'}`}>
            {perf.dpeActuel === 'G'
              ? '🚨 DPE G — bien interdit à la location depuis janvier 2025. Impact fort sur la valeur de revente et l\'arbitrage.'
              : '⚠️ DPE F — interdiction à la location à partir de 2028. À intégrer dans la décision conserver/vendre.'}
          </div>
        )}
      </Section>
    </div>
  )
}

// ── STEP 5 — Valeur actuelle & scénario de vente ────────────────────────────
export function StepValeurActuelle({ data, onChange }: SPD) {
  const v = data.valeurActuelle
  const set = (patch: Partial<typeof v>) => onChange({ valeurActuelle: { ...v, ...patch } })

  return (
    <div className="space-y-6">
      <Section title="Valeur de marché estimée">
        <Grid2>
          <Input label="Valeur de marché estimée" type="number" value={v.valeurMarcheEstimee}
            onChange={e => set({ valeurMarcheEstimee: +e.target.value })} suffix="€" />
          <Input label="Frais de vente estimés" type="number" step="0.5" value={(v.fraisVentePct * 100).toFixed(1)}
            onChange={e => set({ fraisVentePct: +e.target.value / 100 })} suffix="% du prix de vente"
            hint="Agence, diagnostics... en général 5 à 8 %" />
        </Grid2>
        <Grid2>
          <Select label="Source de l'estimation" value={v.sourceValeur}
            onChange={e => set({ sourceValeur: e.target.value as typeof v.sourceValeur })}
            options={[
              { value: 'estimation_perso', label: 'Estimation personnelle' },
              { value: 'agence', label: "Avis d'agence" },
              { value: 'notaire', label: 'Estimation notariale' },
              { value: 'observatoire', label: 'Observatoire / comparables en ligne' },
            ]}
          />
          <Select label="Fiabilité de l'estimation" value={v.fiabiliteValeur}
            onChange={e => set({ fiabiliteValeur: e.target.value as typeof v.fiabiliteValeur })}
            options={[
              { value: 'haute', label: 'Haute' },
              { value: 'moyenne', label: 'Moyenne' },
              { value: 'faible', label: 'Faible' },
            ]}
          />
        </Grid2>
        {v.fiabiliteValeur === 'faible' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
            ⚠️ Une estimation peu fiable peut faire basculer le verdict conserver/vendre. Une expertise ou plusieurs avis d&apos;agence sont recommandés avant toute décision.
          </div>
        )}
      </Section>

      <Section title="Projet de cession">
        <Grid2>
          <Input label="Date de vente envisagée" type="date" value={v.dateVenteEnvisagee ?? ''}
            onChange={e => set({ dateVenteEnvisagee: e.target.value || undefined })} />
        </Grid2>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Réemploi prévu du produit de vente</label>
          <textarea
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 outline-none transition-all"
            rows={2}
            placeholder="Ex : réinvestissement dans un autre bien, placement financier, projet personnel..."
            value={v.reemploiPrevu ?? ''}
            onChange={e => set({ reemploiPrevu: e.target.value || undefined })}
          />
        </div>
      </Section>
    </div>
  )
}

// ── STEP 6 — Alternative de réemploi & objectif patrimonial ─────────────────
export function StepAlternativeObjectif({ data, onChange }: SPD) {
  const alt = data.alternativeReemploi
  const obj = data.objectifPatrimonial
  const setAlt = (patch: Partial<typeof alt>) => onChange({ alternativeReemploi: { ...alt, ...patch } })
  const setObj = (patch: Partial<typeof obj>) => onChange({ objectifPatrimonial: { ...obj, ...patch } })

  return (
    <div className="space-y-6">
      <Section title="Alternative de placement de référence">
        <p className="text-xs text-slate-500">
          Sert de point de comparaison pour le produit net de cession : à quoi renoncez-vous (ou que gagnez-vous) si vous vendez ?
        </p>
        <Grid2>
          <Select label="Support de référence" value={alt.typeSupport}
            onChange={e => setAlt({ typeSupport: e.target.value as typeof alt.typeSupport })}
            options={[
              { value: 'fonds_euros', label: 'Fonds euros' },
              { value: 'assurance_vie', label: 'Assurance-vie (UC)' },
              { value: 'etf_pea', label: 'ETF / PEA' },
              { value: 'scpi', label: 'SCPI' },
              { value: 'autre', label: 'Autre' },
            ]}
          />
          <Input label="Rendement net annuel attendu (après frais et fiscalité)" type="number" step="0.1" value={(alt.rendementAnnuelAttendu * 100).toFixed(1)}
            onChange={e => setAlt({ rendementAnnuelAttendu: +e.target.value / 100 })} suffix="%/an" />
        </Grid2>
        <p className="text-xs text-slate-400">
          Indiquez le rendement net que vous espérez réellement percevoir chaque année (après frais de gestion et fiscalité applicable), et non un rendement brut affiché.
        </p>
        <Grid2>
          <Input label="Horizon de placement" type="number" min={1} value={alt.horizonAns}
            onChange={e => setAlt({ horizonAns: +e.target.value })} suffix="ans" />
          <Select label="Niveau de risque" value={alt.niveauRisque}
            onChange={e => setAlt({ niveauRisque: e.target.value as typeof alt.niveauRisque })}
            options={[
              { value: 'faible', label: 'Faible' },
              { value: 'modere', label: 'Modéré' },
              { value: 'eleve', label: 'Élevé' },
            ]}
          />
        </Grid2>
        <Input label="Fiscalité applicable au support" value={alt.fiscaliteSupport ?? ''}
          placeholder="Ex : PFU 30 %, exonération après 8 ans..."
          onChange={e => setAlt({ fiscaliteSupport: e.target.value || undefined })} />
      </Section>

      <Section title="Objectif patrimonial">
        <Select label="Objectif principal" value={obj.objectifPrincipal}
          onChange={e => setObj({ objectifPrincipal: e.target.value as typeof obj.objectifPrincipal })}
          options={[
            { value: 'maximiser_rendement', label: 'Maximiser le rendement' },
            { value: 'reduire_risque', label: 'Réduire le risque / sécuriser' },
            { value: 'transmission', label: 'Préparer une transmission' },
            { value: 'liquidite', label: 'Dégager de la liquidité' },
            { value: 'autre', label: 'Autre' },
          ]}
        />
        <Input label="Horizon patrimonial souhaité" type="number" min={0} value={obj.horizonSouhaiteAns ?? ''}
          placeholder="Ex : 10" onChange={e => setObj({ horizonSouhaiteAns: e.target.value === '' ? undefined : +e.target.value })} suffix="ans" />
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Précisions (facultatif)</label>
          <textarea
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 outline-none transition-all"
            rows={2}
            placeholder="Toute information utile sur votre situation ou vos projets..."
            value={obj.commentaireLibre ?? ''}
            onChange={e => setObj({ commentaireLibre: e.target.value || undefined })}
          />
        </div>
      </Section>
    </div>
  )
}
