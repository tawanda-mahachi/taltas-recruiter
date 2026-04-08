// @ts-nocheck
'use client';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Sidebar } from '@/components/shell/sidebar';
import { ToastProvider } from '@/components/ui/toast';

function DashboardShell({ children }) {
  return (
    <div className='app-shell' style={{background:'#FFFFFF'}}>
      <Sidebar />
      <div className='main-content'>
        <main style={{ flex: 1, minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '0', height: '100%' }}>
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