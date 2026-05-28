"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase-client"
import { useRouter, useParams } from "next/navigation"

type Message = {
  id: string
  contenu: string
  lu: boolean
  expediteur_id: string
  created_at: string
  profiles: { prenom: string; nom: string }
}

type Reservation = {
  id: string
  date_heure: string
  statut: string
  montant: number
  eleve_id: string
  moniteur_id: string
}

export default function ConversationPage() {
  const params = useParams()
  const reservationId = params.reservationId as string
  const [messages, setMessages] = useState<Message[]>([])
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [interlocuteur, setInterlocuteur] = useState<{ prenom: string; nom: string } | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [contenu, setContenu] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/connexion"); return }
      setUserId(user.id)

      // Charger la réservation
      const { data: res } = await supabase
        .from("reservations")
        .select("*")
        .eq("id", reservationId)
        .single()

      if (!res) { router.push("/messages"); return }
      setReservation(res)

      // Déterminer l'interlocuteur
      const { data: profile } = await supabase
        .from("profiles").select("role").eq("id", user.id).single()

      if (profile?.role === "eleve") {
        const { data: mon } = await supabase
          .from("moniteurs")
          .select("profiles(prenom, nom)")
          .eq("id", res.moniteur_id)
          .single()
        setInterlocuteur((mon as any)?.profiles || null)
      } else {
        const { data: elv } = await supabase
          .from("eleves")
          .select("profiles(prenom, nom)")
          .eq("id", res.eleve_id)
          .single()
        setInterlocuteur((elv as any)?.profiles || null)
      }

      // Charger les messages
      const { data: msgs } = await supabase
        .from("messages")
        .select("*, profiles(prenom, nom)")
        .eq("reservation_id", reservationId)
        .order("created_at", { ascending: true })

      setMessages(msgs || [])

      // Marquer comme lus
      await supabase
        .from("messages")
        .update({ lu: true })
        .eq("reservation_id", reservationId)
        .neq("expediteur_id", user.id)

      setLoading(false)
    }
    load()
  }, [reservationId])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${reservationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `reservation_id=eq.${reservationId}` },
        async (payload) => {
          const { data: newMsg } = await supabase
            .from("messages")
            .select("*, profiles(prenom, nom)")
            .eq("id", payload.new.id)
            .single()
          if (newMsg) {
            setMessages(prev => [...prev, newMsg])
            // Mark as read if from other
            if (newMsg.expediteur_id !== userId) {
              await supabase.from("messages").update({ lu: true }).eq("id", newMsg.id)
            }
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [reservationId, userId])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage() {
    if (!contenu.trim() || !userId || !reservation) return
    setSending(true)
    setError(null)

    const { error: msgError } = await supabase.from("messages").insert({
      reservation_id: reservationId,
      expediteur_id: userId,
      contenu: contenu.trim(),
      lu: false,
    })

    if (msgError) {
      setError("Erreur lors de l'envoi : " + msgError.message)
    } else {
      setContenu("")
    }
    setSending(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <svg className="w-8 h-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  )

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

  return (
    <div className="font-sans text-foreground h-screen flex flex-col">
      {/* NAV */}
      <nav className="flex-shrink-0 px-4 md:px-8 py-3 flex items-center justify-between bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3">
          <Link href="/messages" className="text-muted-foreground hover:text-primary transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00F5A0]/20 to-[#00D4FF]/20 flex items-center justify-center text-primary font-bold text-sm">
              {interlocuteur?.prenom?.[0]}{interlocuteur?.nom?.[0]}
            </div>
            <div>
              <div className="text-sm font-bold">{interlocuteur?.prenom} {interlocuteur?.nom}</div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUT_COLORS[reservation?.statut || "en_attente"]}`}>
                  {STATUT_LABELS[reservation?.statut || "en_attente"]}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {reservation && new Date(reservation.date_heure).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} · {reservation?.montant}€
                </span>
              </div>
            </div>
          </div>
        </div>
        <Link href="/" className="flex flex-col items-end">
          <span className="text-base font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] bg-clip-text text-transparent">Easy Drive</span>
            <span className="font-light"> Drive</span>
          </span>
        </Link>
      </nav>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-3xl mb-3">💬</div>
            <p className="text-muted-foreground text-sm">Commencez la conversation !</p>
            <p className="text-muted-foreground text-xs mt-1">Posez vos questions, précisez vos attentes, coordonnez le point de RDV.</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMine = msg.expediteur_id === userId
          const showDate = i === 0 || new Date(msg.created_at).toDateString() !== new Date(messages[i-1].created_at).toDateString()

          return (
            <div key={msg.id}>
              {showDate && (
                <div className="text-center my-3">
                  <span className="text-[11px] text-muted-foreground bg-card border border-border px-3 py-1 rounded-full">
                    {new Date(msg.created_at).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                  </span>
                </div>
              )}
              <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] ${isMine ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  {!isMine && (
                    <span className="text-[11px] text-muted-foreground ml-1">
                      {msg.profiles?.prenom}
                    </span>
                  )}
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    isMine
                      ? "bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background rounded-br-sm"
                      : "bg-card border border-border text-foreground rounded-bl-sm"
                  }`}>
                    {msg.contenu}
                  </div>
                  <span className={`text-[10px] text-muted-foreground ${isMine ? "mr-1" : "ml-1"}`}>
                    {new Date(msg.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    {isMine && msg.lu && <span className="ml-1 text-[#00F5A0]">✓ Lu</span>}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="flex-shrink-0 border-t border-border bg-background/95 px-4 py-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2 mb-3 text-xs text-red-400">
            {error}
          </div>
        )}
        <div className="flex gap-3 items-end">
          <textarea
            value={contenu}
            onChange={e => setContenu(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez votre message... (Entrée pour envoyer)"
            rows={1}
            className="flex-1 px-4 py-3 rounded-2xl bg-card border border-border focus:border-primary focus:outline-none text-sm transition-colors resize-none"
            style={{ minHeight: "48px", maxHeight: "120px" }}
            onInput={e => {
              const t = e.target as HTMLTextAreaElement
              t.style.height = "auto"
              t.style.height = Math.min(t.scrollHeight, 120) + "px"
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!contenu.trim() || sending}
            className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 flex-shrink-0"
          >
            {sending ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2 text-center">
          Shift+Entrée pour aller à la ligne · Entrée pour envoyer
        </p>
      </div>
    </div>
  )
}
