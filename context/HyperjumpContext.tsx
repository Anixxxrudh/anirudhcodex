'use client';

import { createContext, useCallback, useRef, useState, ReactNode } from 'react';
import { HyperjumpOverlay } from '@/components/HyperjumpOverlay';

export interface HyperjumpContextValue {
  triggerHyperjump: (href: string) => void;
}

export const HyperjumpContext = createContext<HyperjumpContextValue>({
  triggerHyperjump: () => {},
});

interface JumpState {
  active: boolean;
  targetHref: string;
}

export function HyperjumpProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<JumpState>({ active: false, targetHref: '' });
  const activeRef = useRef(false);

  const triggerHyperjump = useCallback((href: string) => {
    if (activeRef.current) return;
    activeRef.current = true;
    setState({ active: true, targetHref: href });
  }, []);

  const onComplete = useCallback(() => {
    activeRef.current = false;
    setState({ active: false, targetHref: '' });
  }, []);

  return (
    <HyperjumpContext.Provider value={{ triggerHyperjump }}>
      {children}
      <HyperjumpOverlay
        active={state.active}
        targetHref={state.targetHref}
        onComplete={onComplete}
      />
    </HyperjumpContext.Provider>
  );
}
