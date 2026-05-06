import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Client Supabase côté serveur (API routes / Server Components).
 * Lit les cookies de la requête pour vérifier l'auth JWT.
 */
export async function createServerSupabase() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
            )
          } catch {
            // setAll peut échouer dans un Server Component en lecture seule
          }
        },
      },
    }
  )
}

/**
 * Vérifie que l'utilisateur est authentifié.
 * Renvoie { user } ou lance une AppError 401.
 */
export async function requireAuth() {
  const supabase = await createServerSupabase()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new AuthError('Non authentifié — connectez-vous.')
  }

  return { supabase, user }
}

// ─── Hiérarchie d'erreurs métier ────────────────────────────────────────────

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class AuthError extends AppError {
  constructor(message = 'Non authentifié') {
    super(message, 401, 'UNAUTHORIZED')
    this.name = 'AuthError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Accès refusé') {
    super(message, 403, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Ressource') {
    super(`${resource} introuvable`, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

// ─── Helper de réponse normalisée ───────────────────────────────────────────

export function apiSuccess<T>(data: T, status = 200) {
  return Response.json({ data, error: null }, { status })
}

export function apiError(err: unknown) {
  if (err instanceof AppError) {
    return Response.json(
      { data: null, error: { code: err.code, message: err.message } },
      { status: err.statusCode }
    )
  }

  // Erreur inattendue — on masque les détails en prod
  console.error('[API Error]', err)
  return Response.json(
    { data: null, error: { code: 'INTERNAL_ERROR', message: 'Erreur interne du serveur' } },
    { status: 500 }
  )
}
