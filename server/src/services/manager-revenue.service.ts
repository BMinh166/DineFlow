import { Order } from '../models/order.js'
import type { ManagerRevenueQuery, RevenuePeriod } from '../validators/manager-revenue.validator.js'

export interface ManagerRevenueSummaryDto {
  period: RevenuePeriod
  totalRevenue: number
  closedOrderCount: number
}

interface RevenueAggregateResult {
  totalRevenue: number
  closedOrderCount: number
}

export async function getManagerRevenueSummary(
  query: ManagerRevenueQuery,
): Promise<ManagerRevenueSummaryDto> {
  const [summary] = await Order.aggregate<RevenueAggregateResult>([
    {
      $match: {
        status: 'CLOSED',
        closedAt: {
          $gte: query.closedAtFrom,
          $lt: query.closedAtTo,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$total' },
        closedOrderCount: { $sum: 1 },
      },
    },
  ])

  return {
    period: query.period,
    totalRevenue: summary?.totalRevenue ?? 0,
    closedOrderCount: summary?.closedOrderCount ?? 0,
  }
}
