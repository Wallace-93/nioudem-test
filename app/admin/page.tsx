"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"

// ⚠️ Remplace par ton email admin
const ADMIN_EMAILS = ["fallies.project@gmail.com"]

type Moniteur = {
  id: string
  diplome: string
  zone: string
  tarif_horaire: number
  verifie: boolean
  note_moyenne: number
  nb_avis: number
  created_at: string
  profiles: { prenom: string; nom: string; telephone: string }
  user_id: string
}

type Eleve = {
  id: string
  niveau: string
  type_permis: string
  zone_recherche: string
  created_at: string
  profiles: { prenom: string; nom: string; telephone: string }
}

type Reservation = {
  id: string
  date_heure: string
  statut: string
  montant: number
  commission: number
  created_at: string
  eleves: { profiles: { prenom: string; nom: string } }
  moniteurs: { profiles: { prenom: string; nom: string } }
}

type Stats = {
  totalMoniteurs: number
  moniteurVerifies: number
  moniteurEnAttente: number
  totalEleves: number
  totalReservations: number
  reservationsTerminees: number
  gmvTotal: number
  commissionsTotal: number
}

const STATUT_COLORS: Record<string, string> = {
  en_attente: "text-[#C9A84C] bg-[#C9A84C]/10 border-[#C9A84C]/30",
  confirme: "text-[#00F5A0] bg-[#00F5A0]/10 border-[#00F5A0]/30",
  refuse: "text-red-400 bg-red-500/10 border-red-500/30",
  annule: "text-muted-foreground bg-border/30 border-border",
  termine: "text-[#00D4FF] bg-[#00D4FF]/10 border-[#00D4FF]/30",
}

