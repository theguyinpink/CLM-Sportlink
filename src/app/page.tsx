import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PublicFooter from "@/components/public-footer";

const playerSteps = [
  "Crée ton profil sportif",
  "Ajoute ton sport, ton poste, ton niveau et ta ville",
  "Publie tes actualités et tes highlights",
  "Reçois des demandes de clubs compatibles",
];

const clubSteps = [
  "Crée la fiche de ton club",
  "Publie tes besoins de recrutement, arbitrage",
  "Découvre les profils les plus compatibles",
  "Débloque le contact quand la demande est acceptée",
];

const plans = [
  {
    name: "Joueur",
    price: "Gratuit",
    badge: "Lancement",
    description:
      "Pour créer son profil, être visible, publier dans le fil et recevoir des opportunités.",
    features: [
      "Profil joueur complet",
      "Accès au fil d’actualité",
      "Demandes de contact",
      "Visibilité auprès des clubs",
    ],
    href: "/inscription/joueur",
    cta: "Créer mon profil joueur",
    highlight: false,
  },
  {
    name: "Club",
    price: "Gratuit",
    badge: "Phase test",
    description:
      "Pour tester l’outil, créer une fiche club et publier les premières annonces.",
    features: [
      "Fiche club complète",
      "Annonces de recrutement, arbitrage",
      "Recherche de joueurs",
      "Contacts après acceptation",
    ],
    href: "/inscription/club",
    cta: "Créer ma fiche club",
    highlight: true,
  },
  {
    name: "Club Pro",
    price: "À venir",
    badge: "Premium",
    description:
      "Le futur plan payant pour les clubs qui veulent recruter plus vite et plus précisément.",
    features: [
      "Annonces illimitées",
      "Filtres avancés",
      "Statistiques de visibilité",
      "Mise en avant du club",
    ],
    href: "/inscription/club",
    cta: "Préparer mon club",
    highlight: false,
  },
];

