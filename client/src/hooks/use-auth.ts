import { useState, useEffect } from "react";
import { useLocation } from "wouter";

interface User {
  username: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [, setLocation] = useLocation();

  // Check if user is authenticated on mount
  useEffect(() => {
    // Simulating an auth check from localStorage or token storage
    const checkAuth = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (e) {
          // Invalid stored user, clear it
          localStorage.removeItem("user");
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Simplified auth check - only allow specific admin credentials
      if (username === "admin@nlp" && password === "12345") {
        // Success with admin credentials
        const userData: User = {
          username: username,
          role: "admin",
        };
        
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    setLocation("/login");
  };

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };
}
