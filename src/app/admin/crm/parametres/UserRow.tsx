'use client'

import { useActionState, useState } from 'react'
import { resetUserPasswordAction, deleteUserAction, type ActionState } from './actions'

const initialState: ActionState = {}

export function UserRow({
  id, email, role, name, isSelf,
}: {
  id: string
  email: string
  role: string
  name: string | null
  isSelf: boolean
}) {
  const [open, setOpen] = useState(false)
  const [resetState, resetAction, resetPending] = useActionState(resetUserPasswordAction, initialState)
  const [deleteState, deleteAction, deletePending] = useActionState(deleteUserAction, initialState)

  return (
    <li className="px-5 py-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm font-medium text-[#0B1B2B]">
            {email}{isSelf && <span className="text-xs text-slate-400 font-normal"> (vous)</span>}
          </p>
          <p className="text-xs text-slate-500">{name ?? '—'} · {role === 'ADMIN' ? 'Admin' : 'Lecture seule'}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button type="button" onClick={() => setOpen(o => !o)} className="text-xs text-[#C9A96E] hover:underline">
            {open ? 'Annuler' : 'Réinitialiser le mot de passe'}
          </button>
          {!isSelf && (
            <form action={deleteAction}>
              <input type="hidden" name="userId" value={id} />
              <button type="submit" disabled={deletePending} className="text-xs text-red-500 hover:underline disabled:opacity-50">
                Supprimer
              </button>
            </form>
          )}
        </div>
      </div>

      {open && (
        <form action={resetAction} className="mt-3 flex flex-wrap items-end gap-2">
          <input type="hidden" name="userId" value={id} />
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Nouveau mot de passe</label>
            <input type="password" name="newPassword" required minLength={10} autoComplete="new-password" className="text-sm rounded-lg border border-slate-200 px-3 py-2" />
          </div>
          <button
            type="submit"
            disabled={resetPending}
            className="text-sm font-semibold px-3 py-2 rounded-lg bg-[#0B1B2B] text-white hover:bg-[#0B1B2B]/90 transition-colors disabled:opacity-50"
          >
            {resetPending ? '...' : 'Valider'}
          </button>
        </form>
      )}

      {resetState.error && <p className="text-xs text-red-600 mt-1">{resetState.error}</p>}
      {resetState.success && <p className="text-xs text-emerald-600 mt-1">{resetState.success}</p>}
      {deleteState.error && <p className="text-xs text-red-600 mt-1">{deleteState.error}</p>}
    </li>
  )
}
