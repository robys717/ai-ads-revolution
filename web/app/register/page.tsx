"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("testa@aiads.com");
  const [password, setPassword] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // DOPO che confermi, Supabase ti ributta qui:
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/login`
            : undefined,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message || "Errore durante la registrazione.");
      return;
    }

    // se la conferma email è attiva, non hai sessione subito
    if (!data.session) {
      setInfo(
        "Account creato. Controlla la casella email e clicca sul link di conferma, poi effettua il login."
      );
    } else {
      setInfo("Registrazione completata. Ti stiamo portando alla dashboard...");
      setTimeout(() => router.push("/dashboard"), 1200);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl p-6 shadow-[0_0_60px_rgba(15,23,42,0.9)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center">
            <span className="text-cyan-300 font-semibold text-lg">AI</span>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide">
              AI Ads Revolution
            </p>
            <p className="text-xs text-slate-400">
              Registrazione nuovo inserzionista
            </p>
          </div>
        </div>

        <h1 className="text-xl font-semibold mb-2">
          Crea il tuo account inserzionista
        </h1>
        <p className="text-sm text-slate-400 mb-5">
          Potrai gestire campagne, budget e performance dalla dashboard AI.
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/60 bg-rose-950/60 px-3 py-2 text-xs text-rose-100">
            {error}
          </div>
        )}

        {info && (
          <div className="mb-4 rounded-xl border border-emerald-500/60 bg-emerald-950/60 px-3 py-2 text-xs text-emerald-100">
            {info}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/60"
              placeholder="la tua email"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300">Password</label>
            <input
              type="password"
              value={password}
              minLength={6}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/60"
              placeholder="minimo 6 caratteri"
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-xl bg-cyan-500 text-slate-950 text-sm font-semibold py-2.5 hover:bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? "Creazione account..." : "Registrati"}
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-400 text-center">
          Hai già un account?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-cyan-300 hover:text-cyan-200 underline-offset-2 hover:underline"
          >
            Vai al login
          </button>
        </p>
      </div>
    </div>
  );
}
