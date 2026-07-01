import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { clubInterestedInPlayer } from "@/app/connection-actions";
import PlayerAvatar from "@/components/player-avatar";
import PlayerMediaGrid from "@/components/player-media-grid";
import CompatibilityBadge from "@/components/compatibility-badge";
import InsightPill from "@/components/insight-pill";
import { calculateOfferCompatibility, calculatePlayerClubCompatibility, calculatePlayerCompletion } from "@/lib/matching";
import { getPublicPostsByPlayerProfile } from "@/lib/post-feed";
import PostCard from "@/components/post-card";
import FavoriteButton from "@/components/favorite-button";
import ReportButton from "@/components/report-button";

export default async function ClubPlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  const { data: player } = await supabase
    .from("player_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!player) {
    return <main className="space-y-8"><p className="text-white/68">Joueur introuvable.</p></main>;
  }

  const { data: acceptedRequest } = await supabase
    .from("connection_requests")
    .select("id, status")
    .eq("club_id", club.id)
    .eq("player_profile_id", player.id)
    .eq("status", "accepted")
    .maybeSingle();

  const [{ data: media }, { data: activeOffers }, playerPosts, { data: savedProfile }] = await Promise.all([
    supabase
      .from("player_media")
      .select("*")
      .eq("player_profile_id", player.id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("club_offers")
      .select("*")
      .eq("club_id", club.id)
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    getPublicPostsByPlayerProfile(supabase, player.id, player.user_id, 8),
    supabase
      .from("saved_items")
      .select("id")
      .eq("user_id", user.id)
      .eq("target_type", "player_profile")
      .eq("target_id", player.id)
      .maybeSingle(),
  ]);

  const offerMatches = (activeOffers || [])
    .map((offer) => ({ offer, match: calculateOfferCompatibility(player, club, offer) }))
    .sort((a, b) => b.match.score - a.match.score);

  const bestOfferMatch = offerMatches[0];
  const match = bestOfferMatch?.match || calculatePlayerClubCompatibility(player, club);
  const completion = calculatePlayerCompletion(player);

  return (
    <main className="space-y-14">
      <section className="premium-card rounded-[40px] p-7 sm:p-9">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="flex items-start gap-5">
            <PlayerAvatar avatarPath={player.avatar_path} displayName={player.display_name} size="lg" />
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">CV sportif</p>
              <h1 className="font-display mt-5 text-[3.4rem] uppercase leading-[0.9] text-white sm:text-[4.8rem]">{player.display_name}</h1>
              <p className="mt-4 text-white/68">{player.sport}{player.position ? ` • ${player.position}` : ""}{player.level ? ` • ${player.level}` : ""}</p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-4 sm:items-end">
            <CompatibilityBadge match={match} />
            {bestOfferMatch?.offer && (
              <p className="max-w-[260px] text-right text-xs uppercase tracking-[0.18em] text-[#8bb7ff]">
                Score basé sur : {bestOfferMatch.offer.title}
              </p>
            )}
            <div className="flex flex-wrap justify-start gap-3 sm:justify-end">
              <FavoriteButton targetType="player_profile" targetId={player.id} initialSaved={Boolean(savedProfile?.id)} compact />
              <ReportButton targetType="player_profile" targetId={player.id} compact />
            </div>
            {!acceptedRequest && (
              <form action={clubInterestedInPlayer}>
                <input type="hidden" name="player_profile_id" value={player.id} />
                <button type="submit" className="rounded-full bg-gradient-to-r from-[#4f8cff] to-[#00d4ff] px-5 py-3 text-sm font-bold text-[#050612] shadow-[0_14px_45px_rgba(79,140,255,0.22)] transition hover:-translate-y-0.5">Je suis intéressé</button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {match.reasons.map((reason) => <InsightPill key={reason.label} reason={reason} />)}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-4">
        <div className="premium-card rounded-[28px] p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Profil complété</p>
          <p className="font-display mt-3 text-[3rem] leading-none text-white">{completion.score}%</p>
        </div>
        <div className="premium-card rounded-[28px] p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Ville</p>
          <p className="mt-3 text-white">{player.city || "Non renseignée"}</p>
        </div>
        <div className="premium-card rounded-[28px] p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Région</p>
          <p className="mt-3 text-white">{player.region || "Non renseignée"}</p>
        </div>
        <div className="premium-card rounded-[28px] p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Disponibilité</p>
          <p className="mt-3 text-white">{player.open_to_opportunities ? "Ouvert" : "Non indiqué"}</p>
        </div>
      </section>

      <section className="grid gap-16 border-t border-white/5 pt-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Résumé sportif</p>
            <p className="mt-5 whitespace-pre-line text-base leading-9 text-white/68">{player.bio || "Aucune bio pour le moment."}</p>
          </div>

          {acceptedRequest && (
            <div className="premium-card rounded-[30px] p-6">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#35e6a5]">Contact unlocked</p>
              <div className="mt-5 space-y-4">
                {player.contact_email_visible_after_accept && player.contact_email ? <p className="text-white">Email : {player.contact_email}</p> : <p className="text-white/68">Email non visible</p>}
                {player.phone_visible_after_accept && player.phone ? <p className="text-white">Téléphone : {player.phone}</p> : <p className="text-white/68">Téléphone non visible</p>}
              </div>
            </div>
          )}
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Lecture recruteur</p>
          {bestOfferMatch?.offer && (
            <p className="mt-3 text-sm leading-7 text-white/55">
              Le score est calculé avec l’annonce active la plus compatible : <span className="text-white">{bestOfferMatch.offer.title}</span>.
            </p>
          )}
          <div className="mt-6 space-y-4">
            {match.reasons.map((reason) => (
              <div key={reason.label} className="rounded-[24px] border border-white/8 bg-white/4 p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium text-white">{reason.label}</p>
                  {reason.points > 0 && <span className="text-sm text-white/45">+{reason.points}</span>}
                </div>
                <p className="mt-2 text-sm text-white/62">{reason.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-8 border-t border-white/5 pt-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">Médias & actualités</p>
          <h2 className="font-display mt-3 text-[2.2rem] uppercase leading-[0.92] text-white">Temps forts</h2>
        </div>

        {media && media.length > 0 && <PlayerMediaGrid media={media} />}

        {playerPosts.length > 0 && (
          <div className="space-y-5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">Publications récentes</p>
            {playerPosts.map((post, index) => (
              <PostCard key={post.id} post={post} currentUserId={user.id} viewerRole="club" index={index} />
            ))}
          </div>
        )}

        {(!media || media.length === 0) && playerPosts.length === 0 && (
          <p className="text-white/62">Aucun temps fort public pour le moment.</p>
        )}
      </section>

      <Link href="/app/club/joueurs" className="inline-flex text-sm text-white/68 transition hover:text-white">Retour aux joueurs</Link>
    </main>
  );
}
