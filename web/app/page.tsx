import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* TOP GRADIENT BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 -z-10 
overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-80 w-80 
-translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute top-40 -left-10 h-72 w-72 rounded-full 
bg-blue-600/25 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full 
bg-indigo-500/20 blur-3xl" />
      </div>

      {/* PAGE WRAPPER */}
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 
pb-10 pt-4 md:px-8">
        {/* NAVBAR */}
        <header className="mb-6 flex items-center justify-between 
rounded-2xl border border-slate-800/70 bg-slate-950/60 px-4 py-3 shadow-lg 
shadow-black/40 backdrop-blur-xl md:mt-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center 
rounded-xl bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 
text-xl font-bold shadow-lg shadow-cyan-500/40">
              AI
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold uppercase 
tracking-[0.18em] text-cyan-300">
                  Ads
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 
py-0.5 text-xs font-medium text-emerald-300">
                  Beta
                </span>
              </div>
              <h1 className="text-sm font-semibold text-slate-100">
                AI Ads Revolution
              </h1>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium 
text-slate-300 md:flex">
            <button className="transition hover:text-cyan-300">
              Piccola impresa
            </button>
            <button className="transition hover:text-cyan-300">
              Azienda di grandi dimensioni
            </button>
            <button className="transition 
hover:text-cyan-300">Partner</button>
            <button className="transition 
hover:text-cyan-300">Scopri</button>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="hidden text-sm font-medium text-slate-200 
hover:text-cyan-300 md:inline"
            >
              Accedi
            </Link>
            <Link
              href="/auth/register"
              className="rounded-full bg-gradient-to-r from-cyan-400 
via-sky-500 to-indigo-500 px-4 py-1.5 text-sm font-semibold text-slate-950 
shadow-lg shadow-cyan-500/40 transition hover:brightness-110"
            >
              Registrati
            </Link>
          </div>
        </header>

        {/* HERO + STAT */}
        <main className="flex flex-1 flex-col gap-10 md:flex-row 
md:items-center md:gap-12">
          {/* HERO TEXT */}
          <section className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full 
border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-medium 
text-cyan-200 shadow shadow-cyan-500/30">
              <span className="inline-flex h-1.5 w-1.5 rounded-full 
bg-emerald-400" />
              Piattaforma di advertising AI-first
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight 
text-slate-50 sm:text-4xl lg:text-[2.6rem]">
                Fai crescere la tua attività
                <span className="block bg-gradient-to-r from-cyan-300 
via-sky-400 to-emerald-300 bg-clip-text text-transparent">
                  con annunci potenziati dall&apos;intelligenza 
artificiale.
                </span>
              </h2>
              <p className="max-w-xl text-sm leading-relaxed 
text-slate-300 sm:text-base">
                Raggiungi gli acquirenti nel momento esatto in cui cercano
                prodotti come i tuoi. AI Ads Revolution analizza milioni 
di
                segnali in tempo reale per ottimizzare visibilità, 
traffico e
                conversioni.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/auth/register"
                className="rounded-full bg-slate-50 px-5 py-2.5 text-sm 
font-semibold text-slate-950 shadow-lg shadow-sky-500/40 transition 
hover:bg-cyan-50"
              >
                Inizia ora
              </Link>
              <button className="text-sm font-medium text-cyan-300 
hover:text-cyan-200">
                Guarda come funziona →
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-2 rounded-2xl border 
border-slate-800/80 bg-slate-900/60 p-4 text-sm text-slate-300 
shadow-inner shadow-slate-950/70 sm:flex-row sm:items-center sm:gap-5">
              <div className="flex flex-1 items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center 
rounded-xl bg-gradient-to-br from-sky-500/30 to-cyan-400/40 text-lg 
font-semibold text-cyan-50 shadow-lg shadow-cyan-500/40">
                  30%
                </div>
                <p className="text-xs leading-relaxed text-slate-300 
sm:text-sm">
                  Le piccole imprese che utilizzano AI Ads Revolution 
attribuiscono
                  in media il <span className="font-semibold">30% delle 
vendite</span>{" "}
                  alle nostre campagne ottimizzate dall&apos;AI.*
                </p>
              </div>
              <div className="text-[0.7rem] text-slate-400">
                *Dati interni AI Ads Revolution, risultati medi aggregati 
