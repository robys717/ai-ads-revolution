import { motion } from "framer-motion";

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="text-lg font-semibold tracking-wide">AI Ads Revolution</div>
        <nav className="space-x-4">
          <a href="/dashboard" className="underline">Dashboard</a>
          <a href="/assets/upload" className="underline">Upload</a>
        </nav>
      </header>

      <main className="px-6 md:px-12">
        <motion.section
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="mt-10 md:mt-20 grid md:grid-cols-2 gap-10 items-center"
        >
          <div>
            <h1 className="h1">La piattaforma ADS con <span className="text-sky-400">Intelligenza</span>.</h1>
            <p className="mt-4 text-neutral-300 max-w-lg">
              Crea, ottimizza e misura le tue campagne con KPI reali. Preparata per AI, scalabile e veloce.
            </p>
            <div className="mt-6 flex gap-3">
              <a href="/dashboard" className="px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-semibold">Apri Dashboard</a>
              <a href="/public/widget.js" className="px-5 py-3 rounded-xl border border-neutral-700">Widget</a>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="card"
          >
            <div className="text-neutral-400 mb-2">Anteprima KPI</div>
            <img src="https://dummyimage.com/900x500/0b1220/6b7280&text=AI+Ads+Revolution" alt="Preview" className="rounded-xl w-full" />
          </motion.div>
        </motion.section>
      </main>

      <footer className="px-6 py-10 text-neutral-500 mt-16">© {new Date().getFullYear()} AI Ads Revolution</footer>
    </div>
  );
}
