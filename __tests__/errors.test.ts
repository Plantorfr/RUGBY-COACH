import { describe, it, expect } from 'vitest'
import { AppError, ValidationError, AuthError, ForbiddenError, NotFoundError } from '../lib/supabase-server'

describe('Hiérarchie d\'erreurs métier', () => {
  it('AppError a les bons attributs', () => {
    const err = new AppError('Erreur test', 500, 'TEST_CODE')
    expect(err.message).toBe('Erreur test')
    expect(err.statusCode).toBe(500)
    expect(err.code).toBe('TEST_CODE')
    expect(err instanceof Error).toBe(true)
  })

  it('ValidationError — status 400 + code VALIDATION_ERROR', () => {
    const err = new ValidationError('Données invalides', { field: ['requis'] })
    expect(err.statusCode).toBe(400)
    expect(err.code).toBe('VALIDATION_ERROR')
    expect(err instanceof AppError).toBe(true)
  })

  it('AuthError — status 401 + code UNAUTHORIZED', () => {
    const err = new AuthError()
    expect(err.statusCode).toBe(401)
    expect(err.code).toBe('UNAUTHORIZED')
  })

  it('ForbiddenError — status 403 + code FORBIDDEN', () => {
    const err = new ForbiddenError()
    expect(err.statusCode).toBe(403)
    expect(err.code).toBe('FORBIDDEN')
  })

  it('NotFoundError — status 404 + message avec ressource', () => {
    const err = new NotFoundError('Joueur')
    expect(err.statusCode).toBe(404)
    expect(err.code).toBe('NOT_FOUND')
    expect(err.message).toContain('Joueur')
  })

  it('toutes les erreurs héritent de AppError', () => {
    expect(new ValidationError('x') instanceof AppError).toBe(true)
    expect(new AuthError() instanceof AppError).toBe(true)
    expect(new ForbiddenError() instanceof AppError).toBe(true)
    expect(new NotFoundError() instanceof AppError).toBe(true)
  })
})
