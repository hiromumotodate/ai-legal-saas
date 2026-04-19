'use client';

import { BookOpen, FolderKanban, LayoutDashboard, Scale, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/cases', label: '案件', icon: FolderKanban },
  { href: '/citations', label: '判例検索', icon: BookOpen },
  { href: '/settings', label: '設定', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 border-r border-border bg-white flex flex-col">
      <div className="h-16 px-6 flex items-center border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold tracking-tight">
          <Scale className="h-5 w-5" />
          <span>Legal AI</span>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                active
                  ? 'bg-surface-alt text-fg font-medium'
                  : 'text-fg-muted hover:bg-surface-alt hover:text-fg',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <form action="/auth/signout" method="post" className="p-3 border-t border-border">
        <button
          type="submit"
          className="w-full text-left px-3 py-2 rounded-md text-sm text-fg-muted hover:bg-surface-alt hover:text-fg transition-colors"
        >
          ログアウト
        </button>
      </form>
    </aside>
  );
}
