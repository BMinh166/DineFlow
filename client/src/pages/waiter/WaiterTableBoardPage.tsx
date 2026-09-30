import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { Clipboard, RefreshCw, TableProperties } from 'lucide-react'

import { Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, Modal, PageHeader, PageLoading, StatusBadge, useToast } from '../../components/ui'
import { cancelWaiterPaymentRequest, confirmWaiterPayment, getWaiterActiveTableSession, getWaiterTables, openWaiterTable } from '../../services/waiter-table-api'
import type { OpenWaiterTableResult, WaiterActiveTableSession, WaiterTable } from '../../types/table'
import { getApiErrorMessage } from '../../utils/api-error'
import { formatVnd } from '../../utils/format-vnd'
import { WaiterAssistedOrderingModal } from './WaiterAssistedOrderingModal'

type TableFilter = 'ALL' | 'AVAILABLE' | 'OCCUPIED' | 'PAYMENT_REQUESTED'
type SessionTable = Pick<WaiterTable, 'id' | 'number'> | OpenWaiterTableResult['table']
type SessionDetail = WaiterActiveTableSession
type SessionRefreshMode = 'background' | 'initial'
type TableRefreshMode = 'background' | 'initial'

const pollingIntervalMs = 10_000

const filterOptions: { id: TableFilter; label: string }[] = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'AVAILABLE', label: 'Trống' },
  { id: 'OCCUPIED', label: 'Đang phục vụ' },
  { id: 'PAYMENT_REQUESTED', label: 'Yêu cầu thanh toán' },
]

function matchesFilter(table: WaiterTable, filter: TableFilter): boolean {
  if (filter === 'AVAILABLE') return table.active && table.status === 'AVAILABLE'
  if (filter === 'OCCUPIED') return table.active && table.status === 'OCCUPIED'
  if (filter === 'PAYMENT_REQUESTED') return table.orderStatus === 'PAYMENT_REQUESTED'
  return true
}

function getApiErrorCode(error: unknown): string | undefined {
  if (!axios.isAxiosError(error)) return undefined
  return typeof error.response?.data?.code === 'string' ? error.response.data.code : undefined
}

function getOpenTableErrorMessage(error: unknown): string {
  switch (getApiErrorCode(error)) {
    case 'INVALID_OBJECT_ID': return 'Mã bàn không hợp lệ. Vui lòng tải lại danh sách.'
    case 'TABLE_NOT_FOUND': return 'Không tìm thấy bàn. Vui lòng tải lại danh sách.'
    case 'TABLE_INACTIVE': return 'Bàn này không hoạt động và không thể mở.'
    case 'TABLE_ALREADY_OCCUPIED': return 'Bàn này đã được mở bởi một nhân viên khác.'
    case 'TABLE_HAS_ACTIVE_SESSION': return 'Bàn này đang có phiên phục vụ hoạt động.'
    case 'TABLE_OPEN_CONFLICT': return 'Bàn không còn sẵn sàng để mở. Danh sách đã được tải lại.'
    case 'JOIN_CODE_GENERATION_EXHAUSTED': return 'Chưa thể tạo mã vào bàn. Vui lòng thử lại sau.'
    default: return getApiErrorMessage(error, 'Không thể mở bàn. Vui lòng thử lại.')
  }
}

function getSessionErrorMessage(error: unknown): string {
  switch (getApiErrorCode(error)) {
    case 'INVALID_OBJECT_ID': return 'Mã bàn không hợp lệ. Vui lòng tải lại danh sách.'
    case 'TABLE_NOT_FOUND': return 'Không tìm thấy bàn. Vui lòng tải lại danh sách.'
    case 'TABLE_INACTIVE': return 'Bàn này không còn hoạt động. Vui lòng tải lại danh sách.'
    case 'TABLE_NOT_OCCUPIED': return 'Bàn này hiện không được phục vụ. Vui lòng tải lại danh sách.'
    case 'ACTIVE_TABLE_SESSION_NOT_FOUND': return 'Bàn này hiện không có phiên phục vụ hoạt động. Vui lòng tải lại danh sách.'
    case 'CURRENT_ORDER_NOT_FOUND': return 'Không thể xác định đơn hiện tại của bàn. Vui lòng tải lại danh sách.'
    case 'ACTIVE_TABLE_SESSION_INCONSISTENT': return 'Dữ liệu phiên phục vụ không nhất quán. Vui lòng tải lại danh sách.'
    default: return getApiErrorMessage(error, 'Không thể tải phiên phục vụ. Vui lòng thử lại.')
  }
}

