import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE = import.meta.env.VITE_API_URL || "";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("stillworks-admin-token")
  );
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!token;

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!API_BASE) {
      // Demo mode: accept demo/demo
      if (email === "admin@stillworks.com" && password === "admin123") {
        const demoToken = "demo-token-" + Date.now();
        setToken(demoToken);
        localStorage.setItem("stillworks-admin-token", demoToken);
        return true;
      }
      return false;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      setToken(data.access_token);
      localStorage.setItem("stillworks-admin-token", data.access_token);
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("stillworks-admin-token");
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
