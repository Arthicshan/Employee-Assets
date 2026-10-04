"use client";
import { useMemo, useSyncExternalStore } from 'react';
import { UserProfile } from '@/types';
function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener('assetflow-session', onChange);
  return () => {window.removeEventListener('storage', onChange); window.removeEventListener('assetflow-session', onChange);};
}
export function useSession() {
  const raw = useSyncExternalStore(subscribe, () => localStorage.getItem('assetflow_user_data'), () => null);
  return useMemo(() => {try {return raw ? JSON.parse(raw) as UserProfile : null;} catch {return null;}}, [raw]);
}
