import { useEffect, useMemo, useState } from 'react'
import { Minus, Plus, SearchX, Trash2, Utensils } from 'lucide-react'

import { Button, EmptyState, ErrorState, Modal, PageLoading, SearchInput } from '../../components/ui'
import { getPublicMenuCategories, getPublicMenuDishes } from '../../services/public-menu-api'
import { addWaiterOrderItems } from '../../services/waiter-table-api'
import type { PublicCategory, PublicDish } from '../../types/public-menu'
import { getApiErrorCode } from '../../utils/api-error'
import { formatVnd } from '../../utils/format-vnd'

type CartItem = Pick<PublicDish, 'id' | 'name' | 'price'> & { quantity: number }

type Props = {
  isOpen: boolean
  onAuthoritativeInvalidation: (message: string) => void
  onClose: () => void
  onSuccess: () => void
  table: { id: string, number: number } | null
}

const maximumQuantity = 99
const operationalConflictCodes = new Set([
  'ACTIVE_TABLE_SESSION_INCONSISTENT',
  'ACTIVE_TABLE_SESSION_NOT_FOUND',
  'CURRENT_ORDER_NOT_FOUND',
  'ORDER_CLOSED',
  'ORDER_NOT_OPEN',
  'ORDER_PAYMENT_REQUESTED',
  'TABLE_INACTIVE',
  'TABLE_NOT_FOUND',
  'TABLE_NOT_OCCUPIED',
])
const dishValidationMessages: Record<string, string> = {
  DISH_CATEGORY_INACTIVE: 'Danh mục của một món đã ngừng phục vụ. Vui lòng kiểm tra lại giỏ tạm.',
  DISH_INACTIVE: 'Một món trong giỏ đã ngừng phục vụ. Vui lòng kiểm tra lại giỏ tạm.',
  DISH_NOT_FOUND: 'Không tìm thấy một món trong giỏ. Vui lòng kiểm tra lại giỏ tạm.',
  DISH_UNAVAILABLE: 'Một món trong giỏ hiện tạm hết. Vui lòng kiểm tra lại giỏ tạm.',
  VALIDATION_ERROR: 'Giỏ tạm không hợp lệ. Vui lòng kiểm tra số lượng món.',
}

