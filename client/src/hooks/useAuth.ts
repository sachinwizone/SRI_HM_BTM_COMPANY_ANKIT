import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'SALES_MANAGER' | 'SALES_EXECUTIVE' | 'OPERATIONS';
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const { data: authData, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    enabled: isAuthenticated !== false,
  });

  useEffect(() => {
    // Check if user has session token
    if (document.cookie.includes("sessionToken")) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    if (error) {
      // If auth fails, clear authentication state
      setIsAuthenticated(false);
    } else if (authData && authData.user) {
      // Auth successful
      setIsAuthenticated(true);
    }
  }, [authData, error]);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsAuthenticated(false);
      window.location.reload();
    }
  };

  const login = () => {
    refetch();
  };

  return {
    user: authData?.user as User | undefined,
    isLoading: isLoading || isAuthenticated === null,
    isAuthenticated: isAuthenticated === true && !!authData?.user,
    logout,
    login,
  };
}