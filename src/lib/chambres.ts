

export type Chambre = {
  id: number;
  nom: string;
  etage: string;
  couchage: string;
  capacite: string;
  appoint: boolean;
  col: string;
  row: string;
};

export const CHAMBRES: Chambre[] = [
  { id: 1,  nom: "Chambre 1", etage: "1er étage", couchage: "1 lit double + 1 lit enfant", capacite: "2 pers. + 1 enfant", appoint: false, col: "1 / 2", row: "1 / 2" },
  { id: 2,  nom: "Chambre 2", etage: "1er étage", couchage: "1 lit double", capacite: "2 pers.", appoint: false, col: "2 / 3", row: "1 / 2" },
  { id: 3,  nom: "Couloir",   etage: "1er étage", couchage: "1 canapé-lit 2 places", capacite: "2 pers. (appoint)", appoint: true, col: "1 / 3", row: "2 / 3" },

  { id: 4,  nom: "Chambre 3", etage: "2e étage", couchage: "1 lit double", capacite: "2 pers.", appoint: false, col: "1 / 2", row: "1 / 2" },
  { id: 6,  nom: "Chambre 4", etage: "2e étage", couchage: "1 lit double + 1 lit enfant", capacite: "2 pers. + 1 enfant", appoint: false, col: "2 / 3", row: "1 / 2" },
  { id: 7,  nom: "Chambre 5", etage: "2e étage", couchage: "1 lit double", capacite: "2 pers.", appoint: false, col: "3 / 4", row: "1 / 2" },
  { id: 8,  nom: "Chambre 6", etage: "2e étage", couchage: "1 lit double", capacite: "2 pers.", appoint: false, col: "4 / 5", row: "1 / 2" },
  { id: 9,  nom: "Chambre 7", etage: "2e étage", couchage: "2 lits simples", capacite: "2 pers.", appoint: false, col: "1 / 2", row: "2 / 3" },
  { id: 10, nom: "Chambre 8", etage: "2e étage", couchage: "1 lit double", capacite: "2 pers.", appoint: false, col: "2 / 3", row: "2 / 3" },
  { id: 5,  nom: "Dortoir",   etage: "2e étage", couchage: "3 lits fixes + 2 matelas", capacite: "3 à 5 pers.", appoint: false, col: "3 / 5", row: "2 / 3" },
  { id: 11, nom: "Salon",     etage: "2e étage", couchage: "Couchage 2 places", capacite: "2 pers. (appoint)", appoint: true, col: "1 / 5", row: "3 / 4" },
];

export const ETAGES = [
  { nom: "1er étage", colonnes: 2 },
  { nom: "2e étage", colonnes: 4 },
];
