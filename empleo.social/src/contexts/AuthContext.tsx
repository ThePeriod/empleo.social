// src/contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { getCurrentUser, onAuthStateChangeHandler, signOutUser } from '@/lib/auth'; // Adjust path if needed

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set loading to true initially, in case this effect runs multiple times due to HMR or other reasons
    // though with an empty dependency array, it should ideally run once on mount.
    console.log('[AuthContext] useEffect: Setting initial isLoading to true');
    setIsLoading(true);
    let isMounted = true; // To prevent state updates on unmounted component

    const fetchUser = async () => {
      console.log('[AuthContext] fetchUser: Starting...');
      try {
        const { data: { user: currentUser } } = await getCurrentUser();
        if (isMounted) {
          console.log('[AuthContext] fetchUser: User fetched', currentUser);
          setUser(currentUser ?? null);
        }
      } catch (error) {
        console.error("[AuthContext] Error fetching current user:", error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          console.log('[AuthContext] fetchUser: Finished. Setting isLoading to false.');
          setIsLoading(false);
        }
      }
    };

    fetchUser();

    const subscription = onAuthStateChangeHandler((event, session) => {
      console.log('[AuthContext] onAuthStateChange:', { event, sessionUser: session?.user });
      if (isMounted) {
         setUser(session?.user ?? null);
         // fetchUser is responsible for setting isLoading to false on initial load.
         // This is a safeguard: if INITIAL_SESSION arrives and isLoading is somehow still true,
         // set it to false. For other events like SIGNED_IN/SIGNED_OUT that happen later,
         // isLoading should already be false.
         if (event === 'INITIAL_SESSION' && isLoading) { 
            console.log(`[AuthContext] onAuthStateChange: Event ${event} received while isLoading is true. Setting isLoading to false.`);
            setIsLoading(false);
         }
      }
    });

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []); // Empty dependency array: runs only on mount and unmount

  const handleSignOut = useCallback(async () => {
    try {
      setIsLoading(true); // Optionally set loading state during sign out
      const { error } = await signOutUser();
      if (error) {
        console.error('Error signing out:', error);
        // Handle error appropriately, maybe set an error state
      } else {
        setUser(null); // User will also be set to null by onAuthStateChange, but explicit here is fine
      }
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
    } finally {
      setIsLoading(false); // Ensure loading is false after attempt
    }
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
