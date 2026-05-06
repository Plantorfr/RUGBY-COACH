/**
 * GET   /api/matchs/[id] — détail d'un match avec stats joueurs
 * PATCH /api/matchs/[id] — met à jour le score / statut d'un match (coach only)
 */
import { requireAuth, requireCoach, apiSuccess, apiError, NotFoundError, ValidationError } from '@/lib/supabase-server'
import { MatchResultSchema } from '@/lib/validations'

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const { supabase } = await requireAuth()
    const { id } = await params

    const { data, error } = await supabase
      .from('matchs')
      .select(`
        *,
        stats_match (
          joueur_id,
          minutes_jouees,
          essais,
          transformations,
          passes_decisives,
          plaquages_reussis,
          plaquages_manques,
          metres_parcourus,
          carton_jaune,
          carton_rouge,
          note_etoiles,
          appreciation,
          joueurs ( prenom, nom, poste, numero )
        )
      `)
      .eq('id', id)
      .single()

    if (error || !data) throw new NotFoundError('Match')
    return apiSuccess(data)
  } catch (err) {
    return apiError(err)
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { supabase } = await requireCoach()
    const { id } = await params

    const body = await request.json()
    const result = MatchResultSchema.safeParse(body)

    if (!result.success) {
      throw new ValidationError('Données invalides', result.error.flatten().fieldErrors)
    }

    const { data, error } = await supabase
      .from('matchs')
      .update({ ...result.data, statut: 'joue' })
      .eq('id', id)
      .select()
      .single()

    if (error || !data) throw new NotFoundError('Match')
    return apiSuccess(data)
  } catch (err) {
    return apiError(err)
  }
}
