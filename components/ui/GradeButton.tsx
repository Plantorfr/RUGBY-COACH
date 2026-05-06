'use client'
// Bouton A/B/C/D unique avec couleur selon grade
export const GRADE_COLORS: Record<string, string> = {
  A: '#22c55e', B: '#ffd83a', C: '#f97316', D: '#ef4343'
}

interface Props {
  grade: 'A' | 'B' | 'C' | 'D'
  selected: boolean
  onClick: () => void
}

export function GradeButton({ grade, selected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 32, height: 32, borderRadius: 8, border: 'none',
        fontFamily: 'var(--display)', fontWeight: 900, fontSize: 13,
        cursor: 'pointer',
        background: selected ? GRADE_COLORS[grade] : 'rgba(255,255,255,0.08)',
        color: selected ? (grade === 'B' ? '#0a0e15' : '#fff') : 'rgba(255,255,255,0.5)',
        transition: 'all 0.15s ease',
      }}
    >
      {grade}
    </button>
  )
}
