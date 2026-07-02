import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/settings-actions";
import PlayerSettingsForm from "@/components/player-settings-form";
import {
  uploadPlayerAvatar,
  deletePlayerAvatar,
} from "@/app/media-actions";
import PlayerAvatar from "@/components/player-avatar";
import FileInput from "@/components/file-input";

export default async function JoueurParametresPage({
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

  return (
    <main className="space-y-14">
      <section className="max-w-5xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">
          Paramètres
        </p>

        <h1 className="font-display mt-5 text-[3.2rem] uppercase leading-[0.9] text-white sm:text-[4.6rem] lg:text-[5.8rem]">
          Paramètres
          <br />
          joueur
        </h1>

        <p className="mt-7 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
          Règle la visibilité de ton profil, ton ouverture aux opportunités et
          les informations de contact visibles après acceptation.
        </p>
      </section>

      {message && (
        <div className="rounded-full border border-[#4f8cff]/25 bg-[#4f8cff]/10 px-5 py-3 text-sm text-[#4f8cff]">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-full border border-red-500/25 bg-red-500/10 px-5 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <section className="grid gap-16 lg:grid-cols-[1fr_0.85fr]">
        <div className="space-y-10">
          <div className="rounded-[28px] border border-white/8 bg-white/2 p-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
              Avatar
            </p>

            <div className="mt-6 flex items-start gap-5">
              <PlayerAvatar
                avatarPath={profile.avatar_path}
                displayName={profile.display_name}
                size="lg"
              />

              <div className="min-w-0 flex-1 space-y-4">
                <form action={uploadPlayerAvatar} encType="multipart/form-data" className="grid gap-3">
                  <input type="hidden" name="user_id" value={user.id} />
                  <FileInput
                    name="avatar"
                    accept="image/*"
                    required
                    label="Choisir un avatar"
                    helper="PNG, JPG ou WebP recommandé"
                  />
                  <button
                    type="submit"
                    className="w-fit rounded-full bg-[#4f8cff] px-5 py-3 text-sm font-medium text-[#07080f] transition hover:bg-[#00d4ff]"
                  >
                    Mettre à jour l’avatar
                  </button>
                </form>

                {profile.avatar_path && (
                  <form action={deletePlayerAvatar}>
                    <button
                      type="submit"
                      className="rounded-full border border-white/10 px-5 py-3 text-sm text-white transition hover:bg-white/4"
                    >
                      Supprimer l’avatar
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>


          <PlayerSettingsForm profile={profile} />
        </div>

        <div className="space-y-8">
          <div className="rounded-[28px] border border-white/8 bg-white/2 p-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
              Compte
            </p>

            <div className="mt-6 space-y-4 text-sm text-white/68">
              <p>
                <span className="text-white">Email du compte :</span>{" "}
                {user.email || "Non renseigné"}
              </p>
              <p>
                <span className="text-white">Nom affiché :</span>{" "}
                {profile.display_name || "Non renseigné"}
              </p>
              <p>
                <span className="text-white">Sport :</span>{" "}
                {profile.sport || "Non renseigné"}
              </p>
              <p>
                <span className="text-white">Plan actuel :</span>{" "}
                Gratuit
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-red-500/15 bg-red-500/5 p-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-red-300/75">
              Session
            </p>
            <p className="mt-4 text-sm leading-8 text-white/68">
              Tu peux te déconnecter ici proprement.
            </p>

            <form action={signOutAction} className="mt-6">
              <button
                type="submit"
                className="rounded-full border border-white/10 px-5 py-3 text-sm text-white transition hover:bg-white/4"
              >
                Se déconnecter
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
