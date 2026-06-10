export interface TocItem {
  label: string
  id: string
}

export function TableOfContents({ items }: { items: TocItem[] }) {
  return (
    <nav aria-label="Sommaire" className="bg-[#F8F7F4] border border-slate-200 rounded-2xl px-6 py-5 mb-12">
      <p className="text-[#C9A96E] font-mono text-xs tracking-[0.2em] uppercase mb-3">Sommaire</p>
      <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
        {items.map((item, i) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="text-slate-600 hover:text-[#C9A96E] transition-colors">
              {i + 1}. {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
