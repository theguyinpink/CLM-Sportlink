import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EmptyState from "@/components/empty-state";
import PlayerAvatar from "@/components/player-avatar";
import CompatibilityBadge from "@/components/compatibility-badge";
import InsightPill from "@/components/insight-pill";
import FavoriteButton from "@/components/favorite-button";
import ReportButton from "@/components/report-button";
import { calculateOfferCompatibility, calculatePlayerClubCompatibility, getOfferType, getOfferTypeLabel } from "@/lib/matching";

type SearchParams = {
  q?: string;
  city?: string;
  level?: string;
  sort?: "match" | "recent" | "alpha";
  role?: "all" | "player" | "referee" | "staff";
};

const profileRoleLabels: Record<string, string> = {
  player: "Joueur",
  referee: "Arbitre",
  staff: "Coach / staff",
};

function getProfileRoleLabel(role: string) {
  return profileRoleLabels[role] || role;
}

export default async function ClubJoueursPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const city = (params.city || "").trim();
  const level = (params.level || "").trim();
  const sort = (params.sort || "match") as "match" | "recent" | "alpha";
  const role = (params.role || "all") as "all" | "player" | "referee" | "staff";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: club } = await supabase
    .from("clubs")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!club) redirect("/app/club/profil/edit");

  const [{ data: activeOffers }, { data: savedProfiles }] = await Promise.all([
    supabase
      .from("club_offers")
      .select("*")
      .eq("club_id", club.id)
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    supabase
      .from("saved_items")
      .select("target_id")
      .eq("user_id", user.id)
      .eq("target_type", "player_profile"),
  ]);

  const savedProfileIds = new Set((savedProfiles || []).map((item: any) => item.target_id));

  const offers = activeOffers || [];

  let playersQuery = supabase
    .from("player_profiles")
    .select("*")
    .or("is_public.eq.true,is_public.is.null");
  if (q) {
    const safeQ = q.replace(/[%_]/g, "");
    playersQuery = playersQuery.or(`display_name.ilike.%${safeQ}%,bio.ilike.%${safeQ}%,city.ilike.%${safeQ}%,position.ilike.%${safeQ}%,sport.ilike.%${safeQ}%`);
  }
  if (city) playersQuery = playersQuery.ilike("city", `%${city.replace(/[%_]/g, "")}%`);
  if (level) playersQuery = playersQuery.ilike("level", `%${level.replace(/[%_]/g, "")}%`);

  const { data: players } = await playersQuery.order("created_at", { ascending: false });
  const roleMatches = (player: any) => {
    if (role === "all") return true;
    const roles = Array.isArray(player.roles_available)
      ? player.roles_available
      : String(player.roles_available || "player").split(",").map((item) => item.trim());
    return roles.includes(role);
  };

  const scoredPlayers = (players || []).filter(roleMatches).map((player) => {
    if (offers.length > 0) {
      const best = offers
        .map((offer) => ({ offer, match: calculateOfferCompatibility(player, club, offer) }))
        .sort((a, b) => b.match.score - a.match.score)[0];

      return { player, match: best.match, offer: best.offer };
    }

    return { player, match: calculatePlayerClubCompatibility(player, club), offer: null };
  });
  const sortedPlayers = sort === "alpha"
    ? scoredPlayers.sort((a, b) => (a.player.display_name || "").localeCompare(b.player.display_name || ""))
    : sort === "match"
      ? scoredPlayers.sort((a, b) => b.match.score - a.match.score)
      : scoredPlayers;

  const hasFilters = Boolean(q || city || level || sort !== "match" || role !== "all");

  return (
    <main className="space-y-7">
      <section className="premium-card rounded-[28px] p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Recherche</p>
            <h1 className="font-display mt-2 text-[2.2rem] leading-tight text-[color:var(--text-main)]">Profils sportifs</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[color:var(--text-muted)]">
              Recherche des joueurs, arbitres ou coachs/staff. Les profils les plus compatibles avec tes annonces remontent en premier.
            </p>
          </div>
          <span className="rounded-full border border-[color:var(--line)] bg-[color:var(--surface-soft)] px-4 py-2 text-sm font-medium text-[color:var(--text-soft)]">
            {sortedPlayers.length} profil{sortedPlayers.length > 1 ? "s" : ""}
          </span>
        </div>

        <form className="ui-filter-grid gap-4">
          <input type="text" name="q" defaultValue={q} placeholder="Nom, sport, poste, ville..." className="ui-input w-full border px-5 py-3 text-sm leading-6" />
          <select name="role" defaultValue={role} className="ui-select w-full border px-5 py-3 text-sm leading-6">
            <option value="all">Tous les profils</option>
            <option value="player">Joueurs</option>
            <option value="referee">Arbitres</option>
            <option value="staff">Coach / staff</option>
          </select>
          <input type="text" name="city" defaultValue={city} placeholder="Ville" className="ui-input w-full border px-5 py-3 text-sm leading-6" />
          <input type="text" name="level" defaultValue={level} placeholder="Niveau" className="ui-input w-full border px-5 py-3 text-sm leading-6" />
          <div className="flex flex-wrap gap-3">
            <select name="sort" defaultValue={sort} className="ui-select min-w-[190px] flex-1 border px-5 py-3 text-sm leading-6">
              <option value="match">Meilleurs matchs</option>
              <option value="recent">Plus récents</option>
              <option value="alpha">A-Z</option>
            </select>
            <button type="submit" className="btn-primary rounded-2xl px-5 py-3 text-sm font-semibold">Filtrer</button>
          </div>
        </form>
        {hasFilters && <Link href="/app/club/joueurs" className="mt-4 inline-flex text-sm font-medium text-[color:var(--primary)]">Réinitialiser</Link>}
      </section>

      <section>
        {sortedPlayers.length === 0 ? (
          <EmptyState eyebrow="Aucun profil" title="Aucun résultat" description="Aucun profil public trouvé pour le moment." resetHref="/app/club/joueurs" />
        ) : (
          <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
            {sortedPlayers.map(({ player, match, offer }, index) => {
              const roles = Array.isArray(player.roles_available)
                ? player.roles_available
                : String(player.roles_available || "player").split(",").map((item) => item.trim()).filter(Boolean);

              return (
                <article key={player.id} className="premium-card animate-fade-up rounded-[24px] p-5" style={{ animationDelay: `${index * 45}ms` }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-4">
                      <PlayerAvatar avatarPath={player.avatar_path} displayName={player.display_name} size="md" />
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2">
                          {roles.slice(0, 3).map((item: string) => (
                            <span key={`${player.id}-${item}`} className="ui-pill rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.11em]">
                              {getProfileRoleLabel(item)}
                            </span>
                          ))}
                        </div>
                        <h2 className="font-display mt-4 break-words text-[1.65rem] leading-tight text-[color:var(--text-main)]">{player.display_name}</h2>
                        <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">
                          {[player.sport, player.position, player.level, player.city || player.region].filter(Boolean).join(" • ") || "Profil sportif"}
                        </p>
                      </div>
                    </div>
                    <CompatibilityBadge match={match} compact />
                  </div>

                  {offer && (
                    <div className="mt-5 rounded-[18px] border border-[color:var(--line)] bg-[color:var(--surface-soft)] px-4 py-3 text-sm leading-6 text-[color:var(--text-muted)]">
                      <span className="font-semibold text-[color:var(--text-main)]">Basé sur :</span>{" "}
                      {offer.title} · {getOfferTypeLabel(getOfferType(offer.offer_type, offer.category))}
                    </div>
                  )}

                  <p className="mt-5 line-clamp-3 text-sm leading-8 text-[color:var(--text-soft)]">{player.bio || "Aucune bio pour le moment."}</p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {match.reasons.slice(0, 4).map((reason) => <InsightPill key={`${player.id}-${reason.label}`} reason={reason} />)}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link href={`/app/club/joueurs/${player.id}`} className="btn-secondary rounded-full px-4 py-2.5 text-sm font-medium">Voir le CV sportif</Link>
                    <FavoriteButton targetType="player_profile" targetId={player.id} initialSaved={savedProfileIds.has(player.id)} compact />
                    <ReportButton targetType="player_profile" targetId={player.id} compact />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
