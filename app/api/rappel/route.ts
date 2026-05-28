import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Cette route est appelée par un cron job externe (ex: cron-job.org)
// Elle envoie les rappels 24h avant chaque leçon confirmée
const CRON_SECRET = process.env.CRON_SECRET || ""

export async function GET(req: NextRequest) {
  // Sécurité : vérifier le secret
  const secret = req.nextUrl.searchParams.get("secret")
  if (secret !== CRON_SECRET && CRON_SECRET !== "") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Trouver les réservations confirmées dans 20-28h
  const maintenant = new Date()
  const dans20h = new Date(maintenant.getTime() + 20 * 60 * 60 * 1000)
  const dans28h = new Date(maintenant.getTime() + 28 * 60 * 60 * 1000)

  const { data: reservations } = await supabase
    .from("reservations")
    .select(`
      id, date_heure, adresse_rdv,
      eleves(profiles(prenom, nom)),
      moniteurs(zone, profiles(prenom, nom))
    `)
    .eq("statut", "confirme")
    .gte("date_heure", dans20h.toISOString())
    .lte("date_heure", dans28h.toISOString())

  if (!reservations || reservations.length === 0) {
    return NextResponse.json({ message: "Aucun rappel à envoyer", count: 0 })
  }

  let envoyés = 0

  for (const r of reservations as any[]) {
    // Récupérer l'email de l'élève via auth
    const { data: users } = await supabase.auth.admin.listUsers()
    const eleveProfile = r.eleves?.profiles
    if (!eleveProfile) continue

    // Envoyer le rappel
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "https://easy-drive.onrender.com"}/api/emails`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "rappel_24h",
        data: {
          emailEleve: "", // sera complété avec auth admin
          prenomEleve: eleveProfile.prenom,
          prenomMoniteur: r.moniteurs?.profiles?.prenom,
          nomMoniteur: r.moniteurs?.profiles?.nom,
          dateHeure: r.date_heure,
          adresseRdv: r.adresse_rdv,
          zone: r.moniteurs?.zone,
        }
      })
    })
    envoyés++
  }

  return NextResponse.json({ message: `${envoyés} rappel(s) envoyé(s)`, count: envoyés })
}
