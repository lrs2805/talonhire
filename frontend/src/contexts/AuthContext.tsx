import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile, UserRole } from '../types/database'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<Profile | null>
  signUp: (email: string, password: string, role: UserRole, metadata?: Record<string, string>) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
  })

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return data as Profile | null
  }, [])

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const profile = session?.user ? await fetchProfile(session.user.id) : null
      setState({ user: session?.user ?? null, session, profile, loading: false })
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const profile = session?.user ? await fetchProfile(session.user.id) : null
        setState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session,
          profile,
          loading: false,
        }))
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signIn = useCallback(async (email: string, password: string): Promise<Profile | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    const profile = data.session?.user ? await fetchProfile(data.session.user.id) : null
    if (profile) {
      setState(prev => ({ ...prev, user: data.session?.user ?? null, session: data.session, profile, loading: false }))
    }
    return profile
  }, [fetchProfile])

  const signUp = useCallback(async (
    email: string,
    password: string,
    role: UserRole,
    metadata: Record<string, string> = {}
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, ...metadata },
      },
    })
    if (error) throw error

    // The handle_new_user() trigger auto-creates the profile.
    // Now create the role-specific record.
    if (data.user) {
      if (role === 'candidate') {
        await supabase.from('candidates').insert({
          profile_id: data.user.id,
          location_city: metadata.location_city,
          location_country: metadata.location_country || 'BR',
        })
      } else if (role === 'company') {
        const rawSlug = (metadata.company_name || '')
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
        const slug = rawSlug || `company-${data.user.id.slice(0, 8)}`
        await supabase.from('companies').insert({
          owner_id: data.user.id,
          name: metadata.company_name || 'My Company',
          slug,
          email,
          country: metadata.country || 'PT',
        })
      }
    }
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setState({ user: null, session: null, profile: null, loading: false })
  }, [])

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!state.user) throw new Error('Not authenticated')
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', state.user.id)
    if (error) throw error
    setState(prev => ({
      ...prev,
      profile: prev.profile ? { ...prev.profile, ...updates } : null,
    }))
  }, [state.user])

  const value = useMemo(() => ({
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }), [state, signIn, signUp, signOut, updateProfile])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
