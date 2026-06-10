export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-[#0B1B2B]">Import CSV</h1>
        <p className="text-sm text-slate-500 mt-1">Importer des organisations / contacts depuis un fichier CSV.</p>
      </div>

      <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
        <p className="text-sm text-slate-500">
          Fonctionnalité à venir une fois la base de données connectée (voir <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">CRM_DESIGN.md</code>, Phase 1).
        </p>
        <p className="text-xs text-slate-400 mt-2">
          Format prévu : colonnes organisation, segment, ville, contact, email, téléphone, source.
        </p>
        <button disabled className="mt-5 px-4 py-2 text-sm font-semibold rounded-lg bg-slate-100 text-slate-400 cursor-not-allowed">
          Choisir un fichier CSV
        </button>
      </div>
    </div>
  )
}
