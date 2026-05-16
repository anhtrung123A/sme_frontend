type HeaderProps = {
  title: string
}

export function Header({ title }: HeaderProps) {
  return (
    <div className="page-header">
      <h1 className="page-title">{title}</h1>
    </div>
  )
}
