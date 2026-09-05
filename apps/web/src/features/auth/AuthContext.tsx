import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAccessToken } from '../../lib/api/client.js';
import {
  UserDto,
  Role,
  Permission,
  LoginRequest,
  SignupRequest,
} from '@dealflow360/contracts';

interface AuthContextType {
  user: UserDto | null;
  role: Role | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (credentials: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get<{
        success: boolean;
        data: { user: UserDto; role: Role; permissions: Permission[] };
      }>('/auth/me');

      if (response.data.success) {
        setUser(response.data.data.user);
        setRole(response.data.data.role);
        setPermissions(response.data.data.permissions || []);
      }
    } catch {
      setUser(null);
      setRole(null);
      setPermissions([]);
    }
  };

  useEffect(() => {
    const bootstrapSession = async () => {
      try {
        const refreshResponse = await api.post<{
          success: boolean;
          data: { accessToken: string; user: UserDto };
        }>('/auth/refresh');

        if (refreshResponse.data.success) {
          const { accessToken, user: refreshedUser } = refreshResponse.data.data;
          setAccessToken(accessToken);
          setUser(refreshedUser);
          setRole(refreshedUser.role);
          await fetchCurrentUser();
        }
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapSession();
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response = await api.post<{
      success: boolean;
      data: { accessToken: string; user: UserDto };
    }>('/auth/login', credentials);

    if (response.data.success) {
      const { accessToken, user: loggedUser } = response.data.data;
      setAccessToken(accessToken);
      setUser(loggedUser);
      setRole(loggedUser.role);
      await fetchCurrentUser();
    }
  };

  const signup = async (credentials: SignupRequest) => {
    const response = await api.post<{
      success: boolean;
      data: { accessToken: string; user: UserDto };
    }>('/auth/signup', credentials);

    if (response.data.success) {
      const { accessToken, user: newUser } = response.data.data;
      setAccessToken(accessToken);
      setUser(newUser);
      setRole(newUser.role);
      await fetchCurrentUser();
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
      setUser(null);
      setRole(null);
      setPermissions([]);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        permissions,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
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
