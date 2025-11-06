export default function Contact(){
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-semibold">Contatti</h1>
      <p className="text-slate-300">Scrivici per info commerciali e partnership.</p>
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 shadow-md">
        <div className="space-y-2">
          <div><span className="text-slate-400">Email:</span> <a className="hover:text-blue-400" href="mailto:info@aiadsrevolution.com">info@aiadsrevolution.com</a></div>
          <div><span className="text-slate-400">Sito:</span> <a className="hover:text-blue-400" href="https://aiadsrevolution.com">aiadsrevolution.com</a></div>
        </div>
      </div>
    </main>
  );
}
