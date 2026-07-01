import type { Metadata } from "next";
import Script from "next/script";
import { DM_Sans, Bebas_Neue } from "next/font/google";
import "./globals.css";
import SiteNavbar from "@/components/site-navbar";
import ScrollToTopButton from "@/components/scroll-to-top-button";

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
  description: "Plateforme multi-sports de mise en relation entre joueurs, clubs, arbitres et staff.",
};

function ThemeScript() {
  const code = `
    try {
      var stored = localStorage.getItem('clm-theme');
      var theme = stored || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
      document.documentElement.dataset.theme = theme;
    } catch (e) {}
  `;

  return <Script id="clm-theme-script" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: code }} />;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        suppressHydrationWarning
        className={`${dmSans.variable} ${bebasNeue.variable} min-h-screen antialiased`}
      >
        <div className="relative z-10 flex min-h-screen flex-col">
          <SiteNavbar />
          <main className="flex-1">{children}</main>
          <ScrollToTopButton />
        </div>
      </body>
    </html>
  );
}
