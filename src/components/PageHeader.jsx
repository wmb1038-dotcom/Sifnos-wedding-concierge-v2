export default function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <header className="page-header">
      {eyebrow && <p className="page-eyebrow">{eyebrow}</p>}
      <h1 className="page-title" dangerouslySetInnerHTML={{ __html: title }} />
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
      {children}
    </header>
  )
}
