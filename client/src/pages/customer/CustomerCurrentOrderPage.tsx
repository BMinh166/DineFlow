import { useEffect, useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { EmptyState, ErrorState, PageLoading, StatusBadge } from '../../components/ui'
import { useCustomerSession } from '../../hooks/useCustomerSession'
import { getCustomerCurrentOrder, getCustomerCurrentOrderErrorKind, type CustomerCurrentOrder } from '../../services/customer-order-api'
import { formatVnd } from '../../utils/format-vnd'

type CurrentOrderViewState = 'idle' | 'loading' | 'not-found' | 'error'

export function CustomerCurrentOrderPage() {
  const { tableId = '' } = useParams()
  const { isAuthorizedForTable, status } = useCustomerSession()
  const [order, setOrder] = useState<CustomerCurrentOrder | null>(null)
  const [orderTableId, setOrderTableId] = useState<string | null>(null)
  const [viewState, setViewState] = useState<CurrentOrderViewState>('loading')
  const [reloadKey, setReloadKey] = useState(0)
  const isAuthorized = isAuthorizedForTable(tableId)
  const currentOrder = orderTableId === tableId ? order : null

  useEffect(() => {
    let isCurrent = true

    if (status === 'restoring') return

    if (!isAuthorized) {
      setOrder(null)
      setOrderTableId(null)
      setViewState('idle')
      return
    }

    setOrder(null)
    setOrderTableId(null)
    setViewState('loading')

    void getCustomerCurrentOrder()
      .then(result => {
        if (!isCurrent) return
        setOrder(result)
        setOrderTableId(tableId)
        setViewState('idle')
      })
      .catch(error => {
        if (!isCurrent) return
        setOrder(null)
        setOrderTableId(null)
        setViewState(getCustomerCurrentOrderErrorKind(error) === 'not-found' ? 'not-found' : 'error')
      })

    return () => {
      isCurrent = false
    }
  }, [isAuthorized, reloadKey, status, tableId])

  const menuPath = `/table/${encodeURIComponent(tableId)}/menu`

  if (status === 'restoring') return <PageLoading label="Đang kiểm tra trạng thái vào bàn" />

  if (!isAuthorized) {
    return <EmptyState action={<Link className="inline-flex min-h-10 items-center justify-center rounded-control bg-brand px-4 py-2 text-label font-semibold text-on-primary transition-colors hover:bg-brand-hover" to={menuPath}>Về thực đơn</Link>} description="Vui lòng vào bàn để xem đơn hiện tại của bạn." icon={ClipboardList} title="Chưa xác nhận vào bàn" />
  }

  if (viewState === 'loading') return <PageLoading label="Đang tải đơn hiện tại" />

  if (viewState === 'not-found') {
    return <EmptyState action={<Link className="inline-flex min-h-10 items-center justify-center rounded-control bg-brand px-4 py-2 text-label font-semibold text-on-primary transition-colors hover:bg-brand-hover" to={menuPath}>Gọi món</Link>} description="Hiện chưa có đơn đang phục vụ cho phiên vào bàn này." icon={ClipboardList} title="Chưa có đơn hiện tại" />
  }

  if (viewState === 'error' || !currentOrder) {
    return <ErrorState description="Không thể tải đơn hiện tại. Vui lòng thử lại sau." onRetry={() => setReloadKey(key => key + 1)} title="Không thể tải đơn" />
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-label text-brand">Đơn của bạn</p>
          <h1 className="mt-1 text-page-title text-content">Đơn hiện tại</h1>
        </div>
        <StatusBadge entity="order" status={currentOrder.status} />
      </header>

      {currentOrder.items.length === 0 ? (
        <EmptyState action={<Link className="inline-flex min-h-10 items-center justify-center rounded-control bg-brand px-4 py-2 text-label font-semibold text-on-primary transition-colors hover:bg-brand-hover" to={menuPath}>Gọi món</Link>} description="Bạn có thể chọn món từ thực đơn để bắt đầu." icon={ClipboardList} title="Đơn hiện tại chưa có món" />
      ) : (
        <ul className="space-y-3" aria-label="Các món đã gọi">
          {currentOrder.items.map(item => (
            <li className="rounded-card border border-border bg-surface p-4" key={item.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="break-words text-card-title text-content">{item.dishName}</h2>
                  <p className="mt-1 text-compact text-content-secondary">{formatVnd(item.unitPrice)} × {item.quantity}</p>
                </div>
                <StatusBadge entity="order-item" status={item.status} />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
                <span className="text-compact text-content-secondary">Thành tiền</span>
                <span className="text-label text-content">{formatVnd(item.unitPrice * item.quantity)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <section className="rounded-card border border-brand-border bg-brand-soft p-4 sm:p-5" aria-label="Tổng đơn hàng">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-label text-brand">Tổng cộng</p><p className="mt-1 text-price-lg text-content">{formatVnd(currentOrder.total)}</p></div>
          <Link className="inline-flex min-h-10 items-center justify-center rounded-control border border-border bg-surface px-4 py-2 text-label font-semibold text-content transition-colors hover:bg-surface-muted" to={menuPath}>Gọi thêm món</Link>
        </div>
      </section>
    </div>
  )
}
