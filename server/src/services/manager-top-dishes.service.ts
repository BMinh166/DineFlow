import { Order } from '../models/order.js'

const topDishesLimit = 10

export interface ManagerTopDishDto {
  dishId: string
  dishName: string
  quantity: number
}

interface TopDishAggregateResult {
  _id: {
    dishId: { toString(): string }
    dishName: string
  }
  quantity: number
}

export async function listManagerTopDishes(): Promise<ManagerTopDishDto[]> {
  const topDishes = await Order.aggregate<TopDishAggregateResult>([
    { $match: { status: 'CLOSED' } },
    { $unwind: '$items' },
    {
      $group: {
        _id: {
          dishId: '$items.dishId',
          dishName: '$items.dishNameSnapshot',
        },
        quantity: { $sum: '$items.quantity' },
      },
    },
    { $sort: { quantity: -1, '_id.dishName': 1, '_id.dishId': 1 } },
    { $limit: topDishesLimit },
  ])

  return topDishes.map(dish => ({
    dishId: dish._id.dishId.toString(),
    dishName: dish._id.dishName,
    quantity: dish.quantity,
  }))
}
