'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface BottomNavProps {
  fabAction?: () => void
  fabHref?: string
  active: 'dashboard' | 'effectif' | 'matchs' | 'seances' | 'sante' | 'competences'
}

export default function BottomNav({ fabAction, fabHref = '/matchs', active }: BottomNavProps) {
  const router = useRouter()

  const handleFab = () => {
    if (fabAction) fabAction()
    else router.push(fabHref)
  }

  return (
    <nav className="bottom-nav">
      <Link href="/dashboard" className={`nav-item${active === 'dashboard' ? ' active' : ''}`}>
        <i className={active === 'dashboard' ? 'ri-home-5-fill' : 'ri-home-5-line'}></i>
        <span>Accueil</span>
      </Link>
      <Link href="/effectif" className={`nav-item${active === 'effectif' ? ' active' : ''}`}>
        <i className={active === 'effectif' ? 'ri-group-fill' : 'ri-group-line'}></i>
        <span>Effectif</span>
      </Link>
      <div className="nav-center">
        <button className="nav-fab" onClick={handleFab}>
          <i className="ri-add-line"></i>
        </button>
      </div>
      <Link href="/competences" className={`nav-item${active === 'competences' ? ' active' : ''}`}>
        <i className={active === 'competences' ? 'ri-mental-health-fill' : 'ri-mental-health-line'}></i>
        <span>Compétences</span>
      </Link>
      <Link href="/sante" className={`nav-item${active === 'sante' ? ' active' : ''}`}>
        <i className={active === 'sante' ? 'ri-heart-pulse-fill' : 'ri-heart-pulse-line'}></i>
        <span>Santé</span>
      </Link>
    </nav>
  )
}
