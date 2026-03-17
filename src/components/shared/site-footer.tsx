// @ts-nocheck
'use client';
import { useRouter } from 'next/navigation';

/*
 * Site Footer — fonts copied exactly from taltas-footer-pages.html CSS.
 * Background: #0f172a (dark blue) — colors inverted for dark bg.
 *
 * Font mapping from source CSS:
 *   --serif  = Georgia, 'Times New Roman', serif           (logo)
 *   --mono   = 'Space Mono', 'Roboto Mono', monospace      (headings, legal, copyright)
 *   --sans   = -apple-system, BlinkMacSystemFont, ...       (tagline, links)
 *
 * full    = landing + info pages (5-col grid + bottom bar)
 * compact = auth + dashboard     (bottom bar only)
 */

const SERIF = "Georgia, 'Times New Roman', serif";
const MONO  = "'Space Mono', 'Roboto Mono', monospace";
const SANS  = "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";

/* Column data — matches HTML 1:1 */
const COLS: { heading: string; links: { t: string; s: string }[] }[] = [
  {
    heading: 'Product',
    links: [
      { t: 'Explorer Agents', s: 'changelog' },
      { t: 'Deep Match Scoring', s: 'changelog' },
      { t: 'Sentiment Maps', s: 'changelog' },
      { t: 'Pipeline Analytics', s: 'insights' },
      { t: 'Integrations', s: 'changelog' },
      { t: 'Changelog', s: 'changelog' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { t: 'Documentation', s: 'papers' },
      { t: 'Insights & Reports', s: 'insights' },
      { t: 'Research Papers', s: 'papers' },
      { t: 'Case Studies', s: 'casestudies' },
      { t: 'Press Kit', s: 'presskit' },
      { t: 'Blog', s: 'blog' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { t: 'Help Center', s: 'helpcenter' },
      { t: 'API Reference', s: 'apiref' },
      { t: 'Status', s: 'status' },
      { t: 'Community', s: 'community' },
      { t: 'Contact Us', s: 'contact' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { t: 'About', s: 'about' },
      { t: 'Careers', s: 'careers' },
      { t: 'Partners', s: 'partners' },
      { t: 'Security', s: 'security' },
      { t: 'Investors', s: 'investors' },
    ],
  },
];

const LEGAL = [
  { t: 'Privacy Policy', s: 'privacy' },
  { t: 'Terms of Service', s: 'terms' },
  { t: 'Cookie Policy', s: 'cookie' },
  { t: 'GDPR', s: 'gdpr' },
];

export function SiteFooter({ variant = 'full' }: { variant?: 'full' | 'compact' }) {
  const router = useRouter();
  const go = (slug: string) => router.push(`/info/${slug}`);

  /* ── Bottom bar — matches .lp-footer-bottom ── */
  const BottomBar = () => (
    <div
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '24px 48px',
        borderTop: variant === 'full' ? '1px solid rgba(255,255,255,.08)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap' as const,
        gap: 12,
      }}
    >
      {/* .footer-copy — font-family: var(--mono); font-size: 10px */}
      <div style={{ fontFamily: MONO, fontSize: 10, color: '#cbd5e1', letterSpacing: '.04em' }}>
        © 2026 Taltas Inc. All rights reserved.
      </div>
      {/* .lp-footer-legal */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' as const }}>
        {LEGAL.map((l) => (
          <a
            key={l.t}
            onClick={() => go(l.s)}
            style={{
              fontFamily: MONO,       // .lp-footer-legal-link
              fontSize: 10,
              color: '#cbd5e1',
              letterSpacing: '.04em',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'color .15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#94a3b8')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#cbd5e1')}
          >
            {l.t}
          </a>
        ))}
      </div>
    </div>
  );

  /* ── Compact ── */
  if (variant === 'compact') {
    return (
      <footer style={{ background: '#0f172a', marginTop: 'auto' }}>
        <BottomBar />
      </footer>
    );
  }

  /* ── Full ── */
  return (
    <footer style={{ background: '#0f172a', borderTop: '1px solid rgba(255,255,255,.06)' }}>
      {/* .lp-footer-top */}
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '72px 48px 56px',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
          gap: 48,
        }}
      >
        {/* Brand col — .lp-footer-brand */}
        <div>
          {/* .footer-logo — font-family: var(--serif); font-size: 22px */}
          <div
            onClick={() => router.push('/')}
            style={{
              fontFamily: SERIF,
              fontSize: 22,
              color: '#fff',
              marginBottom: 14,
              cursor: 'pointer',
            }}
          >
            Tal<span style={{ color: '#2563eb' }}>tas</span>
          </div>

          {/* .lp-footer-tagline — font-family: var(--sans); font-size: 13px */}
          <p
            style={{
              fontFamily: SANS,
              fontSize: 13,
              color: '#94a3b8',
              lineHeight: 1.7,
              maxWidth: 220,
              marginBottom: 24,
            }}
          >
            Recruitment Intelligence Platform.
            <br />
            AI-native hiring, built for the people who care about quality.
          </p>

          {/* .lp-footer-social */}
          <div style={{ display: 'flex', gap: 10 }}>
            {/* LinkedIn — .lp-social-btn */}
            <a
              href="#"
              aria-label="LinkedIn"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                textDecoration: 'none',
                transition: 'all .2s',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#2563eb';
                e.currentTarget.style.color = '#2563eb';
                e.currentTarget.style.background = 'rgba(37,99,235,.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,.12)';
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            {/* X / Twitter */}
            <a
              href="#"
              aria-label="X"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                textDecoration: 'none',
                transition: 'all .2s',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#2563eb';
                e.currentTarget.style.color = '#2563eb';
                e.currentTarget.style.background = 'rgba(37,99,235,.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,.12)';
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>

        {/* 4 link columns */}
        {COLS.map((col) => (
          <div key={col.heading}>
            {/* .lp-footer-heading — font-family: var(--mono); font-size: 10px; uppercase */}
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: '.14em',
                textTransform: 'uppercase' as const,
                color: 'rgba(255,255,255,.7)',
                marginBottom: 18,
              }}
            >
              {col.heading}
            </div>
            {col.links.map((l) => (
              /* .lp-footer-link — font-family: var(--sans); font-size: 13px */
              <a
                key={l.t}
                onClick={() => go(l.s)}
                style={{
                  display: 'block',
                  fontFamily: SANS,
                  fontSize: 13,
                  color: '#64748b',
                  textDecoration: 'none',
                  marginBottom: 10,
                  cursor: 'pointer',
                  transition: 'color .15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#e2e8f0')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
              >
                {l.t}
              </a>
            ))}
          </div>
        ))}
      </div>

      <BottomBar />
    </footer>
  );
}

