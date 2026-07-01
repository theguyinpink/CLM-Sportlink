import Link from "next/link";
import SignupForm from "@/components/signup-form";

export default async function SignupPlayerPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[32px] border border-white/5 bg-[#111527] p-8 sm:p-10 lg:p-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#7E8796]">
            Joueur
          </p>
          <h1 className="font-heading text-4xl font-semibold text-[#f4f7fb] sm:text-5xl">
            Crée ton profil et rends-toi visible
          </h1>
          <p className="mt-5 max-w-xl text-[#B3BAC7]">
            Commence ton parcours sur CLM SportLink pour construire une présence
            crédible et découvrir des clubs.
          </p>
        </div>

        <div className="rounded-[32px] border border-white/5 bg-[#111527] p-8 sm:p-10">
          <h2 className="font-heading text-3xl font-semibold text-[#f4f7fb]">
            Inscription joueur
          </h2>
          <p className="mt-3 text-[#B3BAC7]">
            Crée ton compte pour accéder à la plateforme.
          </p>

          <SignupForm role="player" defaultError={error} />

          <p className="mt-8 text-sm text-[#B3BAC7]">
            Déjà un compte ?{" "}
            <Link href="/connexion" className="font-medium text-[#D8B988]">
              Se connecter
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
