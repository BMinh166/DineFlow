import { useEffect, useMemo, useState } from 'react'
import { RefreshCw, TableProperties } from 'lucide-react'

import { Badge, Button, Card, EmptyState, ErrorState, PageHeader, PageLoading, StatusBadge } from '../../components/ui'
import { getWaiterTables } from '../../services/waiter-table-api'
import type { WaiterTable } from '../../types/table'
import { getApiErrorMessage } from '../../utils/api-error'

type TableFilter = 'ALL' | 'AVAILABLE' | 'OCCUPIED' | 'PAYMENT_REQUESTED'

type FilterOption = {
  id: TableFilter
  label: string
}

const filterOptions: FilterOption[] = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'AVAILABLE', label: 'Trống' },
  { id: 'OCCUPIED', label: 'Đang phục vụ' },
  { id: 'PAYMENT_REQUESTED', label: 'Yêu cầu thanh toán' },
]

function matchesFilter(table: WaiterTable, filter: TableFilter): boolean {
  switch (filter) {
    case 'AVAILABLE':
      return table.active && table.status === 'AVAILABLE'
    case 'OCCUPIED':
      return table.active && table.status === 'OCCUPIED'
    case 'PAYMENT_REQUESTED':
      return table.orderStatus === 'PAYMENT_REQUESTED'
    case 'ALL':
      return true
  }
}

function getTableDescription(table: WaiterTable): string {
  if (!table.active) return 'Bàn đã ngừng hoạt động và không dùng cho phục vụ.'
  if (table.orderStatus === 'PAYMENT_REQUESTED') return 'Cần xử lý yêu cầu thanh toán.'
  if (table.status === 'OCCUPIED') return 'Đang phục vụ khách tại bàn.'
  return 'Sẵn sàng phục vụ khách mới.'
}

function getOrderLabel(orderStatus: WaiterTable['orderStatus']): string {
  if (!orderStatus) return 'Chưa có'
  if (orderStatus === 'OPEN') return 'Đang mở'
  if (orderStatus === 'PAYMENT_REQUESTED') return 'Yêu cầu thanh toán'
  return 'Đã đóng'
}

function TableCard({ table }: { table: WaiterTable }) {
  const isPaymentRequested = table.orderStatus === 'PAYMENT_REQUESTED'

  return (
    <Card className={`h-full p-5 ${isPaymentRequested ? 'border-danger bg-danger-soft/30' : ''}`}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <TableProperties aria-hidden="true" className="size-5 shrink-0 text-brand" />
              <h2 className="text-subsection text-content">Bàn {table.number}</h2>
            </div>
            <p className="mt-2 text-compact text-content-secondary">{getTableDescription(table)}</p>
          </div>
          <div className="flex shrink-0 flex-wrap justify-end gap-2" aria-label={`Trạng thái bàn ${table.number}`}>
            {isPaymentRequested && <Badge variant="danger">Yêu cầu thanh toán</Badge>}
            <StatusBadge entity="table" status={table.status} />
          </div>
        </div>

        <dl className="grid gap-3 border-y border-border py-4 text-compact sm:grid-cols-2">
          <div>
            <dt className="text-content-muted">Vòng đời bàn</dt>
            <dd className="mt-1"><StatusBadge entity="category" status={table.active ? 'ACTIVE' : 'INACTIVE'} /></dd>
          </div>
          <div>
            <dt className="text-content-muted">Phiên hiện tại</dt>
            <dd className="mt-1"><Badge variant={table.hasActiveSession ? 'info' : 'neutral'}>{table.hasActiveSession ? 'Có phiên hoạt động' : 'Chưa có phiên hoạt động'}</Badge></dd>
          </div>
          <div>
            <dt className="text-content-muted">Đơn hiện tại</dt>
            <dd className="mt-1 font-medium text-content">{getOrderLabel(table.orderStatus)}</dd>
          </div>
          <div>
            <dt className="text-content-muted">Trạng thái vận hành</dt>
            <dd className="mt-1 font-medium text-content">{table.status === 'AVAILABLE' ? 'Trống' : 'Đang phục vụ'}</dd>
          </div>
        </dl>

        {!table.active && <p className="text-compact text-content-secondary">Bàn này không khả dụng cho thao tác phục vụ.</p>}
      </div>
    </Card>
  )
}

export function WaiterTableBoardPage() {
  const [activeFilter, setActiveFilter] = useState<TableFilter>('ALL')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)
  const [tables, setTables] = useState<WaiterTable[]>([])

  useEffect(() => {
    let isCurrent = true

    async function loadTables() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const result = await getWaiterTables()
        if (isCurrent) setTables(result)
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(getApiErrorMessage(error, 'Không thể tải danh sách bàn. Vui lòng thử lại.'))
        }
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    void loadTables()
    return () => {
      isCurrent = false
    }
  }, [reloadKey])

  const filteredTables = useMemo(
    () => tables.filter(table => matchesFilter(table, activeFilter)),
    [activeFilter, tables],
  )
  const filterCounts = useMemo(
    () => new Map(filterOptions.map(filter => [filter.id, tables.filter(table => matchesFilter(table, filter.id)).length])),
    [tables],
  )

  function reloadTables() {
    setReloadKey(key => key + 1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={<Button disabled={isLoading} onClick={reloadTables} variant="secondary"><RefreshCw aria-hidden="true" className="size-4" />Làm mới</Button>}
        description="Theo dõi trạng thái vận hành bàn từ hệ thống."
        title="Danh sách bàn"
      />

      {!isLoading && !errorMessage && tables.length > 0 && (
        <div aria-label="Bộ lọc danh sách bàn" className="flex flex-wrap gap-2">
          {filterOptions.map(filter => {
            const isActive = activeFilter === filter.id
            const count = filterCounts.get(filter.id) ?? 0

            return (
              <Button aria-pressed={isActive} key={filter.id} onClick={() => setActiveFilter(filter.id)} variant={isActive ? 'primary' : 'secondary'}>
                {filter.label} ({count})
              </Button>
            )
          })}
        </div>
      )}

      {isLoading && <PageLoading label="Đang tải danh sách bàn" />}
      {!isLoading && errorMessage && <ErrorState description={errorMessage} onRetry={reloadTables} title="Không thể tải danh sách bàn" />}
      {!isLoading && !errorMessage && tables.length === 0 && <EmptyState description="Hiện chưa có bàn nào để phục vụ." icon={TableProperties} title="Chưa có bàn" />}
      {!isLoading && !errorMessage && tables.length > 0 && filteredTables.length === 0 && (
        <EmptyState description="Không có bàn phù hợp với bộ lọc hiện tại." icon={TableProperties} title="Không tìm thấy bàn phù hợp" />
      )}
      {!isLoading && !errorMessage && filteredTables.length > 0 && (
        <ul aria-label="Danh sách bàn phục vụ" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTables.map(table => <li key={table.id}><TableCard table={table} /></li>)}
        </ul>
      )}
    </div>
  )
}
