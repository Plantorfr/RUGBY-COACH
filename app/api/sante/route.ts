/**
 * GET  /api/sante           — liste les blessures actives
 * POST /api/sante           — déclare une blessure (coach only)
 * GET  /api/sante?resolved  — historique des blessures résolues
 */
import { requireAuth, apiSuccess, apiError, ValidationError } from '@/lib/supabase-server'
import { BlessureSchema } from '@/lib/validations'

export async function GET(request: Request) {
  try {
    const { supabase } = await requireAuth()
    const { searchParams } = new URL(request.url)
    const resolved = searchParams.get('resolved') === 'true'

    const { data, error } = await supabase
      .from('sante')
      .select('*, joueurs(prenom, nom, poste)')
      .eq('resolved', resolved)
      .order('created_at', { ascending: false })

    if (error) throw error
    return apiSuccess(data)
  } catch (err) {
    return apiError(err)
  }
}

export async function POST(request: Request) {
  try {
    const { supabase } = await requireAuth()

    const body = await request.json()
    const result = BlessureSchema.safeParse(body)

    if (!result.success) {
      throw new ValidationError('Données invalides', result.error.flatten().fieldErrors)
    }

    const { data, error } = await supabase
      .from('sante')
      .insert({ ...result.data, resolved: false })
      .select()
      .single()

    if (error) throw error
    return apiSuccess(data, 201)
  } catch (err) {
    return apiError(err)
  }
}
