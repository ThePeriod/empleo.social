"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { signOutUser } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOutUser();
      // The AuthContext will detect the sign-out and update state.
      // The page will re-render, showing the unauthenticated view.
      router.push('/'); // Refresh to ensure UI update or redirect to login
    } catch (error) {
      console.error('Error signing out:', error);
      // Optionally, display an error message to the user
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div>Cargando...</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex flex-col text-center">
        <h1 className="text-4xl font-bold mb-8">Bienvenido a Empleo.social</h1>
        {isAuthenticated && user ? (
          <div className="mt-4">
            <p className="mb-2">Sesión iniciada como: {user.email}</p>
            <button 
              onClick={handleSignOut} 
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <div className="mt-4">
            <p className="mb-4">Por favor, inicia sesión o regístrate.</p>
            <Link 
              href="/login" 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mr-2"
            >
              Iniciar Sesión
            </Link>
            <Link 
              href="/signup" 
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
