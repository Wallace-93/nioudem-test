// Templates HTML pour les emails Easy Drive

const baseStyle = `
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #0A0F1E;
  color: #F1F5F9;
  margin: 0;
  padding: 0;
`

const containerStyle = `
  max-width: 560px;
  margin: 0 auto;
  padding: 40px 24px;
`

const cardStyle = `
  background: #111827;
  border: 1px solid #1f2937;
  border-radius: 16px;
  padding: 32px;
  margin: 24px 0;
`

const btnStyle = `
  display: inline-block;
  padding: 14px 28px;
  background: linear-gradient(135deg, #00F5A0, #00D4FF);
  color: #0A0F1E;
  font-weight: 700;
  font-size: 14px;
  text-decoration: none;
  border-radius: 12px;
  margin: 16px 0;
`

const mutedStyle = `color: #94A3B8; font-size: 13px; line-height: 1.6;`
const headingStyle = `color: #F1F5F9; font-size: 22px; font-weight: 800; margin: 0 0 8px;`
const labelStyle = `color: #94A3B8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;`
const valueStyle = `color: #F1F5F9; font-size: 15px; font-weight: 600;`

function header() {
  return `
    <div style="text-align: center; margin-bottom: 32px;">
      <span style="font-size: 22px; font-weight: 900; color: #00F5A0;">Easy Drive</span>
      <span style="font-size: 22px; font-weight: 300; color: #F1F5F9;"> Drive</span>
      <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.2em; color: #00D4FF; text-transform: uppercase; margin-top: 2px;">auto-école 2.0</div>
    </div>
  `
}

function footer() {
  return `
    <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #1f2937;">
      <p style="${mutedStyle}">Easy Drive · Île-de-France · <a href="https://easy-drive.onrender.com" style="color: #00F5A0; text-decoration: none;">easy-drive.onrender.com</a></p>
      <p style="color: #4B5563; font-size: 11px; margin-top: 8px;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  `
}

function row(label: string, value: string) {
  return `
    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #1f2937;">
      <span style="${labelStyle}">${label}</span>
      <span style="${valueStyle}">${value}</span>
    </div>
  `
}

// Email 1 — Confirmation de réservation pour l'élève
export function emailReservationEleve({
  prenomEleve,
  prenomMoniteur,
  nomMoniteur,
  dateHeure,
  zone,
  montant,
  adresseRdv,
}: {
  prenomEleve: string
  prenomMoniteur: string
  nomMoniteur: string
  dateHeure: string
  zone: string
  montant: number
  adresseRdv?: string
}) {
  const date = new Date(dateHeure)
  const dateFormatted = date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  const heureFormatted = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8"><title>Demande de réservation envoyée</title></head>
    <body style="${baseStyle}">
      <div style="${containerStyle}">
        ${header()}
        <h1 style="${headingStyle}">Demande envoyée ✓</h1>
        <p style="${mutedStyle}">Bonjour ${prenomEleve}, votre demande de réservation a bien été transmise à <strong style="color: #F1F5F9;">${prenomMoniteur} ${nomMoniteur}</strong>.</p>
        <div style="${cardStyle}">
          ${row("Moniteur", `${prenomMoniteur} ${nomMoniteur}`)}
          ${row("Date", dateFormatted)}
          ${row("Heure", heureFormatted)}
          ${row("Durée", "45 minutes")}
          ${row("Zone", adresseRdv || zone)}
          ${row("Montant", `${montant}€`)}
        </div>
        <p style="${mutedStyle}">Le moniteur dispose de <strong style="color: #F1F5F9;">24h</strong> pour confirmer ou refuser votre demande. Vous recevrez un email dès sa réponse.</p>
        <div style="text-align: center;">
          <a href="https://easy-drive.onrender.com/dashboard/eleve" style="${btnStyle}">Voir mes réservations →</a>
        </div>
        ${footer()}
      </div>
    </body>
    </html>
  `
}

// Email 2 — Notification au moniteur : nouvelle demande
export function emailNouvelleDemandeMoniteur({
  prenomMoniteur,
  prenomEleve,
  nomEleve,
  dateHeure,
  montant,
  adresseRdv,
}: {
  prenomMoniteur: string
  prenomEleve: string
  nomEleve: string
  dateHeure: string
  montant: number
  adresseRdv?: string
}) {
  const date = new Date(dateHeure)
  const dateFormatted = date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  const heureFormatted = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8"><title>Nouvelle demande de réservation</title></head>
    <body style="${baseStyle}">
      <div style="${containerStyle}">
        ${header()}
        <h1 style="${headingStyle}">Nouvelle demande 🎉</h1>
        <p style="${mutedStyle}">Bonjour ${prenomMoniteur}, <strong style="color: #F1F5F9;">${prenomEleve} ${nomEleve}</strong> souhaite réserver une leçon avec vous.</p>
        <div style="${cardStyle}">
          ${row("Élève", `${prenomEleve} ${nomEleve}`)}
          ${row("Date demandée", dateFormatted)}
          ${row("Heure", heureFormatted)}
          ${row("Durée", "45 minutes")}
          ${adresseRdv ? row("Point de RDV", adresseRdv) : ""}
          ${row("Montant", `${montant}€ (vous recevez ${Math.round(montant * 0.85)}€)`)}
        </div>
        <p style="${mutedStyle}">⚠️ Vous avez <strong style="color: #C9A84C;">24h</strong> pour confirmer ou refuser cette demande.</p>
        <div style="text-align: center;">
          <a href="https://easy-drive.onrender.com/dashboard/moniteur" style="${btnStyle}">Répondre à la demande →</a>
        </div>
        ${footer()}
      </div>
    </body>
    </html>
  `
}

