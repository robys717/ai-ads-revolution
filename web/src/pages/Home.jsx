export default function Home(){
  return (
    <div className="container space-y-6">
      <section className="card">
        <h1 className="text-2xl font-bold">AI Ads Revolution</h1>
        <p className="text-slate-300 mt-2">La piattaforma ADS con Intelligenza: crea, ottimizza e misura KPI reali.</p>
        <ul className="mt-4 list-disc list-inside text-slate-300">
          <li>Dashboard KPI (spesa, clic, conversioni, CTR)</li>
          <li>Grafici trend giornalieri</li>
          <li>API pronte per integrazione con Google Ads / Meta</li>
        </ul>
      </section>
      <section className="grid sm:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-semibold mb-2">Pronto all’uso</h2>
          <p className="text-slate-300">Deploy su Render, HTTPS, cold start gestito.</p>
        </div>
        <div className="card">
          <h2 className="font-semibold mb-2">Scalabile</h2>
          <p className="text-slate-300">Backend Express, Postgres opzionale, rate-limit e helmet.</p>
        </div>
      </section>
    </div>
  );
}
