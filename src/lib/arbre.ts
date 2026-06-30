export type Noeud = {
  nom: string;
  annee: number | null;
  conjoint: { nom: string; annee: number | null } | null;
  branche: number;
  enfants: Noeud[];
};

export type Arbre = {
  racine: { nom: string; annee: number | null; conjoint: { nom: string; annee: number | null } };
  branches: Noeud[];
};
