import Link from "next/link";
import PublicFooter from "@/components/public-footer";
import PublicHero from "@/components/public-hero";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PublicHero
        eyebrow="Contact"
        title="Une question"
        gradientTitle="ou un retour ?"
        description="CLM SportLink est encore en phase de construction. Les retours de joueurs, clubs et passionnés sont précieux pour améliorer l’outil avant le lancement public."
        primaryHref="mailto:clement.carre.prevert.pro@gmail.com?subject=Contact%20CLM%20SportLink"
        primaryLabel="Envoyer un email"
        secondaryHref="/faq"
        secondaryLabel="Lire la FAQ"
      />

      <section className="grid gap-6 py-12 lg:grid-cols-[0.8fr_1.2fr]">
        <article className="premium-card rounded-[34px] p-7 sm:p-9">
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/38">Email</p>
          <h2 className="font-display mt-4 break-words text-[2.6rem] leading-[0.95] text-white sm:text-[3.8rem]">
            clement.carre.prevert.pro@gmail.com
          </h2>
          <p className="mt-6 text-sm leading-8 text-white/66">
            Pour signaler un bug, proposer une amélioration, tester la plateforme ou présenter un club intéressé.
          </p>
          <Link href="mailto:clement.carre.prevert.pro@gmail.com?subject=Contact%20CLM%20SportLink" className="btn-primary mt-8 px-6 py-3 text-sm">
            Ouvrir ma messagerie
          </Link>
        </article>

        <article className="premium-card rounded-[34px] p-7 sm:p-9">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#8bb7ff]">Message conseillé</p>
          <div className="mt-6 rounded-[28px] border border-white/8 bg-white/[0.025] p-5 text-sm leading-8 text-white/70">
            Bonjour, je souhaite avoir des informations sur CLM SportLink. Je suis joueur / club / autre, et j’aimerais tester la plateforme ou faire un retour sur le projet.
          </div>
          <p className="mt-6 text-sm leading-8 text-white/58">
            Plus le message est précis, plus il sera simple de répondre : rôle, sport, ville, club éventuel, problème rencontré ou idée d’amélioration.
          </p>
        </article>
      </section>

      <PublicFooter />
    </main>
  );
}
