"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message || "Credenziali non valide.");
        return;
      }

      window.location.href = "/dashboard";
    } catch (err) {
      setError("Errore durante il login. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-slate-900 p-6 rounded-xl border border-slate-800"
      >
        <h2 className="text-xl font-semibold mb-4">Accedi</h2>

        {error && <div className="text-red-400 text-sm mb-3">{error}</div>}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 rounded bg-slate-800 mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 rounded bg-slate-800 mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-cyan-500 text-slate-900 font-semibold rounded"
        >
          {loading ? "Attendere..." : "Accedi"}
        </button>

        <div className="mt-4 text-sm">
          Non hai un account?{" "}
          <Link href="/auth/register" className="text-cyan-300">
            Registrati
          </Link>
        </div>
      </form>
    </div>
  );
}
