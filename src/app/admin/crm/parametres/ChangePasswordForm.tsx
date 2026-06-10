'use client'

import { useActionState } from 'react'
import { changePasswordAction, type ActionState } from './actions'

const initialState: ActionState = {}

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initialState)

  return (
    <form action={formAction} className="space-y-3 max-w-sm">
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Mot de passe actuel</label>
        <input
          type="password"
          name="currentPassword"
          required
          autoComplete="current-password"
          className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Nouveau mot de passe</label>
        <input
          type="password"
          name="newPassword"
          required
          minLength={10}
          autoComplete="new-password"
          className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Confirmer le nouveau mot de passe</label>
        <input
          type="password"
          name="confirmPassword"
          required
          minLength={10}
          autoComplete="new-password"
          className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2"
        />
      </div>

      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state.success && <p className="text-xs text-emerald-600">{state.success}</p>}

      <button
        type="submit"
        disabled={pending}
        className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#0B1B2B] text-white hover:bg-[#0B1B2B]/90 transition-colors disabled:opacity-50"
      >
        {pending ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
      </button>
    </form>
  )
}
