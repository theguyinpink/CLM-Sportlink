import PublicFooter from "@/components/public-footer";
import PublicHero from "@/components/public-hero";

const sections = [
  {
    title: "Données collectées",
    content:
      "CLM SportLink peut collecter les données nécessaires au fonctionnement du service : email, rôle, nom affiché, informations sportives, ville, région, description, médias, annonces, publications et demandes de contact.",
  },
  {
    title: "Utilisation des données",
    content:
      "Les données servent à créer les profils, afficher les fiches, calculer des compatibilités, permettre les demandes de contact et améliorer l’expérience utilisateur.",
  },
  {
    title: "Contacts débloqués",
    content:
      "Les coordonnées de contact ne sont destinées à être visibles qu’après acceptation d’une demande, selon les réglages de visibilité prévus dans le profil ou la fiche club.",
  },
  {
    title: "Médias",
    content:
      "Les images et vidéos publiées peuvent être stockées afin d’être affichées dans les profils ou le fil d’actualité. L’utilisateur doit publier uniquement des contenus qu’il a le droit d’utiliser.",
  },
  {
    title: "Suppression et modification",
    content:
      "L’utilisateur peut modifier certaines informations depuis son espace. Pour toute demande liée aux données personnelles, il peut contacter : clement.carre.prevert.pro@gmail.com.",
  },
  {
    title: "Sécurité",
    content:
      "L’authentification, la base de données et le stockage sont prévus avec Supabase. Des règles d’accès doivent être maintenues pour éviter l’accès non autorisé aux données.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PublicHero
        eyebrow="Données"
        title="Politique de"
        gradientTitle="confidentialité"
        description="Cette politique explique les grandes lignes du traitement des données dans CLM SportLink. Elle doit être validée juridiquement avant un lancement officiel à grande échelle."
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
