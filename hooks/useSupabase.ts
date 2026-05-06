'use client'
import { useMemo } from 'react'
import { createClient } from '@/lib/supabase'

/**
 * Hook qui fournit un client Supabase mémoïsé.
 * Évite de recréer le client à chaque render.
 */
export function useSupabase() {
  return useMemo(() => createClient(), [])
}
