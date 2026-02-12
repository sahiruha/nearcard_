'use client';

import type { LinkItem } from '@/lib/types';
import { LinkBlock } from './LinkBlock';

export function LinkList({ links }: { links: LinkItem[] }) {
  if (links.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5">
      {links.map((link, i) => (
        <LinkBlock key={i} link={link} />
      ))}
    </div>
  );
}
