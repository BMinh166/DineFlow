import { useEffect, useMemo, useState } from 'react'
import { SearchX, Utensils } from 'lucide-react'
import { Button, Card, EmptyState, ErrorState, FilterBar, PageHeader, PageLoading, SearchInput, Select, StatusBadge } from '../../components/ui'
import { getManagerDishes } from '../../services/manager-dish-api'
import type { Dish } from '../../types/dish'
import { getApiErrorMessage } from '../../utils/api-error'

type AvailabilityFilter = 'ALL' | 'AVAILABLE' | 'UNAVAILABLE'

function formatVnd(price: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(price)} ₫`
}

export function ManagerDishListPage() {
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('ALL')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dishes, setDishes] = useState<Dish[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function loadDishes() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const result = await getManagerDishes()
        if (isCurrent) setDishes(result)
      } catch (error) {
        if (isCurrent) setErrorMessage(getApiErrorMessage(error, 'Không thể tải món ăn. Vui lòng thử lại.'))
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    void loadDishes()
    return () => {
      isCurrent = false
    }
  }, [reloadKey])

  const categories = useMemo(() => {
    const categoriesById = new Map<string, { id: string; name: string }>()
    dishes.forEach(dish => {
      if (dish.category) categoriesById.set(dish.category.id, dish.category)
    })
    return [...categoriesById.values()].sort((left, right) => left.name.localeCompare(right.name, 'vi'))
  }, [dishes])

  const visibleDishes = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase('vi')

    return dishes.filter(dish => {
      const matchesSearch = !normalizedSearchTerm
        || dish.name.toLocaleLowerCase('vi').includes(normalizedSearchTerm)
        || dish.description?.toLocaleLowerCase('vi').includes(normalizedSearchTerm)
      const matchesCategory = !categoryFilter || dish.category?.id === categoryFilter
      const matchesAvailability = availabilityFilter === 'ALL'
        || (availabilityFilter === 'AVAILABLE' && dish.isAvailable)
        || (availabilityFilter === 'UNAVAILABLE' && !dish.isAvailable)

      return matchesSearch && matchesCategory && matchesAvailability
    })
  }, [availabilityFilter, categoryFilter, dishes, searchTerm])

  const hasActiveFilters = Boolean(searchTerm || categoryFilter || availabilityFilter !== 'ALL')

  function resetFilters() {
    setAvailabilityFilter('ALL')
    setCategoryFilter('')
    setSearchTerm('')
  }

  return (
    <div className="space-y-6">
      <PageHeader description="Xem và tìm kiếm các món ăn hiện có trong thực đơn." title="Món ăn" />

      {isLoading && <PageLoading label="Đang tải món ăn" />}
      {!isLoading && errorMessage && <ErrorState description={errorMessage} onRetry={() => setReloadKey(key => key + 1)} title="Không thể tải món ăn" />}
      {!isLoading && !errorMessage && dishes.length === 0 && <EmptyState description="Thêm món ăn để bắt đầu xây dựng thực đơn." icon={Utensils} title="Chưa có món ăn" />}
      {!isLoading && !errorMessage && dishes.length > 0 && (
        <>
          <FilterBar aria-label="Tìm kiếm và lọc món ăn">
            <SearchInput className="sm:min-w-72" onChange={event => setSearchTerm(event.target.value)} onClear={() => setSearchTerm('')} placeholder="Tìm theo tên hoặc mô tả món ăn" value={searchTerm} />
            <Select className="sm:w-52" label="Danh mục" onChange={event => setCategoryFilter(event.target.value)} value={categoryFilter}>
              <option value="">Tất cả danh mục</option>
              {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
            </Select>
            <Select className="sm:w-44" label="Tình trạng phục vụ" onChange={event => setAvailabilityFilter(event.target.value as AvailabilityFilter)} value={availabilityFilter}>
              <option value="ALL">Tất cả</option>
              <option value="AVAILABLE">Có sẵn</option>
              <option value="UNAVAILABLE">Tạm hết</option>
            </Select>
            {hasActiveFilters && <Button onClick={resetFilters} variant="secondary">Xóa bộ lọc</Button>}
          </FilterBar>

          {visibleDishes.length === 0 ? (
            <EmptyState action={<Button onClick={resetFilters} variant="secondary">Xóa bộ lọc</Button>} description="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để xem các món khác." icon={SearchX} title="Không tìm thấy món phù hợp" />
          ) : (
            <ul aria-label="Danh sách món ăn" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleDishes.map(dish => (
                <li key={dish.id}>
                  <Card className="flex h-full overflow-hidden">
                    <div className="relative flex size-24 shrink-0 items-center justify-center bg-surface-muted sm:size-28">
                      <Utensils aria-hidden="true" className="size-8 text-content-muted" />
                      {dish.imageUrl && <img alt={`Hình món ${dish.name}`} className="absolute inset-0 size-full object-cover" onError={event => { event.currentTarget.style.display = 'none' }} src={dish.imageUrl} />}
                    </div>
                    <div className="min-w-0 flex-1 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0"><h2 className="truncate text-card-title text-content">{dish.name}</h2><p className="mt-1 truncate text-compact text-content-secondary">{dish.category?.name ?? 'Danh mục không còn tồn tại'}</p></div>
                        <p className="shrink-0 text-price text-content">{formatVnd(dish.price)}</p>
                      </div>
                      <p className="mt-3 line-clamp-2 min-h-10 text-compact text-content-secondary">{dish.description || 'Chưa có mô tả.'}</p>
                      <div aria-label={`Trạng thái của ${dish.name}`} className="mt-3 flex flex-wrap gap-2">
                        <StatusBadge entity="dish" status={dish.isActive ? 'ACTIVE' : 'INACTIVE'} />
                        <StatusBadge entity="dish" status={dish.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'} />
                      </div>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
