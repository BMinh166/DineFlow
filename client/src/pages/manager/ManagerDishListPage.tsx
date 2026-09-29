import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { SearchX, Utensils } from 'lucide-react'
import { Button, Card, ConfirmDialog, EmptyState, ErrorState, FilterBar, Input, Modal, PageHeader, PageLoading, SearchInput, Select, StatusBadge, Textarea, useToast } from '../../components/ui'
import { getManagerCategories } from '../../services/manager-category-api'
import { activateManagerDish, createManagerDish, deactivateManagerDish, getManagerDishes, markManagerDishAvailable, markManagerDishUnavailable, updateManagerDish, type DishInput } from '../../services/manager-dish-api'
import type { Category } from '../../types/category'
import type { Dish } from '../../types/dish'
import { getApiErrorMessage } from '../../utils/api-error'

type AvailabilityFilter = 'ALL' | 'AVAILABLE' | 'UNAVAILABLE'
type DishFormState = { categoryId: string; description: string; dish?: Dish; imageUrl: string; name: string; price: string }

function formatVnd(price: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(price)} ₫`
}

export function ManagerDishListPage() {
  const toast = useToast()
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('ALL')
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dishToDeactivate, setDishToDeactivate] = useState<Dish | null>(null)
  const [dishes, setDishes] = useState<Dish[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [formState, setFormState] = useState<DishFormState | null>(null)
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false)
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [mutationDishId, setMutationDishId] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    let isCurrent = true
    async function loadDishes() {
      setIsLoading(true); setErrorMessage(null)
      try { const result = await getManagerDishes(); if (isCurrent) setDishes(result) }
      catch (error) { if (isCurrent) setErrorMessage(getApiErrorMessage(error, 'Không thể tải món ăn. Vui lòng thử lại.')) }
      finally { if (isCurrent) setIsLoading(false) }
    }
    void loadDishes()
    return () => { isCurrent = false }
  }, [reloadKey])

  const categoriesForFilter = useMemo(() => {
    const byId = new Map<string, { id: string; name: string }>()
    dishes.forEach(dish => { if (dish.category) byId.set(dish.category.id, dish.category) })
    return [...byId.values()].sort((left, right) => left.name.localeCompare(right.name, 'vi'))
  }, [dishes])

  const visibleDishes = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('vi')
    return dishes.filter(dish => {
      const matchesSearch = !query || dish.name.toLocaleLowerCase('vi').includes(query) || dish.description?.toLocaleLowerCase('vi').includes(query)
      const matchesCategory = !categoryFilter || dish.category?.id === categoryFilter
      const matchesAvailability = availabilityFilter === 'ALL' || (availabilityFilter === 'AVAILABLE' && dish.isAvailable) || (availabilityFilter === 'UNAVAILABLE' && !dish.isAvailable)
      return matchesSearch && matchesCategory && matchesAvailability
    })
  }, [availabilityFilter, categoryFilter, dishes, searchTerm])

  const hasActiveFilters = Boolean(searchTerm || categoryFilter || availabilityFilter !== 'ALL')
  const isEditing = Boolean(formState?.dish)
  const formUnavailable = isCategoriesLoading || Boolean(categoryError) || categories.length === 0

  async function loadCategoriesForForm() {
    setIsCategoriesLoading(true); setCategoryError(null)
    try { setCategories(await getManagerCategories()) }
    catch (error) { setCategoryError(getApiErrorMessage(error, 'Không thể tải danh mục. Vui lòng thử lại.')) }
    finally { setIsCategoriesLoading(false) }
  }

  function openCreateForm() {
    setFormError(null); setFormState({ categoryId: '', description: '', imageUrl: '', name: '', price: '' })
    void loadCategoriesForForm()
  }

  function openEditForm(dish: Dish) {
    setFormError(null)
    setFormState({ categoryId: dish.category?.id ?? '', description: dish.description ?? '', dish, imageUrl: dish.imageUrl ?? '', name: dish.name, price: String(dish.price) })
    void loadCategoriesForForm()
  }

  function closeForm() {
    if (!isFormSubmitting) { setFormError(null); setFormState(null) }
  }

  function resetFilters() { setAvailabilityFilter('ALL'); setCategoryFilter(''); setSearchTerm('') }

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!formState || isFormSubmitting) return
    const price = Number(formState.price)
    if (!formState.name.trim() || !formState.categoryId || !formState.price.trim()) { setFormError('Vui lòng nhập tên món, chọn danh mục và nhập giá.'); return }
    if (!categories.some(category => category.id === formState.categoryId)) { setFormError('Danh mục đã chọn không còn khả dụng. Vui lòng tải lại danh mục và chọn lại.'); return }
    if (!Number.isInteger(price) || price < 0) { setFormError('Giá phải là số nguyên VND lớn hơn hoặc bằng 0.'); return }
    const input: DishInput = { categoryId: formState.categoryId, description: formState.description, imageUrl: formState.imageUrl, name: formState.name, price }
    setFormError(null); setIsFormSubmitting(true)
    try {
      if (formState.dish) { await updateManagerDish(formState.dish.id, input); toast.success('Đã cập nhật món ăn.') }
      else { await createManagerDish(input); toast.success('Đã thêm món ăn.') }
      setFormState(null); setReloadKey(key => key + 1)
    } catch (error) { setFormError(getApiErrorMessage(error, 'Không thể lưu món ăn. Vui lòng thử lại.')) }
    finally { setIsFormSubmitting(false) }
  }

  async function mutateDish(dishId: string, mutation: () => Promise<Dish>, successMessage: string) {
    if (mutationDishId) return
    setMutationDishId(dishId)
    try { await mutation(); toast.success(successMessage); setReloadKey(key => key + 1) }
    catch (error) { setReloadKey(key => key + 1); throw error }
    finally { setMutationDishId(null) }
  }

  function showMutationError(error: unknown, fallback: string) { toast.error(getApiErrorMessage(error, fallback)) }

  return (
    <div className="space-y-6">
      <PageHeader actions={<Button onClick={openCreateForm}>Thêm món</Button>} description="Quản lý các món ăn hiện có trong thực đơn." title="Món ăn" />
      {isLoading && <PageLoading label="Đang tải món ăn" />}
      {!isLoading && errorMessage && <ErrorState description={errorMessage} onRetry={() => setReloadKey(key => key + 1)} title="Không thể tải món ăn" />}
      {!isLoading && !errorMessage && dishes.length === 0 && <EmptyState action={<Button onClick={openCreateForm}>Thêm món</Button>} description="Thêm món ăn để bắt đầu xây dựng thực đơn." icon={Utensils} title="Chưa có món ăn" />}
      {!isLoading && !errorMessage && dishes.length > 0 && <>
        <FilterBar aria-label="Tìm kiếm và lọc món ăn">
          <SearchInput className="sm:min-w-72" onChange={event => setSearchTerm(event.target.value)} onClear={() => setSearchTerm('')} placeholder="Tìm theo tên hoặc mô tả món ăn" value={searchTerm} />
          <Select className="sm:w-52" label="Danh mục" onChange={event => setCategoryFilter(event.target.value)} value={categoryFilter}><option value="">Tất cả danh mục</option>{categoriesForFilter.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</Select>
          <Select className="sm:w-44" label="Tình trạng phục vụ" onChange={event => setAvailabilityFilter(event.target.value as AvailabilityFilter)} value={availabilityFilter}><option value="ALL">Tất cả</option><option value="AVAILABLE">Có sẵn</option><option value="UNAVAILABLE">Tạm hết</option></Select>
          {hasActiveFilters && <Button onClick={resetFilters} variant="secondary">Xóa bộ lọc</Button>}
        </FilterBar>
        {visibleDishes.length === 0 ? <EmptyState action={<Button onClick={resetFilters} variant="secondary">Xóa bộ lọc</Button>} description="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để xem các món khác." icon={SearchX} title="Không tìm thấy món phù hợp" /> : (
          <ul aria-label="Danh sách món ăn" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{visibleDishes.map(dish => {
            const pending = mutationDishId === dish.id
            return <li key={dish.id}><Card className="flex h-full flex-col overflow-hidden">
              <div className="flex min-w-0 flex-1"><div className="relative flex size-24 shrink-0 items-center justify-center bg-surface-muted sm:size-28"><Utensils aria-hidden="true" className="size-8 text-content-muted" />{dish.imageUrl && <img alt={`Hình món ${dish.name}`} className="absolute inset-0 size-full object-cover" onError={event => { event.currentTarget.style.display = 'none' }} src={dish.imageUrl} />}</div>
                <div className="min-w-0 flex-1 p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><h2 className="break-words text-card-title text-content">{dish.name}</h2><p className="mt-1 break-words text-compact text-content-secondary">{dish.category?.name ?? 'Danh mục không còn tồn tại'}</p></div><p className="shrink-0 text-price text-content">{formatVnd(dish.price)}</p></div><p className="mt-3 line-clamp-2 min-h-10 text-compact text-content-secondary">{dish.description || 'Chưa có mô tả.'}</p><div aria-label={`Trạng thái của ${dish.name}`} className="mt-3 flex flex-wrap gap-2"><StatusBadge entity="dish" status={dish.isActive ? 'ACTIVE' : 'INACTIVE'} /><StatusBadge entity="dish" status={dish.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'} /></div></div>
              </div>
              <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3"><Button disabled={Boolean(mutationDishId)} onClick={() => openEditForm(dish)} size="sm" variant="secondary">Chỉnh sửa</Button>{dish.isActive ? <Button disabled={Boolean(mutationDishId)} onClick={() => setDishToDeactivate(dish)} size="sm" variant="secondary">Vô hiệu hóa</Button> : <Button disabled={Boolean(mutationDishId)} loading={pending} onClick={() => void mutateDish(dish.id, () => activateManagerDish(dish.id), 'Đã kích hoạt món ăn.').catch(error => showMutationError(error, 'Không thể kích hoạt món ăn. Vui lòng thử lại.'))} size="sm">Kích hoạt</Button>}{dish.isAvailable ? <Button disabled={Boolean(mutationDishId)} loading={pending} onClick={() => void mutateDish(dish.id, () => markManagerDishUnavailable(dish.id), 'Đã đánh dấu món tạm hết.').catch(error => showMutationError(error, 'Không thể cập nhật tình trạng phục vụ. Vui lòng thử lại.'))} size="sm" variant="secondary">Đánh dấu tạm hết</Button> : <Button disabled={Boolean(mutationDishId)} loading={pending} onClick={() => void mutateDish(dish.id, () => markManagerDishAvailable(dish.id), 'Đã đánh dấu món có sẵn.').catch(error => showMutationError(error, 'Không thể cập nhật tình trạng phục vụ. Vui lòng thử lại.'))} size="sm" variant="secondary">Đánh dấu có sẵn</Button>}</div>
            </Card></li>
          })}</ul>
        )}
      </>}
      <Modal dismissible={!isFormSubmitting} footer={<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button disabled={isFormSubmitting} onClick={closeForm} variant="secondary">Hủy</Button><Button disabled={formUnavailable} form="dish-form" loading={isFormSubmitting} type="submit">{isEditing ? 'Lưu thay đổi' : 'Thêm món'}</Button></div>} isOpen={Boolean(formState)} onClose={closeForm} title={isEditing ? 'Chỉnh sửa món ăn' : 'Thêm món ăn'}>
        <form className="space-y-4" id="dish-form" onSubmit={handleFormSubmit}>
          {isCategoriesLoading && <PageLoading label="Đang tải danh mục" />}
          {!isCategoriesLoading && categoryError && <ErrorState description={categoryError} onRetry={() => void loadCategoriesForForm()} title="Không thể tải danh mục" />}
          {!isCategoriesLoading && !categoryError && categories.length === 0 && <p className="rounded-control bg-warning-soft p-3 text-compact text-warning">Cần có ít nhất một danh mục trước khi thêm hoặc chỉnh sửa món ăn.</p>}
          {!isCategoriesLoading && !categoryError && categories.length > 0 && <><Select disabled={isFormSubmitting} label="Danh mục *" onChange={event => setFormState(current => current ? { ...current, categoryId: event.target.value } : current)} required value={formState?.categoryId ?? ''}><option disabled value="">Chọn danh mục</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}{category.active ? '' : ' (Không hoạt động)'}</option>)}</Select><Input disabled={isFormSubmitting} label="Tên món *" onChange={event => setFormState(current => current ? { ...current, name: event.target.value } : current)} required value={formState?.name ?? ''} /><Input disabled={isFormSubmitting} inputMode="numeric" label="Giá (VND) *" min="0" onChange={event => setFormState(current => current ? { ...current, price: event.target.value } : current)} required step="1" type="number" value={formState?.price ?? ''} /><Textarea disabled={isFormSubmitting} label="Mô tả" onChange={event => setFormState(current => current ? { ...current, description: event.target.value } : current)} value={formState?.description ?? ''} /><Input disabled={isFormSubmitting} label="Đường dẫn hình ảnh" onChange={event => setFormState(current => current ? { ...current, imageUrl: event.target.value } : current)} type="url" value={formState?.imageUrl ?? ''} />{formError && <p className="text-compact text-danger" role="alert">{formError}</p>}</>}
        </form>
      </Modal>
      <ConfirmDialog confirmLabel="Vô hiệu hóa" description={dishToDeactivate ? `Món “${dishToDeactivate.name}” sẽ chuyển sang trạng thái không hoạt động. Món ăn không bị xóa và tình trạng phục vụ không thay đổi.` : ''} isOpen={Boolean(dishToDeactivate)} onClose={() => setDishToDeactivate(null)} onConfirm={() => dishToDeactivate ? mutateDish(dishToDeactivate.id, () => deactivateManagerDish(dishToDeactivate.id), 'Đã vô hiệu hóa món ăn.') : Promise.resolve()} onError={error => showMutationError(error, 'Không thể vô hiệu hóa món ăn. Vui lòng thử lại.')} title="Vô hiệu hóa món ăn?" />
    </div>
  )
}
