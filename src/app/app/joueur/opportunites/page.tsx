import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EmptyState from "@/components/empty-state";
import OpportunityCard from "@/components/opportunity-card";
import { calculateOfferCompatibility, getCategoryLabel, getOfferType, getOfferTypeLabel } from "@/lib/matching";

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

  const [{ data: activeOffers }, { data: savedItems }] = await Promise.all([
    supabase
      .from("club_offers")
      .select("*, clubs(id, club_name, sport, city, region, level, logo_path, description)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("saved_items")
      .select("target_id")
      .eq("user_id", user.id)
      .eq("target_type", "club_offer"),
  ]);

  const savedOfferIds = new Set((savedItems || []).map((item: any) => item.target_id));

  const matchesSearch = (...values: Array<string | null | undefined>) =>
    !q || values.some((value) => normalizeSearch(value).includes(q));
  const matchesCity = (value?: string | null) => !city || normalizeSearch(value).includes(city);
  const matchesLevel = (value?: string | null) => !level || normalizeSearch(value).includes(level);

  const searchableRoleTerms = (offerType: string) => {
    if (offerType === "referee") {
      return "recherche arbitre arbitrage officiel match referee arbitrer";
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
          offer.sport,
          offer.position_needed,
          offer.level_required,
          offer.location,
          offer.remuneration,
          offer.offer_type,
          getOfferTypeLabel(offerType),
          offer.category,
          getCategoryLabel(offer.category),
          searchableRoleTerms(offerType),
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

  const hasFilters = Boolean(q || city || level || sort !== "match" || type !== "all");

  return (
    <main className="space-y-7">
      <section className="premium-card rounded-[28px] p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Recherche</p>
            <h1 className="font-display mt-2 text-[2.2rem] leading-tight text-[color:var(--text-main)]">Opportunités</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[color:var(--text-muted)]">
              Recherche une annonce par club, sport, besoin, ville, niveau ou catégorie. La meilleure compatibilité remonte automatiquement en premier.
            </p>
          </div>
          <span className="rounded-full border border-[color:var(--line)] bg-[color:var(--surface-soft)] px-4 py-2 text-sm font-medium text-[color:var(--text-soft)]">
            {offers.length} offre{offers.length > 1 ? "s" : ""}
          </span>
        </div>

        <form className="ui-filter-grid gap-4">
          <input
            type="text"
            name="q"
            defaultValue={params.q || ""}
            placeholder="Club, sport, arbitre, coach, poste..."
            className="ui-input w-full border px-5 py-3 text-sm leading-6 md:col-span-2"
          />
          <select name="type" defaultValue={type} className="ui-select w-full border px-5 py-3 text-sm leading-6">
            <option value="all">Tous les besoins</option>
            <option value="player">Joueur</option>
            <option value="referee">Arbitre</option>
            <option value="staff">Coach / staff</option>
          </select>
          <input type="text" name="city" defaultValue={params.city || ""} placeholder="Ville" className="ui-input w-full border px-5 py-3 text-sm leading-6" />
          <input type="text" name="level" defaultValue={params.level || ""} placeholder="Niveau" className="ui-input w-full border px-5 py-3 text-sm leading-6" />
          <div className="flex flex-wrap gap-3">
            <select name="sort" defaultValue={sort} className="ui-select min-w-[190px] flex-1 border px-5 py-3 text-sm leading-6">
              <option value="match">Compatibilité</option>
              <option value="recent">Plus récents</option>
              <option value="alpha">A-Z</option>
            </select>
            <button type="submit" className="btn-primary rounded-2xl px-5 py-3 text-sm font-semibold">Filtrer</button>
          </div>
        </form>

        {hasFilters && (
          <Link href="/app/joueur/opportunites" className="mt-4 inline-flex text-sm font-medium text-[color:var(--primary)]">
            Réinitialiser les filtres
          </Link>
        )}
      </section>

      <section>
        <div className="grid gap-5 2xl:grid-cols-2">
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
              <OpportunityCard key={item.offer.id} offer={item.offer} club={item.club} match={item.match} href={`/app/annonces/${item.offer.id}`} index={index} isSaved={savedOfferIds.has(item.offer.id)} />
            ))
          )}
        </div>
      </section>
    </main>
  );
}
