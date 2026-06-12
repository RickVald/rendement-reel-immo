/**
 * Génère un pack d'audit pour revue externe du générateur de rapport PDF.
 *
 * Pour chaque scénario de `src/data/qa-scenarios.ts`, produit :
 *   audit-pack/scenario-XXX-<id>/input.json   — JSON d'entrée (ProjectInput)
 *   audit-pack/scenario-XXX-<id>/output.json  — JSON de sortie complet (ProjectAnalysis)
 *   audit-pack/scenario-XXX-<id>/rapport.pdf  — rapport PDF généré
 * ainsi qu'un `audit-pack/manifest.json` listant tous les scénarios.
 *
 * Usage : npx tsx scripts/generate-audit-pack.ts
 */
import { mkdir, writeFile, rm } from 'fs/promises'
import path from 'path'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { RapportPDF } from '../src/lib/pdf/RapportPDF'
import { analyser, validerAnalyse } from '../src/lib/calculator'
import { QA_SCENARIOS, applyScenario } from '../src/data/qa-scenarios'

const OUTPUT_DIR = path.join(process.cwd(), 'audit-pack')

async function main() {
  await rm(OUTPUT_DIR, { recursive: true, force: true })
  await mkdir(OUTPUT_DIR, { recursive: true })

  const manifest: Array<{
    id: string
    folder: string
    label: string
    description: string
    notes: string
    regime: string
    dispositif: string
    verdict: string
    validation: { passed: boolean; errors: string[]; warnings: string[] }
  }> = []

  for (let i = 0; i < QA_SCENARIOS.length; i++) {
    const scenario = QA_SCENARIOS[i]
    const folderName = `scenario-${String(i + 1).padStart(3, '0')}-${scenario.id}`
    const dir = path.join(OUTPUT_DIR, folderName)
    await mkdir(dir, { recursive: true })

    console.log(`[${i + 1}/${QA_SCENARIOS.length}] ${scenario.id} — ${scenario.label}`)

    const input = applyScenario(scenario.overrides)
    const analysis = analyser(input)
    const validation = validerAnalyse(analysis)

    await writeFile(path.join(dir, 'input.json'), JSON.stringify(input, null, 2))
    await writeFile(path.join(dir, 'output.json'), JSON.stringify(analysis, null, 2))

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const buffer = await renderToBuffer(React.createElement(RapportPDF, { analysis, ai: null }) as any)
      await writeFile(path.join(dir, 'rapport.pdf'), buffer)
    } catch (err) {
      console.error(`  ⚠ Échec génération PDF pour ${scenario.id} :`, err)
    }

    manifest.push({
      id: scenario.id,
      folder: folderName,
      label: scenario.label,
      description: scenario.description,
      notes: scenario.notes,
      regime: analysis.input.fiscalite.regime,
      dispositif: analysis.input.fiscalite.dispositif,
      verdict: analysis.verdict.label,
      validation: {
        passed: validation.passed,
        errors: validation.errors,
        warnings: validation.warnings,
      },
    })
  }

  await writeFile(path.join(OUTPUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2))
  console.log(`\n${QA_SCENARIOS.length} scénarios générés dans ${OUTPUT_DIR}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
