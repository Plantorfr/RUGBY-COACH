interface Props {
  message: string
  icon?: string
}

export function EmptyState({ message, icon = '📭' }: Props) {
  return (
    <p className="empty">{icon} {message}</p>
  )
}
