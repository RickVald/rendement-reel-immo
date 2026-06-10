const ROLES = [
  { role: 'Admin / fondateur', desc: 'Accès complet : pipeline, organisations, pilotes, paramètres.' },
  { role: 'Sales', desc: 'Pipeline, organisations, contacts, activités, campagnes.' },
  { role: 'Customer Success', desc: 'Pilotes, organisations, activités (suivi usage et onboarding).' },
  { role: 'Dev / admin technique', desc: 'Paramètres, import, intégrations.' },
  { role: 'Lecture seule', desc: 'Consultation des dashboards et du pipeline, sans édition.' },
]

export default function ParametresPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-[#0B1B2B]">Paramètres</h1>
        <p className="text-sm text-slate-500 mt-1">Utilisateurs, rôles et intégrations — à activer lors du branchement de la base de données.</p>
      </div>

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
          Authentification, gestion des utilisateurs, séquences d&apos;emails et intégrations (Brevo, Saleshandy, Stripe) seront configurées ici une fois la base de données (Neon/Postgres + Prisma) connectée — voir <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">CRM_DESIGN.md</code>.
        </p>
      </div>
    </div>
  )
}
