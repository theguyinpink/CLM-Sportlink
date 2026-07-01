type PageLoadingProps = {
  eyebrow?: string;
  title?: string;
  columns?: 1 | 2;
};

export default function PageLoading({
  eyebrow = "Chargement",
  title = "Chargement du contenu",
  columns = 2,
}: PageLoadingProps) {
  return (
    <main className="space-y-12">
      <section className="max-w-5xl animate-fade-in">
        <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">
          {eyebrow}
        </p>

        <h1 className="font-display mt-5 text-[3.2rem] uppercase leading-[0.9] text-white sm:text-[4.6rem]">
          {title}
        </h1>

        <div className="mt-7 h-5 w-full max-w-2xl rounded-full bg-white/[0.06]" />
        <div className="mt-3 h-5 w-full max-w-xl rounded-full bg-white/[0.04]" />
      </section>

      <section className="rounded-[28px] border border-white/8 bg-white/[0.02] p-5 animate-fade-in">
        <div className="grid gap-4 lg:grid-cols-4">
          <div className="h-12 rounded-full bg-white/[0.05]" />
          <div className="h-12 rounded-full bg-white/[0.05]" />
          <div className="h-12 rounded-full bg-white/[0.05]" />
          <div className="h-12 rounded-full bg-white/[0.05]" />
        </div>
      </section>

      <section
        className={[
          "grid gap-10 border-t border-white/5 pt-8",
          columns === 2 ? "lg:grid-cols-2" : "",
        ].join(" ")}
      >
        {Array.from({ length: columns === 2 ? 4 : 3 }).map((_, index) => (
          <article
            key={index}
            className="animate-fade-in border-b border-white/5 pb-8"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="h-3 w-28 rounded-full bg-white/[0.05]" />
            <div className="mt-5 h-10 w-3/4 rounded-full bg-white/[0.07]" />
            <div className="mt-4 h-4 w-1/2 rounded-full bg-white/[0.05]" />
            <div className="mt-6 h-4 w-full rounded-full bg-white/[0.04]" />
            <div className="mt-3 h-4 w-5/6 rounded-full bg-white/[0.04]" />
            <div className="mt-3 h-4 w-2/3 rounded-full bg-white/[0.04]" />
            <div className="mt-6 h-4 w-28 rounded-full bg-white/[0.06]" />
          </article>
        ))}
      </section>
    </main>
  );
}