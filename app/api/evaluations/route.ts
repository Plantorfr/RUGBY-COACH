/**
 * GET  /api/evaluations?joueur_id=X — historique évaluations d'un joueur
 * POST /api/evaluations             — enregistre une évaluation (coach only)
 */
import { requireAuth, apiSuccess, apiError, ValidationError } from '@/lib/supabase-server'
import { EvaluationSchema } from '@/lib/validations'

export async function GET(request: Request) {
  try {
    const { supabase } = await requireAuth()
    const { searchParams } = new URL(request.url)
    const joueurId = searchParams.get('joueur_id')

    let query = supabase
      .from('evaluations')
      .select('*, matchs(adversaire, date_match)')
      .order('date_eval', { ascending: false })

    if (joueurId) {
      query = query.eq('joueur_id', joueurId)
    }

    const { data, error } = await query
    if (error) throw error
    return apiSuccess(data)
  } catch (err) {
    return apiError(err)
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireAuth()

    const body = await request.json()
    const result = EvaluationSchema.safeParse(body)

    if (!result.success) {
      throw new ValidationError('Données invalides', result.error.flatten().fieldErrors)
    }

    const payload = {
      ...result.data,
      coach_id: user.id,
      date_eval: result.data.date_eval ?? new Date().toISOString().split('T')[0],
    }

    // Si un match_id est fourni, remplacer l'éval existante pour ce joueur/match
    if (payload.match_id) {
      await supabase
        .from('evaluations')
        .delete()
        .eq('joueur_id', payload.joueur_id)
        .eq('match_id', payload.match_id)
    }

    const { data, error } = await supabase
      .from('evaluations')
      .insert(payload)
      .select()
      .single()

    if (error) throw error
    return apiSuccess(data, 201)
  } catch (err) {
    return apiError(err)
  }
}
