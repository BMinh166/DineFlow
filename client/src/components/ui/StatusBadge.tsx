import { Badge } from './Badge'

type StatusBadgeProps =
  | { entity: 'table'; status: 'AVAILABLE' | 'OCCUPIED' | 'PAYMENT_REQUESTED' }
  | { entity: 'order'; status: 'OPEN' | 'PAYMENT_REQUESTED' | 'CLOSED' }
  | { entity: 'order-item'; status: 'PENDING' | 'PREPARING' | 'COMPLETED' }
  | { entity: 'user'; status: 'ACTIVE' | 'INACTIVE' }
  | { entity: 'category'; status: 'ACTIVE' | 'INACTIVE' }
  | { entity: 'dish'; status: 'ACTIVE' | 'INACTIVE' | 'AVAILABLE' | 'UNAVAILABLE' }

type StatusPresentation = {
  label: string
  variant: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
}

const statusPresentations: Record<StatusBadgeProps['entity'], Record<string, StatusPresentation>> = {
  table: {
    AVAILABLE: { label: 'Trống', variant: 'success' },
    OCCUPIED: { label: 'Đang sử dụng', variant: 'info' },
    PAYMENT_REQUESTED: { label: 'Yêu cầu thanh toán', variant: 'danger' },
  },
  order: {
    OPEN: { label: 'Đang mở', variant: 'info' },
    PAYMENT_REQUESTED: { label: 'Yêu cầu thanh toán', variant: 'warning' },
    CLOSED: { label: 'Đã đóng', variant: 'success' },
  },
  'order-item': {
    PENDING: { label: 'Chờ xử lý', variant: 'warning' },
    PREPARING: { label: 'Đang chuẩn bị', variant: 'info' },
    COMPLETED: { label: 'Hoàn thành', variant: 'success' },
  },
  user: {
    ACTIVE: { label: 'Hoạt động', variant: 'success' },
    INACTIVE: { label: 'Không hoạt động', variant: 'neutral' },
  },
  category: {
    ACTIVE: { label: 'Hoạt động', variant: 'success' },
    INACTIVE: { label: 'Không hoạt động', variant: 'neutral' },
  },
  dish: {
    ACTIVE: { label: 'Hoạt động', variant: 'success' },
    INACTIVE: { label: 'Không hoạt động', variant: 'neutral' },
    AVAILABLE: { label: 'Có sẵn', variant: 'success' },
    UNAVAILABLE: { label: 'Không có sẵn', variant: 'neutral' },
  },
}

export function StatusBadge({ entity, status }: StatusBadgeProps) {
  const presentation = statusPresentations[entity][status]
  return <Badge variant={presentation.variant}>{presentation.label}</Badge>
}
