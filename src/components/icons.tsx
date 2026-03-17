// @ts-nocheck
/**
 * Taltas SVG Icon Library
 * All icons are inline SVG — zero external dependencies.
 * Default size 14×14, stroke-based, inherits currentColor.
 */

interface IconProps {
  size?: number;
  className?: string;
  color?: string;
  strokeWidth?: number;
}

const defaults = (p: IconProps) => ({
  width: p.size ?? 14,
  height: p.size ?? 14,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: p.color ?? 'currentColor',
  strokeWidth: p.strokeWidth ?? 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className: p.className ?? '',
});

/* ── Navigation / Shell ── */

export function IconDashboard(p: IconProps = {}) {
  return <svg {...defaults(p)}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="4" rx="1"/><rect x="14" y="11" width="7" height="10" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>;
}

export function IconPipeline(p: IconProps = {}) {
  return <svg {...defaults(p)}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
}

export function IconCandidates(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
}

export function IconExplorers(p: IconProps = {}) {
  return <svg {...defaults(p)}><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><circle cx="12" cy="16" r="1"/></svg>;
}

export function IconIntegrations(p: IconProps = {}) {
  return <svg {...defaults(p)}><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 4v16M15 4v16M4 9h16M4 15h16"/></svg>;
}

export function IconReports(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
}

/* ── Explorer Agent Types ── */

export function IconBot(p: IconProps = {}) {
  return <svg {...defaults(p)}><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><circle cx="12" cy="16" r="1"/><line x1="12" y1="2" x2="12" y2="5"/><circle cx="12" cy="2" r="1" fill="currentColor" stroke="none"/></svg>;
}

export function IconDna(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/><path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/><path d="M17 6l-2.5 2.5"/><path d="M14 8.5L11 11.5"/><path d="M7 18l2.5-2.5"/><path d="M3.5 14.5l.5-.5"/><path d="M20 9.5l.5-.5"/></svg>;
}

export function IconTarget(p: IconProps = {}) {
  return <svg {...defaults(p)}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
}

export function IconChart(p: IconProps = {}) {
  return <svg {...defaults(p)}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
}

export function IconBrain(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96.44A2.5 2.5 0 015 17.5a2.5 2.5 0 01-.64-4.9A2.5 2.5 0 017 8.5h0A2.5 2.5 0 019.5 2z"/><path d="M14.5 2A2.5 2.5 0 0012 4.5v15a2.5 2.5 0 004.96.44A2.5 2.5 0 0019 17.5a2.5 2.5 0 00.64-4.9A2.5 2.5 0 0017 8.5h0A2.5 2.5 0 0014.5 2z"/></svg>;
}

export function IconRocket(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>;
}

/* ── Integration Platform Icons ── */

export function IconSeedling(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M12 22V10"/><path d="M6 13c0-3.31 2.69-6 6-6"/><path d="M18 13c0-3.31-2.69-6-6-6"/><path d="M6 13c-2.76 0-5-2.24-5-5 0-2.49 1.83-4.55 4.22-4.92A7 7 0 0112 2a7 7 0 016.78 1.08A5 5 0 0123 8c0 2.76-2.24 5-5 5"/></svg>;
}

export function IconFlashlight(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M18 6L6 18"/><path d="M8 2l2 2"/><path d="M2 8l2 2"/><path d="M14 20l2 2"/><path d="M20 14l2 2"/><path d="M7 7L3 3"/><path d="M21 21l-4-4"/></svg>;
}

export function IconGlobe(p: IconProps = {}) {
  return <svg {...defaults(p)}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>;
}

export function IconBriefcase(p: IconProps = {}) {
  return <svg {...defaults(p)}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>;
}

export function IconSearch(p: IconProps = {}) {
  return <svg {...defaults(p)}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}

export function IconCloud(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/></svg>;
}

export function IconButterfly(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M12 22V12"/><path d="M2 7c0 4 3.5 7 6.5 7S12 12 12 12s-3.5-1-3.5-5S12 2 12 2 2 3 2 7z"/><path d="M22 7c0 4-3.5 7-6.5 7S12 12 12 12s3.5-1 3.5-5S12 2 12 2s10 1 10 5z"/></svg>;
}

export function IconClipboard(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>;
}

export function IconWaves(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>;
}

export function IconCalendar(p: IconProps = {}) {
  return <svg {...defaults(p)}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}

export function IconMessageCircle(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>;
}

export function IconDiamond(p: IconProps = {}) {
  const d = defaults(p);
  return <svg {...d}><path d="M2.7 10.3a2.41 2.41 0 000 3.41l7.59 7.59a2.41 2.41 0 003.41 0l7.59-7.59a2.41 2.41 0 000-3.41L13.7 2.71a2.41 2.41 0 00-3.41 0z"/></svg>;
}

export function IconPin(p: IconProps = {}) {
  return <svg {...defaults(p)}><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 00-1.11-1.79l-1.78-.9A2 2 0 0115 10.76V6h1a2 2 0 000-4H8a2 2 0 100 4h1v4.76a2 2 0 01-1.11 1.79l-1.78.9A2 2 0 005 15.24z"/></svg>;
}

export function IconLeaf(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M11 20A7 7 0 019.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>;
}

export function IconStar(p: IconProps = {}) {
  return <svg {...defaults(p)}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}

