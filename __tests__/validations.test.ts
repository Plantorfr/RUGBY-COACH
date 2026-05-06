import { describe, it, expect } from 'vitest'
import {
  JoueurCreateSchema,
  JoueurUpdateSchema,
  MatchCreateSchema,
  MatchResultSchema,
  BlessureSchema,
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
