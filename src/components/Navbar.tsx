"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Tableau de bord" },
  { href: "/planning", label: "Planning" },
  { href: "/reserver", label: "Réserver" },
  { href: "/maison", label: "La maison" },
  { href: "/post-its", label: "Post-its" },
  { href: "/naissances", label: "Naissances" },
];

export default function Navbar({ user }: { user: string | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    setOpen(false);
    router.push("/login");
    router.refresh();
  }

  function linkClass(href: string) {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return `whitespace-nowrap rounded-full px-3 py-2 transition-colors ${
      active ? "bg-olive text-white" : "text-muted hover:bg-sand/60 hover:text-ink"
    }`;
  }

  if (!user) {
    return (
      <header className="border-b border-sand bg-cream/80 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/login" className="text-lg font-semibold tracking-tight text-olive-dark">
            La Maison
          </Link>
          <Link href="/login" className="rounded-full px-3 py-2 text-sm text-muted hover:text-ink">
            Se connecter
          </Link>
        </nav>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-10 border-b border-sand bg-cream/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-olive-dark" onClick={() => setOpen(false)}>
          La Maison
        </Link>

        <ul className="hidden items-center gap-1 text-sm lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={linkClass(link.href)}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/mon-compte" className="text-sm text-muted hover:text-ink">{user.split(" ")[0]}</Link>
          <button onClick={logout} className="rounded-full border border-sand px-3 py-1.5 text-sm text-ink hover:bg-sand/60">
            Déconnexion
          </button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={open}
          className="rounded-lg p-2 text-olive-dark hover:bg-sand/60 lg:hidden"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="6" y1="18" x2="18" y2="6" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-sand px-4 py-3 lg:hidden">
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={() => setOpen(false)} className={`block ${linkClass(link.href)}`}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-sand pt-3">
            <Link href="/mon-compte" onClick={() => setOpen(false)} className="text-sm text-muted hover:text-ink">{user}</Link>
            <button onClick={logout} className="rounded-full border border-sand px-3 py-1.5 text-sm text-ink hover:bg-sand/60">
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
