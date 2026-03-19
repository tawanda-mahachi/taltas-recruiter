// @ts-nocheck
'use client';

import { IconUser, IconBell, IconSettings, IconLogOut } from '@/components/icons';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useLogout } from '@/lib/hooks/use-auth';
import { initials } from '@/lib/utils';

const NAV_TABS = [
  { key: 'dashboard',     label: 'Dashboard',     href: '/dashboard' },
  { key: 'pipeline',      label: 'Pipeline',      href: '/pipeline' },
  { key: 'jobs',           label: 'Jobs',           href: '/jobs' },
  { key: 'candidates',    label: 'Candidates',    href: '/candidates' },
  { key: 'explorers',     label: 'Explorers',     href: '/explorers' },
  { key: 'integrations',  label: 'Integrations',  href: '/integrations' },
  { key: 'messages',      label: 'Messages',      href: '/messages' },
  { key: 'reports',       label: 'Reports',       href: '/reports' },
] as const;

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const logoutMutation = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState('2m ago');

  const name = user?.profile?.firstName
    ? `${user.profile.firstName} ${user.profile.lastName || ''}`
    : user?.user?.email?.split('@')[0] || 'Recruiter';
  const userInitials = initials(name);
  const email = user?.user?.email || '';
  const role = user?.recruiterRole?.replace(/_/g, ' ')?.replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'Recruiter';

  const activeTab = NAV_TABS.find((t) => t.href === pathname)?.key
    || NAV_TABS.find((t) => t.href !== '/dashboard' && pathname.startsWith(t.href))?.key
    || 'dashboard';

  return (
    <div className="topbar">
      <div className="flex items-center gap-[10px]">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 48, fontWeight: 700, color: '#0d1b3e', letterSpacing: '-0.5px', lineHeight: 1 }}>
            Tal<span style={{ color: '#1a56db' }}>tas</span>
          </div>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: '#9aaac8', letterSpacing: '0.18em', textTransform: 'uppercase', paddingLeft: 14, borderLeft: '1px solid rgba(30,60,120,0.16)' }}>Talent Atlas</span>
        </div>
      </div>

      <div className="tab-bar">
        {NAV_TABS.map((t) => (
          <button key={t.key} className={`tab-item ${activeTab === t.key ? 'active' : ''}`} onClick={() => router.push(t.href)}>
            {t.label}
            {t.key === 'messages' && <span className="ml-[4px] w-[14px] h-[14px] rounded-full text-[8px] font-bold inline-flex items-center justify-center" style={{ background: 'var(--red)', color: '#fff' }}>3</span>}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button className={`sync-btn ${syncing ? 'syncing' : ''}`}>
          <span className="sync-dot" /><span className="font-mono text-[10px]">{syncing ? 'Syncing…' : `All Synced — ${lastSync}`}</span>
        </button>
        <button className="ctrl-btn blue" style={{ fontSize: '9.5px', padding: '5px 11px' }} onClick={() => { if (syncing) return; setSyncing(true); setTimeout(() => { setSyncing(false); setLastSync('just now'); }, 2000); }}>⟳ Sync Now</button>
        <div className="relative">
          <div className="profile-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="w-[30px] h-[30px] rounded-[6px] flex items-center justify-center font-mono text-[10px] font-bold" style={{ border: '1.5px solid var(--blue-border)', background: 'var(--blue-bg)', color: 'var(--blue)' }}>{userInitials}</div>
            <div className="flex flex-col leading-tight"><span className="text-[11px] font-semibold whitespace-nowrap" style={{ color: 'var(--text-bright)' }}>{name}</span><span className="font-mono text-[8px] whitespace-nowrap" style={{ color: 'var(--muted)' }}>{role}</span></div>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5" className="transition-transform duration-150" style={{ transform: menuOpen ? 'rotate(180deg)' : 'none' }}><polyline points="6 9 12 15 18 9" /></svg>
          </div>
          {menuOpen && (<>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute top-[calc(100%+8px)] right-0 rounded-[11px] p-[5px] min-w-[185px] z-50" style={{ background: 'var(--surface)', border: '1px solid var(--border2)', boxShadow: '0 10px 32px rgba(0,0,0,.14)' }}>
              <div className="px-3 pt-[10px] pb-[9px] mb-1" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="text-[12.5px] font-semibold" style={{ color: 'var(--text-bright)' }}>{name}</div>
                <div className="font-mono text-[8.5px] mt-[1px]" style={{ color: 'var(--muted)' }}>{email}</div>
              </div>
              {[
                { icon: <IconUser size={13} />, label: 'My Profile', href: '/profile' },
                { icon: <IconBell size={13} />, label: 'Notifications', href: '/notifications' },
                { icon: <IconSettings size={13} />, label: 'Settings', href: '/settings' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-[9px] px-[11px] py-2 rounded-[7px] cursor-pointer text-[12px] transition-colors hover:bg-[var(--surface2)]" style={{ color: 'var(--text-mid)' }} onClick={() => { setMenuOpen(false); router.push(item.href); }}>{item.icon} {item.label}</div>
              ))}
              <hr className="my-1 border-0" style={{ borderTop: '1px solid var(--border)' }} />
              <div className="flex items-center gap-[9px] px-[11px] py-2 rounded-[7px] cursor-pointer text-[12px] transition-colors hover:bg-[var(--red-bg)]" style={{ color: 'var(--red)' }} onClick={() => { setMenuOpen(false); logoutMutation.mutate(); }}><IconLogOut size={13} /> Sign Out</div>
            </div>
          </>)}
        </div>
      </div>
    </div>
  );
}

