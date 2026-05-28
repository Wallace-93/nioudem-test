"use client"
export const dynamic = "force-dynamic"
import { useState } from "react"
import { createClient } from "@supabase/supabase-js"
import Link from "next/link"

export default function Connexion() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
<<<<<<< Updated upstream
  const [status, setStatus] = useState("")

  async function login() {
    setStatus("Connexion...")
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
=======
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin() {
    setLoading(true)
    setError(null)
    const supabase = createClient()
>>>>>>> Stashed changes
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
<<<<<<< Updated upstream
      setStatus("Erreur : " + error.message)
    } else if (data.session) {
      setStatus("✅ Connecté ! Redirection...")
      await new Promise(r => setTimeout(r, 500))
      window.location.replace("/dashboard")
=======
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
>>>>>>> Stashed changes
    }
  }

  return (
<<<<<<< Updated upstream
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 16 }}>
      <h1>Connexion</h1>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
        style={{ padding: 12, borderRadius: 8, border: "1px solid #333", background: "#1a1f2e", color: "white", width: 300 }} />
      <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)}
        style={{ padding: 12, borderRadius: 8, border: "1px solid #333", background: "#1a1f2e", color: "white", width: 300 }}
        onKeyDown={e => e.key === 'Enter' && login()} />
      <button onClick={login}
        style={{ padding: "12px 32px", borderRadius: 8, background: "#00F5A0", color: "#0A0F1E", fontWeight: "bold", border: "none", cursor: "pointer" }}>
        Se connecter
      </button>
      {status && <p style={{ color: status.includes("Erreur") ? "#ff6b6b" : "#00F5A0" }}>{status}</p>}
      <Link href="/inscription" style={{ color: "#666" }}>Pas de compte ? S'inscrire</Link>
=======
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
>>>>>>> Stashed changes
    </div>
  )
}
