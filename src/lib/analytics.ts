/**
 * Wrapper analytics minimal — brancher Plausible ou GA4 ici le moment venu.
 * Utilisation côté client : import { track } from '@/lib/analytics'
 *
 * Events cibles :
 *   landing_view, cta_report_example_click, pdf_example_download,
 *   demo_form_start, demo_form_submit, simulator_click,
 *   pricing_click, calendar_booking_completed
 */
export function track(
  event: string,
  props?: Record<string, string | number | boolean>
) {
  if (typeof window === 'undefined') return

  // Plausible
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof (window as any).plausible === 'function') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).plausible(event, props ? { props } : undefined)
  }

  // Google Analytics 4
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof (window as any).gtag === 'function') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).gtag('event', event, props)
  }

  // Dev fallback
  if (process.env.NODE_ENV === 'development') {
    console.debug('[analytics]', event, props)
  }
}
