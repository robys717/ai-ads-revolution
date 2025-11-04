import { useEffect, useState } from 'react';

type J = any;
export default function TestDashboard() {
  const [health,setHealth] = useState<J>(null);
  const [ping,setPing] = useState<J>(null);
  const [summary,setSummary] = useState<J>(null);
  const [err,setErr] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const h = await fetch('/api/health').then(r=>r.json());
        const p = await fetch('/api/ping').then(r=>r.json());
        const s = await fetch('/api/reports/summary').then(r=>r.json());
        setHealth(h); setPing(p); setSummary(s);
      } catch(e:any) {
        setErr(String(e?.message || e));
      }
    })();
  }, []);

  return (
    <div style={{padding:16, fontFamily:'system-ui, sans-serif', maxWidth: 900, margin:'0 auto'}}>
      <h1 style={{marginBottom:8}}>AI Ads – Test Dashboard</h1>
      <p style={{opacity:.8, marginBottom:16}}>Questa pagina chiama <code>/api/health</code>, <code>/api/ping</code>, <code>/api/reports/summary</code> nello stesso dominio.</p>

      {err && <pre style={{color:'crimson', background:'#fee', padding:12, borderRadius:8}}>ERRORE: {err}</pre>}

      <section style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:12}}>
        <div style={{border:'1px solid #eee', borderRadius:12, padding:12}}>
          <h3>Health</h3>
          <pre>{health ? JSON.stringify(health,null,2) : '...'}</pre>
        </div>
        <div style={{border:'1px solid #eee', borderRadius:12, padding:12}}>
          <h3>Ping</h3>
          <pre>{ping ? JSON.stringify(ping,null,2) : '...'}</pre>
        </div>
        <div style={{border:'1px solid #eee', borderRadius:12, padding:12}}>
          <h3>Summary</h3>
          <pre>{summary ? JSON.stringify(summary,null,2) : '...'}</pre>
        </div>
      </section>
    </div>
  );
}
