import Link from "next/link";
import LoginForm from "@/components/login-form";

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;
  const message = params.message;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[32px] border border-white/5 bg-[#111527] p-8 sm:p-10 lg:p-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#7E8796]">
            Connexion
          </p>
          <h1 className="font-heading text-4xl font-semibold text-[#f4f7fb] sm:text-5xl">
            Retrouve ton espace CLM SportLink
          </h1>
          <p className="mt-5 max-w-xl text-[#B3BAC7]">
            Connecte-toi pour accéder à ton profil, tes annonces, tes notifications
            et tes demandes de mise en relation.
          </p>

          <div className="mt-10 space-y-4">
            <div className="rounded-2xl border border-white/5 bg-[#0d1020] p-5">
              <h2 className="font-heading text-xl font-semibold text-[#f4f7fb]">
                Pour les joueurs
              </h2>
              <p className="mt-2 text-sm text-[#B3BAC7]">
                Visualise les clubs, les opportunités et les demandes reçues.
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#0d1020] p-5">
              <h2 className="font-heading text-xl font-semibold text-[#f4f7fb]">
                Pour les clubs
              </h2>
              <p className="mt-2 text-sm text-[#B3BAC7]">
                Gère ta fiche, tes annonces et découvre des profils compatibles.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/5 bg-[#111527] p-8 sm:p-10">
          <h2 className="font-heading text-3xl font-semibold text-[#f4f7fb]">
            Se connecter
          </h2>
          <p className="mt-3 text-[#B3BAC7]">
            Entre tes identifiants pour accéder à ton espace.
          </p>

          <LoginForm defaultMessage={message} defaultError={error} />

          <div className="mt-8 flex flex-col gap-3 text-sm">
            <Link href="/inscription/role" className="font-medium text-[#D8B988]">
              Créer un compte
            </Link>
            <Link href="/mot-de-passe-oublie" className="text-[#B3BAC7]">
              Mot de passe oublié
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
