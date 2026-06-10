import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db'
import { ChangePasswordForm } from './ChangePasswordForm'
import { CreateUserForm } from './CreateUserForm'
import { UserRow } from './UserRow'

export const dynamic = 'force-dynamic'

const ROLES = [
  { role: 'Admin / fondateur', desc: 'Accès complet : pipeline, organisations, pilotes, paramètres, gestion des utilisateurs.' },
  { role: 'Sales', desc: 'Pipeline, organisations, contacts, activités, campagnes.' },
  { role: 'Customer Success', desc: 'Pilotes, organisations, activités (suivi usage et onboarding).' },
  { role: 'Dev / admin technique', desc: 'Paramètres, import, intégrations.' },
  { role: 'Lecture seule', desc: 'Consultation des dashboards et du pipeline, sans édition.' },
]

export default async function ParametresPage() {
  const session = await getSession()
  const isAdmin = session?.role === 'ADMIN'
  const users = isAdmin ? await prisma.user.findMany({ orderBy: { email: 'asc' } }) : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-[#0B1B2B]">Paramètres</h1>
        <p className="text-sm text-slate-500 mt-1">Compte, utilisateurs, rôles et intégrations.</p>
      </div>

      {/* Mon compte */}
      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="px-5 py-3 border-b border-slate-200">
          <h2 className="font-bold text-sm text-[#0B1B2B]">Mon compte</h2>
          {session && <p className="text-xs text-slate-500 mt-0.5">{session.email} · {session.role === 'ADMIN' ? 'Admin' : 'Lecture seule'}</p>}
        </div>
        <div className="px-5 py-4">
          <ChangePasswordForm />
        </div>
      </div>

      {/* Utilisateurs (admin uniquement) */}
      {isAdmin && (
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="px-5 py-3 border-b border-slate-200">
            <h2 className="font-bold text-sm text-[#0B1B2B]">Utilisateurs</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Crée un compte pour un membre de l&apos;équipe ou réinitialise un mot de passe oublié (pas encore d&apos;email automatique — l&apos;envoi de l&apos;identifiant se fait à la main).
            </p>
          </div>
          <ul className="divide-y divide-slate-100">
            {users.map(u => (
              <UserRow key={u.id} id={u.id} email={u.email} role={u.role} name={u.name} isSelf={u.id === session?.userId} />
            ))}
          </ul>
          <div className="px-5 py-4 border-t border-slate-200">
            <h3 className="text-xs font-bold text-[#0B1B2B] uppercase tracking-wide mb-3">Créer un nouvel utilisateur</h3>
            <CreateUserForm />
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="px-5 py-3 border-b border-slate-200">
          <h2 className="font-bold text-sm text-[#0B1B2B]">Rôles prévus</h2>
        </div>
        <ul className="divide-y divide-slate-100">
          {ROLES.map(r => (
            <li key={r.role} className="px-5 py-3">
              <p className="text-sm font-medium text-[#0B1B2B]">{r.role}</p>
              <p className="text-xs text-slate-500 mt-0.5">{r.desc}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
        <p className="text-sm text-slate-500">
          Séquences d&apos;emails et intégrations (Brevo, Saleshandy, Stripe) seront configurées ici dans une prochaine étape — voir <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">CRM_DESIGN.md</code>.
        </p>
      </div>
    </div>
  )
}
