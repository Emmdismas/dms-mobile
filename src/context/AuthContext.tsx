import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser, Branch } from '../types';
import { authApi } from '../api/auth';
import { apiClient } from '../api/client';

const USER_KEY = '@dms_user';
const ACTIVE_BRANCH_KEY = '@dms_active_branch_id';

interface AuthContextType {
  currentUser: AuthUser | null;
  isLoading: boolean;
  selectedBranchId: string | null;
  setSelectedBranchId: (id: string | null) => void;
  login: (login: string, pass: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  updateUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [selectedBranchId, setSelectedBranchIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Register auto-logout on 401
    apiClient.setOnUnauthorized(() => {
      void handleLogout();
    });

    void restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const [storedToken, storedUser, storedBranch] = await Promise.all([
        apiClient.getToken(),
        AsyncStorage.getItem(USER_KEY),
        AsyncStorage.getItem(ACTIVE_BRANCH_KEY),
      ]);

      if (storedToken && storedUser) {
        const parsed = JSON.parse(storedUser) as AuthUser;
        setCurrentUser(parsed);
        if (storedBranch) {
          setSelectedBranchIdState(storedBranch);
        }

        // Verify session in background with /auth/me
        authApi
          .me()
          .then((fresh) => {
            setCurrentUser(fresh);
            void AsyncStorage.setItem(USER_KEY, JSON.stringify(fresh));
          })
          .catch(() => {
            // keep stored user if offline
          });
      }
    } catch {
      // session restore failed
    } finally {
      setIsLoading(false);
    }
  };

  const setSelectedBranchId = (id: string | null) => {
    setSelectedBranchIdState(id);
    if (id) {
      void AsyncStorage.setItem(ACTIVE_BRANCH_KEY, id);
    } else {
      void AsyncStorage.removeItem(ACTIVE_BRANCH_KEY);
    }
  };

  const login = async (loginInput: string, pass: string): Promise<AuthUser> => {
    const res = await authApi.login(loginInput, pass);
    setCurrentUser(res.user);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(res.user));
    return res.user;
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      setCurrentUser(null);
      setSelectedBranchIdState(null);
      await AsyncStorage.multiRemove([USER_KEY, ACTIVE_BRANCH_KEY]);
    }
  };

  const updateUser = (user: AuthUser) => {
    setCurrentUser(user);
    void AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        selectedBranchId,
        setSelectedBranchId,
        login,
        logout: handleLogout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
