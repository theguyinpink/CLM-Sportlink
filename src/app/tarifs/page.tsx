import Link from "next/link";
import PublicFooter from "@/components/public-footer";
import PublicHero from "@/components/public-hero";

const plans = [
  {
    name: "Joueur",
    price: "Gratuit",
    badge: "Ouvert",
    description: "Pour être visible, publier, recevoir des demandes et construire son profil sportif.",
    features: ["Profil joueur", "Fil d’actualité", "Demandes de contact", "Médias de profil", "Visibilité auprès des clubs"],
    cta: "Créer mon profil joueur",
    href: "/inscription/joueur",
    highlight: false,
  },
  {
    name: "Club",
    price: "Gratuit",
    badge: "Phase test",
    description: "Pour créer une fiche club, publier des annonces et tester la mise en relation.",
    features: ["Fiche club", "Annonces de recrutement, arbitrage", "Recherche de joueurs", "Demandes de contact", "Actualités club"],
    cta: "Créer ma fiche club",
    href: "/inscription/club",
    highlight: true,
  },
  {
    name: "Club Pro",
    price: "À venir",
    badge: "Premium",
    description: "Pour les clubs qui veulent recruter plus vite avec plus de filtres et de visibilité.",
    features: ["Annonces illimitées", "Filtres avancés", "Statistiques", "Mise en avant", "Support prioritaire"],
    cta: "Préparer mon club",
    href: "/inscription/club",
    highlight: false,
  },
];

const options = [
  ["Annonce boostée", "Mettre une annonce plus haut dans les résultats pendant une période courte."],
  ["Club mis en avant", "Donner plus de visibilité à un club dans les recherches et le fil."],
  ["Badge vérifié", "Rassurer les joueurs avec une fiche club validée."],
  ["Campagne recrutement, arbitrage", "Aider un club à publier une recherche claire pour une période donnée."],
];

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PublicHero
        eyebrow="Tarifs"
        title="Gratuit au lancement"
        gradientTitle="premium ensuite"
        description="Le but est d’abord de construire un réseau utile. Les joueurs restent gratuits, les clubs testent gratuitement, puis les options payantes arriveront côté club quand la plateforme aura assez de valeur."
        primaryHref="/inscription/role"
        primaryLabel="Commencer gratuitement"
        secondaryHref="/comment-ca-marche"
        secondaryLabel="Comprendre le fonctionnement"
      />

      <section className="grid gap-6 py-12 lg:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.name} className={["premium-card rounded-[34px] p-6 sm:p-7", plan.highlight ? "border-[#4f8cff]/35 shadow-[0_24px_110px_rgba(79,140,255,0.14)]" : ""].join(" ")}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/38">Plan</p>
                <h2 className="font-display mt-3 text-[3rem] leading-none text-white">{plan.name}</h2>
              </div>
              <span className="rounded-full border border-[#4f8cff]/20 bg-[#4f8cff]/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#8bb7ff]">{plan.badge}</span>
            </div>
            <p className="mt-6 font-display text-[3.6rem] leading-none text-gradient-sport">{plan.price}</p>
            <p className="mt-5 min-h-[72px] text-sm leading-7 text-white/64">{plan.description}</p>
            <div className="mt-7 space-y-3">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3 text-sm text-white/76">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#35e6a5] shadow-[0_0_14px_rgba(53,230,165,0.55)]" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            <Link href={plan.href} className={["mt-8 w-full px-5 py-3 text-sm", plan.highlight ? "btn-primary" : "btn-secondary"].join(" ")}>{plan.cta}</Link>
          </article>
        ))}
      </section>

      <section className="grid gap-6 border-y border-white/6 py-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/38">Monétisation prévue</p>
          <h2 className="font-display mt-4 text-[3.2rem] leading-[0.9] text-white sm:text-[4.7rem]">
            L’argent viendra
            <br />
            surtout des clubs
          </h2>
          <p className="mt-6 text-base leading-8 text-white/66">
            Les joueurs doivent rejoindre facilement la plateforme. Les clubs, eux, pourront payer pour gagner du temps, obtenir plus de visibilité et accéder à des outils de recrutement, arbitrage plus avancés.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {options.map(([title, description]) => (
            <article key={title} className="premium-card rounded-[28px] p-6">
              <p className="font-display text-[2.2rem] leading-none text-white">{title}</p>
              <p className="mt-4 text-sm leading-7 text-white/64">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-[34px] border border-[#35e6a5]/15 bg-[#35e6a5]/[0.055] p-7 sm:p-9">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#8ff5cf]">Important</p>
        <p className="mt-4 max-w-4xl text-sm leading-8 text-white/70">
          Les tarifs Pro ne sont pas encore activés dans la V1. Cette page sert à expliquer la direction du projet : gratuit pour tester, puis premium seulement quand la plateforme aura prouvé son utilité.
        </p>
      </section>

      <PublicFooter />
    </main>
  );
}
