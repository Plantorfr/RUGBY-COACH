/**
 * GET /api/dashboard — agrège toutes les données du dashboard en 1 appel
 * Logique métier serveur : bilan, compteurs santé, prochain match
 */
import { requireAuth, apiSuccess, apiError } from '@/lib/supabase-server'

export async function GET() {
  try {
    const { supabase, user } = await requireAuth()

    const today = new Date().toISOString().split('T')[0]

    // Exécuter toutes les requêtes en parallèle
    const [profileRes, prochainRes, joueursRes, santéRes, matchsRes] = await Promise.all([
      supabase.from('profiles').select('name, role').eq('id', user.id).single(),
      supabase.from('matchs').select('*').eq('statut', 'a_venir').gte('date_match', today).order('date_match').limit(1),
      supabase.from('joueurs').select('id, disponible, archive').eq('archive', false),
      supabase.from('sante').select('statut').eq('resolved', false),
      supabase.from('matchs').select('score_nous, score_eux, adversaire, date_match, lieu').eq('statut', 'joue').order('date_match', { ascending: false }).limit(5),
    ])

    // ── Bilan saison ──────────────────────────────────────────
    const joues = matchsRes.data ?? []
    const bilan = {
      V: joues.filter(m => (m.score_nous ?? 0) > (m.score_eux ?? 0)).length,
      D: joues.filter(m => (m.score_nous ?? 0) < (m.score_eux ?? 0)).length,
      N: joues.filter(m => m.score_nous === m.score_eux).length,
      total: joues.length,
    }

    // ── Effectif ──────────────────────────────────────────────
    const joueurs = joueursRes.data ?? []
    const effectif = {
      total: joueurs.length,
      disponibles: joueurs.filter(j => j.disponible).length,
    }

    // ── Infirmerie ────────────────────────────────────────────
    const blessures = santéRes.data ?? []
    const infirmerie = {
      out: blessures.filter(b => b.statut === 'out').length,
      incertain: blessures.filter(b => b.statut === 'incertain').length,
    }

    return apiSuccess({
      coach: profileRes.data,
      prochain_match: prochainRes.data?.[0] ?? null,
      bilan,
      effectif,
      infirmerie,
      derniers_matchs: matchsRes.data ?? [],
    })
  } catch (err) {
    return apiError(err)
  }
}
