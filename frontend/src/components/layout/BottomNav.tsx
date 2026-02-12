'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CreditCard, Share2, Settings } from 'lucide-react';

const navItems = [
  { href: '/card', icon: CreditCard, label: 'Card' },
  { href: '/share', icon: Share2, label: 'Share' },
  { href: '/card/edit', icon: Settings, label: 'Edit' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg-primary border-t border-border">
      <div className="max-w-lg mx-auto flex justify-around py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href === '/card' && pathname === '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 text-[10px] transition-colors ${
                isActive ? 'text-near-green' : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
