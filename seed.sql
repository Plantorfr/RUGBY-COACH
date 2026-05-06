-- ============================================================
-- SEED — RugbyCoach RCACP 95
-- Données de démonstration réalistes
-- Idempotent : peut être relancé sans erreur
-- ============================================================
-- INSTRUCTIONS :
-- 1. Créer d'abord le compte coach dans Supabase Auth :
--    Authentication > Users > Invite User → coach@demo-rcacp.fr / Demo1234!
-- 2. Copier l'UUID généré et remplacer COACH_UUID ci-dessous
-- 3. Exécuter ce fichier dans Supabase SQL Editor
-- ============================================================

-- Remplace cet UUID par celui du compte coach créé dans Supabase Auth
DO $$
DECLARE
  coach_id UUID := (SELECT id FROM auth.users WHERE email = 'coach@demo-rcacp.fr' LIMIT 1);
BEGIN

-- ── PROFIL COACH ─────────────────────────────────────────────
INSERT INTO profiles (id, name, role)
VALUES (coach_id, 'Thomas Plantor', 'coach')
ON CONFLICT (id) DO UPDATE SET name = 'Thomas Plantor', role = 'coach';

-- ── JOUEURS ──────────────────────────────────────────────────
INSERT INTO joueurs (prenom, nom, numero, poste, poids, taille, disponible, archive, saison, capitaine) VALUES
  ('Baptiste',  'Moreau',    1,  'Pilier gauche',          110, 182, true,  false, '2025-2026', false),
  ('Clément',   'Renard',    2,  'Talonneur',               95, 178, true,  false, '2025-2026', false),
  ('Kevin',     'Dubois',    3,  'Pilier droit',           115, 180, true,  false, '2025-2026', false),
  ('Mathieu',   'Bernard',   4,  'Deuxième ligne',          105, 196, true,  false, '2025-2026', false),
  ('Antoine',   'Garnier',   5,  'Deuxième ligne',          102, 194, false, false, '2025-2026', false),
  ('Julien',    'Martin',    6,  'Troisième ligne aile',    98,  188, true,  false, '2025-2026', false),
  ('Pierre',    'Lefebvre',  7,  'Troisième ligne aile',    95,  185, true,  false, '2025-2026', false),
  ('Nicolas',   'Thomas',    8,  'Troisième ligne centre',  100, 190, true,  false, '2025-2026', true),
  ('Romain',    'Petit',     9,  'Demi de mêlée',           80,  175, true,  false, '2025-2026', false),
  ('Alexandre', 'Robert',    10, 'Demi d''ouverture',       85,  180, true,  false, '2025-2026', false),
  ('Hugo',      'Simon',     11, 'Ailier',                  88,  178, true,  false, '2025-2026', false),
  ('Maxime',    'Laurent',   12, 'Centre',                  90,  182, false, false, '2025-2026', false),
  ('Théo',      'Michel',    13, 'Centre',                  88,  180, true,  false, '2025-2026', false),
  ('Lucas',     'Garcia',    14, 'Ailier',                  82,  176, true,  false, '2025-2026', false),
  ('Tom',       'Martinez',  15, 'Arrière',                 84,  179, true,  false, '2025-2026', false),
  ('Sébastien', 'Dupont',    16, 'Talonneur',               92,  175, true,  false, '2025-2026', false),
  ('Florian',   'Durand',    17, 'Pilier gauche',           108, 181, true,  false, '2025-2026', false),
  ('Valentin',  'Leroy',     18, 'Pilier droit',            112, 183, true,  false, '2025-2026', false),
  ('Axel',      'Moreau',    20, 'Demi de mêlée',           78,  172, false, false, '2025-2026', false),
  ('Nathan',    'Vincent',   23, 'Arrière',                 82,  177, true,  false, '2025-2026', false)
ON CONFLICT DO NOTHING;

