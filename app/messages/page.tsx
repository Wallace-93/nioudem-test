"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"

type Conversation = {
  reservation_id: string
  date_heure: string
  statut: string
  montant: number
  non_lus: number
  dernier_message: string | null
  dernier_message_date: string | null
  interlocuteur_prenom: string
  interlocuteur_nom: string
  role: "eleve" | "moniteur"
}

const STATUT_LABELS: Record<string, string> = {
  en_attente: "En attente",
  confirme: "Confirmée",
  refuse: "Refusée",
  annule: "Annulée",
  termine: "Terminée",
}

const STATUT_COLORS: Record<string, string> = {
  en_attente: "text-[#C9A84C] bg-[#C9A84C]/10 border-[#C9A84C]/30",
  confirme: "text-[#00F5A0] bg-[#00F5A0]/10 border-[#00F5A0]/30",
  refuse: "text-red-400 bg-red-500/10 border-red-500/30",
  annule: "text-muted-foreground bg-border/30 border-border",
  termine: "text-[#00D4FF] bg-[#00D4FF]/10 border-[#00D4FF]/30",
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<"eleve" | "moniteur" | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/connexion"); return }

      const { data: profile } = await supabase
        .from("profiles").select("role").eq("id", user.id).single()

      const role = profile?.role as "eleve" | "moniteur"
      setUserRole(role)

      // Charger les réservations selon le rôle
      let reservationsQuery

      if (role === "eleve") {
        const { data: eleve } = await supabase
          .from("eleves").select("id").eq("user_id", user.id).single()

        reservationsQuery = await supabase
          .from("reservations")
          .select(`
            id, date_heure, statut, montant,
            moniteurs(zone, profiles(prenom, nom))
          `)
          .eq("eleve_id", eleve?.id)
          .order("date_heure", { ascending: false })
      } else {
        const { data: moniteur } = await supabase
          .from("moniteurs").select("id").eq("user_id", user.id).single()

        reservationsQuery = await supabase
          .from("reservations")
          .select(`
            id, date_heure, statut, montant,
            eleves(profiles(prenom, nom))
          `)
          .eq("moniteur_id", moniteur?.id)
          .order("date_heure", { ascending: false })
      }

      const reservations = reservationsQuery.data || []

      // Pour chaque réservation, charger le dernier message et les non-lus
      const convs: Conversation[] = await Promise.all(
        reservations.map(async (r: any) => {
          const { data: msgs } = await supabase
            .from("messages")
            .select("contenu, lu, expediteur_id, created_at")
            .eq("reservation_id", r.id)
            .order("created_at", { ascending: false })
            .limit(1)

          const { count: nonLus } = await supabase
            .from("messages")
            .select("id", { count: "exact" })
            .eq("reservation_id", r.id)
            .eq("lu", false)
            .neq("expediteur_id", user.id)

          const interlocuteur = role === "eleve"
            ? r.moniteurs?.profiles
            : r.eleves?.profiles

          return {
            reservation_id: r.id,
            date_heure: r.date_heure,
            statut: r.statut,
            montant: r.montant,
            non_lus: nonLus || 0,
            dernier_message: msgs?.[0]?.contenu || null,
            dernier_message_date: msgs?.[0]?.created_at || null,
            interlocuteur_prenom: interlocuteur?.prenom || "",
            interlocuteur_nom: interlocuteur?.nom || "",
            role,
          }
        })
      )

      setConversations(convs)
    } catch (e) {
      console.error("Load error:", e)
    } finally {
      setLoading(false)
    }
    }
    load()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <svg className="w-8 h-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  )

  const totalNonLus = conversations.reduce((s, c) => s + c.non_lus, 0)

  return (
    <div className="font-sans text-foreground min-h-screen">
      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 px-4 md:px-8 py-3 flex items-center justify-between bg-background/85 backdrop-blur-md border-b border-border">
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
        <div className="flex items-center gap-4">
          <Link href={userRole === "moniteur" ? "/dashboard/moniteur" : "/dashboard/eleve"}
            className="text-muted-foreground text-sm hover:text-primary transition-colors">
            ← Dashboard
          </Link>
        </div>
      </nav>

      <div className="pt-20 pb-16 px-4 max-w-2xl mx-auto">
        <div className="mb-8 pt-4 flex items-center gap-3">
          <h1 className="text-2xl font-black tracking-tight">Messages</h1>
          {totalNonLus > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background">
              {totalNonLus} nouveau{totalNonLus > 1 ? "x" : ""}
            </span>
          )}
        </div>

        {conversations.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-lg font-bold mb-2">Aucune conversation</h3>
            <p className="text-muted-foreground text-sm mb-6">
              {userRole === "eleve"
                ? "Réservez une leçon pour commencer à échanger avec un moniteur."
                : "Vos échanges avec les élèves apparaîtront ici."}
            </p>
            {userRole === "eleve" && (
              <Link href="/resultats" className="inline-block px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:opacity-90 active:scale-95 transition-all">
                Trouver un moniteur →
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {conversations.map((c) => (
              <Link key={c.reservation_id} href={`/messages/${c.reservation_id}`}
                className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 hover:border-primary/40 active:scale-[0.99] transition-all">

                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00F5A0]/20 to-[#00D4FF]/20 flex items-center justify-center text-primary font-bold text-base">
                    {c.interlocuteur_prenom?.[0]}{c.interlocuteur_nom?.[0]}
                  </div>
                  {c.non_lus > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] flex items-center justify-center text-[10px] font-bold text-background">
                      {c.non_lus}
                    </div>
                  )}
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-sm truncate">
                      {c.interlocuteur_prenom} {c.interlocuteur_nom}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUT_COLORS[c.statut]}`}>
                        {STATUT_LABELS[c.statut]}
                      </span>
                    </div>
                  </div>
                  <p className={`text-xs truncate ${c.non_lus > 0 ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                    {c.dernier_message || "Aucun message — commencez la conversation"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {new Date(c.date_heure).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} · {c.montant}€
                    {c.dernier_message_date && (
                      <span> · {new Date(c.dernier_message_date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                    )}
                  </p>
                </div>

                <svg className="w-4 h-4 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
