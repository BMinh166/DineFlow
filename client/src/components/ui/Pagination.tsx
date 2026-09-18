import { ChevronLeft, ChevronRight } from 'lucide-react'
import { IconButton } from './IconButton'

type PaginationProps = {
  className?: string
  currentPage: number
  onPageChange: (page: number) => void
  totalPages: number
}

type PageItem = number | 'ellipsis'

function getPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1)

  if (currentPage <= 4) return [1, 2, 3, 4, 5, 'ellipsis', totalPages]
  if (currentPage >= totalPages - 3) return [1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages]
}

export function Pagination({ className = '', currentPage, onPageChange, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null

  const page = Math.min(Math.max(currentPage, 1), totalPages)
  const pageItems = getPageItems(page, totalPages)

  return (
    <nav aria-label="Phân trang" className={`flex flex-wrap items-center justify-center gap-1 ${className}`}>
      <IconButton aria-label="Trang trước" disabled={page === 1} icon={ChevronLeft} onClick={() => onPageChange(page - 1)} size="sm" />
      {pageItems.map((item, index) => item === 'ellipsis' ? (
        <span aria-hidden="true" className="inline-flex size-8 items-center justify-center text-content-secondary" key={`ellipsis-${index}`}>…</span>
      ) : (
        <button
          aria-current={item === page ? 'page' : undefined}
          aria-label={`Trang ${item}`}
          className={`size-8 rounded-control text-compact font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 focus-visible:ring-offset-2 ${item === page ? 'bg-brand text-on-primary' : 'text-content hover:bg-surface-muted active:bg-muted'}`}
          key={item}
          onClick={() => onPageChange(item)}
          type="button"
        >
          {item}
        </button>
      ))}
      <IconButton aria-label="Trang sau" disabled={page === totalPages} icon={ChevronRight} onClick={() => onPageChange(page + 1)} size="sm" />
    </nav>
  )
}
