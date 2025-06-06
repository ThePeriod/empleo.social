// src/app/auth/callback/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext'; // Adjust path if needed

export default function AuthCallbackPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Supabase client SDK handles the session establishment when the user lands on this page
    // with the correct hash parameters from the email link.
    // The onAuthStateChange listener in AuthContext will detect the SIGNED_IN event.

    // We wait for the auth state to be processed by AuthContext.
    if (!isLoading) {
      if (isAuthenticated && user) {
        // User is authenticated, redirect to home or dashboard
        console.log('Auth callback: User authenticated, redirecting to /');
        router.push('/');
      } else {
        // User is not authenticated after callback, something might be wrong or token expired.
        // Redirect to login.
        console.warn('Auth callback: User not authenticated after processing, redirecting to /login');
        router.push('/login?error=verification_failed');
      }
    }
  }, [user, isLoading, isAuthenticated, router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
      <h1>Verificando tu cuenta...</h1>
      <p>Por favor, espera un momento.</p>
      {/* You can add a spinner component here */}
    </div>
  );
}
