export default function Home(){
  return (
    <main className="max-w-6xl mx-auto p-6">
      <section className="text-center py-20">
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">AI Ads Revolution</h1>
        <p className="mt-4 text-slate-300 text-lg md:text-xl">
          La piattaforma pubblicitaria con Intelligenza Reale: misura, ottimizza e scala le tue campagne.
        </p>
        <div className="mt-8 flex gap-3 justify-center">
          <a href="/dashboard" className="px-5 py-3 rounded-xl bg-white text-black font-medium hover:opacity-90">Guarda la Dashboard</a>
          <a href="/pricing" className="px-5 py-3 rounded-xl border border-slate-600 hover:bg-slate-800">Piani & Prezzi</a>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4 mt-8">
        {[
          {t:"KPI in tempo reale", d:"Spesa, Click, Conversioni, CTR – pronti via API."},
          {t:"Scalabile & Sicuro", d:"Express, rate-limit, helmet, Postgres."},
          {t:"Pronto al deploy", d:"Render + dominio custom con HTTPS."},
        ].map((c,i)=>(
          <div key={i} className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 shadow-md">
            <h3 className="font-semibold">{c.t}</h3>
            <p className="text-slate-300 mt-1">{c.d}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
