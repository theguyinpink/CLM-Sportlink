import PublicFooter from "@/components/public-footer";
import PublicHero from "@/components/public-hero";

const sections = [
  {
    title: "Éditeur du site",
    content:
      "CLM SportLink est un projet édité par Clément Carré. Email de contact : clement.carre.prevert.pro@gmail.com. Les informations administratives complètes seront à finaliser avant le lancement public officiel.",
  },
  {
    title: "Nature du service",
    content:
      "CLM SportLink est une plateforme de mise en relation entre joueurs, sportifs, clubs et structures sportives. Le site permet de créer un profil, publier des annonces, publier des actualités et envoyer des demandes de contact.",
  },
  {
    title: "Hébergement",
    content:
      "Le site est prévu pour être hébergé sur Vercel, avec Supabase pour l’authentification, la base de données et le stockage des médias. Les informations définitives d’hébergement devront être précisées au moment du déploiement final.",
  },
  {
    title: "Responsabilité",
    content:
      "CLM SportLink ne garantit pas la conclusion d’un recrutement, d’un essai ou d’un engagement sportif. Les échanges entre joueurs et clubs restent sous leur responsabilité respective.",
  },
  {
    title: "Propriété intellectuelle",
    content:
      "Le nom, l’interface, les textes, l’identité visuelle et les éléments du site CLM SportLink sont protégés. Toute reproduction non autorisée est interdite.",
  },
];

export default function LegalNoticePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PublicHero
        eyebrow="Légal"
        title="Mentions"
        gradientTitle="légales"
        description="Cette page pose la base légale du projet. Elle devra être relue et complétée avant le lancement public officiel de CLM SportLink."
      />

      <section className="grid gap-5 py-12 lg:grid-cols-2">
        {sections.map((section) => (
          <article key={section.title} className="premium-card rounded-[30px] p-6 sm:p-7">
            <h2 className="font-display text-[2.5rem] leading-none text-white">{section.title}</h2>
            <p className="mt-5 text-sm leading-8 text-white/66">{section.content}</p>
          </article>
        ))}
      </section>

      <PublicFooter />
    </main>
  );
}
