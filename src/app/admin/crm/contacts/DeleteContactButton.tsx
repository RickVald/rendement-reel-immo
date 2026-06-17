'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteContactAction } from './actions'

export function DeleteContactButton({ contactId }: { contactId: string }) {
  const router = useRouter()
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    const res = await deleteContactAction(contactId)
    if (res.error) {
      alert(res.error)
      setLoading(false)
    } else {
      router.refresh()
    }
  }

  if (!confirm) {
    return (
      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="text-[11px] text-slate-300 hover:text-red-500 transition-colors"
        title="Supprimer ce contact"
      >
        ✕
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="text-[11px] font-semibold px-2 py-0.5 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
      >
        {loading ? '...' : 'Supprimer'}
      </button>
      <button
        type="button"
        onClick={() => setConfirm(false)}
        className="text-[11px] text-slate-400 hover:text-[#0B1B2B]"
      >
        Annuler
      </button>
    </div>
  )
}
