'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

interface Match {
  id: number
  adversaire: string
  date_match: string
  lieu: string
  competition?: string
  statut: string
  score_nous?: number
  score_eux?: number
}

interface Blessure {
  id: number
  statut: string
  type_blessure: string
  joueurs?: { prenom: string; nom: string }
}

interface Countdown { j: number; h: number; m: number; s: number }

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [coachName, setCoachName] = useState('Coach')
  const [initials, setInitials] = useState('C')
  const [prochainMatch, setProchainMatch] = useState<Match | null>(null)
  const [countdown, setCountdown] = useState<Countdown>({ j: 0, h: 0, m: 0, s: 0 })
  const [nbDispo, setNbDispo] = useState<number | string>('—')
  const [nbIncertain, setNbIncertain] = useState<number | string>('—')
  const [nbOut, setNbOut] = useState<number | string>('—')
  const [bilanScore, setBilanScore] = useState('—')
  const [bilanDesc, setBilanDesc] = useState('Chargement...')
  const [nbMatchs, setNbMatchs] = useState('')
  const [blesses, setBlesses] = useState<Blessure[]>([])
  const [derniersMatchs, setDerniersMatchs] = useState<Match[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    load()
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const name = profile?.name || user.email?.split('@')[0] || 'Coach'
    setCoachName(name)
    setInitials(name.charAt(0).toUpperCase())

    const today = new Date().toISOString().split('T')[0]

    // Prochain match
    const { data: prochains } = await supabase
      .from('matchs').select('*')
      .eq('statut', 'a_venir').gte('date_match', today)
      .order('date_match', { ascending: true }).limit(1)

    if (prochains && prochains.length > 0) {
      setProchainMatch(prochains[0])
      startCountdown(prochains[0].date_match)
    }

    // Effectif
    const { data: joueurs } = await supabase.from('joueurs').select('*').eq('archive', false)
    if (joueurs) setNbDispo(joueurs.filter((j: { disponible: boolean }) => j.disponible).length)

    // Blessés
    const { data: blessesData } = await supabase
      .from('sante').select('*, joueurs(nom, prenom)')
      .eq('resolved', false).order('created_at', { ascending: false }).limit(3)

    if (blessesData) {
      setNbIncertain(blessesData.filter((b: Blessure) => b.statut === 'incertain').length)
      setNbOut(blessesData.filter((b: Blessure) => b.statut === 'out').length)
      setBlesses(blessesData)
    }

    // Derniers matchs
    const { data: matchsData } = await supabase
      .from('matchs').select('*').eq('statut', 'joue')
      .order('date_match', { ascending: false }).limit(4)

    if (matchsData && matchsData.length > 0) {
      const V = matchsData.filter((m: Match) => (m.score_nous ?? 0) > (m.score_eux ?? 0)).length
      const D = matchsData.filter((m: Match) => (m.score_nous ?? 0) < (m.score_eux ?? 0)).length
      const N = matchsData.filter((m: Match) => m.score_nous === m.score_eux).length
      setBilanScore(`${V}-${D}-${N}`)
      setBilanDesc(`${matchsData.length} matchs joués cette saison`)
      setNbMatchs(`${matchsData.length} matchs`)
      setDerniersMatchs(matchsData)
    }
  }

  function startCountdown(dateStr: string) {
    const tick = () => {
      const diff = new Date(dateStr).getTime() - Date.now()
      if (diff <= 0) return
      setCountdown({
        j: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    intervalRef.current = setInterval(tick, 1000)
  }

  return (
    <>
      <div className="appbar">
        <div className="avatar">{initials}</div>
        <div className="appbar-info">
          <div className="appbar-greet">Bonjour,</div>
          <div className="appbar-team">{coachName}</div>
        </div>
        <button className="icon-btn"><i className="ri-notification-3-line"></i></button>
      </div>

      <div className="body">

        {/* PROCHAIN MATCH */}
        <div>
          <div className="section-h">
            <h3>Prochain match</h3>
            <Link href="/matchs" className="section-link">Voir tout ›</Link>
          </div>
          <div className="match-hero">
            <div className="match-hero-bg"></div>
            <div className="match-hero-inner">
              {prochainMatch ? (
                <>
                  <div className="match-tag">⚡ À venir</div>
                  <div className="match-teams">
                    <div className="match-team">
                      <div className="match-crest home">RCA</div>
                      <div className="match-name">RCACP</div>
                    </div>
                    <div className="match-vs">VS</div>
                    <div className="match-team">
                      <div className="match-crest">{prochainMatch.adversaire.substring(0, 3).toUpperCase()}</div>
                      <div className="match-name">{prochainMatch.adversaire}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <i className="ri-calendar-line"></i>
                    {new Date(prochainMatch.date_match).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'currentColor', opacity: 0.5, display: 'inline-block' }}></span>
                    {prochainMatch.lieu}{prochainMatch.competition ? ` · ${prochainMatch.competition}` : ''}
                  </div>
                  <div className="countdown">
                    {[{ v: countdown.j, l: 'Jours' }, { v: countdown.h, l: 'Heures' }, { v: countdown.m, l: 'Min' }, { v: countdown.s, l: 'Sec' }].map(({ v, l }) => (
                      <div key={l} className="countdown-cell">
                        <div className="countdown-num">{v}</div>
                        <div className="countdown-lbl">{l}</div>
                      </div>
                    ))}
                  </div>
                  <div className="match-cta">
                    <Link href="/matchs" className="match-cta-btn" style={{ textDecoration: 'none' }}>
                      <i className="ri-arrow-right-line"></i> Voir le match
                    </Link>
                  </div>
                </>
              ) : (
                <p className="no-match">Aucun match à venir — <Link href="/matchs">ajouter un match</Link></p>
              )}
            </div>
          </div>
        </div>

        {/* EFFECTIF */}
        <div>
          <div className="section-h">
            <h3>Effectif</h3>
            <Link href="/effectif" className="section-link">Tout voir ›</Link>
          </div>
          <div className="statblock" style={{ padding: 0 }}>
            <div className="statblock-cell feature">
              <div className="statblock-lbl">Disponibles</div>
              <div className="statblock-num">{nbDispo}</div>
            </div>
            <div className="statblock-cell warn">
              <div className="statblock-lbl">Incertains</div>
              <div className="statblock-num">{nbIncertain}</div>
            </div>
            <div className="statblock-cell danger">
              <div className="statblock-lbl">Forfaits</div>
              <div className="statblock-num">{nbOut}</div>
            </div>
          </div>
        </div>

        {/* BILAN */}
        <div>
          <div className="section-h">
            <h3>Forme du moment</h3>
            <span className="section-link">{nbMatchs}</span>
          </div>
          <div className="poster">
            <div className="poster-kicker">Bilan saison</div>
            <div className="poster-num">{bilanScore}</div>
            <div className="poster-cap">{bilanDesc}</div>
          </div>
        </div>

        {/* INFIRMERIE */}
        <div>
          <div className="section-h">
            <h3>Infirmerie</h3>
            <Link href="/sante" className="section-link">Voir tout ›</Link>
          </div>
          {blesses.length > 0 ? blesses.map(b => (
            <div key={b.id} className={`alert${b.statut === 'out' ? ' urgent' : ''}`}>
              <div className="alert-icon">
                <i className={`ri-${b.statut === 'out' ? 'close' : 'time'}-line`}></i>
              </div>
              <div className="alert-body">
                <div className="alert-title">
                  {b.joueurs?.prenom} {b.joueurs?.nom}
                  <span className="alert-eta">{b.statut === 'out' ? 'FORFAIT' : 'INCERTAIN'}</span>
                </div>
                <div className="alert-sub">{b.type_blessure}</div>
              </div>
            </div>
          )) : (
            <p className="empty">Aucun joueur blessé 💪</p>
          )}
        </div>

        {/* DERNIERS MATCHS */}
        <div>
          <div className="section-h">
            <h3>Derniers matchs</h3>
            <Link href="/matchs" className="section-link">Voir tout ›</Link>
          </div>
          <div className="card">
            {derniersMatchs.length > 0 ? derniersMatchs.map(m => {
              const win = (m.score_nous ?? 0) > (m.score_eux ?? 0)
              const date = new Date(m.date_match).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
              return (
                <Link key={m.id} href="/matchs" className="match-row" style={{ textDecoration: 'none', color: 'inherit', display: 'grid' }}>
                  <div className={`match-row-badge ${win ? 'win' : 'loss'}`}>{win ? 'V' : 'D'}</div>
                  <div>
                    <div className="match-row-vs">vs {m.adversaire}</div>
                    <div className="match-row-date">{date} · {m.lieu}</div>
                  </div>
                  <div className="match-row-score">{m.score_nous ?? '?'} – {m.score_eux ?? '?'}</div>
                </Link>
              )
            }) : (
              <p className="empty">Aucun match enregistré</p>
            )}
          </div>
        </div>

      </div>

      <BottomNav active="dashboard" />
    </>
  )
}
