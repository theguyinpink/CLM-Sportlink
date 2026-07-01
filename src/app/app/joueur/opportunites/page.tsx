import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EmptyState from "@/components/empty-state";
import OpportunityCard from "@/components/opportunity-card";
import OnboardingCard from "@/components/onboarding-card";
import { calculateOfferCompatibility, calculatePlayerCompletion, getCategoryLabel, getOfferType, getOfferTypeLabel } from "@/lib/matching";

type SearchParams = {
  q?: string;
  city?: string;
  level?: string;
  sort?: "match" | "recent" | "alpha";
  type?: "all" | "player" | "referee" | "staff";
};

export default async function JoueurOpportunitesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const normalizeSearch = (value?: string | null) =>
    (value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const q = normalizeSearch(params.q);
  const city = normalizeSearch(params.city);
  const level = normalizeSearch(params.level);
  const sort = (params.sort || "match") as "match" | "recent" | "alpha";
  const type = (params.type || "all") as "all" | "player" | "referee" | "staff";

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

  const { data: activeOffers } = await supabase
    .from("club_offers")
    .select("*, clubs(id, club_name, sport, city, region, level, logo_path, description)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(100);

  const matchesSearch = (...values: Array<string | null | undefined>) =>
    !q || values.some((value) => normalizeSearch(value).includes(q));
  const matchesCity = (value?: string | null) => !city || normalizeSearch(value).includes(city);
  const matchesLevel = (value?: string | null) => !level || normalizeSearch(value).includes(level);

  const searchableRoleTerms = (offerType: string, category?: string | null) => {
    if (offerType === "referee") {
      return "recherche arbitre arbitrage officiel match referee referee arbitrer";
    }

    if (offerType === "staff") {
      return "recherche coach staff encadrement entraineur entraineuse preparateur preparation benevole";
    }

    return "recherche joueur joueuse recrutement essai detection poste equipe talent";
  };

  let offers: any[] = (activeOffers || [])
    .map((offer: any) => {
      const club = Array.isArray(offer.clubs) ? offer.clubs[0] : offer.clubs;
      return {
        offer,
        club,
        match: club ? calculateOfferCompatibility(profile, club, offer) : null,
      };
    })
    .filter((item: any) => item.club && item.match)
    .filter((item: any) => {
      const { offer, club } = item;
      const offerType = getOfferType(offer.offer_type, offer.category);
      return (
        (type === "all" || offerType === type) &&
        matchesSearch(
          offer.title,
          offer.description,
          offer.position_needed,
          offer.level_required,
          offer.location,
          offer.remuneration,
          offer.offer_type,
          getOfferTypeLabel(offerType),
          offer.category,
          getCategoryLabel(offer.category),
          searchableRoleTerms(offerType, offer.category),
          club.club_name,
          club.sport,
          club.city,
          club.region,
          club.level,
        ) &&
        matchesCity(offer.location || club.city || club.region) &&
        matchesLevel(offer.level_required || club.level)
      );
    });

  if (sort === "match") {
    offers = [...offers].sort((a: any, b: any) => b.match.score - a.match.score);
  } else if (sort === "alpha") {
    offers = [...offers].sort((a: any, b: any) => (a.offer.title || "").localeCompare(b.offer.title || ""));
  }

  const bestMatch = offers[0];
  const completion = calculatePlayerCompletion(profile);
  const hasFilters = Boolean(q || city || level || sort !== "match" || type !== "all");

  return (
    <main className="space-y-10">
      <OnboardingCard
        title="Profil joueur"
        description="Plus ton profil est complet, plus les offres compatibles ressortent correctement dans ta recherche."
        score={completion.score}
        checks={completion.checks}
        ctaHref="/app/joueur/profil/edit"
        ctaLabel="Améliorer mon profil"
      />

      <section className="space-y-6">
        {bestMatch && (
          <div className="premium-card rounded-[34px] p-6 sm:p-7">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#35e6a5]">Meilleur match</p>
                <h1 className="font-display mt-3 text-[2.4rem] uppercase leading-[0.9] text-white sm:text-[3.2rem]">
                  L’offre la plus compatible
                </h1>
              </div>
              <span className="rounded-full border border-[#35e6a5]/25 bg-[#35e6a5]/10 px-4 py-2 text-sm font-semibold text-[#35e6a5]">
                {bestMatch.match.score}% compatible
              </span>
            </div>
            <OpportunityCard offer={bestMatch.offer} club={bestMatch.club} match={bestMatch.match} href={`/app/joueur/clubs/${bestMatch.club.id}`} index={0} />
          </div>
        )}

        <div className="rounded-[28px] border border-white/8 bg-white/2 p-5">
          <div className="mb-5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">Recherche</p>
            <h2 className="font-display mt-2 text-[2rem] uppercase leading-[0.92] text-white">Offres compatibles</h2>
          </div>

          <form className="grid gap-4 lg:grid-cols-6">
            <input
              type="text"
              name="q"
              defaultValue={params.q || ""}
              placeholder="Club, poste, offre..."
              className="rounded-full border border-white/10 bg-transparent px-5 py-3 text-sm text-white outline-none placeholder:text-white/30 lg:col-span-2"
            />
            <select name="type" defaultValue={type} className="rounded-full border border-white/10 bg-transparent px-5 py-3 text-sm text-white outline-none">
              <option value="all" className="bg-[#07080f] text-white">Tous les besoins</option>
              <option value="player" className="bg-[#07080f] text-white">Joueur</option>
              <option value="referee" className="bg-[#07080f] text-white">Arbitre</option>
              <option value="staff" className="bg-[#07080f] text-white">Coach / staff</option>
            </select>
            <input type="text" name="city" defaultValue={params.city || ""} placeholder="Ville" className="rounded-full border border-white/10 bg-transparent px-5 py-3 text-sm text-white outline-none placeholder:text-white/30" />
            <input type="text" name="level" defaultValue={params.level || ""} placeholder="Niveau" className="rounded-full border border-white/10 bg-transparent px-5 py-3 text-sm text-white outline-none placeholder:text-white/30" />
            <div className="flex gap-3">
              <select name="sort" defaultValue={sort} className="min-w-0 flex-1 rounded-full border border-white/10 bg-transparent px-5 py-3 text-sm text-white outline-none">
                <option value="match" className="bg-[#07080f] text-white">Compatibilité</option>
                <option value="recent" className="bg-[#07080f] text-white">Plus récents</option>
                <option value="alpha" className="bg-[#07080f] text-white">A-Z</option>
              </select>
              <button type="submit" className="rounded-full bg-[#4f8cff] px-5 py-3 text-sm font-medium text-[#07080f] transition hover:bg-[#00d4ff]">Filtrer</button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/55">
            <span>{offers.length} offre{offers.length > 1 ? "s" : ""} compatible{offers.length > 1 ? "s" : ""}</span>
            {hasFilters && <Link href="/app/joueur/opportunites" className="text-[#4f8cff]">Réinitialiser</Link>}
          </div>
        </div>
      </section>

      <section>
        <div className="space-y-6">
          {offers.length === 0 ? (
            <EmptyState
              eyebrow="Aucune annonce"
              title="Aucune opportunité utile"
              description="Aucune opportunité active trouvée. Réinitialise les filtres ou complète ton profil pour améliorer les résultats."
              resetHref="/app/joueur/opportunites"
              ctaHref="/app/joueur/feed"
              ctaLabel="Retour à l’accueil"
            />
          ) : (
            offers.map((item: any, index: number) => (
              <OpportunityCard key={item.offer.id} offer={item.offer} club={item.club} match={item.match} href={`/app/joueur/clubs/${item.club.id}`} index={index} />
            ))
          )}
        </div>
      </section>
    </main>
  );
}
