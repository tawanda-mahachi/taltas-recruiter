'use client';

import { SiteFooter } from '@/components/shared/site-footer';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
      <SiteFooter variant="compact" />
    </div>
  );
}
