import React from "react";
import { isRouteErrorResponse, useRouteError, Link } from "react-router-dom";

export default function ErrorPage(){
  const error = useRouteError();
  let title = "Qualcosa è andato storto";
  let message = "Si è verificato un errore inaspettato.";
  let status = 500;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    if (status === 404) {
      title = "Pagina non trovata";
      message = "La risorsa richiesta non esiste oppure è stata spostata.";
    } else {
      title = `Errore ${status}`;
      message = error.statusText || message;
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-100 grid place-items-center px-4">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="opacity-80 mt-2">{message}</p>
        <div className="opacity-60 text-xs mt-2">{status}</div>
        <div className="mt-6 flex justify-center gap-2">
          <Link to="/" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10">Torna alla Home</Link>
          <a href="/api/health" className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">Stato API</a>
        </div>
      </div>
    </div>
  );
}
