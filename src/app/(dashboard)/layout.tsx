// @ts-nocheck
'use client';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Sidebar } from '@/components/shell/sidebar';
import { ToastProvider } from '@/components/ui/toast';

function DashboardShell({ children }) {
  return (
    <div className='app-shell'>
      <Sidebar />
      <div className='main-content'>
        <main style={{ padding: '28px 32px', flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <ToastProvider>
        <DashboardShell>{children}</DashboardShell>
      </ToastProvider>
    </AuthGuard>
  );
}