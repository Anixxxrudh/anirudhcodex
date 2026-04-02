'use client';

import { ReactNode, MouseEvent } from 'react';
import { useHyperjump } from '@/hooks/useHyperjump';

interface HyperjumpLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function HyperjumpLink({ href, children, className }: HyperjumpLinkProps) {
  const triggerHyperjump = useHyperjump();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    triggerHyperjump(href);
  }

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
