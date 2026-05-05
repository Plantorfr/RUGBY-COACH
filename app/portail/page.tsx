'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import BottomNavPlayer from '@/components/BottomNavPlayer'
import { COMPETENCES, CATEGORIES, GRADE_COLORS, GRADE_VALUES } from '@/lib/competences'

interface Joueur {
  id: string
  prenom: string
  nom: string
  poste?: string
}

interface Match {
  id: string
  adversaire: string
  date_match: string
  statut: string
  score_nous?: number
  score_eux?: number
  lieu?: string
}

interface Evaluation {
  id: string
  date_eval: string
  match_id?: string
  [key: string]: unknown
  matchs?: { adversaire: string }
}

export default function PortailPage() {
  const router = useRouter()
  const supabase = createClient()
  const [joueur, setJoueur] = useState<Joueur | null>(null)
  const [lastMatch, setLastMatch] = useState<Match | null>(null)
  const [nextMatchs, setNextMatchs] = useState<Match[]>([])
  const [lastEval, setLastEval] = useState<Evaluation | null>(null)
  const [prevEval, setPrevEval] = useState<Evaluation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }

    // Find joueur by auth_user_id
    const { data: joueurData } = await supabase
      .from('joueurs')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()

    if (!joueurData) {
      // Fallback: no player account linked
      setLoading(false)
      return
    }
    setJoueur(joueurData)

    const today = new Date().toISOString().split('T')[0]

    const [
      { data: lastMatchData },
      { data: nextMatchData },
      { data: evalsData }
    ] = await Promise.all([
      supabase.from('matchs').select('*').eq('statut', 'joue').order('date_match', { ascending: false }).limit(1).single(),
      supabase.from('matchs').select('*').eq('statut', 'a_venir').gte('date_match', today).order('date_match', { ascending: true }).limit(2),
      supabase.from('evaluations').select('*, matchs(adversaire)').eq('joueur_id', joueurData.id).order('created_at', { ascending: false }).limit(2),
    ])

    setLastMatch(lastMatchData || null)
    setNextMatchs(nextMatchData || [])
    if (evalsData && evalsData.length > 0) {
      setLastEval(evalsData[0])
      if (evalsData.length > 1) setPrevEval(evalsData[1])
    }
    setLoading(false)
  }

  function getCategoryAvgGrade(evaluation: Evaluation, category: string): string | null {
    const comps = COMPETENCES.filter(c => c.category === category)
    const values = comps
      .map(c => evaluation[c.id] as string | undefined)
      .filter(Boolean)
      .map(g => GRADE_VALUES[g as string] || 0)
    if (!values.length) return null
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    if (avg >= 3.5) return 'A'
    if (avg >= 2.5) return 'B'
    if (avg >= 1.5) return 'C'
    return 'D'
  }

  function getOverallScore(evaluation: Evaluation): number {
    const values = COMPETENCES
      .map(c => evaluation[c.id] as string | undefined)
      .filter(Boolean)
      .map(g => GRADE_VALUES[g as string] || 0)
    if (!values.length) return 0
    return values.reduce((a, b) => a + b, 0) / values.length
  }

  function getWeakestCompetences(evaluation: Evaluation) {
    return COMPETENCES
      .map(c => ({ comp: c, value: GRADE_VALUES[(evaluation[c.id] as string) || ''] || 0 }))
      .filter(x => x.value > 0)
      .sort((a, b) => a.value - b.value)
      .slice(0, 3)
  }

  if (loading) return (
    <div style={{ color: 'var(--fg-mute)', padding: 40, textAlign: 'center' }}>
      Chargement...
    </div>
  )

  if (!joueur) return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
      <h2 style={{ fontFamily: 'var(--display)', color: 'white', marginBottom: 8 }}>Compte non lié</h2>
      <p style={{ color: 'var(--fg-mute)', fontSize: 14 }}>
        Votre compte n&apos;est pas encore lié à un joueur. Contactez votre coach.
      </p>
    </div>
  )

  const currentScore = lastEval ? getOverallScore(lastEval) : 0
  const prevScore = prevEval ? getOverallScore(prevEval) : 0
  const progression = prevEval ? currentScore - prevScore : 0
  const weakest = lastEval ? getWeakestCompetences(lastEval) : []

  return (
    <>
      <div className="appbar">
        <div style={{ flex: 1 }}>
          <div className="appbar-greet">Bonjour,</div>
          <div className="appbar-team">{joueur.prenom} {joueur.nom}</div>
        </div>
        <div style={{
          width: 42, height: 42, borderRadius: 13,
          background: 'var(--yellow)', color: 'var(--bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--display)', fontSize: 18, fontWeight: 900,
        }}>
          {joueur.prenom.charAt(0)}
        </div>
      </div>

      <div style={{ padding: '0 18px' }}>
        {/* Last match */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 14, color: 'var(--fg-mute)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Dernier match
            </div>
          </div>
          {lastMatch ? (
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: 16,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 900, color: 'white' }}>
                    vs {lastMatch.adversaire}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fg-mute)', marginTop: 2 }}>
                    {new Date(lastMatch.date_match).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                  </div>
                </div>
                {lastMatch.score_nous !== undefined && (
                  <div style={{
                    fontFamily: 'var(--display)',
                    fontSize: 22,
                    fontWeight: 900,
                    color: (lastMatch.score_nous || 0) >= (lastMatch.score_eux || 0) ? '#22c55e' : '#ef4343',
                  }}>
                    {lastMatch.score_nous} – {lastMatch.score_eux}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--fg-mute)', fontSize: 13, fontStyle: 'italic' }}>Aucun match joué</div>
          )}
        </div>

        {/* Last evaluation */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 14, color: 'var(--fg-mute)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Dernière évaluation
            </div>
            <Link href="/portail/mes-evaluations" style={{ fontSize: 12, color: 'var(--yellow)', textDecoration: 'none' }}>
              Tout voir ›
            </Link>
          </div>
          {lastEval ? (
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: 16,
            }}>
              <div style={{ fontSize: 12, color: 'var(--fg-mute)', marginBottom: 10 }}>
                {new Date(lastEval.date_eval).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {CATEGORIES.map(cat => {
                  const g = getCategoryAvgGrade(lastEval, cat)
                  return g ? (
                    <span key={cat} style={{
                      background: `${GRADE_COLORS[g]}20`,
                      color: GRADE_COLORS[g],
                      border: `1px solid ${GRADE_COLORS[g]}40`,
                      borderRadius: 8,
                      padding: '4px 10px',
                      fontSize: 12,
                      fontWeight: 700,
                      fontFamily: 'var(--display)',
                    }}>
                      {cat === 'Jeu groupé' ? 'J.G.' : cat} {g}
                    </span>
                  ) : null
                })}
              </div>

              {/* Progression indicator */}
              {prevEval && (
                <div style={{
                  marginTop: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  color: progression > 0 ? '#22c55e' : progression < 0 ? '#ef4343' : 'var(--fg-mute)',
                }}>
                  <i className={progression > 0 ? 'ri-arrow-up-circle-fill' : progression < 0 ? 'ri-arrow-down-circle-fill' : 'ri-minus-circle-line'}></i>
                  {progression > 0 ? 'Progression' : progression < 0 ? 'Régression' : 'Stable'} par rapport à la dernière éval
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: 'var(--fg-mute)', fontSize: 13, fontStyle: 'italic' }}>Aucune évaluation disponible</div>
          )}
        </div>

        {/* Next matches */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 14, color: 'var(--fg-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            Prochains matchs
          </div>
          {nextMatchs.length > 0 ? nextMatchs.map(m => (
            <div key={m.id} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: '12px 14px',
              marginBottom: 8,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontWeight: 700, color: 'white', fontSize: 14 }}>vs {m.adversaire}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-mute)', marginTop: 2 }}>
                  {new Date(m.date_match).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
              </div>
              <span style={{
                background: 'rgba(255,216,58,0.15)',
                color: '#ffd83a',
                borderRadius: 8,
                padding: '4px 10px',
                fontSize: 11,
                fontWeight: 700,
              }}>
                À venir
              </span>
            </div>
          )) : (
            <div style={{ color: 'var(--fg-mute)', fontSize: 13, fontStyle: 'italic' }}>Aucun match à venir</div>
          )}
        </div>

        {/* Axes d'amélioration */}
        {weakest.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 14, color: 'var(--fg-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Mes axes d&apos;amélioration
            </div>
            {weakest.map(({ comp, value }) => {
              const grade = value >= 3.5 ? 'A' : value >= 2.5 ? 'B' : value >= 1.5 ? 'C' : 'D'
              return (
                <Link key={comp.id} href={`/competences/${comp.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: `${GRADE_COLORS[grade]}10`,
                    border: `1px solid ${GRADE_COLORS[grade]}25`,
                    borderRadius: 12,
                    padding: '12px 14px',
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: `${GRADE_COLORS[grade]}20`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: GRADE_COLORS[grade], fontSize: 18,
                    }}>
                      <i className={comp.icon}></i>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'white', fontSize: 13 }}>{comp.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--fg-mute)' }}>{comp.category}</div>
                    </div>
                    <span style={{
                      fontFamily: 'var(--display)',
                      fontWeight: 900,
                      fontSize: 18,
                      color: GRADE_COLORS[grade],
                    }}>
                      {grade}
                    </span>
                    <i className="ri-arrow-right-s-line" style={{ color: 'var(--fg-mute)' }}></i>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <BottomNavPlayer active="portail" />
    </>
  )
}
