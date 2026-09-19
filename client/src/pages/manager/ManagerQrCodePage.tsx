import { useEffect, useState } from 'react'
import { ExternalLink, Printer, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Button, Card, EmptyState, ErrorState, PageHeader, PageLoading, StatusBadge } from '../../components/ui'
import { getManagerTables } from '../../services/manager-table-api'
import type { ManagerTable } from '../../types/table'
import { getApiErrorMessage } from '../../utils/api-error'

function getPublicTableUrl(tableId: string): string {
  return new URL(`/table/${encodeURIComponent(tableId)}`, window.location.origin).toString()
}

export function ManagerQrCodePage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)
  const [tables, setTables] = useState<ManagerTable[]>([])

  useEffect(() => {
    let isCurrent = true

    async function loadTables() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const result = await getManagerTables()
        if (isCurrent) setTables(result)
      } catch (error) {
        if (isCurrent) setErrorMessage(getApiErrorMessage(error, 'Không thể tải danh sách mã QR. Vui lòng thử lại.'))
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    void loadTables()
    return () => {
      isCurrent = false
    }
  }, [reloadKey])

  return (
    <div className="manager-qr-page space-y-6">
      <style>{`
        @media print {
          .manager-chrome, .manager-qr-page .print-hidden { display: none !important; }
          main { max-width: none !important; padding: 0 !important; }
          .manager-qr-page { color: #111827 !important; }
          .manager-qr-page .qr-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .manager-qr-page .qr-card { break-inside: avoid; border-color: #d1d5db !important; box-shadow: none !important; }
        }
      `}</style>

      <PageHeader
        actions={<Button className="print-hidden" onClick={() => window.print()}><Printer aria-hidden="true" className="size-4" />In mã QR</Button>}
        description="Mỗi mã QR chỉ nhận diện bàn và mở menu công khai theo đúng bàn đó."
        title="Mã QR"
      />

      {isLoading && <PageLoading label="Đang tải mã QR" />}
      {!isLoading && errorMessage && <ErrorState description={errorMessage} onRetry={() => setReloadKey(key => key + 1)} title="Không thể tải mã QR" />}
      {!isLoading && !errorMessage && tables.length === 0 && (
        <EmptyState
          description="Hãy tạo bàn trước để có mã QR nhận diện bàn tương ứng."
          icon={QrCode}
          title="Chưa có bàn để tạo mã QR"
        />
      )}
      {!isLoading && !errorMessage && tables.length > 0 && (
        <ul aria-label="Danh sách mã QR theo bàn" className="qr-grid grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tables.map(table => {
            const publicUrl = getPublicTableUrl(table.id)

            return (
              <li key={table.id}>
                <Card className="qr-card flex h-full flex-col p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-caption font-semibold uppercase tracking-wide text-content-muted">DineFlow</p>
                      <h2 className="mt-1 text-subsection text-content">Bàn {table.number}</h2>
                    </div>
                    <StatusBadge entity="category" status={table.active ? 'ACTIVE' : 'INACTIVE'} />
                  </div>

                  <div aria-label={`Mã QR mở menu công khai của bàn ${table.number}`} className="my-5 flex justify-center rounded-control bg-white p-4" role="img">
                    <QRCodeSVG bgColor="#ffffff" fgColor="#111827" includeMargin level="M" size={224} value={publicUrl} />
                  </div>

                  <div className="border-t border-border pt-4">
                    <p className="text-caption text-content-muted">Liên kết menu công khai</p>
                    <a
                      aria-label={`Mở menu công khai của bàn ${table.number}`}
                      className="mt-1 block break-all text-compact text-brand underline underline-offset-2"
                      href={publicUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {publicUrl}
                    </a>
                  </div>

                  <div className="print-hidden mt-4 flex flex-wrap gap-2">
                    <a
                      aria-label={`Xem menu công khai của bàn ${table.number}`}
                      className="inline-flex min-h-8 items-center justify-center gap-2 rounded-control border border-border bg-surface px-3 py-1.5 text-sm font-semibold text-content transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 focus-visible:ring-offset-2"
                      href={publicUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <ExternalLink aria-hidden="true" className="size-4" />Xem menu
                    </a>
                  </div>

                  {!table.active && <p className="mt-4 text-compact text-content-secondary">Bàn không hoạt động: liên kết công khai sẽ bị từ chối theo quy tắc hiện có.</p>}
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
