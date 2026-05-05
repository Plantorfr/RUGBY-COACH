'use client'

import Link from 'next/link'

type PlayerNavTab = 'portail' | 'evaluations' | 'progression' | 'conseils' | 'profil'

interface BottomNavPlayerProps {
  active: PlayerNavTab
}

export default function BottomNavPlayer({ active }: BottomNavPlayerProps) {
  const items: { key: PlayerNavTab; label: string; href: string; icon: string; iconActive: string }[] = [
    { key: 'portail', label: 'Accueil', href: '/portail', icon: 'ri-home-4-line', iconActive: 'ri-home-4-fill' },
    { key: 'evaluations', label: 'Mes évals', href: '/portail/mes-evaluations', icon: 'ri-bar-chart-line', iconActive: 'ri-bar-chart-fill' },
    { key: 'progression', label: 'Progression', href: '/portail', icon: 'ri-line-chart-line', iconActive: 'ri-line-chart-fill' },
    { key: 'conseils', label: 'Conseils', href: '/competences', icon: 'ri-book-open-line', iconActive: 'ri-book-open-fill' },
    { key: 'profil', label: 'Mon profil', href: '/portail', icon: 'ri-user-line', iconActive: 'ri-user-fill' },
  ]

  return (
    <nav className="bottom-nav">
      {items.map(item => (
        <Link
          key={item.key}
          href={item.href}
          className={`nav-item${active === item.key ? ' active' : ''}`}
        >
          <i className={active === item.key ? item.iconActive : item.icon}></i>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
