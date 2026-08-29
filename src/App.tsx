import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
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

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
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
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
