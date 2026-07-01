import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EmptyState from "@/components/empty-state";
import ClubLogo from "@/components/club-logo";
import FavoriteButton from "@/components/favorite-button";
import { getCategoryLabel, getOfferType, getOfferTypeLabel } from "@/lib/matching";

function unique(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter(Boolean) as string[]));
}

export default async function PlayerFavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: saved } = await supabase
    .from("saved_items")
    .select("id, target_type, target_id, created_at")
    .eq("user_id", user.id)
    .in("target_type", ["club_offer", "club"])
    .order("created_at", { ascending: false });

  const offerIds = unique((saved || []).filter((item: any) => item.target_type === "club_offer").map((item: any) => item.target_id));
  const clubIds = unique((saved || []).filter((item: any) => item.target_type === "club").map((item: any) => item.target_id));

  const [offersResult, clubsResult] = await Promise.all([
    offerIds.length
      ? supabase
          .from("club_offers")
          .select("*, clubs(id, club_name, sport, level, city, region, logo_path)")
          .in("id", offerIds)
      : Promise.resolve({ data: [] }),
    clubIds.length
      ? supabase
          .from("clubs")
          .select("id, club_name, sport, level, city, region, logo_path, description")
          .in("id", clubIds)
      : Promise.resolve({ data: [] }),
  ]);

  const offersById = new Map((offersResult.data || []).map((offer: any) => [offer.id, offer]));
  const clubsById = new Map((clubsResult.data || []).map((club: any) => [club.id, club]));

  const items = (saved || [])
    .map((item: any) => {
      if (item.target_type === "club_offer") return { ...item, data: offersById.get(item.target_id) };
      if (item.target_type === "club") return { ...item, data: clubsById.get(item.target_id) };
      return null;
    })
    .filter((item: any) => item?.data);

  return (
    <main className="space-y-7">
      <section className="premium-card rounded-[28px] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Favoris</p>
        <h1 className="font-display mt-2 text-[2.4rem] leading-tight text-[color:var(--text-main)]">Mes éléments sauvegardés</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--text-muted)]">
          Garde sous la main les annonces et clubs que tu veux revoir avant d’envoyer une demande.
        </p>
      </section>

      {items.length === 0 ? (
        <EmptyState eyebrow="Aucun favori" title="Rien de sauvegardé" description="Sauvegarde une annonce ou un club pour le retrouver ici plus tard." ctaHref="/app/joueur/opportunites" ctaLabel="Voir les opportunités" />
      ) : (
        <section className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {items.map((item: any, index: number) => {
            const isOffer = item.target_type === "club_offer";
            const data = item.data;
            const club = isOffer ? (Array.isArray(data.clubs) ? data.clubs[0] : data.clubs) : data;
            const offerType = isOffer ? getOfferType(data.offer_type, data.category) : null;
            const href = isOffer ? `/app/joueur/clubs/${club?.id}` : `/app/joueur/clubs/${data.id}`;

            return (
              <article key={item.id} className="premium-card animate-fade-up rounded-[26px] p-5" style={{ animationDelay: `${index * 45}ms` }}>
                <div className="flex items-start gap-4">
                  <ClubLogo logoPath={club?.logo_path || data.logo_path} clubName={club?.club_name || data.club_name || "Club"} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2">
                      <span className="ui-pill rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]">
                        {isOffer ? getOfferTypeLabel(offerType as any) : "Club"}
                      </span>
                      {isOffer && <span className="ui-pill rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]">{getCategoryLabel(data.category)}</span>}
                    </div>
                    <h2 className="mt-4 text-xl font-semibold text-[color:var(--text-main)]">{isOffer ? data.title : data.club_name}</h2>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">
                      {isOffer
                        ? [data.sport || club?.sport, data.position_needed, data.level_required, data.location || club?.city].filter(Boolean).join(" • ")
                        : [data.sport, data.level, data.city || data.region].filter(Boolean).join(" • ")}
                    </p>
                    <p className="mt-4 line-clamp-3 text-sm leading-7 text-[color:var(--text-soft)]">{isOffer ? data.description : data.description || "Aucune description."}</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href={href} className="btn-secondary rounded-full px-4 py-2.5 text-sm font-medium">Voir</Link>
                  <FavoriteButton targetType={item.target_type} targetId={item.target_id} initialSaved compact />
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
