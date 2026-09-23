import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
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
import { ManagerQrCodePage } from '../pages/manager/ManagerQrCodePage'
import { ManagerTableListPage } from '../pages/manager/ManagerTableListPage'
import { PublicMenuPage } from '../pages/customer/PublicMenuPage'
import { CustomerCurrentOrderPage } from '../pages/customer/CustomerCurrentOrderPage'
import { KitchenQueuePage } from '../pages/kitchen/KitchenQueuePage'
import { WaiterTableBoardPage } from '../pages/waiter/WaiterTableBoardPage'

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
      {
        path: 'order',
        element: <CustomerCurrentOrderPage />,
      },
    ],
  },
  {
    path: '/waiter',
    element: <ProtectedRoute><RoleRoute allowedRoles={['WAITER']}><WaiterLayout /></RoleRoute></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <Navigate replace to="tables" />,
      },
      {
        path: 'tables',
        element: <WaiterTableBoardPage />,
      },
    ],
  },
  {
    path: '/kitchen',
    element: <ProtectedRoute><RoleRoute allowedRoles={['KITCHEN']}><KitchenLayout /></RoleRoute></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <KitchenQueuePage />,
      },
    ],
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
    path: '/manager/tables',
    element: <ProtectedRoute><RoleRoute allowedRoles={['MANAGER']}><ManagerLayout><ManagerTableListPage /></ManagerLayout></RoleRoute></ProtectedRoute>,
  },
  {
    path: '/manager/qr',
    element: <ProtectedRoute><RoleRoute allowedRoles={['MANAGER']}><ManagerLayout><ManagerQrCodePage /></ManagerLayout></RoleRoute></ProtectedRoute>,
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
