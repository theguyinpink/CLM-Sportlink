import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EmptyState from "@/components/empty-state";
import PlayerAvatar from "@/components/player-avatar";
import CompatibilityBadge from "@/components/compatibility-badge";
import ProfileCompletionNotice from "@/components/profile-completion-notice";
import InsightPill from "@/components/insight-pill";
import {
  calculateClubCompletion,
  calculateOfferCompatibility,
  calculatePlayerClubCompatibility,
} from "@/lib/matching";

function bestMatchForPlayer(player: any, club: any, offers: any[]) {
  if (!offers.length) {
    return {
      match: calculatePlayerClubCompatibility(player, club),
      offer: null,
    };
  }

  const matches = offers
    .map((offer) => ({ offer, match: calculateOfferCompatibility(player, club, offer) }))
    .sort((a, b) => b.match.score - a.match.score);

  return matches[0];
}

export default async function ClubFeedPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  const message = params.message;
  const error = params.error;

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

  const [playersResponse, offersResponse, requestsResponse] = await Promise.all([
    supabase
      .from("player_profiles")
      .select("*")
      .or("is_public.eq.true,is_public.is.null")
      .order("created_at", { ascending: false })
      .limit(80),
    supabase
      .from("club_offers")
      .select("*")
      .eq("club_id", club.id)
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    supabase
      .from("connection_requests")
      .select("id, status", { count: "exact" })
      .eq("club_id", club.id),
  ]);

  const players = playersResponse.data || [];
  const activeOffers = offersResponse.data || [];
  const requests = requestsResponse.data || [];
  const acceptedRequests = requests.filter((request) => request.status === "accepted").length;

  const scoredPlayers = players
    .map((player) => {
      const best = bestMatchForPlayer(player, club, activeOffers);
      return { player, match: best.match, offer: best.offer };
    })
    .sort((a, b) => b.match.score - a.match.score);

  const completion = calculateClubCompletion(club);
  const topPlayer = scoredPlayers[0];
  const { count: clubPostCount } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .or(`club_id.eq.${club.id},author_user_id.eq.${user.id},user_id.eq.${user.id}`);
  const clubStarterSteps = [
    { label: "Fiche complétée", done: completion.score === 100, href: "/app/club/profil" },
    { label: "Logo ajouté", done: Boolean(club.logo_path), href: "/app/club/parametres" },
    { label: "Annonce active", done: activeOffers.length > 0, href: "/app/club/annonces" },
    { label: "Actualité publiée", done: (clubPostCount ?? 0) > 0, href: "/app/club/fil" },
    { label: "Contact débloqué", done: acceptedRequests > 0, href: "/app/club/contacts" },
  ];
  const showClubStarter = clubStarterSteps.some((step) => !step.done);

  return (
    <main className="space-y-10">
      <section className="premium-card overflow-hidden rounded-[42px] p-7 sm:p-9">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(155,92,255,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(0,212,255,0.12),transparent_35%)]" />
        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">Accueil club</p>
            <h1 className="font-display mt-5 text-[3.4rem] uppercase leading-[0.9] text-white sm:text-[4.8rem] lg:text-[6rem]">
              Pilote ton
              <br />
              recrutement
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
              Ton accueil garde uniquement l’essentiel : ta fiche, ton meilleur profil compatible, tes annonces actives et les contacts déjà débloqués.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[26px] border border-white/8 bg-white/5 p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Fiche complétée</p>
              <p className="font-display mt-3 text-[3rem] leading-none text-white">{completion.score}%</p>
            </div>
            <div className="rounded-[26px] border border-white/8 bg-white/5 p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Meilleur profil</p>
              <p className="font-display mt-3 text-[3rem] leading-none text-white">{topPlayer?.match.score ?? 0}%</p>
            </div>
            <div className="rounded-[26px] border border-white/8 bg-white/5 p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Annonces actives</p>
              <p className="font-display mt-3 text-[3rem] leading-none text-white">{activeOffers.length}</p>
            </div>
            <div className="rounded-[26px] border border-white/8 bg-white/5 p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Contacts débloqués</p>
              <p className="font-display mt-3 text-[3rem] leading-none text-white">{acceptedRequests}</p>
            </div>
          </div>
        </div>
      </section>

      {message && <div className="rounded-full border border-[#4f8cff]/25 bg-[#4f8cff]/10 px-5 py-3 text-sm text-[#8bb7ff]">{message}</div>}
      {error && <div className="rounded-full border border-red-500/25 bg-red-500/10 px-5 py-3 text-sm text-red-300">{error}</div>}

      <ProfileCompletionNotice
        storageKey={`clm-club-completion-${club.id}`}
        title="Ta fiche club n’est pas encore complète"
        description="Une fiche complète et des annonces précises permettent au moteur de compatibilité de proposer de meilleurs profils."
        score={completion.score}
        checks={completion.checks}
        ctaHref="/app/club/profil/edit"
        ctaLabel="Améliorer ma fiche"
      />

      {showClubStarter && (
        <section className="premium-card rounded-[26px] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Premiers pas</p>
              <h2 className="mt-2 text-xl font-semibold text-[color:var(--text-main)]">À faire pour être prêt en bêta</h2>
            </div>
            <Link href="/app/club/profil" className="text-sm font-medium text-[color:var(--primary)]">Voir ma fiche</Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {clubStarterSteps.map((step) => (
              <Link key={step.label} href={step.href} className="rounded-[18px] border border-[color:var(--line)] bg-[color:var(--surface-soft)] px-4 py-3 text-sm text-[color:var(--text-soft)]">
                <span className={step.done ? "text-emerald-400" : "text-amber-400"}>{step.done ? "✓" : "•"}</span> {step.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">Meilleurs profils</p>
            <h2 className="font-display mt-3 text-[2.2rem] uppercase leading-[0.92] text-white">À regarder maintenant</h2>
          </div>
          <Link href="/app/club/joueurs" className="text-sm font-medium text-[#4f8cff]">Tout voir</Link>
        </div>

        <div className="space-y-6">
          {scoredPlayers.length === 0 ? (
            <EmptyState eyebrow="Aucun joueur" title="Aucun joueur" description="Les profils publics apparaîtront ici avec leur score." resetHref="/app/club/feed" />
          ) : (
            scoredPlayers.slice(0, 5).map(({ player, match, offer }, index) => (
              <article key={player.id} className="premium-card animate-fade-up rounded-[30px] p-5" style={{ animationDelay: `${index * 60}ms` }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-4">
                    <PlayerAvatar avatarPath={player.avatar_path} displayName={player.display_name} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">{player.sport}{player.position ? ` • ${player.position}` : ""}{player.level ? ` • ${player.level}` : ""}</p>
                      <h3 className="font-display mt-4 text-[2rem] uppercase leading-[0.94] text-white">{player.display_name}</h3>
                      <p className="mt-3 text-sm leading-7 text-white/68">{player.city || "Ville non renseignée"}{player.region ? ` • ${player.region}` : ""}</p>
                      {offer && <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[#8bb7ff]">Basé sur : {offer.title}</p>}
                    </div>
                  </div>
                  <CompatibilityBadge match={match} compact />
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {match.reasons.slice(0, 4).map((reason) => <InsightPill key={`${player.id}-${reason.label}`} reason={reason} />)}
                </div>

                <Link href={`/app/club/joueurs/${player.id}`} className="mt-6 inline-flex text-sm font-medium text-[#4f8cff]">Voir le profil</Link>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
