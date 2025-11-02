import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Rocket, BarChart3, Cpu, ShieldCheck, LineChart } from "lucide-react";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";

export default function AAR_Landing() {
  const [kpi, setKpi] = useState<any>({ impressions: 0, clicks: 0, conversions: 0, spend_cents: 0 });
  useEffect(() => {
    fetch("/api/reports/summary").then((r) => r.json()).then((d) => setKpi(d?.kpi || {})).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-100">
      <header className="max-w-6xl mx-auto px-4 pt-20 text-center">
        <h1 className="text-5xl font-extrabold">AI Ads Revolution</h1>
        <p className="mt-4 text-slate-300 max-w-2xl mx-auto">
          Piattaforma pubblicitaria intelligente basata su Intelligenza Artificiale.  
          Analisi in tempo reale, ottimizzazione AI e gestione ROI globale.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild className="rounded-2xl px-4 py-2">
            <a href="/admin">Launch Dashboard</a>
          </Button>
          <Button asChild className="rounded-2xl px-4 py-2 bg-white/5">
            <a href="#features">Scopri le funzioni</a>
          </Button>
        </div>
      </header>

      <section id="features" className="max-w-6xl mx-auto px-4 py-20 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[ 
          { icon: <BarChart3 className='w-6 h-6'/>, title: 'Analytics', desc: 'CTR, CPC, CPA e ROI aggiornati in tempo reale.' },
          { icon: <Cpu className='w-6 h-6'/>, title: 'AI Advisor', desc: 'Suggerimenti automatici per campagne più efficaci.' },
          { icon: <ShieldCheck className='w-6 h-6'/>, title: 'Privacy', desc: 'Tracciamento conforme a GDPR e filtri anti-bot.' },
          { icon: <LineChart className='w-6 h-6'/>, title: 'Publisher Widget', desc: 'Script integrabile /public/widget.js.' },
        ].map((p, i) => (
          <Card key={i} className="p-5">
            <CardContent>
              <div className="mb-2">{p.icon}</div>
              <div className="font-semibold">{p.title}</div>
              <div className="text-sm opacity-80">{p.desc}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-sm opacity-70">
        © 2025 Roberto Segarelli – AI Ads Revolution
      </footer>
    </div>
  );
}
