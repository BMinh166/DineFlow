import { Router } from 'express'

import { listPublicMenuCategoriesController, listPublicMenuDishesController } from '../controllers/public-menu.controller.js'

export const publicMenuRouter = Router()

publicMenuRouter.get('/categories', listPublicMenuCategoriesController)
publicMenuRouter.get('/dishes', listPublicMenuDishesController)
