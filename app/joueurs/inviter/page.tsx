'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

interface Joueur {
  id: string
  prenom: string
  nom: string
  poste?: string
  auth_user_id?: string
  email_invite?: string
}

interface InviteResult {
  joueurId: string
  email: string
  tempPassword: string
}

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let pwd = ''
  for (let i = 0; i < 10; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)]
  }
  return pwd
}

export default function InviterJoueursPage() {
  const supabase = createClient()
  const [joueurs, setJoueurs] = useState<Joueur[]>([])
  const [emails, setEmails] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [inviting, setInviting] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, InviteResult>>({})
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase
      .from('joueurs')
      .select('id, prenom, nom, poste, auth_user_id, email_invite')
      .eq('archive', false)
      .order('nom', { ascending: true })

    const uninvited = (data || []).filter((j: Joueur) => !j.auth_user_id)
    setJoueurs(uninvited)

    const emailMap: Record<string, string> = {}
    uninvited.forEach((j: Joueur) => {
      emailMap[j.id] = j.email_invite || ''
    })
    setEmails(emailMap)
    setLoading(false)
  }

  async function handleInvite(joueur: Joueur) {
    const email = emails[joueur.id]?.trim()
    if (!email) { alert('Saisissez un email'); return }

    setInviting(joueur.id)
    const tempPassword = generateTempPassword()

    try {
      // Create auth account
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: tempPassword,
        options: {
          data: { name: `${joueur.prenom} ${joueur.nom}`, role: 'player' }
        }
      })

      if (signUpError) {
        alert(`Erreur : ${signUpError.message}`)
        setInviting(null)
        return
      }

      const newUserId = signUpData.user?.id

      if (newUserId) {
        // Link joueur to auth user
        await supabase
          .from('joueurs')
          .update({
            auth_user_id: newUserId,
            email_invite: email,
            invite_sent_at: new Date().toISOString(),
          })
          .eq('id', joueur.id)

        // Create profile with player role
        await supabase.from('profiles').upsert({
          id: newUserId,
          name: `${joueur.prenom} ${joueur.nom}`,
          role: 'player',
        })
      }

      setResults(prev => ({
        ...prev,
        [joueur.id]: { joueurId: joueur.id, email, tempPassword }
      }))

      // Remove from list
      setJoueurs(prev => prev.filter(j => j.id !== joueur.id))
    } catch {
      alert('Erreur lors de la création du compte')
    }

    setInviting(null)
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) return (
    <div style={{ color: 'var(--fg-mute)', padding: 40, textAlign: 'center' }}>
      Chargement...
    </div>
  )

  return (
    <>
      <div className="appbar">
        <Link href="/effectif" className="back-btn">
          <i className="ri-arrow-left-s-line"></i>
        </Link>
        <div style={{ flex: 1 }}>
          <div className="appbar-greet">Gestion des accès</div>
          <div className="appbar-team">Inviter des joueurs</div>
        </div>
      </div>

      <div style={{ padding: '0 18px' }}>
        {/* Created accounts */}
        {Object.keys(results).length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontFamily: 'var(--display)', fontSize: 14, fontWeight: 800,
              color: '#22c55e', marginBottom: 10,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <i className="ri-checkbox-circle-fill"></i>
              Comptes créés
            </div>
            {Object.values(results).map(result => (
              <div key={result.joueurId} style={{
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.25)',
                borderRadius: 14,
                padding: 14,
                marginBottom: 10,
              }}>
                <div style={{ fontSize: 13, color: 'white', marginBottom: 4, fontWeight: 600 }}>
                  {result.email}
                </div>
                <div style={{ fontSize: 12, color: 'var(--fg-mute)', marginBottom: 10 }}>
                  Transmettez ce mot de passe temporaire au joueur :
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 10,
                  padding: '10px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{
                    fontFamily: 'monospace',
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#ffd83a',
                    letterSpacing: '0.1em',
                  }}>
                    {result.tempPassword}
                  </span>
                  <button
                    onClick={() => copyToClipboard(result.tempPassword, result.joueurId)}
                    style={{
                      background: copied === result.joueurId ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.1)',
                      border: 'none',
                      borderRadius: 8,
                      padding: '6px 12px',
                      color: copied === result.joueurId ? '#22c55e' : 'white',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {copied === result.joueurId ? '✓ Copié' : 'Copier'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Players to invite */}
        {joueurs.length === 0 && Object.keys(results).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <p style={{ color: 'var(--fg-mute)', fontSize: 14 }}>
              Tous les joueurs ont déjà un compte.
            </p>
          </div>
        ) : (
          <>
            {joueurs.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{
                  fontFamily: 'var(--display)', fontSize: 14, fontWeight: 800,
                  color: 'var(--fg-mute)', marginBottom: 12,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  {joueurs.length} joueur{joueurs.length > 1 ? 's' : ''} sans compte
                </div>
                {joueurs.map(joueur => (
                  <div key={joueur.id} style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 14,
                    padding: 14,
                    marginBottom: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'rgba(255,216,58,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--display)', fontWeight: 900, fontSize: 16,
                        color: '#ffd83a',
                      }}>
                        {joueur.prenom.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'white', fontSize: 14 }}>
                          {joueur.prenom} {joueur.nom}
                        </div>
                        {joueur.poste && (
                          <div style={{ fontSize: 12, color: 'var(--fg-mute)' }}>{joueur.poste}</div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="email"
                        placeholder="Email du joueur"
                        value={emails[joueur.id] || ''}
                        onChange={e => setEmails(prev => ({ ...prev, [joueur.id]: e.target.value }))}
                        style={{
                          flex: 1,
                          background: 'rgba(255,255,255,0.07)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          borderRadius: 10,
                          padding: '9px 12px',
                          color: 'white',
                          fontSize: 14,
                        }}
                      />
                      <button
                        onClick={() => handleInvite(joueur)}
                        disabled={inviting === joueur.id || !emails[joueur.id]?.trim()}
                        style={{
                          background: 'var(--yellow)',
                          color: '#0a0e15',
                          border: 'none',
                          borderRadius: 10,
                          padding: '9px 16px',
                          fontFamily: 'var(--display)',
                          fontSize: 13,
                          fontWeight: 900,
                          cursor: inviting === joueur.id || !emails[joueur.id]?.trim() ? 'not-allowed' : 'pointer',
                          opacity: inviting === joueur.id || !emails[joueur.id]?.trim() ? 0.6 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        {inviting === joueur.id ? (
                          <i className="ri-loader-4-line"></i>
                        ) : (
                          <><i className="ri-send-plane-fill"></i> Inviter</>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav active="effectif" />
    </>
  )
}
