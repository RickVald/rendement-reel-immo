import { chromium, type Page } from 'playwright'
import path from 'node:path'
import { mkdir } from 'node:fs/promises'

const BASE_URL = 'http://localhost:3000'
const OUT_DIR = path.join(process.cwd(), 'audit-pack-bc', 'form', 'screenshots')

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
} as const

async function selectTypeAnalyse(page: Page, titleSubstring: string) {
  await page.goto(`${BASE_URL}/simulateur`, { waitUntil: 'networkidle' })
  const card = page.getByRole('button', { name: new RegExp(titleSubstring) })
  await card.click()
}

async function captureSteps(opts: {
  parcours: 'parcours-b' | 'parcours-c'
  typeAnalyseTitle: string
  nbSteps: number
}) {
  const { parcours, typeAnalyseTitle, nbSteps } = opts

  for (const [device, viewport] of Object.entries(VIEWPORTS)) {
    const browser = await chromium.launch()
    const page = await browser.newPage({ viewport })

    await selectTypeAnalyse(page, typeAnalyseTitle)
    await page.waitForTimeout(800)

    for (let step = 1; step <= nbSteps; step++) {
      await page.waitForTimeout(400)
      const outDir = path.join(OUT_DIR, device, parcours)
      await mkdir(outDir, { recursive: true })
      await page.screenshot({ path: path.join(outDir, `step-${step}.png`), fullPage: true })

      if (step < nbSteps) {
        const nextBtn = page.getByRole('button', { name: /Suivant/ })
        await nextBtn.click()
      }
    }

    await browser.close()
    console.log(`OK ${parcours} / ${device} — ${nbSteps} captures`)
  }
}

async function main() {
  await captureSteps({
    parcours: 'parcours-b',
    typeAnalyseTitle: 'Je possède déjà ce bien',
    nbSteps: 7,
  })
  await captureSteps({
    parcours: 'parcours-c',
    typeAnalyseTitle: 'Je veux un bilan de cohérence',
    nbSteps: 9,
  })
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
