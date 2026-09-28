export type ManagerRevenuePeriod = 'TODAY' | 'LAST_7_DAYS' | 'CUSTOM_RANGE'

export type ManagerRevenueQuery =
  | { period: 'TODAY' | 'LAST_7_DAYS' }
  | { period: 'CUSTOM_RANGE'; dateFrom: string; dateTo: string }

export interface ManagerRevenueSummary {
  period: ManagerRevenuePeriod
  totalRevenue: number
  closedOrderCount: number
}
