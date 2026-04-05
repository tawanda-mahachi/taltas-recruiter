// @ts-nocheck
'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useLogout } from '@/lib/hooks/use-auth';
import { useMe } from '@/lib/hooks/use-auth';
import { initials } from '@/lib/utils';

const NAV = [
  { href: '/dashboard',    label: 'Dashboard',    group: 'Overview' },
  { href: '/pipeline',     label: 'Pipeline',     group: 'Hiring' },
  { href: '/jobs',         label: 'Live Jobs',    group: 'Hiring' },
  { href: '/job-bank',     label: 'Job Bank',     group: 'Hiring' },
  { href: '/candidates',   label: 'Candidates',   group: 'Hiring' },
  { href: '/explorers',    label: 'Explorers',    group: 'Agents' },
  { href: '/integrations', label: 'Integrations', group: 'Agents' },
  { href: '/messages',     label: 'Messages',     group: 'Comms', badge: true },
  { href: '/reports',      label: 'Reports',      group: 'Comms' },
];

export function Sidebar() {
  const router   = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const logoutMutation = useLogout();

  const name = user?.profile?.firstName
    ? user.profile.firstName + ' ' + (user.profile.lastName || '')
    : user?.user?.email?.split('@')[0] || 'Recruiter';
  const ini = initials(name);
  const role = user?.recruiterRole?.replace(/_/g,' ')?.replace(/\b\w/g, c => c.toUpperCase()) || 'Recruiter';

  const active = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <svg width="50" height="50" viewBox="0 0 60 60" fill="none">
          <circle cx="30" cy="30" r="27" fill="#2563eb"/>
          <polygon points="30,8 36,32 30,28 24,32" fill="white"/>
          <polygon points="30,52 34,32 30,36 26,32" fill="white" opacity="0.28"/>
          <line x1="12" y1="30" x2="48" y2="30" stroke="white" strokeWidth="1" opacity="0.25"/>
          <circle cx="30" cy="30" r="3.5" fill="white"/>
          <circle cx="30" cy="30" r="1.8" fill="#2563eb"/>
        </svg>
        <div>
          <div className="sidebar-wordmark">
            <span className="t">Tal</span><span style={{color:"#2563eb"}}>tas</span>
          </div>
          <div className="sidebar-tagline">Talent Atlas</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav" style={{ paddingTop: 8 }}>
        {(() => {
          let lastGroup = null;
          return NAV.map(item => {
            const showGroup = item.group !== lastGroup;
            lastGroup = item.group;
            return (
              <div key={item.href}>
                {showGroup && (
                  <div style={{ fontFamily:"'Courier New',monospace", fontSize: 8, color: 'var(--muted)', letterSpacing: '.12em', textTransform: 'uppercase', padding: '12px 20px 4px', opacity: 0.7 }}>
                    {item.group}
                  </div>
                )}
                <button
                  className={'nav-item' + (active(item.href) ? ' active' : '')}
                  onClick={() => router.push(item.href)}
                >
                  {item.label}
                  {item.badge && <span className="nav-badge">3</span>}
                </button>
              </div>
            );
          });
        })()}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{ini}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-user-name">{name}</div>
            <div className="sidebar-user-role">{role}</div>
          </div>
          <button
            className="sidebar-signout"
            onClick={() => logoutMutation.mutate()}
            title="Sign out"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