function getCancelPaymentRequestErrorMessage(error: unknown): string {
  switch (getApiErrorCode(error)) {
    case 'ORDER_ALREADY_OPEN': return 'Đơn đã được mở lại. Chi tiết bàn đang được tải lại.'
    case 'ORDER_CLOSED': return 'Đơn đã đóng và không thể mở lại để gọi thêm món.'
    case 'ORDER_NOT_PAYMENT_REQUESTED': return 'Yêu cầu thanh toán đã thay đổi. Chi tiết bàn đang được tải lại.'
    case 'TABLE_INACTIVE':
    case 'TABLE_NOT_OCCUPIED':
    case 'ACTIVE_TABLE_SESSION_NOT_FOUND':
    case 'CURRENT_ORDER_NOT_FOUND': return 'Trạng thái bàn hoặc đơn đã thay đổi. Chi tiết bàn đang được tải lại.'
    default: return getApiErrorMessage(error, 'Không thể hủy yêu cầu thanh toán. Chi tiết bàn đang được tải lại.')
  }
}

function getConfirmPaymentErrorMessage(error: unknown): string {
  switch (getApiErrorCode(error)) {
    case 'ORDER_ITEMS_NOT_COMPLETED': return 'Tất cả món phải hoàn thành trước khi xác nhận thanh toán.'
    case 'ORDER_NOT_PAYMENT_REQUESTED': return 'Trạng thái thanh toán đã thay đổi. Chi tiết bàn đang được tải lại.'
    case 'ORDER_CLOSED': return 'Đơn đã được đóng. Danh sách bàn đang được tải lại.'
    case 'PAYMENT_CONFIRMATION_CONFLICT': return 'Trạng thái thanh toán đã thay đổi trong lúc xác nhận. Dữ liệu đang được tải lại.'
    case 'TABLE_NOT_FOUND':
    case 'TABLE_INACTIVE':
    case 'TABLE_NOT_OCCUPIED':
    case 'ACTIVE_TABLE_SESSION_NOT_FOUND':
    case 'CURRENT_ORDER_NOT_FOUND': return 'Trạng thái phiên phục vụ đã thay đổi. Dữ liệu đang được tải lại.'
    default: return getApiErrorMessage(error, 'Không thể xác nhận thanh toán. Dữ liệu đang được tải lại.')
  }
}

function shouldCloseStaleSessionAfterPaymentError(error: unknown): boolean {
  return [
    'ACTIVE_TABLE_SESSION_NOT_FOUND',
    'CURRENT_ORDER_NOT_FOUND',
    'ORDER_CLOSED',
    'TABLE_INACTIVE',
    'TABLE_NOT_FOUND',
    'TABLE_NOT_OCCUPIED',
  ].includes(getApiErrorCode(error) ?? '')
}

