import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { http } from "@/api/client";
import { clearSession, getToken, getUserData, saveSession } from "@/auth/storage";

type User = {
  email?: string;
  firstName?: string;
  name?: string;
  role?: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setUser(null);
      return;
    }
    const stored = await getUserData<User>();
    setUser(stored);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data } = await http.post("/api/v1/auth/login", { email, password });
    if (!data.success || !data.data?.token) {
      throw new Error(data.message || "Login failed");
    }
    const { token, ...userData } = data.data;
    await saveSession(token, userData);
    setUser(userData);
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signIn, signOut, refresh }),
    [user, loading, signIn, signOut, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
