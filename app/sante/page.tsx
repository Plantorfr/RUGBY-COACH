'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

interface Joueur { id: number; prenom: string; nom: string; poste?: string }
interface Blessure {
  id: number; type_blessure: string; statut: string; date_debut: string
  date_retour_estime?: string; notes_medicales?: string; resolved?: boolean
  joueurs?: { id: number; prenom: string; nom: string; poste?: string }
}

export default function SantePage() {
  const router = useRouter()
  const supabase = createClient()
  const [tab, setTab] = useState<'encours' | 'historique'>('encours')
  const [blessures, setBlessures] = useState<Blessure[]>([])
  const [joueurs, setJoueurs] = useState<Joueur[]>([])
  const [nbOut, setNbOut] = useState(0)
  const [nbIncertain, setNbIncertain] = useState(0)
  const [nbFit, setNbFit] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ joueur: '', type: '', debut: '', retour: '', statut: 'out', notes: '' })

  useEffect(() => {
    loadJoueurs()
    loadBlessures()
  }, [])

  useEffect(() => { loadBlessures() }, [tab])

  async function loadJoueurs() {
    const { data } = await supabase.from('joueurs').select('*').eq('archive', false).order('nom')
    setJoueurs(data || [])
  }

  async function loadBlessures() {
    const encours = tab === 'encours'
    const { data } = await supabase
      .from('sante').select('*, joueurs(id, nom, prenom, poste)')
      .eq('resolved', !encours).order('created_at', { ascending: false })

    const { data: all } = await supabase.from('sante').select('*').eq('resolved', false)
    if (all) {
      setNbOut(all.filter((b: Blessure) => b.statut === 'out').length)
      setNbIncertain(all.filter((b: Blessure) => b.statut === 'incertain').length)
      setNbFit(all.filter((b: Blessure) => b.statut === 'fit').length)
    }
    setBlessures(data || [])
  }

  async function saveBlessure() {
    if (!form.joueur || !form.type || !form.debut) { alert('Joueur, type et date obligatoires'); return }
    await supabase.from('sante').insert({
      joueur_id: parseInt(form.joueur), type_blessure: form.type, date_debut: form.debut,
      date_retour_estime: form.retour || null, statut: form.statut,
      notes_medicales: form.notes || null, resolved: false
    })
    setModalOpen(false)
    setForm({ joueur: '', type: '', debut: '', retour: '', statut: 'out', notes: '' })
    await loadBlessures()
  }

  async function resoudre(id: number) {
    await supabase.from('sante').update({ resolved: true, statut: 'fit' }).eq('id', id)
    await loadBlessures()
  }

  async function supprimer(id: number) {
    if (!confirm('Supprimer cette blessure ?')) return
    await supabase.from('sante').delete().eq('id', id)
    await loadBlessures()
  }

  return (
    <>
      <div className="appbar">
        <Link href="/dashboard" className="back-btn"><i className="ri-arrow-left-s-line"></i></Link>
        <h1>Infirmerie</h1>
        <button className="add-btn" onClick={() => setModalOpen(true)}><i className="ri-add-line"></i> Blessure</button>
      </div>

      <div className="statblock">
        <div className="statblock-cell">
          <div className="statblock-lbl">Forfaits</div>
          <div className="statblock-num red">{nbOut}</div>
        </div>
        <div className="statblock-cell">
          <div className="statblock-lbl">Incertains</div>
          <div className="statblock-num yellow">{nbIncertain}</div>
        </div>
        <div className="statblock-cell">
          <div className="statblock-lbl">Rétablis</div>
          <div className="statblock-num green">{nbFit}</div>
        </div>
      </div>

      <div className="segments">
        <button className={`segment${tab === 'encours' ? ' active' : ''}`} onClick={() => setTab('encours')}>En cours</button>
        <button className={`segment${tab === 'historique' ? ' active' : ''}`} onClick={() => setTab('historique')}>Historique</button>
      </div>

      <div className="list">
        {blessures.length === 0 ? (
          <p className="empty">{tab === 'encours' ? 'Aucune blessure en cours 💪' : 'Aucun historique'}</p>
        ) : blessures.map(b => {
          const debut = new Date(b.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
          const retour = b.date_retour_estime ? new Date(b.date_retour_estime).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : 'Non défini'
          const initiales = `${b.joueurs?.prenom?.charAt(0) || '?'}${b.joueurs?.nom?.charAt(0) || '?'}`
          return (
            <div key={b.id} className="blessure-card">
              <div className="blessure-hd">
                <div className={`blessure-avatar ${b.statut}`}>{initiales}</div>
                <div className="blessure-hd-info">
                  <div className="blessure-joueur" onClick={() => b.joueurs?.id && router.push(`/joueur/${b.joueurs.id}`)}>
                    {b.joueurs?.prenom} {b.joueurs?.nom}
                  </div>
                  <div className="blessure-poste">{b.joueurs?.poste || '—'}</div>
                </div>
                <span className={`statut-badge statut-${b.statut}`}>{b.statut.toUpperCase()}</span>
              </div>
              <div className="blessure-body">
                <div className="blessure-type">{b.type_blessure}</div>
                <div className="blessure-dates">
                  <i className="ri-calendar-line"></i>
                  Depuis le {debut}
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'currentColor', opacity: 0.4, display: 'inline-block' }}></span>
                  Retour : {retour}
                </div>
                {b.notes_medicales && <div className="blessure-notes">{b.notes_medicales}</div>}
              </div>
              {tab === 'encours' && (
                <div className="blessure-actions">
                  <button className="resolve-btn" onClick={() => resoudre(b.id)}><i className="ri-checkbox-circle-line"></i> Marquer rétabli</button>
                  <button className="delete-btn" onClick={() => supprimer(b.id)}><i className="ri-delete-bin-line"></i></button>
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
          <div className="modal-title">Nouvelle blessure</div>
          <label className="field-label">Joueur *</label>
          <select className="field-input" value={form.joueur} onChange={e => setForm(f => ({ ...f, joueur: e.target.value }))}>
            <option value="">Choisir un joueur</option>
            {joueurs.map(j => <option key={j.id} value={j.id}>{j.prenom} {j.nom} — {j.poste || ''}</option>)}
          </select>
          <label className="field-label">Type de blessure *</label>
          <input className="field-input" placeholder="Ex: Entorse cheville" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} />
          <label className="field-label">Date début *</label>
          <input className="field-input" type="date" value={form.debut} onChange={e => setForm(f => ({ ...f, debut: e.target.value }))} />
          <label className="field-label">Retour estimé</label>
          <input className="field-input" type="date" value={form.retour} onChange={e => setForm(f => ({ ...f, retour: e.target.value }))} />
          <label className="field-label">Statut</label>
          <select className="field-input" value={form.statut} onChange={e => setForm(f => ({ ...f, statut: e.target.value }))}>
            <option value="out">Forfait (Out)</option>
            <option value="incertain">Incertain</option>
            <option value="fit">Fit</option>
          </select>
          <label className="field-label">Notes médicales</label>
          <textarea className="field-input" rows={2} placeholder="Observations..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          <div className="modal-actions">
            <button className="btn-cancel" onClick={() => setModalOpen(false)}>Annuler</button>
            <button className="btn-save" onClick={saveBlessure}>Enregistrer</button>
          </div>
        </div>
      </div>

      <BottomNav active="sante" fabAction={() => setModalOpen(true)} />
    </>
  )
}
