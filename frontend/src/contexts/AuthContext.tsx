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

  /**
   * GoTrue pode aguardar callbacks de `onAuthStateChange` antes de resolver `signUp`/`signInWithPassword`.
   * `async` + `await fetchProfile` dentro do listener bloqueava a Promise de signup (POST 200 mas UI presa em "Creating account...") — PHI-79 / P0-06.
   * Carregar o perfil fora do callback síncrono (microtask) evita bloquear a cadeia interna de auth.
   */
  const applySessionFromAuth = useCallback(
    (session: Session | null) => {
      if (!session?.user) {
        setState({ user: null, session: null, profile: null, loading: false })
        return
      }
      const uid = session.user.id
      setState(prev => ({
        ...prev,
        user: session.user,
        session,
        loading: true,
      }))
      queueMicrotask(() => {
        fetchProfile(uid)
          .then(profile => {
            setState(prev => ({
              ...prev,
              profile,
              loading: false,
            }))
          })
          .catch(() => {
            setState(prev => ({
              ...prev,
              profile: null,
              loading: false,
            }))
          })
      })
    },
    [fetchProfile]
  )

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      applySessionFromAuth(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      applySessionFromAuth(session)
    })

    return () => subscription.unsubscribe()
  }, [applySessionFromAuth])

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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, ...metadata },
      },
    })
    if (error) throw error
    // Profile + candidates/companies rows are created in handle_new_user() (SECURITY DEFINER).
    // Do not insert companies/candidates from the browser: RLS requires auth.uid() and caused PHI-79
    // (UI stuck on "Creating account..." after signup 200).
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
