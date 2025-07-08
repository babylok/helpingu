import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types/User";
import { login, signUp, logout, isTokenValid, LoginCredentials } from "@/services/authService";
import { clearAuth } from "@/utils/authUtils";

// Utility functions for localStorage
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const setUser = (user: User | null) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const setToken = (token: string | null) => {
  localStorage.setItem('token', token || '');
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: {
    email: string;
    password: string;
    name: string;
    role: "passenger" | "driver";
    phoneNumber: string;
    countryCode: string;
  }) => Promise<void>;
  logout: () => void;
  checkTokenValidity: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state from localStorage
    const initialUser = getUser();
    const initialToken = getToken();
    
    if (initialToken) {
      isTokenValid(initialToken).then(isValid => {
        if (isValid) {
          setUser(initialUser);
          setToken(initialToken);
        } else {
          // token 無效，清除狀態
          clearAuth();
          setUser(null);
          setToken(null);
        }
      }).catch(() => {
        // 驗證失敗，清除狀態
        clearAuth();
        setUser(null);
        setToken(null);
      });
    } else {
      // 沒有 token，清除狀態
      clearAuth();
      setUser(null);
      setToken(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      checkTokenValidity().catch(console.error);
    }
  }, [token]);

  const handleLogin = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      // 調用 login 函數並等待完成
      const authResponse = await login(credentials);
      
      // 確保返回數據包含用戶和 token
      if (!authResponse.user || !authResponse.token) {
        throw new Error('Invalid login response');
      }
      
      // 更新狀態
      setUser(authResponse.user);
      setToken(authResponse.token);
      console.log('User after login:', authResponse.user);
      // 打印日誌以便調試
      console.log('Login successful:', {
        userId: authResponse.user.id,
        role: authResponse.user.role
      });
    } catch (error) {
      console.error("Login error:", error);
      // 在失敗時重置狀態
      setUser(null);
      setToken(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (credentials: {
    email: string;
    password: string;
    name: string;
    role: "passenger" | "driver";
    phoneNumber: string;
    countryCode: string;
  }): Promise<void> => {
    setIsLoading(true);
    try {
      const { user: authUser, token: authToken } = await signUp({
        ...credentials,
        role: credentials.role,
        phoneNumber: credentials.phoneNumber,
        countryCode: credentials.countryCode
      });
      setUser(authUser);
      setToken(authToken);
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // 先清除 localStorage
      clearAuth();
      
      // 然後更新狀態
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Logout error:', error);
      // 即使出錯也要確保狀態被重置
      setUser(null);
      setToken(null);
    }
  };

  const checkTokenValidity = async (): Promise<boolean> => {
    return isTokenValid(token);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login: handleLogin,
    signUp: handleSignUp,
    logout: handleLogout,
    checkTokenValidity: checkTokenValidity
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
