// src/lib/auth.ts
import { createSupabaseBrowserClient } from './supabase';
import { AuthError, AuthSignUpOptions, type Session, type User, type UserResponse } from '@supabase/supabase-js'; // AuthError & AuthSignUpOptions as potential values/types, others as type.
import type { UserRole } from '@prisma/client'; // Assuming prisma client is generated

const supabase = createSupabaseBrowserClient();

export interface SignUpCredentials {
  email: string;
  password: string;
  options?: AuthSignUpOptions & { // Using AuthSignUpOptions directly here for clarity
    data?: {
      name?: string;
      role?: UserRole; // Allow specifying role, defaults to CANDIDATE if not provided
      [key: string]: any;
    };
  };
}

/**
 * Signs up a new user with email and password.
 * After successful Supabase sign-up, it calls a local API endpoint
 * to create the user in the Prisma database.
 */

// Define a more accurate return type
export type SignUpFunctionResponse = {
  data: {
    user: User | null;
    session: Session | null; // Include session
    supabaseError: AuthError | null;
  };
  apiError: Error | null; // For errors from the /api/auth/sync-user call
};

export async function signUpWithEmailPassword({
  email,
  password,
  options,
}: SignUpCredentials): Promise<SignUpFunctionResponse> {
  const { data: supabaseAuthData, error: supabaseAuthError } = await supabase.auth.signUp({ // Renamed for clarity
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`, // Important for email confirmation
      ...options,
      data: {
        name: options?.data?.name,
        role: options?.data?.role || 'CANDIDATE', // Default role
        ...options?.data,
      },
    },
  });

  if (supabaseAuthError) {
    console.error('Supabase sign up error:', supabaseAuthError);
    return {
      data: { user: null, session: null, supabaseError: supabaseAuthError },
      apiError: null,
    };
  }

  // If supabaseAuthError is null, supabaseAuthData should contain user and session.
  // supabaseAuthData.user can be non-null while supabaseAuthData.session is null (email confirmation pending).
  const user = supabaseAuthData.user;
  const session = supabaseAuthData.session;

  if (user) {
    try {
      const response = await fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || options?.data?.name,
          role: user.user_metadata?.role || options?.data?.role || 'CANDIDATE',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error creating user in DB:', errorData);
        return {
          data: { user, session, supabaseError: null },
          apiError: new Error(errorData.message || 'Failed to sync user with database'),
        };
      }
      // User synced successfully
      return {
        data: { user, session, supabaseError: null },
        apiError: null,
      };
    } catch (apiCallError: any) {
      console.error('Network or unexpected error calling /api/auth/sync-user:', apiCallError);
      return {
        data: { user, session, supabaseError: null },
        apiError: new Error(apiCallError.message || 'Network error syncing user'),
      };
    }
  }

  // Fallback for unexpected cases where user is null but no supabaseAuthError
  return {
    data: {
      user: null,
      session: null,
      supabaseError: new AuthError('Unknown sign-up issue: No user data returned from Supabase despite no explicit error.'),
    },
    apiError: null,
  };
}

/**
 * Signs in a user with email and password.
 */
export async function signInWithEmailPassword(email: string, password: string): Promise<UserResponse> {
  return supabase.auth.signInWithPassword({ email, password });
}

/**
 * Signs out the current user.
 */
export async function signOutUser(): Promise<{ error: AuthError | null }> {
  return supabase.auth.signOut();
}

/**
 * Gets the current authenticated user.
 */
export async function getCurrentUser(): Promise<UserResponse> {
  return supabase.auth.getUser();
}

/**
 * Listens to authentication state changes.
 * @param callback - Function to call when auth state changes.
 * @returns Subscription object to unsubscribe.
 */
export function onAuthStateChangeHandler(
  callback: (event: string, session: import('@supabase/supabase-js').Session | null) => void
) {
  const { data: authListener } = supabase.auth.onAuthStateChange(callback);
  return authListener.subscription;
}
