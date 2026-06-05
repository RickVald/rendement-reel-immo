'use client'
import { ProjectInput } from '@/lib/calculator/types'
import { Input, Select, Toggle, Section, Grid2 } from '@/components/ui/FormField'
import { estimerFraisNotaire } from '@/lib/calculator'

type SP = { data: ProjectInput; onChange: (patch: Partial<ProjectInput>) => void }

// ── STEP 1 — Bien ────────────────────────────────────────────────────────────
export function Step1({ data, onChange }: SP) {
  const b = data.bien
  const set = (patch: Partial<typeof b>) => onChange({ bien: { ...b, ...patch } })
  return (
    <div className="space-y-6">
      <Section title="Type de bien">
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
          <Input label="Surface habitable (m²)" type="number" min={1} value={b.surface}
            onChange={e => set({ surface: +e.target.value })} suffix="m²" />
        </Grid2>
        <Grid2>
          <Input label="Ville" value={b.ville} onChange={e => set({ ville: e.target.value })} placeholder="Paris, Lyon..." />
          <Input label="Code postal" value={b.codePostal} onChange={e => set({ codePostal: e.target.value })} placeholder="75001" />
        </Grid2>
      </Section>
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
          <Input label="Année de construction" type="number" value={b.anneeConstruction}
            onChange={e => set({ anneeConstruction: +e.target.value })} />
          <Toggle label="En copropriété" checked={b.copropriete} onChange={v => set({ copropriete: v })} />
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

// ── STEP 2 — Acquisition ─────────────────────────────────────────────────────
export function Step2({ data, onChange }: SP) {
  const a = data.acquisition
  const set = (patch: Partial<typeof a>) => onChange({ acquisition: { ...a, ...patch } })
  const neuf = data.bien.etat === 'neuf'

  const handlePrixChange = (prix: number) => {
    set({ prixAchat: prix, fraisNotaire: Math.round(estimerFraisNotaire(prix, neuf)) })
  }

  const total = a.prixAchat + (a.fraisAgenceInclus ? 0 : a.fraisAgence) + a.fraisNotaire + a.fraisCourtage + a.fraisGarantieBancaire + a.fraisDossierBancaire + a.travauxInitiaux + a.mobilier + a.autresFrais
  return (
    <div className="space-y-6">
      <Section title="Prix d'achat">
        <Input label="Prix d'achat" type="number" value={a.prixAchat}
          onChange={e => handlePrixChange(+e.target.value)} suffix="€" hint="Prix FAI ou hors frais d'agence" />
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
            hint={neuf ? 'Neuf : ~2,5% auto-estimé' : 'Ancien : ~7,8% auto-estimé'} />
          <Input label="Frais de courtage" type="number" value={a.fraisCourtage}
            onChange={e => set({ fraisCourtage: +e.target.value })} suffix="€" />
          <Input label="Garantie bancaire" type="number" value={a.fraisGarantieBancaire}
            onChange={e => set({ fraisGarantieBancaire: +e.target.value })} suffix="€" />
          <Input label="Frais dossier bancaire" type="number" value={a.fraisDossierBancaire}
            onChange={e => set({ fraisDossierBancaire: +e.target.value })} suffix="€" />
        </Grid2>
      </Section>
      <Section title="Travaux et mobilier">
        <Grid2>
          <Input label="Travaux initiaux" type="number" value={a.travauxInitiaux}
            onChange={e => set({ travauxInitiaux: +e.target.value })} suffix="€" />
          <Input label="Mobilier (LMNP)" type="number" value={a.mobilier}
            onChange={e => set({ mobilier: +e.target.value })} suffix="€" />
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

  const tauxMensuel = f.tauxNominal / 12
  const n = f.dureeCredit
  const mensualite = n > 0 && tauxMensuel > 0
    ? (f.montantEmprunte * tauxMensuel) / (1 - Math.pow(1 + tauxMensuel, -n))
    : 0
  const assuranceMensuelle = (f.montantEmprunte * f.tauxAssurance) / 12

  return (
    <div className="space-y-6">
      <Section title="Structure du financement">
        <Grid2>
          <Input label="Apport personnel" type="number" value={f.apport}
            onChange={e => {
              const apport = +e.target.value
              set({ apport, montantEmprunte: Math.max(0, a.prixAchat - apport) })
            }} suffix="€" />
          <Input label="Montant emprunté" type="number" value={f.montantEmprunte}
            onChange={e => set({ montantEmprunte: +e.target.value })} suffix="€" />
        </Grid2>
      </Section>
      <Section title="Conditions du prêt">
        <Grid2>
          <Input label="Durée du crédit" type="number" value={f.dureeCredit / 12}
            onChange={e => set({ dureeCredit: +e.target.value * 12 })} suffix="ans" hint="En années" />
          <Input label="Taux nominal" type="number" step="0.01" value={(f.tauxNominal * 100).toFixed(2)}
            onChange={e => set({ tauxNominal: +e.target.value / 100 })} suffix="%" />
          <Input label="Taux assurance emprunteur" type="number" step="0.01" value={(f.tauxAssurance * 100).toFixed(2)}
            onChange={e => set({ tauxAssurance: +e.target.value / 100 })} suffix="% / an" />
          <Select label="Différé" value={f.differePeriode}
            onChange={e => set({ differePeriode: e.target.value as typeof f.differePeriode })}
            options={[
              { value: 'aucun', label: 'Aucun différé' },
              { value: 'partiel', label: 'Différé partiel' },
              { value: 'total', label: 'Différé total' },
            ]}
          />
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

// ── STEP 4 — Location ────────────────────────────────────────────────────────
export function Step4({ data, onChange }: SP) {
  const l = data.location
  const set = (patch: Partial<typeof l>) => onChange({ location: { ...l, ...patch } })
  return (
    <div className="space-y-6">
      <Section title="Type et loyers">
        <Grid2>
          <Select label="Type de location" value={l.type}
            onChange={e => set({ type: e.target.value as typeof l.type })}
            options={[
              { value: 'nue', label: 'Location nue (longue durée)' },
              { value: 'meublee', label: 'Location meublée longue durée' },
              { value: 'colocation', label: 'Colocation' },
              { value: 'courte_duree', label: 'Courte durée (Airbnb...)' },
              { value: 'bail_mobilite', label: 'Bail mobilité' },
            ]}
          />
          <Input label="Loyer mensuel hors charges" type="number" value={l.loyerMensuelHC}
            onChange={e => set({ loyerMensuelHC: +e.target.value })} suffix="€/mois" />
        </Grid2>
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
          <Toggle label="Garantie loyers impayés (GLI)" checked={l.gli} onChange={v => set({ gli: v })} />
        </Grid2>
      </Section>
    </div>
  )
}

// ── STEP 5 — Charges ─────────────────────────────────────────────────────────
export function Step5({ data, onChange }: SP) {
  const c = data.charges
  const set = (patch: Partial<typeof c>) => onChange({ charges: { ...c, ...patch } })
  return (
    <div className="space-y-6">
      <Section title="Charges obligatoires">
        <Grid2>
          <Input label="Taxe foncière" type="number" value={c.taxeFonciere}
            onChange={e => set({ taxeFonciere: +e.target.value })} suffix="€/an"
            hint="Disponible sur votre avis d'imposition" />
          {data.bien.copropriete && (
            <Input label="Charges de copropriété" type="number" value={c.chargesCoproAnnuelles}
              onChange={e => set({ chargesCoproAnnuelles: +e.target.value })} suffix="€/an" />
          )}
        </Grid2>
        {data.bien.copropriete && (
          <Input label="Part non récupérable des charges copro" type="number" step="5"
            value={c.partNonRecuperable * 100}
            onChange={e => set({ partNonRecuperable: +e.target.value / 100 })} suffix="%"
            hint="En général 30 à 50% des charges totales" />
        )}
      </Section>
      <Section title="Charges courantes">
        <Grid2>
          <Input label="Entretien courant annuel" type="number" value={c.entretienAnnuel}
            onChange={e => set({ entretienAnnuel: +e.target.value })} suffix="€/an" />
          <Input label="Frais de relocation" type="number" value={c.fraisRelocation}
            onChange={e => set({ fraisRelocation: +e.target.value })} suffix="€/changement locataire"
            hint="État des lieux, petites annonces..." />
          <Input label="Comptable / expert-comptable" type="number" value={c.comptableAnnuel}
            onChange={e => set({ comptableAnnuel: +e.target.value })} suffix="€/an"
            hint="Utile en LMNP réel ou SCI" />
          <Input label="Augmentation annuelle charges" type="number" step="0.5"
            value={(c.augmentationAnnuellePct * 100).toFixed(1)}
            onChange={e => set({ augmentationAnnuellePct: +e.target.value / 100 })} suffix="%"
            hint="Inflation sur les charges (ex : 2%)" />
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
        {(data.bien.dpe === 'E' || data.bien.dpe === 'F' || data.bien.dpe === 'G') && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-700 mb-3">
            ⚠️ DPE {data.bien.dpe} — prévoir des travaux de rénovation énergétique obligatoires.
          </div>
        )}
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
          <div key={i} className="flex gap-2 items-end bg-slate-50 rounded-lg p-3">
            <Input label="Libellé" value={item.libelle}
              onChange={e => { const items = [...t.grosTravauxItems]; items[i] = { ...items[i], libelle: e.target.value }; set({ grosTravauxItems: items }) }}
              className="flex-1" />
            <Input label="Année" type="number" min={1} max={duree} value={item.annee}
              onChange={e => { const items = [...t.grosTravauxItems]; items[i] = { ...items[i], annee: +e.target.value }; set({ grosTravauxItems: items }) }} />
            <Input label="Montant (€)" type="number" value={item.montant}
              onChange={e => { const items = [...t.grosTravauxItems]; items[i] = { ...items[i], montant: +e.target.value }; set({ grosTravauxItems: items }) }} />
            <button type="button" onClick={() => set({ grosTravauxItems: t.grosTravauxItems.filter((_, j) => j !== i) })}
              className="text-red-400 hover:text-red-600 pb-2 text-lg">×</button>
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
  const isLmnpReel = f.regime === 'lmnp_reel'
  return (
    <div className="space-y-6">
      <Section title="Régime fiscal">
        <Select label="Régime d'imposition" value={f.regime}
          onChange={e => set({ regime: e.target.value as typeof f.regime })}
          options={[
            { value: 'micro_foncier', label: 'Location nue — Micro-foncier (abattement 30%)' },
            { value: 'reel_foncier', label: 'Location nue — Réel (déduction charges réelles)' },
            { value: 'lmnp_micro_bic', label: 'LMNP — Micro-BIC (abattement 50%)' },
            { value: 'lmnp_reel', label: 'LMNP — Réel (amortissements)' },
            { value: 'sci_ir', label: 'SCI à l\'IR' },
            { value: 'sci_is', label: 'SCI à l\'IS (15% PME / 25%)' },
          ]}
        />
        <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
          {f.regime === 'micro_foncier' && 'Abattement forfaitaire de 30% sur les loyers. Simple mais moins avantageux si les charges dépassent 30% des loyers.'}
          {f.regime === 'reel_foncier' && 'Déduction des charges réelles (taxe foncière, intérêts, travaux, gestion...). Génère souvent un déficit foncier imputable sur le revenu global (max 10 700€/an).'}
          {f.regime === 'lmnp_micro_bic' && 'Abattement de 50% sur les recettes. Conditions : location meublée, recettes < 77 700€/an.'}
          {f.regime === 'lmnp_reel' && 'Amortissement du bien (30 ans) et du mobilier (7 ans). Permet souvent de ramener la base imposable à zéro pendant 10-15 ans. Nécessite un expert-comptable.'}
          {f.regime === 'sci_is' && 'Taux IS : 15% jusqu\'à 42 500€ de bénéfice, 25% au-delà. Utile pour la transmission. Attention : double imposition dividendes.'}
          {f.regime === 'sci_ir' && 'SCI transparente : les résultats sont imposés directement chez les associés selon leur TMI, comme en réel foncier.'}
        </div>
      </Section>
      <Section title="Situation fiscale personnelle">
        <Grid2>
          <Select label="Tranche marginale d'imposition (TMI)" value={String(f.tmi)}
            onChange={e => set({ tmi: +e.target.value })}
            options={[
              { value: '0', label: '0% (non imposable)' },
              { value: '0.11', label: '11%' },
              { value: '0.30', label: '30%' },
              { value: '0.41', label: '41%' },
              { value: '0.45', label: '45%' },
            ]}
          />
          <Input label="Autres revenus fonciers existants" type="number" value={f.autresRevenusFonciers}
            onChange={e => set({ autresRevenusFonciers: +e.target.value })} suffix="€/an"
            hint="Vos autres biens locatifs" />
        </Grid2>
        <Input label="Déficit foncier reportable disponible" type="number" value={f.deficitFoncierDisponible}
          onChange={e => set({ deficitFoncierDisponible: +e.target.value })} suffix="€"
          hint="Déficit des années précédentes non encore imputé" />
      </Section>
      {isLmnpReel && (
        <Section title="Amortissements LMNP réel">
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

// ── STEP 8 — Revente ──────────────────────────────────────────────────────────
export function Step8({ data, onChange }: SP) {
  const r = data.revente
  const set = (patch: Partial<typeof r>) => onChange({ revente: { ...r, ...patch } })
  const prixRevente = Math.round(data.acquisition.prixAchat * Math.pow(1 + r.revalorisationAnnuelle, r.dureeDetentionAns))
  return (
    <div className="space-y-6">
      <Section title="Durée de détention">
        <Grid2>
          <Input label="Durée de détention envisagée" type="number" min={1} max={30} value={r.dureeDetentionAns}
            onChange={e => set({ dureeDetentionAns: +e.target.value })} suffix="ans" />
          <Input label="Revalorisation annuelle du bien" type="number" step="0.5"
            value={(r.revalorisationAnnuelle * 100).toFixed(1)}
            onChange={e => set({ revalorisationAnnuelle: +e.target.value / 100 })} suffix="%/an"
            hint="Inflation immobilière locale estimée" />
        </Grid2>
        {prixRevente > 0 && (
          <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
            Prix de revente estimé dans {r.dureeDetentionAns} ans : <strong>{prixRevente.toLocaleString('fr-FR')} €</strong>
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
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-emerald-800 mb-1">✓ Prêt à analyser</p>
        <p className="text-sm text-emerald-700">
          Votre simulation sera calculée sur {r.dureeDetentionAns} ans avec {data.revente.dureeDetentionAns * 12} mois de projection détaillée.
          Rendement brut, net, net-net, TRI, VAN, cash-flow mensuel, verdict et analyse IA.
        </p>
      </div>
    </div>
  )
}
