-- ============================================================
--  La Maison — Configuration Supabase (schéma vierge)
--  Application de gestion d'une maison familiale.
--  À exécuter dans Supabase : SQL Editor -> New query -> coller -> Run.
--  Aucune donnée personnelle : à toi de créer les comptes et le contenu.
-- ============================================================

create extension if not exists btree_gist;
create extension if not exists pgcrypto with schema extensions;
set search_path = public, extensions;

-- ---------- Chambres ----------
create table if not exists chambres (
  id        serial primary key,
  nom       text not null,
  etage     text not null,
  couchage  text not null,
  capacite  text,
  appoint   boolean not null default false,
  ordre     int not null default 0
);
alter table chambres enable row level security;
drop policy if exists "lecture chambres" on chambres;
create policy "lecture chambres" on chambres for select using (true);

-- Les 11 pièces (l'ordre fixe les id 1..11, utilisés par le front)
insert into chambres (nom, etage, couchage, capacite, appoint, ordre) values
  ('Chambre 1', '1er étage', '1 lit double + 1 lit enfant', '2 pers. + 1 enfant', false, 1),
  ('Chambre 2', '1er étage', '1 lit double', '2 pers.', false, 2),
  ('Couloir',   '1er étage', '1 canapé-lit 2 places', '2 pers. (appoint)', true, 3),
  ('Chambre 3', '2e étage', '1 lit double', '2 pers.', false, 4),
  ('Dortoir',   '2e étage', '3 lits fixes + 2 matelas', '3 à 5 pers.', false, 5),
  ('Chambre 4', '2e étage', '1 lit double + 1 lit enfant', '2 pers. + 1 enfant', false, 6),
  ('Chambre 5', '2e étage', '1 lit double', '2 pers.', false, 7),
  ('Chambre 6', '2e étage', '1 lit double', '2 pers.', false, 8),
  ('Chambre 7', '2e étage', '2 lits simples', '2 pers.', false, 9),
  ('Chambre 8', '2e étage', '1 lit double', '2 pers.', false, 10),
  ('Salon',     '2e étage', 'Couchage 2 places', '2 pers. (appoint)', true, 11)
on conflict do nothing;

-- ---------- Réservations ----------
create table if not exists reservations (
  id          uuid primary key default gen_random_uuid(),
  chambre_id  int  not null references chambres(id) on delete cascade,
  famille     text not null,
  occupant    text,
  arrivee     date not null,
  depart      date not null,
  personnes   int,
  note        text,
  created_at  timestamptz not null default now(),
  constraint dates_coherentes check (depart > arrivee),
  constraint pas_de_chevauchement exclude using gist (
    chambre_id with =,
    daterange(arrivee, depart, '[)') with &&
  )
);
alter table reservations enable row level security;
drop policy if exists "lecture reservations" on reservations;
create policy "lecture reservations" on reservations for select using (true);
drop policy if exists "ajout reservations" on reservations;
create policy "ajout reservations" on reservations for insert with check (true);

-- ---------- Naissances / anniversaires ----------
create table if not exists naissances (
  id         uuid primary key default gen_random_uuid(),
  nom        text not null,
  jour       int  not null check (jour between 1 and 31),
  mois       int  not null check (mois between 1 and 12),
  annee      int,
  branche    int,
  famille    text,
  created_at timestamptz not null default now()
);
alter table naissances enable row level security;
drop policy if exists "lecture naissances" on naissances;
create policy "lecture naissances" on naissances for select using (true);
drop policy if exists "ajout naissances" on naissances;
create policy "ajout naissances" on naissances for insert with check (true);

-- ---------- Rendez-vous / événements ----------
create table if not exists evenements (
  id          uuid primary key default gen_random_uuid(),
  titre       text not null,
  type        text not null default 'evenement',
  date        date not null,
  heure       text,
  lieu        text,
  description text,
  auteur      text,
  created_at  timestamptz not null default now()
);
alter table evenements enable row level security;
drop policy if exists "lecture evenements" on evenements;
create policy "lecture evenements" on evenements for select using (true);
drop policy if exists "ajout evenements" on evenements;
create policy "ajout evenements" on evenements for insert with check (true);

-- ---------- Mur de post-its ----------
create table if not exists postits (
  id         uuid primary key default gen_random_uuid(),
  auteur     text not null,
  compte     text,
  texte      text not null,
  couleur    text not null default 'jaune',
  epingle    boolean not null default false,
  created_at timestamptz not null default now()
);
alter table postits enable row level security;
drop policy if exists "lecture postits" on postits;
create policy "lecture postits" on postits for select using (true);
drop policy if exists "ajout postits" on postits;
create policy "ajout postits" on postits for insert with check (true);

-- ---------- Fournisseurs ----------
create table if not exists fournisseurs (
  id                uuid primary key default gen_random_uuid(),
  objet             text not null,
  intervenant       text,
  adresse           text,
  email             text,
  telephone         text,
  date_intervention date,
  note              text,
  created_at        timestamptz not null default now()
);
alter table fournisseurs enable row level security;
drop policy if exists "lecture fournisseurs" on fournisseurs;
create policy "lecture fournisseurs" on fournisseurs for select using (true);
drop policy if exists "ajout fournisseurs" on fournisseurs;
create policy "ajout fournisseurs" on fournisseurs for insert with check (true);
drop policy if exists "modif fournisseurs" on fournisseurs;
create policy "modif fournisseurs" on fournisseurs for update using (true) with check (true);

-- ---------- Arbre généalogique (JSON) ----------
create table if not exists arbre (
  cle  text primary key default 'paradou',
  data jsonb not null
);
alter table arbre enable row level security;
drop policy if exists "lecture arbre" on arbre;
create policy "lecture arbre" on arbre for select using (true);
-- Insère ton arbre :  insert into arbre (cle, data) values ('paradou', '{...}'::jsonb);

-- ---------- Comptes & connexion ----------
create table if not exists comptes (
  actionnaire       text primary key,
  mot_de_passe_hash text not null,
  session_token     text,
  doit_changer      boolean not null default true,
  role              text not null default 'actionnaire',
  created_at        timestamptz not null default now()
);
alter table comptes enable row level security; -- aucune policy : accès via fonctions uniquement

create or replace function connexion(p_actionnaire text, p_motdepasse text)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare tok text;
begin
  if not exists (select 1 from comptes where actionnaire = p_actionnaire
                 and mot_de_passe_hash = crypt(p_motdepasse, mot_de_passe_hash)) then
    return null;
  end if;
  tok := encode(gen_random_bytes(24), 'hex');
  update comptes set session_token = tok where actionnaire = p_actionnaire;
  return tok;
end; $$;

create or replace function whoami(p_token text)
returns text language sql security definer set search_path = public, extensions as $$
  select actionnaire from comptes where p_token is not null and session_token = p_token;
$$;

create or replace function mot_de_passe_a_changer(p_token text)
returns boolean language sql security definer set search_path = public, extensions as $$
  select doit_changer from comptes where p_token is not null and session_token = p_token;
$$;

create or replace function deconnexion(p_token text)
returns void language sql security definer set search_path = public, extensions as $$
  update comptes set session_token = null where session_token = p_token;
$$;

create or replace function changer_mot_de_passe(p_token text, p_ancien text, p_nouveau text)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare who text;
begin
  select actionnaire into who from comptes where p_token is not null and session_token = p_token;
  if who is null then return 'session'; end if;
  if length(coalesce(p_nouveau,'')) < 6 then return 'court'; end if;
  if not exists (select 1 from comptes where actionnaire = who
                 and mot_de_passe_hash = crypt(p_ancien, mot_de_passe_hash)) then
    return 'mauvais';
  end if;
  update comptes set mot_de_passe_hash = crypt(p_nouveau, gen_salt('bf')), doit_changer = false
  where actionnaire = who;
  return 'ok';
end; $$;

create or replace function liste_actionnaires()
returns setof text language sql security definer set search_path = public as $$
  select actionnaire from comptes order by actionnaire;
$$;

grant execute on function connexion(text,text)                 to anon;
grant execute on function whoami(text)                          to anon;
grant execute on function mot_de_passe_a_changer(text)          to anon;
grant execute on function deconnexion(text)                     to anon;
grant execute on function changer_mot_de_passe(text,text,text)  to anon;
grant execute on function liste_actionnaires()                  to anon;

-- Créer un compte (à adapter) — mot de passe haché automatiquement :
-- insert into comptes (actionnaire, mot_de_passe_hash)
-- values ('Prénom NOM', extensions.crypt('MotDePasseProvisoire', extensions.gen_salt('bf')));
