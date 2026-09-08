"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AuthUser = { id: string; email: string; name: string | null };
type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }) => Promise<{ requires_email_confirmation?: boolean }>;
  signOut: () => Promise<void>;
};

type AuthResponse = {
  user?: { id: string; email: string; name?: string | null };
  requires_email_confirmation?: boolean;
  error?: { code?: string; message?: string };
  detail?: { message?: string };
};
const AuthContext = createContext<AuthContextValue | null>(null);

async function request(
  path: string,
  init?: RequestInit,
): Promise<AuthResponse> {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    credentials: "include",
  });
  const data = (await response.json().catch(() => null)) as AuthResponse | null;
  if (!response.ok)
    throw new Error(
      data?.error?.message ??
        data?.detail?.message ??
        "Authentication request failed.",
    );
  return data ?? {};
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void request("/api/auth/me")
      .then((data) => {
        setUser(
          data.user ? { ...data.user, name: data.user.name ?? null } : null,
        );
      })
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      signIn: async (email, password) => {
        const data = await request("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setUser(
          data.user ? { ...data.user, name: data.user.name ?? null } : null,
        );
      },
      signUp: async (input) => {
        const data = await request("/api/auth/signup", {
          method: "POST",
          body: JSON.stringify(input),
        });
        if (!data.requires_email_confirmation && data.user)
          setUser({
            id: data.user.id,
            email: data.user.email,
            name: data.user.name ?? null,
          });
        return {
          requires_email_confirmation: data.requires_email_confirmation,
        };
      },
      signOut: async () => {
        await request("/api/auth/logout", { method: "POST" }).catch(
          () => undefined,
        );
        setUser(null);
      },
    }),
    [isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
