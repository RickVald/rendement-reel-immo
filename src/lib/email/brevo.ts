/**
 * Envoi d'emails transactionnels via l'API Brevo (https://api.brevo.com).
 *
 * Variables d'environnement nécessaires :
 * - BREVO_API_KEY        : clé API Brevo (Settings > SMTP & API > API Keys)
 * - BREVO_SENDER_EMAIL   : adresse expéditrice, doit être un expéditeur validé dans Brevo
 * - BREVO_SENDER_NAME    : nom affiché de l'expéditeur (optionnel)
 * - LEAD_NOTIFICATION_EMAIL : adresse(s) qui reçoivent les notifications de nouveaux leads
 *   (séparées par des virgules pour plusieurs destinataires)
 *
 * Si BREVO_API_KEY n'est pas configurée, l'envoi est silencieusement ignoré
 * (le lead reste enregistré dans le CRM) — utile en développement.
 */

interface SendEmailParams {
  to: string[]
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    console.warn('[brevo] BREVO_API_KEY non configurée — email non envoyé:', subject)
    return
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@rendementreelimmo.fr'
  const senderName = process.env.BREVO_SENDER_NAME || 'Rendement Réel Immo'

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: to.map(email => ({ email })),
        subject,
        htmlContent: html,
      }),
    })
    if (!res.ok) {
      const body = await res.text()
      console.error('[brevo] Échec envoi email:', res.status, body)
    }
  } catch (err) {
    console.error('[brevo] Erreur envoi email:', err)
  }
}

/** Adresses qui reçoivent les notifications de nouveaux leads CRM. */
export function getLeadNotificationRecipients(): string[] {
  const raw = process.env.LEAD_NOTIFICATION_EMAIL
  if (!raw) return []
  return raw.split(',').map(s => s.trim()).filter(Boolean)
}
