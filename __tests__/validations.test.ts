import { describe, it, expect } from 'vitest'
import {
  JoueurCreateSchema,
  JoueurUpdateSchema,
  MatchCreateSchema,
  MatchResultSchema,
  BlessureSchema,
  EvaluationSchema,
  StatJoueurSchema,
} from '../lib/validations'

// ─── JoueurCreateSchema ──────────────────────────────────────────────────────

describe('JoueurCreateSchema', () => {
  it('valide un joueur complet', () => {
    const result = JoueurCreateSchema.safeParse({
      prenom: 'Thomas',
      nom: 'Dupont',
      numero: 9,
      poste: 'Demi de mêlée',
      poids: 80,
      taille: 175,
    })
    expect(result.success).toBe(true)
  })

  it('rejette un prénom vide', () => {
    const result = JoueurCreateSchema.safeParse({
      prenom: '',
      nom: 'Dupont',
      poste: 'Arrière',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('prenom')
    }
  })

  it('rejette un poste invalide', () => {
    const result = JoueurCreateSchema.safeParse({
      prenom: 'Paul',
      nom: 'Martin',
      poste: 'Quarterback', // poste américain invalide
    })
    expect(result.success).toBe(false)
  })

  it('accepte les champs optionnels absents', () => {
    const result = JoueurCreateSchema.safeParse({
      prenom: 'Marc',
      nom: 'Bernard',
      poste: 'Arrière',
    })
    expect(result.success).toBe(true)
  })

  it('rejette un numéro hors plage (0 ou >99)', () => {
    const resultZero = JoueurCreateSchema.safeParse({ prenom: 'A', nom: 'B', poste: 'Arrière', numero: 0 })
    const resultTrop = JoueurCreateSchema.safeParse({ prenom: 'A', nom: 'B', poste: 'Arrière', numero: 100 })
    expect(resultZero.success).toBe(false)
    expect(resultTrop.success).toBe(false)
  })
})

// ─── JoueurUpdateSchema ──────────────────────────────────────────────────────

describe('JoueurUpdateSchema', () => {
  it('accepte un objet vide (tous optionnels)', () => {
    const result = JoueurUpdateSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('valide une modification partielle', () => {
    const result = JoueurUpdateSchema.safeParse({ poids: 95 })
    expect(result.success).toBe(true)
  })
})

// ─── MatchCreateSchema ───────────────────────────────────────────────────────

describe('MatchCreateSchema', () => {
  it('valide un match complet', () => {
    const result = MatchCreateSchema.safeParse({
      adversaire: 'RC Pontoise',
      date_match: '2026-03-15',
      lieu: 'domicile',
      competition: 'Fédérale 3',
    })
    expect(result.success).toBe(true)
  })

  it('rejette une date mal formatée', () => {
    const result = MatchCreateSchema.safeParse({
      adversaire: 'RC Pontoise',
      date_match: '15/03/2026', // format français invalide
      lieu: 'domicile',
    })
    expect(result.success).toBe(false)
  })

  it('rejette un lieu invalide', () => {
    const result = MatchCreateSchema.safeParse({
      adversaire: 'RC Pontoise',
      date_match: '2026-03-15',
      lieu: 'neutral', // valeur non autorisée
    })
    expect(result.success).toBe(false)
  })
})

// ─── MatchResultSchema ───────────────────────────────────────────────────────

describe('MatchResultSchema', () => {
  it('valide un résultat standard', () => {
    const result = MatchResultSchema.safeParse({ score_nous: 24, score_eux: 17 })
    expect(result.success).toBe(true)
  })

  it('rejette un score négatif', () => {
    const result = MatchResultSchema.safeParse({ score_nous: -1, score_eux: 10 })
    expect(result.success).toBe(false)
  })
})

// ─── BlessureSchema ──────────────────────────────────────────────────────────

describe('BlessureSchema', () => {
  it('valide une blessure complète', () => {
    const result = BlessureSchema.safeParse({
      joueur_id: 5,
      type_blessure: 'Entorse cheville gauche',
      statut: 'out',
      date_debut: '2026-01-10',
      date_retour_estime: '2026-02-20',
      notes_medicales: 'Repos complet 6 semaines',
    })
    expect(result.success).toBe(true)
  })

  it('rejette un statut invalide', () => {
    const result = BlessureSchema.safeParse({
      joueur_id: 1,
      type_blessure: 'Entorse',
      statut: 'blessé', // valeur invalide
      date_debut: '2026-01-10',
    })
    expect(result.success).toBe(false)
  })
})

// ─── EvaluationSchema ────────────────────────────────────────────────────────

describe('EvaluationSchema', () => {
  it('valide une évaluation complète avec toutes les compétences', () => {
    const result = EvaluationSchema.safeParse({
      joueur_id: 3,
      match_id: 7,
      date_eval: '2026-04-12',
      // Attaque
      porteur_balle: 'A',
      passes: 'B',
      soutien: 'B',
      jeu_au_pied: 'C',
      prise_espace: 'A',
      // Défense
      plaquage: 'B',
      ligne_defensive: 'B',
      couverture: 'A',
      impact_contact: 'C',
      // Jeu groupé
      melee: 'B',
      touche: 'B',
      ruck_maul: 'A',
      coup_envoi: 'C',
      // Physique
      vitesse: 'A',
      endurance: 'B',
      puissance: 'B',
      agilite: 'A',
      // Mental
      leadership: 'B',
      discipline: 'A',
      engagement: 'A',
      resilience: 'B',
      lecture_jeu: 'B',
      commentaire: 'Très bon match, doit progresser en jeu au pied.',
    })
    expect(result.success).toBe(true)
  })

  it('valide une évaluation minimale (joueur_id seul)', () => {
    const result = EvaluationSchema.safeParse({ joueur_id: 1 })
    expect(result.success).toBe(true)
  })

  it('rejette une note de compétence hors de A/B/C/D', () => {
    const result = EvaluationSchema.safeParse({
      joueur_id: 2,
      plaquage: 'E', // invalide
    })
    expect(result.success).toBe(false)
  })

  it('rejette un joueur_id invalide (0)', () => {
    const result = EvaluationSchema.safeParse({ joueur_id: 0 })
    expect(result.success).toBe(false)
  })

  it('rejette une date mal formatée', () => {
    const result = EvaluationSchema.safeParse({
      joueur_id: 1,
      date_eval: '12/04/2026',
    })
    expect(result.success).toBe(false)
  })

  it('accepte null pour une compétence non notée', () => {
    const result = EvaluationSchema.safeParse({
      joueur_id: 5,
      vitesse: null,
      endurance: null,
    })
    expect(result.success).toBe(true)
  })
})

// ─── StatJoueurSchema ────────────────────────────────────────────────────────

describe('StatJoueurSchema', () => {
  it('valide des stats complètes', () => {
    const result = StatJoueurSchema.safeParse({
      joueur_id: 4,
      minutes_jouees: 80,
      essais: 2,
      transformations: 2,
      passes_decisives: 1,
      plaquages_reussis: 8,
      plaquages_manques: 1,
      metres_parcourus: 65,
      carton_jaune: false,
      carton_rouge: false,
      note_etoiles: 4,
      appreciation: 'Très bonne performance',
    })
    expect(result.success).toBe(true)
  })

  it('applique les valeurs par défaut', () => {
    const result = StatJoueurSchema.safeParse({ joueur_id: 1 })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.minutes_jouees).toBe(80)
      expect(result.data.essais).toBe(0)
      expect(result.data.carton_rouge).toBe(false)
    }
  })

  it('rejette des minutes supérieures à 120', () => {
    const result = StatJoueurSchema.safeParse({ joueur_id: 1, minutes_jouees: 121 })
    expect(result.success).toBe(false)
  })

  it('rejette une note étoiles hors plage (0 ou >5)', () => {
    const r0 = StatJoueurSchema.safeParse({ joueur_id: 1, note_etoiles: 0 })
    const r6 = StatJoueurSchema.safeParse({ joueur_id: 1, note_etoiles: 6 })
    expect(r0.success).toBe(false)
    expect(r6.success).toBe(false)
  })

  it('rejette un joueur_id nul ou négatif', () => {
    expect(StatJoueurSchema.safeParse({ joueur_id: -1 }).success).toBe(false)
  })
})
