'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import { COMPETENCES, CATEGORIES } from '@/lib/competences'
import { GradeButtonGroup } from '@/components/ui'

interface Match {
  id: number; adversaire: string; date_match: string; lieu: string
  competition?: string; statut: string; score_nous?: number; score_eux?: number; rapport?: string
}
interface Joueur {
  id: number; prenom: string; nom: string; numero?: number; poste?: string
}
interface StatData {
  aJoue?: boolean; minutes_jouees?: number; essais?: number; transformations?: number
  passes_decisives?: number; plaquages_reussis?: number; plaquages_manques?: number
  metres_parcourus?: number; carton_jaune?: boolean; carton_rouge?: boolean
  note_etoiles?: number; appreciation?: string; essaisMinutes?: string[]
}

export default function MatchsPage() {
  const supabase = createClient()
  const [matchs, setMatchs] = useState<Match[]>([])
  const [joueurs, setJoueurs] = useState<Joueur[]>([])
  const [tab, setTab] = useState<'avenir' | 'joues'>('avenir')
  const [bilanScore, setBilanScore] = useState('—')
  const [bilanDesc, setBilanDesc] = useState('Aucun match joué')

  // Modal nouveau match
  const [matchModal, setMatchModal] = useState(false)
  const [mForm, setMForm] = useState({ adversaire: '', date: '', lieu: 'domicile', competition: '' })

  // Modal stats
  const [statsModal, setStatsModal] = useState(false)
  const [statsMatchId, setStatsMatchId] = useState<number | null>(null)
  const [statsMatchAdversaire, setStatsMatchAdversaire] = useState('')
  const [etape, setEtape] = useState(1)
  const [scoreNous, setScoreNous] = useState(0)
  const [scoreEux, setScoreEux] = useState(0)
  const [rapport, setRapport] = useState('')
  const [joueurIndex, setJoueurIndex] = useState(0)
  const [allStats, setAllStats] = useState<Record<number, StatData>>({})
  const [currentNote, setCurrentNote] = useState(0)
  const [allEvals, setAllEvals] = useState<Record<number, Record<string, string>>>({})
  const [showComps, setShowComps] = useState(false)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const { data: j } = await supabase.from('joueurs').select('*').eq('archive', false).order('numero')
    setJoueurs(j || [])
    await loadMatchs()
  }

  async function loadMatchs() {
    const { data } = await supabase.from('matchs').select('*').order('date_match', { ascending: false })
    const all = data || []
    setMatchs(all)
    const joues = all.filter((m: Match) => m.statut === 'joue')
    if (joues.length > 0) {
      const V = joues.filter((m: Match) => (m.score_nous ?? 0) > (m.score_eux ?? 0)).length
      const D = joues.filter((m: Match) => (m.score_nous ?? 0) < (m.score_eux ?? 0)).length
      const N = joues.filter((m: Match) => m.score_nous === m.score_eux).length
      setBilanScore(`${V}–${D}–${N}`)
      setBilanDesc(`${joues.length} matchs joués · ${V} victoires cette saison`)
    }
  }

  async function saveMatch() {
    if (!mForm.adversaire || !mForm.date) { alert('Adversaire et date obligatoires'); return }
    await supabase.from('matchs').insert({ adversaire: mForm.adversaire, date_match: mForm.date, lieu: mForm.lieu, competition: mForm.competition || null, statut: 'a_venir' })
    setMatchModal(false)
    setMForm({ adversaire: '', date: '', lieu: 'domicile', competition: '' })
    await loadMatchs()
  }

  function openStatsModal(matchId: number, adversaire: string) {
    setStatsMatchId(matchId); setStatsMatchAdversaire(adversaire)
    setEtape(1); setScoreNous(0); setScoreEux(0); setRapport('')
    setJoueurIndex(0); setAllStats({}); setCurrentNote(0)
    setAllEvals({}); setShowComps(false)
    setStatsModal(true)
  }

  function closeStatsModal() {
    setStatsModal(false); setEtape(1)
  }

  function saveCurrentJoueur(idx: number, note: number) {
    const j = joueurs[idx]
    if (!j) return
    setAllStats(prev => ({
      ...prev,
      [j.id]: {
        ...(prev[j.id] || {}),
        note_etoiles: note,
        aJoue: (prev[j.id]?.aJoue) !== false,
      }
    }))
  }

  function setEval(joueurId: number, compId: string, grade: string) {
    setAllEvals(prev => ({
      ...prev,
      [joueurId]: { ...(prev[joueurId] || {}), [compId]: grade }
    }))
  }

  async function saveAllStats() {
    if (!statsMatchId) return
    await supabase.from('matchs').update({
      score_nous: scoreNous, score_eux: scoreEux,
      rapport: rapport || null, statut: 'joue'
    }).eq('id', statsMatchId)

    await supabase.from('stats_match').delete().eq('match_id', statsMatchId)

    const inserts = Object.entries(allStats)
      .filter(([, s]) => s.aJoue !== false)
      .map(([joueur_id, s]) => ({
        joueur_id: parseInt(joueur_id), match_id: statsMatchId,
        minutes_jouees: s.minutes_jouees ?? 80,
        essais: s.essais ?? 0, transformations: s.transformations ?? 0,
        passes_decisives: s.passes_decisives ?? 0,
        plaquages_reussis: s.plaquages_reussis ?? 0,
        plaquages_manques: s.plaquages_manques ?? 0,
        metres_parcourus: s.metres_parcourus ?? 0,
        carton_jaune: s.carton_jaune ?? false,
        carton_rouge: s.carton_rouge ?? false,
        note_etoiles: s.note_etoiles ?? null,
        appreciation: s.appreciation ?? null,
      }))

    if (inserts.length > 0) await supabase.from('stats_match').insert(inserts)

    // Save evaluations (A/B/C/D) for each player
    const evalInserts = Object.entries(allEvals)
      .filter(([joueur_id]) => allStats[parseInt(joueur_id)]?.aJoue !== false)
      .map(([joueur_id, grades]) => ({
        joueur_id: parseInt(joueur_id),
        match_id: statsMatchId,
        date_eval: new Date().toISOString().split('T')[0],
        ...grades,
      }))

    if (evalInserts.length > 0) {
      await supabase.from('evaluations').delete().eq('match_id', statsMatchId)
      await supabase.from('evaluations').insert(evalInserts)
    }

    alert('✅ Match, stats et évaluations enregistrés !')
    closeStatsModal()
    await loadMatchs()
  }

  const filtered = matchs.filter(m => tab === 'avenir' ? m.statut === 'a_venir' : m.statut === 'joue')
  const curJoueur = joueurs[joueurIndex]
  const curStats: StatData = (curJoueur && allStats[curJoueur.id]) || {}
  const aJoue = curStats.aJoue !== false
  const pct = joueurs.length > 0 ? Math.round(((joueurIndex + 1) / joueurs.length) * 100) : 0

  function updateStat(key: keyof StatData, delta: number) {
    if (!curJoueur) return
    const def = key === 'minutes_jouees' ? 80 : 0
    const cur = (curStats[key] as number) ?? def
    setAllStats(prev => ({ ...prev, [curJoueur.id]: { ...(prev[curJoueur.id] || {}), [key]: Math.max(0, cur + delta) } }))
  }

  function setStat(key: keyof StatData, value: boolean | string | number) {
    if (!curJoueur) return
    setAllStats(prev => ({ ...prev, [curJoueur.id]: { ...(prev[curJoueur.id] || {}), [key]: value } }))
  }

  function nextJoueur() {
    if (joueurIndex === joueurs.length - 1) { saveAllStats(); return }
    setJoueurIndex(i => i + 1)
    setCurrentNote(allStats[joueurs[joueurIndex + 1]?.id]?.note_etoiles ?? 0)
  }

  function prevJoueur() {
    if (joueurIndex === 0) return
    setJoueurIndex(i => i - 1)
    setCurrentNote(allStats[joueurs[joueurIndex - 1]?.id]?.note_etoiles ?? 0)
  }

  return (
    <>
      <div className="appbar">
        <Link href="/dashboard" className="back-btn"><i className="ri-arrow-left-s-line"></i></Link>
        <h1>Matchs</h1>
        <button className="add-btn" onClick={() => setMatchModal(true)}><i className="ri-add-line"></i> Match</button>
      </div>

      <div className="poster" style={{ margin: '0 18px 20px' }}>
        <div className="poster-kicker">Bilan saison 2025/26</div>
        <div className="poster-num">{bilanScore}</div>
        <div className="poster-cap">{bilanDesc}</div>
      </div>

      <div className="segments">
        <button className={`segment${tab === 'avenir' ? ' active' : ''}`} onClick={() => setTab('avenir')}>À venir</button>
        <button className={`segment${tab === 'joues' ? ' active' : ''}`} onClick={() => setTab('joues')}>Joués</button>
      </div>

      <div className="list">
        {filtered.length === 0 ? (
          <p className="empty">{tab === 'avenir' ? 'Aucun match à venir — ajoute le prochain !' : 'Aucun match joué'}</p>
        ) : tab === 'avenir' ? (
          filtered.map(m => {
            const date = new Date(m.date_match).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
            return (
              <div key={m.id} className="match-hero">
                <div className="match-hero-bg"></div>
                <div className="match-hero-inner">
                  {m.competition && <div style={{ fontFamily: 'var(--display)', fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,216,58,0.7)', marginBottom: 8 }}>{m.competition}</div>}
                  <div className="match-tag"><i className="ri-time-line"></i> À venir</div>
                  <div className="match-teams">
                    <div className="match-team"><div className="match-crest home">RCA</div><div className="match-name">RCACP</div></div>
                    <div className="match-vs">VS</div>
                    <div className="match-team"><div className="match-crest">{m.adversaire.substring(0, 3).toUpperCase()}</div><div className="match-name">{m.adversaire}</div></div>
                  </div>
                  <div className="match-meta-row"><i className="ri-calendar-line"></i> {date} <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'currentColor', opacity: 0.5, display: 'inline-block' }}></span> {m.lieu}</div>
                  <button className="match-cta-btn" onClick={() => openStatsModal(m.id, m.adversaire)}><i className="ri-edit-2-line"></i> Saisir le résultat</button>
                </div>
              </div>
            )
          })
        ) : (
          filtered.map(m => {
            const win = (m.score_nous ?? 0) > (m.score_eux ?? 0)
            const nul = m.score_nous === m.score_eux
            const date = new Date(m.date_match).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })
            return (
              <div key={m.id} className="match-card">
                {m.competition && <div className="match-card-competition">{m.competition}</div>}
                <div className="match-card-top">
                  <div className="match-card-vs">vs {m.adversaire}</div>
                  <span className={`result-badge ${win ? 'win' : nul ? 'nul' : 'loss'}`}>{win ? 'VICTOIRE' : nul ? 'NUL' : 'DÉFAITE'}</span>
                </div>
                <div className="match-score">
                  <span className="score-nous">{m.score_nous ?? '?'}</span>
                  <span className="score-sep">–</span>
                  <span className="score-eux">{m.score_eux ?? '?'}</span>
                </div>
                <div className="match-card-meta">{date} · {m.lieu}</div>
                <button className="edit-match-btn" onClick={() => openStatsModal(m.id, m.adversaire)}><i className="ri-edit-line"></i> Modifier les stats</button>
              </div>
            )
          })
        )}
      </div>

      {/* MODAL NOUVEAU MATCH */}
      <div className={`modal-overlay${matchModal ? ' open' : ''}`}>
        <div className="modal">
          <div className="modal-handle"></div>
          <div className="modal-title">Nouveau match</div>
          <label className="field-label">Adversaire *</label>
          <input className="field-input" placeholder="Ex: Pontoise RC" value={mForm.adversaire} onChange={e => setMForm(f => ({ ...f, adversaire: e.target.value }))} />
          <label className="field-label">Date *</label>
          <input className="field-input" type="date" value={mForm.date} onChange={e => setMForm(f => ({ ...f, date: e.target.value }))} />
          <label className="field-label">Lieu</label>
          <select className="field-input" value={mForm.lieu} onChange={e => setMForm(f => ({ ...f, lieu: e.target.value }))}>
            <option value="domicile">Domicile</option>
            <option value="exterieur">Extérieur</option>
          </select>
          <label className="field-label">Compétition</label>
          <input className="field-input" placeholder="Ex: Championnat Fédérale 3" value={mForm.competition} onChange={e => setMForm(f => ({ ...f, competition: e.target.value }))} />
          <div className="modal-actions">
            <button className="btn-cancel" onClick={() => setMatchModal(false)}>Annuler</button>
            <button className="btn-save" onClick={saveMatch}>Enregistrer</button>
          </div>
        </div>
      </div>

      {/* MODAL STATS */}
      <div className={`modal-overlay${statsModal ? ' open' : ''}`} style={{ display: statsModal ? 'flex' : 'none' }}>
        <div className="stats-modal">

          {/* ÉTAPE 1 */}
          {etape === 1 && (
            <div>
              <div className="stats-hd">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="stats-hd-meta">Saisie du résultat</div>
                    <div className="stats-hd-title">vs {statsMatchAdversaire}</div>
                  </div>
                  <button onClick={closeStatsModal} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', width: 36, height: 36, borderRadius: 10, fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}><i className="ri-close-line"></i></button>
                </div>
              </div>
              <div className="etape-title">Étape 1 / 2 — Score</div>
              <div className="score-saisie">
                <div className="score-team">
                  <div className="score-team-name">RCACP</div>
                  <input className="score-input" type="number" min={0} value={scoreNous} onChange={e => setScoreNous(Number(e.target.value))} />
                </div>
                <div className="score-vs">–</div>
                <div className="score-team">
                  <div className="score-team-name">{statsMatchAdversaire}</div>
                  <input className="score-input" type="number" min={0} value={scoreEux} onChange={e => setScoreEux(Number(e.target.value))} />
                </div>
              </div>
              <div style={{ padding: '0 18px 16px' }}>
                <label className="field-label" style={{ marginTop: 16 }}>Rapport du coach</label>
                <textarea className="field-input" rows={2} placeholder="Analyse du match..." value={rapport} onChange={e => setRapport(e.target.value)} />
                <div className="modal-actions">
                  <button className="btn-cancel" onClick={closeStatsModal}>Annuler</button>
                  <button className="btn-save" onClick={() => { setEtape(2); setJoueurIndex(0); setCurrentNote(0) }}>Stats joueurs →</button>
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 2 */}
          {etape === 2 && curJoueur && (
            <div>
              <div className="stats-hd">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <div className="stats-hd-meta">Joueur {joueurIndex + 1} / {joueurs.length}</div>
                    <div className="stats-hd-title">Stats joueur</div>
                  </div>
                  <button onClick={closeStatsModal} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', width: 36, height: 36, borderRadius: 10, fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}><i className="ri-close-line"></i></button>
                </div>
                <div className="stats-progress">
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }}></div></div>
                  <div className="progress-num">{pct}%</div>
                </div>
              </div>

              <div className="stats-player">
                <div className="stats-avatar">{curJoueur.prenom.charAt(0)}{curJoueur.nom.charAt(0)}</div>
                <div>
                  <div className="stats-player-name">{curJoueur.prenom} {curJoueur.nom}</div>
                  <div className="stats-player-meta">#{curJoueur.numero || '?'} · {curJoueur.poste || ''}</div>
                </div>
              </div>

              <div className="toggle-row">
                <div>
                  <div className="toggle-label">A joué ce match</div>
                  <div className="toggle-sub">Désactiver si absent</div>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={aJoue} onChange={e => setStat('aJoue', e.target.checked)} />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div style={{ opacity: aJoue ? 1 : 0.3, pointerEvents: aJoue ? 'auto' : 'none' }}>
                {([
                  { key: 'minutes_jouees', label: 'Minutes jouées', step: 1, def: 80 },
                  { key: 'essais', label: 'Essais', step: 1, def: 0 },
                  { key: 'transformations', label: 'Transformations', step: 1, def: 0 },
                  { key: 'passes_decisives', label: 'Passes décisives', step: 1, def: 0 },
                  { key: 'plaquages_reussis', label: 'Plaquages réussis', step: 1, def: 0 },
                  { key: 'plaquages_manques', label: 'Plaquages manqués', step: 1, def: 0 },
                  { key: 'metres_parcourus', label: 'Mètres parcourus', step: 5, def: 0 },
                ] as const).map(({ key, label, step }) => (
                  <div key={key} className="stepper-row">
                    <div className="stepper-lbl">{label}</div>
                    <div className="stepper">
                      <button className="stepper-btn" onClick={() => updateStat(key, -step)}>−</button>
                      <div className="stepper-val">{(curStats[key] as number) ?? (key === 'minutes_jouees' ? 80 : 0)}</div>
                      <button className="stepper-btn" onClick={() => updateStat(key, step)}>+</button>
                    </div>
                  </div>
                ))}

                <div className="stepper-row">
                  <div className="stepper-lbl">Carton jaune</div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={curStats.carton_jaune || false} onChange={e => setStat('carton_jaune', e.target.checked)} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="stepper-row">
                  <div className="stepper-lbl">Carton rouge</div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={curStats.carton_rouge || false} onChange={e => setStat('carton_rouge', e.target.checked)} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="stars-row">
                  <div style={{ fontFamily: 'var(--display)', fontSize: 13, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Note coach</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <span key={n} className={`star-btn${currentNote >= n ? ' active' : ''}`} onClick={() => { setCurrentNote(n); setStat('note_etoiles', n) }}>⭐</span>
                    ))}
                  </div>
                </div>
                <textarea
                  className="appreciation-input" rows={2} placeholder="Appréciation du coach..."
                  value={curStats.appreciation || ''}
                  onChange={e => setStat('appreciation', e.target.value)}
                />

                {/* SECTION COMPÉTENCES A/B/C/D */}
                <div style={{ margin: '16px 18px 0' }}>
                  <button
                    onClick={() => setShowComps(v => !v)}
                    style={{
                      width: '100%', background: 'rgba(255,216,58,0.1)',
                      border: '1px solid rgba(255,216,58,0.3)', borderRadius: 12,
                      padding: '10px 14px', color: '#ffd83a',
                      fontFamily: 'var(--display)', fontWeight: 800, fontSize: 13,
                      cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}
                  >
                    <span><i className="ri-bar-chart-grouped-line" style={{ marginRight: 8 }}></i>Évaluation compétences</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {Object.keys(allEvals[curJoueur?.id] || {}).length > 0 && (
                        <span style={{ background: '#ffd83a', color: '#0a0e15', borderRadius: 8, padding: '2px 8px', fontSize: 11, fontWeight: 900 }}>
                          {Object.keys(allEvals[curJoueur?.id] || {}).length}/22
                        </span>
                      )}
                      <i className={showComps ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}></i>
                    </span>
                  </button>

                  {showComps && curJoueur && (
                    <div style={{ marginTop: 12 }}>
                      {CATEGORIES.map(cat => (
                        <div key={cat} style={{ marginBottom: 16 }}>
                          <div style={{
                            fontFamily: 'var(--display)', fontSize: 11, fontWeight: 900,
                            letterSpacing: '0.1em', textTransform: 'uppercase',
                            color: 'rgba(255,216,58,0.7)', marginBottom: 8,
                          }}>{cat}</div>
                          {COMPETENCES.filter(c => c.category === cat).map(comp => {
                            const grade = allEvals[curJoueur.id]?.[comp.id]
                            return (
                              <div key={comp.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                              }}>
                                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', flex: 1 }}>{comp.name}</span>
                                <GradeButtonGroup
                                  value={grade}
                                  onChange={g => setEval(curJoueur.id, comp.id, g)}
                                />
                              </div>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="nav-joueur">
                <button className="btn-prev" onClick={prevJoueur} disabled={joueurIndex === 0}><i className="ri-arrow-left-s-line"></i> Préc.</button>
                <button className="btn-next" onClick={nextJoueur}>
                  {joueurIndex === joueurs.length - 1 ? '✅ Terminer' : <>Joueur suivant <i className="ri-arrow-right-s-line"></i></>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNav active="matchs" fabAction={() => setMatchModal(true)} />
    </>
  )
}
