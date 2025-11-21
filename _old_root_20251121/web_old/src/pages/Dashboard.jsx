import { useEffect, useState } from 'react';

function Kpi({label, value}) {
  return <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 shadow-md"><div className="text-3xl font-semibold">{value}</div><div className="text-sm text-slate-400">{label}</div></div>;
}

export default function Dashboard(){
  const [sum,setSum]=useState(null);
  const [err,setErr]=useState('');

  useEffect(()=>{
    (async ()=>{
      try{
        const s = await fetch('/api/reports/summary').then(r=>r.json());
        if(!s.ok) throw new Error(s.error||'summary');
        setSum(s.totals);
      }catch(e){ setErr(String(e?.message||e)); }
    })();
  },[]);

  return (
    <div className="container space-y-4">
      <h1 className="text-xl font-semibold">Dashboard KPI</h1>
      {err && <div className="card text-red-300">{err}</div>}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Spesa" value={sum? `${sum.spend.toFixed(2)} €` : '...'} />
        <Kpi label="Clic" value={sum? sum.clicks : '...'} />
        <Kpi label="Conversioni" value={sum? sum.conversions : '...'} />
        <Kpi label="CTR" value={sum? `${sum.ctr.toFixed(2)}%` : '...'} />
      </section>
    </div>
  );
}