function formatOpenedAt(openedAt: string): string {
  const date = new Date(openedAt)
  if (Number.isNaN(date.getTime())) return 'Chưa xác định'

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function getShortOrderId(orderId: string): string {
  return `#${orderId.slice(-6).toUpperCase()}`
}

function isAuthoritativeSessionError(error: unknown): boolean {
  return [
    'ACTIVE_TABLE_SESSION_INCONSISTENT',
    'ACTIVE_TABLE_SESSION_NOT_FOUND',
    'CURRENT_ORDER_NOT_FOUND',
    'INVALID_OBJECT_ID',
    'TABLE_INACTIVE',
    'TABLE_NOT_FOUND',
    'TABLE_NOT_OCCUPIED',
  ].includes(getApiErrorCode(error) ?? '')
}

function isOpenEligible(table: WaiterTable): boolean {
  return table.active && table.status === 'AVAILABLE' && !table.hasActiveSession
}

function getInconsistentStateMessage(table: WaiterTable): string | null {
  if (table.status === 'AVAILABLE' && table.hasActiveSession) return 'Bàn đang có phiên hoạt động nên chưa thể mở thêm phiên mới.'
  if (table.status === 'OCCUPIED' && !table.hasActiveSession) return 'Bàn đang phục vụ nhưng chưa có phiên hoạt động. Vui lòng tải lại danh sách.'
  return null
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

function TableCard({ onOpen, onViewSession, openingTableId, table }: {
  onOpen: (table: WaiterTable) => void
  onViewSession: (table: WaiterTable) => void
  openingTableId: string | null
  table: WaiterTable
}) {
  const inconsistentStateMessage = getInconsistentStateMessage(table)
  const isPaymentRequested = table.orderStatus === 'PAYMENT_REQUESTED'

  return (
    <Card className={`h-full p-5 ${isPaymentRequested ? 'border-danger bg-danger-soft/30' : ''}`}>
      <div className="flex h-full flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2"><TableProperties aria-hidden="true" className="size-5 shrink-0 text-brand" /><h2 className="text-subsection text-content">Bàn {table.number}</h2></div>
            <p className="mt-2 text-compact text-content-secondary">{getTableDescription(table)}</p>
          </div>
          <div aria-label={`Trạng thái bàn ${table.number}`} className="flex flex-wrap gap-2 sm:shrink-0 sm:justify-end">
            {isPaymentRequested && <Badge variant="danger">Yêu cầu thanh toán</Badge>}
            <StatusBadge entity="table" status={table.status} />
          </div>
        </div>

        <dl className="grid gap-3 border-y border-border py-4 text-compact sm:grid-cols-2">
          <div><dt className="text-content-muted">Vòng đời bàn</dt><dd className="mt-1"><StatusBadge entity="category" status={table.active ? 'ACTIVE' : 'INACTIVE'} /></dd></div>
          <div><dt className="text-content-muted">Phiên hiện tại</dt><dd className="mt-1"><Badge variant={table.hasActiveSession ? 'info' : 'neutral'}>{table.hasActiveSession ? 'Có phiên hoạt động' : 'Chưa có phiên hoạt động'}</Badge></dd></div>
          <div><dt className="text-content-muted">Đơn hiện tại</dt><dd className="mt-1 font-medium text-content">{getOrderLabel(table.orderStatus)}</dd></div>
          <div><dt className="text-content-muted">Trạng thái vận hành</dt><dd className="mt-1 font-medium text-content">{table.status === 'AVAILABLE' ? 'Trống' : 'Đang phục vụ'}</dd></div>
        </dl>

        {!table.active && <p className="text-compact text-content-secondary">Bàn này không khả dụng cho thao tác phục vụ.</p>}
        {inconsistentStateMessage && <p className="text-compact text-warning">{inconsistentStateMessage}</p>}
        {!inconsistentStateMessage && isOpenEligible(table) && <div className="mt-auto"><Button aria-label={`Mở bàn ${table.number}`} className="w-full" disabled={Boolean(openingTableId)} loading={openingTableId === table.id} onClick={() => onOpen(table)}>Mở bàn</Button></div>}
        {!inconsistentStateMessage && table.status === 'OCCUPIED' && table.hasActiveSession && <div className="mt-auto"><Button aria-label={`Xem phiên phục vụ của bàn ${table.number}`} className="w-full" onClick={() => onViewSession(table)} variant="secondary">Xem phiên</Button></div>}
      </div>
    </Card>
  )
}

function SessionModal({ detail, errorMessage, hasBackgroundRefreshError, isCancelPaymentRequestPending, isConfirmPaymentPending, isLoading, onCancelPaymentRequest, onClose, onConfirmPayment, onCopy, onRetry, onStartAssistedOrdering, table }: {
  detail: SessionDetail | null
  errorMessage: string | null
  hasBackgroundRefreshError: boolean
  isCancelPaymentRequestPending: boolean
  isConfirmPaymentPending: boolean
  isLoading: boolean
  onCancelPaymentRequest: () => void
  onClose: () => void
  onConfirmPayment: () => void
  onCopy: (joinCode: number) => void
  onRetry: () => void
  onStartAssistedOrdering: () => void
  table: SessionTable | null
}) {
  const isPaymentRequested = detail?.table.active === true
    && detail.table.status === 'OCCUPIED'
    && detail.session.status === 'ACTIVE'
    && detail.order.status === 'PAYMENT_REQUESTED'
  const areAllOrderItemsCompleted = detail?.order.items.every(item => item.status === 'COMPLETED') ?? false
  const isPaymentMutationPending = isCancelPaymentRequestPending || isConfirmPaymentPending

  return (
    <Modal className="max-w-2xl" footer={detail && <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button onClick={onRetry} variant="secondary"><RefreshCw aria-hidden="true" className="size-4" />Làm mới</Button><Button onClick={() => onCopy(detail.session.joinCode)} variant="secondary"><Clipboard aria-hidden="true" className="size-4" />Sao chép mã</Button>{isPaymentRequested && <Button disabled={isPaymentMutationPending} loading={isCancelPaymentRequestPending} onClick={onCancelPaymentRequest} variant="secondary">Hủy yêu cầu thanh toán</Button>}{isPaymentRequested && <Button disabled={isPaymentMutationPending || !areAllOrderItemsCompleted} loading={isConfirmPaymentPending} onClick={onConfirmPayment} variant="danger">Xác nhận thanh toán</Button>}{detail.table.active && detail.table.status === 'OCCUPIED' && detail.session.status === 'ACTIVE' && detail.order.status === 'OPEN' && <Button onClick={onStartAssistedOrdering}>Hỗ trợ thêm món</Button>}</div>} isOpen={Boolean(table)} onClose={onClose} title={table ? `Chi tiết Bàn ${table.number}` : 'Chi tiết bàn'}>
      {isLoading && <PageLoading label="Đang tải phiên phục vụ" />}
      {!isLoading && errorMessage && <ErrorState description={errorMessage} onRetry={onRetry} title="Không thể tải phiên phục vụ" />}
      {!isLoading && !errorMessage && detail && (
        <div className="space-y-6">
          {hasBackgroundRefreshError && <p className="rounded-control border border-warning bg-warning-soft p-3 text-compact text-warning" role="status">Không thể cập nhật chi tiết bàn. Dữ liệu gần nhất vẫn đang được hiển thị.</p>}
          <div aria-label={`Thông tin Bàn ${detail.table.number}`} className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface-muted p-4">
            <div><p className="text-compact text-content-secondary">Bàn</p><p className="mt-1 text-subsection text-content">Bàn {detail.table.number}</p></div>
            <div aria-label="Trạng thái bàn" className="flex flex-wrap gap-2"><Badge variant="info">Phiên hoạt động</Badge><StatusBadge entity="table" status={detail.table.status} /></div>
          </div>

          <section aria-labelledby="waiter-session-heading">
            <h3 className="text-card-title text-content" id="waiter-session-heading">Phiên phục vụ</h3>
            <dl className="mt-3 grid gap-3 rounded-card border border-border p-4 sm:grid-cols-2">
              <div><dt className="text-compact text-content-secondary">Mở lúc</dt><dd className="mt-1 break-words font-medium text-content">{formatOpenedAt(detail.session.openedAt)}</dd></div>
              <div><dt className="text-compact text-content-secondary">Mở bởi</dt><dd className="mt-1 break-words font-medium text-content">{detail.session.openedBy.name}</dd></div>
              <div className="sm:col-span-2"><dt className="text-compact text-content-secondary">Mã vào bàn</dt><dd aria-label={`Mã vào bàn ${detail.session.joinCode}`} className="mt-2 break-all text-3xl font-bold tracking-[0.18em] text-content sm:text-4xl">{detail.session.joinCode}</dd></div>
            </dl>
          </section>

          <section aria-labelledby="waiter-order-heading">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-card-title text-content" id="waiter-order-heading">Đơn hiện tại</h3><p className="mt-1 text-compact text-content-secondary">Đơn {getShortOrderId(detail.order.id)}</p></div><StatusBadge entity="order" status={detail.order.status} /></div>
            <dl className="mt-3 grid gap-3 rounded-card border border-border p-4 sm:grid-cols-2">
              <div><dt className="text-compact text-content-secondary">Tổng cộng</dt><dd className="mt-1 text-price text-content">{formatVnd(detail.order.total)}</dd></div>
              <div><dt className="text-compact text-content-secondary">Số món</dt><dd className="mt-1 text-subsection text-content">{detail.order.itemCount}</dd></div>
            </dl>
            {isPaymentRequested && !areAllOrderItemsCompleted && <p className="mt-3 rounded-control border border-warning bg-warning-soft p-3 text-compact text-warning" role="status">Tất cả món phải hoàn thành trước khi xác nhận thanh toán.</p>}
          </section>

          <section aria-labelledby="waiter-order-items-heading">
            <h3 className="text-card-title text-content" id="waiter-order-items-heading">Món đã gọi</h3>
            {detail.order.items.length === 0 ? <EmptyState description="Đơn hiện tại chưa có món nào." title="Chưa có món" /> : <ul aria-label="Danh sách món đã gọi" className="mt-3 space-y-3">{detail.order.items.map(item => <li className="rounded-card border border-border p-4" key={item.id}><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h4 className="break-words text-label text-content">{item.dishNameSnapshot}</h4><p className="mt-1 text-compact text-content-secondary">Đơn giá: {formatVnd(item.unitPriceSnapshot)}</p></div><StatusBadge entity="order-item" status={item.status} /></div><dl className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3"><div><dt className="text-caption text-content-secondary">Số lượng</dt><dd className="mt-1 font-medium text-content">{item.quantity}</dd></div><div><dt className="text-caption text-content-secondary">Trạng thái bếp</dt><dd className="mt-1"><StatusBadge entity="order-item" status={item.status} /></dd></div></dl></li>)}</ul>}
          </section>
        </div>
      )}
    </Modal>
  )
}

export function WaiterTableBoardPage() {
  const toast = useToast()
  const [activeFilter, setActiveFilter] = useState<TableFilter>('ALL')
  const [isAssistedOrderingOpen, setIsAssistedOrderingOpen] = useState(false)
  const [isCancelPaymentRequestDialogOpen, setIsCancelPaymentRequestDialogOpen] = useState(false)
  const [isCancelPaymentRequestPending, setIsCancelPaymentRequestPending] = useState(false)
  const [isConfirmPaymentDialogOpen, setIsConfirmPaymentDialogOpen] = useState(false)
  const [isConfirmPaymentPending, setIsConfirmPaymentPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [hasTableBackgroundRefreshError, setHasTableBackgroundRefreshError] = useState(false)
  const [hasSessionBackgroundRefreshError, setHasSessionBackgroundRefreshError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSessionLoading, setIsSessionLoading] = useState(false)
  const [openingTableId, setOpeningTableId] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [sessionDetail, setSessionDetail] = useState<SessionDetail | null>(null)
  const [sessionErrorMessage, setSessionErrorMessage] = useState<string | null>(null)
  const [sessionTable, setSessionTable] = useState<SessionTable | null>(null)
  const [tableToOpen, setTableToOpen] = useState<WaiterTable | null>(null)
  const [tables, setTables] = useState<WaiterTable[]>([])
  const tableAbortControllerRef = useRef<AbortController | null>(null)
  const tableRequestInFlightRef = useRef(false)
  const tableRequestId = useRef(0)
  const sessionAbortControllerRef = useRef<AbortController | null>(null)
  const sessionRequestInFlightRef = useRef(false)
  const sessionRequestId = useRef(0)
  const sessionTableRef = useRef<SessionTable | null>(null)

  const filteredTables = useMemo(() => tables.filter(table => matchesFilter(table, activeFilter)), [activeFilter, tables])
  const filterCounts = useMemo(() => new Map(filterOptions.map(filter => [filter.id, tables.filter(table => matchesFilter(table, filter.id)).length])), [tables])
  function reloadTables() { setReloadKey(key => key + 1) }

  function abortTableRequest() {
    tableRequestId.current += 1
    tableAbortControllerRef.current?.abort()
    tableAbortControllerRef.current = null
    tableRequestInFlightRef.current = false
  }

  async function loadTables(refreshMode: TableRefreshMode = 'initial') {
    if (tableRequestInFlightRef.current) {
      if (refreshMode === 'background') return
      abortTableRequest()
    }

    const requestId = tableRequestId.current + 1
    const abortController = new AbortController()
    tableRequestId.current = requestId
    tableAbortControllerRef.current = abortController
    tableRequestInFlightRef.current = true
    if (refreshMode === 'initial') {
      setIsLoading(true)
      setErrorMessage(null)
      setHasTableBackgroundRefreshError(false)
    }

    try {
      const result = await getWaiterTables(abortController.signal)
      if (tableRequestId.current !== requestId) return
      setTables(result)
      setErrorMessage(null)
      setHasTableBackgroundRefreshError(false)
    } catch (error) {
      if (abortController.signal.aborted || tableRequestId.current !== requestId) return
      if (refreshMode === 'background') {
        setHasTableBackgroundRefreshError(true)
      } else {
        setErrorMessage(getApiErrorMessage(error, 'Không thể tải danh sách bàn. Vui lòng thử lại.'))
      }
    } finally {
      if (tableRequestId.current === requestId) {
        tableAbortControllerRef.current = null
        tableRequestInFlightRef.current = false
        if (refreshMode === 'initial') setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    void loadTables('initial')
    return () => abortTableRequest()
  }, [reloadKey])

  useEffect(() => {
    if (isLoading || errorMessage) return
    const pollingTimer = window.setInterval(() => void loadTables('background'), pollingIntervalMs)
    return () => window.clearInterval(pollingTimer)
  }, [errorMessage, isLoading])

  function abortSessionRequest() {
    sessionRequestId.current += 1
    sessionAbortControllerRef.current?.abort()
    sessionAbortControllerRef.current = null
    sessionRequestInFlightRef.current = false
  }

  function closeSessionModal() {
    abortSessionRequest()
    sessionTableRef.current = null
    setIsAssistedOrderingOpen(false)
    setIsCancelPaymentRequestDialogOpen(false)
    setIsConfirmPaymentDialogOpen(false)
    setHasSessionBackgroundRefreshError(false); setSessionDetail(null); setSessionErrorMessage(null); setSessionTable(null); setIsSessionLoading(false)
  }

  async function loadSession(table: SessionTable, refreshMode: SessionRefreshMode = 'initial') {
    const isNewTable = sessionTableRef.current?.id !== table.id
    if (sessionRequestInFlightRef.current) {
      if (!isNewTable) return
      abortSessionRequest()
    }

    const isInitialLoad = refreshMode === 'initial' || isNewTable
    const requestId = sessionRequestId.current + 1
    const abortController = new AbortController()
    sessionRequestId.current = requestId
    sessionAbortControllerRef.current = abortController
    sessionRequestInFlightRef.current = true
    sessionTableRef.current = table

    if (isInitialLoad) {
      setSessionTable(table); setSessionDetail(null); setSessionErrorMessage(null); setHasSessionBackgroundRefreshError(false); setIsSessionLoading(true)
    }

    try {
      const result = await getWaiterActiveTableSession(table.id, abortController.signal)
      if (sessionRequestId.current !== requestId || sessionTableRef.current?.id !== table.id) return

      setSessionDetail(result); setSessionErrorMessage(null); setHasSessionBackgroundRefreshError(false)
    } catch (error) {
      if (abortController.signal.aborted || sessionRequestId.current !== requestId || sessionTableRef.current?.id !== table.id) return

      if (isAuthoritativeSessionError(error)) {
        setSessionDetail(null); setSessionErrorMessage(getSessionErrorMessage(error)); setHasSessionBackgroundRefreshError(false)
        reloadTables()
      } else if (isInitialLoad) {
        setSessionDetail(null); setSessionErrorMessage(getSessionErrorMessage(error)); setHasSessionBackgroundRefreshError(false)
      } else {
        setHasSessionBackgroundRefreshError(true)
      }
    } finally {
      if (sessionRequestId.current === requestId) {
        sessionAbortControllerRef.current = null
        sessionRequestInFlightRef.current = false
        if (isInitialLoad) setIsSessionLoading(false)
      }
    }
  }

  useEffect(() => {
    if (!sessionTable || sessionErrorMessage) return

    const tableId = sessionTable.id
    const pollingTimer = window.setInterval(() => {
      const currentTable = sessionTableRef.current
      if (currentTable?.id === tableId) void loadSession(currentTable, 'background')
    }, pollingIntervalMs)

    return () => {
      window.clearInterval(pollingTimer)
      if (sessionTableRef.current?.id === tableId) abortSessionRequest()
    }
  }, [sessionErrorMessage, sessionTable?.id])

  useEffect(() => () => abortSessionRequest(), [])
  useEffect(() => {
    if (!isAssistedOrderingOpen || !sessionDetail || sessionDetail.order.status === 'OPEN') return
    setIsAssistedOrderingOpen(false)
    toast.error('Đơn đã yêu cầu thanh toán nên không thể thêm món.')
  }, [isAssistedOrderingOpen, sessionDetail?.order.status, toast])
  async function handleOpenTable() {
    if (!tableToOpen || openingTableId) return
    const table = tableToOpen
    setOpeningTableId(table.id)
    try {
      const result = await openWaiterTable(table.id)
      void loadSession(result.table)
      reloadTables()
      toast.success(`Đã mở Bàn ${result.table.number}.`)
    } catch (error) {
      if (['TABLE_ALREADY_OCCUPIED', 'TABLE_HAS_ACTIVE_SESSION', 'TABLE_OPEN_CONFLICT'].includes(getApiErrorCode(error) ?? '')) reloadTables()
      throw error
    } finally {
      setOpeningTableId(null)
    }
  }
  async function copyJoinCode(joinCode: number) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable')
      await navigator.clipboard.writeText(String(joinCode))
      toast.success('Đã sao chép mã vào bàn.')
    } catch {
      toast.error('Không thể sao chép mã. Vui lòng sao chép thủ công.')
    }
  }

  async function handleCancelPaymentRequest() {
    if (!sessionTable || !sessionDetail || sessionDetail.order.status !== 'PAYMENT_REQUESTED' || isCancelPaymentRequestPending || isConfirmPaymentPending) return

    const table = sessionTable
    setIsCancelPaymentRequestPending(true)
    try {
      await cancelWaiterPaymentRequest(table.id)
      abortSessionRequest()
      await loadSession(table, 'background')
      reloadTables()
      toast.success('Đã hủy yêu cầu thanh toán. Đơn đã được mở lại.')
    } finally {
      setIsCancelPaymentRequestPending(false)
    }
  }

  function handleCancelPaymentRequestError(error: unknown) {
    setIsCancelPaymentRequestDialogOpen(false)
    if (sessionTable) {
      abortSessionRequest()
      void loadSession(sessionTable, 'background')
    }
    reloadTables()
    toast.error(getCancelPaymentRequestErrorMessage(error))
  }

  async function handleConfirmPayment() {
    if (!sessionTable || !sessionDetail || sessionDetail.table.active !== true || sessionDetail.table.status !== 'OCCUPIED' || sessionDetail.session.status !== 'ACTIVE' || sessionDetail.order.status !== 'PAYMENT_REQUESTED' || sessionDetail.order.items.some(item => item.status !== 'COMPLETED') || isCancelPaymentRequestPending || isConfirmPaymentPending) return

    const table = sessionTable
    setIsConfirmPaymentPending(true)
    try {
      await confirmWaiterPayment(table.id)
      closeSessionModal()
      reloadTables()
      toast.success('Đã xác nhận thanh toán. Bàn đã được giải phóng.')
    } finally {
      setIsConfirmPaymentPending(false)
    }
  }

  function handleConfirmPaymentError(error: unknown) {
    setIsConfirmPaymentDialogOpen(false)
    if (shouldCloseStaleSessionAfterPaymentError(error)) {
      closeSessionModal()
    } else if (sessionTable) {
      abortSessionRequest()
      void loadSession(sessionTable, 'background')
    }
    reloadTables()
    toast.error(getConfirmPaymentErrorMessage(error))
  }

  return (
    <div className="space-y-6">
      <PageHeader actions={<Button disabled={isLoading} onClick={reloadTables} variant="secondary"><RefreshCw aria-hidden="true" className="size-4" />Làm mới</Button>} description="Theo dõi trạng thái vận hành bàn từ hệ thống." title="Danh sách bàn" />
      {!isLoading && !errorMessage && tables.length > 0 && <div aria-label="Bộ lọc danh sách bàn" className="flex flex-wrap gap-2">{filterOptions.map(filter => <Button aria-pressed={activeFilter === filter.id} key={filter.id} onClick={() => setActiveFilter(filter.id)} variant={activeFilter === filter.id ? 'primary' : 'secondary'}>{filter.label} ({filterCounts.get(filter.id) ?? 0})</Button>)}</div>}
      {isLoading && <PageLoading label="Đang tải danh sách bàn" />}
      {!isLoading && errorMessage && <ErrorState description={errorMessage} onRetry={reloadTables} title="Không thể tải danh sách bàn" />}
      {!isLoading && !errorMessage && hasTableBackgroundRefreshError && <p className="rounded-control border border-warning bg-warning-soft p-3 text-compact text-warning" role="status">Không thể cập nhật danh sách bàn mới nhất. Dữ liệu gần nhất vẫn đang được hiển thị.</p>}
      {!isLoading && !errorMessage && tables.length === 0 && <EmptyState description="Hiện chưa có bàn nào để phục vụ." icon={TableProperties} title="Chưa có bàn" />}
      {!isLoading && !errorMessage && tables.length > 0 && filteredTables.length === 0 && <EmptyState description="Không có bàn phù hợp với bộ lọc hiện tại." icon={TableProperties} title="Không tìm thấy bàn phù hợp" />}
      {!isLoading && !errorMessage && filteredTables.length > 0 && <ul aria-label="Danh sách bàn phục vụ" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filteredTables.map(table => <li key={table.id}><TableCard onOpen={setTableToOpen} onViewSession={table => void loadSession(table)} openingTableId={openingTableId} table={table} /></li>)}</ul>}
      <ConfirmDialog confirmLabel="Mở bàn" description={tableToOpen ? `Bàn ${tableToOpen.number} sẽ bắt đầu một phiên phục vụ mới.` : ''} isOpen={Boolean(tableToOpen)} onClose={() => setTableToOpen(null)} onConfirm={handleOpenTable} onError={error => { setTableToOpen(null); toast.error(getOpenTableErrorMessage(error)) }} title={tableToOpen ? `Mở Bàn ${tableToOpen.number}?` : 'Mở bàn'} />
      <SessionModal detail={sessionDetail} errorMessage={sessionErrorMessage} hasBackgroundRefreshError={hasSessionBackgroundRefreshError} isCancelPaymentRequestPending={isCancelPaymentRequestPending} isConfirmPaymentPending={isConfirmPaymentPending} isLoading={isSessionLoading} onCancelPaymentRequest={() => { if (!isConfirmPaymentPending) setIsCancelPaymentRequestDialogOpen(true) }} onClose={closeSessionModal} onConfirmPayment={() => { if (!isCancelPaymentRequestPending) setIsConfirmPaymentDialogOpen(true) }} onCopy={joinCode => void copyJoinCode(joinCode)} onRetry={() => sessionTable && void loadSession(sessionTable, sessionDetail ? 'background' : 'initial')} onStartAssistedOrdering={() => setIsAssistedOrderingOpen(true)} table={sessionTable} />
      <ConfirmDialog cancelLabel="Giữ yêu cầu thanh toán" confirmLabel="Mở lại đơn" description={sessionDetail ? `Bàn ${sessionDetail.table.number}: thao tác này sẽ mở lại đơn để có thể gọi thêm món.` : ''} isOpen={isCancelPaymentRequestDialogOpen && !isConfirmPaymentPending && sessionDetail?.order.status === 'PAYMENT_REQUESTED'} onClose={() => setIsCancelPaymentRequestDialogOpen(false)} onConfirm={handleCancelPaymentRequest} onError={handleCancelPaymentRequestError} title="Cho phép gọi thêm món?" />
      <ConfirmDialog cancelLabel="Chưa thanh toán" confirmLabel="Xác nhận thanh toán" description={sessionDetail ? `Bàn ${sessionDetail.table.number} • Tổng ${formatVnd(sessionDetail.order.total)}. Đơn sẽ được đóng, phiên phục vụ hiện tại sẽ kết thúc và bàn sẽ được giải phóng.` : ''} destructive isOpen={isConfirmPaymentDialogOpen && !isCancelPaymentRequestPending && sessionDetail?.table.active === true && sessionDetail.table.status === 'OCCUPIED' && sessionDetail.session.status === 'ACTIVE' && sessionDetail.order.status === 'PAYMENT_REQUESTED' && sessionDetail.order.items.every(item => item.status === 'COMPLETED')} onClose={() => setIsConfirmPaymentDialogOpen(false)} onConfirm={handleConfirmPayment} onError={handleConfirmPaymentError} title="Xác nhận đã thanh toán?" />
      <WaiterAssistedOrderingModal isOpen={isAssistedOrderingOpen} onAuthoritativeInvalidation={message => { setIsAssistedOrderingOpen(false); if (sessionTable) { abortSessionRequest(); void loadSession(sessionTable, 'initial') }; reloadTables(); toast.error(message) }} onClose={() => setIsAssistedOrderingOpen(false)} onSuccess={() => { setIsAssistedOrderingOpen(false); if (sessionTable) { abortSessionRequest(); void loadSession(sessionTable, 'initial') }; reloadTables(); toast.success('Đã thêm món vào đơn.'); }} table={sessionDetail ? { id: sessionDetail.table.id, number: sessionDetail.table.number } : null} />
    </div>
  )
}
