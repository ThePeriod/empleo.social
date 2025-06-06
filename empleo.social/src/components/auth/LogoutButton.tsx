// src/components/auth/LogoutButton.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function LogoutButton() {
  const { signOut, user } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      // The onAuthStateChange listener in AuthContext should handle user state update.
      // Redirect to home or login page after logout.
      router.push('/');
    } catch (error) {
      console.error("Error during logout:", error);
      // Optionally, display an error message to the user
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    return null; // Don't show the button if no user is logged in
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoggingOut}
      variant="outline" // Or any other variant you prefer
    >
      {isLoggingOut ? 'Cerrando Sesión...' : 'Cerrar Sesión'}
    </Button>
  );
}
