export function LoadingSpinner({ text = 'Chargement...' }: { text?: string }) {
  return (
    <div style={{ color: 'var(--fg-mute)', padding: 40, textAlign: 'center', fontSize: 14 }}>
      {text}
    </div>
  )
}
