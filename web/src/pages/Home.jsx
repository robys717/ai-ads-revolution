import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* HERO */}
      <header className="border-b border-slate-800 bg-slate-950/80 sticky 
top-0 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center 
justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br 
from-cyan-400 to-sky-600 flex items-center justify-center shadow-lg 
shadow-cyan-500/40">
              <span className="text-xs font-bold tracking-tight">
                AI
              </span>
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight 
uppercase text-slate-200">
                AI Ads Revolution
              </div>
              <div className="text-[11px] text-slate-400">
                Smart Ads · Real Performance
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm 
text-slate-300">
            <a href="#features" 
className="hover:text-cyan-400">Funzioni</a>
            <a href="#how" className="hover:text-cyan-400">Come 
funziona</a>
            <a href="#why" className="hover:text-cyan-400">Perché AI Ads 
Revolution</a>
          </nav>

          <div className="flex items-center gap-3">
            <button className="hidden md:inline-flex rounded-xl border 
border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 
hover:bg-slate-800">
              Dashboard demo
            </button>
            <button className="inline-flex rounded-xl bg-cyan-500 px-4 
py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-cyan-500/40 
hover:bg-cyan-400">
              Inizia ora
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        <section className="grid gap-10 
md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-center">
          {/* Testo */}
          <div>
            <p className="text-xs font-semibold uppercase 
tracking-[0.25em] text-cyan-400">
              AI POWERED ADVERTISING
            </p>

            <h1 className="mt-3 text-3xl md:text-4xl font-semibold 
tracking-tight text-slate-50">
              La nuova generazione di{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-sky-500 
bg-clip-text text-transparent">
                campagne pubblicitarie intelligenti
              </span>
              .
            </h1>

            <p className="mt-4 text-sm md:text-base text-slate-300 
leading-relaxed">
              AI Ads Revolution analizza in tempo reale dati, 
comportamento
              degli utenti e performance delle campagne per ottimizzare 
budget,
              creatività e target in automatico.
              <br />
              Meno sprechi. Più risultati. Report chiari, subito.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button className="inline-flex items-center justify-center 
rounded-xl bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 
shadow-md shadow-cyan-500/40 hover:bg-cyan-400">
                Prova la dashboard
              </button>
              <button className="inline-flex items-center justify-center 
rounded-xl border border-slate-700 px-4 py-2 text-xs font-medium 
text-slate-200 hover:bg-slate-800">
                Guarda come funziona
              </button>
            </div>

            <div className="mt-4 text-[11px] text-slate-400">
              Nessun social obbligatorio • Pensato per piccoli business e
              grandi aziende • Pronto per la scalabilità globale
            </div>
          </div>

          {/* “Card” lato destro */}
          <div className="relative">
            <div className="absolute -inset-4 bg-cyan-500/10 blur-3xl 
rounded-3xl" />
            <div className="relative rounded-3xl border border-slate-800 
bg-slate-900/70 p-4 shadow-xl shadow-cyan-500/20">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-slate-300">
                  Overview Campagne
                </div>
                <span className="rounded-full bg-emerald-500/15 px-2 
py-0.5 text-[10px] text-emerald-300 border border-emerald-500/40">
                  +178% ROI
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs mt-3">
                <div className="rounded-2xl border border-slate-800 
bg-slate-950/60 p-3">
                  <div className="text-[11px] text-slate-400">Budget 
ottimizzato</div>
                  <div className="mt-1 text-lg font-semibold 
text-slate-50">
                    -32%
                  </div>
                  <div className="mt-1 text-[11px] text-emerald-400">
                    Spreco ridotto
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-800 
bg-slate-950/60 p-3">
                  <div className="text-[11px] text-slate-400">CTR 
medio</div>
                  <div className="mt-1 text-lg font-semibold 
text-slate-50">
                    +47%
                  </div>
                  <div className="mt-1 text-[11px] text-cyan-400">
                    Creatività dinamica
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-800 
bg-gradient-to-br from-slate-900 to-slate-950 p-3">
                <div className="flex items-center justify-between 
text-[11px] text-slate-400 mb-2">
                  <span>Canali attivi</span>
                  <span>AI Optimization</span>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 
text-slate-200">
                    Google Ads
                  </span>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 
text-slate-200">
                    Display &amp; Programmatic
                  </span>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 
text-slate-200">
                    Video Ads
                  </span>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 
text-slate-200">
                    Email &amp; Remarketing
                  </span>
                </div>
              </div>

              <div className="mt-3 text-[10px] text-slate-500">
                *Dati di esempio. La versione reale userà i tuoi numeri, 
in tempo
                reale.
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="mt-16">
          <h2 className="text-xl md:text-2xl font-semibold text-slate-50">
            Cosa fa realmente <span className="text-cyan-400">AI Ads 
Revolution</span>
          </h2>
          <p className="mt-2 text-sm text-slate-300 max-w-2xl">
            Non è un semplice “gestore di campagne”. È il tuo cervello
            strategico che lavora 24/7 sui dati per migliorare risultati,
            tagliare sprechi e darti controllo totale.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3 text-sm">
            <div className="rounded-2xl border border-slate-800 
bg-slate-950/70 p-4">
              <div className="text-xs font-semibold text-cyan-400 
uppercase">
                01 · Analisi avanzata
              </div>
              <p className="mt-2 text-slate-300">
                L’AI analizza click, conversioni, orari e audience per 
capire
                dove conviene davvero investire il budget.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 
bg-slate-950/70 p-4">
              <div className="text-xs font-semibold text-cyan-400 
uppercase">
                02 · Ottimizzazione automatica
              </div>
              <p className="mt-2 text-slate-300">
                Spostamento automatico del budget sulle campagne che 
rendono di
                più. Stop ai soldi buttati.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 
bg-slate-950/70 p-4">
              <div className="text-xs font-semibold text-cyan-400 
uppercase">
                03 · Report chiari
              </div>
              <p className="mt-2 text-slate-300">
                Dashboard pulita, numeri leggibili, niente casino. Vedi 
subito
                cosa funziona e cosa no.
              </p>
            </div>
          </div>
        </section>

        {/* WHY */}
        <section id="why" className="mt-16 border-t border-slate-800 
pt-8">
          <h2 className="text-xl md:text-2xl font-semibold text-slate-50">
            Perché scegliere <span className="text-cyan-400">AI Ads 
Revolution</span>?
          </h2>

          <div className="mt-4 grid gap-6 md:grid-cols-2 text-sm">
            <div className="space-y-2 text-slate-300">
              <p>
                Perché nasce da un’idea semplice:{" "}
                <strong className="text-slate-50">
                  usare l’intelligenza artificiale per aiutare davvero chi 
fa
                  business
                </strong>
                , non per complicare la vita con mille tool diversi.
              </p>
              <p>
                È pensato per imprenditori, negozi, brand e aziende che 
vogliono
                controllare il proprio marketing senza essere esperti 
tecnici.
              </p>
            </div>
            <div className="space-y-2 text-slate-300">
              <p>
                L’obiettivo non è solo fare pubblicità, ma{" "}
                <strong className="text-slate-50">
                  creare un sistema serio, trasparente e potente
                </strong>{" "}
                che ottimizza ogni euro investito in ads.
              </p>
              <p>
                AI Ads Revolution è costruito per crescere con te: da 
primo
                test, fino a campagne globali.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 py-4 text-[11px] 
text-center text-slate-500">
        © {new Date().getFullYear()} AI Ads Revolution · Powered by AI & 
real data.
      </footer>
    </div>
  );
}

