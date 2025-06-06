// app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <main className="p-8 bg-white shadow-md rounded-lg">
        {children}
      </main>
    </div>
  );
}