-- ── MATCHS ───────────────────────────────────────────────────
INSERT INTO matchs (adversaire, date_match, lieu, competition, statut, score_nous, score_eux, rapport) VALUES
  ('RC Pontoise',        '2025-09-14', 'domicile', 'Fédérale 3',         'joue', 28, 15, 'Bonne entame de saison. Dominant en mêlée, quelques lacunes en défense sur les phases de transition.'),
  ('US Creil',           '2025-09-21', 'exterieur', 'Fédérale 3',        'joue', 12, 22, 'Défaite méritée. Mauvaise gestion du territoire, trop de fautes en zone rouge.'),
  ('Compiègne RC',       '2025-10-05', 'domicile', 'Fédérale 3',         'joue', 35, 10, 'Excellente performance collective. 5 essais marqués, plaquage défensif solide.'),
  ('Soissons Rugby',     '2025-10-19', 'exterieur', 'Fédérale 3',        'joue', 21, 21, 'Match nul frustrant. Dominateurs pendant 70 min, essai encaissé dans les arrêts de jeu.'),
  ('Chantilly Rugby',    '2025-11-02', 'domicile', 'Coupe de l''Oise',   'joue', 42,  7, 'Victoire nette en coupe. Bonne rotation de l''effectif, tous les remplaçants ont joué.'),
  ('Senlis RC',          '2025-11-16', 'exterieur', 'Fédérale 3',        'joue', 18, 24, 'Défaite sur le fil. Bonne réaction après la mi-temps mais 3 cartons jaunes trop nombreux.'),
  ('Beauvais Oise Rugby','2025-12-14', 'domicile', 'Fédérale 3',         'a_venir', null, null, null),
  ('Amiens RC',          '2026-01-11', 'exterieur', 'Fédérale 3',        'a_venir', null, null, null),
  ('Laon Rugby Club',    '2026-01-25', 'domicile', 'Fédérale 3',         'a_venir', null, null, null)
ON CONFLICT DO NOTHING;

-- ── STATS MATCH (match 1 — victoire RC Pontoise) ─────────────
WITH m AS (SELECT id FROM matchs WHERE adversaire = 'RC Pontoise' LIMIT 1),
     j AS (SELECT id, nom FROM joueurs WHERE archive = false ORDER BY numero)
INSERT INTO stats_match (joueur_id, match_id, minutes_jouees, essais, transformations, passes_decisives, plaquages_reussis, plaquages_manques, metres_parcourus, note_etoiles, appreciation)
SELECT
  j.id,
  m.id,
  CASE j.nom
    WHEN 'Moreau'   THEN 80 WHEN 'Renard'   THEN 75 WHEN 'Dubois'   THEN 80
    WHEN 'Bernard'  THEN 80 WHEN 'Martin'   THEN 80 WHEN 'Lefebvre' THEN 80
    WHEN 'Thomas'   THEN 80 WHEN 'Petit'    THEN 80 WHEN 'Robert'   THEN 70
    WHEN 'Simon'    THEN 80 WHEN 'Michel'   THEN 80 WHEN 'Garcia'   THEN 80
    WHEN 'Martinez' THEN 80 ELSE 40
  END,
  CASE j.nom WHEN 'Simon' THEN 2 WHEN 'Garcia' THEN 1 WHEN 'Thomas' THEN 1 ELSE 0 END,
  CASE j.nom WHEN 'Robert' THEN 2 ELSE 0 END,
  CASE j.nom WHEN 'Petit' THEN 3 WHEN 'Robert' THEN 2 ELSE 0 END,
  CASE j.nom WHEN 'Thomas' THEN 8 WHEN 'Lefebvre' THEN 6 WHEN 'Moreau' THEN 5 ELSE 3 END,
  CASE j.nom WHEN 'Robert' THEN 1 WHEN 'Petit' THEN 0 ELSE 1 END,
  CASE j.nom WHEN 'Simon' THEN 85 WHEN 'Garcia' THEN 72 WHEN 'Martinez' THEN 65 ELSE 20 END,
  CASE j.nom WHEN 'Thomas' THEN 5 WHEN 'Simon' THEN 5 WHEN 'Petit' THEN 4 ELSE 3 END,
  CASE j.nom WHEN 'Thomas' THEN 'Leader de match, omniprésent.' WHEN 'Simon' THEN 'Doublé d''essai, ligne directe.' ELSE null END
