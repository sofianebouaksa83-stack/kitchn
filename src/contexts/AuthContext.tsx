import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { User, AuthError } from "@supabase/supabase-js"
import { supabase, Profile } from "../lib/supabase"

type AuthContextType = {
  user: User | null
  profile: Profile | null
  loading: boolean

  signUp: (
    email: string,
    password: string,
    fullName: string,
    jobTitle: string,
    restaurantName: string
  ) => Promise<{ error: AuthError | null; needsEmailConfirmation?: boolean }>

  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>

  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function initializeAuth() {
    const { data } = await supabase.auth.getSession()

    const session = data.session

    setUser(session?.user ?? null)

    if (session?.user) {
      await loadProfile(session.user.id)
    } else {
      setLoading(false)
    }
  }

  async function loadProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          email,
          full_name,
          job_title,
          establishment,
          restaurant_id,
          restaurant_role,
          plan,
          created_at,
          updated_at
        `)
        .eq("id", userId)
        .maybeSingle()

      if (error) throw error

      setProfile(data ?? null)
    } catch (error) {
      console.error("Error loading profile:", error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  async function refreshProfile() {
    if (!user?.id) return
    await loadProfile(user.id)
  }

  async function signUp(
    email: string,
    password: string,
    fullName: string,
    jobTitle: string,
    restaurantName: string
  ) {
    try {
      const emailRedirectTo = `${window.location.origin}/#/auth/callback`

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo,
          data: {
            full_name: fullName,
            job_title: jobTitle,
            establishment: restaurantName,
            restaurant_role: jobTitle,
          },
        },
      })

      if (error) return { error }

      const needsEmailConfirmation = !data.session

      if (data.user?.id && data.session) {
        await loadProfile(data.user.id)
      }

      return { error: null, needsEmailConfirmation }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (!error && !data.session) {
      return { error: new AuthError("Email non confirmé. Vérifie ta boîte mail.") }
    }

    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!user) return { error: new Error("No user logged in") }

    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)

      if (error) throw error

      await loadProfile(user.id)

      return { error: null }
    } catch (error) {
      console.error("updateProfile error:", error)
      return { error: error as Error }
    }
  }

  /**
   * 🔥 AUTO REFRESH PROFILE
   * Recharge le plan toutes les 60 secondes
   * (utile après paiement Stripe)
   */
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      refreshProfile()
    }, 60000)

    return () => clearInterval(interval)
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}