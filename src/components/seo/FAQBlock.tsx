import { FaqJsonLd, type FaqItem } from './JsonLd'

export function FAQBlock({ items, id }: { items: FaqItem[]; id?: string }) {
  return (
    <section id={id} className="py-12 md:py-16 border-t border-slate-200 scroll-mt-24">
      <div className="max-w-3xl mx-auto px-6">
        <FaqJsonLd items={items} />
        <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-4">Questions fréquentes</p>
        <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B1B2B] mb-8 leading-tight">
          Vos questions sur le sujet
        </h2>
        <div className="space-y-3">
          {items.map((item) => (
            <details key={item.question} className="group bg-[#F8F7F4] rounded-xl border border-slate-200 px-5 py-4">
              <summary className="font-semibold text-[#0B1B2B] cursor-pointer list-none flex items-center justify-between gap-4">
                {item.question}
                <span className="text-[#C9A96E] shrink-0 transition-transform group-open:rotate-45 text-xl leading-none">+</span>
              </summary>
              <p className="text-sm text-slate-600 leading-relaxed mt-3">{item.reponse}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
