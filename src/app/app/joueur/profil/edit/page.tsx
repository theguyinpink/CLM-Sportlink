import { createClient } from "@/lib/supabase/server";
import PlayerProfileForm from "@/components/player-profile-form";

export default async function EditPlayerProfilePage({
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

  const defaultProfileRole =
    user.user_metadata?.profile_role === "referee" || user.user_metadata?.profile_role === "staff"
      ? user.user_metadata.profile_role
      : "player";

  const { data: profile } = await supabase
    .from("player_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <main className="space-y-12">
      <section className="max-w-4xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">
          Modifier le profil
        </p>
        <h1 className="font-display mt-5 text-[3.1rem] uppercase leading-[0.9] text-white sm:text-[4.4rem]">
          Update your
          <br />
          presence
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55">
          Les champs utilisent maintenant des suggestions standardisées pour éviter les fautes de saisie qui faussent le score de compatibilité.
        </p>
      </section>

      <PlayerProfileForm
        profile={profile}
        defaultError={errorMessage}
        defaultProfileRole={defaultProfileRole}
      />
    </main>
  );
}
