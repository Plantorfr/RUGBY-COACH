-- Add role to profiles (coach or player)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'coach';

-- Link joueurs to auth users (for player login)
ALTER TABLE joueurs ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE joueurs ADD COLUMN IF NOT EXISTS email_invite TEXT;
ALTER TABLE joueurs ADD COLUMN IF NOT EXISTS invite_sent_at TIMESTAMP WITH TIME ZONE;

-- Evaluations table (A/B/C/D per skill per match)
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  joueur_id UUID REFERENCES joueurs(id) ON DELETE CASCADE NOT NULL,
  match_id UUID REFERENCES matchs(id) ON DELETE SET NULL,
  date_eval DATE NOT NULL DEFAULT CURRENT_DATE,
  coach_id UUID REFERENCES profiles(id),
  -- Attaque
  porteur_balle TEXT CHECK (porteur_balle IN ('A','B','C','D')),
  passes TEXT CHECK (passes IN ('A','B','C','D')),
  soutien TEXT CHECK (soutien IN ('A','B','C','D')),
  jeu_au_pied TEXT CHECK (jeu_au_pied IN ('A','B','C','D')),
  prise_espace TEXT CHECK (prise_espace IN ('A','B','C','D')),
  -- Defense
  plaquage TEXT CHECK (plaquage IN ('A','B','C','D')),
  ligne_defensive TEXT CHECK (ligne_defensive IN ('A','B','C','D')),
  couverture TEXT CHECK (couverture IN ('A','B','C','D')),
  impact_contact TEXT CHECK (impact_contact IN ('A','B','C','D')),
  -- Jeu groupe
  melee TEXT CHECK (melee IN ('A','B','C','D')),
  touche TEXT CHECK (touche IN ('A','B','C','D')),
  ruck_maul TEXT CHECK (ruck_maul IN ('A','B','C','D')),
  coup_envoi TEXT CHECK (coup_envoi IN ('A','B','C','D')),
  -- Physique
  vitesse TEXT CHECK (vitesse IN ('A','B','C','D')),
  endurance TEXT CHECK (endurance IN ('A','B','C','D')),
  puissance TEXT CHECK (puissance IN ('A','B','C','D')),
  agilite TEXT CHECK (agilite IN ('A','B','C','D')),
  -- Mental
  leadership TEXT CHECK (leadership IN ('A','B','C','D')),
  discipline TEXT CHECK (discipline IN ('A','B','C','D')),
  engagement TEXT CHECK (engagement IN ('A','B','C','D')),
  resilience TEXT CHECK (resilience IN ('A','B','C','D')),
  lecture_jeu TEXT CHECK (lecture_jeu IN ('A','B','C','D')),
  -- Global
  commentaire TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for evaluations
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coach can do everything" ON evaluations FOR ALL USING (true);
