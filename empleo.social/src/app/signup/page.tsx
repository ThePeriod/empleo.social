// src/app/signup/page.tsx
"use client";

import { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUpWithEmailPassword } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@prisma/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SignUpPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CANDIDATE);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if user is already logged in and not loading
  if (!isLoading && user) {
    router.push('/'); // Or a dashboard page
    return null; // Render nothing while redirecting
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await signUpWithEmailPassword({
        email,
        password,
        options: {
          data: {
            name: name || undefined, // Pass name if provided
            role: role,
          },
        },
      });

      if (result.apiError) {
        // Handle errors from our API (e.g., Prisma DB sync issue)
        console.error('API Sync Error:', result.apiError);
        setError(result.apiError.message || 'Error al sincronizar usuario con la base de datos.');
      } else if (result.data.supabaseError) {
        // Handle errors directly from Supabase auth
        console.error('Supabase Auth Error:', result.data.supabaseError);
        setError(result.data.supabaseError.message || 'Error en el registro con Supabase.');
      } else if (result.data.user && result.data.session === null) {
        // Email confirmation pending
        setSuccessMessage(
          'Registro iniciado. Por favor, revisa tu correo electrónico para confirmar tu cuenta.'
        );
      } else if (result.data.user && result.data.session) {
        // Successful registration and session (though Supabase usually requires email confirmation first)
        setSuccessMessage(
          '¡Registro exitoso! Por favor, revisa tu correo electrónico para confirmar tu cuenta.'
        );
        // The onAuthStateChange in AuthContext should handle session updates and potential redirects.
      } else {
        // Fallback for unexpected response structure
        setError('Respuesta inesperada del servidor de autenticación.');
      }
    } catch (err: any) {
      // Catch-all for network errors or other unexpected issues during the signUpWithEmailPassword call itself
      console.error('Error during sign up process:', err);
      setError(err.message || 'Ocurrió un error durante el registro. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Cargando...</div> {/* Consider using a Shadcn/ui Spinner or Skeleton here */}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
          <CardDescription>
            Ingresa tus datos para registrarte en Empleo.social.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre Completo (Opcional)</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                placeholder="Tu Nombre Completo"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Soy un:</Label>
              <Select value={role} onValueChange={(value: UserRole) => setRole(value)} required>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecciona tu rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.CANDIDATE}>Candidato</SelectItem>
                  <SelectItem value={UserRole.RECRUITER}>Reclutador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            {successMessage && <p className="text-sm text-emerald-600 text-center">{successMessage}</p>}
            
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Registrando...' : 'Crear Cuenta'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p>
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Inicia Sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
