import { useState } from 'react'
import { Utensils } from 'lucide-react'
import { Badge, Button, Modal } from '../../components/ui'
import type { PublicDish } from '../../types/public-menu'
import { formatVnd } from '../../utils/format-vnd'

type DishDetailModalProps = {
  dish: PublicDish | null
  isOpen: boolean
  onAddToCart: (dish: PublicDish) => void
  onClose: () => void
}

function DishDetailImage({ dish }: { dish: PublicDish }) {
  const [hasImageError, setHasImageError] = useState(false)
  const canShowImage = Boolean(dish.imageUrl) && !hasImageError

  return (
    <div className="relative aspect-4/3 overflow-hidden rounded-card bg-surface-muted">
      <div aria-hidden="true" className="flex size-full items-center justify-center"><Utensils className="size-12 text-content-muted" /></div>
      {canShowImage && <img alt={`Hình món ${dish.name}`} className={`absolute inset-0 size-full object-cover ${dish.isAvailable ? '' : 'opacity-70'}`} onError={() => setHasImageError(true)} src={dish.imageUrl} />}
    </div>
  )
}

export function DishDetailModal({ dish, isOpen, onAddToCart, onClose }: DishDetailModalProps) {
  if (!dish) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết món ăn">
      <div className="space-y-5">
        <DishDetailImage dish={dish} key={dish.id} />
        <div>
          <p className="text-label text-content-secondary">{dish.category.name}</p>
          <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
            <h3 className="text-section-title break-words text-content">{dish.name}</h3>
            <Badge variant={dish.isAvailable ? 'success' : 'neutral'}>{dish.isAvailable ? 'Có sẵn' : 'Tạm hết'}</Badge>
          </div>
          <p className="mt-3 text-price-lg text-content">{formatVnd(dish.price)}</p>
        </div>
        {dish.description ? (
          <p className="whitespace-pre-wrap break-words text-body text-content-secondary">{dish.description}</p>
        ) : (
          <p className="text-body text-content-muted">Món này chưa có mô tả.</p>
        )}
        <Button className="w-full" disabled={!dish.isAvailable} onClick={() => onAddToCart(dish)}>Thêm vào giỏ</Button>
      </div>
    </Modal>
  )
}
