import { createContext, useContext, useState, useMemo, type ReactNode } from "react"

interface AuthState {
  token: string | null
  email: string | null
  name: string | null
  picture: string | null
}

interface AuthContextValue extends AuthState {
  login: (token: string, profile: { email: string; name: string; picture: string }) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    email: null,
    name: null,
    picture: null,
  })

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isAuthenticated: !!state.token,
      login: (token, profile) =>
        setState({ token, email: profile.email, name: profile.name, picture: profile.picture }),
      logout: () => setState({ token: null, email: null, name: null, picture: null }),
    }),
    [state],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}
