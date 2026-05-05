import Link from 'next/link'
import { notFound } from 'next/navigation'
import { COMPETENCES, GRADE_COLORS } from '@/lib/competences'
import BottomNav from '@/components/BottomNav'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function CompetenceDetailPage({ params }: Props) {
  const { slug } = await params
  const comp = COMPETENCES.find(c => c.id === slug)

  if (!comp) notFound()

  const categoryColors: Record<string, string> = {
    'Attaque': '#ffd83a',
    'Défense': '#ef4343',
    'Jeu groupé': '#1e3b8a',
    'Physique': '#22c55e',
    'Mental': '#a855f7',
  }
  const catColor = categoryColors[comp.category] || '#ffd83a'

  return (
    <>
      {/* Hero image */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={comp.imageUrl}
          alt={comp.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, #0a0e15 0%, rgba(10,14,21,0.6) 50%, rgba(10,14,21,0.3) 100%)'
        }} />
        <div style={{ position: 'absolute', top: 14, left: 14 }}>
          <Link href="/competences" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(10,14,21,0.7)', border: '1px solid rgba(255,255,255,0.2)',
            color: 'white', textDecoration: 'none', fontSize: 18,
          }}>
            <i className="ri-arrow-left-s-line"></i>
          </Link>
        </div>
        <div style={{ position: 'absolute', bottom: 14, left: 18, right: 18 }}>
          <span style={{
            display: 'inline-block',
            padding: '3px 10px',
            borderRadius: 20,
            background: catColor,
            color: comp.category === 'Attaque' || comp.category === 'Physique' ? '#0a0e15' : 'white',
            fontSize: 11,
            fontFamily: 'var(--display)',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 6,
          }}>
            {comp.category}
          </span>
          <div style={{
            fontFamily: 'var(--display)',
            fontSize: 26,
            fontWeight: 900,
            color: 'white',
            lineHeight: 1.1,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <i className={comp.icon} style={{ fontSize: 22, color: catColor }}></i>
            {comp.name}
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 18px' }}>
        {/* Description */}
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
          {comp.description}
        </p>

        {/* Erreurs fréquentes */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontFamily: 'var(--display)',
            fontSize: 16,
            fontWeight: 800,
            color: 'white',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <i className="ri-error-warning-line" style={{ color: '#ef4343' }}></i>
            Erreurs fréquentes
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {comp.erreurs.map((erreur, i) => (
              <div key={i} style={{
                background: 'rgba(239,67,67,0.1)',
                border: '1px solid rgba(239,67,67,0.25)',
                borderRadius: 12,
                padding: '10px 14px',
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
              }}>
                <i className="ri-close-circle-fill" style={{ color: '#ef4343', fontSize: 16, flexShrink: 0, marginTop: 1 }}></i>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 1.5 }}>{erreur}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Exercices */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontFamily: 'var(--display)',
            fontSize: 16,
            fontWeight: 800,
            color: 'white',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <i className="ri-run-line" style={{ color: '#ffd83a' }}></i>
            Exercices d&apos;amélioration
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {comp.exercices.map((ex, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 14,
                padding: '14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: 'var(--yellow)', color: '#0a0e15',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 900, fontFamily: 'var(--display)',
                      flexShrink: 0,
                    }}>
                      {i + 1}
                    </span>
                    <span style={{
                      fontFamily: 'var(--display)',
                      fontWeight: 800,
                      fontSize: 14,
                      color: 'white',
                    }}>
                      {ex.titre}
                    </span>
                  </div>
                  {ex.duree && (
                    <span style={{
                      background: 'rgba(255,216,58,0.15)',
                      color: '#ffd83a',
                      borderRadius: 8,
                      padding: '2px 8px',
                      fontSize: 11,
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}>
                      {ex.duree}
                    </span>
                  )}
                </div>
                <p style={{ color: 'var(--fg-mute)', fontSize: 13, lineHeight: 1.5, margin: 0, paddingLeft: 30 }}>
                  {ex.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Conseil du coach */}
        <div style={{
          background: 'rgba(255,216,58,0.1)',
          border: '1px solid rgba(255,216,58,0.3)',
          borderRadius: 14,
          padding: '16px',
          marginBottom: 24,
        }}>
          <div style={{
            fontFamily: 'var(--display)',
            fontSize: 14,
            fontWeight: 900,
            color: '#ffd83a',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <i className="ri-lightbulb-flash-line"></i>
            Conseil du coach
          </div>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
            {comp.conseil_coach}
          </p>
        </div>

        {/* Grade legend */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 14,
          padding: '14px',
        }}>
          <div style={{
            fontFamily: 'var(--display)',
            fontSize: 13,
            fontWeight: 800,
            color: 'var(--fg-mute)',
            marginBottom: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            Grille d&apos;évaluation
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {(['A', 'B', 'C', 'D'] as const).map(grade => (
              <div key={grade} style={{
                borderRadius: 10,
                padding: '8px 6px',
                background: `${GRADE_COLORS[grade]}20`,
                border: `1px solid ${GRADE_COLORS[grade]}40`,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'var(--display)', color: GRADE_COLORS[grade] }}>
                  {grade}
                </div>
                <div style={{ fontSize: 10, color: 'var(--fg-mute)', marginTop: 2 }}>
                  {grade === 'A' ? 'Excellent' : grade === 'B' ? 'Bon' : grade === 'C' ? 'Moyen' : 'À améliorer'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav active="dashboard" />
    </>
  )
}
