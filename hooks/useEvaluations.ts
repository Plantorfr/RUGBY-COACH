'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSupabase } from './useSupabase'

export interface Evaluation {
  id: string; date_eval: string; match_id?: number; commentaire?: string
  [key: string]: unknown
  matchs?: { adversaire: string; date_match: string }
}

/**
 * Hook de gestion des évaluations A/B/C/D par joueur.
 */
export function useEvaluations(joueurId: number | string) {
  const supabase = useSupabase()
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!joueurId) return
    setLoading(true)
    const { data } = await supabase
      .from('evaluations')
      .select('*, matchs(adversaire, date_match)')
      .eq('joueur_id', joueurId)
      .order('date_eval', { ascending: false })
    setEvaluations(data || [])
    setLoading(false)
  }, [supabase, joueurId])

  useEffect(() => { load() }, [load])

  const save = useCallback(async (evalData: Record<string, unknown>) => {
    if (evalData.match_id) {
      await supabase.from('evaluations')
        .delete()
        .eq('joueur_id', joueurId)
        .eq('match_id', evalData.match_id)
    }
    const { error } = await supabase.from('evaluations').insert({
      ...evalData,
      joueur_id: joueurId,
      date_eval: evalData.date_eval ?? new Date().toISOString().split('T')[0],
    })
    if (!error) await load()
    return { error }
  }, [supabase, joueurId, load])

  const latest = evaluations[0] ?? null

  return { evaluations, latest, loading, load, save }
}
