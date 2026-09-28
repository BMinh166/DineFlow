import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'

import { Card, EmptyState, ErrorState, PageHeader, PageLoading } from '../../components/ui'
import { getManagerTopDishes } from '../../services/manager-top-dishes-api'
import type { ManagerTopDish } from '../../types/manager-top-dishes'
import { getApiErrorMessage } from '../../utils/api-error'

export function ManagerTopDishesPage() {
  const [topDishes, setTopDishes] = useState<ManagerTopDish[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadTopDishes() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const result = await getManagerTopDishes(controller.signal)
        if (!controller.signal.aborted) setTopDishes(result)
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(getApiErrorMessage(error, 'Không thể tải món bán chạy. Vui lòng thử lại.'))
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    void loadTopDishes()
    return () => controller.abort()
  }, [reloadKey])

  return (
    <div className="space-y-6">
      <PageHeader
        description="Xếp hạng theo tổng số lượng bán từ các đơn đã đóng."
        title="Món bán chạy"
      />

      {isLoading && <PageLoading label="Đang tải món bán chạy" />}
      {!isLoading && errorMessage && (
        <ErrorState
          description={errorMessage}
          onRetry={() => setReloadKey(key => key + 1)}
          title="Không thể tải món bán chạy"
        />
      )}
      {!isLoading && !errorMessage && topDishes.length === 0 && (
        <EmptyState
          description="Chưa có món nào từ đơn đã đóng để xếp hạng."
          icon={Trophy}
          title="Chưa có dữ liệu món bán chạy"
        />
      )}
      {!isLoading && !errorMessage && topDishes.length > 0 && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table aria-label="Danh sách món bán chạy" className="w-full min-w-[480px] text-left">
              <thead className="border-b border-border bg-surface-muted text-caption font-semibold text-content-secondary">
                <tr>
                  <th className="w-20 px-5 py-3" scope="col">Hạng</th>
                  <th className="px-5 py-3" scope="col">Món ăn</th>
                  <th className="px-5 py-3 text-right" scope="col">Số lượng đã bán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topDishes.map((dish, index) => (
                  <tr key={`${dish.dishId}-${dish.dishName}`}>
                    <td className="px-5 py-4 text-compact font-semibold text-content">{index + 1}</td>
                    <td className="px-5 py-4 text-compact text-content">{dish.dishName}</td>
                    <td className="px-5 py-4 text-right text-compact font-medium text-content">{dish.quantity}</td>
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
