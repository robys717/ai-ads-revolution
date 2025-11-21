export default function BudgetPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Budget & Spesa</h1>
        <p className="text-sm text-slate-400 mb-6">
          Controlla la spesa delle tue campagne e imposta limiti di 
sicurezza.
        </p>

        <div className="grid gap-6 sm:grid-cols-3 mb-10">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl 
p-4">
            <h3 className="text-xs text-slate-400 mb-1">Spesa di oggi</h3>
            <p className="text-2xl font-bold">€ 0,00</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Nessuna impression ancora registrata.
            </p>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-2xl 
p-4">
            <h3 className="text-xs text-slate-400 mb-1">Spesa mensile</h3>
            <p className="text-2xl font-bold">€ 0,00</p>
            <p className="text-[11px] text-slate-500 mt-1">
              I dati appariranno man mano che le campagne girano.
            </p>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-2xl 
p-4">
            <h3 className="text-xs text-slate-400 mb-1">Limite di 
sicurezza</h3>
            <p className="text-2xl font-bold">€ 0,00</p>
            <p className="text-[11px] text-slate-500 mt-1">
              In futuro potrai impostare qui il tuo tetto massimo.
            </p>
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-2xl 
p-4 mb-6">
          <h2 className="text-sm font-semibold mb-2">
            Regole automatiche (in arrivo)
          </h2>
          <p className="text-xs text-slate-400 mb-2">
            AI Ads Revolution ti permetterà di creare regole intelligenti 
come:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-400 
space-y-1">
            <li>“Se il costo per conversione supera € 20, metti in pausa 
la campagna”.</li>
            <li>“Se il CTR scende sotto l&apos;1%, abbassa il budget del 
30%”.</li>
            <li>“Se il ROAS è sopra il target, aumenta il budget del 
15%”.</li>
          </ul>
        </div>

        <p className="text-[11px] text-slate-500">
          Più avanti questa pagina sarà collegata al database reale e al 
motore
          AI che ottimizza la spesa in automatico.
        </p>
      </div>
    </div>
  );
}

