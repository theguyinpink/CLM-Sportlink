import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EmptyState from "@/components/empty-state";
import PlayerAvatar from "@/components/player-avatar";
import CustomSelect from "@/components/custom-select";
import CompatibilityBadge from "@/components/compatibility-badge";
import InsightPill from "@/components/insight-pill";
import { calculateOfferCompatibility, calculatePlayerClubCompatibility, getOfferType, getOfferTypeLabel } from "@/lib/matching";
import { LEVEL_OPTIONS, REGION_OPTIONS } from "@/lib/form-options";

type SearchParams = {
  q?: string;
  city?: string;
  level?: string;
  sort?: "match" | "recent" | "alpha";
  role?: "all" | "player" | "referee" | "staff";
};

function rolesFromProfile(player: any) {
  return Array.isArray(player.roles_available)
    ? player.roles_available.map(String)
    : String(player.roles_available || "player")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
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

  const { data: activeOffers } = await supabase
    .from("club_offers")
    .select("*")
    .eq("club_id", club.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const offers = activeOffers || [];

  let playersQuery = supabase
    .from("player_profiles")
    .select("*")
    .or("is_public.eq.true,is_public.is.null");

  if (q) {
    const safeQ = q.replace(/[%_]/g, "");
    playersQuery = playersQuery.or(`display_name.ilike.%${safeQ}%,bio.ilike.%${safeQ}%,city.ilike.%${safeQ}%,position.ilike.%${safeQ}%`);
  }
  if (city) playersQuery = playersQuery.ilike("city", `%${city.replace(/[%_]/g, "")}%`);
  if (level) playersQuery = playersQuery.ilike("level", `%${level.replace(/[%_]/g, "")}%`);

  const { data: players } = await playersQuery.order("created_at", { ascending: false });
  const roleMatches = (player: any) => role === "all" || rolesFromProfile(player).includes(role);

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
    ? [...scoredPlayers].sort((a, b) => (a.player.display_name || "").localeCompare(b.player.display_name || ""))
    : sort === "match"
      ? [...scoredPlayers].sort((a, b) => b.match.score - a.match.score)
      : scoredPlayers;

  const hasFilters = Boolean(q || city || level || sort !== "match" || role !== "all");

  return (
    <main className="space-y-7">
      <section className="premium-card rounded-[28px] p-5 sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--text-dim)]">Joueurs</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-[color:var(--text-main)] sm:text-4xl">
              Profils classés par compatibilité
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[color:var(--text-muted)]">
              Les profils les plus proches de tes besoins remontent en premier. Les cartes sont volontairement compactes pour voir plus de résultats.
            </p>
          </div>
          <span className="rounded-full border border-[#4f8cff]/25 bg-[#4f8cff]/10 px-4 py-2 text-sm font-semibold text-[#4f8cff]">
            {sortedPlayers.length} profil{sortedPlayers.length > 1 ? "s" : ""}
          </span>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/8 bg-white/2 p-5">
        <form className="grid gap-4 lg:grid-cols-5">
          <input type="text" name="q" defaultValue={q} placeholder="Rechercher un profil..." className="rounded-full border border-white/10 bg-transparent px-5 py-3 text-sm text-white outline-none placeholder:text-white/30" />
          <CustomSelect
            name="role"
            defaultValue={role}
            options={[
              { value: "all", label: "Tous les profils" },
              { value: "player", label: "Joueurs" },
              { value: "referee", label: "Arbitres" },
              { value: "staff", label: "Coach / staff" },
            ]}
          />
          <CustomSelect
            name="city"
            defaultValue={city}
            placeholder="Toutes les zones"
            options={[{ value: "", label: "Toutes les zones" }, ...REGION_OPTIONS]}
          />
          <CustomSelect
            name="level"
            defaultValue={level}
            placeholder="Tous les niveaux"
            options={[{ value: "", label: "Tous les niveaux" }, ...LEVEL_OPTIONS]}
          />
          <div className="flex gap-3">
            <CustomSelect
              name="sort"
              defaultValue={sort}
              className="min-w-0 flex-1"
              options={[
                { value: "match", label: "Meilleurs matchs" },
                { value: "recent", label: "Plus récents" },
                { value: "alpha", label: "A-Z" },
              ]}
            />
            <button type="submit" className="rounded-full bg-[#4f8cff] px-5 py-3 text-sm font-medium text-[#07080f] transition hover:bg-[#00d4ff]">Filtrer</button>
          </div>
        </form>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/55">
          <span>{sortedPlayers.length} profil{sortedPlayers.length > 1 ? "s" : ""} trouvé{sortedPlayers.length > 1 ? "s" : ""}</span>
          {hasFilters && <Link href="/app/club/joueurs" className="text-[#4f8cff]">Réinitialiser</Link>}
        </div>
      </section>

      <section>
        {sortedPlayers.length === 0 ? (
          <EmptyState eyebrow="Aucun joueur" title="Aucun résultat" description="Aucun profil public trouvé pour le moment. Vérifie qu'un profil joueur est bien public." resetHref="/app/club/joueurs" />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {sortedPlayers.map(({ player, match, offer }, index) => {
              const roles = rolesFromProfile(player);

              return (
                <article key={player.id} className="premium-card animate-fade-up rounded-[26px] p-4 sm:p-5" style={{ animationDelay: `${index * 45}ms` }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <PlayerAvatar avatarPath={player.avatar_path} displayName={player.display_name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap gap-1.5">
                          {roles.slice(0, 3).map((item: string) => (
                            <span key={`${player.id}-${item}`} className="rounded-full border border-[#35e6a5]/20 bg-[#35e6a5]/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-[#35e6a5]">
                              {getOfferTypeLabel(item)}
                            </span>
                          ))}
                        </div>
                        <h2 className="mt-3 truncate text-xl font-semibold tracking-[-0.04em] text-[color:var(--text-main)]">{player.display_name}</h2>
                        <p className="mt-2 text-xs leading-6 text-[color:var(--text-muted)]">
                          {[player.sport, player.position, player.level, player.city || player.region].filter(Boolean).join(" • ") || "Profil à compléter"}
                        </p>
                      </div>
                    </div>
                    <CompatibilityBadge match={match} compact />
                  </div>

                  {offer && <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-[#4f8cff]">Basé sur : {offer.title} · {getOfferTypeLabel(getOfferType(offer.offer_type, offer.category))}</p>}
                  <p className="mt-3 line-clamp-2 text-sm leading-7 text-[color:var(--text-soft)]">{player.bio || "Aucune bio pour le moment."}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {match.reasons.slice(0, 3).map((reason) => <InsightPill key={`${player.id}-${reason.label}`} reason={reason} />)}
                  </div>

                  <Link href={`/app/club/joueurs/${player.id}`} className="mt-5 inline-flex text-sm font-medium text-[#4f8cff]">Voir le CV sportif</Link>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
