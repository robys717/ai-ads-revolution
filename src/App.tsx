import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Rocket, BarChart3, Cpu, ShieldCheck, LineChart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Se il tuo progetto NON supporta l'alias "@/..." per import,
// sostituisci gli import sopra con:
// import { Button } from "./components/ui/button";
// import { Card, CardContent } from "./components/ui/card";

export default function AAR_Landing() {
  const [kpi, setKpi] = useState<any>({ impressions: 0, clicks: 0, conversions: 0, spend_cents: 0 });

  useEffect(() => {
    fetch("/api/reports/summary")
      .then((r) => r.json())
      .then((d) => setKpi(d?.kpi || {}))
      .catch(() => {});
  }, []);

  const perks = [
    { icon: <BarChart3 className="w-6 h-6" />, title: "Analytics in tempo reale", text: "CTR, CPC, CPA e ROI aggiornati live su tutte le campagne." },
    { icon: <Cpu className="w-6 h-6" />, title: "AI Advisor integrato", text: "Suggerimenti automatici su creatività, orari, bid e allocazione budget." },
    { icon: <ShieldCheck className="w-6 h-6" />, title: "Privacy & Controllo", text: "Widget leggero, consenso utente e filtri anti-bot." },
    { icon: <LineChart className="w-6 h-6" />, title: "Widget per Publisher", text: "Incorpora /public/widget.js e traccia views, click e conversioni." },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-100">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur border-b border-white/10 bg-black/40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-white/10 grid place-items-center">
              <Rocket className="w-4 h-4" />
            </div>
            <span className="font-semibold tracking-wide">AI Ads Revolution</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#features" className="text-sm opacity-80 hover:opacity-100">Funzioni</a>
            <a href="#how" className="text-sm opacity-80 hover:opacity-100">Come funziona</a>
            <a href="#contact" className="text-sm opacity-80 hover:opacity-100">Contatti</a>
            <Button asChild={true} className="rounded-2xl px-3 py-1.5">
              <a href="/admin">Launch Dashboard</a>
            </Button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0" style={{background:
          "radial-gradient(circle at 20% 20%, rgba(56,189,248,0.15), transparent 40%),radial-gradient(circle at 80% 0%, rgba(99,102,241,0.15), transparent 35%)"}} />
        <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-16 grid lg:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Pubblicità globale con <span className="bg-clip-text text-transparent" style={{backgroundImage: "linear-gradient(90deg,#38bdf8,#818cf8)"}}>Intelligenza Artificiale</span>
            </h1>
            <p className="mt-4 text-slate-300 max-w-xl">
              Una piattaforma unica per analisi in tempo reale, ottimizzazione AI e gestione del ROI. Dati affidabili, consigli intelligenti e scala mondiale.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild={true} className="rounded-2xl px-4 py-2">
                <a href="/admin">Entra nella Dashboard</a>
              </Button>
              <Button asChild={true} className="rounded-2xl px-4 py-2 bg-white/5">
                <a href="#features">Scopri le funzioni</a>
              </Button>
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
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-xl">
              <img src="/preview-dashboard.png" alt="AI Ads Revolution Dashboard" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 inset-x-0 p-3 text-center bg-black/40 text-xs">
                Anteprima Dashboard – dati demo /api/reports/summary
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* FEATURES */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold">Funzioni principali</h2>
        <p className="text-slate-300 mt-2">Tutto quello che serve per campagne performanti, dalla raccolta dati all'ottimizzazione.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {[
            { icon: <BarChart3 className="w-6 h-6" />, title: "Analytics in tempo reale", text: "CTR, CPC, CPA e ROI aggiornati live." },
            { icon: <Cpu className="w-6 h-6" />, title: "AI Advisor integrato", text: "Suggerimenti automatici su creatività e bid." },
            { icon: <ShieldCheck className="w-6 h-6" />, title: "Privacy & Controllo", text: "Consenso utente e filtri anti-bot." },
            { icon: <LineChart className="w-6 h-6" />, title: "Widget per Publisher", text: "Incorpora /public/widget.js sul tuo sito." },
          ].map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.05 }} className="p-5 rounded-2xl border border-white/10 bg-white/5">
              <div className="h-10 w-10 rounded-xl bg-white/10 grid place-items-center mb-3">{p.icon}</div>
              <div className="font-semibold">{p.title}</div>
              <div className="text-sm opacity-80 mt-1">{p.text}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold">Come funziona</h2>
        <div className="mt-6 grid lg:grid-cols-3 gap-4">
          <Card className="rounded-2xl bg-white/5 border-white/10">
            <CardContent className="p-5">
              <div className="text-sm opacity-70">1) Tracking</div>
              <div className="font-semibold mt-1">Incorpora il widget</div>
              <p className="text-sm opacity-80 mt-2">
                Aggiungi <code className="px-1 py-0.5 bg-black/40 rounded">/public/widget.js</code> al tuo sito: pageview, click, conversioni e heartbeat.
              </p>
              <div className="mt-3 text-sm flex items-center gap-1 opacity-80">
                <ExternalLink className="w-4 h-4" /> <span>Docs: /public/widget.js</span>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl bg-white/5 border-white/10">
            <CardContent className="p-5">
              <div className="text-sm opacity-70">2) Analytics</div>
              <div className="font-semibold mt-1">Dashboard in tempo reale</div>
              <p className="text-sm opacity-80 mt-2">
                Grafici e KPI da <code className="px-1 py-0.5 bg-black/40 rounded">/api/reports/summary</code> con breakdown per campagna.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl bg-white/5 border-white/10">
            <CardContent className="p-5">
              <div className="text-sm opacity-70">3) Ottimizzazione</div>
              <div className="font-semibold mt-1">AI Advisor</div>
              <p className="text-sm opacity-80 mt-2">Motore di regole già incluso. Pronto per upgrade con LLM quando inserirai la chiave.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="rounded-3xl border border-white/10" style={{background:"linear-gradient(90deg, rgba(8,47,73,0.6), rgba(30,27,75,0.6))", padding:"2rem"}}>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-xl md:text-2xl font-bold">Pronto per iniziare?</h3>
              <p className="text-slate-300 mt-2">Accedi alla dashboard, crea una campagna e guarda i primi dati arrivare in tempo reale.</p>
            </div>
            <div className="flex md:justify-end gap-3">
              <Button asChild={true} className="rounded-2xl px-4 py-2">
                <a href="/admin">Launch Dashboard</a>
              </Button>
              <Button asChild={true} className="rounded-2xl px-4 py-2 bg-white/5">
                <a href="#contact">Richiedi accesso beta</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-6">
          <div>
            <div className="font-semibold">AI Ads Revolution</div>
            <div className="text-sm opacity-70 mt-1">© 2025 Roberto Segarelli – All rights reserved.</div>
          </div>
          <div className="text-sm opacity-80">
            <div className="font-semibold mb-1">Contatti</div>
            <div>info@aiadsrevolution.com (placeholder)</div>
            <div>Fiorenzuola d'Arda (Italy)</div>
          </div>
          <div className="text-sm opacity-80">
            <div className="font-semibold mb-1">Link utili</div>
            <a href="/admin" className="block hover:opacity-100 opacity-80">Dashboard</a>
            <a href="/api/health" className="block hover:opacity-100 opacity-80">Status API</a>
            <a href="/legal" className="block hover:opacity-100 opacity-80">Termini & Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
