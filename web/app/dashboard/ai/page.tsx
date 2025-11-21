"use client";

import { useEffect, useState } from "react";

interface Campaign {
  id: string;
  name: string;
  status: string;
  dailyBudget: number;
  createdAt: string;
}

function getStats(index: number, dailyBudget: number) {
  const impressions = 1000 + index * 500 + Math.round(dailyBudget * 10);
  const ctr = 1.2 + index * 0.4; // %
  const clicks = Math.round(impressions * (ctr / 100));
  const conversions = Math.round(clicks * 0.05); // 5% dei click
  return { impressions, ctr, clicks, conversions };
}

function getRecommendation(c: Campaign, index: number) {
  const stats = getStats(index, c.dailyBudget || 0);

  if (stats.conversions >= 10 && c.dailyBudget < 30) {
    return {
      label: "Aumenta budget",
      severity: "high",
      message:
        "Questa campagna converte bene ma ha un budget relativamente basso. L'AI consiglia di aumentare il budget del 20–40% per scalare i risultati.",
      stats,
    };
  }

  if (stats.ctr < 1 && stats.impressions > 2000) {
    return {
      label: "Testa nuove creatività",
      severity: "medium",
      message:
        "Tante impression ma CTR basso. L'AI suggerisce di testare nuovi titoli, immagini o video più aggressivi sul target.",
      stats,
    };
  }

  if (stats.conversions === 0 && stats.impressions > 3000) {
    return {
      label: "Valuta pausa / revisione",
      severity: "medium",
      message:
        "Molte impression ma zero conversioni. L'AI consiglia di rivedere offerta, pagina di destinazione o targeting.",
      stats,
    };
  }

  if (stats.ctr >= 2 && stats.conversions > 0) {
    return {
      label: "Mantieni e monitora",
      severity: "low",
      message:
        "La campagna ha buon CTR e converte. Mantieni il budget attuale e monitora l'andamento.",
      stats,
    };
  }

  return {
    label: "Dati in raccolta",
    severity: "low",
    message:
      "La campagna è ancora in fase iniziale. L'AI consiglia di attendere più dati prima di modificare budget o creatività.",
    stats,
  };
}

export default function AiOptimizationPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const res = await fetch("/api/campaigns");
        const data = await res.json();
        setCampaigns(data);
      } catch (err) {
        console.error("Errore nel caricamento campagne", err);
      } finally {
        setLoading(false);
      }
    }

    loadCampaigns();
  }, []);

  const summary = campaigns.reduce(
    (acc, c, index) => {
      const { impressions, conversions } = getStats(index, c.dailyBudget || 0);
      acc.impressions += impressions;
      acc.conversions += conversions;
      acc.budget += c.dailyBudget || 0;
      return acc;
    },
    { impressions: 0, conversions: 0, budget: 0 }
  );

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">AI Optimization</h1>
        <p className="text-sm text-slate-400 mb-6">
          Qui l&apos;intelligenza artificiale analizza le tue campagne e ti
          restituisce consigli pratici su budget, creatività e strategie.
        </p>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs text-slate-400 mb-1">Budget totale</h3>
            <p className="text-2xl font-bold">
              € {summary.budget.toFixed(2)}
            </p>
          </div>
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs text-slate-400 mb-1">Impression simulate</h3>
            <p className="text-2xl font-bold">
              {summary.impressions.toLocaleString("it-IT")}
            </p>
          </div>
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs text-slate-400 mb-1">
              Conversioni simulate
            </h3>
            <p className="text-2xl font-bold">
              {summary.conversions.toLocaleString("it-IT")}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-slate-400">Analisi in corso...</div>
        ) : campaigns.length === 0 ? (
          <div className="text-sm text-slate-400">
            Nessuna campagna da analizzare. Crea una campagna nella sezione
            &quot;Campagne&quot;.
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((c, index) => {
              const rec = getRecommendation(c, index);
              const badgeColor =
                rec.severity === "high"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : rec.severity === "medium"
                  ? "bg-amber-500/20 text-amber-200 border border-amber-500/40"
                  : "bg-emerald-500/15 text-emerald-200 border border-emerald-500/30";

              return (
                <div
                  key={c.id}
                  className="bg-[#111827] border border-slate-800 rounded-2xl p-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h2 className="text-sm font-semibold">{c.name}</h2>
                      <p className="text-[11px] text-slate-400">
                        Budget: € {c.dailyBudget.toFixed(2)} · CTR stimato:{" "}
                        {rec.stats.ctr.toFixed(1)}% · Conv:{" "}
                        {rec.stats.conversions}
                      </p>
                    </div>
                    <span
                      className={`text-[11px] px-2 py-1 rounded-full ${badgeColor}`}
                    >
                      {rec.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mb-2">{rec.message}</p>
                  <p className="text-[11px] text-slate-500">
                    Impression stimate:{" "}
                    {rec.stats.impressions.toLocaleString("it-IT")} · Click
                    stimati: {rec.stats.clicks.toLocaleString("it-IT")}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-[11px] text-slate-500 mt-6">
          Nota: queste raccomandazioni si basano su simulazioni interne della
          piattaforma. Quando AI Ads Revolution sarà collegata ai dati reali
          (impression, click, conversioni), questo modulo userà le metriche
          vere per ottimizzare in automatico.
        </p>
      </div>
    </div>
  );
}
