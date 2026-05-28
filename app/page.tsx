"use client"
export const dynamic = "force-dynamic"
import Link from "next/link"

export default function Home() {
  return (
<<<<<<< Updated upstream
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 16 }}>
      <h1>NiouDem Drive</h1>
      <Link href="/connexion" style={{ color: "#00F5A0" }}>Se connecter</Link>
      <Link href="/inscription" style={{ color: "#00F5A0" }}>S'inscrire</Link>
=======
    <div className="font-sans text-foreground overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 px-4 md:px-8 py-3 flex items-center justify-between bg-background/85 backdrop-blur-md border-b border-border">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex flex-col text-left">
          <div className="text-xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] bg-clip-text text-transparent">Easy Drive</span>
            <span className="font-light text-foreground"> Drive</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-4 h-px" style={{ background: "linear-gradient(to right, transparent, #00F5A0)", boxShadow: "0 0 4px #00F5A0" }} />
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
            <div className="w-4 h-px" style={{ background: "linear-gradient(to left, transparent, #00D4FF)", boxShadow: "0 0 4px #00D4FF" }} />
          </div>
        </button>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/vision" className="text-muted-foreground text-sm font-medium hover:text-primary transition-colors">Notre vision</Link>
          <Link href="#comment" className="text-muted-foreground text-sm font-medium hover:text-primary transition-colors">Comment ça marche</Link>
          <Link href="#features" className="text-muted-foreground text-sm font-medium hover:text-primary transition-colors">Fonctionnalités</Link>
          <Link href="#moniteurs" className="text-muted-foreground text-sm font-medium hover:text-primary transition-colors">Moniteurs</Link>
          <Link href={startHref} className="px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:opacity-90 active:scale-95 transition-all">
            {startLabel}
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-screen flex flex-col items-center justify-center pt-32 pb-16 px-4 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(0,245,160,0.08)_0%,transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_50%,rgba(0,212,255,0.06)_0%,transparent_60%)]" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "linear-gradient(#00F5A0 1px, transparent 1px), linear-gradient(90deg, #00F5A0 1px, transparent 1px)",
              backgroundSize: "60px 60px"
            }}
          />
        </div>

        {/* Contenu principal — layout flex row */}
        <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">

          {/* Contenu central */}
          <div className="text-center flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 mt-16 bg-primary/10 border border-border text-xs font-semibold text-primary tracking-wide">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/></svg>
              La plateforme des moniteurs indépendants
            </div>

            <div className="relative inline-block">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight mb-6 text-balance animate-swing">
                Trouvez le{" "}
                <span className="bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] bg-clip-text text-transparent">moniteur</span>
                <br />fait pour vous.
              </h1>
            </div>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed text-pretty">
              Nous mettons en relation des élèves avec des enseignants de la conduite automobile diplômés en Île-de-France. Choisissez votre enseignant selon vos besoins, réservez en ligne et suivez votre progression — le tout grâce à un matching intelligent pensé pour vous.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={startHref} className="px-8 py-3.5 rounded-xl text-base font-bold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:shadow-[0_8px_30px_rgba(0,245,160,0.3)] hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                {user ? "Mon espace →" : "Trouver un moniteur"}
              </Link>
              <Link href={user ? "/dashboard" : "/inscription-moniteur"} className="px-8 py-3.5 rounded-xl text-base font-semibold bg-transparent text-foreground border border-border hover:border-primary hover:text-primary hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                {user ? "Mon espace →" : "Je suis moniteur"}
              </Link>
            </div>
          </div>

        </div>

        {/* Stats */}
        <div className="relative z-10 flex flex-wrap gap-8 justify-center mt-16 pt-12 border-t border-border max-w-3xl w-full mx-auto">
          <div className="text-center">
            <div className="text-3xl font-extrabold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] bg-clip-text text-transparent">500+</div>
            <div className="text-xs text-muted-foreground font-medium mt-1">Moniteurs certifiés</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-extrabold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] bg-clip-text text-transparent">4.8</div>
            <div className="text-xs text-muted-foreground font-medium mt-1">Note moyenne</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-extrabold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] bg-clip-text text-transparent">15min</div>
            <div className="text-xs text-muted-foreground font-medium mt-1">Pour être mis en relation</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-extrabold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] bg-clip-text text-transparent">0 EUR</div>
            <div className="text-xs text-muted-foreground font-medium mt-1">{"Pour s'inscrire"}</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="comment" className="py-24 px-4 max-w-5xl mx-auto">
        <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-border text-xs font-bold text-primary tracking-widest uppercase mb-4">
          Processus
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 text-balance">
              Simple comme<br />bonjour.
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed max-w-md">
              De la recherche a la premiere lecon en quelques minutes.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { num: "01", title: "Decrivez vos besoins", desc: "Zone, creneaux, niveau, specialites recherchees. On prend tout en compte." },
            { num: "02", title: "Decouvrez vos matchs", desc: "Notre algorithme selectionne les moniteurs les plus compatibles avec votre profil." },
            { num: "03", title: "Reservez en ligne", desc: "Choisissez un creneau, payez securise. Confirmation immediate." },
            { num: "04", title: "Progressez", desc: "Suivez votre evolution lecon apres lecon avec votre carnet de progression." },
          ].map((step) => (
            <div key={step.num} className="bg-card border border-border rounded-2xl p-7 hover:border-primary/40 hover:-translate-y-1 transition-all">
              <div className="text-5xl font-black bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] bg-clip-text text-transparent mb-4">
                {step.num}
              </div>
              <div className="text-base font-bold mb-2">{step.title}</div>
              <div className="text-sm text-muted-foreground leading-relaxed">{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-4 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-border text-xs font-bold text-primary tracking-widest uppercase mb-4">
            Fonctionnalités
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-12 text-balance">
            Tout ce dont vous<br />avez besoin.
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: "bolt", title: "Matching intelligent", desc: "Algorithme de compatibilite sur 6 criteres : specialites, disponibilites, zone, budget, vehicule, reactivite." },
              { icon: "calendar", title: "Reservation instantanee", desc: "Calendrier en temps reel, confirmation automatique, rappels par email." },
              { icon: "card", title: "Paiement securise", desc: "Stripe Connect, conformite DSP2, reversement automatique aux moniteurs sous 7 jours." },
              { icon: "chart", title: "Carnet de progression", desc: "Le moniteur note chaque seance. L'eleve suit sa courbe d'evolution vers l'examen." },
              { icon: "chat", title: "Messagerie integree", desc: "Communication directe eleve-moniteur, securisee et centralisee dans la plateforme." },
              { icon: "check", title: "Diplomes verifies", desc: "Chaque moniteur est verifie par notre equipe. BEPECASER ou Titre Pro valide avant activation." },
            ].map((feature) => (
              <div key={feature.title} className="bg-card border border-border rounded-2xl p-7 flex gap-4 items-start hover:border-[#00D4FF]/40 hover:-translate-y-1 transition-all">
                <div className="w-11 h-11 rounded-xl flex-shrink-0 bg-gradient-to-br from-primary/15 to-[#00D4FF]/15 border border-border flex items-center justify-center text-primary">
                  {feature.icon === "bolt" && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/></svg>}
                  {feature.icon === "calendar" && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                  {feature.icon === "card" && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
                  {feature.icon === "chart" && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                  {feature.icon === "chat" && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
                  {feature.icon === "check" && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                </div>
                <div>
                  <div className="text-base font-bold mb-1">{feature.title}</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROFILES */}
      <section id="moniteurs" className="py-24 px-4 max-w-5xl mx-auto">
        <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-border text-xs font-bold text-primary tracking-widest uppercase mb-4">
          Pour qui ?
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-12 text-balance">
          Une plateforme,<br />deux univers.
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card border border-border rounded-3xl p-8">
            <h3 className="text-xl font-bold mb-2">Pour les élèves</h3>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Finis le choix impose. Trouvez le moniteur qui vous correspond vraiment.
            </p>
            <div className="flex flex-col gap-3">
              {[
                "Moniteur choisi selon vos criteres",
                "Creneaux adaptes a votre agenda",
                "Avis verifies d'autres eleves",
                "Suivi de progression personnalise",
                "Paiement securise en ligne"
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm">
                  <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {item}
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-card border border-primary/30 rounded-3xl p-8">
            <h3 className="text-xl font-bold mb-2">Pour les moniteurs</h3>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Developpez votre activite en toute autonomie. Vos regles, vos tarifs, vos clients.
            </p>
            <div className="flex flex-col gap-3">
              {[
                "Inscription et profil gratuits",
                "Clientele qualifiee et ciblee",
                "Agenda et tarifs 100% libres",
                "Paiements automatises et securises",
                "Dashboard de suivi d'activite"
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm">
                  <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-4 mb-24 rounded-3xl p-12 md:p-16 text-center bg-gradient-to-br from-primary/[0.08] to-[#00D4FF]/[0.08] border border-border relative overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full blur-[80px] bg-primary/5 -top-24 -right-24 pointer-events-none" />
        <div className="absolute w-72 h-72 rounded-full blur-[80px] bg-[#00D4FF]/5 -bottom-12 -left-12 pointer-events-none" />
        
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 relative z-10 text-balance">
          Pret a demarrer ?
        </h2>
        <p className="text-muted-foreground mb-8 relative z-10">
          Rejoignez Easy Drive — inscription gratuite, sans engagement.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
          <Link href={startHref} className="px-8 py-3.5 rounded-xl text-base font-bold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:shadow-[0_8px_30px_rgba(0,245,160,0.3)] hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            {user ? "Mon espace →" : "Trouver un moniteur"}
          </Link>
          <Link href={user ? "/dashboard" : "/inscription-moniteur"} className="px-8 py-3.5 rounded-xl text-base font-semibold bg-transparent text-foreground border border-border hover:border-primary hover:text-primary hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            {user ? "Mon espace →" : "Devenir moniteur partenaire"}
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border px-4 md:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-lg font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] bg-clip-text text-transparent">Easy Drive</span>
          <span className="font-light text-foreground"> Drive</span>
        </div>
        <p className="text-muted-foreground text-xs">
          © 2025 Easy Drive · Ile-de-France · Tous droits reserves
        </p>
        <p className="text-muted-foreground text-xs">
          Fait avec amour pour les moniteurs independants
        </p>
      </footer>
>>>>>>> Stashed changes
    </div>
  )
}
