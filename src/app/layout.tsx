import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Banana } from "lucide-react";

export const metadata: Metadata = {
  title: "Nano Banana Webtoon",
  description: "AI-powered webtoon generation platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
              <Banana className="w-6 h-6" />
              <span>Nano Banana</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium">
              <Link href="/characters" className="hover:text-primary transition-colors">
                Characters
              </Link>
              <Link href="/studio" className="hover:text-primary transition-colors">
                Studio
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-white/10 py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Nano Banana. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
