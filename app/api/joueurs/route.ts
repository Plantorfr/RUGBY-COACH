/**
 * GET  /api/joueurs — liste les joueurs actifs
 * POST /api/joueurs — crée un joueur (coach only)
 */
import { requireAuth, requireCoach, apiSuccess, apiError, ValidationError } from '@/lib/supabase-server'
import { JoueurCreateSchema } from '@/lib/validations'

export async function GET() {
  try {
    const { supabase } = await requireAuth()

    const { data, error } = await supabase
      .from('joueurs')
      .select('id, prenom, nom, numero, poste, disponible, capitaine, poids, taille, archive')
      .order('numero', { ascending: true })

    if (error) throw error
    return apiSuccess(data)
  } catch (err) {
    return apiError(err)
  }
}

export async function POST(request: Request) {
  try {
    const { supabase } = await requireCoach()

    const body = await request.json()
    const result = JoueurCreateSchema.safeParse(body)

    if (!result.success) {
      throw new ValidationError(
        'Données invalides',
        result.error.flatten().fieldErrors
      )
    }

    const { data, error } = await supabase
      .from('joueurs')
      .insert({ ...result.data, disponible: true, saison: '2025-2026' })
      .select()
      .single()

    if (error) throw error
    return apiSuccess(data, 201)
  } catch (err) {
    return apiError(err)
  }
}
