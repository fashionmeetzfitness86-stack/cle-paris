import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { onAuthStateChange } from "../lib/auth";
import { isSupabaseConfigured, isMockMode } from "../../lib/supabase";
import type { AdminUser } from "../types";
import supabase from "../../lib/supabase";

interface AuthContextValue {
  session: Session | null;
  adminUser: AdminUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  adminUser: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the admin_users row for the current auth user
  const loadAdminUser = async (userId: string) => {
    if (isMockMode()) {
      // Dev-only mock admin user (never in production)
      setAdminUser({
        id: "mock-admin-id",
        email: "admin@cleparis.store",
        name: "Admin Principal",
        role: "admin",
        last_login: null,
        created_at: new Date().toISOString(),
      });
      return;
    }
    const { data } = await supabase
      .from("admin_users")
      .select("*")
      .eq("auth_user_id", userId)
      .single();
    setAdminUser(data as AdminUser | null);
  };

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Dev-only mock mode: check localStorage for mock auth.
      // In production isMockMode() is false, so we never grant mock access.
      const isMockAuth = isMockMode() && localStorage.getItem("cle-admin-auth") === "true";
      if (isMockAuth) {
        loadAdminUser("mock-user-id");
      }
      setLoading(false);
      return;
    }

    // Real Supabase auth
    const subscription = onAuthStateChange(async (s) => {
      setSession(s);
      if (s?.user) {
        await loadAdminUser(s.user.id);
      } else {
        setAdminUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ session, adminUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
