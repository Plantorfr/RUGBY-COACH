'use client'
import { GradeButton } from './GradeButton'

interface Props {
  value?: string
  onChange: (grade: string) => void
}

export function GradeButtonGroup({ value, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {(['A', 'B', 'C', 'D'] as const).map(g => (
        <GradeButton
          key={g}
          grade={g}
          selected={value === g}
          onClick={() => onChange(value === g ? '' : g)}
        />
      ))}
    </div>
  )
}
