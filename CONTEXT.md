# CONTEXT.md — Rendement Réel Immo
> Dernière mise à jour : 2026-06-06

---

## 1. Vision produit

Outil de simulation immobilière professionnel destiné à deux cibles :
- **CGP / professionnels** : licence (accès illimité, marque blanche future)
- **Particuliers** : achat à l'unité d'un rapport PDF complet

**Principe directeur** : le rapport généré doit être assez complet et béton pour qu'un professionnel puisse le présenter à son client sans le relire. Aucune question ne doit se poser à la lecture.

L'outil prime sur le SEO. Les pages de contenu SEO sont déférées jusqu'à ce que le simulateur soit parfait.

---

## 2. Stack technique

| Élément | Valeur |
|---|---|
| Framework | Next.js (app router) |
| Langage | TypeScript |
| Style | Tailwind CSS 4 |
| Graphiques | Recharts 3.8.1 (`ComposedChart`, `BarChart`, `LineChart`, `Cell` pour couleur par barre) |
| IA | `@anthropic-ai/sdk` — claude-haiku-4-5 via `/api/ai-interpretation` |
| State inter-pages | `sessionStorage` clé `rri_analysis` (JSON de `ProjectAnalysis`) |

---

## 3. Architecture des fichiers

```
src/
├── app/
│   ├── page.tsx                        # Landing page
│   ├── simulateur/page.tsx             # Wrapper SimulatorForm
│   ├── resultats/page.tsx              # Wrapper ResultsView
│   ├── api/
│   │   ├── analyze/route.ts            # POST → appelle analyser()
│   │   └── ai-interpretation/route.ts  # POST → claude-haiku
│   ├── robots.ts / sitemap.ts
│   └── globals.css / layout.tsx
├── components/
│   ├── simulator/
│   │   ├── SimulatorForm.tsx           # Orchestrateur 8 étapes
│   │   ├── StepIndicator.tsx
│   │   └── steps/index.tsx             # Step1…Step8
│   ├── results/
│   │   └── ResultsView.tsx             # Compte rendu 4 onglets (~750 lignes)
│   └── ui/FormField.tsx
├── data/
│   └── defaults.ts                     # DEFAULT_INPUT (valeurs pré-remplies)
└── lib/
    └── calculator/
        ├── types.ts                    # Toutes les interfaces I/O
        ├── cashflow.ts                 # genererTableauAnnuel + calculerCoutTotal
        ├── credit.ts                   # Tableau d'amortissement crédit
        ├── fiscalite.ts                # calculerImpotAnnee, calculerFiscalitePlusValue
        ├── tri-van.ts                  # TRI, VAN, rendements, prix max
        ├── verdict.ts                  # genererVerdict, genererScenarios, scorerRisqueDpe
        └── index.ts                    # analyser() — point d'entrée unique
```

---

## 4. Types principaux (`types.ts`)

### Inputs

```
ProjectInput
├── BienInput         (type, ville, surface, DPE, état)
├── AcquisitionInput  (prixAchat, frais notaire, travaux initiaux, mobilier)
├── FinancementInput  (apport, montantEmprunte, duree, taux, différé)
├── LocationInput     (loyer, vacance, gestion, GLI, PNO, revalorisation)
├── ChargesInput      (taxe foncière, copro, entretien, CFE…)
├── TravauxFutursInput (récurrents, gros travaux, DPE)
├── FiscaliteInput    (regime, TMI, déficit foncier disponible, amortissements)
└── ReventeInput      (dureeDetentionAns, revalorisationAnnuelle ✅ client-selectable Step8,
                       fraisVentePct, tauxActualisation, rendementAlternatif)
```

> ⚠️ `revalorisationAnnuelle` est **déjà saisissable par le client** dans le Step 8 du simulateur.

### Outputs clés

- `YearlyRow` — 1 ligne par année sur la durée de détention
  - Champs fiscaux détaillés ajoutés : `chargesDeduites`, `amortissements`, `baseImposable`, `ir`, `ps`
- `SummaryKPIs` — rendements, TRI, VAN, cashflow, prix max, dépendance revente
- `Verdict` — score /100, label, couleur, alertes, recommandations
- `ScenarioResult` — pessimiste / central / optimiste
- `AIInterpretation` — rendu par claude-haiku (verdict_explain, points_forts, points_faibles, conseils_negociation, questions_notaire)
- `ProjectAnalysis` — objet racine stocké en sessionStorage

---

## 5. Moteur de calcul

### Régimes fiscaux supportés (6)

| Clé | Libellé |
|---|---|
| `micro_foncier` | Location nue — Micro-foncier (abattement 30 %) |
| `reel_foncier` | Location nue — Réel (charges déductibles) |
| `lmnp_micro_bic` | LMNP — Micro-BIC (abattement 50 %) |
| `lmnp_reel` | LMNP — Réel (amortissements) |
| `sci_ir` | SCI à l'IR |
| `sci_is` | SCI à l'IS (15 % / 25 %) |

### Scoring /100

| Composante | Poids |
|---|---|
| TRI | 25 |
| Cash-flow | 20 |
| Rendement net-net | 15 |
| VAN | 15 |
| Marge de sécurité | 10 |
| Risque DPE | 10 |
| Indépendance revente | 5 |

### Pipeline `analyser(input)`

