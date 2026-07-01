import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ClubLogo from "@/components/club-logo";
export default async function PublicClubsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const supabase = await createClient();
  let clubsQuery = supabase.from("clubs").select("*");

  if (q) {
    const safeQ = q.replace(/[%_]/g, "");
    clubsQuery = clubsQuery.or(
      `club_name.ilike.%${safeQ}%,sport.ilike.%${safeQ}%,level.ilike.%${safeQ}%,city.ilike.%${safeQ}%,region.ilike.%${safeQ}%,description.ilike.%${safeQ}%`,
    );
  }

  const { data: clubs } = await clubsQuery
    .order("created_at", { ascending: false })
    .limit(24);
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {" "}
      <section className="max-w-5xl">
        {" "}
        <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">
          {" "}
          Clubs{" "}
        </p>{" "}
        <h1 className="font-display mt-5 text-[3.6rem] uppercase leading-[0.9] text-white sm:text-[5rem] lg:text-[6.4rem]">
          {" "}
          Des clubs avec <br /> des besoins plus clairs{" "}
        </h1>{" "}
        <p className="mt-7 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
          {" "}
          {q ? `Résultats pour « ${q} ».` : "Explore les clubs présents sur la plateforme."}{" "}
        </p>{" "}
      </section>{" "}
      <section className="mt-16 border-t border-white/5 pt-8">
        {" "}
        {!clubs || clubs.length === 0 ? (
          <p className="text-white/68">Aucun club visible pour le moment.</p>
        ) : (
          <div className="grid gap-10 lg:grid-cols-2">
            {" "}
            {clubs.map((club, index) => (
              <article
                key={club.id}
                className="premium-hover animate-fade-up border-b border-white/5 pb-8"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {" "}
                <div className="flex items-start gap-4">
                  {" "}
                  <ClubLogo
                    logoPath={club.logo_path}
                    clubName={club.club_name}
                    size="md"
                  />{" "}
                  <div className="min-w-0 flex-1">
                    {" "}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-white/35">
                      {" "}
                      <span>{club.sport}</span>{" "}
                      {club.level && (
                        <>
                          {" "}
                          <span>•</span> <span>{club.level}</span>{" "}
                        </>
                      )}{" "}
                    </div>{" "}
                    <h2 className="font-display mt-4 text-[2.4rem] leading-[0.92] text-white">
                      {" "}
                      {club.club_name}{" "}
                    </h2>{" "}
                    <p className="mt-3 text-sm leading-7 text-white/68">
                      {" "}
                      {club.city || "Ville non renseignée"}{" "}
                      {club.region ? ` • ${club.region}` : ""}{" "}
                    </p>{" "}
                    <p className="mt-5 max-w-2xl text-sm leading-8 text-white/68">
                      {" "}
                      {club.description ||
                        "Aucune description pour le moment."}{" "}
                    </p>{" "}
                    <div className="mt-6 flex flex-wrap gap-5">
                      {" "}
                      <Link
                        href={`/clubs/${club.id}`}
                        className="text-sm font-medium text-[#4f8cff]"
                      >
                        {" "}
                        Voir le club{" "}
                      </Link>{" "}
                      <Link
                        href="/connexion?message=Connecte-toi+pour+entrer+en+contact"
                        className="text-sm text-white/68 transition hover:text-white"
                      >
                        {" "}
                        Entrer en contact{" "}
                      </Link>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
              </article>
            ))}{" "}
          </div>
        )}{" "}
      </section>{" "}
    </main>
  );
}
