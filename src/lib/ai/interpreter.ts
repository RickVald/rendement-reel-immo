import Anthropic from '@anthropic-ai/sdk'
import type { ProjectAnalysis, AIInterpretation } from '../calculator/types'

const client = new Anthropic()

/**
 * Génère une interprétation IA du résultat de simulation.
 * Utilisé dans /api/ai-interpretation/route.ts
 */
export async function genererInterpretationIA(
  analyse: ProjectAnalysis
): Promise<AIInterpretation> {
  const { summary, verdict, input, prixMax } = analyse

  const prompt = `Tu es un expert en investissement immobilier locatif en France.
Tu analyses les résultats d'une simulation financière et tu fournis une interprétation claire, factuelle et utile pour un investisseur particulier.

Voici les résultats de la simulation :

**Bien**: ${input.bien.type} - ${input.bien.ville} (${input.bien.codePostal}) - DPE ${input.bien.dpe} - ${input.bien.surface}m²
**Prix d'achat**: ${input.acquisition.prixAchat.toLocaleString('fr-FR')} €
**Coût total acquisition**: ${summary.coutTotalAcquisition.toLocaleString('fr-FR')} €
**Loyer mensuel HC**: ${input.location.loyerMensuelHC} €
**Régime fiscal**: ${input.fiscalite.regime} - TMI ${input.fiscalite.tmi * 100}%

**Résultats clés** :
- Rendement brut : ${(summary.rendementBrut * 100).toFixed(2)}%
- Rendement net : ${(summary.rendementNet * 100).toFixed(2)}%
- Rendement net-net : ${(summary.rendementNetNet * 100).toFixed(2)}%
- Cash-flow mensuel moyen : ${summary.cashflowMensuelMoyen} €/mois
- TRI projet : ${summary.triNonSignificatif ? 'Non significatif (surfinancement — emprunt > coût total)' : `${((summary.tri ?? 0) * 100).toFixed(2)}%`}
- VAN : ${summary.van.toLocaleString('fr-FR')} €
- Effort d'épargne mensuel : ${summary.effortEpargne} €/mois
- Dépendance à la revente : ${summary.dependanceRevente ? 'Oui' : 'Non'}
- Prix maximum recommandé : ${prixMax.prixMaximum.toLocaleString('fr-FR')} € (négociation de ${prixMax.negociationEuros.toLocaleString('fr-FR')} €)

**Verdict** : ${verdict.label} (score ${verdict.score}/100)
**Alertes** : ${verdict.alertes.join(' | ') || 'Aucune alerte majeure'}

Réponds en JSON strictement valide avec cette structure exacte :
{
  "verdict_explain": "explication du verdict en 2-3 phrases claires et directes, sans jargon inutile",
  "points_forts": ["point 1", "point 2", "point 3"],
  "points_faibles": ["point 1", "point 2", "point 3"],
  "conseils_negociation": ["conseil concret 1", "conseil concret 2", "conseil concret 3"],
  "questions_notaire": ["question 1", "question 2", "question 3"],
  "comparaison_alternatives": "comparaison en 1-2 phrases avec d'autres placements (ETF, assurance-vie, SCPI)"
}

Règles :
- Sois factuel et chiffré, pas vendeur
- Mentionne les risques réels
- Les conseils de négociation doivent être actionnables
- Limite chaque item à 1-2 phrases maximum
- Ne donne pas de conseil fiscal personnalisé, reste sur l'analyse des chiffres`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  // Parse JSON response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Réponse IA invalide')

  return JSON.parse(jsonMatch[0]) as AIInterpretation
}
