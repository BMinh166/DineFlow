import { Table } from '../models/table.js'
import { listKitchenQueue } from './kitchen-queue.service.js'
import { getManagerRevenueSummary } from './manager-revenue.service.js'
import { listManagerTopDishes, type ManagerTopDishDto } from './manager-top-dishes.service.js'
import { getTodayManagerRevenueQuery } from '../validators/manager-revenue.validator.js'

export interface ManagerDashboardDto {
  summary: {
    todayRevenue: number
    todayClosedOrderCount: number
    tablesInUse: number
    activeTableCount: number
    preparingItemCount: number
  }
  topDishes: ManagerTopDishDto[]
}

export async function getManagerDashboard(): Promise<ManagerDashboardDto> {
  const [revenue, tablesInUse, activeTableCount, kitchenTickets, topDishes] = await Promise.all([
    getManagerRevenueSummary(getTodayManagerRevenueQuery()),
    Table.countDocuments({ active: true, status: 'OCCUPIED' }),
    Table.countDocuments({ active: true }),
    listKitchenQueue(),
    listManagerTopDishes(),
  ])

  return {
    summary: {
      todayRevenue: revenue.totalRevenue,
      todayClosedOrderCount: revenue.closedOrderCount,
      tablesInUse,
      activeTableCount,
      preparingItemCount: kitchenTickets.filter(ticket => ticket.status === 'PREPARING').length,
    },
    topDishes: topDishes.slice(0, 5),
  }
}
