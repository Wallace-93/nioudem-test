"use client"
export const dynamic = "force-dynamic"
import { useState } from "react"
import { createClient } from "@supabase/supabase-js"
import Link from "next/link"

export default function Inscription() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [prenom, setPrenom] = useState("")
  const [nom, setNom] = useState("")
  const [role, setRole] = useState<"eleve" | "moniteur">("eleve")
  const [status, setStatus] = useState("")

  async function inscrire() {
    setStatus("Inscription...")
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )

    // 1. Créer le compte auth
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) { setStatus("Erreur : " + error.message); return }
    if (!data.user) { setStatus("Erreur : utilisateur non créé"); return }

    // 2. Créer le profil
    const { error: profError } = await supabase.from("profiles").insert({
      id: data.user.id,
      prenom,
      nom,
      role,
      telephone: ""
    })
    if (profError) { setStatus("Erreur profil : " + profError.message); return }

    // 3. Créer eleve ou moniteur
    if (role === "eleve") {
      await supabase.from("eleves").insert({ user_id: data.user.id })
    } else {
      await supabase.from("moniteurs").insert({
        user_id: data.user.id,
        diplome: "BEPECASER",
        zone: "Paris",
        rayon_km: 15,
        tarif_horaire: 50,
        boite_auto: false,
        verifie: false,
        note_moyenne: 0,
        nb_avis: 0
      })
    }

    setStatus("✅ Compte créé ! Redirection...")
    await new Promise(r => setTimeout(r, 500))
    window.location.replace("/dashboard")
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 16 }}>
      <h1>Inscription</h1>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setRole("eleve")}
          style={{ padding: "8px 16px", borderRadius: 8, background: role === "eleve" ? "#00F5A0" : "#1a1f2e", color: role === "eleve" ? "#0A0F1E" : "white", border: "1px solid #333", cursor: "pointer" }}>
          Élève
        </button>
        <button onClick={() => setRole("moniteur")}
          style={{ padding: "8px 16px", borderRadius: 8, background: role === "moniteur" ? "#00F5A0" : "#1a1f2e", color: role === "moniteur" ? "#0A0F1E" : "white", border: "1px solid #333", cursor: "pointer" }}>
          Moniteur
        </button>
      </div>
      {[
        { val: prenom, set: setPrenom, ph: "Prénom", type: "text" },
        { val: nom, set: setNom, ph: "Nom", type: "text" },
        { val: email, set: setEmail, ph: "Email", type: "email" },
        { val: password, set: setPassword, ph: "Mot de passe", type: "password" },
      ].map(({ val, set, ph, type }) => (
        <input key={ph} type={type} placeholder={ph} value={val} onChange={e => set(e.target.value)}
          style={{ padding: 12, borderRadius: 8, border: "1px solid #333", background: "#1a1f2e", color: "white", width: 300 }} />
      ))}
      <button onClick={inscrire}
        style={{ padding: "12px 32px", borderRadius: 8, background: "#00F5A0", color: "#0A0F1E", fontWeight: "bold", border: "none", cursor: "pointer" }}>
        Créer mon compte
      </button>
      {status && <p style={{ color: status.includes("Erreur") ? "#ff6b6b" : "#00F5A0" }}>{status}</p>}
      <Link href="/connexion" style={{ color: "#666" }}>Déjà un compte ? Se connecter</Link>
    </div>
  )
}
