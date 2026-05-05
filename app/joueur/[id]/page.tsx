'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

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

export default function JoueurPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [joueur, setJoueur] = useState<Joueur | null>(null)
  const [stats, setStats] = useState<StatMatch[]>([])
  const [blessures, setBlessures] = useState<Blessure[]>([])
  const [activeTab, setActiveTab] = useState('stats')
  const [notes, setNotes] = useState('')
  const [blessureModal, setBlessureModal] = useState(false)
  const [bForm, setBForm] = useState({ type: '', debut: '', retour: '', statut: 'out', notes: '' })

  useEffect(() => { if (id) { loadAll() } }, [id])

  async function loadAll() {
    await Promise.all([loadJoueur(), loadStats(), loadBlessures()])
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

  if (!joueur) return <div style={{ color: 'var(--fg-mute)', padding: 40, textAlign: 'center' }}>Chargement...</div>

  const noted = stats.filter(s => s.note_etoiles)
  const avgNote = noted.length ? noted.reduce((s, m) => s + (m.note_etoiles || 0), 0) / noted.length : null
  const totalPlaquages = stats.reduce((s, m) => s + (m.plaquages_reussis || 0), 0)
  const totalMetres = stats.reduce((s, m) => s + (m.metres_parcourus || 0), 0)
  const totalEssais = stats.reduce((s, m) => s + (m.essais || 0), 0)
  const totalPasses = stats.reduce((s, m) => s + (m.passes_decisives || 0), 0)

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
        {['stats', 'matchs', 'medical', 'notes'].map(t => (
          <button key={t} className={`segment${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>
            {t === 'medical' ? 'Médical' : t.charAt(0).toUpperCase() + t.slice(1)}
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
