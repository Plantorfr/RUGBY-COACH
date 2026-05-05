'use client'

import { useState } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import { COMPETENCES, CATEGORIES } from '@/lib/competences'

export default function CompetencesPage() {
  const [activeCategory, setActiveCategory] = useState<string>('Attaque')

  const filtered = COMPETENCES.filter(c => c.category === activeCategory)

  return (
    <>
      <div className="appbar">
        <div style={{ flex: 1 }}>
          <div className="appbar-greet">Développement</div>
          <div className="appbar-team">Compétences Rugby</div>
        </div>
      </div>

      <div style={{ padding: '0 18px 12px' }}>
        <p style={{ color: 'var(--fg-mute)', fontSize: 13 }}>
          22 compétences clés évaluées et développées pour progresser.
        </p>
      </div>

      {/* Category tabs */}
      <div style={{ overflowX: 'auto', padding: '0 18px 16px', display: 'flex', gap: 8, scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              flexShrink: 0,
              padding: '8px 16px',
              borderRadius: 20,
              border: '1px solid',
              borderColor: activeCategory === cat ? 'var(--yellow)' : 'var(--border)',
              background: activeCategory === cat ? 'var(--yellow)' : 'transparent',
              color: activeCategory === cat ? 'var(--bg)' : 'var(--fg-mute)',
              fontFamily: 'var(--display)',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Competences grid */}
      <div style={{ padding: '0 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {filtered.map(comp => (
          <Link
            key={comp.id}
            href={`/competences/${comp.id}`}
            style={{ textDecoration: 'none' }}
          >
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: '16px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'rgba(255,216,58,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, color: 'var(--yellow)',
              }}>
                <i className={comp.icon}></i>
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--display)',
                  fontSize: 14,
                  fontWeight: 800,
                  color: 'white',
                  lineHeight: 1.2,
                  marginBottom: 4,
                }}>
                  {comp.name}
                </div>
                <div style={{
                  fontSize: 11,
                  color: 'var(--fg-mute)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <i className="ri-arrow-right-s-line"></i>
                  Voir le détail
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ height: 20 }}></div>
      <BottomNav active="dashboard" />
    </>
  )
}
