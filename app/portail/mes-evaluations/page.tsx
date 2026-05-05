'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import BottomNavPlayer from '@/components/BottomNavPlayer'
import { COMPETENCES, GRADE_COLORS } from '@/lib/competences'

interface Evaluation {
  id: string
  date_eval: string
  match_id?: string
  commentaire?: string
  [key: string]: unknown
  matchs?: { adversaire: string; date_match: string }
}

export default function MesEvaluationsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }

    const { data: joueurData } = await supabase
      .from('joueurs')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!joueurData) { router.push('/portail'); return }

    const { data } = await supabase
      .from('evaluations')
      .select('*, matchs(adversaire, date_match)')
      .eq('joueur_id', joueurData.id)
      .order('created_at', { ascending: false })

    setEvaluations(data || [])
    setLoading(false)
  }

  if (loading) return (
    <div style={{ color: 'var(--fg-mute)', padding: 40, textAlign: 'center' }}>
      Chargement...
    </div>
  )

  return (
    <>
      <div className="appbar">
        <Link href="/portail" className="back-btn">
          <i className="ri-arrow-left-s-line"></i>
        </Link>
        <div style={{ flex: 1 }}>
          <div className="appbar-greet">Mon historique</div>
          <div className="appbar-team">Mes évaluations</div>
        </div>
      </div>

      <div style={{ padding: '0 18px' }}>
        {evaluations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <p style={{ color: 'var(--fg-mute)', fontSize: 14 }}>
              Aucune évaluation disponible pour le moment.
            </p>
          </div>
        ) : evaluations.map(ev => {
          const isExpanded = expandedId === ev.id
          const date = new Date(ev.date_eval).toLocaleDateString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
          })
          const matchName = ev.matchs ? `vs ${(ev.matchs as { adversaire: string }).adversaire}` : null

          return (
            <div key={ev.id} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              marginBottom: 12,
              overflow: 'hidden',
            }}>
              {/* Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : ev.id)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 14, color: 'white', marginBottom: 2, textTransform: 'capitalize' }}>
                    {date}
                  </div>
                  {matchName && (
                    <div style={{ fontSize: 12, color: 'var(--fg-mute)' }}>{matchName}</div>
                  )}
                </div>
                <i
                  className={isExpanded ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}
                  style={{ color: 'var(--fg-mute)', fontSize: 20, flexShrink: 0 }}
                ></i>
              </button>

              {/* All 22 competences */}
              {isExpanded && (
                <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ paddingTop: 14, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {COMPETENCES.map(comp => {
                      const grade = ev[comp.id] as string | undefined
                      if (!grade) return null
                      return (
                        <span key={comp.id} style={{
                          background: `${GRADE_COLORS[grade]}15`,
                          color: GRADE_COLORS[grade],
                          border: `1px solid ${GRADE_COLORS[grade]}30`,
                          borderRadius: 8,
                          padding: '3px 8px',
                          fontSize: 11,
                          fontWeight: 700,
                          fontFamily: 'var(--display)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}>
                          <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400, fontSize: 10 }}>{comp.name}</span>
                          {grade}
                        </span>
                      )
                    })}
                  </div>

                  {ev.commentaire && (
                    <div style={{
                      marginTop: 12,
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: 10,
                      padding: '10px 12px',
                    }}>
                      <div style={{ fontSize: 11, color: 'var(--fg-mute)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Commentaire coach
                      </div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', lineHeight: 1.5 }}>
                        &ldquo;{ev.commentaire}&rdquo;
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Compact grade row when collapsed */}
              {!isExpanded && (
                <div style={{ padding: '0 16px 12px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {COMPETENCES.slice(0, 8).map(comp => {
                    const grade = ev[comp.id] as string | undefined
                    if (!grade) return null
                    return (
                      <span key={comp.id} style={{
                        background: `${GRADE_COLORS[grade]}20`,
                        color: GRADE_COLORS[grade],
                        borderRadius: 6,
                        padding: '2px 7px',
                        fontSize: 11,
                        fontWeight: 700,
                      }}>
                        {grade}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <BottomNavPlayer active="evaluations" />
    </>
  )
}
