import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { playerInterestedInClub } from "@/app/connection-actions";
import ClubLogo from "@/components/club-logo";
import OpportunityCard from "@/components/opportunity-card";
import CompatibilityBadge from "@/components/compatibility-badge";
import InsightPill from "@/components/insight-pill";
import { calculateOfferCompatibility, calculatePlayerClubCompatibility } from "@/lib/matching";
import { getPublicPostsByClub } from "@/lib/post-feed";
import PostCard from "@/components/post-card";
import FavoriteButton from "@/components/favorite-button";
import ReportButton from "@/components/report-button";

export default async function PlayerClubDetailPage({
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

  const { data: profile } = await supabase
    .from("player_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) redirect("/app/joueur/profil/edit");

  const { data: club } = await supabase
    .from("clubs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!club) return <main><p className="text-white/68">Club introuvable.</p></main>;

  const { data: acceptedRequest } = await supabase
    .from("connection_requests")
    .select("id, status")
    .eq("club_id", club.id)
    .eq("player_profile_id", profile.id)
    .eq("status", "accepted")
    .maybeSingle();

  const [{ data: offers }, clubPosts, { data: savedClub }] = await Promise.all([
    supabase
      .from("club_offers")
      .select("*")
      .eq("club_id", club.id)
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    getPublicPostsByClub(supabase, club.id, club.user_id, 8),
    supabase
      .from("saved_items")
      .select("id")
      .eq("user_id", user.id)
      .eq("target_type", "club")
      .eq("target_id", club.id)
      .maybeSingle(),
  ]);

  const clubMatch = calculatePlayerClubCompatibility(profile, club);
  const scoredOffers = (offers || []).map((offer) => ({ offer, match: calculateOfferCompatibility(profile, club, offer) })).sort((a, b) => b.match.score - a.match.score);

  return (
    <main className="space-y-14">
      <section className="premium-card rounded-[40px] p-7 sm:p-9">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="flex items-start gap-5">
            <ClubLogo logoPath={club.logo_path} clubName={club.club_name} size="lg" />
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">Profil club</p>
              <h1 className="font-display mt-5 text-[3.4rem] uppercase leading-[0.9] text-white sm:text-[4.8rem]">{club.club_name}</h1>
              <p className="mt-4 text-white/68">{club.sport}{club.level ? ` • ${club.level}` : ""}{club.city ? ` • ${club.city}` : ""}</p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-4 sm:items-end">
            <CompatibilityBadge match={clubMatch} />
            <div className="flex flex-wrap justify-start gap-3 sm:justify-end">
              <FavoriteButton targetType="club" targetId={club.id} initialSaved={Boolean(savedClub?.id)} compact />
              <ReportButton targetType="club" targetId={club.id} compact />
            </div>
            {!acceptedRequest && (
              <form action={playerInterestedInClub}>
                <input type="hidden" name="club_id" value={club.id} />
                <button type="submit" className="rounded-full bg-gradient-to-r from-[#4f8cff] to-[#00d4ff] px-5 py-3 text-sm font-bold text-[#050612] shadow-[0_14px_45px_rgba(79,140,255,0.22)] transition hover:-translate-y-0.5">Je suis intéressé</button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {clubMatch.reasons.map((reason) => <InsightPill key={reason.label} reason={reason} />)}
        </div>
      </section>

      <section className="grid gap-16 border-t border-white/5 pt-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Projet club</p>
          <p className="mt-5 whitespace-pre-line text-base leading-9 text-white/68">{club.description || "Aucune description pour le moment."}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Localisation</p>
              <p className="mt-3 text-white">{club.city || club.region || "Non renseignée"}</p>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Recrutement</p>
              <p className="mt-3 text-white">{scoredOffers.length > 0 ? `${scoredOffers.length} annonce(s) active(s)` : "Aucune annonce"}</p>
            </div>
          </div>

          {acceptedRequest && (
            <div className="mt-8 premium-card rounded-[30px] p-6">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#35e6a5]">Contact unlocked</p>
              <div className="mt-5 space-y-4">
                <p className="text-white">{club.contact_email ? `Email : ${club.contact_email}` : "Email non renseigné"}</p>
                <p className="text-white">{club.phone ? `Téléphone : ${club.phone}` : "Téléphone non renseigné"}</p>
              </div>
            </div>
          )}
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Pourquoi ce club peut matcher</p>
          <div className="mt-6 space-y-4">
            {clubMatch.reasons.map((reason) => (
              <div key={reason.label} className="rounded-[24px] border border-white/8 bg-white/4 p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium text-white">{reason.label}</p>
                  <span className="text-sm text-white/45">+{reason.points}</span>
                </div>
                <p className="mt-2 text-sm text-white/62">{reason.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Annonces actives</p>
          <h2 className="font-display mt-3 text-[2.2rem] uppercase leading-[0.92] text-white">Opportunités du club</h2>
        </div>
        <div className="space-y-6">
          {scoredOffers.length === 0 ? (
            <p className="text-white/68">Aucune annonce active.</p>
          ) : (
            scoredOffers.map((item, index) => (
              <OpportunityCard key={item.offer.id} offer={item.offer} club={club} match={item.match} href={`/app/joueur/clubs/${club.id}`} canApply={!acceptedRequest} index={index} />
            ))
          )}
        </div>
      </section>



      <section className="space-y-8 border-t border-white/5 pt-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Médias & actualités</p>
          <h2 className="font-display mt-3 text-[2.2rem] uppercase leading-[0.92] text-white">Temps forts du club</h2>
        </div>

        {clubPosts.length === 0 ? (
          <p className="text-white/68">Aucune actualité publiée par ce club pour le moment.</p>
        ) : (
          <div className="space-y-5">
            {clubPosts.map((post, index) => (
              <PostCard key={post.id} post={post} currentUserId={user.id} viewerRole="player" index={index} />
            ))}
          </div>
        )}
      </section>

            <Link href="/app/joueur/clubs" className="inline-flex text-sm text-white/68 transition hover:text-white">Retour aux clubs</Link>
    </main>
  );
}
