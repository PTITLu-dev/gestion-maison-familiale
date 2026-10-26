# Gestion Maison Familiale

> **Application de gestion d'une maison de famille en SCI.**

Application web privée pour gérer une **maison de famille détenue en SCI** : réservation des chambres,
calendrier partagé, suivi de la maison (travaux, entretien, fournisseurs), trésorerie, mur de post-its,
anniversaires et arbre généalogique. Chaque actionnaire dispose d'un compte personnel.

> Projet personnel. Le dépôt ne contient **aucune donnée familiale** : tout le contenu
> (noms, comptes, arbre, réservations…) vit dans votre propre base Supabase.

## Fonctionnalités

- **Connexion par actionnaire** — comptes individuels, mots de passe hachés (bcrypt), session par cookie httpOnly (jeton haché en base, expiration 30 jours), blocage 15 min après 5 échecs, changement de mot de passe imposé à la première connexion.
- **Planning** — calendrier mensuel façon agenda, séjours + rendez-vous + événements familiaux.
- **Réservation** — plan cliquable des pièces, sélection multiple, dates d'abord puis pièces déjà prises grisées, détection des conflits garantie au niveau de la base (contrainte d'exclusion PostgreSQL), règle « maison entière » bloquée du 15 juin au 15 septembre.
- **Tableau de bord** — vue d'ensemble (prochains anniversaires, événements, derniers post-its…).
- **La maison** — travaux, entretien, fournisseurs (annuaire éditable), guides, trésorerie, histoire (PDF consultable/imprimable).
- **Anniversaires & naissances** — calendrier familial coloré par branche + arbre généalogique pliable.
- **Mur de post-its** — petits mots de la famille.

## Stack technique

- [Next.js](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (PostgreSQL + fonctions `security definer`), appelé uniquement côté serveur (Server Actions, Route Handlers, `proxy.ts`)
- Déploiement sur [Vercel](https://vercel.com/)

## Installation

### 1. Prérequis

- Node.js 18+ et npm
- Un projet [Supabase](https://supabase.com/) (gratuit)

### 2. Récupérer le code

```bash
git clone <url-du-repo>
cd gestion-maison-familiale
npm install
```

### 3. Configurer la base Supabase

1. Dans votre projet Supabase, ouvrez **SQL Editor → New query**.
2. Collez le contenu de [`supabase-setup.sql`](./supabase-setup.sql) et cliquez **Run**.
   Cela crée toutes les tables, les droits d'accès et les fonctions de connexion (sans aucune donnée).
   *Base créée avec une ancienne version ?* Exécutez plutôt [`supabase-securite.sql`](./supabase-securite.sql) une fois.
3. Créez au moins un compte (le mot de passe est haché automatiquement) :

   ```sql
   insert into comptes (actionnaire, mot_de_passe_hash)
   values ('Prénom NOM', extensions.crypt('MotDePasseProvisoire', extensions.gen_salt('bf', 10)));
   ```

### 4. Variables d'environnement

Créez un fichier `.env.local` à la racine (jamais versionné) :

```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role
```

Ces deux valeurs se trouvent dans Supabase : **Project Settings → API**.
La clé `service_role` est secrète : elle n'est lue que par le serveur (jamais de préfixe `NEXT_PUBLIC_`).

### 5. Lancer en local

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000). Vous serez redirigé vers la page de connexion.

## Déploiement (Vercel)

1. Poussez le dépôt sur GitHub.
2. Sur Vercel : **New Project → Import** le dépôt.
3. Ajoutez les variables `NEXT_PUBLIC_SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`.
4. Déployez.

## Sécurité

- **Aucun accès direct à la base depuis le navigateur.** RLS est activé sur toutes les tables sans aucune
  policy, et les droits de `anon` / `authenticated` sont retirés : la clé publique Supabase ne permet ni de lire
  ni d'écrire. Toutes les lectures et écritures passent par le serveur Next.js avec la clé `service_role`.
- **Session vérifiée à chaque requête** : `src/proxy.ts` valide le jeton en base (pas seulement la présence
  du cookie), puis chaque page de données et chaque Server Action (`src/app/actions.ts`) revérifie la session.
  L'auteur d'une réservation ou d'un post-it est déduit du cookie, jamais du formulaire.
- **Jetons de session** : 256 bits aléatoires, stockés hachés (SHA-256) en base, expiration à 30 jours,
  invalidés à la déconnexion.
- **Mots de passe** : bcrypt, 8 caractères minimum, blocage 15 minutes après 5 échecs. La page de connexion
  ne liste plus les comptes existants.
- **Entrées** validées côté serveur (dates, longueurs, types d'événements, couleurs, pièces existantes),
  règle « maison entière l'été » appliquée côté serveur, conflits de réservation bloqués par la base.
- Aucun secret ni donnée personnelle n'est versionné (`.env.local` et les contenus sont hors dépôt).

## Scripts

```bash
npm run dev     # développement
npm run build   # build de production
npm run start   # serveur de production
npm run lint    # lint
```
