'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Remplis tous les champs.')
      return
    }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError('Email ou mot de passe incorrect.')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="login-page">
      <div className="rc-login">
        <div className="rc-login-logo">
          <div className="rc-login-mark">R</div>
          <div className="rc-login-wordmark">
            RugbyCoach
            <small>RCA Cergy Pontoise</small>
          </div>
        </div>

        <h1>Bienvenue sur<br />le <em>terrain.</em></h1>
        <p className="rc-login-sub">
          Pilotez votre saison, suivez chaque joueur,<br />analysez les chiffres.
        </p>

        <div className="rc-field">
          <label className="rc-field-lbl">Email coach</label>
          <input
            className="rc-input"
            type="email"
            placeholder="coach@rca-cergy.fr"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <div className="rc-field">
          <label className="rc-field-lbl">Mot de passe</label>
          <input
            className="rc-input"
            type="password"
            placeholder="••••••••••"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
        </div>

        {error && <div className="error-msg">{error}</div>}

        <button className="rc-btn primary" onClick={handleLogin} disabled={loading}>
          {loading ? 'Connexion...' : 'Entrer dans le vestiaire →'}
        </button>

        <button className="rc-btn ghost">Mot de passe oublié ?</button>
      </div>
    </div>
  )
}
