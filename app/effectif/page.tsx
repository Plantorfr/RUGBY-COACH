'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

interface Joueur {
  id: number
  prenom: string
  nom: string
  numero?: number
  poste?: string
  telephone?: string
  email?: string
  poids?: number
  taille?: number
  capitaine?: boolean
  disponible?: boolean
  archive?: boolean
}

const POSTES = ['Pilier gauche','Talonneur','Pilier droit','Deuxième ligne','Troisième ligne aile','Troisième ligne centre','Demi de mêlée','Demi d\'ouverture','Centre','Ailier','Arrière']
const FILTERS = [
  { key: 'tous', label: 'Tous' },
  { key: 'Pilier', label: 'Piliers' },
  { key: 'Talonneur', label: 'Talonneurs' },
  { key: 'Deuxième ligne', label: '2e ligne' },
  { key: 'Troisième ligne', label: '3e ligne' },
  { key: 'Demi', label: 'Demis' },
  { key: 'Centre', label: 'Centres' },
  { key: 'Ailier', label: 'Ailiers' },
  { key: 'Arrière', label: 'Arrières' },
]

export default function EffectifPage() {
  const router = useRouter()
  const supabase = createClient()
  const [joueurs, setJoueurs] = useState<Joueur[]>([])
  const [tab, setTab] = useState<'actifs' | 'archives'>('actifs')
  const [filter, setFilter] = useState('tous')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ prenom: '', nom: '', numero: '', poste: '', telephone: '', email: '', poids: '', taille: '' })

  useEffect(() => { loadJoueurs() }, [])

  async function loadJoueurs() {
    const { data } = await supabase.from('joueurs').select('*').order('numero', { ascending: true })
    setJoueurs(data || [])
  }

  function getFiltered() {
    let list = joueurs.filter(j => tab === 'actifs' ? !j.archive : j.archive)
    if (filter !== 'tous') list = list.filter(j => j.poste?.toLowerCase().includes(filter.toLowerCase()))
    if (search) list = list.filter(j => `${j.prenom} ${j.nom}`.toLowerCase().includes(search.toLowerCase()))
    return list
  }

  function openAdd() {
    setEditingId(null)
    setForm({ prenom: '', nom: '', numero: '', poste: '', telephone: '', email: '', poids: '', taille: '' })
    setModalOpen(true)
  }

  function openEdit(j: Joueur) {
    setEditingId(j.id)
    setForm({
      prenom: j.prenom || '', nom: j.nom || '', numero: String(j.numero || ''),
      poste: j.poste || '', telephone: j.telephone || '', email: j.email || '',
      poids: String(j.poids || ''), taille: String(j.taille || ''),
    })
    setModalOpen(true)
  }

  async function saveJoueur() {
    if (!form.prenom || !form.nom || !form.poste) { alert('Prénom, nom et poste sont obligatoires.'); return }
    const data = {
      prenom: form.prenom, nom: form.nom, poste: form.poste,
      numero: form.numero ? Number(form.numero) : null,
      telephone: form.telephone || null, email: form.email || null,
      poids: form.poids ? Number(form.poids) : null,
      taille: form.taille ? Number(form.taille) : null,
    }
    if (editingId) {
      await supabase.from('joueurs').update(data).eq('id', editingId)
    } else {
      await supabase.from('joueurs').insert({ ...data, disponible: true, saison: '2025-2026' })
    }
    setModalOpen(false)
    await loadJoueurs()
  }

  async function archiver(id: number) {
    if (!confirm('Archiver ce joueur ?')) return
    await supabase.from('joueurs').update({ archive: true }).eq('id', id)
    await loadJoueurs()
  }

  async function desarchiver(id: number) {
    await supabase.from('joueurs').update({ archive: false }).eq('id', id)
    await loadJoueurs()
  }

  const filtered = getFiltered()

  return (
    <>
      <div className="appbar">
        <Link href="/dashboard" className="back-btn"><i className="ri-arrow-left-s-line"></i></Link>
        <h1>Effectif</h1>
        <button className="add-btn" onClick={openAdd}><i className="ri-add-line"></i> Joueur</button>
      </div>

      <div className="segments">
        <button className={`segment${tab === 'actifs' ? ' active' : ''}`} onClick={() => setTab('actifs')}>Actifs</button>
        <button className={`segment${tab === 'archives' ? ' active' : ''}`} onClick={() => setTab('archives')}>Archives</button>
      </div>

      <div className="search-wrap">
        <input className="search-input" placeholder="🔍 Rechercher un joueur..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {tab === 'actifs' && (
        <div className="filter-row">
          {FILTERS.map(f => (
            <button key={f.key} className={`filter-btn${filter === f.key ? ' active' : ''}`} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
      )}

      <div className="player-list">
        <div className="card">
          {filtered.length === 0 ? (
            <p className="empty">{tab === 'actifs' ? 'Aucun joueur — ajoute le premier 🏉' : 'Aucun joueur archivé'}</p>
          ) : filtered.map(j => (
            <div key={j.id} className="player-row">
              <div className={`player-avatar${j.capitaine ? ' cap' : ''}`} onClick={() => router.push(`/joueur/${j.id}`)}>
                {j.prenom.charAt(0)}{j.nom.charAt(0)}
              </div>
              <div className="player-info" onClick={() => router.push(`/joueur/${j.id}`)}>
                <div className="player-name">{j.prenom} {j.nom} {j.capitaine ? '⭐' : ''}</div>
                <div className="player-meta">
                  <span className="pos-chip">{j.poste ? j.poste.substring(0, 3).toUpperCase() : '—'}</span>
                  {j.poste || '—'}
                </div>
              </div>
              <div className="player-right">
                <div className="numero">{j.numero || '—'}</div>
                <div className="card-actions">
                  {tab === 'actifs' ? (
                    <>
                      <button className="act-btn" onClick={() => openEdit(j)} title="Modifier"><i className="ri-edit-line"></i></button>
                      <button className="act-btn archive" onClick={() => archiver(j.id)} title="Archiver"><i className="ri-archive-line"></i></button>
                    </>
                  ) : (
                    <button className="act-btn restore" onClick={() => desarchiver(j.id)} title="Désarchiver"><i className="ri-refresh-line"></i></button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      <div className={`modal-overlay${modalOpen ? ' open' : ''}`}>
        <div className="modal">
          <div className="modal-handle"></div>
          <div className="modal-title">{editingId ? 'Modifier le joueur' : 'Nouveau joueur'}</div>
          <label className="field-label">Prénom *</label>
          <input className="field-input" placeholder="Thomas" value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} />
          <label className="field-label">Nom *</label>
          <input className="field-input" placeholder="Dupont" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
          <label className="field-label">Numéro</label>
          <input className="field-input" type="number" placeholder="9" value={form.numero} onChange={e => setForm(f => ({ ...f, numero: e.target.value }))} />
          <label className="field-label">Poste *</label>
          <select className="field-input" value={form.poste} onChange={e => setForm(f => ({ ...f, poste: e.target.value }))}>
            <option value="">Choisir un poste</option>
            {POSTES.map(p => <option key={p}>{p}</option>)}
          </select>
          <label className="field-label">Téléphone</label>
          <input className="field-input" placeholder="06 12 34 56 78" value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} />
          <label className="field-label">Email</label>
          <input className="field-input" type="email" placeholder="joueur@email.fr" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <label className="field-label">Poids (kg)</label>
          <input className="field-input" type="number" placeholder="90" value={form.poids} onChange={e => setForm(f => ({ ...f, poids: e.target.value }))} />
          <label className="field-label">Taille (cm)</label>
          <input className="field-input" type="number" placeholder="185" value={form.taille} onChange={e => setForm(f => ({ ...f, taille: e.target.value }))} />
          <div className="modal-actions">
            <button className="btn-cancel" onClick={() => setModalOpen(false)}>Annuler</button>
            <button className="btn-save" onClick={saveJoueur}>{editingId ? 'Enregistrer' : 'Ajouter'}</button>
          </div>
        </div>
      </div>

      <BottomNav active="effectif" fabAction={openAdd} />
    </>
  )
}
