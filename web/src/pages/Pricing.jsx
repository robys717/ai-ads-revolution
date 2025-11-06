export default function Pricing(){
  const plans = [
    {name:"Basic", price:"€10,90/mese", points:["Dashboard KPI", "Report giornalieri", "Email supporto base"]},
    {name:"Pro", price:"€39/mese", points:["Tutto del Basic", "API estese", "Report esportabili", "Supporto prioritario"]},
    {name:"Enterprise", price:"Contattaci", points:["SLA dedicato", "Integrazioni custom", "Onboarding & training", "Supporto 24/7"]},
  ];
  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-semibold text-center">Piani & Prezzi</h1>
      <p className="text-slate-300 text-center mt-2">Scegli il piano ideale per partire e crescere.</p>
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        {plans.map((p,i)=>(
          <div key={i} className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 shadow-md flex flex-col">
            <h3 className="text-xl font-semibold">{p.name}</h3>
            <div className="text-2xl mt-2">{p.price}</div>
            <ul className="mt-4 space-y-2 text-slate-300 list-disc list-inside">
              {p.points.map((pt,j)=><li key={j}>{pt}</li>)}
            </ul>
            <a href="/contact" className="mt-6 inline-block text-center px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800">
              Inizia ora
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}
