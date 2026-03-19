import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { UserRole } from '../types/database'
import LoadingSpinner from './LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()

  if (loading) return <LoadingSpinner />

  if (!user) return <Navigate to="/auth/login" replace />

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    // Redirect to appropriate dashboard based on role
    const roleRoutes: Record<UserRole, string> = {
      candidate: '/candidate/dashboard',
      company: '/company/dashboard',
      admin_master: '/admin/dashboard',
      admin_recruiter: '/admin/dashboard',
      instructor: '/instructor/dashboard',
    }
    return <Navigate to={roleRoutes[profile.role] || '/'} replace />
  }

  return <>{children}</>
}
