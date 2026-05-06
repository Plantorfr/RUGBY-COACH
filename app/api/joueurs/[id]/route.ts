/**
 * GET    /api/joueurs/[id] — détail d'un joueur
 * PATCH  /api/joueurs/[id] — modifie un joueur (coach only)
 * DELETE /api/joueurs/[id] — archive un joueur (coach only)
 */
import { requireAuth, requireCoach, apiSuccess, apiError, NotFoundError, ValidationError } from '@/lib/supabase-server'
import { JoueurUpdateSchema } from '@/lib/validations'

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const { supabase } = await requireAuth()
    const { id } = await params

    const { data, error } = await supabase
      .from('joueurs')
      .select(`
        *,
        stats_match ( essais, plaquages_reussis, metres_parcourus, minutes_jouees, note_etoiles, match_id ),
        evaluations ( date_eval, commentaire, porteur_balle, passes, plaquage, endurance, leadership )
      `)
      .eq('id', id)
      .single()

    if (error || !data) throw new NotFoundError('Joueur')
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
    const result = JoueurUpdateSchema.safeParse(body)

    if (!result.success) {
      throw new ValidationError('Données invalides', result.error.flatten().fieldErrors)
    }

    const { data, error } = await supabase
      .from('joueurs')
      .update(result.data)
      .eq('id', id)
      .select()
      .single()

    if (error || !data) throw new NotFoundError('Joueur')
    return apiSuccess(data)
  } catch (err) {
    return apiError(err)
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { supabase } = await requireCoach()
    const { id } = await params

    const { error } = await supabase
      .from('joueurs')
      .update({ archive: true })
      .eq('id', id)

    if (error) throw error
    return apiSuccess({ archived: true })
  } catch (err) {
    return apiError(err)
  }
}
