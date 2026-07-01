import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ClubOfferManagerCard from "@/components/club-offer-manager-card";
import EmptyState from "@/components/empty-state";

export default async function ClubOffersPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;
  const message = params.message;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: club } = await supabase
    .from("clubs")
    .select("id, club_name, sport, level, city, region")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!club) redirect("/app/club/profil/edit");

  const { data: offers } = await supabase
    .from("club_offers")
    .select("*")
    .eq("club_id", club.id)
    .order("created_at", { ascending: false });

  return (
    <main className="space-y-12">
      <section className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">
            Annonces du club
          </p>
          <h1 className="font-display mt-5 text-[3.1rem] uppercase leading-[0.9] text-white sm:text-[4.4rem]">
            Annonces
            <br />
            publiées
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/68">
            Les annonces publiées par {club.club_name}. Tu peux les modifier, les désactiver ou les supprimer depuis cette page.
          </p>
        </div>

        <Link
          href="/app/club/annonces/new"
          className="rounded-full bg-gradient-to-r from-[#4f8cff] to-[#00d4ff] px-5 py-3 text-sm font-bold text-[#050612] shadow-[0_14px_45px_rgba(79,140,255,0.22)] transition hover:-translate-y-0.5"
        >
          Nouvelle annonce
        </Link>
      </section>

      {message && (
        <div className="rounded-full border border-[#4f8cff]/25 bg-[#4f8cff]/10 px-5 py-3 text-sm text-[#8bb7ff]">
          {message}
        </div>
      )}

      <section className="grid gap-6 border-t border-white/5 pt-8 lg:grid-cols-2">
        {!offers || offers.length === 0 ? (
          <EmptyState
            eyebrow="Aucune annonce"
            title="Première annonce"
            description="Crée une annonce claire pour faire apparaître ton club dans les opportunités compatibles des joueurs."
            ctaHref="/app/club/annonces/new"
            ctaLabel="Créer une annonce"
          />
        ) : (
          offers.map((offer, index) => (
            <ClubOfferManagerCard key={offer.id} offer={offer} club={club} index={index} />
          ))
        )}
      </section>
    </main>
  );
}
