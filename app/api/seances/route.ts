/**
 * GET  /api/seances — liste les séances
 * POST /api/seances — crée une séance (coach only)
 */
import { requireAuth, requireCoach, apiSuccess, apiError, ValidationError } from '@/lib/supabase-server'
import { z } from 'zod'

const SeanceSchema = z.object({
  titre: z.string().min(1).max(200).trim(),
  date_seance: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  duree_minutes: z.number().int().min(15).max(300).optional(),
  type_seance: z.enum(['Technique', 'Physique', 'Tactique', 'Défense', 'Attaque', 'Autre']).optional(),
  objectif: z.string().max(500).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
})

export async function GET() {
  try {
    const { supabase } = await requireAuth()
    const { data, error } = await supabase
      .from('seances')
      .select('*')
      .order('date_seance', { ascending: false })
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
    const result = SeanceSchema.safeParse(body)
    if (!result.success) throw new ValidationError('Données invalides', result.error.flatten().fieldErrors)
    const { data, error } = await supabase.from('seances').insert(result.data).select().single()
    if (error) throw error
    return apiSuccess(data, 201)
  } catch (err) {
    return apiError(err)
  }
}
