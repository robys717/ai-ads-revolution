import React, { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { KpiCard } from "../components/KpiCard";
import { Button } from "./../components/ui/button";

type Summary = { kpi: { impressions: number; clicks: number; conversions: number; spend_cents: number } };

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [sum, setSum] = useState<Summary["kpi"] | null>(null);

  useEffect(() => {
    if (authed) {
      fetch("/api/reports/summary").then(r => r.json()).then((d: Summary) => setSum(d.kpi)).catch(()=>{});
    }
  }, [authed]);

  const series = useMemo(() => {
    // Serie demo derivata dai KPI (mock semplice)
    const imp = sum?.impressions ?? 10000;
    const clk = sum?.clicks ?? 500;
    const conv = sum?.conversions ?? 30;
    const spend = (sum?.spend_cents ?? 150000) / 100;
    return Array.from({length: 12}).map((_, i) => ({
      name: `D${i+1}`,
      impressions: Math.round(imp/12 + (Math.sin(i)*imp*0.03)),
      clicks: Math.round(clk/12 + (Math.cos(i)*clk*0.08)),
      conversions: Math.max(0, Math.round(conv/12 + (Math.sin(i/2)*conv*0.1))),
      spend: Math.max(0, Math.round((spend/12 + (Math.cos(i/3)*spend*0.05))*100)/100),
    }));
  }, [sum]);

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] text-slate-100 flex items-center justify-center px-4">
        <div className="max-w-sm w-full rounded-2xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-xl font-bold mb-4">AI Ads Revolution – Admin</h1>
          <label className="text-sm opacity-80">Email</label>
          <input className="w-full mt-1 mb-3 px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-white"
                 value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@domain.com" />
          <label className="text-sm opacity-80">Password</label>
          <input type="password" className="w-full mt-1 mb-4 px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-white"
                 value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="••••••••" />
          <Button onClick={()=>setAuthed(true)} className="w-full">Entra (demo)</Button>
          <div className="text-xs opacity-60 mt-3">Login fittizio per demo. Nessun salvataggio.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-100">
      <header className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="text-lg font-semibold">Dashboard</div>
        <Button onClick={()=>setAuthed(false)} className="bg-white/5">Esci</Button>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Impressions" value={sum?.impressions ?? 0} />
          <KpiCard label="Clicks" value={sum?.clicks ?? 0} />
          <KpiCard label="Conversions" value={sum?.conversions ?? 0} />
          <KpiCard label="Spend" value={((sum?.spend_cents ?? 0)/100).toFixed(2)} suffix=" €" />
        </div>

        <section className="mt-10 grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm mb-2 opacity-80">CTR trend (clicks/impressions)</div>
            <div style={{width:"100%", height:300}}>
              <ResponsiveContainer>
                <LineChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="impressions" dot={false} />
                  <Line type="monotone" dataKey="clicks" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm mb-2 opacity-80">Conversions & Spend</div>
            <div style={{width:"100%", height:300}}>
              <ResponsiveContainer>
                <LineChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="conversions" dot={false} />
                  <Line type="monotone" dataKey="spend" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
