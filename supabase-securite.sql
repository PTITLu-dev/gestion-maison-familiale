-- ============================================================
--  Migration sécurité — à exécuter UNE FOIS sur une base déjà créée
--  avec l'ancienne version de supabase-setup.sql.
--  Supabase : SQL Editor -> New query -> coller -> Run.
--
--  Effets :
--   - supprime toutes les policies ouvertes : la clé publique (anon) n'a plus accès aux tables ;
--   - les fonctions de connexion ne sont plus appelables qu'avec la clé service_role (serveur) ;
--   - jetons de session hachés + expiration 30 jours, blocage 15 min après 5 échecs ;
--   - supprime liste_actionnaires() (exposait les noms des comptes sans connexion).
--  Toutes les sessions en cours sont fermées : chacun devra se reconnecter.
-- ============================================================

set search_path = public, extensions;

do $$
declare r record;
begin
  for r in
    select policyname, tablename from pg_policies
     where schemaname = 'public'
       and tablename in ('chambres','reservations','naissances','evenements','postits','fournisseurs','arbre','comptes')
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

alter table comptes add column if not exists session_expire timestamptz;
alter table comptes add column if not exists echecs int not null default 0;
alter table comptes add column if not exists bloque_jusqua timestamptz;
update comptes set session_token = null, session_expire = null;

-- ---------- Comptes & connexion ----------
-- Aucun accès direct depuis le navigateur : seul le serveur Next.js (clé service_role)
-- appelle ces fonctions. Le jeton de session n'est stocké qu'haché (SHA-256), il expire
-- au bout de 30 jours, et un compte est bloqué 15 minutes après 5 mots de passe faux.

create or replace function connexion(p_actionnaire text, p_motdepasse text)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare
  c   comptes%rowtype;
  tok text;
begin
  select * into c from comptes where lower(actionnaire) = lower(btrim(coalesce(p_actionnaire, '')));
  if not found then
    perform crypt(coalesce(p_motdepasse, ''), gen_salt('bf'));  -- même coût qu'un vrai essai
    return null;
  end if;
  if c.bloque_jusqua is not null and c.bloque_jusqua > now() then
    return null;
  end if;
  if c.mot_de_passe_hash <> crypt(coalesce(p_motdepasse, ''), c.mot_de_passe_hash) then
    update comptes
       set echecs        = case when echecs + 1 >= 5 then 0 else echecs + 1 end,
           bloque_jusqua = case when echecs + 1 >= 5 then now() + interval '15 minutes' else bloque_jusqua end
     where actionnaire = c.actionnaire;
    return null;
  end if;
  tok := encode(gen_random_bytes(32), 'hex');
  update comptes
     set session_token  = encode(digest(tok, 'sha256'), 'hex'),
         session_expire = now() + interval '30 days',
         echecs         = 0,
         bloque_jusqua  = null
   where actionnaire = c.actionnaire;
  return tok;
end; $$;

create or replace function whoami(p_token text)
returns text language sql stable security definer set search_path = public, extensions as $$
  select actionnaire from comptes
   where p_token is not null
     and session_token = encode(digest(p_token, 'sha256'), 'hex')
     and session_expire > now();
$$;

create or replace function mot_de_passe_a_changer(p_token text)
returns boolean language sql stable security definer set search_path = public, extensions as $$
  select doit_changer from comptes
   where p_token is not null
     and session_token = encode(digest(p_token, 'sha256'), 'hex')
     and session_expire > now();
$$;

create or replace function deconnexion(p_token text)
returns void language sql security definer set search_path = public, extensions as $$
  update comptes set session_token = null, session_expire = null
   where p_token is not null and session_token = encode(digest(p_token, 'sha256'), 'hex');
$$;

create or replace function changer_mot_de_passe(p_token text, p_ancien text, p_nouveau text)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare who text;
begin
  select whoami(p_token) into who;
  if who is null then return 'session'; end if;
  if length(coalesce(p_nouveau, '')) < 8 then return 'court'; end if;
  if not exists (select 1 from comptes where actionnaire = who
                 and mot_de_passe_hash = crypt(coalesce(p_ancien, ''), mot_de_passe_hash)) then
    return 'mauvais';
  end if;
  update comptes set mot_de_passe_hash = crypt(p_nouveau, gen_salt('bf', 10)), doit_changer = false
   where actionnaire = who;
  return 'ok';
end; $$;

drop function if exists liste_actionnaires();

-- ---------- Droits : rien pour anon / authenticated ----------
-- RLS activé sans aucune policy : la clé publique (anon) ne peut ni lire ni écrire.
-- Le serveur utilise la clé service_role, qui contourne RLS.
revoke all on table chambres, reservations, naissances, evenements, postits, fournisseurs, arbre, comptes
  from anon, authenticated;
revoke all on sequence chambres_id_seq from anon, authenticated;

revoke execute on function connexion(text, text)                from public, anon, authenticated;
revoke execute on function whoami(text)                         from public, anon, authenticated;
revoke execute on function mot_de_passe_a_changer(text)         from public, anon, authenticated;
revoke execute on function deconnexion(text)                    from public, anon, authenticated;
revoke execute on function changer_mot_de_passe(text, text, text) from public, anon, authenticated;

grant execute on function connexion(text, text)                to service_role;
grant execute on function whoami(text)                         to service_role;
grant execute on function mot_de_passe_a_changer(text)         to service_role;
grant execute on function deconnexion(text)                    to service_role;
grant execute on function changer_mot_de_passe(text, text, text) to service_role;
