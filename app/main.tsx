import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { router } from './routes' // 아까 확인한 routes.tsx 파일
import '../styles/tailwind.css'   // 스타일 연결

const rootElement = document.getElementById('root')
if (rootElement) {
  createRoot(rootElement).render(
    <RouterProvider router={router} />
  )
}