export function WaiterAssistedOrderingModal({ isOpen, onAuthoritativeInvalidation, onClose, onSuccess, table }: Props) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [categories, setCategories] = useState<PublicCategory[]>([])
  const [dishes, setDishes] = useState<PublicDish[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [menuError, setMenuError] = useState(false)
  const [menuReloadKey, setMenuReloadKey] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    let isCurrent = true
    setCart([]); setCategories([]); setDishes([]); setErrorMessage(null); setMenuError(false)
    setSearchTerm(''); setSelectedCategoryId(null)
  }, [isOpen, table?.id])

  useEffect(() => {
    if (!isOpen) return
    let isCurrent = true
    setIsLoading(true)
    setMenuError(false)
    void Promise.all([getPublicMenuCategories(), getPublicMenuDishes()])
      .then(([loadedCategories, loadedDishes]) => {
        if (!isCurrent) return
        setCategories(loadedCategories); setDishes(loadedDishes)
      })
      .catch(() => { if (isCurrent) setMenuError(true) })
      .finally(() => { if (isCurrent) setIsLoading(false) })
    return () => { isCurrent = false }
  }, [isOpen, menuReloadKey, table?.id])

  const visibleDishes = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase('vi-VN')
    return dishes.filter(dish => (selectedCategoryId === null || dish.category.id === selectedCategoryId)
      && (!normalizedSearch || dish.name.toLocaleLowerCase('vi-VN').includes(normalizedSearch)))
  }, [dishes, searchTerm, selectedCategoryId])
  const cartQuantity = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart])
  const displaySubtotal = useMemo(() => cart.reduce((total, item) => total + item.price * item.quantity, 0), [cart])

  function quantityFor(dishId: string) { return cart.find(item => item.id === dishId)?.quantity ?? 0 }
  function addDish(dish: PublicDish) {
    if (isSubmitting) return
    setCart(current => {
      const existing = current.find(item => item.id === dish.id)
      if (!existing) return [...current, { id: dish.id, name: dish.name, price: dish.price, quantity: 1 }]
      return current.map(item => item.id === dish.id ? { ...item, quantity: Math.min(maximumQuantity, item.quantity + 1) } : item)
    })
  }
  function changeQuantity(dishId: string, delta: number) {
    if (isSubmitting) return
    setCart(current => current.flatMap(item => {
      if (item.id !== dishId) return [item]
      const quantity = item.quantity + delta
      return quantity < 1 ? [] : [{ ...item, quantity: Math.min(maximumQuantity, quantity) }]
    }))
  }
  async function submit() {
    if (!table || cart.length === 0 || isSubmitting) return
    setIsSubmitting(true); setErrorMessage(null)
    try {
      await addWaiterOrderItems(table.id, cart.map(item => ({ dishId: item.id, quantity: item.quantity })))
      setCart([])
      onSuccess()
    } catch (error) {
      const errorCode = getApiErrorCode(error)
      if (errorCode && operationalConflictCodes.has(errorCode)) {
        onAuthoritativeInvalidation('Trạng thái bàn hoặc đơn đã thay đổi. Vui lòng xem lại chi tiết bàn trước khi thêm món.')
        return
      }
      if (errorCode && dishValidationMessages[errorCode]) {
        setErrorMessage(dishValidationMessages[errorCode])
        setMenuReloadKey(key => key + 1)
        return
      }
      onAuthoritativeInvalidation('Không xác định được kết quả thêm món. Hệ thống sẽ tải lại chi tiết bàn; không tự gửi lại yêu cầu.')
    } finally { setIsSubmitting(false) }
  }

  const footer = <div className="space-y-3"><div className="flex flex-wrap items-end justify-between gap-2 text-compact"><span className="text-content-secondary">{cartQuantity} món đã chọn · Tạm tính</span><strong className="text-price text-content">{formatVnd(displaySubtotal)}</strong></div><p className="text-caption text-content-secondary">Tạm tính theo thực đơn hiện tại. Tổng đơn được máy chủ xác nhận sau khi thêm món.</p><div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button disabled={isSubmitting || cart.length === 0} onClick={() => setCart([])} variant="secondary">Xóa giỏ tạm</Button><Button disabled={cart.length === 0 || isLoading} loading={isSubmitting} onClick={() => void submit()}>Thêm vào Bàn {table?.number}</Button></div></div>

  return <Modal className="max-w-5xl" dismissible={!isSubmitting} footer={footer} isOpen={isOpen} onClose={onClose} title={table ? `Hỗ trợ thêm món · Bàn ${table.number}` : 'Hỗ trợ thêm món'}><div className="space-y-5">
    {errorMessage && <p className="rounded-control border border-danger bg-danger-soft p-3 text-compact text-danger" role="alert">{errorMessage}</p>}
    {isLoading && <PageLoading label="Đang tải thực đơn" />}
    {!isLoading && menuError && <ErrorState description="Vui lòng đóng và thử lại sau ít phút." title="Không thể tải thực đơn" />}
    {!isLoading && !menuError && <><SearchInput disabled={isSubmitting} onChange={event => setSearchTerm(event.target.value)} onClear={() => setSearchTerm('')} placeholder="Tìm món ăn, đồ uống..." value={searchTerm} /><section aria-label="Lọc theo danh mục"><div className="flex gap-2 overflow-x-auto pb-1"><button aria-pressed={selectedCategoryId === null} className={`min-h-10 shrink-0 rounded-pill px-4 text-label font-semibold ${selectedCategoryId === null ? 'bg-brand text-on-primary' : 'border border-border bg-surface text-content'}`} disabled={isSubmitting} onClick={() => setSelectedCategoryId(null)} type="button">Tất cả</button>{categories.map(category => <button aria-pressed={selectedCategoryId === category.id} className={`min-h-10 shrink-0 rounded-pill px-4 text-label font-semibold ${selectedCategoryId === category.id ? 'bg-brand text-on-primary' : 'border border-border bg-surface text-content'}`} disabled={isSubmitting} key={category.id} onClick={() => setSelectedCategoryId(category.id)} type="button">{category.name}</button>)}</div></section>
      {dishes.length === 0 ? <EmptyState description="Thực đơn hiện chưa có món để hỗ trợ gọi." icon={Utensils} title="Chưa có món" /> : visibleDishes.length === 0 ? <EmptyState description="Thử thay đổi từ khóa hoặc danh mục." icon={SearchX} title="Không tìm thấy món phù hợp" /> : <ul aria-label="Thực đơn hỗ trợ gọi món" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{visibleDishes.map(dish => <li className="flex min-w-0 flex-col rounded-card border border-border p-4" key={dish.id}><p className="text-caption text-content-secondary">{dish.category.name}</p><h3 className="mt-1 break-words text-card-title text-content">{dish.name}</h3>{dish.description && <p className="mt-2 line-clamp-2 text-compact text-content-secondary">{dish.description}</p>}<div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-4"><p className="text-price text-content">{formatVnd(dish.price)}</p><span className="text-caption text-content-secondary">{dish.isAvailable ? 'Có sẵn' : 'Tạm hết'}</span></div>{quantityFor(dish.id) > 0 && <p className="mt-3 text-caption text-brand">Đã chọn: {quantityFor(dish.id)}</p>}<Button className="mt-3 w-full" disabled={!dish.isAvailable || isSubmitting || quantityFor(dish.id) >= maximumQuantity} onClick={() => addDish(dish)}>{quantityFor(dish.id) >= maximumQuantity ? 'Đã đạt tối đa' : 'Thêm món'}</Button></li>)}</ul>}
      {cart.length > 0 && <section aria-labelledby="assisted-cart-heading" className="rounded-card border border-border p-4"><h3 className="text-card-title text-content" id="assisted-cart-heading">Giỏ tạm</h3><ul className="mt-3 space-y-3">{cart.map(item => <li className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 first:border-t-0 first:pt-0" key={item.id}><div className="min-w-0"><p className="break-words font-medium text-content">{item.name}</p><p className="text-compact text-content-secondary">{formatVnd(item.price)} · giá hiển thị</p></div><div className="flex items-center gap-2"><Button aria-label={`Giảm số lượng ${item.name}`} disabled={isSubmitting} onClick={() => changeQuantity(item.id, -1)} size="sm" variant="secondary"><Minus aria-hidden="true" className="size-4" /></Button><span aria-label={`Số lượng ${item.name}`} className="min-w-6 text-center font-semibold">{item.quantity}</span><Button aria-label={`Tăng số lượng ${item.name}`} disabled={isSubmitting || item.quantity >= maximumQuantity} onClick={() => changeQuantity(item.id, 1)} size="sm" variant="secondary"><Plus aria-hidden="true" className="size-4" /></Button><Button aria-label={`Xóa ${item.name}`} disabled={isSubmitting} onClick={() => setCart(current => current.filter(cartItem => cartItem.id !== item.id))} size="sm" variant="ghost"><Trash2 aria-hidden="true" className="size-4" /></Button></div></li>)}</ul></section>}</>}
  </div></Modal>
}
