import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { CustomerLayout } from '../layouts/CustomerLayout'
import { KitchenLayout } from '../layouts/KitchenLayout'
import { ManagerLayout } from '../layouts/ManagerLayout'
import { WaiterLayout } from '../layouts/WaiterLayout'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { RoleRoute } from '../components/auth/RoleRoute'
import { FrontendFoundationPage } from '../pages/FrontendFoundationPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { StaffLoginPage } from '../pages/auth/StaffLoginPage'
import { ManagerCategoryListPage } from '../pages/manager/ManagerCategoryListPage'
import { ManagerDishListPage } from '../pages/manager/ManagerDishListPage'
import { PublicMenuPage } from '../pages/customer/PublicMenuPage'

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
    path: '/table/:tableId',
    element: <CustomerLayout />,
    children: [
      {
        index: true,
        element: <PublicMenuPage />,
      },
      {
        path: 'menu',
        element: <PublicMenuPage />,
      },
    ],
  },
  {
    path: '/waiter',
    element: <ProtectedRoute><RoleRoute allowedRoles={['WAITER']}><WaiterLayout /></RoleRoute></ProtectedRoute>,
  },
  {
    path: '/waiter/tables',
    element: <ProtectedRoute><RoleRoute allowedRoles={['WAITER']}><WaiterLayout /></RoleRoute></ProtectedRoute>,
  },
  {
    path: '/kitchen',
    element: <ProtectedRoute><RoleRoute allowedRoles={['KITCHEN']}><KitchenLayout /></RoleRoute></ProtectedRoute>,
  },
  {
    path: '/manager',
    element: <ProtectedRoute><RoleRoute allowedRoles={['MANAGER']}><ManagerLayout /></RoleRoute></ProtectedRoute>,
  },
  {
    path: '/manager/categories',
    element: <ProtectedRoute><RoleRoute allowedRoles={['MANAGER']}><ManagerLayout><ManagerCategoryListPage /></ManagerLayout></RoleRoute></ProtectedRoute>,
  },
  {
    path: '/manager/dishes',
    element: <ProtectedRoute><RoleRoute allowedRoles={['MANAGER']}><ManagerLayout><ManagerDishListPage /></ManagerLayout></RoleRoute></ProtectedRoute>,
  },
  {
    path: '/staff/login',
    element: <StaffLoginPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
