import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  createElement,
  type ReactNode,
} from "react";
import type { User, LoginRequest, RegisterRequest } from "../types";
import {
  login as apiLogin,
  register as apiRegister,
  getMe,
  logout as apiLogout,
  getToken,
} from "../lib/api";

// ──────────────────────────────────────────────
// Context shape
// ──────────────────────────────────────────────

interface AuthContextValue {
  /** The currently authenticated user, or null when logged out. */
  user: User | null;
  /** The raw JWT token, or null when logged out. */
  token: string | null;
  /** True while the initial session check is in progress. */
  loading: boolean;
  /** Log in with email / password. Resolves with the user on success. */
  login: (credentials: LoginRequest) => Promise<User>;
  /** Register a new account. Resolves with the user on success. */
  register: (data: RegisterRequest) => Promise<User>;
  /** Log out and clear all stored credentials. */
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ──────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken);
  const [loading, setLoading] = useState<boolean>(true);

  // On mount, attempt to restore the session from the persisted token.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const existingToken = getToken();
      if (!existingToken) {
        setLoading(false);
        return;
      }

      try {
        const me = await getMe();
        if (!cancelled) {
          setUser(me);
          setTokenState(existingToken);
        }
      } catch {
        // Token is invalid or expired -- clear it.
        if (!cancelled) {
          apiLogout();
          setUser(null);
          setTokenState(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials: LoginRequest): Promise<User> => {
    const result = await apiLogin(credentials);
    setUser(result.user);
    setTokenState(result.token);
    return result.user;
  }, []);

  const register = useCallback(async (data: RegisterRequest): Promise<User> => {
    const result = await apiRegister(data);
    setUser(result.user);
    setTokenState(result.token);
    return result.user;
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
    setTokenState(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout],
  );

  return createElement(AuthContext.Provider, { value }, children);
}

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────

function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth must be used within an <AuthProvider>. " +
        "Wrap your application (or the relevant subtree) with <AuthProvider>.",
    );
  }
  return context;
}

export { AuthContext, AuthProvider, useAuth };
