import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { Layout } from './components/layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import UploadPage from './pages/UploadPage'
import EntryDetailPage from './pages/EntryDetailPage'
import PagesPage from './pages/PagesPage'
import PageDetailPage from './pages/PageDetailPage'

function LayoutRoute() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes with layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<LayoutRoute />}>
              <Route path="/" element={<PagesPage />} />
              <Route path="/pages/:id" element={<PageDetailPage />} />
              <Route path="/entries" element={<DashboardPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/entry/:id" element={<EntryDetailPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
