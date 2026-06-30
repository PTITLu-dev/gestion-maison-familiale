import Link from "next/link";

function Bloc({
  titre,
  emoji,
  children,
}: {
  titre: string;
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-sand bg-white p-5 shadow-sm">
      <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-olive-dark">
        <span aria-hidden>{emoji}</span>
        {titre}
      </h2>
      <div className="text-sm text-muted">{children}</div>
    </section>
  );
}

export default function MaisonPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-olive-dark sm:text-3xl">La maison</h1>
        <p className="text-muted">
          La gestion de la maison au même endroit : travaux, entretien, fournisseurs,
          guides, trésorerie et histoire.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Bloc titre="Travaux" emoji="🚧">
          Projets ponctuels (réfections, peintures, aménagements), avec statut, coût estimé/réel
          et photos avant/après. Décidés en Assemblée Générale.
        </Bloc>

        <Bloc titre="Entretien" emoji="🔧">
          Opérations récurrentes et leurs échéances : chaudière, piscine, fosse septique, jardin,
          ramonage… avec rappels des prochaines dates.
        </Bloc>

        <Bloc titre="Fournisseurs" emoji="📇">
          Annuaire des entreprises et prestataires (objet, nom, adresse, coordonnées).{" "}
          <Link href="/fournisseurs" className="text-olive underline">
            Ouvrir l&apos;annuaire →
          </Link>
        </Bloc>

        <Bloc titre="Guides pratiques" emoji="📘">
          Les modes d&apos;emploi de la maison : guide piscine, fosse septique, chaudière,
          fermeture de la maison… consultables et imprimables.
        </Bloc>

        <Bloc titre="Trésorerie" emoji="💶">
          Le suivi des comptes de la SCI : solde, dépenses, appels de fonds.{" "}
          <Link href="/tresorerie" className="text-olive underline">
            Voir les comptes →
          </Link>
        </Bloc>

        <Bloc titre="Histoire de la maison" emoji="📖">
          Le livre sur l&apos;histoire de la maison, à consulter et imprimer.{" "}
          <Link href="/histoire" className="text-olive underline">
            Ouvrir →
          </Link>
        </Bloc>
      </div>
    </div>
  );
}
