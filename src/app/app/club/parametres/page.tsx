import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/settings-actions";
import ClubSettingsForm from "@/components/club-settings-form";
import FileInput from "@/components/file-input";
import { removeClubLogo, uploadClubLogo } from "@/app/media-actions";
import ClubLogo from "@/components/club-logo";
export default async function ClubParametresPage({
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
  const { data: club } = await supabase
    .from("clubs")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!club) redirect("/app/club/profil/edit");
  return (
    <main className="space-y-14">
      {" "}
      <section className="max-w-5xl">
        {" "}
        <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">
          {" "}
          Paramètres{" "}
        </p>{" "}
        <h1 className="font-display mt-5 text-[3.2rem] uppercase leading-[0.9] text-white sm:text-[4.6rem] lg:text-[5.8rem]">
          {" "}
          Paramètres <br /> du club{" "}
        </h1>{" "}
        <p className="mt-7 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
          {" "}
          Gère le logo, les coordonnées de contact et les informations
          essentielles du club.{" "}
        </p>{" "}
      </section>{" "}
      {message && (
        <div className="rounded-full border border-[#4f8cff]/25 bg-[#4f8cff]/10 px-5 py-3 text-sm text-[#4f8cff]">
          {" "}
          {message}{" "}
        </div>
      )}{" "}
      {error && (
        <div className="rounded-full border border-red-500/25 bg-red-500/10 px-5 py-3 text-sm text-red-300">
          {" "}
          {error}{" "}
        </div>
      )}{" "}
      <section className="grid gap-16 lg:grid-cols-[1fr_0.95fr]">
        {" "}
        <div className="space-y-10">
          {" "}
          <ClubSettingsForm club={club} />
          <div className="rounded-[28px] border border-white/8 bg-white/2 p-6">
            {" "}
            <div className="flex flex-wrap items-center gap-5">
              {" "}
              <ClubLogo
                logoPath={club.logo_path}
                clubName={club.club_name}
                size="lg"
              />{" "}
              <div className="min-w-0">
                {" "}
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
                  {" "}
                  Logo{" "}
                </p>{" "}
                <h2 className="font-display mt-3 text-[2rem] uppercase leading-[0.92] text-white">
                  {" "}
                  {club.club_name || "Club"}{" "}
                </h2>{" "}
              </div>{" "}
            </div>{" "}
            <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
              {" "}
              <form action={uploadClubLogo} encType="multipart/form-data" className="grid gap-3">
                {" "}
                <input
                  type="hidden"
                  name="redirect_to"
                  value="/app/club/parametres"
                />{" "}
                <FileInput
                  name="logo"
                  accept="image/*"
                  label="Choisir un logo"
                  helper="PNG, JPG ou WebP recommandé"
                />{" "}
                <button
                  type="submit"
                  className="rounded-full border border-white/10 px-5 py-3 text-sm text-white transition hover:bg-white/4"
                >
                  {" "}
                  Mettre à jour le logo{" "}
                </button>{" "}
              </form>{" "}
              {club.logo_path && (
                <form action={removeClubLogo}>
                  {" "}
                  <input
                    type="hidden"
                    name="redirect_to"
                    value="/app/club/parametres"
                  />{" "}
                  <button
                    type="submit"
                    className="rounded-full border border-red-500/20 px-5 py-3 text-sm text-red-300 transition hover:bg-red-500/10"
                  >
                    {" "}
                    Supprimer{" "}
                  </button>{" "}
                </form>
              )}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="space-y-8">
          {" "}
          <div className="rounded-[28px] border border-white/8 bg-white/2 p-6">
            {" "}
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
              {" "}
              Compte{" "}
            </p>{" "}
            <div className="mt-6 space-y-4 text-sm text-white/68">
              {" "}
              <p>
                {" "}
                <span className="text-white">Email du compte :</span>{" "}
                {user.email || "Non renseigné"}{" "}
              </p>{" "}
              <p>
                {" "}
                <span className="text-white">Nom du club :</span>{" "}
                {club.club_name || "Non renseigné"}{" "}
              </p>{" "}
              <p>
                {" "}
                <span className="text-white">Sport :</span>{" "}
                {club.sport || "Non renseigné"}{" "}
              </p>{" "}
              <p>
                {" "}
                <span className="text-white">Niveau :</span>{" "}
                {club.level || "Non renseigné"}{" "}
              </p>{" "}
              <p>
                {" "}
                <span className="text-white">Plan :</span>{" "}
                {club.subscription_tier || "free"}{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
          <div className="rounded-[28px] border border-red-500/15 bg-red-500/5 p-6">
            {" "}
            <p className="text-[11px] uppercase tracking-[0.22em] text-red-300/75">
              {" "}
              Session{" "}
            </p>{" "}
            <p className="mt-4 text-sm leading-8 text-white/68">
              {" "}
              Tu peux te déconnecter ici proprement.{" "}
            </p>{" "}
            <form action={signOutAction} className="mt-6">
              {" "}
              <button
                type="submit"
                className="rounded-full border border-white/10 px-5 py-3 text-sm text-white transition hover:bg-white/4"
              >
                {" "}
                Se déconnecter{" "}
              </button>{" "}
            </form>{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
    </main>
  );
}
