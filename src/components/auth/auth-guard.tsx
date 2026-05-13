// @ts-nocheck
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
export function AuthGuard({ children }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => {
    setHasHydrated(true);
  }, []);
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) router.replace('/');
  }, [hasHydrated, isAuthenticated, router]);
  if (!hasHydrated) {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#F4F4F2'}}>
        <div style={{width:24,height:24,border:'2.5px solid #E8E8E5',borderTopColor:'#2563eb',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
        <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
      </div>
    );
  }
  if (!isAuthenticated) return null;
  return <>{children}</>;
}