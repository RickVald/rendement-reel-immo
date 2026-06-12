/**
 * Formatage monétaire pour les libellés exposés dans le rapport PDF.
 * Format manuel (espace classique) pour éviter U+202F (narrow no-break space)
 * produit par toLocaleString('fr-FR'), invisible/mal rendu en Helvetica/Arial dans react-pdf.
 */
export function fmtEur(n: number): string {
  const abs = Math.abs(Math.round(n))
  const s = abs.toString()
  const parts: string[] = []
  for (let i = s.length; i > 0; i -= 3) parts.unshift(s.slice(Math.max(0, i - 3), i))
  return `${n < 0 ? '-' : ''}${parts.join(' ')} €`
}
