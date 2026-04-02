import { useContext } from 'react';
import { HyperjumpContext } from '@/context/HyperjumpContext';

export function useHyperjump() {
  const { triggerHyperjump } = useContext(HyperjumpContext);
  return triggerHyperjump;
}
