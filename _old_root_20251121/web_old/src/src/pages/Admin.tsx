import React, { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
type KPI = { impressions:number; clicks:number; conversions:number; spend_cents:number };
export default function Admin(){
  const [kpi, setKpi] = useState<KPI>({impressions:0,clicks:0,conversions:0,spend_cents:0});
  useEffect(()=>{ fetch("/api/reports/summary").then(r=>r.json()).then(d=>setKpi(d.kpi||{})).catch(()=>{}); },[]);
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <a href="/"><Button className="bg-white/5">Torna alla Home</Button></a>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-sm opacity-70">Impressions</div><div className="text-2xl font-semibold mt-1">{kpi.impressions}</div></div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-sm opacity-70">Clicks</div><div className="text-2xl font-semibold mt-1">{kpi.clicks}</div></div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-sm opacity-70">Conversions</div><div className="text-2xl font-semibold mt-1">{kpi.conversions}</div></div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-sm opacity-70">Spend (€)</div><div className="text-2xl font-semibold mt-1">{(kpi.spend_cents/100).toFixed(2)}</div></div>
        </div>
      </div>
    </div>
  );
}