export function IconBull(p: IconProps = {}) {
  return <svg {...defaults(p)}><circle cx="12" cy="12" r="3"/><path d="M3 12h3M18 12h3"/><path d="M5.6 5.6l2.15 2.15M16.25 16.25l2.15 2.15"/><path d="M5.6 18.4l2.15-2.15M16.25 7.75l2.15-2.15"/></svg>;
}

/* ── Actions / UI ── */

export function IconDownload(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
}

export function IconX(p: IconProps = {}) {
  return <svg {...defaults(p)}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

export function IconPlus(p: IconProps = {}) {
  return <svg {...defaults(p)}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}

export function IconArrowRight(p: IconProps = {}) {
  return <svg {...defaults(p)}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
}

export function IconArrowUp(p: IconProps = {}) {
  return <svg {...defaults(p)}><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>;
}

export function IconArrowDown(p: IconProps = {}) {
  return <svg {...defaults(p)}><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>;
}

export function IconChevronRight(p: IconProps = {}) {
  return <svg {...defaults(p)}><polyline points="9 18 15 12 9 6"/></svg>;
}

export function IconChevronDown(p: IconProps = {}) {
  return <svg {...defaults(p)}><polyline points="6 9 12 15 18 9"/></svg>;
}

export function IconChevronsRight(p: IconProps = {}) {
  return <svg {...defaults(p)}><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>;
}

export function IconExport(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
}

export function IconFilter(p: IconProps = {}) {
  return <svg {...defaults(p)}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
}

export function IconEdit(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}

export function IconPlay(p: IconProps = {}) {
  return <svg {...defaults(p)}><polygon points="5 3 19 12 5 21 5 3"/></svg>;
}

export function IconPause(p: IconProps = {}) {
  return <svg {...defaults(p)}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
}

export function IconSettings(p: IconProps = {}) {
  return <svg {...defaults(p)}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
}

export function IconUser(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}

export function IconBell(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
}

export function IconLogOut(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}

export function IconKey(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>;
}

export function IconCreditCard(p: IconProps = {}) {
  return <svg {...defaults(p)}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
}

export function IconMail(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>;
}

export function IconLock(p: IconProps = {}) {
  return <svg {...defaults(p)}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
}

export function IconZap(p: IconProps = {}) {
  return <svg {...defaults(p)}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
}

export function IconClock(p: IconProps = {}) {
  return <svg {...defaults(p)}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}

export function IconTrendingUp(p: IconProps = {}) {
  return <svg {...defaults(p)}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
}

export function IconTrendingDown(p: IconProps = {}) {
  return <svg {...defaults(p)}><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>;
}

export function IconActivity(p: IconProps = {}) {
  return <svg {...defaults(p)}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
}

export function IconHandshake(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M20.42 4.58a5.4 5.4 0 00-7.65 0l-.77.78-.77-.78a5.4 5.4 0 00-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/></svg>;
}

export function IconFileText(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
}

export function IconMap(p: IconProps = {}) {
  return <svg {...defaults(p)}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
}

export function IconRefreshCw(p: IconProps = {}) {
  return <svg {...defaults(p)}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>;
}

export function IconLink(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>;
}

export function IconSlack(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/><path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/><path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z"/><path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"/><path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z"/><path d="M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/><path d="M10 9.5C10 10.33 9.33 11 8.5 11h-5C2.67 11 2 10.33 2 9.5S2.67 8 3.5 8h5c.83 0 1.5.67 1.5 1.5z"/><path d="M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z"/></svg>;
}

export function IconMoney(p: IconProps = {}) {
  return <svg {...defaults(p)}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
}

export function IconPointFinger(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M18 11V6a2 2 0 00-4 0"/><path d="M14 10V4a2 2 0 00-4 0v7"/><path d="M10 10.5V6a2 2 0 00-4 0v8"/><path d="M18 8a2 2 0 014 0v7a8 8 0 01-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 012.83-2.82L7 16"/></svg>;
}

export function IconCheck(p: IconProps = {}) {
  return <svg {...defaults(p)}><polyline points="20 6 9 17 4 12"/></svg>;
}

export function IconAlertTriangle(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}

export function IconSignIn(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>;
}

export function IconUserPlus(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>;
}

export function IconSend(p: IconProps = {}) {
  return <svg {...defaults(p)}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
}

export function IconEye(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}

export function IconSchedule(p: IconProps = {}) {
  return <svg {...defaults(p)}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/></svg>;
}

export function IconGrid(p: IconProps = {}) {
  return <svg {...defaults(p)}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}

export function IconCopy(p: IconProps = {}) {
  return <svg {...defaults(p)}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>;
}

export function IconHash(p: IconProps = {}) {
  return <svg {...defaults(p)}><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>;
}

export function IconFunnel(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>;
}

export function IconBarChart(p: IconProps = {}) {
  return <svg {...defaults(p)}><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>;
}

export function IconPieChart(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M21.21 15.89A10 10 0 118 2.83"/><path d="M22 12A10 10 0 0012 2v10z"/></svg>;
}

export function IconShield(p: IconProps = {}) {
  return <svg {...defaults(p)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}

export function IconUploadCloud(p: IconProps = {}) {
  return <svg {...defaults(p)}><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>;
}

export function IconInbox(p: IconProps = {}) {
  return <svg {...defaults(p)}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>;
}

export function IconCpu(p: IconProps = {}) {
  return <svg {...defaults(p)}><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>;
}

