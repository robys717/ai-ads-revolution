import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Rocket, BarChart3, Cpu, ShieldCheck, LineChart, ExternalLink } from "lucide-react";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";

export default function AAR_Landing() {
  const [kpi, setKpi] = useState<any>({ impressions: 0, clicks: 0, conversions: 0, spend_cents: 0 });
  useEffect(() => {
    fetch("/api/reports/summary").then(r=>r.json()).then(d=>setKpi(d?.kpi || {})).catch(()=>{});
  }, []);
  const perks = [
    { icon: <BarChart3 className="w-6 h-6" />, title: "Analytics in tempo reale", text: "CTR, CPC, CPA e ROI aggiornati live su tutte le campagne." },
    { icon: <Cpu className="w-6 h-6" />, title: "AI Advisor integrato", text: "Suggerimenti automatici su creatività, orari, bid e allocazione budget." },
    { icon: <ShieldCheck className="w-6 h-6" />, title: "Privacy & Controllo", text: "Widget leggero, consenso utente e filtri anti-bot." },
    { icon: <LineChart className="w-6 h-6" />, title: "Widget per Publisher", text: "Incorpora /public/widget.js e traccia views, click e conversioni." },
  ];
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-100">
      <nav className="sticky top-0 z-50 backdrop-blur border-b border-white/10 bg-black/40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-white/10 grid place-items-center"><Rocket className="w-4 h-4" /></div>
            <span className="font-semibold tracking-wide">AI Ads Revolution</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#features" className="text-sm opacity-80 hover:opacity-100">Funzioni</a>
            <a href="#how" className="text-sm opacity-80 hover:opacity-100">Come funziona</a>
            <a href="#contact" className="text-sm opacity-80 hover:opacity-100">Contatti</a>
            <Button asChild={true} className="rounded-2xl px-3 py-1.5"><a href="/admin">Launch Dashboard</a></Button>
          </div>
        </div>
      </nav>

      <header className="relative overflow-hidden">
        <div className="absolute inset-0" style={{background:
          "radial-gradient(circle at 20% 20%, rgba(56,189,248,0.15), transparent 40%),radial-gradient(circle at 80% 0%, rgba(99,102,241,0.15), transparent 35%)"}} />
        <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-16 grid lg:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Pubblicità globale con <span className="bg-clip-text text-transparent" style={{backgroundImage: "linear-gradient(90deg,#38bdf8,#818cf8)"}}>Intelligenza Artificiale</span>
            </h1>
            <p className="mt-4 text-slate-300 max-w-xl">Una piattaforma unica per analisi in tempo reale, ottimizzazione AI e gestione del ROI.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild={true} className="rounded-2xl px-4 py-2"><a href="/admin">Entra nella Dashboard</a></Button>
              <Button asChild={true} className="rounded-2xl px-4 py-2 bg-white/5"><a href="#features">Scopri le funzioni</a></Button>
            </div>
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "impressions", label: "Impressions" },
                { k: "clicks", label: "Clicks" },
                { k: "conversions", label: "Conversions" },
                { k: "spend_cents", label: "Spesa (€)" },
              ].map(({ k, label }) => (
                <Card key={k} className="rounded-2xl border-white/10 bg-white/5">
                  <CardContent className="p-4">
                    <div className="text-xs opacity-70">{label}</div>
                    <div className="text-2xl font-semibold">
                      {k === "spend_cents" ? (((kpi?.[k] || 0) / 100).toFixed(2)) : (kpi?.[k] || 0)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-xl" style={{height:280, background:"linear-gradient(180deg,#0b1220,#0f1b2e)"}}>
              <div className="absolute bottom-0 inset-x-0 p-3 text-center bg-black/40 text-xs">Anteprima Dashboard – dati da /api/reports/summary</div>
            </div>
          </motion.div>
        </div>
      </header>

      <section id="features" className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold">Funzioni principali</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {perks.map((p,i)=>(
            <div key={i} className="p-5 rounded-2xl border border-white/10 bg-white/5">
              <div className="h-10 w-10 rounded-xl bg-white/10 grid place-items-center mb-3">{p.icon}</div>
              <div className="font-semibold">{p.title}</div>
              <div className="text-sm opacity-80 mt-1">{p.text}</div>
            </div>
          ))}
        </div>
      </section>

      <footer id="contact" className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-10 text-sm opacity-80">
          © 2025 Roberto Segarelli – All rights reserved.
        </div>
      </footer>
    </div>
  );
}
