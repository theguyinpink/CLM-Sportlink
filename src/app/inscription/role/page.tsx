import Link from "next/link";

const roles = [
  {
    href: "/inscription/joueur",
    eyebrow: "Joueur",
    title: "Créer un profil joueur",
    description: "Présente ton sport, ton niveau, ton poste et rends ton profil visible auprès des clubs.",
    cta: "Continuer comme joueur",
    color: "#4f8cff",
  },
  {
    href: "/inscription/arbitre",
    eyebrow: "Arbitre",
    title: "Créer un profil arbitre",
    description: "Indique ton sport, ton niveau d’arbitrage, ta zone et tes disponibilités pour répondre aux besoins des clubs.",
    cta: "Continuer comme arbitre",
    color: "#35e6a5",
  },
  {
    href: "/inscription/staff",
    eyebrow: "Coach / staff",
    title: "Créer un profil encadrant",
    description: "Coach, assistant, préparateur ou bénévole : rends tes missions possibles visibles auprès des clubs.",
    cta: "Continuer comme staff",
    color: "#00d4ff",
  },
  {
    href: "/inscription/club",
    eyebrow: "Club",
    title: "Créer un espace club",
    description: "Mets en avant ton club, publie tes besoins et découvre des joueurs, arbitres ou profils staff compatibles.",
    cta: "Continuer comme club",
    color: "#9b5cff",
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
          CLM SportLink connecte les clubs avec les joueurs, les arbitres et les profils coach / staff.
          Choisis le parcours le plus adapté à ton objectif.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {roles.map((role) => (
            <Link
              key={role.href}
              href={role.href}
              className="group rounded-[28px] border border-white/5 bg-[#0d1020] p-8 transition hover:bg-[#171c33]"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#7E8796]">
                {role.eyebrow}
              </p>
              <h2 className="font-heading text-3xl font-semibold text-[#f4f7fb]">
                {role.title}
              </h2>
              <p className="mt-4 max-w-xl text-[#B3BAC7]">
                {role.description}
              </p>

              <span
                className="mt-8 inline-flex rounded-2xl px-4 py-2 text-sm font-medium text-[#07080f] transition group-hover:brightness-110"
                style={{ backgroundColor: role.color }}
              >
                {role.cta}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