non
                garantiscono performance future.
              </div>
            </div>
          </section>

          {/* HERO VISUAL */}
          <section className="flex-1">
            <div className="relative mx-auto max-w-md rounded-3xl border 
border-sky-500/40 bg-slate-950/80 p-4 
shadow-[0_0_60px_rgba(56,189,248,0.35)] backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-medium text-slate-200">
                    Campagna AI attiva
                  </span>
                </div>
                <span className="rounded-full bg-slate-900 px-3 py-1 
text-[0.7rem] text-slate-300">
                  Budget efficiente
                </span>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-slate-900 
via-slate-950 to-slate-950 p-4">
                <div className="flex items-center justify-between 
text-[0.7rem] text-slate-400">
                  <span>Performance ultime 4 settimane</span>
                  <span>+32% CTR</span>
                </div>
                <div className="mt-3 flex h-32 items-end gap-1.5">
                  {[
                    "h-10",
                    "h-16",
                    "h-14",
                    "h-24",
                    "h-20",
                    "h-28",
                    "h-24",
                    "h-32",
                  ].map((h, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 rounded-full bg-gradient-to-t 
from-sky-500/20 via-sky-400/60 to-cyan-300/90 ${h}`}
                    />
                  ))}
                </div>
                <div className="mt-3 flex justify-between text-[0.68rem] 
text-slate-400">
                  <span>Impression</span>
                  <span>Click</span>
                  <span>Vendite</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-[0.7rem]">
                <div className="rounded-xl bg-slate-900/70 p-3">
                  <div className="text-slate-400">CPC medio</div>
                  <div className="text-sm font-semibold text-sky-300">
                    €0,21
                  </div>
                </div>
                <div className="rounded-xl bg-slate-900/70 p-3">
                  <div className="text-slate-400">ROAS</div>
                  <div className="text-sm font-semibold text-emerald-300">
                    4,7x
                  </div>
                </div>
                <div className="rounded-xl bg-slate-900/70 p-3">
                  <div className="text-slate-400">Conversioni</div>
                  <div className="text-sm font-semibold text-slate-100">
                    +19%
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* SECTION: JOURNEY */}
        <section className="mt-12 space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end 
md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-50">
                Raggiungi i clienti in ogni fase del percorso di acquisto
              </h3>
              <p className="max-w-2xl text-sm text-slate-300">
                L&apos;intelligenza artificiale di AI Ads Revolution 
ottimizza le
                tue campagne dalla scoperta alla conversione, adattando 
budget,
                creatività e targeting in tempo reale.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800/80 
bg-slate-950/70 p-4 shadow-inner shadow-black/60">
              <div className="mb-2 text-lg">📈</div>
              <h4 className="text-sm font-semibold text-slate-50">
                Migliora la visibilità dei prodotti
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Aiuta i clienti a trovare i tuoi prodotti attraverso 
annunci che
                appaiono in ricerche e posizionamenti altamente rilevanti,
                scelti automaticamente dall&apos;AI.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800/80 
bg-slate-950/70 p-4 shadow-inner shadow-black/60">
              <div className="mb-2 text-lg">✨</div>
              <h4 className="text-sm font-semibold text-slate-50">
                Raggiungi nuovi clienti
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Formati creativi coinvolgenti generati e testati
                automaticamente. L&apos;AI individua i messaggi più 
efficaci per
                ciascun segmento di pubblico.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800/80 
bg-slate-950/70 p-4 shadow-inner shadow-black/60">
              <div className="mb-2 text-lg">💸</div>
              <h4 className="text-sm font-semibold text-slate-50">
                Vendi in modo efficiente
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Usa parole chiave e segnali di intento per comparire in
                ricerche ad alta probabilità di acquisto, riducendo 
sprechi
                pubblicitari.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION: BUDGET */}
        <section className="mt-12 space-y-6">
          <h3 className="text-xl font-semibold text-slate-50">
            Soluzioni pubblicitarie per ogni budget
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800/80 
bg-slate-950/80 p-4">
              <div className="mb-2 text-lg">💰</div>
              <h4 className="text-sm font-semibold text-slate-50">
                Nessun costo iniziale
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Il prezzo si basa sul costo per clic: paghi solo quando un
                acquirente interagisce realmente con il tuo annuncio.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800/80 
bg-slate-950/80 p-4">
              <div className="mb-2 text-lg">🌱</div>
              <h4 className="text-sm font-semibold text-slate-50">
                Inizia con poco
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Imposta un budget ridotto e lascia che l&apos;AI individui 
le
                opportunità migliori. Potrai aumentarlo quando inizierai a
                vedere i risultati.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800/80 
bg-slate-950/80 p-4">
              <div className="mb-2 text-lg">🎯</div>
              <h4 className="text-sm font-semibold text-slate-50">
                Controllo totale
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Definisci tu il budget giornaliero e mensile: non ti verrà 
mai
                addebitato un importo superiore a quello impostato.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION: GUIDA */}
        <section className="mt-12 grid gap-6 rounded-2xl border 
border-slate-800/80 bg-slate-950/80 p-6 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-slate-50">
              Scopri come utilizzare gli annunci self-service
            </h3>
            <p className="text-sm text-slate-300">
              Impara a promuovere le vendite e la crescita del tuo 
business con
              la nostra guida per principianti. Ti mostreremo come creare,
              lanciare e ottimizzare campagne con pochi clic.
            </p>
            <button className="mt-2 rounded-full border border-cyan-400/60 
bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition 
hover:bg-cyan-500/20">
              Maggiori informazioni
            </button>
          </div>
          <div className="flex flex-col justify-center space-y-2 text-sm 
text-slate-300">
            <p>
              Inizia subito a far crescere la tua attività con le 
soluzioni
              self-service di AI Ads Revolution. Nessuna esperienza 
tecnica
              richiesta: l&apos;AI ti guiderà passo dopo passo.
            </p>
            <Link
              href="/auth/register"
              className="self-start rounded-full bg-slate-50 px-4 py-2 
text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/40 
transition hover:bg-cyan-50"
            >
              Inizia ora
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-12 border-t border-slate-800/80 pt-6 text-xs 
text-slate-400">
          <div className="grid gap-6 md:grid-cols-4">
            <div>
              <h4 className="text-[0.7rem] font-semibold uppercase 
tracking-[0.16em] text-slate-300">
                Obiettivi
              </h4>
              <ul className="mt-2 space-y-1">
                <li>Creare brand awareness</li>
                <li>Raggiungere più clienti</li>
                <li>Aumentare il traffico</li>
                <li>Aumentare vendite e conversioni</li>
                <li>Migliorare la fidelizzazione</li>
              </ul>
            </div>
            <div>
              <h4 className="text-[0.7rem] font-semibold uppercase 
tracking-[0.16em] text-slate-300">
                Prodotti
              </h4>
              <ul className="mt-2 space-y-1">
                <li>Annunci sponsorizzati</li>
                <li>Sponsored Products</li>
                <li>Sponsored Brands</li>
                <li>Annunci display</li>
                <li>Annunci video &amp; audio</li>
              </ul>
            </div>
            <div>
              <h4 className="text-[0.7rem] font-semibold uppercase 
tracking-[0.16em] text-slate-300">
                Dati &amp; analisi
              </h4>
              <ul className="mt-2 space-y-1">
                <li>AI Analytics</li>
                <li>Attribution</li>
                <li>Reportistica campagne</li>
                <li>Dati omnicanale</li>
              </ul>
            </div>
            <div>
              <h4 className="text-[0.7rem] font-semibold uppercase 
tracking-[0.16em] text-slate-300">
                Chi siamo
              </h4>
              <ul className="mt-2 space-y-1">
                <li>La nostra missione</li>
                <li>Supporto</li>
                <li>Partners</li>
                <li>Posizioni aperte (presto)</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 flex flex-col justify-between gap-2 
border-t border-slate-800/60 pt-4 text-[0.68rem] text-slate-500 
md:flex-row md:items-center">
            <div>© 2025 AI Ads Revolution. Tutti i diritti 
riservati.</div>
            <div className="flex flex-wrap gap-4">
              <button className="hover:text-slate-300">
                Informativa sulla privacy
              </button>
              <button className="hover:text-slate-300">
                Termini e condizioni
              </button>
              <button className="hover:text-slate-300">
                Informativa cookie
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

