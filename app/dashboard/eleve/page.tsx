"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"

type Profile = { id: string; prenom: string; nom: string }
type Eleve = { id: string; niveau: string; type_permis: string; zone_recherche: string; budget_max: number }
type Reservation = {
  id: string; date_heure: string; statut: string; montant: number
  moniteurs: { note_moyenne: number; tarif_horaire: number; zone: string; profiles: { prenom: string; nom: string } }
}
type Avis = { id: string; note: number; commentaire: string; created_at: string; moniteurs: { profiles: { prenom: string; nom: string } } }

const CONSEILS = [
  { titre: "Visualisation", desc: "Imaginez mentalement le trajet avant chaque leçon. Ça prépare votre cerveau à anticiper.", icon: "🧠", color: "#00D4FF" },
  { titre: "Réviser le code", desc: "15 minutes par jour sur l'application code suffisent pour progresser régulièrement.", icon: "📚", color: "#00F5A0" },
  { titre: "Respiration", desc: "En cas de stress, respirez lentement avant de démarrer. Ça stabilise votre concentration.", icon: "🌬️", color: "#C9A84C" },
  { titre: "Debriefing", desc: "Après chaque leçon, notez 3 points positifs et 1 point à améliorer.", icon: "✍️", color: "#00D4FF" },
]

const OBJECTIFS_DEMO = [
  { label: "Créneaux serrés en ville", niveau: 40, statut: "en_cours" },
  { label: "Rétroviseurs autoroute", niveau: 60, statut: "en_cours" },
  { label: "Priorité à droite", niveau: 75, statut: "en_cours" },
  { label: "Conduite en ville", niveau: 100, statut: "acquis" },
  { label: "Démarrage en côte", niveau: 100, statut: "acquis" },
  { label: "Stationnement", niveau: 85, statut: "en_cours" },
]

const CARNET_DEMO = [
  { date: "18 mai", moniteur: "Sophie M.", note: "Bonne séance d'ensemble. Progresser sur les créneaux serrés et bien checker les rétroviseurs avant de changer de voie sur autoroute.", points_positifs: ["Démarrage en côte parfait", "Bonne gestion des feux"], axe: "Créneaux serrés" },
  { date: "12 mai", moniteur: "Sophie M.", note: "Très belle maîtrise du rond-point. Quelques hésitations sur la priorité à droite en zone résidentielle.", points_positifs: ["Rond-point maîtrisé", "Bonne vitesse adaptative"], axe: "Priorité à droite" },
  { date: "5 mai", moniteur: "Sophie M.", note: "Première séance sur autoroute réussie. Bien travailler les distances de sécurité.", points_positifs: ["Insertion autoroute réussie", "Bonne maîtrise vitesse"], axe: "Distances sécurité" },
]

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2 bg-border rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500"
        style={{ width: `${value}%`, background: color }} />
    </div>
  )
}

