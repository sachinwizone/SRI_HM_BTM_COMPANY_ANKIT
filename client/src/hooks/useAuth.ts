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

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    enabled: isAuthenticated !== false,
  });

  useEffect(() => {
    // Check if user has session token or stored user info
    const storedUser = localStorage.getItem("user");
    if (storedUser || document.cookie.includes("sessionToken")) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    if (error) {
      // If auth fails, clear stored data and redirect to auth
      localStorage.removeItem("user");
      setIsAuthenticated(false);
    } else if (user) {
      // Update stored user info
      localStorage.setItem("user", JSON.stringify(user.user));
      setIsAuthenticated(true);
    }
  }, [user, error]);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("user");
      setIsAuthenticated(false);
      window.location.href = "/auth";
    }
  };

  return {
    user: user?.user as User | undefined,
    isLoading: isLoading || isAuthenticated === null,
    isAuthenticated: isAuthenticated === true && !!user,
    logout,
  };
}