const STATUT_LABELS: Record<string, string> = {
  en_attente: "En attente", confirme: "Confirmée",
  refuse: "Refusée", annule: "Annulée", termine: "Terminée",
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"stats" | "moniteurs" | "eleves" | "reservations">("stats")
  const [stats, setStats] = useState<Stats | null>(null)
  const [moniteurs, setMoniteurs] = useState<Moniteur[]>([])
  const [eleves, setEleves] = useState<Eleve[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [actionMsg, setActionMsg] = useState("")
  const router = useRouter()
  const supabase = createClient()

  async function adminAction(table: string, id: string, data: Record<string, any>) {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) return false

    const res = await fetch("/api/admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ action: "update", table, id, data }),
    })
    return res.ok
  }

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
        router.push("/")
        return
      }

      const [
        { data: mons },
        { data: elvs },
        { data: ress },
      ] = await Promise.all([
        supabase.from("moniteurs").select("*, profiles(prenom, nom, telephone)").order("created_at", { ascending: false }),
        supabase.from("eleves").select("*, profiles(prenom, nom, telephone)").order("created_at", { ascending: false }),
        supabase.from("reservations").select("*, eleves(profiles(prenom, nom)), moniteurs(profiles(prenom, nom))").order("created_at", { ascending: false }),
      ])

      setMoniteurs(mons || [])
      setEleves(elvs || [])
      setReservations(ress || [])

      const gmv = (ress || []).filter(r => r.statut === "termine").reduce((s, r) => s + (r.montant || 0), 0)
      const commissions = (ress || []).filter(r => r.statut === "termine").reduce((s, r) => s + (r.commission || 0), 0)

      setStats({
        totalMoniteurs: (mons || []).length,
        moniteurVerifies: (mons || []).filter(m => m.verifie).length,
        moniteurEnAttente: (mons || []).filter(m => !m.verifie).length,
        totalEleves: (elvs || []).length,
        totalReservations: (ress || []).length,
        reservationsTerminees: (ress || []).filter(r => r.statut === "termine").length,
        gmvTotal: gmv,
        commissionsTotal: commissions,
      })

      setLoading(false)
    }
    load()
  }, [])

  async function verifierMoniteur(id: string, verifie: boolean) {
    const ok = await adminAction("moniteurs", id, { verifie })
    if (ok) {
      setMoniteurs(prev => prev.map(m => m.id === id ? { ...m, verifie } : m))
      setActionMsg(verifie ? "✓ Moniteur vérifié" : "✗ Vérification retirée")
    } else {
      setActionMsg("❌ Erreur — vérifiez SUPABASE_SERVICE_KEY")
    }
    setTimeout(() => setActionMsg(""), 4000)
  }

  async function updateReservationStatut(id: string, statut: string) {
    const ok = await adminAction("reservations", id, { statut })
    if (ok) {
      setReservations(prev => prev.map(r => r.id === id ? { ...r, statut } : r))
      setActionMsg("✓ Statut mis à jour")
    } else {
      setActionMsg("❌ Erreur — vérifiez SUPABASE_SERVICE_KEY")
    }
    setTimeout(() => setActionMsg(""), 4000)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <svg className="w-8 h-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  )

  return (
    <div className="font-sans text-foreground min-h-screen">
      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 px-4 md:px-8 py-3 flex items-center justify-between bg-background/95 backdrop-blur-md border-b border-[#C9A84C]/30">
        <Link href="/" className="flex flex-col">
          <span className="text-xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] bg-clip-text text-transparent">Easy Drive</span>
            <span className="font-light"> Drive</span>
          </span>
          <span className="text-[10px] font-black tracking-[0.15em] uppercase"
            style={{ background: "linear-gradient(135deg,#00F5A0,#00D4FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            auto-école 2.0
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#C9A84C] border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-3 py-1 rounded-full">
            🛠 Back-office Admin
          </span>
          {actionMsg && (
            <span className="text-xs font-semibold text-[#00F5A0]">{actionMsg}</span>
          )}
        </div>
      </nav>

      <div className="pt-20 pb-16 px-4 max-w-6xl mx-auto">
        <div className="mb-8 pt-4">
          <h1 className="text-2xl font-black tracking-tight mb-1">Back-office Easy Drive</h1>
          <p className="text-muted-foreground text-sm">Gestion des utilisateurs, réservations et revenus.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-card border border-border rounded-xl p-1 mb-8 w-fit overflow-x-auto">
          {([
            ["stats", "📊 Statistiques"],
            ["moniteurs", stats?.moniteurEnAttente ? `🎓 Moniteurs (${stats.moniteurEnAttente} en attente)` : `🎓 Moniteurs (${stats?.totalMoniteurs})`],
            ["eleves", `👤 Élèves (${stats?.totalEleves})`],
            ["reservations", `📅 Réservations (${stats?.totalReservations})`],
          ] as const).map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 whitespace-nowrap ${
                activeTab === tab
                  ? "bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}>{label}</button>
          ))}
        </div>

        {/* STATS */}
        {activeTab === "stats" && stats && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Moniteurs vérifiés", value: stats.moniteurVerifies, icon: "✅", color: "#00F5A0" },
                { label: "En attente vérif.", value: stats.moniteurEnAttente, icon: "⏳", color: "#C9A84C" },
                { label: "Élèves inscrits", value: stats.totalEleves, icon: "👤", color: "#00D4FF" },
                { label: "Total réservations", value: stats.totalReservations, icon: "📅", color: "#F1F5F9" },
              ].map(s => (
                <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Leçons terminées", value: stats.reservationsTerminees, icon: "🏁", color: "#00D4FF" },
                { label: "GMV total", value: `${stats.gmvTotal}€`, icon: "💰", color: "#00F5A0" },
                { label: "Commissions Easy Drive", value: `${stats.commissionsTotal}€`, icon: "💳", color: "#C9A84C" },
              ].map(s => (
                <div key={s.label} className="bg-card border border-border rounded-2xl p-6 text-center">
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className="text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-sm text-muted-foreground mt-1 font-medium">{s.label}</div>
                </div>
              ))}
            </div>

            {stats.moniteurEnAttente > 0 && (
              <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-2xl p-5 flex items-center gap-4">
                <span className="text-2xl">⚠️</span>
                <div>
                  <div className="font-bold text-sm text-[#C9A84C]">{stats.moniteurEnAttente} moniteur{stats.moniteurEnAttente > 1 ? "s" : ""} en attente de vérification</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Vérifiez les diplômes et activez les profils.</div>
                </div>
                <button onClick={() => setActiveTab("moniteurs")}
                  className="ml-auto px-4 py-2 rounded-lg text-xs font-bold bg-[#C9A84C] text-background active:scale-95 transition-all">
                  Voir →
                </button>
              </div>
            )}
          </div>
        )}

        {/* MONITEURS */}
        {activeTab === "moniteurs" && (
          <div className="flex flex-col gap-4">
            {/* En attente d'abord */}
            {moniteurs.filter(m => !m.verifie).length > 0 && (
              <div className="bg-[#C9A84C]/5 border border-[#C9A84C]/20 rounded-2xl p-4 mb-2">
                <div className="text-xs font-bold text-[#C9A84C] uppercase tracking-wider mb-3">⏳ En attente de vérification</div>
                <div className="flex flex-col gap-3">
                  {moniteurs.filter(m => !m.verifie).map(m => (
                    <div key={m.id} className="bg-card border border-[#C9A84C]/30 rounded-xl p-4 flex items-center gap-4 flex-wrap">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F5A0]/20 to-[#00D4FF]/20 flex items-center justify-center text-primary font-bold flex-shrink-0">
                        {m.profiles?.prenom?.[0]}{m.profiles?.nom?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm">{m.profiles?.prenom} {m.profiles?.nom}</div>
                        <div className="text-xs text-muted-foreground">{m.diplome} · {m.zone} · {m.tarif_horaire}€/leçon</div>
                        <div className="text-xs text-muted-foreground">{m.profiles?.telephone}</div>
                        <div className="text-xs text-muted-foreground">Inscrit le {new Date(m.created_at).toLocaleDateString("fr-FR")}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => verifierMoniteur(m.id, true)}
                          className="px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background active:scale-95 transition-all">
                          ✓ Vérifier
                        </button>
                        <button onClick={() => verifierMoniteur(m.id, false)}
                          className="px-4 py-2 rounded-lg text-xs font-semibold border border-red-500/30 text-red-400 hover:bg-red-500/10 active:scale-95 transition-all">
                          ✗ Refuser
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tous les moniteurs */}
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Tous les moniteurs</div>
            {moniteurs.map(m => (
              <div key={m.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 flex-wrap">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F5A0]/20 to-[#00D4FF]/20 flex items-center justify-center text-primary font-bold flex-shrink-0">
                  {m.profiles?.prenom?.[0]}{m.profiles?.nom?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm">{m.profiles?.prenom} {m.profiles?.nom}</span>
                    {m.verifie
                      ? <span className="text-[10px] font-bold text-[#00F5A0] bg-[#00F5A0]/10 border border-[#00F5A0]/30 px-2 py-0.5 rounded-full">✓ Vérifié</span>
                      : <span className="text-[10px] font-bold text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/30 px-2 py-0.5 rounded-full">⏳ En attente</span>
                    }
                  </div>
                  <div className="text-xs text-muted-foreground">{m.diplome} · {m.zone} · {m.tarif_horaire}€ · {m.note_moyenne?.toFixed(1) || "—"}★ ({m.nb_avis} avis)</div>
                </div>
                <button onClick={() => verifierMoniteur(m.id, !m.verifie)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold active:scale-95 transition-all border ${
                    m.verifie
                      ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                      : "bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background border-transparent"
                  }`}>
                  {m.verifie ? "Retirer vérif." : "✓ Vérifier"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ÉLÈVES */}
        {activeTab === "eleves" && (
          <div className="flex flex-col gap-3">
            {eleves.map(e => (
              <div key={e.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F5A0]/20 to-[#00D4FF]/20 flex items-center justify-center text-primary font-bold flex-shrink-0">
                  {e.profiles?.prenom?.[0]}{e.profiles?.nom?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm">{e.profiles?.prenom} {e.profiles?.nom}</div>
                  <div className="text-xs text-muted-foreground">
                    Permis {e.type_permis} · {e.niveau} · {e.zone_recherche}
                  </div>
                  <div className="text-xs text-muted-foreground">{e.profiles?.telephone} · Inscrit le {new Date(e.created_at).toLocaleDateString("fr-FR")}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RÉSERVATIONS */}
        {activeTab === "reservations" && (
          <div className="flex flex-col gap-3">
            {reservations.map(r => (
              <div key={r.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-sm">
                      {r.eleves?.profiles?.prenom} {r.eleves?.profiles?.nom}
                    </span>
                    <span className="text-muted-foreground text-xs">→</span>
                    <span className="font-bold text-sm">
                      {r.moniteurs?.profiles?.prenom} {r.moniteurs?.profiles?.nom}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUT_COLORS[r.statut]}`}>
                      {STATUT_LABELS[r.statut]}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(r.date_heure).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    {" · "}{r.montant}€ ({r.commission}€ commission)
                  </div>
                </div>
                <select
                  value={r.statut}
                  onChange={e => updateReservationStatut(r.id, e.target.value)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-background border border-border focus:border-primary focus:outline-none transition-colors">
                  <option value="en_attente">En attente</option>
                  <option value="confirme">Confirmée</option>
                  <option value="refuse">Refusée</option>
                  <option value="annule">Annulée</option>
                  <option value="termine">Terminée</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
