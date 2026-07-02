import type { Metadata } from "next";
import { DM_Sans, Bebas_Neue } from "next/font/google";
import "./globals.css";
import SiteNavbar from "@/components/site-navbar";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "CLM SportLink",
  description: "Plateforme multi-sports de mise en relation entre joueurs et clubs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${dmSans.variable} ${bebasNeue.variable} min-h-screen bg-[#07080f] text-white antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var key='clm-sportlink-theme';var preference=localStorage.getItem(key)||'dark';var resolved=preference==='system'?(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):preference;document.documentElement.classList.remove('light','dark');document.documentElement.classList.add(resolved);document.documentElement.dataset.theme=resolved;document.documentElement.dataset.themePreference=preference;}catch(e){document.documentElement.classList.add('dark');}})();`,
          }}
        />
        <div className="site-noise pointer-events-none fixed inset-0 z-0 opacity-[0.048]" />
        <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_20%_0%,rgba(79,140,255,0.14),transparent_34%),radial-gradient(circle_at_84%_8%,rgba(155,92,255,0.13),transparent_30%),linear-gradient(180deg,transparent,rgba(5,6,18,0.78))]" />
        <div className="relative z-10 flex min-h-screen flex-col text-white">
          <SiteNavbar />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
