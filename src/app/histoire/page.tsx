export const metadata = { title: "Histoire — La Maison" };

const PDF = "/histoire-paradou.pdf";

export default function HistoirePage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-olive-dark sm:text-3xl">L&apos;histoire de la maison</h1>
          <p className="text-muted">Le livre de la famille — à consulter et à imprimer.</p>
        </div>
        <div className="flex gap-2">
          <a
            href={PDF}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-olive px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-olive-dark"
          >
            Plein écran / imprimer
          </a>
          <a
            href={PDF}
            download
            className="rounded-full border border-sand px-4 py-2 text-sm text-ink hover:bg-sand/60"
          >
            Télécharger
          </a>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-sand bg-white shadow-sm">
        <iframe src={PDF} title="Histoire de la maison" className="h-[80vh] w-full" />
      </div>

      <p className="text-xs text-muted">
        Si le document ne s&apos;affiche pas, utilise « Plein écran / imprimer » pour l&apos;ouvrir dans un nouvel onglet.
      </p>
    </div>
  );
}
