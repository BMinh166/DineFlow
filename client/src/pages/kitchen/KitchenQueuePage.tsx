import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChefHat, Clock3, RefreshCw } from 'lucide-react'

import { Button, useToast } from '../../components/ui'
import {
  getKitchenQueue,
  markKitchenItemCompleted,
  startPreparingKitchenItem,
} from '../../services/kitchen-queue-api'
import type { KitchenItemStatus, KitchenQueueTicket } from '../../types/kitchen'
import { getApiErrorCode, getApiErrorMessage } from '../../utils/api-error'

type KitchenTab = KitchenItemStatus
type QueueLoadOptions = {
  background?: boolean
  force?: boolean
}

const pollingIntervalMs = 10_000

const tabLabels: Record<KitchenTab, string> = {
  PENDING: 'Chờ chế biến',
  PREPARING: 'Đang chế biến',
  COMPLETED: 'Đã hoàn thành',
}

const statusClasses: Record<KitchenItemStatus, string> = {
  PENDING: 'border-kitchen-action/50 bg-kitchen-action/15 text-kitchen-action',
  PREPARING: 'border-info/50 bg-info/15 text-kitchen-text',
  COMPLETED: 'border-success/50 bg-success/15 text-kitchen-text',
}

function formatTableNumber(tableNumber: number): string {
  return String(tableNumber).padStart(2, '0')
}

function formatOrderedAt(orderedAt: string): string {
  const date = new Date(orderedAt)
  if (Number.isNaN(date.getTime())) return 'Không xác định'

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  }).format(date)
}

function KitchenTicket({
  actionItemIds,
  onComplete,
  onStartPreparing,
  ticket,
}: {
  actionItemIds: ReadonlySet<string>
  onComplete: (ticket: KitchenQueueTicket) => void
  onStartPreparing: (ticket: KitchenQueueTicket) => void
  ticket: KitchenQueueTicket
}) {
  const isActionPending = actionItemIds.has(ticket.itemId)

  return (
    <article className="flex h-full flex-col rounded-card border border-kitchen-border bg-kitchen-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-label text-kitchen-text-secondary">Bàn {formatTableNumber(ticket.tableNumber)}</p>
          <h2 className="mt-2 break-words text-section-title text-kitchen-text">{ticket.dishNameSnapshot}</h2>
        </div>
        <span className={`shrink-0 rounded-pill border px-3 py-1 text-caption font-semibold ${statusClasses[ticket.status]}`}>
          {tabLabels[ticket.status]}
        </span>
      </div>

      <dl className="mt-5 grid gap-4 border-y border-kitchen-border py-4 text-compact sm:grid-cols-2">
        <div>
          <dt className="text-kitchen-text-secondary">Số lượng</dt>
          <dd className="mt-1 text-card-title text-kitchen-text">× {ticket.quantity}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-kitchen-text-secondary"><Clock3 aria-hidden="true" className="size-4" />Gọi lúc</dt>
          <dd className="mt-1 text-card-title text-kitchen-text">{formatOrderedAt(ticket.orderedAt)}</dd>
        </div>
      </dl>

      {ticket.status === 'PENDING' && (
        <div className="mt-5">
          <Button
            aria-label={`Bắt đầu chế biến ${ticket.dishNameSnapshot} tại Bàn ${ticket.tableNumber}`}
            className="w-full !bg-kitchen-action !text-content hover:!bg-kitchen-action-hover"
            disabled={isActionPending}
            loading={isActionPending}
            onClick={() => onStartPreparing(ticket)}
          >
            Bắt đầu chế biến
          </Button>
        </div>
      )}

      {ticket.status === 'PREPARING' && (
        <div className="mt-5">
          <Button
            aria-label={`Hoàn thành ${ticket.dishNameSnapshot} tại Bàn ${ticket.tableNumber}`}
            className="w-full"
            disabled={isActionPending}
            loading={isActionPending}
            onClick={() => onComplete(ticket)}
          >
            Hoàn thành
          </Button>
        </div>
      )}

      {ticket.status === 'COMPLETED' && (
        <p className="mt-5 text-compact text-kitchen-text-secondary">Món này đã hoàn thành và không cần thao tác thêm.</p>
      )}
    </article>
  )
}

