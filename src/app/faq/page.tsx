import PublicFooter from "@/components/public-footer";
import PublicHero from "@/components/public-hero";

const faqs = [
  {
    question: "CLM SportLink est payant ?",
    answer: "Non, la V1 est pensée pour être gratuite au lancement. Les joueurs restent gratuits, et les clubs pourront tester l’outil gratuitement avant l’arrivée d’options Pro.",
  },
  {
    question: "Qui peut créer un profil joueur ?",
    answer: "Tout sportif qui veut présenter son profil, son niveau, sa ville, son poste et ses médias. Le projet est multi-sports, même si les premiers tests peuvent commencer par quelques sports ciblés.",
  },
  {
    question: "Un club peut-il contacter directement un joueur ?",
    answer: "Un club peut envoyer une demande. Le contact complet ne se débloque qu’après acceptation, afin d’éviter les contacts forcés ou les échanges non souhaités.",
  },
  {
    question: "Comment fonctionne la compatibilité ?",
    answer: "La compatibilité prend en compte plusieurs éléments comme le sport, le poste, le niveau, la localisation et certains mots-clés présents dans les descriptions.",
  },
  {
    question: "Est-ce que les vidéos YouTube sont lisibles dans le site ?",
    answer: "Oui, les liens YouTube peuvent être intégrés directement dans le fil d’actualité. Les publications peuvent aussi contenir des images ou des vidéos uploadées.",
  },
  {
    question: "Est-ce une version finale ?",
    answer: "Non. C’est une version MVP : elle sert à tester le concept, repérer les bugs, améliorer l’expérience et préparer une version montrable à de vrais joueurs et clubs.",
  },
];

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PublicHero
        eyebrow="FAQ"
        title="Les réponses"
        gradientTitle="avant de tester"
        description="Cette page regroupe les questions les plus importantes pour comprendre CLM SportLink avant de créer un compte joueur ou club."
        primaryHref="/inscription/role"
        primaryLabel="Créer un profil"
        secondaryHref="/contact"
        secondaryLabel="Contacter CLM SportLink"
      />

      <section className="grid gap-5 py-12 lg:grid-cols-2">
        {faqs.map((item, index) => (
          <article key={item.question} className="premium-card rounded-[30px] p-6 sm:p-7 animate-fade-up" style={{ animationDelay: `${index * 55}ms` }}>
            <p className="font-display text-[2.3rem] leading-[0.94] text-white">{item.question}</p>
            <p className="mt-5 text-sm leading-8 text-white/66">{item.answer}</p>
          </article>
        ))}
      </section>

      <PublicFooter />
    </main>
  );
}
