import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { FrontendFoundationPage } from '../pages/FrontendFoundationPage'
import { NotFoundPage } from '../pages/NotFoundPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <FrontendFoundationPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
