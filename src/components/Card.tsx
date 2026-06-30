import type { ReactNode } from "react";

type CardProps = {
  title: string;
  icon?: string;
  children: ReactNode;
};

export default function Card({ title, icon, children }: CardProps) {
  return (
    <section className="rounded-2xl border border-sand bg-white p-5 shadow-sm">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
        {icon && <span aria-hidden>{icon}</span>}
        {title}
      </h2>
      {children}
    </section>
  );
}
