'use client';

import { AuthGuard } from '@/components/auth/auth-guard';
import { Topbar } from '@/components/shell/topbar';
import { SiteFooter } from '@/components/shared/site-footer';
import { ToastProvider } from '@/components/ui/toast';
import { useMe } from '@/lib/hooks/use-auth';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useEffect } from 'react';

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { data: me } = useMe();
  const { setUser } = useAuthStore();

  // Keep store synced with server data
  useEffect(() => {
    if (me) setUser(me);
  }, [me, setUser]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Topbar />
      <main className="max-w-[1340px] mx-auto px-6 py-5" style={{ flex: 1, width: '100%' }}>
        {children}
      </main>
      <SiteFooter variant="compact" />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <ToastProvider>
        <DashboardShell>{children}</DashboardShell>
      </ToastProvider>
    </AuthGuard>
  );
}
