import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { CustomerLayout } from '../layouts/CustomerLayout'
import { KitchenLayout } from '../layouts/KitchenLayout'
import { ManagerLayout } from '../layouts/ManagerLayout'
import { WaiterLayout } from '../layouts/WaiterLayout'
import { FrontendFoundationPage } from '../pages/FrontendFoundationPage'
import { NotFoundPage } from '../pages/NotFoundPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <FrontendFoundationPage />,
  },
  {
    path: '/customer',
    element: <CustomerLayout />,
  },
  {
    path: '/waiter',
    element: <WaiterLayout />,
  },
  {
    path: '/kitchen',
    element: <KitchenLayout />,
  },
  {
    path: '/manager',
    element: <ManagerLayout />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
