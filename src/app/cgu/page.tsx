import PublicFooter from "@/components/public-footer";
import PublicHero from "@/components/public-hero";

const sections = [
  {
    title: "Objet",
    content:
      "Les présentes conditions encadrent l’utilisation de CLM SportLink, plateforme de mise en relation entre joueurs, sportifs, clubs et structures sportives.",
  },
  {
    title: "Compte utilisateur",
    content:
      "L’utilisateur doit fournir des informations sincères et garder l’accès à son compte sécurisé. Il reste responsable des actions effectuées depuis son compte.",
  },
  {
    title: "Publications et médias",
    content:
      "L’utilisateur s’engage à publier uniquement des contenus respectueux, utiles au projet sportif, et pour lesquels il possède les droits nécessaires.",
  },
  {
    title: "Demandes de contact",
    content:
      "L’envoi d’une demande ne garantit pas une réponse positive. Le contact complet est débloqué uniquement lorsque la demande est acceptée.",
  },
  {
    title: "Comportements interdits",
    content:
      "Sont interdits les faux profils, les propos discriminatoires, les contenus offensants, les spams, les sollicitations abusives et toute utilisation contraire à l’objectif sportif de la plateforme.",
  },
  {
    title: "Évolution du service",
    content:
      "CLM SportLink est en phase MVP. Des fonctionnalités peuvent évoluer, être modifiées ou supprimées afin d’améliorer la qualité du service.",
  },
];

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PublicHero
        eyebrow="Conditions"
        title="Conditions"
        gradientTitle="d’utilisation"
        description="Ces conditions posent les règles de base pour utiliser CLM SportLink proprement pendant la phase MVP et avant le lancement public officiel."
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
