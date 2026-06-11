export interface SourceItem {
  label: string
  href: string
}

export function SourceBox({ sources, dateMaj }: { sources: SourceItem[]; dateMaj: string }) {
  return (
    <div className="bg-[#F8F7F4] border border-slate-200 rounded-xl px-5 py-4 my-8">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Sources officielles</p>
      <ul className="space-y-1.5">
        {sources.map((s) => (
          <li key={s.href}>
            <a href={s.href} target="_blank" rel="noreferrer" className="text-sm text-[#C9A96E] hover:underline break-words">
              {s.label} ↗
            </a>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-slate-400 mt-3">Informations vérifiées et à jour en {dateMaj}. La réglementation fiscale évolue : vérifiez les conditions actuelles auprès des sources ci-dessus ou d&apos;un professionnel.</p>
    </div>
  )
}
