"use client"
export const dynamic = "force-dynamic"
import { useState } from "react"
import { createClient } from "@supabase/supabase-js"
import Link from "next/link"

export default function Connexion() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState("")

  async function login() {
    setStatus("Connexion...")
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setStatus("Erreur : " + error.message)
    } else if (data.session) {
      setStatus("✅ Connecté ! Redirection...")
      await new Promise(r => setTimeout(r, 500))
      window.location.replace("/dashboard")
    }
  }

  return (
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
    </div>
  )
}
