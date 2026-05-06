interface Props {
  prenom: string
  nom: string
  size?: number
  isCap?: boolean
}

export function PlayerAvatar({ prenom, nom, size = 42, isCap = false }: Props) {
  return (
    <div style={{
      width: size, height: size, borderRadius: Math.round(size * 0.3),
      background: isCap ? 'var(--yellow)' : 'rgba(255,216,58,0.15)',
      color: isCap ? '#0a0e15' : 'var(--yellow)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--display)', fontWeight: 900,
      fontSize: Math.round(size * 0.4),
      flexShrink: 0,
    }}>
      {prenom.charAt(0)}{nom.charAt(0)}
    </div>
  )
}
