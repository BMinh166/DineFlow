import { useEffect, useRef, useState } from 'react'
import { ClipboardList, RefreshCw } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { Button, ConfirmDialog, EmptyState, ErrorState, PageLoading, StatusBadge, useToast } from '../../components/ui'
import { useCustomerSession } from '../../hooks/useCustomerSession'
import { getCustomerCurrentOrder, getCustomerCurrentOrderErrorKind, requestCustomerOrderPayment, type CustomerCurrentOrder } from '../../services/customer-order-api'
import { getPublicTable } from '../../services/public-menu-api'
import { formatVnd } from '../../utils/format-vnd'

type CurrentOrderViewState = 'idle' | 'loading' | 'not-found' | 'error'

const pollingIntervalMs = 10_000

export function CustomerCurrentOrderPage() {
  const { tableId = '' } = useParams()
  const { isAuthorizedForTable, sessionExpired, status } = useCustomerSession()
  const [order, setOrder] = useState<CustomerCurrentOrder | null>(null)
  const [orderTableId, setOrderTableId] = useState<string | null>(null)
  const [tableNumber, setTableNumber] = useState<number | null>(null)
  const [viewState, setViewState] = useState<CurrentOrderViewState>('loading')
  const [reloadKey, setReloadKey] = useState(0)
  const [hasBackgroundRefreshError, setHasBackgroundRefreshError] = useState(false)
  const [isPaymentRequestDialogOpen, setIsPaymentRequestDialogOpen] = useState(false)
  const loadedTableIdRef = useRef<string | null>(null)
  const isAuthorized = isAuthorizedForTable(tableId)
  const currentOrder = orderTableId === tableId ? order : null
  const toast = useToast()

  useEffect(() => {
    let isCurrent = true

    void getPublicTable(tableId)
      .then(table => {
        if (isCurrent) setTableNumber(table.number)
      })
      .catch(() => {
        if (isCurrent) setTableNumber(null)
      })

    return () => {
      isCurrent = false
    }
  }, [tableId])

  useEffect(() => {
    let isCurrent = true
    let requestInFlight = false
    const abortController = new AbortController()

    if (status === 'restoring') return

    if (!isAuthorized) {
      setOrder(null)
      setOrderTableId(null)
      setViewState('idle')
      setHasBackgroundRefreshError(false)
      loadedTableIdRef.current = null
      return
    }

    const isInitialLoad = loadedTableIdRef.current !== tableId
    if (isInitialLoad) {
      setOrder(null)
      setOrderTableId(null)
      setViewState('loading')
      setHasBackgroundRefreshError(false)
    }

    async function refreshCurrentOrder() {
      if (requestInFlight) return
      requestInFlight = true

      try {
        const result = await getCustomerCurrentOrder(abortController.signal)
        if (!isCurrent) return
        loadedTableIdRef.current = tableId
        setOrder(result)
        setOrderTableId(tableId)
        setViewState('idle')
        setHasBackgroundRefreshError(false)
      } catch (error) {
        if (!isCurrent || abortController.signal.aborted) return

        const errorKind = getCustomerCurrentOrderErrorKind(error)
        if (errorKind === 'not-found' || errorKind === 'session-expired' || loadedTableIdRef.current !== tableId) {
          if (errorKind === 'session-expired') loadedTableIdRef.current = null
          setOrder(null)
          setOrderTableId(null)
          setViewState(errorKind === 'not-found' ? 'not-found' : 'error')
        } else {
          setHasBackgroundRefreshError(true)
        }
      } finally {
        requestInFlight = false
      }
    }

    void refreshCurrentOrder()
    const pollingTimer = window.setInterval(() => void refreshCurrentOrder(), pollingIntervalMs)

    return () => {
      isCurrent = false
      window.clearInterval(pollingTimer)
      abortController.abort()
    }
  }, [isAuthorized, reloadKey, status, tableId])

  const menuPath = `/table/${encodeURIComponent(tableId)}/menu`
  const canAddItems = currentOrder?.status === 'OPEN'

  async function handleRequestPayment() {
    await requestCustomerOrderPayment()
    setReloadKey(key => key + 1)
    toast.success('Đã gửi yêu cầu thanh toán. Đơn hiện không thể gọi thêm món.')
  }

  if (status === 'restoring') return <PageLoading label="Đang kiểm tra trạng thái vào bàn" />

  if (!isAuthorized) {
    return <EmptyState action={<Link className="inline-flex min-h-10 items-center justify-center rounded-control bg-brand px-4 py-2 text-label font-semibold text-on-primary transition-colors hover:bg-brand-hover" to={menuPath}>Về thực đơn</Link>} description={sessionExpired ? 'Phiên phục vụ đã kết thúc. Vui lòng nhập mã mới nếu nhân viên mở phiên phục vụ mới.' : 'Vui lòng vào bàn để xem đơn hiện tại của bạn.'} icon={ClipboardList} title={sessionExpired ? 'Phiên vào bàn đã kết thúc' : 'Chưa xác nhận vào bàn'} />
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
          {tableNumber !== null && <p className="mt-1 text-compact text-content-secondary">Bàn {tableNumber}</p>}
        </div>
        <div className="flex items-center gap-3"><StatusBadge entity="order" status={currentOrder.status} /><Button aria-label="Làm mới đơn hiện tại" onClick={() => setReloadKey(key => key + 1)} size="sm" variant="secondary"><RefreshCw aria-hidden="true" className="size-4" />Làm mới</Button></div>
      </header>

      {hasBackgroundRefreshError && <p className="rounded-control border border-warning bg-warning-soft p-3 text-compact text-warning" role="status">Không thể cập nhật đơn hiện tại. Dữ liệu gần nhất vẫn đang được hiển thị.</p>}

      {currentOrder.status === 'PAYMENT_REQUESTED' && <section className="rounded-card border border-warning bg-warning-soft p-4" role="status"><h2 className="text-card-title text-content">Đã yêu cầu thanh toán</h2><p className="mt-2 text-compact text-content-secondary">Đơn đã được khóa để gọi thêm món. Vui lòng chờ nhân viên hỗ trợ thanh toán.</p></section>}

      {currentOrder.items.length === 0 ? (
        <EmptyState action={canAddItems ? <Link className="inline-flex min-h-10 items-center justify-center rounded-control bg-brand px-4 py-2 text-label font-semibold text-on-primary transition-colors hover:bg-brand-hover" to={menuPath}>Gọi món</Link> : undefined} description={canAddItems ? 'Bạn có thể chọn món từ thực đơn để bắt đầu.' : 'Đơn hiện không thể nhận thêm món.'} icon={ClipboardList} title="Đơn hiện tại chưa có món" />
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
          <div className="flex flex-wrap gap-2">{canAddItems && <Link className="inline-flex min-h-10 items-center justify-center rounded-control border border-border bg-surface px-4 py-2 text-label font-semibold text-content transition-colors hover:bg-surface-muted" to={menuPath}>Gọi thêm món</Link>}{canAddItems && <Button onClick={() => setIsPaymentRequestDialogOpen(true)} variant="secondary">Yêu cầu thanh toán</Button>}</div>
        </div>
      </section>
      <ConfirmDialog cancelLabel="Hủy" confirmLabel="Gửi yêu cầu" description={<><span className="block">{tableNumber !== null ? `Bàn ${tableNumber}. ` : ''}Tổng thanh toán hiện tại: {formatVnd(currentOrder.total)}.</span><span className="mt-2 block">Sau khi gửi yêu cầu, đơn này sẽ được khóa và bạn sẽ không thể gọi thêm món.</span></>} isOpen={isPaymentRequestDialogOpen} onClose={() => setIsPaymentRequestDialogOpen(false)} onConfirm={handleRequestPayment} onError={() => { setIsPaymentRequestDialogOpen(false); setReloadKey(key => key + 1); toast.error('Không thể xác nhận yêu cầu thanh toán. Đơn đang được tải lại.'); }} title="Yêu cầu thanh toán?" />
    </div>
  )
}
