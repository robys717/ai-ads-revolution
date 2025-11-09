import React from "react";
import { Link } from "react-router-dom";
export default function NotFound(){
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-100 grid place-items-center px-4">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <h1 className="text-2xl font-bold">404 – Pagina non trovata</h1>
        <p className="opacity-80 mt-2">Controlla l’URL oppure torna alla dashboard.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Link to="/" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10">Home</Link>
          <Link to="/admin" className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">Dashboard</Link>
        </div>
      </div>
    </div>
  )
}
