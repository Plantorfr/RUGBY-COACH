'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSupabase } from './useSupabase'

export interface Blessure {
  id: number; type_blessure: string; statut: string; date_debut: string
  date_retour_estime?: string; notes_medicales?: string; resolved?: boolean
  joueurs?: { id: number; prenom: string; nom: string; poste?: string }
}

/**
 * Hook de gestion de la santé / infirmerie.
 * Calcule les compteurs out/incertain/fit.
 */
export function useSante() {
  const supabase = useSupabase()
  const [blessures, setBlessures] = useState<Blessure[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (resolved = false) => {
    setLoading(true)
    const { data } = await supabase
      .from('sante')
      .select('*, joueurs(id, nom, prenom, poste)')
      .eq('resolved', resolved)
      .order('created_at', { ascending: false })
    setBlessures(data || [])
    setLoading(false)
  }, [supabase])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load() }, [load])

  const declare = useCallback(async (data: Omit<Blessure, 'id' | 'resolved' | 'joueurs'>) => {
    const { error } = await supabase.from('sante').insert({ ...data, resolved: false })
    if (!error) await load()
    return { error }
  }, [supabase, load])

  const resolve = useCallback(async (id: number) => {
    const { error } = await supabase.from('sante').update({ resolved: true }).eq('id', id)
    if (!error) await load()
    return { error }
  }, [supabase, load])

  const nbOut = blessures.filter(b => b.statut === 'out').length
  const nbIncertain = blessures.filter(b => b.statut === 'incertain').length

  return { blessures, nbOut, nbIncertain, loading, load, declare, resolve }
}
