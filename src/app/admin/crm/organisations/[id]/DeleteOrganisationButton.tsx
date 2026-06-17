'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteOrganisationAction } from './actions'

export function DeleteOrganisationButton({ orgId, orgNom }: { orgId: string; orgNom: string }) {
  const router = useRouter()
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    const res = await deleteOrganisationAction(orgId)
    if (res.error) {
      alert(res.error)
      setLoading(false)
    } else {
      router.push('/admin/crm/organisations')
    }
  }

  if (!confirm) {
    return (
      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="text-xs text-slate-400 hover:text-red-500 transition-colors"
      >
        Supprimer
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-red-500">Supprimer « {orgNom} » ?</span>
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="text-xs font-semibold px-3 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
      >
        {loading ? '...' : 'Confirmer'}
      </button>
      <button
        type="button"
        onClick={() => setConfirm(false)}
        className="text-xs text-slate-400 hover:text-[#0B1B2B] transition-colors"
      >
        Annuler
      </button>
    </div>
  )
}
