'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function GlobalSearch() {
  const router = useRouter()
  const [q, setQ] = useState('')

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        if (q.trim()) router.push(`/admin/crm/recherche?q=${encodeURIComponent(q.trim())}`)
      }}
      className="relative max-w-md"
    >
      <input
        type="search"
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Rechercher une organisation, un contact, une ville, un segment, une objection…"
        className="w-full text-sm rounded-lg border border-slate-200 bg-white px-4 py-2.5 pl-9 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E]"
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">⌕</span>
    </form>
  )
}
