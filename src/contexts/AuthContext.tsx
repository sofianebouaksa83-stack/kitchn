import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, AuthError } from "@supabase/supabase-js";
import { supabase, Profile } from "../lib/supabase";

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;

  signUp: (
    email: string,
    password: string,
    fullName: string,
    jobTitle: string,
    restaurantName: string
  ) => Promise<{ error: AuthError | null }>;

  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;

  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;

  // ✅ NOUVEAU : refresh du profil après accept invitation / changements backend
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, email, full_name, job_title, establishment, restaurant_id, restaurant_role, created_at, updated_at"
        )
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;

      setProfile(data ?? null);
    } catch (error) {
      console.error("Error loading profile:", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  // ✅ Exposé au front : à appeler après accept invitation
  async function refreshProfile() {
    if (!user?.id) return;
    await loadProfile(user.id);
  }

  async function signUp(
    email: string,
    password: string,
    fullName: string,
    jobTitle: string,
    restaurantName: string
  ) {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) return { error };
      if (!data.user) return { error: new AuthError("No user returned") };

      const { data: restaurantData, error: restaurantError } = await supabase
        .from("restaurants")
        .insert({
          name: restaurantName,
          owner_user_id: data.user.id,
        })
        .select()
        .maybeSingle();

      if (restaurantError || !restaurantData) {
        console.error("Error creating restaurant:", restaurantError);
        return { error: new AuthError("Failed to create restaurant") };
      }

      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        email,
        full_name: fullName,
        job_title: jobTitle,
        establishment: restaurantName,
        restaurant_id: restaurantData.id,
        restaurant_role: "chef", // ✅ champ critique
      });

      if (profileError) {
        console.error("Error creating profile:", profileError);
        return { error: new AuthError("Failed to create profile") };
      }

      // Optionnel : charge le profil direct
      await loadProfile(data.user.id);

      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!user) return { error: new Error("No user logged in") };

    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates) // ✅ MANQUAIT
        .eq("id", user.id);

      if (error) throw error;

      await loadProfile(user.id);
      return { error: null };
    } catch (error) {
      console.error("updateProfile error:", error);
      return { error: error as Error };
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signUp, signIn, signOut, updateProfile, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
