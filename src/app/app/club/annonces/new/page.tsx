import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ClubOfferForm from "@/components/club-offer-form";

export default async function NewClubOfferPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMessage = params.error;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: club } = await supabase
    .from("clubs")
    .select("id, club_name, sport, city, region, level")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!club) redirect("/app/club/profil/edit");

  return (
    <main className="space-y-12">
      <section className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">Nouvelle annonce</p>
          <h1 className="font-display mt-5 text-[3.1rem] uppercase leading-[0.9] text-white sm:text-[4.4rem]">
            Publier un
            <br />
            besoin plus précis
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/68">
            Plus ton annonce est précise, plus CLM SportLink peut calculer une compatibilité utile avec les joueurs.
          </p>
        </div>

        <Link href="/app/club/annonces" className="text-sm text-white/68 transition hover:text-white">
          Retour aux annonces
        </Link>
      </section>

      <ClubOfferForm club={club} defaultError={errorMessage} />
    </main>
  );
}
