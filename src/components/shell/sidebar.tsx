// @ts-nocheck
'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useLogout } from '@/lib/hooks/use-auth';
import { initials } from '@/lib/utils';

const F = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const BLUE = '#2563eb';
const DARK = '#0A0A0A';
const MID = '#6B6B6B';
const MUTED = '#AAAAAA';
const BORDER = '#E8E8E5';
const BLIGHT = '#F4F4F2';

const NAV = [
  { href: '/dashboard',    label: 'Dashboard',    group: 'Overview',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { href: '/pipeline',     label: 'Pipeline',     group: 'Hiring',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  { href: '/jobs',         label: 'Live Jobs',    group: 'Hiring',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="0"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg> },
  { href: '/job-bank',     label: 'Job Bank',     group: 'Hiring',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> },
  { href: '/candidates',   label: 'Candidates',   group: 'Hiring',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { href: '/explorers',    label: 'Explorers',    group: 'Agents',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg> },
  { href: '/integrations', label: 'Integrations', group: 'Agents',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> },
  { href: '/messages',     label: 'Messages',     group: 'Comms', badge: true,
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { href: '/reports',      label: 'Reports',      group: 'Comms',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { href: '/settings',     label: 'Settings',     group: 'Settings',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
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
  const role = user?.recruiterRole?.replace(/_/g,' ')?.replace(/\b\w/g, c => c.toUpperCase()) || 'Sr. Recruiter';

  const active = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  let lastGroup = null;

  return (
    <aside style={{ width: 180, minWidth: 180, height: '100vh', background: '#FFFFFF', borderRight: '1px solid ' + BORDER, display: 'flex', flexDirection: 'column', fontFamily: F, flexShrink: 0 }}>

      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid ' + BORDER }}>
        <svg width="32" height="32" viewBox="0 0 60 60" fill="none">
          <circle cx="30" cy="30" r="27" fill={BLUE}/>
          <polygon points="30,8 36,32 30,28 24,32" fill="white"/>
          <polygon points="30,52 34,32 30,36 26,32" fill="white" opacity="0.28"/>
          <line x1="12" y1="30" x2="48" y2="30" stroke="white" strokeWidth="1" opacity="0.25"/>
          <circle cx="30" cy="30" r="3.5" fill="white"/>
          <circle cx="30" cy="30" r="1.8" fill={BLUE}/>
        </svg>
        <div>
          <div style={{ fontSize: 17, fontWeight: 300, letterSpacing: '-0.5px', lineHeight: 1, color: DARK }}>
            <span>Tal</span><span style={{ color: BLUE }}>tas</span>
          </div>
          <div style={{ fontSize: 9, color: MUTED, letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 2 }}>Talent Atlas</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {NAV.map(item => {
          const showGroup = item.group !== lastGroup && item.group !== 'Settings';
          if (showGroup) lastGroup = item.group;
          const isActive = active(item.href);

          return (
            <div key={item.href}>
              {showGroup && (
                <div style={{ fontSize: 9, color: MUTED, letterSpacing: '.12em', textTransform: 'uppercase', padding: '14px 20px 4px', fontWeight: 400, opacity: 0.6 }}>
                  {item.group}
                </div>
              )}

              <button onClick={() => router.push(item.href)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 20px', background: isActive ? '#EFF4FF' : 'none', border: 'none', cursor: 'pointer', fontFamily: F, fontSize: 13, fontWeight: isActive ? 400 : 300, color: isActive ? BLUE : MID, textAlign: 'left', transition: 'background .1s', position: 'relative' }}>
                <span style={{ color: isActive ? BLUE : MUTED, flexShrink: 0 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span style={{ fontSize: 9, background: '#E84B3A', color: '#fff', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, flexShrink: 0 }}>3</span>
                )}
                {isActive && <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 2.5, background: BLUE }} />}
              </button>
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{ borderTop: '1px solid ' + BORDER, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: BLUE, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 400, flexShrink: 0 }}>{ini}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 400, color: DARK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
          <div style={{ fontSize: 10, color: MUTED, fontWeight: 300 }}>{role}</div>
        </div>
        <button onClick={() => logoutMutation.mutate()} title="Sign out"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, padding: 4, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </aside>
  );
}
