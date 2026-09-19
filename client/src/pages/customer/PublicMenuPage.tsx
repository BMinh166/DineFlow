import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { SearchX, Utensils } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { Badge, Button, Card, EmptyState, ErrorState, SearchInput, Skeleton } from '../../components/ui'
import { getPublicMenuCategories, getPublicMenuDishes, getPublicTable } from '../../services/public-menu-api'
import type { PublicCategory, PublicDish, PublicTable } from '../../types/public-menu'
import { formatVnd } from '../../utils/format-vnd'
import { DishDetailModal } from './DishDetailModal'

type TableErrorKind = 'INACTIVE' | 'INVALID_OR_MISSING' | null

function getTableErrorKind(error: unknown): TableErrorKind {
  if (!axios.isAxiosError(error)) return null

  const code = error.response?.data?.code
  if (code === 'TABLE_INACTIVE') return 'INACTIVE'
  if (code === 'INVALID_OBJECT_ID' || code === 'TABLE_NOT_FOUND') return 'INVALID_OR_MISSING'

  return null
}

function MenuLoadingState() {
  return (
    <div aria-label="Đang tải thực đơn" className="space-y-6" role="status">
      <Skeleton className="h-24" variant="rectangle" />
      <Skeleton className="h-11" variant="rectangle" />
      <div className="flex gap-2 overflow-hidden"><Skeleton className="h-9 w-20 shrink-0" /><Skeleton className="h-9 w-24 shrink-0" /><Skeleton className="h-9 w-20 shrink-0" /></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map(item => <Skeleton className="h-72" key={item} variant="rectangle" />)}
      </div>
    </div>
  )
}

function DishCard({ dish, onViewDetails }: { dish: PublicDish, onViewDetails: (dish: PublicDish) => void }) {
  return (
    <Card className="flex h-full flex-col overflow-hidden" elevated>
      <div className="relative aspect-4/3 bg-surface-muted">
        <div aria-hidden="true" className="flex size-full items-center justify-center"><Utensils className="size-10 text-content-muted" /></div>
        {dish.imageUrl && <img alt={`Hình món ${dish.name}`} className={`absolute inset-0 size-full object-cover ${dish.isAvailable ? '' : 'opacity-70'}`} onError={event => { event.currentTarget.style.display = 'none' }} src={dish.imageUrl} />}
        {!dish.isAvailable && <Badge className="absolute top-3 right-3" variant="neutral">Tạm hết</Badge>}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-caption text-content-secondary">{dish.category.name}</p>
        <h2 className="mt-1 break-words text-card-title text-content">{dish.name}</h2>
        {dish.description && <p className="mt-2 line-clamp-2 text-compact text-content-secondary">{dish.description}</p>}
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <p className="text-price text-content">{formatVnd(dish.price)}</p>
          <span className="text-caption text-content-secondary">{dish.isAvailable ? 'Có sẵn' : 'Tạm hết'}</span>
        </div>
        <Button className="mt-4 w-full" onClick={() => onViewDetails(dish)} variant="secondary">Xem chi tiết</Button>
      </div>
    </Card>
  )
}

