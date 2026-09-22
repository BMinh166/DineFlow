import { useState } from 'react'
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'

import { Button, Drawer, EmptyState, IconButton } from '../../components/ui'
import { useCustomerCart } from '../../hooks/useCustomerCart'
import { formatVnd } from '../../utils/format-vnd'

export function CustomerCartDrawer({ tableId }: { tableId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const { clearCart, decreaseQuantity, displayTotal, increaseQuantity, itemCount, items, removeItem } = useCustomerCart(tableId)

  return (
    <>
      <Button aria-label={`Mở giỏ hàng, ${itemCount} món`} onClick={() => setIsOpen(true)} variant="secondary"><ShoppingCart aria-hidden="true" className="size-4" />Giỏ hàng{itemCount > 0 ? ` (${itemCount})` : ''}</Button>
      <Drawer footer={items.length > 0 ? <div className="flex items-center justify-between gap-4"><div><p className="text-caption text-content-secondary">Tạm tính</p><p className="text-price text-content">{formatVnd(displayTotal)}</p></div><Button onClick={clearCart} variant="secondary">Xóa giỏ</Button></div> : undefined} isOpen={isOpen} onClose={() => setIsOpen(false)} title="Giỏ hàng">
        {items.length === 0 ? <EmptyState description="Thêm món từ thực đơn để bắt đầu lựa chọn." icon={ShoppingCart} title="Giỏ hàng đang trống" /> : <div className="space-y-4"><p className="text-compact text-content-secondary">Giá cuối cùng được xác nhận khi đặt món.</p><ul className="space-y-3">{items.map(item => <li className="rounded-card border border-border p-3" key={item.dishId}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="break-words text-label text-content">{item.name}</h3><p className="mt-1 text-compact text-content-secondary">{formatVnd(item.price)}</p></div><IconButton aria-label={`Xóa ${item.name} khỏi giỏ`} icon={Trash2} onClick={() => removeItem(item.dishId)} size="sm" /></div><div className="mt-3 flex items-center justify-between gap-3"><p className="text-label text-content">{formatVnd(item.price * item.quantity)}</p><div className="flex items-center gap-1"><IconButton aria-label={`Giảm số lượng ${item.name}`} icon={Minus} onClick={() => decreaseQuantity(item.dishId)} size="sm" /><span aria-label={`Số lượng ${item.name}: ${item.quantity}`} className="min-w-8 text-center text-label text-content">{item.quantity}</span><IconButton aria-label={`Tăng số lượng ${item.name}`} disabled={item.quantity === 99} icon={Plus} onClick={() => increaseQuantity(item.dishId)} size="sm" /></div></div></li>)}</ul></div>}
      </Drawer>
    </>
  )
}
