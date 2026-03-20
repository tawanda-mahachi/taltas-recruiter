// @ts-nocheck
'use client';
import { useRouter } from 'next/navigation';

export function SiteFooter({ variant = 'full' }: { variant?: 'full' | 'compact' }) {
  const router = useRouter();
  const go = (slug: string) => router.push(`/info/${slug}`);

  const headStyle: React.CSSProperties = {
    fontFamily: "var(--font-dm-mono), monospace",
    fontSize: 10,
    letterSpacing: '.14em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 18,
    fontWeight: 600,
  };

  const linkStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    color: '#94a3b8',
    textDecoration: 'none',
    padding: '4px 0',
    transition: 'color 0.15s',
    cursor: 'pointer',
  };

  const BottomBar = () => (
    <div style={{ padding: '20px 52px', borderTop: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
      <div style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: 11, color: '#4a5a7a', letterSpacing: '.04em' }}>
        © 2026 Taltas Inc. All rights reserved.
      </div>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {[
          { t: 'Privacy Policy', s: 'privacy' },
          { t: 'Terms of Service', s: 'terms' },
          { t: 'Cookie Policy', s: 'cookies' },
          { t: 'GDPR', s: 'gdpr' },
        ].map((l) => (
          <a key={l.t} onClick={() => go(l.s)} style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: 10, color: '#4a5a7a', letterSpacing: '.04em', textDecoration: 'none', cursor: 'pointer' }}>
            {l.t}
          </a>
        ))}
      </div>
    </div>
  );

  if (variant === 'compact') {
    return (
      <footer style={{ background: '#0f172a', marginTop: 'auto' }}>
        <BottomBar />
      </footer>
    );
  }

  return (
    <footer style={{ background: '#0f172a', borderTop: '1px solid rgba(255,255,255,.06)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr', gap: 48, padding: '64px 52px 48px' }}>
        <div>
          <div style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: 36, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.5px', lineHeight: 1 }}>
            Tal<span style={{ color: '#1a56db' }}>tas</span>
          </div>
          <div style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: 13, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 6, display: 'block' }}>Talent Atlas</div>
        </div>
        <div>
          <div style={headStyle}>Resources</div>
          <a onClick={() => go('insights')} style={linkStyle}>Insights & Reports</a>
          <a onClick={() => go('papers')} style={linkStyle}>Research Papers</a>
          <a onClick={() => go('casestudies')} style={linkStyle}>Case Studies</a>
          <a onClick={() => go('blog')} style={linkStyle}>Blog</a>
          <a onClick={() => go('changelog')} style={linkStyle}>Changelog</a>
        </div>
        <div>
          <div style={headStyle}>Support</div>
          <a onClick={() => go('helpcenter')} style={linkStyle}>Help Center</a>
          <a onClick={() => go('apiref')} style={linkStyle}>API Reference</a>
          <a onClick={() => go('status')} style={linkStyle}>Status</a>
          <a onClick={() => go('community')} style={linkStyle}>Community</a>
          <a onClick={() => go('contact')} style={linkStyle}>Contact Us</a>
        </div>
        <div>
          <div style={headStyle}>Company</div>
          <a onClick={() => go('about')} style={linkStyle}>About</a>
          <a onClick={() => go('careers')} style={linkStyle}>Careers</a>
          <a onClick={() => go('partners')} style={linkStyle}>Partners</a>
          <a onClick={() => go('security')} style={linkStyle}>Security</a>
          <a onClick={() => go('investors')} style={linkStyle}>Investors</a>
        </div>
      </div>
      <BottomBar />
    </footer>
  );
}
