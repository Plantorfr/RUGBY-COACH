import { z } from 'zod'

// ─── Joueurs ────────────────────────────────────────────────────────────────

export const JoueurCreateSchema = z.object({
  prenom: z.string().min(1, 'Prénom requis').max(50).trim(),
  nom: z.string().min(1, 'Nom requis').max(50).trim(),
  numero: z.number().int().min(1).max(99).optional().nullable(),
  poste: z.enum([
    'Pilier gauche', 'Talonneur', 'Pilier droit',
    'Deuxième ligne', 'Troisième ligne aile', 'Troisième ligne centre',
    'Demi de mêlée', "Demi d'ouverture", 'Centre', 'Ailier', 'Arrière',
  ]),
  telephone: z.string().max(20).optional().nullable(),
  email: z.string().email('Email invalide').optional().nullable(),
  poids: z.number().min(50).max(200).optional().nullable(),
  taille: z.number().min(150).max(220).optional().nullable(),
})

export const JoueurUpdateSchema = JoueurCreateSchema.partial()

export type JoueurCreate = z.infer<typeof JoueurCreateSchema>
export type JoueurUpdate = z.infer<typeof JoueurUpdateSchema>

// ─── Matchs ─────────────────────────────────────────────────────────────────

export const MatchCreateSchema = z.object({
  adversaire: z.string().min(1, 'Adversaire requis').max(100).trim(),
  date_match: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format date YYYY-MM-DD requis'),
  lieu: z.enum(['domicile', 'exterieur']),
  competition: z.string().max(100).optional().nullable(),
})

export const MatchResultSchema = z.object({
  score_nous: z.number().int().min(0).max(200),
  score_eux: z.number().int().min(0).max(200),
  rapport: z.string().max(2000).optional().nullable(),
})

export type MatchCreate = z.infer<typeof MatchCreateSchema>

// ─── Stats match ────────────────────────────────────────────────────────────

export const StatJoueurSchema = z.object({
  joueur_id: z.number().int().positive(),
  minutes_jouees: z.number().int().min(0).max(120).default(80),
  essais: z.number().int().min(0).max(20).default(0),
  transformations: z.number().int().min(0).max(20).default(0),
  passes_decisives: z.number().int().min(0).max(20).default(0),
  plaquages_reussis: z.number().int().min(0).max(50).default(0),
  plaquages_manques: z.number().int().min(0).max(20).default(0),
  metres_parcourus: z.number().int().min(0).max(500).default(0),
  carton_jaune: z.boolean().default(false),
  carton_rouge: z.boolean().default(false),
  note_etoiles: z.number().int().min(1).max(5).optional().nullable(),
  appreciation: z.string().max(500).optional().nullable(),
})

// ─── Évaluations compétences ────────────────────────────────────────────────

const GradeSchema = z.enum(['A', 'B', 'C', 'D']).optional().nullable()

export const EvaluationSchema = z.object({
  joueur_id: z.number().int().positive(),
  match_id: z.number().int().positive().optional().nullable(),
  date_eval: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  // Attaque
  porteur_balle: GradeSchema,
  passes: GradeSchema,
  soutien: GradeSchema,
  jeu_au_pied: GradeSchema,
  prise_espace: GradeSchema,
  // Défense
  plaquage: GradeSchema,
  ligne_defensive: GradeSchema,
  couverture: GradeSchema,
  impact_contact: GradeSchema,
  // Jeu groupé
  melee: GradeSchema,
  touche: GradeSchema,
  ruck_maul: GradeSchema,
  coup_envoi: GradeSchema,
  // Physique
  vitesse: GradeSchema,
  endurance: GradeSchema,
  puissance: GradeSchema,
  agilite: GradeSchema,
  // Mental
  leadership: GradeSchema,
  discipline: GradeSchema,
  engagement: GradeSchema,
  resilience: GradeSchema,
  lecture_jeu: GradeSchema,
  // Global
  commentaire: z.string().max(1000).optional().nullable(),
})

export type Evaluation = z.infer<typeof EvaluationSchema>

// ─── Santé ──────────────────────────────────────────────────────────────────

export const BlessureSchema = z.object({
  joueur_id: z.number().int().positive(),
  type_blessure: z.string().min(1).max(200).trim(),
  statut: z.enum(['out', 'incertain', 'fit']),
  date_debut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  date_retour_estime: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  notes_medicales: z.string().max(1000).optional().nullable(),
})
