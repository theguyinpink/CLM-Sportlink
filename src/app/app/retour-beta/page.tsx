import BetaFeedbackPageForm from "@/components/beta-feedback-page-form";

export default function RetourBetaPage() {
  return (
    <main className="space-y-7">
      <section className="premium-card rounded-[28px] p-5 sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Bêta privée</p>
        <h1 className="font-display mt-2 text-[2.35rem] leading-tight text-[color:var(--text-main)]">Retour bêta</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--text-muted)]">
          Signale un bug, une gêne de design, une incompréhension ou une idée d’amélioration. Ton retour arrive directement dans l’admin.
        </p>
      </section>

      <BetaFeedbackPageForm />
    </main>
  );
}
