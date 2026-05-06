'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSupabase } from './useSupabase'

export interface Match {
  id: number; adversaire: string; date_match: string; lieu: string
  competition?: string; statut: string; score_nous?: number; score_eux?: number; rapport?: string
}

export interface Bilan { V: number; D: number; N: number }

/**
 * Hook de gestion des matchs avec calcul du bilan saison côté client.
 */
export function useMatchs() {
  const supabase = useSupabase()
  const [matchs, setMatchs] = useState<Match[]>([])
  const [bilan, setBilan] = useState<Bilan>({ V: 0, D: 0, N: 0 })
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('matchs')
      .select('*')
      .order('date_match', { ascending: false })
    const all = data || []
    setMatchs(all)
    const joues = all.filter((m: Match) => m.statut === 'joue')
    setBilan({
      V: joues.filter((m: Match) => (m.score_nous ?? 0) > (m.score_eux ?? 0)).length,
      D: joues.filter((m: Match) => (m.score_nous ?? 0) < (m.score_eux ?? 0)).length,
      N: joues.filter((m: Match) => m.score_nous === m.score_eux).length,
    })
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  const create = useCallback(async (data: Omit<Match, 'id' | 'statut'>) => {
    const { error } = await supabase.from('matchs').insert({ ...data, statut: 'a_venir' })
    if (!error) await load()
    return { error }
  }, [supabase, load])

  const updateResult = useCallback(async (id: number, score_nous: number, score_eux: number, rapport?: string) => {
    const { error } = await supabase.from('matchs')
      .update({ score_nous, score_eux, rapport: rapport || null, statut: 'joue' })
      .eq('id', id)
    if (!error) await load()
    return { error }
  }, [supabase, load])

  const aVenir = matchs.filter(m => m.statut === 'a_venir')
  const joues = matchs.filter(m => m.statut === 'joue')

  return { matchs, aVenir, joues, bilan, loading, load, create, updateResult }
}
