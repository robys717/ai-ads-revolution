import { useEffect, useState } from 'react';
import KpiCard from '../components/KpiCard';
import LineMiniChart from '../components/LineMiniChart';

export default function Dashboard(){
  const [sum,setSum]=useState(null);
  const [ts,setTs]=useState([]);
  const [err,setErr]=useState("");

  useEffect(()=>{
    (async ()=>{
      try{
        const s = await fetch('/api/reports/summary').then(r=>r.json());
        const t = await fetch('/api/reports/timeseries').then(r=>r.json());
        if(!s.ok) throw new Error(s.error||'summary');
        if(!t.ok) throw new Error(t.error||'timeseries');
        setSum(s.totals);
        setTs(t.data);
      }catch(e){ setErr(String(e?.message||e)); }
    })();
  },[]);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">AI Ads – Dashboard</h1>
      </header>

      {err && <div className="card text-red-300">{err}</div>}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Spesa totale" value={sum? sum.spend.toFixed(2): '...'} suffix="€"/>
        <KpiCard label="Clic" value={sum? sum.clicks: '...'}/>
        <KpiCard label="Conversioni" value={sum? sum.conversions: '...'}/>
        <KpiCard label="CTR" value={sum? `${sum.ctr.toFixed(2)}%` : '...'}/>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LineMiniChart data={ts} dataKey="spend"/>
        <LineMiniChart data={ts} dataKey="clicks"/>
      </section>
    </div>
  );
}
