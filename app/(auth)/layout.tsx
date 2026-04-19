import { Scale } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-[1120px] mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <Scale className="h-5 w-5" />
            <span>Legal AI</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
