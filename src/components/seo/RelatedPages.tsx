import Link from 'next/link'

export interface RelatedPage {
  title: string
  description: string
  href: string
}

export function RelatedPages({ items }: { items: RelatedPage[] }) {
  if (items.length === 0) return null
  return (
    <section className="py-12 md:py-16 bg-[#F8F7F4] border-t border-slate-200">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-4">À lire aussi</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-[#C9A96E] transition-colors"
            >
              <h3 className="font-playfair text-base font-bold text-[#0B1B2B] mb-1.5 leading-snug">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