1. `calculerCoutTotal()` — coût total acquisition
2. `calculerCredit()` — tableau d'amortissement crédit
3. `genererTableauAnnuel()` — 20 ans de cashflows + impôts + patrimoine
4. `calculerTRIParAnnee()` — TRI si revente chaque année
5. KPIs globaux : TRI, VAN, rendements brut/net/net-net, cashflow mensuel moyen
6. `genererVerdict()` → score + label + alertes
7. `genererScenarios()` → pessimiste/central/optimiste
8. `buildIndicateurs()` → résumé 5 KPIs avec niveau bon/moyen/mauvais

---

## 6. Compte rendu — 4 onglets (`ResultsView.tsx`)

### Tab 1 — Synthèse
- Score /100 avec barre de décomposition par composante
- Grille KPIs : rendement brut/net/net-net, TRI, VAN, cashflow mensuel moyen, effort d'épargne, coût total acquisition
- Alertes (danger orange/rouge) + Recommandations
- Tableau des 3 scénarios (pessimiste/central/optimiste) avec rendement, cashflow, TRI, VAN, patrimoine final
- Prix maximum à payer (objectif rendement net ≥ 5 %)
- Analyse IA (claude-haiku) : verdict, points forts/faibles, conseils négociation
- CTA + Disclaimer

### Tab 2 — Projection & Tableaux
- Graphique cashflow annuel (barres, vert/rouge selon signe)
- Graphique patrimoine net cumulé (ligne)
- Graphique TRI si revente chaque année (ligne)
- Tableau annuel complet 20 ans — 14 colonnes : loyers, vacance, charges, travaux, intérêts, capital, mensualités, impôts, cashflow, cashflow cumulé, capital restant, valeur bien, patrimoine net, produit net revente

### Tab 3 — Fiscalité & Dette
- Carte régime fiscal (libellé + description détaillée)
- Tableau fiscal annuel : revenus imposables, charges déduites, amortissements, base imposable, IR, PS, total impôts
- Récapitulatif crédit (mensualité, durée, coût total, intérêts totaux)
- Tableau d'amortissement crédit (toutes les lignes)

### Tab 4 — Hypothèses
- 8 sections numérotées (bien, acquisition, financement, location, charges, travaux futurs, fiscalité, revente)
- Date de simulation + méthodologie
- Questions IA pour le notaire
- Disclaimer légal

---

## 7. Serveur de développement

```powershell
# Lancer depuis PowerShell
Set-Location 'C:\Users\rrica\Desktop\REMY\SITE RENDEMENT IMMO\rendement-reel-immo'
npm run dev
# → http://localhost:3000
```

Config `.claude/launch.json` dans le dossier parent BOS-main :
```json
{
  "name": "rendement-reel-immo",
  "runtimeExecutable": "powershell",
  "runtimeArgs": ["-Command", "Set-Location 'C:\\Users\\rrica\\Desktop\\REMY\\SITE RENDEMENT IMMO\\rendement-reel-immo'; npm run dev"],
  "port": 3000,
  "autoPort": false
}
```

Si port 3000 occupé : `Get-Process -Name "node" | Stop-Process -Force`

---

## 8. Bugs résolus (historique)

| Bug | Cause | Fix |
|---|---|---|
| `Cannot read properties of undefined` sur `ai.points_forts.map()` | `ai` peut être null pendant le chargement | Guard `ai?.verdict_explain ?` + `(ai.points_forts ?? []).map()` |
| Erreur TypeScript Recharts Tooltip | `ValueType` peut être `undefined` | Supprimer les types explicites, utiliser `Number(v ?? 0)` |
| Preview sur mauvais projet | Chemin avec espaces mal parsé PowerShell | `Start-Process` + `autoPort: false` |
| Port 3000 déjà occupé | Process node zombie | `Get-Process -Name "node" \| Stop-Process -Force` |

---

## 9. Tâches en cours / à venir

### ✅ Fait
- Moteur de calcul complet (6 régimes, TRI/VAN, scénarios, scoring)
- `YearlyRow` enrichi avec 5 champs de détail fiscal (ir, ps, amortissements, baseImposable, chargesDeduites)
- `revalorisationAnnuelle` client-selectable dans Step 8
- `ResultsView` 4 onglets professionnel (~750 lignes)

### 🔜 Priorité haute (outil)
- [ ] **Comparaison régimes fiscaux** — nouvelle section Tab 3 : re-calculer les 6 régimes sur le même bien et afficher tableau comparatif (rendement net-net, cashflow mensuel moyen, total impôts 20 ans) avec le régime sélectionné mis en valeur. Nécessite `comparerRegimesFiscaux(input, creditSchedule, yearlyTable)` dans `cashflow.ts` ou `index.ts`.
- [ ] **Tableau décomposition des charges** — justifier brut → net → net-net en Année 1
- [ ] **Tableau de revente détaillé** — plus-value, fiscalité PV, produit net, par année cible

### 🔜 Priorité normale
- [ ] Export PDF du rapport (react-pdf ou génération serveur)
- [ ] Pages SEO (3 dossiers vides dans `app/`) — déféré après qualité outil

### 🔜 Infrastructure
- [ ] Domaine à choisir + déploiement Vercel
- [ ] Système de paiement (licence CGP + achat unitaire rapport)

---

## 10. Règles de développement

- **Ne jamais résumer** — le rapport doit tout contenir, aucune question ne doit rester
- **Tableaux de justification obligatoires** — chaque KPI doit avoir son tableau source visible
- Recharts : utiliser `Cell` pour colorier les barres individuellement (cashflow vert/rouge)
- Les types TypeScript Recharts (ValueType, NameType) peuvent être undefined — toujours gérer le cas null
- sessionStorage key : `rri_analysis` (JSON stringifié de `ProjectAnalysis`)
- L'API `/api/analyze` est le seul point d'entrée pour le calcul côté serveur
