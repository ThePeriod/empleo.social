// components/shared/Navbar.tsx
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">Empleo.social (MVP)</Link>
        <div>
          <Link href="/dashboard" className="mr-4 hover:text-blue-200">Dashboard</Link>
          <Link href="/jobs" className="mr-4 hover:text-blue-200">Jobs</Link>
          <Link href="/profile" className="mr-4 hover:text-blue-200">Profile</Link>
          {/* Add login/logout buttons here based on auth state */}
        </div>
      </div>
    </nav>
  );
}
