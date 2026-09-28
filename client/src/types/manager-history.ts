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
