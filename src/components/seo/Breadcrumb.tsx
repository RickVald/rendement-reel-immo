import Link from 'next/link'
import { BreadcrumbJsonLd, type BreadcrumbItem } from './JsonLd'

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <>
      <BreadcrumbJsonLd items={[{ label: 'Accueil', href: '/' }, ...items]} />
      <nav aria-label="Fil d'Ariane" className="text-xs text-slate-400">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-[#C9A96E] transition-colors">Accueil</Link></li>
          {items.map((item, i) => (
            <li key={item.href} className="flex items-center gap-1.5">
              <span className="text-slate-300">/</span>
              {i === items.length - 1 ? (
                <span className="text-slate-500" aria-current="page">{item.label}</span>
              ) : (
                <Link href={item.href} className="hover:text-[#C9A96E] transition-colors">{item.label}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