// Email 3 — Confirmation de leçon (après acceptation du moniteur)
export function emailLeconConfirmee({
  prenomEleve,
  prenomMoniteur,
  nomMoniteur,
  dateHeure,
  montant,
  adresseRdv,
  zone,
}: {
  prenomEleve: string
  prenomMoniteur: string
  nomMoniteur: string
  dateHeure: string
  montant: number
  adresseRdv?: string
  zone: string
}) {
  const date = new Date(dateHeure)
  const dateFormatted = date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  const heureFormatted = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  const rappel = new Date(date.getTime() - 24 * 60 * 60 * 1000).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8"><title>Leçon confirmée !</title></head>
    <body style="${baseStyle}">
      <div style="${containerStyle}">
        ${header()}
        <div style="background: linear-gradient(135deg, rgba(0,245,160,0.1), rgba(0,212,255,0.1)); border: 1px solid rgba(0,245,160,0.2); border-radius: 16px; padding: 24px; margin-bottom: 24px; text-align: center;">
          <div style="font-size: 36px; margin-bottom: 8px;">✅</div>
          <h1 style="color: #00F5A0; font-size: 22px; font-weight: 800; margin: 0;">Leçon confirmée !</h1>
        </div>
        <p style="${mutedStyle}">Bonjour ${prenomEleve}, <strong style="color: #F1F5F9;">${prenomMoniteur} ${nomMoniteur}</strong> a confirmé votre leçon. C'est officiel !</p>
        <div style="${cardStyle}">
          ${row("Moniteur", `${prenomMoniteur} ${nomMoniteur}`)}
          ${row("Date", dateFormatted)}
          ${row("Heure", heureFormatted)}
          ${row("Lieu de RDV", adresseRdv || zone)}
          ${row("Montant", `${montant}€`)}
        </div>
        <div style="background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.3); border-radius: 12px; padding: 16px; margin: 16px 0;">
          <p style="color: #C9A84C; font-size: 13px; margin: 0;">💡 Un rappel vous sera envoyé le <strong>${rappel}</strong>, la veille de votre leçon.</p>
        </div>
        <div style="text-align: center;">
          <a href="https://easy-drive.onrender.com/dashboard/eleve" style="${btnStyle}">Voir ma leçon →</a>
        </div>
        ${footer()}
      </div>
    </body>
    </html>
  `
}

// Email 4 — Rappel 24h avant la leçon
export function emailRappelLecon({
  prenomEleve,
  prenomMoniteur,
  nomMoniteur,
  dateHeure,
  adresseRdv,
  zone,
}: {
  prenomEleve: string
  prenomMoniteur: string
  nomMoniteur: string
  dateHeure: string
  adresseRdv?: string
  zone: string
}) {
  const date = new Date(dateHeure)
  const heureFormatted = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8"><title>Rappel : votre leçon demain !</title></head>
    <body style="${baseStyle}">
      <div style="${containerStyle}">
        ${header()}
        <h1 style="${headingStyle}">Votre leçon, c'est demain ! 🚗</h1>
        <p style="${mutedStyle}">Bonjour ${prenomEleve}, petit rappel : vous avez une leçon demain avec <strong style="color: #F1F5F9;">${prenomMoniteur} ${nomMoniteur}</strong>.</p>
        <div style="${cardStyle}">
          ${row("Heure", heureFormatted)}
          ${row("Lieu de RDV", adresseRdv || zone)}
          ${row("Moniteur", `${prenomMoniteur} ${nomMoniteur}`)}
        </div>
        <div style="background: rgba(0,245,160,0.08); border: 1px solid rgba(0,245,160,0.2); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #00F5A0; font-size: 14px; font-weight: 600; margin: 0 0 12px;">💡 Conseils pour demain</p>
          <ul style="color: #94A3B8; font-size: 13px; margin: 0; padding-left: 20px; line-height: 1.8;">
            <li>Arrivez 5 minutes en avance au point de RDV</li>
            <li>Munissez-vous de votre pièce d'identité</li>
            <li>Reposez-vous bien ce soir</li>
            <li>Visualisez mentalement votre trajet</li>
          </ul>
        </div>
        <div style="text-align: center;">
          <a href="https://easy-drive.onrender.com/dashboard/eleve" style="${btnStyle}">Voir les détails →</a>
        </div>
        ${footer()}
      </div>
    </body>
    </html>
  `
}

