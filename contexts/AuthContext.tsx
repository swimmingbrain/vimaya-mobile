import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getToken, removeToken, saveToken } from "@/services/auth";

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const token = await getToken();
      setIsAuthenticated(Boolean(token));
    } catch (error) {
      console.error("Failed to refresh auth token:", error);
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      await refresh();
      setIsLoading(false);
    };

    initialize();
  }, [refresh]);

  const signIn = useCallback(async (token: string) => {
    await saveToken(token);
    setIsAuthenticated(true);
  }, []);

  const signOut = useCallback(async () => {
    await removeToken();
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        signIn,
        signOut,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
