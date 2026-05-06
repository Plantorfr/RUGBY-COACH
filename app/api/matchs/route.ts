/**
 * GET  /api/matchs              — liste tous les matchs
 * GET  /api/matchs?statut=joue  — filtre par statut (a_venir | joue)
 * POST /api/matchs              — crée un match (coach only)
 */
import { requireAuth, requireCoach, apiSuccess, apiError, ValidationError } from '@/lib/supabase-server'
import { MatchCreateSchema } from '@/lib/validations'

export async function GET(request: Request) {
  try {
    const { supabase } = await requireAuth()
    const { searchParams } = new URL(request.url)
    const statut = searchParams.get('statut')

    let query = supabase
      .from('matchs')
      .select('*')
      .order('date_match', { ascending: false })

    if (statut === 'joue' || statut === 'a_venir') {
      query = query.eq('statut', statut)
    }

    const { data, error } = await query
    if (error) throw error

    // Calcul bilan côté serveur
    const joues = (data || []).filter(m => m.statut === 'joue')
    const bilan = {
      V: joues.filter(m => (m.score_nous ?? 0) > (m.score_eux ?? 0)).length,
      D: joues.filter(m => (m.score_nous ?? 0) < (m.score_eux ?? 0)).length,
      N: joues.filter(m => m.score_nous === m.score_eux).length,
    }

    return apiSuccess({ matchs: data, bilan })
  } catch (err) {
    return apiError(err)
  }
}

export async function POST(request: Request) {
  try {
    const { supabase } = await requireCoach()

    const body = await request.json()
    const result = MatchCreateSchema.safeParse(body)

    if (!result.success) {
      throw new ValidationError('Données invalides', result.error.flatten().fieldErrors)
    }

    const { data, error } = await supabase
      .from('matchs')
      .insert({ ...result.data, statut: 'a_venir' })
      .select()
      .single()

    if (error) throw error
    return apiSuccess(data, 201)
  } catch (err) {
    return apiError(err)
  }
}
