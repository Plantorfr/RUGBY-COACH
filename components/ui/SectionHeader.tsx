import Link from 'next/link'

interface Props {
  title: string
  linkHref?: string
  linkLabel?: string
  right?: React.ReactNode
}

export function SectionHeader({ title, linkHref, linkLabel, right }: Props) {
  return (
    <div className="section-h">
      <h3>{title}</h3>
      {linkHref && linkLabel && (
        <Link href={linkHref} className="section-link">{linkLabel} ›</Link>
      )}
      {right}
    </div>
  )
}
