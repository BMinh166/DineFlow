import { useState } from 'react'
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'

import { Button, ConfirmDialog, Drawer, EmptyState, IconButton, useToast } from '../../components/ui'
import { useCustomerCart } from '../../hooks/useCustomerCart'
import { useCustomerSession } from '../../hooks/useCustomerSession'
import { getCustomerOrderErrorKind, placeCustomerOrder, type CustomerOrderErrorKind } from '../../services/customer-order-api'
import { formatVnd } from '../../utils/format-vnd'

const orderErrorMessages: Record<CustomerOrderErrorKind, string> = {
  'invalid-cart': 'Giỏ hàng không hợp lệ. Vui lòng kiểm tra lại số lượng món.',
  'session-expired': 'Phiên vào bàn không còn hiệu lực. Vui lòng vào bàn lại trước khi đặt món.',
  'dish-unavailable': 'Một hoặc nhiều món trong giỏ hiện không thể gọi. Vui lòng kiểm tra lại.',
  'order-locked': 'Đơn hiện tại không thể nhận thêm món. Vui lòng liên hệ nhân viên.',
  unexpected: 'Không thể đặt món lúc này. Vui lòng thử lại sau.',
}

export function CustomerCartDrawer({ isOrderingLocked, onOrderLocked, tableId }: {
  isOrderingLocked: boolean
  onOrderLocked: () => void
  tableId: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const { clearCart, decreaseQuantity, displayTotal, increaseQuantity, itemCount, items, removeItem, setSubmissionPending } = useCustomerCart(tableId)
  const { isAuthorizedForTable, status } = useCustomerSession()
  const toast = useToast()
  const isAuthorized = isAuthorizedForTable(tableId)
  const canPlaceOrder = items.length > 0 && isAuthorized && !isOrderingLocked && !isSubmitting

  async function handlePlaceOrder() {
    if (!canPlaceOrder) return

    const submittedItems = items.map(item => ({ dishId: item.dishId, quantity: item.quantity }))
    setIsSubmitting(true)
    setSubmissionPending(true)
    setSubmissionError(null)

    try {
      await placeCustomerOrder(submittedItems)
      clearCart()
      setIsOpen(false)
      toast.success('Đặt món thành công.')
    } catch (error) {
      const errorKind = getCustomerOrderErrorKind(error)
      setSubmissionError(orderErrorMessages[errorKind])
      if (errorKind === 'order-locked') onOrderLocked()
    } finally {
      setIsSubmitting(false)
      setSubmissionPending(false)
    }
  }

  return (
    <>
      <Button aria-label={`Mở giỏ hàng, ${itemCount} món`} onClick={() => setIsOpen(true)} variant="secondary"><ShoppingCart aria-hidden="true" className="size-4" />Giỏ hàng{itemCount > 0 ? ` (${itemCount})` : ''}</Button>
      <Drawer
        footer={items.length > 0 ? <div className="space-y-3"><div className="flex items-center justify-between gap-4"><div><p className="text-caption text-content-secondary">Tạm tính</p><p className="text-price text-content">{formatVnd(displayTotal)}</p></div><Button disabled={isSubmitting} onClick={clearCart} variant="secondary">Xóa giỏ</Button></div><Button className="w-full" disabled={!canPlaceOrder} onClick={() => setIsReviewOpen(true)}>Đặt món</Button></div> : undefined}
        isOpen={isOpen}
        onClose={() => !isSubmitting && setIsOpen(false)}
        title="Giỏ hàng"
      >
        {items.length === 0 ? <EmptyState description="Thêm món từ thực đơn để bắt đầu lựa chọn." icon={ShoppingCart} title="Giỏ hàng đang trống" /> : <div className="space-y-4"><p className="text-compact text-content-secondary">Giá cuối cùng được xác nhận khi đặt món.</p>{isOrderingLocked && <p className="rounded-control border border-warning bg-warning-soft p-3 text-compact text-warning" role="status">Đơn đã được khóa để thanh toán. Giỏ tạm không thể được gửi.</p>}{status === 'restoring' && <p className="text-compact text-content-secondary" role="status">Đang kiểm tra trạng thái vào bàn...</p>}{status !== 'restoring' && !isAuthorized && <p className="rounded-control border border-warning bg-warning-soft p-3 text-compact text-warning" role="status">Vui lòng vào bàn bằng mã nhân viên cung cấp trước khi đặt món.</p>}{submissionError && <p className="rounded-control border border-danger bg-danger-soft p-3 text-compact text-danger" role="alert">{submissionError}</p>}<ul className="space-y-3">{items.map(item => <li className="rounded-card border border-border p-3" key={item.dishId}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="break-words text-label text-content">{item.name}</h3><p className="mt-1 text-compact text-content-secondary">{formatVnd(item.price)}</p></div><IconButton aria-label={`Xóa ${item.name} khỏi giỏ`} disabled={isSubmitting || isOrderingLocked} icon={Trash2} onClick={() => removeItem(item.dishId)} size="sm" /></div><div className="mt-3 flex items-center justify-between gap-3"><p className="text-label text-content">{formatVnd(item.price * item.quantity)}</p><div className="flex items-center gap-1"><IconButton aria-label={`Giảm số lượng ${item.name}`} disabled={isSubmitting || isOrderingLocked} icon={Minus} onClick={() => decreaseQuantity(item.dishId)} size="sm" /><span aria-label={`Số lượng ${item.name}: ${item.quantity}`} className="min-w-8 text-center text-label text-content">{item.quantity}</span><IconButton aria-label={`Tăng số lượng ${item.name}`} disabled={isSubmitting || isOrderingLocked || item.quantity === 99} icon={Plus} onClick={() => increaseQuantity(item.dishId)} size="sm" /></div></div></li>)}</ul></div>}
      </Drawer>
      <ConfirmDialog confirmLabel="Đặt món" description="Các món trong giỏ sẽ được gửi đến nhà hàng. Giá và trạng thái cuối cùng do hệ thống xác nhận." isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} onConfirm={handlePlaceOrder} title="Xác nhận đặt món?" />
    </>
  )
}
