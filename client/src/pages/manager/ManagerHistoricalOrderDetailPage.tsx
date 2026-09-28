import { useEffect, useState } from 'react'
import { ArrowLeft, ClipboardList, RefreshCw } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import { Button, Card, EmptyState, ErrorState, PageHeader, PageLoading, StatusBadge } from '../../components/ui'
import { getManagerHistoricalOrder } from '../../services/manager-history-api'
import type { ManagerHistoricalOrder } from '../../types/manager-history'
import { getApiErrorCode } from '../../utils/api-error'
import { formatVnd } from '../../utils/format-vnd'

function formatDateTime(value: string): string {
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

export function ManagerHistoricalOrderDetailPage() {
  const navigate = useNavigate()
  const { orderId = '' } = useParams()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isNotFound, setIsNotFound] = useState(false)
  const [order, setOrder] = useState<ManagerHistoricalOrder | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isCurrent = true

    async function loadOrder() {
      setIsLoading(true)
      setErrorMessage(null)
      setIsNotFound(false)
      setOrder(null)

      try {
        const result = await getManagerHistoricalOrder(orderId)
        if (isCurrent) setOrder(result)
      } catch (error) {
        if (!isCurrent) return

        if (getApiErrorCode(error) === 'HISTORICAL_ORDER_NOT_FOUND') {
          setIsNotFound(true)
        } else {
          setErrorMessage('Không thể tải chi tiết lịch sử đơn hàng. Vui lòng thử lại.')
        }
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    void loadOrder()
    return () => {
      isCurrent = false
    }
  }, [orderId, reloadKey])

  const backToHistory = () => navigate('/manager/history')

  if (isLoading) return <PageLoading label="Đang tải chi tiết lịch sử đơn hàng" />

  if (isNotFound) {
    return (
      <EmptyState
        action={<Button onClick={backToHistory}><ArrowLeft aria-hidden="true" className="size-4" />Về lịch sử đơn hàng</Button>}
        description="Không tìm thấy đơn hàng lịch sử này hoặc đơn không còn khả dụng."
        icon={ClipboardList}
        title="Không tìm thấy đơn hàng"
      />
    )
  }

  if (errorMessage || !order) {
    return (
      <ErrorState
        action={<Button onClick={backToHistory} variant="secondary"><ArrowLeft aria-hidden="true" className="size-4" />Về lịch sử đơn hàng</Button>}
        description={errorMessage ?? 'Không thể tải chi tiết lịch sử đơn hàng. Vui lòng thử lại.'}
        onRetry={() => setReloadKey(key => key + 1)}
        title="Không thể tải chi tiết đơn hàng"
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={(
          <div className="flex flex-wrap gap-2">
            <Button onClick={backToHistory} variant="secondary"><ArrowLeft aria-hidden="true" className="size-4" />Về lịch sử đơn hàng</Button>
            <Button aria-label="Làm mới chi tiết lịch sử đơn hàng" onClick={() => setReloadKey(key => key + 1)} variant="secondary"><RefreshCw aria-hidden="true" className="size-4" />Làm mới</Button>
          </div>
        )}
        description={`Đơn ${formatOrderId(order.id)} đã đóng tại Bàn ${order.table.number}`}
        title="Chi tiết lịch sử đơn hàng"
      />

      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-label text-content-secondary">Đơn hàng</p>
            <p className="mt-1 text-subsection text-content" title={order.id}>{formatOrderId(order.id)}</p>
          </div>
          <StatusBadge entity="order" status={order.status} />
        </div>
        <dl className="mt-5 grid gap-4 border-t border-border pt-5 text-compact sm:grid-cols-2 lg:grid-cols-4">
          <div><dt className="text-content-muted">Bàn</dt><dd className="mt-1 font-medium text-content">Bàn {order.table.number}</dd></div>
          <div><dt className="text-content-muted">Thời gian tạo</dt><dd className="mt-1 font-medium text-content">{formatDateTime(order.createdAt)}</dd></div>
          <div><dt className="text-content-muted">Thời gian đóng</dt><dd className="mt-1 font-medium text-content">{formatDateTime(order.closedAt)}</dd></div>
          <div><dt className="text-content-muted">Tổng tiền</dt><dd className="mt-1 text-price-lg text-content">{formatVnd(order.total)}</dd></div>
        </dl>
      </Card>

      <section aria-labelledby="historical-order-items-heading">
        <h2 className="text-subsection text-content" id="historical-order-items-heading">Món đã gọi</h2>
        {order.items.length === 0 ? (
          <EmptyState className="mt-4" description="Đơn hàng lịch sử này không có món nào." icon={ClipboardList} title="Không có món" />
        ) : (
          <Card className="mt-4 overflow-hidden">
            <div className="overflow-x-auto">
              <table aria-label="Các món trong đơn hàng lịch sử" className="w-full min-w-[720px] text-left">
                <thead className="border-b border-border bg-surface-muted text-caption font-semibold text-content-secondary">
                  <tr>
                    <th className="px-5 py-3" scope="col">Tên món</th>
                    <th className="px-5 py-3" scope="col">Đơn giá</th>
                    <th className="px-5 py-3" scope="col">Số lượng</th>
                    <th className="px-5 py-3" scope="col">Thành tiền</th>
                    <th className="px-5 py-3" scope="col">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {order.items.map(item => (
                    <tr className="align-middle" key={item.id}>
                      <td className="px-5 py-4 text-compact font-medium text-content">{item.dishNameSnapshot}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-compact text-content">{formatVnd(item.unitPriceSnapshot)}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-compact text-content">{item.quantity}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-compact font-medium text-content">{formatVnd(item.unitPriceSnapshot * item.quantity)}</td>
                      <td className="px-5 py-4"><StatusBadge entity="order-item" status={item.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>
    </div>
  )
}
