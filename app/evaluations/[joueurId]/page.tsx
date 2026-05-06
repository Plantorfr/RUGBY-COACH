'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import { COMPETENCES, CATEGORIES } from '@/lib/competences'
import { GradeButtonGroup } from '@/components/ui'

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
}

type Grades = Record<string, string>

export default function EvaluationPage() {
  const { joueurId } = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [joueur, setJoueur] = useState<Joueur | null>(null)
  const [matchs, setMatchs] = useState<Match[]>([])
  const [selectedMatch, setSelectedMatch] = useState<string>('')
  const [dateEval, setDateEval] = useState(new Date().toISOString().split('T')[0])
  const [grades, setGrades] = useState<Grades>({})
  const [commentaire, setCommentaire] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    if (joueurId) load()
  }, [joueurId])

  async function load() {
    setLoading(true)
    const [{ data: joueurData }, { data: matchsData }, { data: lastEval }] = await Promise.all([
      supabase.from('joueurs').select('*').eq('id', joueurId).single(),
      supabase.from('matchs').select('id, adversaire, date_match').order('date_match', { ascending: false }).limit(10),
      supabase.from('evaluations').select('*').eq('joueur_id', joueurId).order('created_at', { ascending: false }).limit(1).single(),
    ])

    if (!joueurData) { router.push('/effectif'); return }
    setJoueur(joueurData)
    setMatchs(matchsData || [])

    if (lastEval) {
      const prefilled: Grades = {}
      COMPETENCES.forEach(c => {
        if (lastEval[c.id]) prefilled[c.id] = lastEval[c.id]
      })
      setGrades(prefilled)
      setCommentaire(lastEval.commentaire || '')
    }

    setLoading(false)
  }

  function setGrade(compId: string, grade: string) {
    setGrades(prev => ({ ...prev, [compId]: grade }))
  }

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const payload: Record<string, unknown> = {
      joueur_id: joueurId,
      match_id: selectedMatch || null,
      date_eval: dateEval,
      coach_id: user?.id || null,
      commentaire: commentaire || null,
    }
    COMPETENCES.forEach(c => {
      payload[c.id] = grades[c.id] || null
    })

    const { error } = await supabase.from('evaluations').insert(payload)
    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  if (loading) return (
    <div style={{ color: 'var(--fg-mute)', padding: 40, textAlign: 'center' }}>
      Chargement...
    </div>
  )

  return (
    <>
      <div className="appbar">
        <Link href={`/joueur/${joueurId}`} className="back-btn">
          <i className="ri-arrow-left-s-line"></i>
        </Link>
        <div style={{ flex: 1 }}>
          <div className="appbar-greet">Évaluation</div>
          <div className="appbar-team">{joueur?.prenom} {joueur?.nom}</div>
        </div>
      </div>

      {saved && (
        <div style={{
          margin: '0 18px 16px',
          background: 'rgba(34,197,94,0.15)',
          border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: 12,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: '#22c55e',
          fontSize: 14,
          fontWeight: 600,
        }}>
          <i className="ri-checkbox-circle-fill"></i>
          Évaluation sauvegardée !
          <Link href={`/joueur/${joueurId}`} style={{ marginLeft: 'auto', color: '#22c55e', fontSize: 12 }}>
            Voir le profil →
          </Link>
        </div>
      )}

      <div style={{ padding: '0 18px' }}>
        {/* Match & date selectors */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          padding: 16,
          marginBottom: 20,
        }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--fg-mute)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Match associé
            </label>
            <select
              value={selectedMatch}
              onChange={e => setSelectedMatch(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 10,
                padding: '10px 12px',
                color: 'white',
                fontSize: 14,
              }}
            >
              <option value="">Aucun match spécifique</option>
              {matchs.map(m => (
                <option key={m.id} value={m.id}>
                  vs {m.adversaire} — {new Date(m.date_match).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--fg-mute)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Date de l&apos;évaluation
            </label>
            <input
              type="date"
              value={dateEval}
              onChange={e => setDateEval(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 10,
                padding: '10px 12px',
                color: 'white',
                fontSize: 14,
              }}
            />
          </div>
        </div>

        {/* Competences by category */}
        {CATEGORIES.map(cat => {
          const comps = COMPETENCES.filter(c => c.category === cat)
          return (
            <div key={cat} style={{ marginBottom: 24 }}>
              <div style={{
                fontFamily: 'var(--display)',
                fontSize: 16,
                fontWeight: 800,
                color: 'white',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <span style={{
                  width: 4,
                  height: 18,
                  background: 'var(--yellow)',
                  borderRadius: 2,
                  display: 'inline-block',
                }}></span>
                {cat}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {comps.map(comp => (
                  <div key={comp.id} style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 14,
                    padding: '12px 14px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <i className={comp.icon} style={{ fontSize: 16, color: 'var(--yellow)' }}></i>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>{comp.name}</span>
                      </div>
                      <Link href={`/competences/${comp.id}`} target="_blank" style={{
                        width: 26, height: 26, borderRadius: 8,
                        background: 'rgba(255,255,255,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--fg-mute)', fontSize: 13, textDecoration: 'none',
                      }}>
                        <i className="ri-external-link-line"></i>
                      </Link>
                    </div>
                    <GradeButtonGroup
                      value={grades[comp.id]}
                      onChange={grade => setGrade(comp.id, grade)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Commentaire */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--fg-mute)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Commentaire général
          </label>
          <textarea
            value={commentaire}
            onChange={e => setCommentaire(e.target.value)}
            placeholder="Observations générales sur le joueur..."
            rows={4}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 12,
              padding: '12px 14px',
              color: 'white',
              fontSize: 14,
              resize: 'none',
            }}
          />
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%',
            background: 'var(--yellow)',
            color: '#0a0e15',
            border: 'none',
            borderRadius: 14,
            padding: '15px',
            fontFamily: 'var(--display)',
            fontSize: 16,
            fontWeight: 900,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 30,
          }}
        >
          {saving ? (
            <><i className="ri-loader-4-line"></i> Sauvegarde...</>
          ) : (
            <><i className="ri-save-line"></i> Enregistrer l&apos;évaluation</>
          )}
        </button>
      </div>

      <BottomNav active="effectif" />
    </>
  )
}
