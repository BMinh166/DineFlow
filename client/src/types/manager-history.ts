export interface ManagerHistoryOrder {
  id: string
  status: 'CLOSED'
  closedAt: string
  itemCount: number
  total: number
  table: {
    id: string
    number: number
  }
}

export interface ManagerHistoryFilters {
  dateFrom?: string
  dateTo?: string
}

export type ManagerHistoricalItemStatus = 'PENDING' | 'PREPARING' | 'COMPLETED'

export interface ManagerHistoricalOrder {
  id: string
  status: 'CLOSED'
  createdAt: string
  closedAt: string
  total: number
  table: {
    id: string
    number: number
  }
  tableSession: {
    id: string
    status: 'CLOSED'
  }
  items: Array<{
    id: string
    dishNameSnapshot: string
    unitPriceSnapshot: number
    quantity: number
    status: ManagerHistoricalItemStatus
  }>
}
