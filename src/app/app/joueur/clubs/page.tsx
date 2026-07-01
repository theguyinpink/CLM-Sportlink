import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EmptyState from "@/components/empty-state";
import ClubLogo from "@/components/club-logo";
import CompatibilityBadge from "@/components/compatibility-badge";
import InsightPill from "@/components/insight-pill";
import { calculatePlayerClubCompatibility } from "@/lib/matching";

type SearchParams = {
  q?: string;
  city?: string;
  level?: string;
  sort?: "match" | "recent" | "alpha";
};

export default async function JoueurClubsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const city = (params.city || "").trim();
  const level = (params.level || "").trim();
  const sort = (params.sort || "match").trim() as "match" | "recent" | "alpha";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("player_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) redirect("/app/joueur/profil/edit");

  // Recherche large : on ne bloque plus l'affichage sur sport/région exacts.
  // Le moteur de compatibilité classe ensuite les meilleurs matchs.
  let clubsQuery = supabase
    .from("clubs")
    .select("*");

  if (q) {
    const safeQ = q.replace(/[%_]/g, "");
    clubsQuery = clubsQuery.or(
      `club_name.ilike.%${safeQ}%,description.ilike.%${safeQ}%,city.ilike.%${safeQ}%`
    );
  }

  if (city) {
    const safeCity = city.replace(/[%_]/g, "");
    clubsQuery = clubsQuery.ilike("city", `%${safeCity}%`);
  }

  if (level) {
    const safeLevel = level.replace(/[%_]/g, "");
    clubsQuery = clubsQuery.ilike("level", `%${safeLevel}%`);
  }

  clubsQuery =
    sort === "alpha"
      ? clubsQuery.order("club_name", { ascending: true })
      : clubsQuery.order("created_at", { ascending: false });

  const { data: clubs } = await clubsQuery;
  const scoredClubs = (clubs || []).map((club) => ({ club, match: calculatePlayerClubCompatibility(profile, club) }));
  const sortedClubs = sort === "match" ? scoredClubs.sort((a, b) => b.match.score - a.match.score) : scoredClubs;
  const hasFilters = Boolean(q || city || level || sort !== "match");

  return (
    <main className="space-y-12">
      <section className="max-w-5xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">
          Clubs
        </p>

        <h1 className="font-display mt-5 text-[3.2rem] uppercase leading-[0.9] text-white sm:text-[4.6rem] lg:text-[5.6rem]">
          Clubs around
          <br />
          ton profil
        </h1>

        <p className="mt-7 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
          Une lecture plus simple des clubs liés à ton sport et à ta zone.
        </p>
      </section>

      <section className="rounded-[28px] border border-white/8 bg-white/2 p-5">
        <form className="grid gap-4 lg:grid-cols-4">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Rechercher un club..."
            className="rounded-full border border-white/10 bg-transparent px-5 py-3 text-sm text-white outline-none placeholder:text-white/30"
          />
          <input
            type="text"
            name="city"
            defaultValue={city}
            placeholder="Ville"
            className="rounded-full border border-white/10 bg-transparent px-5 py-3 text-sm text-white outline-none placeholder:text-white/30"
          />
          <input
            type="text"
            name="level"
            defaultValue={level}
            placeholder="Niveau"
            className="rounded-full border border-white/10 bg-transparent px-5 py-3 text-sm text-white outline-none placeholder:text-white/30"
          />
          <div className="flex gap-3">
            <select
              name="sort"
              defaultValue={sort}
              className="min-w-0 flex-1 rounded-full border border-white/10 bg-transparent px-5 py-3 text-sm text-white outline-none"
            >
              <option value="match" className="bg-[#07080f] text-white">
                Meilleurs matchs
              </option>
              <option value="recent" className="bg-[#07080f] text-white">
                Plus récents
              </option>
              <option value="alpha" className="bg-[#07080f] text-white">
                Ordre alphabétique
              </option>
            </select>
            <button
              type="submit"
              className="rounded-full bg-[#4f8cff] px-5 py-3 text-sm font-medium text-[#07080f] transition hover:bg-[#00d4ff]"
            >
              Filtrer
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/55">
          <span>{sortedClubs.length} clubs trouvés</span>
          {hasFilters && (
            <Link href="/app/joueur/clubs" className="text-[#4f8cff]">
              Réinitialiser
            </Link>
          )}
        </div>
      </section>

      <section className="border-t border-white/5 pt-8">
        {sortedClubs.length === 0 ? (
          <EmptyState
            eyebrow="Aucun club"
            title="Aucun résultat"
            description="Aucun club trouvé pour le moment. Vérifie qu'au moins un club existe dans la plateforme."
            resetHref="/app/joueur/clubs"
          />
        ) : (
          <div className="grid gap-10 lg:grid-cols-2">
            {sortedClubs.map(({ club, match }, index) => (
              <article
                key={club.id}
                className="premium-card animate-fade-up rounded-[32px] p-6"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <ClubLogo
                    logoPath={club.logo_path}
                    clubName={club.club_name}
                    size="md"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
                      {club.sport}
                      {club.level ? ` • ${club.level}` : ""}
                    </p>

                    <h2 className="font-display mt-3 text-[2.2rem] uppercase leading-[0.92] text-white">
                      {club.club_name}
                    </h2>

                    <p className="mt-3 text-sm leading-7 text-white/68">
                      {club.city || "Ville non renseignée"}
                      {club.region ? ` • ${club.region}` : ""}
                    </p>

                    <p className="mt-5 max-w-2xl text-sm leading-8 text-white/68">
                      {club.description || "Aucune description pour le moment."}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {match.reasons.slice(0, 4).map((reason) => (
                        <InsightPill key={`${club.id}-${reason.label}`} reason={reason} />
                      ))}
                    </div>

                    <Link
                      href={`/app/joueur/clubs/${club.id}`}
                      className="mt-6 inline-flex text-sm font-medium text-[#4f8cff]"
                    >
                      Voir le club
                    </Link>
                  </div>
                  <CompatibilityBadge match={match} compact />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}