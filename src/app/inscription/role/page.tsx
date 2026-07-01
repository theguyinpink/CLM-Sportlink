import Link from "next/link";

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
          CLM SportLink s’adresse aussi bien aux joueurs qu’aux clubs. Choisis le
          parcours le plus adapté à ton objectif.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Link
            href="/inscription/joueur"
            className="group rounded-[28px] border border-white/5 bg-[#0d1020] p-8 transition hover:border-[#4f8cff]/20 hover:bg-[#171c33]"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#7E8796]">
              Joueur
            </p>
            <h2 className="font-heading text-3xl font-semibold text-[#f4f7fb]">
              Créer un profil sportif
            </h2>
            <p className="mt-4 max-w-xl text-[#B3BAC7]">
              Présente ton sport, ton niveau, ton poste et rends ton profil visible
              auprès des clubs.
            </p>

            <span className="mt-8 inline-flex rounded-2xl bg-[#4f8cff] px-4 py-2 text-sm font-medium text-[#07080f] transition group-hover:bg-[#00d4ff]">
              Continuer comme joueur
            </span>
          </Link>

          <Link
            href="/inscription/club"
            className="group rounded-[28px] border border-white/5 bg-[#0d1020] p-8 transition hover:border-[#9b5cff]/20 hover:bg-[#171c33]"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#7E8796]">
              Club
            </p>
            <h2 className="font-heading text-3xl font-semibold text-[#f4f7fb]">
              Créer un espace club
            </h2>
            <p className="mt-4 max-w-xl text-[#B3BAC7]">
              Mets en avant ton club, rends tes besoins visibles et développe tes
              opportunités de recrutement.
            </p>

            <span className="mt-8 inline-flex rounded-2xl bg-[#9b5cff] px-4 py-2 text-sm font-medium text-[#07080f] transition group-hover:bg-[#c4a1ff]">
              Continuer comme club
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}