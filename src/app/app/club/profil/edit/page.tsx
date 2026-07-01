import { createClient } from "@/lib/supabase/server";
import ClubProfileForm from "@/components/club-profile-form";

export default async function EditClubProfilePage({
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

  if (!user) return null;

  const { data: club } = await supabase
    .from("clubs")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <main className="space-y-12">
      <section className="max-w-4xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">
          Edit club
        </p>
        <h1 className="font-display mt-5 text-[3.1rem] uppercase leading-[0.9] text-white sm:text-[4.4rem]">
          Update your
          <br />
          profil club
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55">
          Garde le sport, le niveau et la région cohérents avec tes annonces pour améliorer la compatibilité avec les joueurs.
        </p>
      </section>

      <ClubProfileForm club={club} defaultError={errorMessage} />
    </main>
  );
}
