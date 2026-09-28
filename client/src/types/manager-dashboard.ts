import type { ManagerTopDish } from './manager-top-dishes'

export interface ManagerDashboard {
  summary: {
    todayRevenue: number
    todayClosedOrderCount: number
    tablesInUse: number
    activeTableCount: number
    preparingItemCount: number
  }
  topDishes: ManagerTopDish[]
}
