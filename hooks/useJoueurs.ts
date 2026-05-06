'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSupabase } from './useSupabase'

export interface Joueur {
  id: number; prenom: string; nom: string; numero?: number; poste?: string
  telephone?: string; email?: string; poids?: number; taille?: number
  capitaine?: boolean; disponible?: boolean; archive?: boolean
}

/**
 * Hook de gestion de l'effectif.
 * Fournit la liste des joueurs et les actions CRUD.
 */
export function useJoueurs() {
  const supabase = useSupabase()
  const [joueurs, setJoueurs] = useState<Joueur[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('joueurs')
      .select('*')
      .order('numero', { ascending: true })
    if (error) setError(error.message)
    else setJoueurs(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  const create = useCallback(async (data: Omit<Joueur, 'id'>) => {
    const { error } = await supabase
      .from('joueurs')
      .insert({ ...data, disponible: true, saison: '2025-2026' })
    if (!error) await load()
    return { error }
  }, [supabase, load])

  const update = useCallback(async (id: number, data: Partial<Joueur>) => {
    const { error } = await supabase.from('joueurs').update(data).eq('id', id)
    if (!error) await load()
    return { error }
  }, [supabase, load])

  const archive = useCallback(async (id: number) => {
    const { error } = await supabase.from('joueurs').update({ archive: true }).eq('id', id)
    if (!error) await load()
    return { error }
  }, [supabase, load])

  return { joueurs, loading, error, load, create, update, archive }
}
