import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PlayerAvatar from "@/components/player-avatar";
export default async function PublicPlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const supabase = await createClient();
  let playersQuery = supabase
    .from("player_profiles")
    .select("*")
    .or("is_public.eq.true,is_public.is.null")
    .eq("open_to_opportunities", true);

  if (q) {
    const safeQ = q.replace(/[%_]/g, "");
    playersQuery = playersQuery.or(
      `display_name.ilike.%${safeQ}%,sport.ilike.%${safeQ}%,position.ilike.%${safeQ}%,level.ilike.%${safeQ}%,city.ilike.%${safeQ}%,region.ilike.%${safeQ}%,bio.ilike.%${safeQ}%`,
    );
  }

  const { data: players } = await playersQuery
    .order("created_at", { ascending: false })
    .limit(24);
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {" "}
      <section className="max-w-5xl">
        {" "}
        <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">
          {" "}
          Joueurs{" "}
        </p>{" "}
        <h1 className="font-display mt-5 text-[3.6rem] uppercase leading-[0.9] text-white sm:text-[5rem] lg:text-[6.4rem]">
          {" "}
          Des profils lisibles, <br /> sans bruit inutile{" "}
        </h1>{" "}
        <p className="mt-7 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
          {" "}
          {q ? `Résultats pour « ${q} ».` : "Parcours les profils joueurs visibles sur CLM SportLink."}{" "}
        </p>{" "}
      </section>{" "}
      <section className="mt-16 border-t border-white/5 pt-8">
        {" "}
        {!players || players.length === 0 ? (
          <p className="text-white/68">Aucun joueur visible pour le moment.</p>
        ) : (
          <div className="grid gap-10 lg:grid-cols-2">
            {" "}
            {players.map((player, index) => (
              <article
                key={player.id}
                className="premium-hover animate-fade-up border-b border-white/5 pb-8"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {" "}
                <div className="flex items-start gap-4">
                  {" "}
                  <PlayerAvatar
                    avatarPath={player.avatar_path}
                    displayName={player.display_name}
                    size="md"
                  />{" "}
                  <div className="min-w-0 flex-1">
                    {" "}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-white/35">
                      {" "}
                      <span>{player.sport}</span>{" "}
                      {player.position && (
                        <>
                          {" "}
                          <span>•</span> <span>{player.position}</span>{" "}
                        </>
                      )}{" "}
                      {player.level && (
                        <>
                          {" "}
                          <span>•</span> <span>{player.level}</span>{" "}
                        </>
                      )}{" "}
                    </div>{" "}
                    <h2 className="font-display mt-4 text-[2.4rem] leading-[0.92] text-white">
                      {" "}
                      {player.display_name}{" "}
                    </h2>{" "}
                    <p className="mt-3 text-sm leading-7 text-white/68">
                      {" "}
                      {player.city || "Ville non renseignée"}{" "}
                      {player.region ? ` • ${player.region}` : ""}{" "}
                    </p>{" "}
                    <p className="mt-5 max-w-2xl text-sm leading-8 text-white/68">
                      {" "}
                      {player.bio || "Aucune bio pour le moment."}{" "}
                    </p>{" "}
                    <div className="mt-6 flex flex-wrap gap-5">
                      {" "}
                      <Link
                        href={`/joueurs/${player.id}`}
                        className="text-sm font-medium text-[#4f8cff]"
                      >
                        {" "}
                        Voir le profil{" "}
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