function PlanCard({ plan }: { plan: (typeof plans)[number] }) {
  return (
    <article
      className={[
        "premium-card rounded-[34px] p-6 sm:p-7",
        plan.highlight ? "border-[#4f8cff]/35 shadow-[0_24px_110px_rgba(79,140,255,0.14)]" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/38">
            Plan
          </p>
          <h3 className="font-display mt-3 text-[3rem] leading-none text-white">
            {plan.name}
          </h3>
        </div>
        <span className="rounded-full border border-[#4f8cff]/20 bg-[#4f8cff]/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#8bb7ff]">
          {plan.badge}
        </span>
      </div>

      <p className="mt-6 font-display text-[3.6rem] leading-none text-gradient-sport">
        {plan.price}
      </p>
      <p className="mt-5 min-h-[84px] text-sm leading-7 text-white/64">
        {plan.description}
      </p>

      <div className="mt-7 space-y-3">
        {plan.features.map((feature) => (
          <div key={feature} className="flex items-start gap-3 text-sm text-white/76">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#35e6a5] shadow-[0_0_14px_rgba(53,230,165,0.55)]" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <Link
        href={plan.href}
        className={[
          "mt-8 w-full px-5 py-3 text-sm",
          plan.highlight ? "btn-primary" : "btn-secondary",
        ].join(" ")}
      >
        {plan.cta}
      </Link>
    </article>
  );
}

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = user?.user_metadata?.role as "player" | "club" | undefined;

  const ctaHref =
    role === "player"
      ? "/app/joueur/feed"
      : role === "club"
        ? "/app/club/feed"
        : "/inscription/role";

  const ctaLabel =
    role === "player"
      ? "Entrer dans mon espace joueur"
      : role === "club"
        ? "Entrer dans mon espace club"
        : "Créer mon profil gratuitement";

  const [{ count: playersCount }, { count: clubsCount }, { count: offersCount }] =
    await Promise.all([
      supabase
        .from("player_profiles")
        .select("*", { count: "exact", head: true })
        .or("is_public.eq.true,is_public.is.null"),
      supabase.from("clubs").select("*", { count: "exact", head: true }),
      supabase
        .from("club_offers")
        .select("*", { count: "exact", head: true })
        .eq("status", "active"),
    ]);

  return (
    <main className="home-page mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[42px] border border-white/8 bg-[#0d1020]/46 px-5 py-16 shadow-[0_32px_120px_rgba(0,0,0,0.34)] sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-140px] top-[-140px] h-[400px] w-[400px] rounded-full bg-[#4f8cff]/22 blur-[110px] animate-hero-glow" />
          <div className="absolute bottom-[-150px] left-[-120px] h-[360px] w-[360px] rounded-full bg-[#9b5cff]/18 blur-[110px] animate-subtle-float" />
          <div className="absolute bottom-0 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-[#00d4ff]/70 to-transparent" />
        </div>

        <div className="relative z-10 grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_390px] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white/58 animate-fade-up">
              <span className="h-1.5 w-1.5 rounded-full bg-[#35e6a5] shadow-[0_0_16px_rgba(53,230,165,0.8)]" />
              Plateforme sportive · Joueurs · Clubs · Arbitres · Staff
            </div>

            <h1
              className="font-display mt-7 max-w-5xl text-[3.45rem] uppercase leading-[0.86] text-white sm:text-[5.7rem] lg:text-[7.7rem] animate-fade-up"
              style={{ animationDelay: "90ms" }}
            >
              Le lien direct
              <br />
              <span className="text-gradient-sport">entre talents</span>
              <br />
              et clubs
            </h1>

            <p
              className="mt-8 max-w-2xl text-base leading-8 text-white/70 sm:text-lg animate-fade-up"
              style={{ animationDelay: "180ms" }}
            >
              CLM SportLink aide les joueurs, arbitres et profils staff à se rendre visibles et les clubs à
              trouver des profils compatibles grâce à des fiches claires, des
              annonces structurées, un fil d’actualité et une mise en relation contrôlée.
            </p>

            <div
              className="mt-10 flex flex-wrap gap-4 animate-fade-up"
              style={{ animationDelay: "260ms" }}
            >
              <Link href={ctaHref} className="btn-primary px-6 py-3 text-sm">
                {ctaLabel}
              </Link>
              <Link href="#plans" className="btn-secondary px-6 py-3 text-sm">
                Voir les plans
              </Link>
            </div>
          </div>

          <div className="premium-card rounded-[32px] p-5 animate-fade-up" style={{ animationDelay: "220ms" }}>
            <div className="flex items-center justify-between border-b border-white/8 pb-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/38">
                  Réseau actuel
                </p>
                <p className="mt-2 text-sm text-white/72">
                  Les premiers chiffres de la plateforme
                </p>
              </div>
              <span className="rounded-full border border-[#35e6a5]/20 bg-[#35e6a5]/10 px-3 py-1 text-[11px] font-medium text-[#8ff5cf]">
                MVP
              </span>
            </div>

            <div className="mt-6 grid gap-4">
              {[
                [playersCount ?? 0, "Joueurs visibles"],
                [clubsCount ?? 0, "Clubs présents"],
                [offersCount ?? 0, "Annonces actives"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-[24px] border border-white/8 bg-white/[0.035] p-5">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/38">
                    {label}
                  </p>
                  <p className="mt-3 font-display text-6xl leading-none text-white">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Profil", "Un espace clair pour présenter son sport, son poste, son niveau et sa ville."],
          ["Matching", "Les profils et les annonces sont classés selon leur compatibilité."],
          ["Contact", "Le contact ne se débloque qu’après acceptation des deux côtés."],
          ["Actualités", "Un fil pour publier les moments forts, besoins, annonces et nouveautés."],
        ].map(([title, description], index) => (
          <article
            key={title}
            className="premium-card rounded-[28px] p-5 animate-fade-in"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <p className="font-display text-[2.1rem] leading-none text-white">
              {title}
            </p>
            <p className="mt-4 text-sm leading-7 text-white/64">
              {description}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 border-y border-white/6 py-14 lg:grid-cols-2">
        <article className="premium-card rounded-[34px] p-7 sm:p-9 animate-fade-up">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#8bb7ff]">
            Pour les joueurs
          </p>
          <h2 className="font-display mt-4 text-[3rem] leading-[0.9] text-white sm:text-[4.2rem]">
            Montrer ce que
            <br />
            tu vaux vraiment
          </h2>
          <div className="mt-7 space-y-4">
            {playerSteps.map((step) => (
              <div key={step} className="rounded-[22px] border border-white/8 bg-white/[0.025] px-5 py-4 text-sm text-white/72">
                {step}
              </div>
            ))}
          </div>
        </article>

        <article className="premium-card rounded-[34px] p-7 sm:p-9 animate-fade-up" style={{ animationDelay: "120ms" }}>
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#c4a1ff]">
            Pour les clubs
          </p>
          <h2 className="font-display mt-4 text-[3rem] leading-[0.9] text-white sm:text-[4.2rem]">
            Trouver les bons
            <br />
            profils plus vite
          </h2>
          <div className="mt-7 space-y-4">
            {clubSteps.map((step) => (
              <div key={step} className="rounded-[22px] border border-white/8 bg-white/[0.025] px-5 py-4 text-sm text-white/72">
                {step}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section id="plans" className="py-16">
        <div className="mb-9 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/38">
              Plans
            </p>
            <h2 className="font-display mt-4 text-[3.4rem] leading-[0.86] text-white sm:text-[5.4rem]">
              Gratuit au lancement,
              <br />
              premium ensuite
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-8 text-white/64 sm:text-base">
            L’idée est de garder l’accès simple au début : les joueurs doivent
            pouvoir rejoindre la plateforme gratuitement, et les clubs pourront
            ensuite passer sur des options Pro quand l’outil aura assez de valeur.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>

        <div className="mt-6 rounded-[30px] border border-[#00d4ff]/15 bg-[#00d4ff]/[0.055] p-6">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#8fefff]">
            Modèle économique prévu
          </p>
          <p className="mt-4 text-sm leading-8 text-white/70">
            Pour la V1, tout reste accessible afin de tester le concept. Ensuite,
            l’argent viendra surtout des clubs : abonnements Pro, mise en avant
            d’annonces, visibilité premium et statistiques avancées. Les joueurs
            restent le moteur de la plateforme, donc l’accès joueur doit rester
            gratuit le plus longtemps possible.
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[38px] border border-white/8 bg-gradient-to-br from-[#4f8cff]/16 via-white/[0.035] to-[#9b5cff]/14 p-8 sm:p-10 lg:p-12">
        <div className="relative z-10 max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">
            Prêt à tester
          </p>
          <h2 className="font-display mt-4 text-[3.2rem] leading-[0.9] text-white sm:text-[5rem]">
            Entre dans l’outil
            <br />
            et crée ton espace
          </h2>
          <p className="mt-6 text-base leading-8 text-white/68">
            Commence gratuitement, remplis ton profil ou ta fiche club, puis teste
            les demandes, les annonces et le fil d’actualité.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href={ctaHref} className="btn-primary px-6 py-3 text-sm">
              {ctaLabel}
            </Link>
            <Link href="/connexion" className="btn-secondary px-6 py-3 text-sm">
              Se connecter
            </Link>
          </div>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
