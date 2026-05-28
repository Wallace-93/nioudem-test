import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import {
  emailReservationEleve,
  emailNouvelleDemandeMoniteur,
  emailLeconConfirmee,
  emailRappelLecon,
  emailNouveauMoniteurAdmin,
  emailRappel24h,
} from "@/lib/email-templates"

const FROM = "Easy Drive <onboarding@resend.dev>"

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY || "")
  try {
    const body = await req.json()
    const { type, data } = body

    if (!type || !data) {
      return NextResponse.json({ error: "type et data requis" }, { status: 400 })
    }

    let result

    switch (type) {
      case "reservation_eleve":
        result = await resend.emails.send({
          from: FROM,
          to: data.emailEleve,
          subject: `Demande envoyée à ${data.prenomMoniteur} ${data.nomMoniteur}`,
          html: emailReservationEleve(data),
        })
        break

      case "nouvelle_demande_moniteur":
        result = await resend.emails.send({
          from: FROM,
          to: data.emailMoniteur,
          subject: `Nouvelle demande de ${data.prenomEleve} ${data.nomEleve}`,
          html: emailNouvelleDemandeMoniteur(data),
        })
        break

      case "lecon_confirmee":
        result = await resend.emails.send({
          from: FROM,
          to: data.emailEleve,
          subject: `✅ Leçon confirmée — ${data.prenomMoniteur} ${data.nomMoniteur}`,
          html: emailLeconConfirmee(data),
        })
        break

      case "rappel_lecon":
        result = await resend.emails.send({
          from: FROM,
          to: data.emailEleve,
          subject: `🚗 Rappel : votre leçon demain !`,
          html: emailRappelLecon(data),
        })
        break

      case "nouveau_moniteur_admin":
        result = await resend.emails.send({
          from: FROM,
          to: data.emailAdmin,
          subject: `⏳ Nouveau moniteur à vérifier : ${data.prenomMoniteur} ${data.nomMoniteur}`,
          html: emailNouveauMoniteurAdmin(data),
        })
        break

      case "rappel_24h":
        result = await resend.emails.send({
          from: FROM,
          to: data.emailEleve,
          subject: `🚗 Rappel : votre leçon demain avec ${data.prenomMoniteur} ${data.nomMoniteur}`,
          html: emailRappel24h(data),
        })
        break

      default:
        return NextResponse.json({ error: "Type d'email inconnu" }, { status: 400 })
    }

    return NextResponse.json({ success: true, id: result.data?.id })
  } catch (error: any) {
    console.error("Email error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
