import React from "react";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2rem",
        background: "#f3f4f6",
        color: "#0f172a",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        AI Ads Revolution – versione base online
      </h1>
      <p style={{ marginBottom: "0.5rem" }}>
        Se vedi questa pagina, il frontend React è attivo e collegato al 
tuo dominio.
      </p>
      <p>
        Prossimi step: grafica avanzata, dashboard KPI, AI campagne, 
pannello di controllo
        completo.
      </p>
    </div>
  );
}

