import { useEffect, useRef, useState } from 'react'
import { Banknote, ChefHat, RefreshCw, Table2, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button, Card, EmptyState, ErrorState, PageHeader, PageLoading } from '../../components/ui'
import { getManagerDashboard } from '../../services/manager-dashboard-api'
import type { ManagerDashboard } from '../../types/manager-dashboard'
import { getApiErrorMessage } from '../../utils/api-error'
import { formatVnd } from '../../utils/format-vnd'

export function ManagerDashboardPage() {
  const [dashboard, setDashboard] = useState<ManagerDashboard | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [backgroundErrorMessage, setBackgroundErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const hasLoadedDashboardRef = useRef(false)

  useEffect(() => {
    const controller = new AbortController()

    async function loadDashboard() {
      const isBackgroundRefresh = hasLoadedDashboardRef.current
      if (isBackgroundRefresh) setIsRefreshing(true)
      else {
        setIsLoading(true)
        setErrorMessage(null)
      }

      try {
        const result = await getManagerDashboard(controller.signal)
        if (!controller.signal.aborted) {
          setDashboard(result)
          setErrorMessage(null)
          setBackgroundErrorMessage(null)
          hasLoadedDashboardRef.current = true
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          const message = getApiErrorMessage(error, 'Không thể tải tổng quan quản lý. Vui lòng thử lại.')
          if (isBackgroundRefresh) setBackgroundErrorMessage(message)
          else setErrorMessage(message)
        }
      } finally {
        if (!controller.signal.aborted) {
          if (isBackgroundRefresh) setIsRefreshing(false)
          else setIsLoading(false)
        }
      }
    }

    void loadDashboard()
    return () => controller.abort()
  }, [reloadKey])

  return (
    <div className="space-y-6">
      <PageHeader
        actions={<Button disabled={isLoading || isRefreshing} loading={isRefreshing} onClick={() => setReloadKey(key => key + 1)} variant="secondary"><RefreshCw aria-hidden="true" className="size-4" />Làm mới</Button>}
        description="Tổng quan vận hành và kinh doanh từ dữ liệu hiện tại."
        title="Dashboard"
      />

      {isLoading && <PageLoading label="Đang tải tổng quan quản lý" />}
      {!isLoading && errorMessage && (
        <ErrorState
          description={errorMessage}
          onRetry={() => setReloadKey(key => key + 1)}
          title="Không thể tải tổng quan quản lý"
        />
      )}
      {!isLoading && !errorMessage && backgroundErrorMessage && <p className="rounded-control border border-warning bg-warning-soft p-3 text-compact text-warning" role="status">Không thể cập nhật tổng quan mới nhất. Dữ liệu gần nhất vẫn đang được hiển thị.</p>}
      {!isLoading && !errorMessage && dashboard && (
        <>
          <section aria-label="Chỉ số tổng quan" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon={Banknote} label="Doanh thu hôm nay" value={formatVnd(dashboard.summary.todayRevenue)} />
            <MetricCard icon={Trophy} label="Đơn đã đóng hôm nay" value={String(dashboard.summary.todayClosedOrderCount)} />
            <MetricCard icon={Table2} label="Bàn đang sử dụng" value={`${dashboard.summary.tablesInUse} / ${dashboard.summary.activeTableCount}`} />
            <MetricCard icon={ChefHat} label="Món đang chuẩn bị" value={String(dashboard.summary.preparingItemCount)} />
          </section>

          <Card className="p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-subsection text-content">Món bán chạy</h2>
                <p className="mt-1 text-body text-content-secondary">Theo số lượng bán từ các đơn đã đóng.</p>
              </div>
              <Link className="text-label font-semibold text-brand hover:text-brand-hover" to="/manager/top-dishes">Xem tất cả</Link>
            </div>
            {dashboard.topDishes.length === 0 ? (
              <EmptyState
                className="mt-5"
                description="Chưa có món nào từ đơn đã đóng để xếp hạng."
                icon={Trophy}
                title="Chưa có dữ liệu món bán chạy"
              />
            ) : (
              <ol className="mt-5 divide-y divide-border" aria-label="Năm món bán chạy nhất">
                {dashboard.topDishes.map((dish, index) => (
                  <li className="flex items-center gap-4 py-3" key={`${dish.dishId}-${dish.dishName}`}>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-pill bg-brand-soft text-label font-semibold text-brand">{index + 1}</span>
                    <span className="min-w-0 flex-1 break-words text-compact font-medium text-content">{dish.dishName}</span>
                    <span className="shrink-0 text-compact text-content-secondary">{dish.quantity} đã bán</span>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <nav aria-label="Đi tới các báo cáo quản lý" className="flex flex-wrap gap-3">
            <Link className="text-label font-semibold text-brand hover:text-brand-hover" to="/manager/revenue">Xem doanh thu</Link>
            <Link className="text-label font-semibold text-brand hover:text-brand-hover" to="/manager/orders">Xem đơn hiện tại</Link>
            <Link className="text-label font-semibold text-brand hover:text-brand-hover" to="/manager/history">Xem lịch sử đơn hàng</Link>
          </nav>
        </>
      )}
    </div>
  )
}

function MetricCard({ icon: Icon, label, value }: { icon: typeof Banknote; label: string; value: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3 text-content-secondary"><Icon aria-hidden="true" className="size-5" /><p className="text-label">{label}</p></div>
      <p className="mt-3 text-2xl font-semibold text-content">{value}</p>
    </Card>
  )
}
