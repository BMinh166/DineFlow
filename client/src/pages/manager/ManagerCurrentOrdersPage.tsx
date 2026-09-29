import { useEffect, useState } from 'react'
import { ClipboardList, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button, Card, EmptyState, ErrorState, PageHeader, PageLoading, StatusBadge } from '../../components/ui'
import { getManagerCurrentOrders } from '../../services/manager-current-order-api'
import type { ManagerCurrentOrder } from '../../types/manager-order'
import { formatVnd } from '../../utils/format-vnd'

function formatCreatedAt(value: string): string {
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

export function ManagerCurrentOrdersPage() {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState<ManagerCurrentOrder[]>([])
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isCurrent = true

    async function loadOrders() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const result = await getManagerCurrentOrders()
        if (isCurrent) setOrders(result)
      } catch {
        if (isCurrent) setErrorMessage('Không thể tải các đơn hiện tại. Vui lòng thử lại.')
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    void loadOrders()
    return () => {
      isCurrent = false
    }
  }, [reloadKey])

  return (
    <div className="space-y-6">
      <PageHeader
        actions={<Button disabled={isLoading} onClick={() => setReloadKey(key => key + 1)} variant="secondary"><RefreshCw aria-hidden="true" className="size-4" />Làm mới</Button>}
        description="Theo dõi các đơn đang được phục vụ và chờ thanh toán."
        title="Đơn hiện tại"
      />

      {isLoading && <PageLoading label="Đang tải các đơn hiện tại" />}
      {!isLoading && errorMessage && (
        <ErrorState
          description={errorMessage}
          onRetry={() => setReloadKey(key => key + 1)}
          title="Không thể tải đơn hiện tại"
        />
      )}
      {!isLoading && !errorMessage && orders.length === 0 && (
        <EmptyState
          description="Hiện chưa có đơn nào đang hoạt động."
          icon={ClipboardList}
          title="Chưa có đơn hiện tại"
        />
      )}
      {!isLoading && !errorMessage && orders.length > 0 && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table aria-label="Danh sách đơn hiện tại" className="w-full min-w-[760px] text-left">
              <thead className="border-b border-border bg-surface-muted text-caption font-semibold text-content-secondary">
                <tr>
                  <th className="px-5 py-3" scope="col">Đơn hàng</th>
                  <th className="px-5 py-3" scope="col">Bàn</th>
                  <th className="px-5 py-3" scope="col">Thời gian tạo</th>
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
                    <td className="whitespace-nowrap px-5 py-4 text-compact text-content-secondary">{formatCreatedAt(order.createdAt)}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-compact text-content">{order.itemCount}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-compact font-medium text-content">{formatVnd(order.total)}</td>
                    <td className="px-5 py-4"><StatusBadge entity="order" status={order.status} /></td>
                    <td className="px-5 py-4"><Button aria-label={`Xem đơn ${formatOrderId(order.id)}`} onClick={() => navigate(`/manager/orders/${order.id}`)} size="sm" variant="secondary">Xem</Button></td>
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
