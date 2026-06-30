# Gestion Maison Familiale

> **Application de gestion d'une maison de famille en SCI.**

Application web privée pour gérer une **maison de famille détenue en SCI** : réservation des chambres,
calendrier partagé, suivi de la maison (travaux, entretien, fournisseurs), trésorerie, mur de post-its,
anniversaires et arbre généalogique. Chaque actionnaire dispose d'un compte personnel.

> Projet personnel. Le dépôt ne contient **aucune donnée familiale** : tout le contenu
> (noms, comptes, arbre, réservations…) vit dans votre propre base Supabase.

## Fonctionnalités

- **Connexion par actionnaire** — comptes individuels, mots de passe hachés (bcrypt), session par cookie httpOnly, changement de mot de passe imposé à la première connexion.
- **Planning** — calendrier mensuel façon agenda, séjours + rendez-vous + événements familiaux.
- **Réservation** — plan cliquable des pièces, sélection multiple, dates d'abord puis pièces déjà prises grisées, détection des conflits garantie au niveau de la base (contrainte d'exclusion PostgreSQL), règle « maison entière » bloquée du 15 juin au 15 septembre.
- **Tableau de bord** — vue d'ensemble (prochains anniversaires, événements, derniers post-its…).
- **La maison** — travaux, entretien, fournisseurs (annuaire éditable), guides, trésorerie, histoire (PDF consultable/imprimable).
- **Anniversaires & naissances** — calendrier familial coloré par branche + arbre généalogique pliable.
- **Mur de post-its** — petits mots de la famille.

## Stack technique

- [Next.js](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (PostgreSQL + fonctions RPC `security definer`)
- Déploiement sur [Vercel](https://vercel.com/)

## Installation

### 1. Prérequis

- Node.js 18+ et npm
- Un projet [Supabase](https://supabase.com/) (gratuit)

### 2. Récupérer le code

```bash
git clone <url-du-repo>
cd site_paradou
npm install
```

### 3. Configurer la base Supabase

1. Dans votre projet Supabase, ouvrez **SQL Editor → New query**.
2. Collez le contenu de [`supabase-setup.sql`](./supabase-setup.sql) et cliquez **Run**.
   Cela crée toutes les tables, les règles de sécurité et les fonctions de connexion (sans aucune donnée).
3. Créez au moins un compte (le mot de passe est haché automatiquement) :

   ```sql
   insert into comptes (actionnaire, mot_de_passe_hash)
   values ('Prénom NOM', extensions.crypt('MotDePasseProvisoire', extensions.gen_salt('bf')));
   ```

### 4. Variables d'environnement

Créez un fichier `.env.local` à la racine (jamais versionné) :

```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_publique
```

Ces deux valeurs se trouvent dans Supabase : **Project Settings → API**.

### 5. Lancer en local

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000). Vous serez redirigé vers la page de connexion.

## Déploiement (Vercel)

1. Poussez le dépôt sur GitHub.
2. Sur Vercel : **New Project → Import** le dépôt.
3. Ajoutez les variables `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Déployez.

## Notes de sécurité

- L'authentification verrouille l'**interface**. Les règles d'accès des données (RLS) sont volontairement ouvertes en lecture/écriture pour un usage familial à faible risque ; une protection par utilisateur au niveau base nécessiterait Supabase Auth.
- Aucun secret ni donnée personnelle n'est versionné (`.env.local` et les contenus sont exclus / hors dépôt).

## Scripts

```bash
npm run dev     # développement
npm run build   # build de production
npm run start   # serveur de production
npm run lint    # lint
```