export default function DashboardEleve() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [eleve, setEleve] = useState<Eleve | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [avis, setAvis] = useState<Avis[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "carnet" | "objectifs" | "reservations">("overview")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/connexion"); return }

      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setProfile(prof)

      const { data: elv } = await supabase.from("eleves").select("*").eq("user_id", user.id).single()
      setEleve(elv)

      if (elv) {
        const { data: res } = await supabase
          .from("reservations").select(`*, moniteurs(note_moyenne, tarif_horaire, zone, profiles(prenom, nom))`)
          .eq("eleve_id", elv.id).order("date_heure", { ascending: false })
        setReservations(res || [])
      }
    } catch (e) {
      console.error("Load error:", e)
    } finally {
      setLoading(false)
    }
    }
    load()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/")
  }

  const leconsFaites = reservations.filter(r => r.statut === "termine").length
  const totalDepense = reservations.filter(r => r.statut === "termine").reduce((s, r) => s + (r.montant || 0), 0)
  const prochaineLecon = reservations.find(r => r.statut === "confirme" && new Date(r.date_heure) > new Date())
  const progression = Math.min(100, leconsFaites * 8 + 10)

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
      <nav className="fixed top-0 w-full z-50 px-4 md:px-8 py-3 flex items-center justify-between bg-background/85 backdrop-blur-md border-b border-border">
        <Link href="/" className="flex flex-col">
          <span className="text-xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] bg-clip-text text-transparent">Easy Drive</span>
            <span className="font-light"> Drive</span>
          </span>
          <span className="text-[10px] font-black tracking-[0.15em] uppercase" style={{ background: "linear-gradient(135deg,#00F5A0,#00D4FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>auto-école 2.0</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden md:block">{profile?.prenom} {profile?.nom} · Élève</span>
          <button onClick={handleLogout} className="px-4 py-2 rounded-lg text-sm font-semibold border border-border hover:border-primary hover:text-primary active:scale-95 transition-all">Déconnexion</button>
        </div>
      </nav>

      <div className="pt-20 pb-16 px-4 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8 pt-4 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Bonjour, <span className="bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] bg-clip-text text-transparent">{profile?.prenom} 👋</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Votre carnet d'apprentissage · Permis {eleve?.type_permis || "B"}</p>
          </div>
          <Link href="/resultats" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:opacity-90 active:scale-95 transition-all">
            + Réserver une leçon
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-card border border-border rounded-xl p-1 mb-8 w-fit overflow-x-auto">
          {([
            ["overview", "🏠 Accueil"],
            ["objectifs", "🎯 Objectifs"],
            ["carnet", "📓 Carnet de bord"],
            ["reservations", "📅 Mes leçons"],
          ] as const).map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 whitespace-nowrap ${activeTab === tab ? "bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background" : "text-muted-foreground hover:text-foreground"}`}>{label}</button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-6">

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Leçons effectuées", value: leconsFaites || "0", icon: "✅", color: "#00F5A0" },
                { label: "Progression estimée", value: `${progression}%`, icon: "📈", color: "#00D4FF" },
                { label: "Total investi", value: `${totalDepense}€`, icon: "💳", color: "#C9A84C" },
                { label: "Permis visé", value: eleve?.type_permis || "B", icon: "🚗", color: "#F1F5F9" },
              ].map((s) => (
                <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Progression vers l'examen */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold">Ma progression vers l'examen</h2>
                <span className="text-lg font-black bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] bg-clip-text text-transparent">{progression}%</span>
              </div>
              <ProgressBar value={progression} color="linear-gradient(90deg, #00F5A0, #00D4FF)" />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Débutant</span>
                <span>Prêt pour l'examen</span>
              </div>
              {leconsFaites === 0 && (
                <p className="text-xs text-muted-foreground mt-4 bg-background/50 rounded-xl p-3">
                  🎯 Réservez votre première leçon pour commencer votre progression et débloquer votre carnet de bord personnalisé.
                </p>
              )}
            </div>

            {/* Prochaine leçon */}
            <div className={`rounded-2xl p-6 ${prochaineLecon ? "bg-gradient-to-br from-[#00F5A0]/8 to-[#00D4FF]/8 border border-[#00F5A0]/20" : "bg-card border border-border"}`}>
              <h2 className="text-base font-bold mb-3">Prochaine leçon</h2>
              {prochaineLecon ? (
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00F5A0] to-[#00D4FF] flex items-center justify-center text-background font-black text-lg">
                      {prochaineLecon.moniteurs?.profiles?.prenom?.[0]}{prochaineLecon.moniteurs?.profiles?.nom?.[0]}
                    </div>
                    <div>
                      <div className="font-bold">{prochaineLecon.moniteurs?.profiles?.prenom} {prochaineLecon.moniteurs?.profiles?.nom}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(prochaineLecon.date_heure).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div className="text-xs text-muted-foreground">{prochaineLecon.moniteurs?.zone}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-[#00F5A0]">{prochaineLecon.montant}€</div>
                    <div className="text-xs text-muted-foreground">leçon 45 min</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <p className="text-muted-foreground text-sm">Aucune leçon programmée pour le moment.</p>
                  <Link href="/resultats" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:opacity-90 active:scale-95 transition-all">
                    Trouver un moniteur →
                  </Link>
                </div>
              )}
            </div>

            {/* Aperçu objectifs + conseils */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Objectifs aperçu */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold">🎯 Axes à travailler</h2>
                  <button onClick={() => setActiveTab("objectifs")} className="text-xs text-primary hover:underline">Voir tout →</button>
                </div>
                <div className="flex flex-col gap-3">
                  {OBJECTIFS_DEMO.filter(o => o.statut === "en_cours").slice(0, 3).map((obj) => (
                    <div key={obj.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{obj.label}</span>
                        <span className="font-semibold" style={{ color: obj.niveau >= 80 ? "#00F5A0" : obj.niveau >= 50 ? "#C9A84C" : "#ef4444" }}>{obj.niveau}%</span>
                      </div>
                      <ProgressBar value={obj.niveau} color={obj.niveau >= 80 ? "#00F5A0" : obj.niveau >= 50 ? "#C9A84C" : "#ef4444"} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Conseil du jour */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-base font-bold mb-4">💡 Conseils de progression</h2>
                <div className="flex flex-col gap-3">
                  {CONSEILS.slice(0, 2).map((c) => (
                    <div key={c.titre} className="flex gap-3 p-3 rounded-xl border border-border bg-background/50">
                      <div className="text-xl flex-shrink-0">{c.icon}</div>
                      <div>
                        <div className="text-sm font-semibold" style={{ color: c.color }}>{c.titre}</div>
                        <div className="text-xs text-muted-foreground leading-relaxed mt-0.5">{c.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OBJECTIFS */}
        {activeTab === "objectifs" && (
          <div className="flex flex-col gap-5">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-base font-bold mb-6">Mes objectifs de conduite</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">En cours d'acquisition</div>
                  <div className="flex flex-col gap-4">
                    {OBJECTIFS_DEMO.filter(o => o.statut === "en_cours").map((obj) => (
                      <div key={obj.label}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-medium">{obj.label}</span>
                          <span className="font-bold" style={{ color: obj.niveau >= 80 ? "#00F5A0" : obj.niveau >= 50 ? "#C9A84C" : "#ef4444" }}>{obj.niveau}%</span>
                        </div>
                        <ProgressBar value={obj.niveau} color={obj.niveau >= 80 ? "#00F5A0" : obj.niveau >= 50 ? "#C9A84C" : "#ef4444"} />
                        <div className="text-xs text-muted-foreground mt-1">
                          {obj.niveau < 50 ? "⚠️ Priorité haute" : obj.niveau < 80 ? "🔄 En progression" : "✅ Presque acquis"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Acquis ✓</div>
                  <div className="flex flex-col gap-3">
                    {OBJECTIFS_DEMO.filter(o => o.statut === "acquis").map((obj) => (
                      <div key={obj.label} className="flex items-center gap-3 p-3 bg-[#00F5A0]/5 border border-[#00F5A0]/20 rounded-xl">
                        <div className="w-8 h-8 rounded-full bg-[#00F5A0]/20 flex items-center justify-center text-[#00F5A0] font-bold text-sm">✓</div>
                        <span className="text-sm font-medium text-[#00F5A0]">{obj.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Conseils de progression</div>
                    <div className="flex flex-col gap-3">
                      {CONSEILS.map((c) => (
                        <div key={c.titre} className="flex gap-3 p-3 rounded-xl border border-border bg-background/50">
                          <div className="text-lg flex-shrink-0">{c.icon}</div>
                          <div>
                            <div className="text-xs font-semibold" style={{ color: c.color }}>{c.titre}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{c.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CARNET DE BORD */}
        {activeTab === "carnet" && (
          <div className="flex flex-col gap-5">
            {leconsFaites === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <div className="text-5xl mb-4">📓</div>
                <h3 className="text-lg font-bold mb-2">Votre carnet est vide pour l'instant</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">Après chaque leçon, votre moniteur remplira votre carnet de bord avec ses observations, points positifs et axes d'amélioration.</p>
                <Link href="/resultats" className="inline-block px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:opacity-90 active:scale-95 transition-all">
                  Réserver ma première leçon →
                </Link>
              </div>
            ) : (
              CARNET_DEMO.map((entry, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F5A0]/20 to-[#00D4FF]/20 flex items-center justify-center text-primary font-bold text-sm">
                        {entry.moniteur.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <div className="text-sm font-bold">{entry.moniteur}</div>
                        <div className="text-xs text-muted-foreground">Leçon du {entry.date}</div>
                      </div>
                    </div>
                    <div className="text-xs font-semibold px-3 py-1 rounded-full bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/30">
                      À travailler : {entry.axe}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 bg-background/50 rounded-xl p-4 border-l-2 border-[#00D4FF]">
                    "{entry.note}"
                  </p>

                  <div>
                    <div className="text-xs font-bold text-[#00F5A0] mb-2">✓ Points positifs</div>
                    <div className="flex flex-wrap gap-2">
                      {entry.points_positifs.map((p) => (
                        <span key={p} className="text-xs px-3 py-1 rounded-full bg-[#00F5A0]/10 text-[#00F5A0] border border-[#00F5A0]/20">{p}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* RÉSERVATIONS */}
        {activeTab === "reservations" && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold">Mes leçons</h2>
              <Link href="/resultats" className="px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:opacity-90 active:scale-95 transition-all">
                + Nouvelle leçon
              </Link>
            </div>

            {reservations.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📅</div>
                <p className="text-muted-foreground mb-4">Aucune leçon pour l'instant.</p>
                <Link href="/resultats" className="inline-block px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:opacity-90 active:scale-95 transition-all">
                  Trouver un moniteur →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {reservations.map((r) => {
                  const colors: Record<string, string> = { en_attente: "text-[#C9A84C] bg-[#C9A84C]/10 border-[#C9A84C]/30", confirme: "text-[#00F5A0] bg-[#00F5A0]/10 border-[#00F5A0]/30", refuse: "text-red-400 bg-red-500/10 border-red-500/30", annule: "text-muted-foreground bg-border/30 border-border", termine: "text-[#00D4FF] bg-[#00D4FF]/10 border-[#00D4FF]/30" }
                  const labels: Record<string, string> = { en_attente: "En attente", confirme: "Confirmée", refuse: "Refusée", annule: "Annulée", termine: "Terminée" }
                  return (
                    <div key={r.id} className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F5A0]/20 to-[#00D4FF]/20 flex items-center justify-center text-sm font-bold text-primary">
                          {r.moniteurs?.profiles?.prenom?.[0]}{r.moniteurs?.profiles?.nom?.[0]}
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{r.moniteurs?.profiles?.prenom} {r.moniteurs?.profiles?.nom}</div>
                          <div className="text-xs text-muted-foreground">{new Date(r.date_heure).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap justify-end">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${colors[r.statut]}`}>{labels[r.statut]}</span>
                        <span className="text-sm font-bold">{r.montant}€</span>
                        {r.statut === "termine" && (
                          <Link href={`/avis?reservation=${r.id}`}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/30 hover:bg-[#C9A84C]/20 active:scale-95 transition-all">
                            ★ Laisser un avis
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
