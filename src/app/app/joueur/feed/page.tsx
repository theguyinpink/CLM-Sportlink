import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EmptyState from "@/components/empty-state";
import OpportunityCard from "@/components/opportunity-card";
import ProfileCompletionNotice from "@/components/profile-completion-notice";
import {
  calculateOfferCompatibility,
  calculatePlayerCompletion,
} from "@/lib/matching";

export default async function JoueurFeedPage({
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

  const { data: profile } = await supabase
    .from("player_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) redirect("/app/joueur/profil/edit");

  const [offersResponse, requestsResponse] = await Promise.all([
    supabase
      .from("club_offers")
      .select("*, clubs(id, club_name, sport, city, region, level, logo_path, description)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(60),
    supabase
      .from("connection_requests")
      .select("id, status", { count: "exact" })
      .eq("player_profile_id", profile.id),
  ]);

  const activeOffers = offersResponse.data || [];
  const requests = requestsResponse.data || [];
  const acceptedRequests = requests.filter((request) => request.status === "accepted").length;

  const scoredOffers = activeOffers
    .map((offer: any) => {
      const club = Array.isArray(offer.clubs) ? offer.clubs[0] : offer.clubs;
      return club
        ? { offer, club, match: calculateOfferCompatibility(profile, club, offer) }
        : null;
    })
    .filter(Boolean) as any[];

  scoredOffers.sort((a, b) => b.match.score - a.match.score);

  const topOffer = scoredOffers[0];
  const completion = calculatePlayerCompletion(profile);

  return (
    <main className="space-y-10">
      <section className="premium-card overflow-hidden rounded-[42px] p-7 sm:p-9">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,140,255,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(155,92,255,0.14),transparent_35%)]" />
        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">Accueil joueur</p>
            <h1 className="font-display mt-5 text-[3.4rem] uppercase leading-[0.9] text-white sm:text-[4.8rem] lg:text-[6rem]">
              Pilote ton
              <br />
              profil sportif
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
              Ton accueil garde uniquement l’essentiel : ton profil, ton meilleur match, les offres actives et les contacts déjà débloqués.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[26px] border border-white/8 bg-white/5 p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Profil complété</p>
              <p className="font-display mt-3 text-[3rem] leading-none text-white">{completion.score}%</p>
            </div>
            <div className="rounded-[26px] border border-white/8 bg-white/5 p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Meilleur match</p>
              <p className="font-display mt-3 text-[3rem] leading-none text-white">{topOffer?.match.score ?? 0}%</p>
            </div>
            <div className="rounded-[26px] border border-white/8 bg-white/5 p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Offres actives</p>
              <p className="font-display mt-3 text-[3rem] leading-none text-white">{scoredOffers.length}</p>
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
        storageKey={`clm-player-completion-${profile.id}`}
        title="Ton profil n’est pas encore complet"
        description="Un profil complet améliore ta visibilité et rend le score de compatibilité plus fiable."
        score={completion.score}
        checks={completion.checks}
        ctaHref="/app/joueur/profil/edit"
        ctaLabel="Compléter mon profil"
      />

      <section>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">Meilleures opportunités</p>
            <h2 className="font-display mt-3 text-[2.2rem] uppercase leading-[0.92] text-white">À regarder maintenant</h2>
          </div>
          <Link href="/app/joueur/opportunites" className="text-sm font-medium text-[#4f8cff]">Tout voir</Link>
        </div>
        <div className="space-y-6">
          {scoredOffers.length === 0 ? (
            <EmptyState eyebrow="Aucune annonce" title="Aucune opportunité" description="Dès qu’un club publie une annonce active, elle apparaîtra ici avec son score." resetHref="/app/joueur/feed" />
          ) : (
            scoredOffers.slice(0, 5).map((item, index) => (
              <OpportunityCard key={item.offer.id} offer={item.offer} club={item.club} match={item.match} href={`/app/joueur/clubs/${item.club.id}`} index={index} />
            ))
          )}
        </div>
      </section>
    </main>
  );
}