export function PublicMenuPage() {
  const { tableId = '' } = useParams()
  const [categories, setCategories] = useState<PublicCategory[]>([])
  const [dishes, setDishes] = useState<PublicDish[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [menuError, setMenuError] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDish, setSelectedDish] = useState<PublicDish | null>(null)
  const [table, setTable] = useState<PublicTable | null>(null)
  const [tableError, setTableError] = useState<TableErrorKind>(null)

  useEffect(() => {
    let isCurrent = true

    async function loadPublicMenu() {
      setCategories([])
      setDishes([])
      setIsLoading(true)
      setMenuError(false)
      setSelectedCategoryId(null)
      setSelectedDish(null)
      setTable(null)
      setTableError(null)

      try {
        const publicTable = await getPublicTable(tableId)
        if (!isCurrent) return

        setTable(publicTable)

        try {
          const [publicCategories, publicDishes] = await Promise.all([
            getPublicMenuCategories(),
            getPublicMenuDishes(),
          ])

          if (!isCurrent) return
          setCategories(publicCategories)
          setDishes(publicDishes)
        } catch {
          if (isCurrent) setMenuError(true)
        }
      } catch (error) {
        if (isCurrent) setTableError(getTableErrorKind(error))
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    void loadPublicMenu()
    return () => {
      isCurrent = false
    }
  }, [reloadKey, tableId])

  const visibleDishes = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase('vi-VN')

    return dishes.filter(dish => {
      const matchesCategory = selectedCategoryId === null || dish.category.id === selectedCategoryId
      const matchesSearch = !normalizedSearch || dish.name.toLocaleLowerCase('vi-VN').includes(normalizedSearch)
      return matchesCategory && matchesSearch
    })
  }, [dishes, searchTerm, selectedCategoryId])

  if (isLoading) return <MenuLoadingState />

  if (tableError === 'INACTIVE') {
    return <ErrorState description="Vui lòng liên hệ nhân viên nhà hàng để được hỗ trợ." title="Bàn này hiện không hoạt động" />
  }

  if (tableError === 'INVALID_OR_MISSING') {
    return <ErrorState description="Liên kết bàn không hợp lệ hoặc bàn này không còn tồn tại." title="Không tìm thấy bàn" />
  }

  if (!table) {
    return <ErrorState description="Vui lòng thử tải lại thực đơn sau ít phút." onRetry={() => setReloadKey(key => key + 1)} title="Không thể kiểm tra thông tin bàn" />
  }

  if (menuError) {
    return <ErrorState description="Vui lòng thử lại sau ít phút." onRetry={() => setReloadKey(key => key + 1)} title="Không thể tải thực đơn" />
  }

  return (
    <>
      <div className="space-y-6">
      <section className="rounded-card border border-brand-border bg-brand-soft p-4 sm:p-5">
        <p className="text-label text-brand">Thực đơn tại</p>
        <h1 className="mt-1 text-page-title text-content">Bàn {table.number}</h1>
        <p className="mt-2 text-compact text-content-secondary">Chọn món yêu thích để xem thông tin và tình trạng phục vụ.</p>
      </section>

      <SearchInput onChange={event => setSearchTerm(event.target.value)} onClear={() => setSearchTerm('')} placeholder="Tìm món ăn, đồ uống..." value={searchTerm} />

      <section aria-label="Lọc theo danh mục">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button aria-pressed={selectedCategoryId === null} className={`min-h-10 shrink-0 rounded-pill px-4 text-label font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 ${selectedCategoryId === null ? 'bg-brand text-on-primary' : 'border border-border bg-surface text-content hover:bg-surface-muted'}`} onClick={() => setSelectedCategoryId(null)} type="button">Tất cả</button>
          {categories.map(category => <button aria-pressed={selectedCategoryId === category.id} className={`min-h-10 shrink-0 rounded-pill px-4 text-label font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 ${selectedCategoryId === category.id ? 'bg-brand text-on-primary' : 'border border-border bg-surface text-content hover:bg-surface-muted'}`} key={category.id} onClick={() => setSelectedCategoryId(category.id)} type="button">{category.name}</button>)}
        </div>
      </section>

      {dishes.length === 0 ? (
        <EmptyState description="Vui lòng quay lại sau hoặc liên hệ nhân viên nhà hàng." icon={Utensils} title="Hiện chưa có món trong thực đơn" />
      ) : visibleDishes.length === 0 ? (
        <EmptyState description="Thử thay đổi từ khóa tìm kiếm hoặc danh mục để xem các món khác." icon={SearchX} title="Không tìm thấy món phù hợp" />
      ) : (
        <section aria-label="Danh sách món ăn">
          <h2 className="sr-only">Món ăn</h2>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleDishes.map(dish => <li key={dish.id}><DishCard dish={dish} onViewDetails={setSelectedDish} /></li>)}
          </ul>
        </section>
      )}
      </div>
      <DishDetailModal dish={selectedDish} isOpen={selectedDish !== null} onClose={() => setSelectedDish(null)} />
    </>
  )
}