FROM j, m
WHERE j.nom IN ('Moreau','Renard','Dubois','Bernard','Martin','Lefebvre','Thomas','Petit','Robert','Simon','Michel','Garcia','Martinez')
ON CONFLICT DO NOTHING;

-- ── ÉVALUATIONS COMPÉTENCES (match 1 — quelques joueurs) ─────
WITH m AS (SELECT id FROM matchs WHERE adversaire = 'RC Pontoise' LIMIT 1),
     j8  AS (SELECT id FROM joueurs WHERE nom = 'Thomas' AND prenom = 'Nicolas' LIMIT 1),
     j9  AS (SELECT id FROM joueurs WHERE nom = 'Petit' LIMIT 1),
     j10 AS (SELECT id FROM joueurs WHERE nom = 'Robert' LIMIT 1)
INSERT INTO evaluations (joueur_id, match_id, date_eval,
  porteur_balle, passes, soutien, jeu_au_pied, prise_espace,
  plaquage, ligne_defensive, couverture, impact_contact,
  melee, touche, ruck_maul, coup_envoi,
  vitesse, endurance, puissance, agilite,
  leadership, discipline, engagement, resilience, lecture_jeu,
  commentaire)
SELECT j8.id, m.id, '2025-09-14',
  'A','B','A','C','A', 'A','A','B','A', 'A','B','A','B', 'B','A','A','B', 'A','A','A','A','A',
  'Capitaine exemplaire. A porté l''équipe dans les moments difficiles.'
FROM j8, m
UNION ALL
SELECT j9.id, m.id, '2025-09-14',
  'B','A','A','B','B', 'B','B','A','B', 'A','B','A','B', 'A','B','B','A', 'B','A','A','B','A',
  'Excellente distribution, 3 passes décisives.'
FROM j9, m
UNION ALL
SELECT j10.id, m.id, '2025-09-14',
  'B','A','B','A','B', 'C','C','B','C', 'B','B','B','B', 'B','B','B','B', 'B','B','B','B','B',
  'Bon en attaque, doit améliorer son placement défensif.'
FROM j10, m
ON CONFLICT DO NOTHING;

-- ── SANTÉ (2 blessures actives) ───────────────────────────────
WITH j5 AS (SELECT id FROM joueurs WHERE nom = 'Garnier' LIMIT 1),
     j12 AS (SELECT id FROM joueurs WHERE nom = 'Laurent' LIMIT 1)
INSERT INTO sante (joueur_id, type_blessure, statut, date_debut, date_retour_estime, notes_medicales, resolved)
SELECT j5.id, 'Entorse genou gauche', 'out', '2025-10-19', '2025-12-20', 'IRM confirmé — 6 semaines minimum. Rééducation en cours.', false FROM j5
UNION ALL
SELECT j12.id, 'Contracture ischio-jambiers', 'incertain', '2025-11-10', '2025-12-07', 'Traitement kiné 3x/semaine. Décision J-2 du match.', false FROM j12
ON CONFLICT DO NOTHING;

-- ── SÉANCES (3 séances planifiées) ───────────────────────────
INSERT INTO seances (titre, date_seance, duree_minutes, type_seance, objectif, notes) VALUES
  ('Mêlée & touche',            '2025-12-09', 90,  'Technique',  'Améliorer la stabilité en mêlée fermée et les calls en touche', 'Focus sur les schémas de touche offensive à 5m'),
  ('Défense en ligne / plaqué', '2025-12-11', 90,  'Défense',    'Réduire les plaquages manqués (12 sur le dernier match)', 'Exercices 1vs1, 2vs2, puis défense en ligne à 7'),
  ('Préparation Beauvais',      '2025-12-13', 120, 'Tactique',   'Mise en place du plan de jeu vs Beauvais Oise Rugby', 'Analyse vidéo adverse — attaque dans les intervalles')
ON CONFLICT DO NOTHING;

END $$;
