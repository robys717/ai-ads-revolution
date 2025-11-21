"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabaseClient";

type StatCard = {
  label: string;
  helper: string;
};

type Campaign = {
  id: string;
  name: string;
  status: string;
  daily_budget: number;
  objective: string | null;
  created_at: string;
};

const STAT_CARDS: StatCard[] = [
  {
    label: "Spesa totale (ultimo mese)",
    helper: "Appena lanci le prime campagne, vedrai qui la spesa aggregata.",
  },
  {
    label: "Impression totali",
    helper: "Il numero di volte in cui gli annunci sono stati mostrati.",
  },
  {
    label: "Click totali",
    helper: "Click complessivi sugli annunci nelle tue campagne.",
  },
];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBudget, setNewBudget] = useState("");
  const [newObjective, setNewObjective] = useState("");
  const [creating, setCreating] = useState(false);

  const [loggingOut, setLoggingOut] = useState(false);

  // Stato per Assistente AI
  const [aiProductDescription, setAiProductDescription] = useState("");
  const [aiGoal, setAiGoal] = useState("Aumentare le vendite");
  const [aiLanguage, setAiLanguage] = useState("Italiano");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState("");

  useEffect(() => {
    const load = async () => {
      setError(null);
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Errore supabase.auth.getUser:", error);
        setError(error.message || "Errore nel recupero utente.");
        setLoadingCampaigns(false);
        return;
      }

      if (!user) {
        window.location.href = "/auth/login";
        return;
      }

      setUser(user);

      const { data, error: campaignsError } = await supabase
        .from("campaigns")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (campaignsError) {
        console.error("Errore caricamento campaigns:", campaignsError);
        setError(
          campaignsError.message ||
            "Impossibile caricare le campagne dal database."
        );
      } else {
        setCampaigns((data || []) as Campaign[]);
      }

      setLoadingCampaigns(false);
    };

    load();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      window.location.href = "/auth/login";
    } catch (e) {
      setLoggingOut(false);
      alert("Errore durante il logout. Riprova.");
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setCreating(true);

    const raw = newBudget.replace(",", ".").trim();
    const parsed = parseFloat(raw);
    const budgetNumber = Number.isNaN(parsed) ? 0 : parsed;

    try {
      const { data, error } = await supabase
        .from("campaigns")
        .insert([
          {
            user_id: user.id,
            name: newName,
            daily_budget: budgetNumber,
            objective: newObjective || null,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Errore insert campaigns:", error);
        setError(
          error.message ||
            `Errore nella creazione della campagna: ${JSON.stringify(error)}`
        );
      } else if (data) {
        setCampaigns((prev) => [data as Campaign, ...prev]);
        setNewName("");
        setNewBudget("");
        setNewObjective("");
        setShowNewForm(false);
      }
    } catch (err) {
      console.error("Errore imprevisto insert campaigns:", err);
      setError("Errore imprevisto nella creazione della campagna.");
    } finally {
      setCreating(false);
    }
  };

  const handleGenerateAiCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiError(null);
    setAiResult("");
    setAiLoading(true);

    try {
      const res = await fetch("/api/ai/generate-copy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productDescription: aiProductDescription,
          goal: aiGoal,
          language: aiLanguage,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setAiError(data.error || "Errore nella generazione AI.");
      } else {
        const data = await res.json();
        setAiResult(data.result || "");
      }
    } catch (err) {
      console.error("Errore chiamata /api/ai/generate-copy:", err);
      setAiError("Errore di rete durante la richiesta AI.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute top-40 -left-10 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-5 md:px-8">
        {/* HEADER */}
        <header className="mb-6 flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-950/80 px-4 py-3 shadow-md shadow-black/40 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 text-xl font-bold shadow-lg shadow-cyan-500/40">
              AI
            </div>
            <div className="leading-tight">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-cyan-300">
                Advertiser Dashboard
              </p>
              <h1 className="text-sm font-semibold text-slate-50">
                AI Ads Revolution
              </h1>
              {user && (
                <p className="text-[0.65rem] text-slate-400">
                  Loggato come{" "}
                  <span className="text-slate-200">{user.email}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/"
              className="hidden rounded-full border border-slate-700/80 px-3 py-1 text-slate-300 transition hover:border-cyan-400/70 hover:text-cyan-200 md:inline-flex"
            >
              ← Torna alla home
            </Link>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-full bg-slate-100 px-3 py-1.5 text-[0.75rem] font-semibold text-slate-950 shadow shadow-slate-900/40 transition hover:bg-cyan-50 disabled:opacity-60"
            >
              {loggingOut ? "Disconnessione..." : "Esci"}
            </button>
          </div>
        </header>

        {/* PANORAMICA KPI + CREAZIONE CAMPAGNA */}
        <section>
          <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-50">
                Panoramica performance
              </h2>
              <p className="text-xs text-slate-400">
                Quando inizierai a lanciare campagne, vedrai qui i principali
                indicatori di performance.
              </p>
            </div>
            <button
              onClick={() => setShowNewForm((v) => !v)}
              className="self-start rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 px-4 py-1.5 text-xs font-semibold text-slate-950 shadow shadow-cyan-500/60 transition hover:brightness-110"
            >
              {showNewForm ? "Annulla" : "+ Crea nuova campagna"}
            </button>
          </div>

          {showNewForm && (
            <form
              onSubmit={handleCreateCampaign}
              className="mb-4 grid gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/85 p-4 text-xs md:grid-cols-4"
            >
              <div className="flex flex-col gap-1">
                <label className="text-[0.7rem] text-slate-300">
                  Nome campagna
                </label>
                <input
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/40"
                  placeholder="Es. Lancio e-commerce"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[0.7rem] text-slate-300">
                  Budget giornaliero (€)
                </label>
                <input
                  required
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/40"
                  placeholder="Es. 20"
                />
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-[0.7rem] text-slate-300">
                  Obiettivo
                </label>
                <input
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/40"
                  placeholder="Es. Vendite, traffico, brand awareness"
                />
              </div>

              <div className="md:col-span-4 flex items-center justify-between pt-1">
                {error && (
                  <p className="text-[0.7rem] text-red-400">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={creating}
                  className="ml-auto rounded-full bg-slate-100 px-4 py-1.5 text-[0.75rem] font-semibold text-slate-950 shadow shadow-slate-900/40 transition hover:bg-cyan-50 disabled:opacity-60"
                >
                  {creating ? "Salvataggio..." : "Salva campagna"}
                </button>
              </div>
            </form>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            {STAT_CARDS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-800/80 bg-slate-950/85 p-4 shadow-inner shadow-black/60"
              >
                <p className="text-xs text-slate-400">{stat.label}</p>
                <p className="mt-2 text-lg font-semibold text-sky-300">—</p>
                <p className="mt-1 text-[0.7rem] text-slate-400">
                  {stat.helper}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ASSISTENTE AI ANNUNCI */}
        <section className="mt-8">
          <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-50">
                Assistente AI per annunci sponsorizzati
              </h2>
              <p className="text-xs text-slate-400">
                Descrivi il tuo prodotto: l&apos;AI genererà titoli, descrizioni
                e call to action pronti da usare nelle tue campagne.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <form
              onSubmit={handleGenerateAiCopy}
              className="flex flex-col gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/85 p-4 text-xs shadow-inner shadow-black/60"
            >
              <div className="flex flex-col gap-1">
                <label className="text-[0.7rem] text-slate-300">
                  Descrivi il tuo prodotto / servizio
                </label>
                <textarea
                  required
                  value={aiProductDescription}
                  onChange={(e) => setAiProductDescription(e.target.value)}
                  rows={6}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/40"
                  placeholder="Es. Sneakers da running leggere per donna, ideali per allenamenti quotidiani..."
                />
              </div>

              <div className="flex flex-col gap-2 md:flex-row">
                <div className="flex flex-1 flex-col gap-1">
                  <label className="text-[0.7rem] text-slate-300">
                    Obiettivo campagna
                  </label>
                  <select
                    value={aiGoal}
                    onChange={(e) => setAiGoal(e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/40"
                  >
                    <option>Aumentare le vendite</option>
                    <option>Generare lead</option>
                    <option>Aumentare il traffico al sito</option>
                    <option>Brand awareness</option>
                  </select>
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <label className="text-[0.7rem] text-slate-300">
                    Lingua degli annunci
                  </label>
                  <select
                    value={aiLanguage}
                    onChange={(e) => setAiLanguage(e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/40"
                  >
                    <option>Italiano</option>
                    <option>Inglese</option>
                    <option>Spagnolo</option>
                    <option>Francese</option>
                    <option>Tedesco</option>
                  </select>
                </div>
              </div>

              {aiError && (
                <p className="text-[0.7rem] text-red-400">{aiError}</p>
              )}

              <button
                type="submit"
                disabled={aiLoading}
                className="mt-1 inline-flex items-center justify-center rounded-full bg-slate-100 px-4 py-1.5 text-[0.75rem] font-semibold text-slate-950 shadow shadow-slate-900/40 transition hover:bg-cyan-50 disabled:opacity-60"
              >
                {aiLoading
                  ? "Generazione in corso..."
                  : "Genera annunci con AI"}
              </button>
            </form>

            <div className="flex flex-col gap-2 rounded-2xl border border-slate-800/80 bg-slate-950/85 p-4 text-xs shadow-inner shadow-black/60">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-cyan-300">
                Output AI
              </p>
              {!aiResult && !aiLoading && (
                <p className="text-[0.75rem] text-slate-400">
                  Qui vedrai titoli, descrizioni e call to action suggerite
                  dall&apos;intelligenza artificiale in base al prodotto che
                  descrivi.
                </p>
              )}
              {aiLoading && (
                <p className="text-[0.75rem] text-slate-400">
                  L&apos;AI sta generando suggerimenti per i tuoi annunci...
                </p>
              )}
              {aiResult && !aiLoading && (
                <pre className="mt-1 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-950/90 px-3 py-2 text-[0.75rem] text-slate-100">
                  {aiResult}
                </pre>
              )}
            </div>
          </div>
        </section>

        {/* TABELLA CAMPAGNE */}
        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-50">
                Campagne sponsorizzate
              </h2>
              <p className="text-xs text-slate-400">
                Elenco delle tue campagne attive, in pausa e in bozza.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/85 shadow-inner shadow-black/60">
            {loadingCampaigns ? (
              <div className="px-4 py-6 text-xs text-slate-400">
                Caricamento campagne...
              </div>
            ) : campaigns.length === 0 ? (
              <div className="px-4 py-6 text-xs text-slate-400">
                Non hai ancora nessuna campagna. Crea la tua prima campagna per
                iniziare a vedere risultati.
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="min-w-full border-collapse text-xs">
                  <thead className="bg-slate-900/80 text-slate-300">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">
                        Nome campagna
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Stato
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Budget/giorno
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Obiettivo
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Creata il
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((camp) => (
                      <tr
                        key={camp.id}
                        className="border-t border-slate-800/80 bg-slate-950/70 hover:bg-slate-900/70"
                      >
                        <td className="px-4 py-3 text-slate-100">
                          {camp.name}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${
                              camp.status === "Attiva"
                                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
                                : camp.status === "In pausa"
                                ? "bg-amber-500/10 text-amber-300 border border-amber-500/40"
                                : "bg-slate-500/10 text-slate-300 border border-slate-500/40"
                            }`}
                          >
                            {camp.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-200">
                          € {camp.daily_budget.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-slate-200">
                          {camp.objective || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {new Date(camp.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="border-t border-slate-800/80 px-4 py-3 text-[0.7rem] text-slate-400">
              Questi dati provengono dalla tabella <code>campaigns</code> del tuo
              progetto Supabase. Più avanti collegheremo impression, click e
              spesa reale.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
