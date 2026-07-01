import Link from "next/link";
import PublicFooter from "@/components/public-footer";
import PublicHero from "@/components/public-hero";

const steps = [
  {
    title: "1. Créer son espace",
    description:
      "Le joueur crée son profil sportif ou le club crée sa fiche. L’objectif est d’avoir une base claire : sport, niveau, ville, projet, contact et visibilité.",
  },
  {
    title: "2. Compléter les infos importantes",
    description:
      "Plus les données sont propres, plus la compatibilité est utile : poste, niveau, région, description, besoins de recrutement, arbitrage et médias.",
  },
  {
    title: "3. Découvrir les bons matchs",
    description:
      "CLM SportLink classe les clubs, les joueurs et les annonces selon plusieurs critères : sport, poste, niveau, zone et mots-clés.",
  },
  {
    title: "4. Envoyer une demande",
    description:
      "Un joueur peut contacter un club, et un club peut contacter un joueur. Le contact complet n’est débloqué qu’après acceptation.",
  },
  {
    title: "5. Suivre l’actualité",
    description:
      "Le fil permet de publier des actualités, des highlights, des besoins, des vidéos YouTube intégrées ou des médias uploadés.",
  },
];

const playerBenefits = [
  "Se rendre visible auprès des clubs",
  "Présenter son profil sportif dans un format propre",
  "Publier des images, vidéos et highlights",
  "Recevoir des demandes de clubs compatibles",
];

const clubBenefits = [
  "Publier des besoins de recrutement, arbitrage",
  "Trouver des profils selon poste, niveau et région",
  "Garder une trace des demandes envoyées et reçues",
  "Débloquer les contacts seulement quand la demande est acceptée",
];

export default function HowItWorksPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PublicHero
        eyebrow="Fonctionnement"
        title="Une mise en relation"
        gradientTitle="simple et contrôlée"
        description="CLM SportLink est pensé pour éviter le bazar des messages dispersés. Chaque profil est structuré, chaque annonce est lisible, et les contacts se débloquent uniquement quand les deux côtés sont d’accord."
        primaryHref="/inscription/role"
        primaryLabel="Créer un profil"
        secondaryHref="/tarifs"
        secondaryLabel="Voir les plans"
      />

      <section className="grid gap-5 py-12 lg:grid-cols-5">
        {steps.map((step, index) => (
          <article key={step.title} className="premium-card rounded-[30px] p-6 animate-fade-up" style={{ animationDelay: `${index * 70}ms` }}>
            <p className="font-display text-[2.15rem] leading-[0.92] text-white">{step.title}</p>
            <p className="mt-5 text-sm leading-7 text-white/64">{step.description}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 border-y border-white/6 py-14 lg:grid-cols-2">
        <article className="premium-card rounded-[34px] p-7 sm:p-9">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#8bb7ff]">Côté joueur</p>
          <h2 className="font-display mt-4 text-[3rem] leading-[0.9] text-white sm:text-[4.1rem]">
            Montrer son niveau
            <br />
            sans perdre de temps
          </h2>
          <div className="mt-7 space-y-3">
            {playerBenefits.map((benefit) => (
              <div key={benefit} className="rounded-[22px] border border-white/8 bg-white/[0.025] px-5 py-4 text-sm text-white/72">
                {benefit}
              </div>
            ))}
          </div>
        </article>

        <article className="premium-card rounded-[34px] p-7 sm:p-9">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#c4a1ff]">Côté club</p>
          <h2 className="font-display mt-4 text-[3rem] leading-[0.9] text-white sm:text-[4.1rem]">
            Recruter avec
            <br />
            plus de visibilité
          </h2>
          <div className="mt-7 space-y-3">
            {clubBenefits.map((benefit) => (
              <div key={benefit} className="rounded-[22px] border border-white/8 bg-white/[0.025] px-5 py-4 text-sm text-white/72">
                {benefit}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-12 rounded-[38px] border border-[#00d4ff]/15 bg-[#00d4ff]/[0.055] p-8 sm:p-10">
        <p className="text-[11px] uppercase tracking-[0.24em] text-[#8fefff]">Version MVP</p>
        <h2 className="font-display mt-4 text-[3.1rem] leading-[0.9] text-white sm:text-[4.6rem]">
          D’abord tester,
          <br />
          ensuite améliorer
        </h2>
        <p className="mt-6 max-w-3xl text-base leading-8 text-white/70">
          La V1 sert à valider le concept avec de vrais usages : profils, annonces, demandes, contacts débloqués, fil d’actualité et admin. Les options premium arriveront seulement quand la base gratuite sera fiable.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/inscription/joueur" className="btn-primary px-6 py-3 text-sm">Créer un profil joueur</Link>
          <Link href="/inscription/club" className="btn-secondary px-6 py-3 text-sm">Créer une fiche club</Link>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
