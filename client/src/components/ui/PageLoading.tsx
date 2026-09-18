import { Spinner } from './Spinner'

type PageLoadingProps = {
  label?: string
}

export function PageLoading({ label = 'Đang tải nội dung' }: PageLoadingProps) {
  return (
    <div className="flex min-h-48 items-center justify-center gap-3 text-content-secondary" role="status">
      <Spinner label={label} />
      <span className="text-compact">{label}</span>
    </div>
  )
}
