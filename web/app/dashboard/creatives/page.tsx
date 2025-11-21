export default function CreativesPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Creatività</h1>
        <p className="text-sm text-slate-400 mb-6">
          Qui potrai gestire tutti i tuoi asset pubblicitari: banner, 
video,
          formati native, testi e varianti per A/B test.
        </p>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl 
p-4">
            <h2 className="text-sm font-semibold mb-2">Banner</h2>
            <p className="text-xs text-slate-400 mb-3">
              Formati classici display (es. 300x250, 728x90, 160x600).
            </p>
            <p className="text-[11px] text-slate-500">
              Più avanti potrai caricare i tuoi banner e lasciare che
              l&apos;AI scelga quelli con il CTR migliore.
            </p>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-2xl 
p-4">
            <h2 className="text-sm font-semibold mb-2">Video</h2>
            <p className="text-xs text-slate-400 mb-3">
              Spot brevi per campagne video (pre-roll, in-stream, social).
            </p>
            <p className="text-[11px] text-slate-500">
              Potrai caricare clip diverse e vedere quali convertono di 
più
              in base al pubblico e al device.
            </p>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-2xl 
p-4">
            <h2 className="text-sm font-semibold mb-2">Native & Testi</h2>
            <p className="text-xs text-slate-400 mb-3">
              Titoli, descrizioni e formati native ads integrati nei 
contenuti.
            </p>
            <p className="text-[11px] text-slate-500">
              L&apos;AI potrà generare varianti automatiche e ottimizzare 
i
              testi in base ai risultati reali.
            </p>
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-2xl 
p-4">
          <h2 className="text-sm font-semibold mb-2">
            Prossimi step per questa sezione
          </h2>
          <ul className="list-disc list-inside text-xs text-slate-400 
space-y-1">
            <li>Upload di creatività (immagini, video, file ZIP) 
direttamente dal browser.</li>
            <li>Collegamento creatività ↔ campagne (scegli quali asset 
usare per ogni campagna).</li>
            <li>Statistiche per singola creatività: CTR, CPC, conversioni, 
ROAS.</li>
            <li>Motore AI che suggerisce quali creatività spegnere o 
potenziare.</li>
          </ul>
        </div>

        <p className="text-[11px] text-slate-500 mt-4">
          Per ora questa sezione è informativa. Più avanti potremo 
collegarla
          a un vero backend per storage (es. S3/Supabase Storage) e ad un
          motore AI che genera e testa automaticamente nuove varianti.
        </p>
      </div>
    </div>
  );
}

