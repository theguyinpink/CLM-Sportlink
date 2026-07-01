import Link from "next/link";

const links = [
  { href: "/comment-ca-marche", label: "Comment ça marche" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/cgu", label: "CGU" },
];

export default function PublicFooter() {
  return (
    <footer className="mx-auto mt-16 max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
      <div className="rounded-[34px] border border-white/8 bg-white/[0.025] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-display text-[2.1rem] leading-none text-white">CLM SportLink</p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/58">
              Plateforme française de mise en relation entre sportifs et clubs. Version MVP en phase de test.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-white/8 bg-white/[0.025] px-4 py-2 text-xs text-white/58 transition hover:border-[#4f8cff]/30 hover:bg-[#4f8cff]/10 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
