import { useEffect, useState, type FormEvent } from 'react'
import { History } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button, Card, EmptyState, ErrorState, FilterBar, Input, PageHeader, PageLoading, StatusBadge } from '../../components/ui'
import { getManagerHistory } from '../../services/manager-history-api'
import type { ManagerHistoryFilters, ManagerHistoryOrder } from '../../types/manager-history'
import { formatVnd } from '../../utils/format-vnd'

function formatClosedAt(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function formatOrderId(orderId: string): string {
  return `#${orderId.slice(-6).toUpperCase()}`
}

export function ManagerHistoryPage() {
  const navigate = useNavigate()
  const [appliedFilters, setAppliedFilters] = useState<ManagerHistoryFilters>({})
  const [dateFrom, setDateFrom] = useState('')
  const [dateRangeError, setDateRangeError] = useState<string | null>(null)
  const [dateTo, setDateTo] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState<ManagerHistoryOrder[]>([])
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isCurrent = true

    async function loadHistory() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const result = await getManagerHistory(appliedFilters)
        if (isCurrent) setOrders(result)
      } catch {
        if (isCurrent) setErrorMessage('Không thể tải lịch sử đơn hàng. Vui lòng thử lại.')
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    void loadHistory()
    return () => {
      isCurrent = false
    }
  }, [appliedFilters, reloadKey])

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (dateFrom && dateTo && dateFrom > dateTo) {
      setDateRangeError('Từ ngày không được sau Đến ngày.')
      return
    }

    setDateRangeError(null)
    setAppliedFilters({
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
    })
  }

  function clearFilters() {
    setDateFrom('')
    setDateTo('')
    setDateRangeError(null)
    setAppliedFilters({})
  }

  const hasAppliedFilters = Boolean(appliedFilters.dateFrom || appliedFilters.dateTo)

  return (
    <div className="space-y-6">
      <PageHeader
        description="Xem các đơn đã đóng theo thời gian hoàn tất."
        title="Lịch sử đơn hàng"
      />

      <Card className="p-4 sm:p-5">
        <form onSubmit={handleFilterSubmit}>
          <FilterBar>
            <div className="w-full sm:w-52">
              <Input label="Từ ngày" max={dateTo || undefined} onChange={event => setDateFrom(event.target.value)} type="date" value={dateFrom} />
            </div>
            <div className="w-full sm:w-52">
              <Input error={dateRangeError ?? undefined} label="Đến ngày" min={dateFrom || undefined} onChange={event => setDateTo(event.target.value)} type="date" value={dateTo} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit">Lọc</Button>
              <Button onClick={clearFilters} type="button" variant="secondary">Xóa lọc</Button>
            </div>
          </FilterBar>
        </form>
      </Card>

      {isLoading && <PageLoading label="Đang tải lịch sử đơn hàng" />}
      {!isLoading && errorMessage && (
        <ErrorState
          description={errorMessage}
          onRetry={() => setReloadKey(key => key + 1)}
          title="Không thể tải lịch sử đơn hàng"
        />
      )}
      {!isLoading && !errorMessage && orders.length === 0 && (
        <EmptyState
          description={hasAppliedFilters ? 'Không tìm thấy đơn đã đóng trong khoảng thời gian đã chọn.' : 'Hiện chưa có đơn đã đóng nào.'}
          icon={History}
          title={hasAppliedFilters ? 'Không có kết quả phù hợp' : 'Chưa có lịch sử đơn hàng'}
        />
      )}
      {!isLoading && !errorMessage && orders.length > 0 && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table aria-label="Danh sách lịch sử đơn hàng" className="w-full min-w-[760px] text-left">
              <thead className="border-b border-border bg-surface-muted text-caption font-semibold text-content-secondary">
                <tr>
                  <th className="px-5 py-3" scope="col">Đơn hàng</th>
                  <th className="px-5 py-3" scope="col">Bàn</th>
                  <th className="px-5 py-3" scope="col">Thời gian đóng</th>
                  <th className="px-5 py-3" scope="col">Món</th>
                  <th className="px-5 py-3" scope="col">Tổng tiền</th>
                  <th className="px-5 py-3" scope="col">Trạng thái</th>
                  <th className="px-5 py-3" scope="col">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map(order => (
                  <tr className="align-middle" key={order.id}>
                    <td className="px-5 py-4 text-compact font-medium text-content" title={order.id}>{formatOrderId(order.id)}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-compact text-content">Bàn {order.table.number}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-compact text-content-secondary">{formatClosedAt(order.closedAt)}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-compact text-content">{order.itemCount}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-compact font-medium text-content">{formatVnd(order.total)}</td>
                    <td className="px-5 py-4"><StatusBadge entity="order" status={order.status} /></td>
                    <td className="px-5 py-4"><Button aria-label={`Xem đơn ${formatOrderId(order.id)}`} onClick={() => navigate(`/manager/history/${order.id}`)} size="sm" variant="secondary">Xem</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
