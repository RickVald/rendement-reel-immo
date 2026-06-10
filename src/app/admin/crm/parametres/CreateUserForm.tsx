'use client'

import { useActionState } from 'react'
import { createUserAction, type ActionState } from './actions'

const initialState: ActionState = {}

export function CreateUserForm() {
  const [state, formAction, pending] = useActionState(createUserAction, initialState)

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
          <input type="email" name="email" required className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Nom (optionnel)</label>
          <input type="text" name="name" className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Rôle</label>
          <select name="role" defaultValue="VIEWER" className="w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-2">
            <option value="VIEWER">Lecture seule (Viewer)</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Mot de passe temporaire</label>
          <input type="password" name="password" required minLength={10} autoComplete="new-password" className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2" />
        </div>
      </div>

      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state.success && <p className="text-xs text-emerald-600">{state.success}</p>}

      <button
        type="submit"
        disabled={pending}
        className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#0B1B2B] text-white hover:bg-[#0B1B2B]/90 transition-colors disabled:opacity-50"
      >
        {pending ? 'Création...' : 'Créer le compte'}
      </button>
      <p className="text-xs text-slate-400">
        Communique l&apos;email et le mot de passe temporaire à la personne concernée — elle pourra le changer dans &laquo;&nbsp;Mon compte&nbsp;&raquo; après connexion.
      </p>
    </form>
  )
}
