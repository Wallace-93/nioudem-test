"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase-client"
import { Navbar } from "@/components/navbar"

export default function Vision() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null))
  }, [])

  const startHref = user ? "/dashboard" : "/inscription"
  return (
    <div className="font-sans text-foreground overflow-x-hidden min-h-screen">
      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 px-4 md:px-8 py-3 flex items-center justify-between bg-background/85 backdrop-blur-md border-b border-border">
        <Link href="/" className="flex flex-col">
          <span className="text-xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] bg-clip-text text-transparent">Easy Drive</span>
            <span className="font-light text-foreground"> Drive</span>
          </span>
          <span className="text-[10px] font-black tracking-[0.15em] uppercase"
            style={{
              background: "linear-gradient(135deg, #00F5A0, #00D4FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 4px rgba(0,245,160,0.7))",
              animation: "laserPulse 2s ease-in-out infinite"
            }}>
            auto-école 2.0
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/vision" className="text-primary text-sm font-semibold">Notre vision</Link>
          <Link href="/#comment" className="text-muted-foreground text-sm font-medium hover:text-primary transition-colors">Comment ça marche</Link>
          <Link href="/resultats" className="text-muted-foreground text-sm font-medium hover:text-primary transition-colors">Moniteurs</Link>
          <Link href={startHref} className="px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:opacity-90 active:scale-95 transition-all">
            {user ? "Mon espace →" : "Commencer"}
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(0,245,160,0.07)_0%,transparent_70%)]" />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-border text-xs font-bold text-primary tracking-widest uppercase mb-6">
            Notre vision
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
            L'auto-école mérite<br />
            <span className="bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] bg-clip-text text-transparent">
              une vraie révolution.
            </span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Easy Drive est né d'un constat simple : apprendre à conduire en France est encore trop souvent synonyme de frustration, d'opacité et de manque de choix. On pense qu'on peut faire mieux.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 pb-24 flex flex-col gap-16">

        {/* À qui on s'adresse */}
        <section>
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-border text-xs font-bold text-primary tracking-widest uppercase mb-5">
            À qui on s'adresse
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="text-2xl mb-3">👤</div>
              <h3 className="text-base font-bold mb-3">Les élèves</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ceux qui en ont assez de se voir attribuer un moniteur sans avoir leur mot à dire. Les anxieux, les reprises après échec, les jeunes actifs qui ont besoin de créneaux flexibles, les seniors qui reprennent la route. Tous ceux pour qui le choix devrait être un droit, pas un luxe.
              </p>
            </div>
            <div className="bg-card border border-[#00F5A0]/30 rounded-2xl p-6">
              <div className="text-2xl mb-3">🎓</div>
              <h3 className="text-base font-bold mb-3">Les enseignants de la conduite</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Les moniteurs diplômés — titulaires du BEPECASER ou du Titre Professionnel ECSR — qui veulent exercer leur métier avec plus d'autonomie, fixer leurs propres tarifs, choisir leurs élèves et développer leur activité sans dépendre d'une structure qui capte l'essentiel de la valeur.
              </p>
            </div>
          </div>
        </section>

        {/* Le problème */}
        <section>
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-border text-xs font-bold text-primary tracking-widest uppercase mb-5">
            Le problème
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-6">
            Ce que l'auto-école traditionnelle a cassé.
          </h2>
          <div className="flex flex-col gap-4">
            {[
              {
                icon: "🎲",
                title: "Le moniteur imposé",
                text: "Dans la quasi-totalité des auto-écoles, l'élève n'a aucun mot à dire sur son moniteur. Peu importe si la pédagogie ne lui convient pas, si les horaires sont inadaptés ou si le courant ne passe pas — il prend ce qu'on lui donne."
              },
              {
                icon: "⏳",
                title: "Les listes d'attente interminables",
                text: "Des semaines, parfois des mois, avant d'obtenir une première leçon. Le permis de conduire est souvent une nécessité professionnelle urgente — pas un loisir qu'on peut planifier à six mois."
              },
              {
                icon: "🌑",
                title: "L'opacité totale",
                text: "Pas d'avis vérifiés, pas de transparence sur les tarifs réels, pas de suivi de progression formalisé. L'élève avance à l'aveugle, sans savoir où il en est ni combien ça va lui coûter."
              },
              {
                icon: "💸",
                title: "Des moniteurs sous-valorisés",
                text: "Les enseignants de la conduite sont souvent salariés de structures qui fixent les tarifs, imposent les horaires et captent la majeure partie de la valeur. Leur expertise, leur réputation et leur spécialisation ne leur appartiennent pas vraiment."
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 bg-card border border-border rounded-2xl p-5">
                <div className="text-2xl flex-shrink-0">{item.icon}</div>
                <div>
                  <div className="font-bold text-sm mb-1">{item.title}</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">{item.text}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Notre ambition */}
        <section>
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-border text-xs font-bold text-primary tracking-widest uppercase mb-5">
            Notre ambition
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4">
            Remettre le choix au centre.
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Easy Drive part d'une conviction : <strong className="text-foreground">le bon moniteur change tout.</strong> Un enseignant qui correspond à votre rythme, vos créneaux, votre niveau d'anxiété et vos objectifs — c'est la différence entre décrocher son permis du premier coup ou accumuler les échecs et les dépenses.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Notre ambition est de devenir <strong className="text-foreground">la plateforme de référence des enseignants de la conduite indépendants en France</strong> — en commençant par l'Île-de-France — et de prouver qu'un modèle transparent, centré sur la qualité et le choix, peut remplacer le modèle opaque et imposé de l'auto-école traditionnelle.
          </p>
          <div className="bg-gradient-to-r from-[#00F5A0]/8 to-[#00D4FF]/8 border border-border rounded-2xl p-6">
            <p className="text-base font-semibold text-center leading-relaxed">
              "Dans dix ans, choisir son enseignant de conduite sera aussi naturel que choisir son médecin. Easy Drive construit cette normalité."
            </p>
          </div>
        </section>

        {/* Pourquoi on a la bonne solution */}
        <section>
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-border text-xs font-bold text-primary tracking-widest uppercase mb-5">
            Pourquoi on y croit
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-6">
            Pas juste une appli. Un modèle différent.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                num: "01",
                title: "Un matching intelligent",
                text: "Notre algorithme ne se contente pas de la zone géographique. Il croise spécialités, disponibilités, tarif, type de boîte et réputation pour proposer les moniteurs vraiment compatibles."
              },
              {
                num: "02",
                title: "Des diplômes vérifiés",
                text: "Chaque enseignant est validé manuellement par notre équipe avant d'apparaître sur la plateforme. Pas de profil non vérifié, pas de surprise."
              },
              {
                num: "03",
                title: "La liberté pour les moniteurs",
                text: "Inscription gratuite, tarifs libres, agenda libre. On prend une commission uniquement quand la mise en relation crée de la valeur — pour les deux parties."
              },
              {
                num: "04",
                title: "Une progression suivie",
                text: "Carnet de bord numérique, notes de séance, courbe de progression. L'élève sait où il en est. Le moniteur peut personnaliser son accompagnement."
              },
            ].map((item) => (
              <div key={item.num} className="bg-card border border-border rounded-2xl p-5">
                <div className="text-3xl font-black bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] bg-clip-text text-transparent mb-2">{item.num}</div>
                <div className="font-bold text-sm mb-1">{item.title}</div>
                <div className="text-sm text-muted-foreground leading-relaxed">{item.text}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-to-br from-primary/8 to-[#00D4FF]/8 border border-border rounded-3xl p-10">
          <h2 className="text-2xl font-extrabold mb-3">Vous partagez cette vision ?</h2>
          <p className="text-muted-foreground mb-6 text-sm">Rejoignez Easy Drive — que vous soyez élève ou enseignant de la conduite.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={startHref} className="px-7 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:opacity-90 hover:shadow-[0_4px_20px_rgba(0,245,160,0.3)] transition-all text-center">
              Je cherche un moniteur
            </Link>
            <Link href={user ? "/dashboard" : "/inscription-moniteur"} className="px-7 py-3 rounded-xl text-sm font-semibold border border-border hover:border-primary hover:text-primary transition-all text-center">
              Je suis enseignant de la conduite
            </Link>
          </div>
        </section>

      </div>

      {/* FOOTER */}
      <footer className="border-t border-border px-4 md:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] bg-clip-text text-transparent">Easy Drive</span>
          <span className="font-light text-foreground"> Drive</span>
        </Link>
        <p className="text-muted-foreground text-xs">© 2025 Easy Drive · Île-de-France · Tous droits réservés</p>
        <p className="text-muted-foreground text-xs">Fait avec ❤️ pour les moniteurs indépendants</p>
      </footer>
    </div>
  )
}
