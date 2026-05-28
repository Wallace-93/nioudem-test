"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase-client"

export default function Connexion() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin() {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError("Email ou mot de passe incorrect.")
      setLoading(false)
      return
    }

    if (data.session) {
      await new Promise(r => setTimeout(r, 500))
      window.location.replace("/dashboard")
    } else {
      setError("Connexion échouée. Réessayez.")
      setLoading(false)
    }
  }

  return (
    <div className="font-sans text-foreground min-h-screen flex flex-col">
      <nav className="fixed top-0 w-full z-50 px-4 md:px-8 py-3 flex items-center justify-between bg-background/85 backdrop-blur-md border-b border-border">
        <Link href="/" className="flex flex-col">
          <span className="text-xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] bg-clip-text text-transparent">Easy Drive</span>
            <span className="font-light text-foreground"> Drive</span>
          </span>
          <span className="text-[10px] font-black tracking-[0.15em] uppercase"
            style={{ background: "linear-gradient(135deg,#00F5A0,#00D4FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            auto-école 2.0
          </span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 pt-24 pb-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black tracking-tight mb-2">
              Bon retour <span className="bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] bg-clip-text text-transparent">!</span>
            </h1>
            <p className="text-muted-foreground text-sm">Connectez-vous à votre compte Easy Drive</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 flex flex-col gap-5">
            <div>
              <label htmlFor="email" className="text-sm font-semibold block mb-2">Email</label>
              <input id="email" name="email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)} autoComplete="email"
                placeholder="vous@exemple.com"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-sm transition-colors" />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-semibold block mb-2">Mot de passe</label>
              <input id="password" name="password" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
                placeholder="••••••••"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-sm transition-colors" />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button type="button" onClick={handleLogin} disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:opacity-90 transition-all disabled:opacity-50">
              {loading ? "Connexion..." : "Se connecter"}
            </button>

            <div className="pt-4 border-t border-border text-center text-sm text-muted-foreground">
              Pas encore de compte ?{" "}
              <Link href="/inscription" className="text-primary font-semibold hover:underline">Créer un compte élève</Link>
              {" · "}
              <Link href="/inscription-moniteur" className="text-primary font-semibold hover:underline">Je suis moniteur</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
