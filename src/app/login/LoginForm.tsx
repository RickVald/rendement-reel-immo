'use client'

import { useActionState } from 'react'
import { loginAction, type LoginState } from './actions'

const initialState: LoginState = {}

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div>
        <label htmlFor="email" className="block text-xs font-medium text-slate-500 mb-1.5">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E]"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-xs font-medium text-slate-500 mb-1.5">Mot de passe</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E]"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-[#0B1B2B] hover:bg-[#16283c] disabled:opacity-60 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
      >
        {pending ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  )
}
