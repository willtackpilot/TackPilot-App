import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthFailureHandler } from '../api/client';

interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  signIn: (token: string, refreshToken?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('jwt').then((t) => {
      if (t) setToken(t);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    setAuthFailureHandler(() => {
      setToken(null);
    });
    return () => setAuthFailureHandler(null);
  }, []);

  const signIn = async (jwt: string, refreshToken?: string) => {
    await AsyncStorage.setItem('jwt', jwt);
    if (refreshToken) {
      await AsyncStorage.setItem('refreshToken', refreshToken);
    }
    setToken(jwt);
  };

  const signOut = async () => {
    await AsyncStorage.multiRemove(['jwt', 'refreshToken']);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
