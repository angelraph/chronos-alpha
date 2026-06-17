'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

interface User {
  id: string;
  email: string;
  isGuest?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  enterGuestMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && session.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
          });
          setIsDemoMode(false);
        } else {
          // Check if there's a cached guest user
          const cachedUser = localStorage.getItem('chronos_user');
          if (cachedUser) {
            const parsed = JSON.parse(cachedUser);
            setUser(parsed);
            setIsDemoMode(true);
          }
        }
        setLoading(false);
      });

      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session && session.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
          });
          setIsDemoMode(false);
        } else {
          // If signed out in supabase, check if we have guest user
          const cachedUser = localStorage.getItem('chronos_user');
          if (cachedUser) {
            const parsed = JSON.parse(cachedUser);
            setUser(parsed);
            setIsDemoMode(true);
          } else {
            setUser(null);
          }
        }
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Pure Demo Mode
      const cachedUser = localStorage.getItem('chronos_user');
      if (cachedUser) {
        setUser(JSON.parse(cachedUser));
      }
      setIsDemoMode(true);
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    setLoading(true);
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          // Check if we want to fallback to mock database login if email not found
          // (sometimes helpful for demo, but let's report error)
          return { error: error.message };
        }
        if (data.user) {
          setUser({ id: data.user.id, email: data.user.email || '' });
          setIsDemoMode(false);
        }
        return { error: null };
      } catch (err: any) {
        return { error: err.message || 'An authentication error occurred' };
      } finally {
        setLoading(false);
      }
    } else {
      // Mock Sign In
      const mockUsers = JSON.parse(localStorage.getItem('chronos_mock_users') || '[]');
      const foundUser = mockUsers.find((u: any) => u.email === email && u.password === password);
      
      if (!foundUser) {
        setLoading(false);
        return { error: 'Invalid email or password. (Note: Try registering first, or enter guest mode)' };
      }

      const sessionUser = { id: foundUser.id, email: foundUser.email };
      localStorage.setItem('chronos_user', JSON.stringify(sessionUser));
      setUser(sessionUser);
      setIsDemoMode(true);
      setLoading(false);
      return { error: null };
    }
  };

  const signUp = async (email: string, password: string): Promise<{ error: string | null }> => {
    setLoading(true);
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) return { error: error.message };
        // Note: some Supabase setups require email confirmation, in which case user might not be logged in immediately.
        if (data.user) {
          setUser({ id: data.user.id, email: data.user.email || '' });
          setIsDemoMode(false);
        }
        return { error: null };
      } catch (err: any) {
        return { error: err.message || 'An authentication error occurred' };
      } finally {
        setLoading(false);
      }
    } else {
      // Mock Sign Up
      const mockUsers = JSON.parse(localStorage.getItem('chronos_mock_users') || '[]');
      if (mockUsers.some((u: any) => u.email === email)) {
        setLoading(false);
        return { error: 'Email already registered.' };
      }

      const newId = Math.random().toString(36).substring(2, 9);
      const newUser = { id: newId, email, password };
      mockUsers.push(newUser);
      localStorage.setItem('chronos_mock_users', JSON.stringify(mockUsers));

      const sessionUser = { id: newId, email };
      localStorage.setItem('chronos_user', JSON.stringify(sessionUser));
      setUser(sessionUser);
      setIsDemoMode(true);
      setLoading(false);
      return { error: null };
    }
  };

  const signOut = async () => {
    setLoading(true);
    if (isSupabaseConfigured && supabase && !isDemoMode) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('chronos_user');
    setUser(null);
    setLoading(false);
  };

  const enterGuestMode = () => {
    setLoading(true);
    const guestUser = { id: 'guest-' + Math.random().toString(36).substring(2, 5), email: 'guest@chronosalpha.ai', isGuest: true };
    localStorage.setItem('chronos_user', JSON.stringify(guestUser));
    setUser(guestUser);
    setIsDemoMode(true);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isDemoMode, signIn, signUp, signOut, enterGuestMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