export function KitchenQueuePage() {
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<KitchenTab>('PENDING')
  const [actionItemIds, setActionItemIds] = useState<Set<string>>(() => new Set())
  const [backgroundErrorMessage, setBackgroundErrorMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [tickets, setTickets] = useState<KitchenQueueTicket[]>([])
  const actionItemIdsRef = useRef(new Set<string>())
  const hasLoadedQueueRef = useRef(false)
  const latestRequestId = useRef(0)
  const queueRequestPromiseRef = useRef<Promise<boolean> | null>(null)

  const loadQueue = useCallback((options: QueueLoadOptions = {}): Promise<boolean> => {
    const { background = false, force = false } = options
    const existingRequest = queueRequestPromiseRef.current
    if (existingRequest) {
      if (!force) return Promise.resolve(false)
      return existingRequest.then(() => loadQueue({ ...options, force: false }))
    }

    const requestId = latestRequestId.current + 1
    latestRequestId.current = requestId
    const isBackgroundRefresh = background || hasLoadedQueueRef.current

    if (!isBackgroundRefresh) {
      setIsLoading(true)
      setErrorMessage(null)
    }

    const requestPromise = (async (): Promise<boolean> => {
      try {
        const result = await getKitchenQueue()
        if (latestRequestId.current === requestId) {
          setTickets(result)
          setErrorMessage(null)
          setBackgroundErrorMessage(null)
          hasLoadedQueueRef.current = true
        }
        return true
      } catch (error) {
        if (latestRequestId.current === requestId) {
          const message = getApiErrorMessage(error, 'Không thể tải hàng đợi bếp. Vui lòng thử lại.')
          if (isBackgroundRefresh) setBackgroundErrorMessage(message)
          else setErrorMessage(message)
        }
        return false
      } finally {
        if (latestRequestId.current === requestId && !isBackgroundRefresh) setIsLoading(false)
        queueRequestPromiseRef.current = null
      }
    })()

    queueRequestPromiseRef.current = requestPromise
    return requestPromise
  }, [])

  useEffect(() => {
    void loadQueue({ force: true })
    const pollingTimer = window.setInterval(() => {
      if (actionItemIdsRef.current.size > 0) return
      void loadQueue({ background: true })
    }, pollingIntervalMs)

    return () => {
      latestRequestId.current += 1
      window.clearInterval(pollingTimer)
    }
  }, [loadQueue])

  const counts = useMemo(() => ({
    PENDING: tickets.filter(ticket => ticket.status === 'PENDING').length,
    PREPARING: tickets.filter(ticket => ticket.status === 'PREPARING').length,
    COMPLETED: tickets.filter(ticket => ticket.status === 'COMPLETED').length,
  }), [tickets])
  const visibleTickets = useMemo(
    () => tickets.filter(ticket => ticket.status === activeTab),
    [activeTab, tickets],
  )

  async function handleTransition(ticket: KitchenQueueTicket, transition: () => Promise<unknown>, successMessage: string) {
    if (actionItemIdsRef.current.has(ticket.itemId)) return

    actionItemIdsRef.current.add(ticket.itemId)
    setActionItemIds(new Set(actionItemIdsRef.current))
    try {
      await transition()
      toast.success(successMessage)
      await loadQueue({ background: true, force: true })
    } catch (error) {
      const errorCode = getApiErrorCode(error)
      if (errorCode === 'KITCHEN_ITEM_TRANSITION_CONFLICT' || errorCode === 'KITCHEN_ORDER_NOT_ELIGIBLE') {
        toast.warning('Trạng thái món đã thay đổi. Hàng đợi đang được đồng bộ lại.')
        await loadQueue({ background: true, force: true })
      } else {
        toast.error(getApiErrorMessage(error, 'Không thể cập nhật trạng thái món. Vui lòng thử lại.'))
      }
    } finally {
      actionItemIdsRef.current.delete(ticket.itemId)
      setActionItemIds(new Set(actionItemIdsRef.current))
    }
  }

  function handleStartPreparing(ticket: KitchenQueueTicket) {
    void handleTransition(
      ticket,
      () => startPreparingKitchenItem(ticket.itemId),
      `Đã bắt đầu chế biến ${ticket.dishNameSnapshot}.`,
    )
  }

  function handleComplete(ticket: KitchenQueueTicket) {
    void handleTransition(
      ticket,
      () => markKitchenItemCompleted(ticket.itemId),
      `Đã hoàn thành ${ticket.dishNameSnapshot}.`,
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div>
          <p className="text-label text-kitchen-action">Vận hành bếp</p>
          <h1 className="mt-1 text-page-title text-kitchen-text">Hàng đợi chế biến</h1>
          <p className="mt-1 text-body text-kitchen-text-secondary">Theo dõi và cập nhật món ăn từ dữ liệu đơn hàng thực tế.</p>
        </div>
        <Button
          aria-label="Làm mới hàng đợi bếp"
          className="border-kitchen-border !bg-kitchen-surface !text-kitchen-text hover:!bg-kitchen-surface-hover"
          disabled={isLoading}
          onClick={() => void loadQueue({ background: hasLoadedQueueRef.current, force: true })}
          variant="secondary"
        >
          <RefreshCw aria-hidden="true" className="size-4" />Làm mới
        </Button>
      </header>

      {!isLoading && !errorMessage && (
        <div aria-label="Các trạng thái hàng đợi bếp" className="flex gap-2 overflow-x-auto border-b border-kitchen-border" role="tablist">
          {(Object.keys(tabLabels) as KitchenTab[]).map(tab => {
            const isActive = activeTab === tab
            return (
              <button
                aria-selected={isActive}
                className={`shrink-0 border-b-2 px-3 py-3 text-label transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kitchen-action/50 focus-visible:ring-offset-2 focus-visible:ring-offset-kitchen-bg ${isActive ? 'border-kitchen-action text-kitchen-action' : 'border-transparent text-kitchen-text-secondary hover:text-kitchen-text'}`}
                key={tab}
                onClick={() => setActiveTab(tab)}
                role="tab"
                type="button"
              >
                {tabLabels[tab]} ({counts[tab]})
              </button>
            )
          })}
        </div>
      )}

      {isLoading && (
        <div className="flex min-h-48 items-center justify-center gap-3 text-kitchen-text-secondary" role="status">
          <span aria-hidden="true" className="size-5 animate-spin rounded-pill border-2 border-kitchen-action border-r-transparent" />
          <span className="text-compact">Đang tải hàng đợi bếp</span>
        </div>
      )}

      {!isLoading && errorMessage && (
        <section className="rounded-card border border-danger/60 bg-kitchen-surface p-6 text-center" role="alert">
          <h2 className="text-subsection text-kitchen-text">Không thể tải hàng đợi bếp</h2>
          <p className="mt-2 text-body text-kitchen-text-secondary">{errorMessage}</p>
          <Button className="mt-5" onClick={() => void loadQueue()} variant="secondary">Thử lại</Button>
        </section>
      )}

      {!isLoading && !errorMessage && backgroundErrorMessage && (
        <p className="rounded-control border border-warning/60 bg-kitchen-surface p-3 text-compact text-kitchen-text-secondary" role="status">
          Không thể cập nhật hàng đợi mới nhất. Dữ liệu gần nhất vẫn đang được hiển thị.
        </p>
      )}

      {!isLoading && !errorMessage && visibleTickets.length === 0 && (
        <section className="flex flex-col items-center rounded-card border border-dashed border-kitchen-border bg-kitchen-surface px-6 py-10 text-center">
          <ChefHat aria-hidden="true" className="mb-4 size-10 text-kitchen-text-secondary" />
          <h2 className="text-subsection text-kitchen-text">{activeTab === 'PENDING' ? 'Không còn món chờ chế biến' : 'Chưa có món trong mục này'}</h2>
          <p className="mt-2 max-w-md text-body text-kitchen-text-secondary">Không có món ở mục “{tabLabels[activeTab]}”.</p>
        </section>
      )}

      {!isLoading && !errorMessage && visibleTickets.length > 0 && (
        <section aria-label={tabLabels[activeTab]} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleTickets.map(ticket => (
            <KitchenTicket
              actionItemIds={actionItemIds}
              key={ticket.itemId}
              onComplete={handleComplete}
              onStartPreparing={handleStartPreparing}
              ticket={ticket}
            />
          ))}
        </section>
      )}
    </div>
  )
}
