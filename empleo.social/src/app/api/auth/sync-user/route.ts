// src/app/api/auth/sync-user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, UserRole } from '@prisma/client'; // Ensure prisma client is generated

const prisma = new PrismaClient();

interface SyncUserPayload {
  id: string; // Supabase User ID
  email?: string;
  name?: string;
  role?: UserRole;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as SyncUserPayload;
    const { id, email, name, role } = body;

    if (!id || !email) {
      return NextResponse.json({ message: 'Missing Supabase User ID or email' }, { status: 400 });
    }

    // Check if user already exists by Supabase ID or email to prevent duplicates
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: id },
          { email: email }
        ]
      }
    });

    if (existingUser) {
      // Potentially update existing user if details differ, or just confirm existence
      // For now, if user exists by ID and email matches, consider it synced.
      // If ID matches but email differs, or email matches but ID differs, it's an issue.
      if (existingUser.id === id && existingUser.email === email) {
         return NextResponse.json({ message: 'User already exists and is in sync', userId: existingUser.id }, { status: 200 });
      }
      // More complex conflict resolution might be needed depending on exact logic
      return NextResponse.json({ message: 'User conflict: ID or email mismatch with existing record' }, { status: 409 });
    }

    const newUser = await prisma.user.create({
      data: {
        id: id, // Use Supabase user ID as primary key
        email: email,
        name: name,
        role: role || UserRole.CANDIDATE, // Default to CANDIDATE if not provided
      },
    });

    return NextResponse.json({ message: 'User synced successfully', userId: newUser.id }, { status: 201 });

  } catch (error: any) {
    console.error('Error in /api/auth/sync-user:', error);
    // Check for Prisma-specific errors if needed
    // if (error instanceof Prisma.PrismaClientKnownRequestError) { ... }
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
