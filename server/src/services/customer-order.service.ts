import mongoose, { Types } from 'mongoose'

import { Category } from '../models/category.js'
import { Dish } from '../models/dish.js'
import { Order } from '../models/order.js'
import { TableSession } from '../models/table-session.js'
import { Conflict, NotFound, Unauthorized } from '../utils/app-error.js'
import type { AddCustomerOrderItemsRequest } from '../validators/customer-order.validator.js'

type CustomerSessionIdentity = {
  tableId: string
  tableSessionId: string
}

type NewOrderItem = {
  dishId: Types.ObjectId
  dishNameSnapshot: string
  quantity: number
  status: 'PENDING'
  unitPriceSnapshot: number
}

export interface CustomerOrderMutationResult {
  order: {
    id: string
    status: 'OPEN'
    total: number
  }
}

function orderNotOpenError(status: string): Conflict {
  if (status === 'PAYMENT_REQUESTED') {
    return new Conflict('Order is awaiting payment.', 'ORDER_PAYMENT_REQUESTED')
  }

  if (status === 'CLOSED') {
    return new Conflict('Order is closed.', 'ORDER_CLOSED')
  }

  return new Conflict('Order is not open.', 'ORDER_NOT_OPEN')
}

function customerSessionInactiveError(): Unauthorized {
  return new Unauthorized('Customer session is no longer active.', 'CUSTOMER_SESSION_INACTIVE')
}

function invalidStoredPriceError(): Conflict {
  return new Conflict('Dish price is invalid.', 'DISH_PRICE_INVALID')
}

export async function addCustomerOrderItems(
  customerSession: CustomerSessionIdentity,
  { items }: AddCustomerOrderItemsRequest,
): Promise<CustomerOrderMutationResult> {
  const transactionSession = await mongoose.startSession()

  try {
    return await transactionSession.withTransaction(async () => {
      const tableSession = await TableSession.findOne({
        _id: customerSession.tableSessionId,
        tableId: customerSession.tableId,
        status: 'ACTIVE',
      })
        .select('_id currentOrderId')
        .session(transactionSession)

      if (!tableSession) throw customerSessionInactiveError()
      if (!tableSession.currentOrderId) {
        throw new Conflict('Current order is unavailable.', 'CURRENT_ORDER_NOT_FOUND')
      }

      const order = await Order.findOne({
        _id: tableSession.currentOrderId,
        tableSessionId: tableSession._id,
      })
        .select('_id status')
        .session(transactionSession)

      if (!order) throw new Conflict('Current order is unavailable.', 'CURRENT_ORDER_NOT_FOUND')
      if (order.status !== 'OPEN') throw orderNotOpenError(order.status)

      const dishIds = items.map(item => item.dishId)
      const dishes = await Dish.find({ _id: { $in: dishIds } })
        .select('_id categoryId name price isActive isAvailable')
        .session(transactionSession)
      const dishesById = new Map(dishes.map(dish => [dish._id.toString(), dish]))

      const categoryIds = dishes.map(dish => dish.categoryId)
      const activeCategories = await Category.find({ _id: { $in: categoryIds }, active: true })
        .select('_id')
        .session(transactionSession)
      const activeCategoryIds = new Set(activeCategories.map(category => category._id.toString()))

      const newItems: NewOrderItem[] = items.map(item => {
        const dish = dishesById.get(item.dishId)
        if (!dish) throw new NotFound('Dish not found.', 'DISH_NOT_FOUND')
        if (!dish.isActive) throw new Conflict('Dish is inactive.', 'DISH_INACTIVE')
        if (!dish.isAvailable) throw new Conflict('Dish is unavailable.', 'DISH_UNAVAILABLE')
        if (!activeCategoryIds.has(dish.categoryId.toString())) {
          throw new Conflict('Dish category is inactive.', 'DISH_CATEGORY_INACTIVE')
        }
        if (!Number.isSafeInteger(dish.price) || dish.price < 0) throw invalidStoredPriceError()

        return {
          dishId: dish._id,
          dishNameSnapshot: dish.name,
          quantity: item.quantity,
          status: 'PENDING',
          unitPriceSnapshot: dish.price,
        }
      })

      const addedTotal = newItems.reduce((total, item) => total + item.unitPriceSnapshot * item.quantity, 0)
      if (!Number.isSafeInteger(addedTotal)) throw invalidStoredPriceError()

      const updatedOrder = await Order.findOneAndUpdate(
        {
          _id: order._id,
          tableSessionId: tableSession._id,
          status: 'OPEN',
        },
        {
          $inc: { total: addedTotal },
          $push: { items: { $each: newItems } },
        },
        { new: true, session: transactionSession },
      ).select('_id status total')

      if (!updatedOrder) throw new Conflict('Order is no longer open.', 'ORDER_NOT_OPEN')
      if (!Number.isSafeInteger(updatedOrder.total) || updatedOrder.total < 0) {
        throw new Conflict('Order total is invalid.', 'ORDER_TOTAL_INVALID')
      }

      return {
        order: {
          id: updatedOrder._id.toString(),
          status: 'OPEN',
          total: updatedOrder.total,
        },
      }
    })
  } finally {
    await transactionSession.endSession()
  }
}
