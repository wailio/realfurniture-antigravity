"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        window.location.href = "/admin/dashboard";
      } else {
        const data = await res.json();
        setError(data.error || "Mot de passe incorrect.");
      }
    } catch {
      setError("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0E0F10] px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-[rgba(199,203,209,0.18)] bg-[#18191B]">
            <Lock className="h-7 w-7 text-[#C7CBD1]" />
          </div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-light text-[#F2F1EF]">
            Administration
          </h1>
          <p className="mt-2 text-sm text-[#B7BBC0]">
            Panneau d&apos;administration Château d&apos;art
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#B7BBC0]"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-[rgba(199,203,209,0.18)] bg-[#18191B] px-4 py-3 text-sm text-[#F2F1EF] placeholder-[#B7BBC0]/40 transition-colors focus:border-[#C7CBD1] focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C7CBD1] py-3 text-sm font-medium tracking-wider text-[#0E0F10] transition-all hover:bg-[#DFE1E4] disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-[#B7BBC0]/50">
          © 2026 Château d&apos;art. Panneau admin.
        </p>
      </div>
    </main>
  );
}
