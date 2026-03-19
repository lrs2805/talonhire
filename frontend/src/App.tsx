import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingSpinner from './components/LoadingSpinner'
import ProtectedRoute from './components/ProtectedRoute'
import LanguageSwitcher from './components/LanguageSwitcher'
import Header from './components/Header'

// Lazy-loaded pages
const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const CandidateDashboard = lazy(() => import('./pages/CandidateDashboard'))
const CompanyDashboard = lazy(() => import('./pages/CompanyDashboard'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const SharePage = lazy(() => import('./pages/SharePage'))
const JobNewPage = lazy(() => import('./pages/JobNewPage'))
function AppRoutes() {
  const { profile } = useAuth()

  // Smart redirect based on role
  const homeRedirect = () => {
    if (!profile) return '/'
    switch (profile.role) {
      case 'candidate': return '/candidate/dashboard'
      case 'company': return '/company/dashboard'
      case 'admin_master':
      case 'admin_recruiter': return '/admin/dashboard'
      default: return '/'
    }
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/signup" element={<SignupPage />} />
      <Route path="/share/:token" element={<SharePage />} />

      {/* Candidate */}
      <Route path="/candidate/dashboard" element={
        <ProtectedRoute allowedRoles={['candidate']}>
          <CandidateDashboard />
        </ProtectedRoute>
      } />
      {/* Company */}
      <Route path="/company/dashboard" element={
        <ProtectedRoute allowedRoles={['company']}>
          <CompanyDashboard />
        </ProtectedRoute>
      } />
      <Route path="/company/jobs/new" element={
        <ProtectedRoute allowedRoles={['company']}>
          <JobNewPage />
        </ProtectedRoute>
      } />

      {/* Admin */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin_master', 'admin_recruiter']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to={homeRedirect()} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-[#0A0A0A] text-white relative">
            <Header />
            <div className="fixed top-4 right-20 z-[100]">
              <LanguageSwitcher />
            </div>
            <Suspense fallback={<LoadingSpinner />}>
              <AppRoutes />
            </Suspense>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
