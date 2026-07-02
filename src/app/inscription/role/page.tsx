import Link from "next/link";

const roleCards = [
  {
    href: "/inscription/joueur",
    eyebrow: "Joueur",
    title: "Créer un profil joueur",
    description:
      "Présente ton sport, ton niveau, ton poste et rends ton profil visible auprès des clubs.",
    button: "Continuer comme joueur",
    accent: "from-[#4f8cff] to-[#00d4ff]",
  },
  {
    href: "/inscription/staff",
    eyebrow: "Coach / staff",
    title: "Créer un profil coach ou staff",
    description:
      "Indique tes missions, ton expérience, tes disponibilités et les sports que tu peux encadrer.",
    button: "Continuer comme coach / staff",
    accent: "from-[#8bb7ff] to-[#4f8cff]",
  },
  {
    href: "/inscription/arbitre",
    eyebrow: "Arbitre",
    title: "Créer un profil arbitre",
    description:
      "Renseigne ton sport, ton niveau d’arbitrage, ta zone et tes disponibilités pour les matchs.",
    button: "Continuer comme arbitre",
    accent: "from-[#35e6a5] to-[#00d4ff]",
  },
  {
    href: "/inscription/club",
    eyebrow: "Club",
    title: "Créer un espace club",
    description:
      "Mets en avant ton club, rends tes besoins visibles et développe tes opportunités de recrutement.",
    button: "Continuer comme club",
    accent: "from-[#9b5cff] to-[#c4a1ff]",
  },
];

export default function RolePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-white/5 bg-[#111527] px-8 py-12 sm:px-10 lg:px-14 lg:py-16">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#7E8796]">
          Inscription
        </p>
        <h1 className="font-heading max-w-3xl text-4xl font-semibold text-[#f4f7fb] sm:text-5xl">
          Choisis comment tu veux entrer sur la plateforme.
        </h1>
        <p className="mt-5 max-w-2xl text-[#B3BAC7]">
          CLM SportLink s’adresse aux joueurs, aux coachs, aux staffs, aux arbitres
          et aux clubs. Choisis le parcours qui correspond vraiment à ton profil.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {roleCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-[28px] border border-white/5 bg-[#0d1020] p-8 transition hover:border-[#4f8cff]/20 hover:bg-[#171c33]"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#7E8796]">
                {card.eyebrow}
              </p>
              <h2 className="font-heading text-3xl font-semibold text-[#f4f7fb]">
                {card.title}
              </h2>
              <p className="mt-4 max-w-xl text-[#B3BAC7]">{card.description}</p>

              <span className={`mt-8 inline-flex rounded-2xl bg-gradient-to-r ${card.accent} px-4 py-2 text-sm font-medium text-[#07080f] transition group-hover:-translate-y-0.5`}>
                {card.button}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