// Email 5 — Notification admin : nouveau moniteur inscrit
export function emailNouveauMoniteurAdmin({
  prenomMoniteur,
  nomMoniteur,
  diplome,
  zone,
  telephone,
  adminUrl,
}: {
  prenomMoniteur: string
  nomMoniteur: string
  diplome: string
  zone: string
  telephone: string
  adminUrl: string
}) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8"><title>Nouveau moniteur à vérifier</title></head>
    <body style="${baseStyle}">
      <div style="${containerStyle}">
        ${header()}
        <div style="background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.3); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
          <h1 style="color: #C9A84C; font-size: 20px; font-weight: 800; margin: 0 0 4px;">⏳ Nouveau moniteur à vérifier</h1>
          <p style="${mutedStyle}">Un enseignant vient de s'inscrire sur Easy Drive.</p>
        </div>
        <div style="${cardStyle}">
          ${row("Nom", `${prenomMoniteur} ${nomMoniteur}`)}
          ${row("Diplôme", diplome)}
          ${row("Zone", zone)}
          ${row("Téléphone", telephone)}
        </div>
        <p style="${mutedStyle}">Connectez-vous au back-office pour vérifier son diplôme et activer son profil.</p>
        <div style="text-align: center;">
          <a href="${adminUrl}" style="${btnStyle}">Accéder au back-office →</a>
        </div>
        ${footer()}
      </div>
    </body>
    </html>
  `
}

// Email 6 — Rappel 24h avant la leçon
export function emailRappel24h({
  prenomEleve,
  prenomMoniteur,
  nomMoniteur,
  dateHeure,
  adresseRdv,
  zone,
}: {
  prenomEleve: string
  prenomMoniteur: string
  nomMoniteur: string
  dateHeure: string
  adresseRdv?: string
  zone: string
}) {
  const date = new Date(dateHeure)
  const heureFormatted = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  const dateFormatted = date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8"><title>Rappel : votre leçon demain !</title></head>
    <body style="${baseStyle}">
      <div style="${containerStyle}">
        ${header()}
        <h1 style="${headingStyle}">Votre leçon, c'est demain ! 🚗</h1>
        <p style="${mutedStyle}">Bonjour ${prenomEleve}, petit rappel : vous avez une leçon demain avec <strong style="color: #F1F5F9;">${prenomMoniteur} ${nomMoniteur}</strong>.</p>
        <div style="${cardStyle}">
          ${row("Date", dateFormatted)}
          ${row("Heure", heureFormatted)}
          ${row("Lieu de RDV", adresseRdv || zone)}
          ${row("Moniteur", `${prenomMoniteur} ${nomMoniteur}`)}
        </div>
        <div style="background: rgba(0,245,160,0.08); border: 1px solid rgba(0,245,160,0.2); border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #00F5A0; font-size: 14px; font-weight: 600; margin: 0 0 12px;">💡 Conseils pour demain</p>
          <ul style="color: #94A3B8; font-size: 13px; margin: 0; padding-left: 20px; line-height: 1.8;">
            <li>Arrivez 5 minutes en avance au point de RDV</li>
            <li>Munissez-vous de votre pièce d'identité</li>
            <li>Reposez-vous bien ce soir</li>
            <li>Visualisez mentalement votre trajet</li>
          </ul>
        </div>
        <div style="text-align: center;">
          <a href="https://easy-drive.onrender.com/dashboard/eleve" style="${btnStyle}">Voir les détails →</a>
        </div>
        ${footer()}
      </div>
    </body>
    </html>
  `
}
