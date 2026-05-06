'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from './useSupabase'

interface AuthUser {
  id: string
  email?: string
}

/**
 * Hook d'authentification — redirige vers / si non connecté.
 * Retourne l'utilisateur courant et un flag de chargement.
 */
export function useAuth() {
  const supabase = useSupabase()
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/'); return }
      setUser(user)
      setLoading(false)
    })
  }, [])

  return { user, loading, supabase }
}
