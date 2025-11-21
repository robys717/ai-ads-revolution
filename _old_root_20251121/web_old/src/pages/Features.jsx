export default function Features(){
  const feats = [
    {t:"Dashboard KPI", d:"Panoramica chiara di performance e trend."},
    {t:"API pronte", d:"/api/reports/summary e /api/reports/timeseries pronte all’integrazione."},
    {t:"Auth & Account", d:"Login/registrazione con JWT (attiva quando imposti DATABASE_URL)."},
    {t:"Scalabilità", d:"Postgres gestito (Neon), deploy su Render, CDN."},
    {t:"Sicurezza", d:"helmet, CORS, rate limit, no-store sugli endpoint JSON."},
    {t:"UI moderna", d:"React + Tailwind. Design minimal, leggibile e responsive."},
  ];
  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Funzionalità</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {feats.map((f,i)=>(
          <div key={i} className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 shadow-md">
            <h3 className="font-semibold">{f.t}</h3>
            <p className="text-slate-300 mt-1">{f.d}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
