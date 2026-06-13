import type { Metadata } from "next";
import Link from "next/link";
import { Rocket, Search, UserRound } from "lucide-react";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "SuiCluck.fun",
  description: "The ultimate chicken-powered meme launchpad on Sui.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>
          <header className="sticky top-0 z-50 border-b border-white/10 bg-background/75 backdrop-blur">
            <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
              <Link href="/" className="flex items-center gap-2 font-display text-xl font-black">
                <span className="grid h-10 w-10 place-items-center rounded-md bg-secondary text-2xl">🐔</span>
                SuiCluck
              </Link>
              <div className="hidden items-center gap-2 md:flex">
                <Link className="rounded-md px-3 py-2 text-sm hover:bg-white/10" href="/launch">
                  Launch
                </Link>
                <Link className="rounded-md px-3 py-2 text-sm hover:bg-white/10" href="/discover">
                  Discover
                </Link>
                <Link className="rounded-md px-3 py-2 text-sm hover:bg-white/10" href="/profile">
                  Profile
                </Link>
              </div>
            </nav>
          </header>
          {children}
          <footer className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground">
            Built for brave chickens on Sui. Hackathon demo mode.
          </footer>
          <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-3 border-t border-white/10 bg-background/90 p-2 backdrop-blur md:hidden">
            <Link href="/launch" className="grid place-items-center gap-1 text-xs">
              <Rocket size={18} />
              Launch
            </Link>
            <Link href="/discover" className="grid place-items-center gap-1 text-xs">
              <Search size={18} />
              Discover
            </Link>
            <Link href="/profile" className="grid place-items-center gap-1 text-xs">
              <UserRound size={18} />
              Profile
            </Link>
          </div>
        </Providers>
      </body>
    </html>
  );
}
