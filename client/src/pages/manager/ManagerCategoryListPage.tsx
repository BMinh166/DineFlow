import { useEffect, useState } from 'react'
import { FolderOpen } from 'lucide-react'
import { Button, Card, EmptyState, ErrorState, PageHeader, PageLoading, StatusBadge } from '../../components/ui'
import { getManagerCategories } from '../../services/manager-category-api'
import type { Category } from '../../types/category'
import { getApiErrorMessage } from '../../utils/api-error'

export function ManagerCategoryListPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isCurrent = true

    async function loadCategories() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const result = await getManagerCategories()
        if (isCurrent) setCategories(result)
      } catch (error) {
        if (isCurrent) setErrorMessage(getApiErrorMessage(error, 'Không thể tải danh mục. Vui lòng thử lại.'))
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    void loadCategories()
    return () => {
      isCurrent = false
    }
  }, [reloadKey])

  return (
    <div className="space-y-6">
      <PageHeader
        actions={(
          <div>
            <Button disabled title="Chức năng này sẽ được mở ở bước tiếp theo.">Thêm danh mục</Button>
            <p className="mt-1 text-caption text-content-secondary">Sẽ khả dụng ở bước tiếp theo.</p>
          </div>
        )}
        description="Quản lý các nhóm món ăn trong thực đơn."
        title="Danh mục"
      />

      {isLoading && <PageLoading label="Đang tải danh mục" />}
      {!isLoading && errorMessage && <ErrorState description={errorMessage} onRetry={() => setReloadKey(key => key + 1)} title="Không thể tải danh mục" />}
      {!isLoading && !errorMessage && categories.length === 0 && (
        <EmptyState description="Tạo danh mục đầu tiên để bắt đầu tổ chức thực đơn." icon={FolderOpen} title="Chưa có danh mục" />
      )}
      {!isLoading && !errorMessage && categories.length > 0 && (
        <Card className="overflow-hidden">
          <ul aria-label="Danh sách danh mục" className="divide-y divide-border">
            {categories.map(category => (
              <li className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between" key={category.id}>
                <div className="min-w-0">
                  <h2 className="text-card-title text-content">{category.name}</h2>
                  <p className="mt-1 text-compact text-content-secondary">{category.description || 'Chưa có mô tả.'}</p>
                </div>
                <StatusBadge entity="category" status={category.active ? 'ACTIVE' : 'INACTIVE'} />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
