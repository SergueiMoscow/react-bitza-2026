import { useEffect, useState, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { ThemeProvider } from './theme/ThemeContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { SummaryPage } from './pages/SummaryPage'
import { ClientsPage } from './pages/ClientsPage'
import { RoomsPage } from './pages/RoomsPage'
import { ContractsPage } from './pages/ContractsPage'
import { PaymentsPage } from './pages/PaymentsPage'
import { ElectricityPage } from './pages/ElectricityPage'
import { GasPage } from './pages/GasPage'

// Постоянная ссылка вида /?token=... — вход без пароля (для клиента). Проверяем один раз
// при загрузке, до рендера роутов, чтобы не мелькнула страница логина.
function TokenLoginGate({ children }: { children: ReactNode }) {
  const { loginWithToken } = useAuth()
  const [checking, setChecking] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const token = new URLSearchParams(location.search).get('token')
    if (!token) {
      setChecking(false)
      return
    }
    loginWithToken(token).finally(() => {
      navigate(location.pathname, { replace: true })
      setChecking(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (checking) return <p style={{ padding: '2rem' }}>Входим…</p>
  return <>{children}</>
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <TokenLoginGate>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<SummaryPage />} />
                <Route path="/rooms" element={<RoomsPage />} />
                <Route path="/clients" element={<ClientsPage />} />
                <Route path="/contracts" element={<ContractsPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/electricity" element={<ElectricityPage />} />
                <Route path="/gas" element={<GasPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </TokenLoginGate>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
