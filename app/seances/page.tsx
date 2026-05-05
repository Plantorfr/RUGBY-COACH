'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

interface Joueur { id: number; prenom: string; nom: string; numero?: number }
interface Seance {
  id: number; titre: string; type: string; date: string
  duree?: number; objectifs?: string; notes?: string; presences?: string
}

export default function SeancesPage() {
  const supabase = createClient()
  const [seances, setSeances] = useState<Seance[]>([])
  const [joueurs, setJoueurs] = useState<Joueur[]>([])
  const [nbSeances, setNbSeances] = useState(0)
  const [nbHeures, setNbHeures] = useState('0h')
  const [nbMois, setNbMois] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [presenceChecked, setPresenceChecked] = useState<Set<number>>(new Set())
  const [form, setForm] = useState({ titre: '', type: 'physique', date: '', duree: '', objectifs: '', notes: '' })

  useEffect(() => {
    loadJoueurs()
    loadSeances()
  }, [])

  async function loadJoueurs() {
    const { data } = await supabase.from('joueurs').select('*').eq('archive', false).order('numero')
    setJoueurs(data || [])
  }

  async function loadSeances() {
    const { data } = await supabase.from('seances').select('*').order('date', { ascending: false })
    const all = data || []
    setSeances(all)
    setNbSeances(all.length)
    const totalMin = all.reduce((s: number, x: Seance) => s + (x.duree || 0), 0)
    setNbHeures(Math.round(totalMin / 60) + 'h')
    const now = new Date()
    setNbMois(all.filter((s: Seance) => {
      const d = new Date(s.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length)
  }

  function openModal() {
    setPresenceChecked(new Set())
    setForm({ titre: '', type: 'physique', date: '', duree: '', objectifs: '', notes: '' })
    setModalOpen(true)
  }

  function togglePresence(id: number) {
    setPresenceChecked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function saveSeance() {
    if (!form.titre || !form.date) { alert('Titre et date obligatoires'); return }
    const presences = JSON.stringify(Array.from(presenceChecked))
    const { error } = await supabase.from('seances').insert({
      titre: form.titre, type: form.type, date: form.date,
      duree: form.duree ? parseInt(form.duree) : null,
      objectifs: form.objectifs || null, notes: form.notes || null, presences
    })
    if (error) { alert('Erreur : ' + error.message); return }
    setModalOpen(false)
    await loadSeances()
  }

  return (
    <>
      <div className="appbar">
        <Link href="/dashboard" className="back-btn"><i className="ri-arrow-left-s-line"></i></Link>
        <h1>Séances</h1>
        <button className="add-btn" onClick={openModal}><i className="ri-add-line"></i> Séance</button>
      </div>

      <div className="statblock">
        <div className="statblock-cell">
          <div className="statblock-lbl">Séances</div>
          <div className="statblock-num">{nbSeances}</div>
        </div>
        <div className="statblock-cell">
          <div className="statblock-lbl">Heures</div>
          <div className="statblock-num">{nbHeures}</div>
        </div>
        <div className="statblock-cell">
          <div className="statblock-lbl">Ce mois</div>
          <div className="statblock-num">{nbMois}</div>
        </div>
      </div>

      <div className="list">
        {seances.length === 0 ? (
          <p className="empty">Aucune séance — crée la première ! 📋</p>
        ) : seances.map(s => {
          const date = new Date(s.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })
          const presences: number[] = s.presences ? JSON.parse(s.presences) : []
          const joueursPresents = joueurs.filter(j => presences.includes(j.id))
          return (
            <div key={s.id} className="seance-card">
              <div className="seance-hd">
                <span className={`seance-type-badge type-${s.type}`}>{s.type?.toUpperCase()}</span>
                <span className="seance-date">{date}</span>
              </div>
              <div className="seance-body">
                <div className="seance-title">{s.titre}</div>
                <div className="seance-meta">
                  {s.duree && <div className="seance-meta-item"><i className="ri-time-line"></i> {s.duree} min</div>}
                  {s.objectifs && <div className="seance-meta-item"><i className="ri-focus-3-line"></i> {s.objectifs}</div>}
                </div>
                {s.notes && <div className="seance-notes">{s.notes}</div>}
              </div>
              {joueursPresents.length > 0 && (
                <div className="presence-section">
                  <div className="presence-title">Présents — {joueursPresents.length} joueurs</div>
                  <div className="presence-pills">
                    {joueursPresents.map(j => <span key={j.id} className="presence-pill">{j.prenom} {j.nom}</span>)}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* MODAL */}
      <div className={`modal-overlay${modalOpen ? ' open' : ''}`}>
        <div className="modal">
          <div className="modal-handle"></div>
          <div className="modal-title">Nouvelle séance</div>
          <label className="field-label">Titre *</label>
          <input className="field-input" placeholder="Ex: Travail défensif" value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} />
          <label className="field-label">Type *</label>
          <select className="field-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            <option value="physique">Physique</option>
            <option value="technique">Technique</option>
            <option value="tactique">Tactique</option>
            <option value="match">Match amical</option>
            <option value="recuperation">Récupération</option>
          </select>
          <label className="field-label">Date *</label>
          <input className="field-input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <label className="field-label">Durée (minutes)</label>
          <input className="field-input" type="number" placeholder="90" value={form.duree} onChange={e => setForm(f => ({ ...f, duree: e.target.value }))} />
          <label className="field-label">Objectifs</label>
          <input className="field-input" placeholder="Ex: Améliorer le plaquage bas" value={form.objectifs} onChange={e => setForm(f => ({ ...f, objectifs: e.target.value }))} />
          <label className="field-label">Notes</label>
          <textarea className="field-input" rows={2} placeholder="Observations générales..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          <label className="field-label">Joueurs présents</label>
          <div className="presence-grid">
            {joueurs.map(j => (
              <div key={j.id} className={`presence-check${presenceChecked.has(j.id) ? ' checked' : ''}`} onClick={() => togglePresence(j.id)}>
                <input type="checkbox" readOnly checked={presenceChecked.has(j.id)} style={{ accentColor: 'var(--yellow)', width: 16, height: 16, flexShrink: 0 }} />
                <span className="presence-check-name">{j.prenom} {j.nom}</span>
              </div>
            ))}
          </div>
          <div className="modal-actions">
            <button className="btn-cancel" onClick={() => setModalOpen(false)}>Annuler</button>
            <button className="btn-save" onClick={saveSeance}>Enregistrer</button>
          </div>
        </div>
      </div>

      <BottomNav active="seances" fabAction={openModal} />
    </>
  )
}
