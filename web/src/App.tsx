import { useState } from "react";

export default function App() {
  const [advice, setAdvice] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  const getAdvice = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/ai/advise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([
          {
            channel: "google",
            date: "2025-11-09",
            impressions: 12000,
            clicks: 360,
            spend: 48.2,
            conversions: 18,
            revenue: 260,
            hour: 14,
            campaign_id: "CAMP-1"
          }
        ])
      });
      const data = await r.json();
      setAdvice(data.advice || ["Nessun consiglio ricevuto"]);
    } catch (e) {
      setAdvice(["Errore nel contattare l'AI"]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrap">
      <h1>AI Ads Revolution</h1>
      <p>La pubblicità intelligente: trasparente, automatica, misurabile.</p>
      <button onClick={getAdvice} disabled={loading}>
        {loading ? "Analisi in corso..." : "Ottieni consigli AI"}
      </button>
      {advice && (
        <ul className="advice">
          {advice.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      )}
    </div>
  );
}
