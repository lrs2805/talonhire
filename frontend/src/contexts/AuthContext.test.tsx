import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'user-1', email: 'test@example.com', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' } } },
      }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 'user-1', role: 'candidate', full_name: 'Test User', email: 'test@example.com', avatar_url: null, phone: null, preferred_language: 'en', timezone: null, lgpd_consent: false, lgpd_consent_at: null, gdpr_consent: false, gdpr_consent_at: null, data_retention_until: null, last_active_at: null, created_at: '', updated_at: '' },
      }),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
    })),
  },
}))

function TestConsumer() {
  const { loading, profile } = useAuth()
  if (loading) return <div>Loading auth...</div>
  return <div>Profile: {profile?.email ?? 'none'}</div>
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('provides auth state to children', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await screen.findByText(/Profile:/)
    expect(screen.getByText(/Profile:/)).toBeInTheDocument()
  })
})
