'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import { COMPETENCES, CATEGORIES, GRADE_COLORS, GRADE_VALUES } from '@/lib/competences'

interface Joueur {
  id: number; prenom: string; nom: string; numero?: number; poste?: string
  capitaine?: boolean; disponible?: boolean; poids?: number; taille?: number; notes_coach?: string
}
interface StatMatch {
  id: number; note_etoiles?: number; plaquages_reussis?: number; metres_parcourus?: number
  essais?: number; passes_decisives?: number; minutes_jouees?: number; appreciation?: string
  matchs?: { adversaire: string; date_match: string }
}
interface Blessure {
  id: number; type_blessure: string; statut: string; date_debut: string
  date_retour_estime?: string; notes_medicales?: string; resolved?: boolean
}
interface Evaluation {
  id: string
  date_eval: string
  match_id?: string
  commentaire?: string
  [key: string]: unknown
  matchs?: { adversaire: string; date_match: string }
}

// SVG Radar Chart component
function RadarChart({ evaluation }: { evaluation: Evaluation }) {
  const size = 200
  const cx = size / 2
  const cy = size / 2
  const r = 75

  const categoryScores = CATEGORIES.map(cat => {
    const comps = COMPETENCES.filter(c => c.category === cat)
    const values = comps
      .map(c => evaluation[c.id] as string | undefined)
      .filter(Boolean)
      .map(g => GRADE_VALUES[g as string] || 0)
    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
    return { cat, score: avg / 4 } // normalize 0-1
  })

  const n = categoryScores.length
  const points = categoryScores.map(({ score }, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    const x = cx + r * score * Math.cos(angle)
    const y = cy + r * score * Math.sin(angle)
    return { x, y }
  })

  const labelPoints = categoryScores.map(({ cat }, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    const labelR = r + 22
    const x = cx + labelR * Math.cos(angle)
    const y = cy + labelR * Math.sin(angle)
    return { x, y, cat }
  })

  // Background grid lines (3 levels)
  const gridLevels = [0.33, 0.66, 1.0]
  const gridPolygons = gridLevels.map(level => {
    const pts = Array.from({ length: n }, (_, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2
      return `${cx + r * level * Math.cos(angle)},${cy + r * level * Math.sin(angle)}`
    }).join(' ')
    return pts
  })

  const polyPoints = points.map(p => `${p.x},${p.y}`).join(' ')

  const gradeColors: Record<string, string> = {
    'Attaque': '#ffd83a',
    'Défense': '#ef4343',
    'Jeu groupé': '#1e3b8a',
    'Physique': '#22c55e',
    'Mental': '#a855f7',
  }

  return (
    <svg width={size + 80} height={size + 40} viewBox={`-40 -20 ${size + 80} ${size + 40}`} style={{ display: 'block', margin: '0 auto' }}>
      {/* Grid polygons */}
      {gridPolygons.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      ))}

      {/* Axis lines */}
      {Array.from({ length: n }, (_, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2
        return (
          <line key={i}
            x1={cx} y1={cy}
            x2={cx + r * Math.cos(angle)}
            y2={cy + r * Math.sin(angle)}
            stroke="rgba(255,255,255,0.1)" strokeWidth="1"
          />
        )
      })}

      {/* Data polygon */}
      <polygon
        points={polyPoints}
        fill="rgba(255,216,58,0.15)"
        stroke="#ffd83a"
        strokeWidth="2"
      />

      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill={gradeColors[categoryScores[i].cat] || '#ffd83a'} />
      ))}

      {/* Labels */}
      {labelPoints.map(({ x, y, cat }, i) => {
        const score = categoryScores[i].score
        const grade = score >= 0.875 ? 'A' : score >= 0.625 ? 'B' : score >= 0.375 ? 'C' : 'D'
        return (
          <g key={cat}>
            <text x={x} y={y - 4} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="9" fontFamily="var(--sans)">
              {cat}
            </text>
            <text x={x} y={y + 8} textAnchor="middle" fill={GRADE_COLORS[grade] || '#ffd83a'} fontSize="10" fontWeight="bold" fontFamily="var(--display)">
              {grade}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function JoueurPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [joueur, setJoueur] = useState<Joueur | null>(null)
  const [stats, setStats] = useState<StatMatch[]>([])
  const [blessures, setBlessures] = useState<Blessure[]>([])
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [activeTab, setActiveTab] = useState('stats')
  const [notes, setNotes] = useState('')
  const [blessureModal, setBlessureModal] = useState(false)
  const [bForm, setBForm] = useState({ type: '', debut: '', retour: '', statut: 'out', notes: '' })

  useEffect(() => { if (id) { loadAll() } }, [id])

  async function loadAll() {
    await Promise.all([loadJoueur(), loadStats(), loadBlessures(), loadEvaluations()])
  }

  async function loadJoueur() {
    const { data } = await supabase.from('joueurs').select('*').eq('id', id).single()
    if (!data) { router.push('/effectif'); return }
    setJoueur(data)
    setNotes(data.notes_coach || '')
  }

  async function loadStats() {
    const { data } = await supabase.from('stats_match').select('*, matchs(adversaire, date_match, score_nous, score_eux)').eq('joueur_id', id).order('created_at', { ascending: false })
    setStats(data || [])
  }

  async function loadBlessures() {
    const { data } = await supabase.from('sante').select('*').eq('joueur_id', id).order('created_at', { ascending: false })
    setBlessures(data || [])
  }

  async function loadEvaluations() {
    const { data } = await supabase.from('evaluations').select('*, matchs(adversaire, date_match)').eq('joueur_id', id).order('created_at', { ascending: false }).limit(5)
    setEvaluations(data || [])
  }

  async function toggleDisponible() {
    if (!joueur) return
    await supabase.from('joueurs').update({ disponible: !joueur.disponible }).eq('id', id)
    await loadJoueur()
  }

  async function saveNotes() {
    await supabase.from('joueurs').update({ notes_coach: notes }).eq('id', id)
    alert('Notes sauvegardées ✅')
  }

  async function saveBlessure() {
    if (!bForm.type || !bForm.debut) { alert('Type et date obligatoires'); return }
    await supabase.from('sante').insert({
      joueur_id: Number(id), type_blessure: bForm.type, date_debut: bForm.debut,
      date_retour_estime: bForm.retour || null, statut: bForm.statut,
      notes_medicales: bForm.notes || null
    })
    setBlessureModal(false)
    setBForm({ type: '', debut: '', retour: '', statut: 'out', notes: '' })
    await loadBlessures()
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

  if (!joueur) return <div style={{ color: 'var(--fg-mute)', padding: 40, textAlign: 'center' }}>Chargement...</div>

  const noted = stats.filter(s => s.note_etoiles)
  const avgNote = noted.length ? noted.reduce((s, m) => s + (m.note_etoiles || 0), 0) / noted.length : null
  const totalPlaquages = stats.reduce((s, m) => s + (m.plaquages_reussis || 0), 0)
  const totalMetres = stats.reduce((s, m) => s + (m.metres_parcourus || 0), 0)
  const totalEssais = stats.reduce((s, m) => s + (m.essais || 0), 0)
  const totalPasses = stats.reduce((s, m) => s + (m.passes_decisives || 0), 0)

  const latestEval = evaluations[0] || null

  return (
    <>
      <div className="hero">
        <div className="hero-bg"></div>
        <div className="hero-top">
          <Link href="/effectif" className="hero-back-btn"><i className="ri-arrow-left-s-line"></i></Link>
          <div className="hero-actions">
            <button className="hero-action-btn" onClick={toggleDisponible} title="Changer disponibilité">
              <i className="ri-edit-line"></i>
            </button>
          </div>
        </div>
        <div className="hero-num">{joueur.numero || ''}</div>
        <div className="hero-pos">#{joueur.numero || '?'} · {joueur.poste || ''}</div>
        <div className="hero-name">
          {joueur.prenom}<br /><em>{joueur.nom}</em>
        </div>
        <div className="hero-tags">
          {joueur.capitaine && <span className="hero-tag captain">⭐ Capitaine</span>}
          <span className={`hero-tag ${joueur.disponible ? 'available' : 'unavailable'}`}>
            {joueur.disponible ? '✓ Disponible' : '✗ Indisponible'}
          </span>
          {joueur.poids && <span className="hero-tag">{joueur.poids} kg</span>}
          {joueur.taille && <span className="hero-tag">{joueur.taille} cm</span>}
        </div>
      </div>

      <div className="segments">
        {['stats', 'matchs', 'eval', 'medical', 'notes'].map(t => (
          <button key={t} className={`segment${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>
            {t === 'medical' ? 'Médical' : t === 'eval' ? 'Éval' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* STATS */}
      <div className={`tab-content${activeTab === 'stats' ? ' active' : ''}`}>
        <div className="stat-grid">
          <div className="stat-tile feature">
            <div className="stat-tile-ico yellow"><i className="ri-star-fill"></i></div>
            <div className="stat-tile-num yellow">{avgNote ? avgNote.toFixed(1) + ' ⭐' : '—'}</div>
            <div className="stat-tile-lbl">Note moyenne</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-ico blue"><i className="ri-shield-line"></i></div>
            <div className="stat-tile-num">{stats.length}</div>
            <div className="stat-tile-lbl">Matchs joués</div>
          </div>
        </div>
        <div className="section-title">Stats saison</div>
        <div className="stats-saison">
          <div className="mini-stat"><div className="mini-stat-ico">🛡️</div><div className="mini-stat-num">{totalPlaquages}</div><div className="mini-stat-lbl">Plaquages réussis</div></div>
          <div className="mini-stat"><div className="mini-stat-ico">🏃</div><div className="mini-stat-num">{totalMetres}</div><div className="mini-stat-lbl">Mètres parcourus</div></div>
          <div className="mini-stat"><div className="mini-stat-ico">🏉</div><div className="mini-stat-num">{totalEssais}</div><div className="mini-stat-lbl">Essais marqués</div></div>
          <div className="mini-stat"><div className="mini-stat-ico">🎯</div><div className="mini-stat-num">{totalPasses}</div><div className="mini-stat-lbl">Passes décisives</div></div>
        </div>
      </div>

      {/* MATCHS */}
      <div className={`tab-content${activeTab === 'matchs' ? ' active' : ''}`}>
        {stats.length === 0 ? <p className="empty">Aucun match enregistré</p> : stats.map(s => {
          const stars = '⭐'.repeat(s.note_etoiles || 0) + '☆'.repeat(5 - (s.note_etoiles || 0))
          const date = s.matchs?.date_match ? new Date(s.matchs.date_match).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''
          return (
            <div key={s.id} className="match-entry">
              <div className="match-entry-top">
                <div className="match-entry-vs">vs {s.matchs?.adversaire || '?'} <span style={{ color: 'var(--fg-mute)', fontWeight: 400, fontSize: 11 }}>{date}</span></div>
                <div className="stars">{stars}</div>
              </div>
              <div className="match-entry-stats">
                <div className="match-entry-stat">Plaquages <span>{s.plaquages_reussis || 0}</span></div>
                <div className="match-entry-stat">Essais <span>{s.essais || 0}</span></div>
                <div className="match-entry-stat">Mètres <span>{s.metres_parcourus || 0}</span></div>
                <div className="match-entry-stat">Min <span>{s.minutes_jouees || 0}&apos;</span></div>
              </div>
              {s.appreciation && <div className="match-entry-note">&quot;{s.appreciation}&quot;</div>}
            </div>
          )
        })}
      </div>

      {/* ÉVALUATIONS */}
      <div className={`tab-content${activeTab === 'eval' ? ' active' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="section-title" style={{ margin: 0 }}>Profil de performance</div>
          <Link href={`/evaluations/${id}`} style={{
            background: 'var(--yellow)', color: 'var(--bg)',
            borderRadius: 10, padding: '7px 14px',
            fontFamily: 'var(--display)', fontSize: 12, fontWeight: 800,
            textDecoration: 'none',
          }}>
            + Évaluer
          </Link>
        </div>

        {latestEval ? (
          <>
            {/* Radar chart */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: '16px 8px',
              marginBottom: 20,
            }}>
              <div style={{ fontSize: 12, color: 'var(--fg-mute)', textAlign: 'center', marginBottom: 12 }}>
                Dernière évaluation — {new Date(latestEval.date_eval).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <RadarChart evaluation={latestEval} />
              {/* Legend */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 10 }}>
                {(['A', 'B', 'C', 'D'] as const).map(g => (
                  <span key={g} style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 11, color: GRADE_COLORS[g]
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: GRADE_COLORS[g], display: 'inline-block' }}></span>
                    {g} = {g === 'A' ? 'Excellent' : g === 'B' ? 'Bon' : g === 'C' ? 'Moyen' : 'À améliorer'}
                  </span>
                ))}
              </div>
            </div>

            {/* Category summary for latest eval */}
            <div className="section-title">Résumé par catégorie</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 20 }}>
              {CATEGORIES.map(cat => {
                const grade = getCategoryAvgGrade(latestEval, cat)
                return (
                  <div key={cat} style={{
                    background: grade ? `${GRADE_COLORS[grade]}15` : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${grade ? GRADE_COLORS[grade] + '30' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 12,
                    padding: '10px 6px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--display)', color: grade ? GRADE_COLORS[grade] : 'var(--fg-mute)' }}>
                      {grade || '—'}
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--fg-mute)', marginTop: 3, lineHeight: 1.2 }}>
                      {cat === 'Jeu groupé' ? 'J.G.' : cat}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Recent evaluations table */}
            <div className="section-title">Historique des évaluations</div>
            {evaluations.map(ev => {
              const date = new Date(ev.date_eval).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: '2-digit' })
              const matchName = ev.matchs ? `vs ${(ev.matchs as { adversaire: string }).adversaire}` : 'Sans match'
              return (
                <div key={ev.id} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  padding: '12px 14px',
                  marginBottom: 8,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{date}</div>
                      <div style={{ fontSize: 11, color: 'var(--fg-mute)' }}>{matchName}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {CATEGORIES.map(cat => {
                      const g = getCategoryAvgGrade(ev, cat)
                      return g ? (
                        <span key={cat} style={{
                          background: `${GRADE_COLORS[g]}20`,
                          color: GRADE_COLORS[g],
                          border: `1px solid ${GRADE_COLORS[g]}40`,
                          borderRadius: 6,
                          padding: '2px 8px',
                          fontSize: 12,
                          fontWeight: 700,
                          fontFamily: 'var(--display)',
                        }}>
                          {cat === 'Jeu groupé' ? 'J.G.' : cat.substring(0, 3)} {g}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>
              )
            })}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
            <p style={{ color: 'var(--fg-mute)', fontSize: 14, marginBottom: 20 }}>
              Aucune évaluation pour ce joueur
            </p>
            <Link href={`/evaluations/${id}`} style={{
              background: 'var(--yellow)',
              color: '#0a0e15',
              borderRadius: 12,
              padding: '12px 24px',
              fontFamily: 'var(--display)',
              fontSize: 14,
              fontWeight: 900,
              textDecoration: 'none',
            }}>
              Créer une évaluation
            </Link>
          </div>
        )}
      </div>

      {/* MÉDICAL */}
      <div className={`tab-content${activeTab === 'medical' ? ' active' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="section-title" style={{ margin: 0, flex: 1 }}>Blessures</div>
          <button onClick={() => setBlessureModal(true)} style={{ background: 'var(--yellow)', color: 'var(--bg)', border: 'none', borderRadius: 8, padding: '7px 14px', fontFamily: 'var(--display)', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>+ Ajouter</button>
        </div>
        {blessures.length === 0 ? <p className="empty">Aucune blessure enregistrée 💪</p> : blessures.map(b => {
          const debut = new Date(b.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
          const retour = b.date_retour_estime ? new Date(b.date_retour_estime).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '?'
          return (
            <div key={b.id} className="blessure-card-j">
              <div className="blessure-top">
                <div className="blessure-type-j">{b.type_blessure}</div>
                <span className={`statut-badge statut-${b.statut}`}>{b.statut.toUpperCase()}</span>
              </div>
              <div className="blessure-dates">📅 Depuis le {debut} · Retour : {retour}</div>
              {b.notes_medicales && <div style={{ fontSize: 12, color: 'var(--fg-mute)', marginTop: 6, fontStyle: 'italic' }}>{b.notes_medicales}</div>}
            </div>
          )
        })}
      </div>

      {/* NOTES */}
      <div className={`tab-content${activeTab === 'notes' ? ' active' : ''}`}>
        <div className="section-title">Notes du coach</div>
        <textarea className="notes-area" placeholder="Observations, points à travailler, comportement en match..." value={notes} onChange={e => setNotes(e.target.value)} />
        <button className="save-btn" onClick={saveNotes}>Sauvegarder</button>
      </div>

      {/* MODAL BLESSURE */}
      <div className={`modal-overlay${blessureModal ? ' open' : ''}`}>
        <div className="modal">
          <div className="modal-handle"></div>
          <div className="modal-title">Nouvelle blessure</div>
          <label className="field-label">Type de blessure *</label>
          <input className="field-input" placeholder="Ex: Entorse cheville" value={bForm.type} onChange={e => setBForm(f => ({ ...f, type: e.target.value }))} />
          <label className="field-label">Date début *</label>
          <input className="field-input" type="date" value={bForm.debut} onChange={e => setBForm(f => ({ ...f, debut: e.target.value }))} />
          <label className="field-label">Retour estimé</label>
          <input className="field-input" type="date" value={bForm.retour} onChange={e => setBForm(f => ({ ...f, retour: e.target.value }))} />
          <label className="field-label">Statut</label>
          <select className="field-input" value={bForm.statut} onChange={e => setBForm(f => ({ ...f, statut: e.target.value }))}>
            <option value="out">Forfait (Out)</option>
            <option value="incertain">Incertain</option>
            <option value="fit">Fit</option>
          </select>
          <label className="field-label">Notes médicales</label>
          <textarea className="field-input" rows={2} placeholder="Observations..." value={bForm.notes} onChange={e => setBForm(f => ({ ...f, notes: e.target.value }))} />
          <div className="modal-actions">
            <button className="btn-cancel" onClick={() => setBlessureModal(false)}>Annuler</button>
            <button className="btn-save" onClick={saveBlessure}>Enregistrer</button>
          </div>
        </div>
      </div>

      <BottomNav active="effectif" />
    </>
  )
}
