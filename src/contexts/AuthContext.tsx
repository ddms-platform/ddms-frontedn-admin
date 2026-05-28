import type { User, UserRole } from '@/data/user';
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const USER_ROLES: UserRole[] = ['user', 'owner', 'admin'];

function isUserRole(role: unknown): role is UserRole {
  return typeof role === 'string' && USER_ROLES.includes(role as UserRole);
}

function normalizeUser(rawUser: unknown): User | null {
  if (!rawUser || typeof rawUser !== 'object') return null;

  const user = rawUser as Partial<User>;
  if (typeof user.name !== 'string' || typeof user.email !== 'string')
    return null;

  const roles = Array.isArray(user.roles) ? user.roles.filter(isUserRole) : [];

  return {
    name: user.name,
    email: user.email,
    roles: roles.length > 0 ? roles : ['user'],
    ...(typeof user.avatar === 'string' ? { avatar: user.avatar } : {}),
  };
}

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? normalizeUser(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );
  const [user, setUser] = useState<User | null>(() => readStoredUser());

  const isAuthenticated = !!token;

  // Sync across browser tabs via the `storage` event
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY) {
        setToken(e.newValue);
        if (!e.newValue) setUser(null);
      }
      if (e.key === USER_KEY) {
        setUser(e.newValue ? normalizeUser(JSON.parse(e.newValue)) : null);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    const normalizedUser = normalizeUser(newUser);
    if (!normalizedUser) return;

    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
    setToken(newToken);
    setUser(normalizedUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, user, login, logout }),
    [isAuthenticated, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
