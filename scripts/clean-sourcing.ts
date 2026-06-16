/**
 * Supprime toutes les données de test :
 * - SourcingResult (tous)
 * - ScanRun (tous)
 * - Organisations créées via sourcing (source = 'sourcing_pappers')
 * - Organisations du seed (source IS NULL ou source = 'seed')
 *
 * Run : npx tsx scripts/clean-sourcing.ts
 */
import 'dotenv/config'
import { prisma } from '../src/lib/db'

async function main() {
  // Compter avant
  const before = {
    orgs: await prisma.organisation.count(),
    sourcing: await prisma.sourcingResult.count(),
    scans: await prisma.scanRun.count(),
  }
  console.log('Avant :', before)

  // Lister les orgs pour confirmer ce qu'on va supprimer
  const orgs = await prisma.organisation.findMany({
    select: { id: true, nom: true, source: true },
    orderBy: { nom: 'asc' },
  })
  console.log('\nOrganisations en base :')
  orgs.forEach(o => console.log(' -', o.nom, '|', o.source ?? '(no source)'))

  // Supprimer sourcing results + scan runs
  const delSourcing = await prisma.sourcingResult.deleteMany({})
  const delScans = await prisma.scanRun.deleteMany({})

  // Supprimer les orgs du sourcing/seed (tout sauf celles avec une vraie source business)
  // Ajuste le filtre si tu veux garder certaines orgs
  const delOrgs = await prisma.organisation.deleteMany({
    where: {
      OR: [
        { source: 'sourcing_pappers' },
        { source: null },
        { source: 'seed' },
      ],
    },
  })

  console.log('\nSupprimé :')
  console.log(' -', delSourcing.count, 'SourcingResult')
  console.log(' -', delScans.count, 'ScanRun')
  console.log(' -', delOrgs.count, 'Organisation')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
