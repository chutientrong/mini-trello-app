import React, { createContext, useContext, useEffect, useState } from "react";
import { useValidateToken } from "../features/auth/hooks/useAuth";
import { AuthAPI } from "../features/auth/services/auth";
import type { User } from "../features/auth/types/auth";

interface AuthProviderProps {
  children: React.ReactNode;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if we have any token in localStorage
  const hasToken = !!localStorage.getItem("accessToken");

  // Validate token on app start (only if we have a token)
  const { data: validateData, isLoading: isValidating } = useValidateToken();

  useEffect(() => {
    if (!hasToken) {
      // No token, user is not authenticated
      setUser(null);
      setIsLoading(false);
    } else if (!isValidating) {
      // We have a token and validation is complete
      if (validateData?.valid && validateData?.user) {
        setUser(validateData.user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    }
  }, [validateData, isValidating, hasToken]);

  const isAuthenticated = !!user;

  const logout = async () => {
    try {
      await AuthAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      // Clear any other auth-related data
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    setUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
