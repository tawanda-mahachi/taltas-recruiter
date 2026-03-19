'use client';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { SiteFooter } from '@/components/shared/site-footer';

/* -- PUBNAV ------------------------------------------------ */
function PubNav({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 52px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(30,60,120,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
        <a href="https://taltas.ai" style={{ textDecoration: 'none', fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: 48, fontWeight: 700, color: '#0d1b3e', letterSpacing: '-0.5px', lineHeight: 1 }}>
          Tal<span style={{ color: '#1a56db' }}>tas</span>
        </a>
        <span style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: 13, color: '#9aaac8', letterSpacing: '0.18em', textTransform: 'uppercase' as const, paddingLeft: 14, borderLeft: '1px solid rgba(30,60,120,0.16)' }}>Talent Atlas</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <a href="/" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 15, color: '#4a5a7a', textDecoration: 'none' }}>Home</a>
        <a href="/info/blog" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 15, color: '#4a5a7a', textDecoration: 'none' }}>Blog</a>
        <a href="/info/about" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 15, color: '#4a5a7a', textDecoration: 'none' }}>About</a>
        <a href="/" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 15, color: '#4a5a7a', textDecoration: 'none' }}>Sign in</a>
        <a href="/" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 15, color: '#1a56db', textDecoration: 'none', fontWeight: 500 }}>Get started</a>
      </div>
    </nav>
  );
}

/* -- REUSABLE STYLES --------------------------------------- */
const S = {
  eyebrow: { fontFamily: "var(--font-dm-mono), monospace", fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase' as const, color: '#6366f1', marginBottom: 16 } as React.CSSProperties,
  h1: { fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: 60, fontWeight: 400, lineHeight: 1.1, letterSpacing: '-.02em', color: '#0d1b3e', margin: '16px 0 20px' } as React.CSSProperties,
  h2: { fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: 32, fontWeight: 400, lineHeight: 1.2, letterSpacing: '-.02em', color: '#0d1b3e', marginBottom: 20 } as React.CSSProperties,
  sub: { fontSize: 16, color: '#64748b', lineHeight: 1.7, maxWidth: 540 } as React.CSSProperties,
  body: { fontSize: 14, color: '#475569', lineHeight: 1.8, marginBottom: 16 } as React.CSSProperties,
  hero: { padding: '100px 48px 64px', maxWidth: 1200, margin: '0 auto' } as React.CSSProperties,
  container: { maxWidth: 1200, margin: '0 auto', padding: '0 48px 100px' } as React.CSSProperties,
  serif: { fontFamily: "var(--font-cormorant), Georgia, serif" } as React.CSSProperties,
  mono: { fontFamily: "var(--font-dm-mono), monospace" } as React.CSSProperties,
  card: { background: '#fff', border: '1px solid rgba(0,0,0,.07)', borderRadius: 12, padding: 32 } as React.CSSProperties,
  tag: { display: 'inline-block', fontFamily: "var(--font-dm-mono), monospace", fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase' as const, background: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: 4 } as React.CSSProperties,
};

/* -- ABOUT PAGE -------------------------------------------- */
function AboutPage({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <>
      <div style={S.hero}>
        <div style={S.eyebrow}>About</div>
        <h1 style={S.h1}>We believe hiring should feel human.</h1>
        <p style={S.sub}>Taltas is building the intelligence layer for talent acquisition -- where AI handles the coordination and humans make the calls.</p>
      </div>
      <div style={S.container}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginBottom: 80 }}>
          <div>
            <h2 style={S.h2}>Our mission</h2>
            <p style={S.body}>The hiring process is broken -- not because people are bad at it, but because the coordination overhead is enormous. Recruiters spend more time scheduling and chasing than actually evaluating talent.</p>
            <p style={S.body}>Taltas uses AI agents to handle screening, negotiation, and assessment coordination so recruiters can focus on the part only humans can do: understanding people and making placement decisions.</p>
          </div>
          <div>
            <h2 style={S.h2}>How we work</h2>
            <p style={S.body}>We built Taltas around the SNAP protocol: Screening, Negotiation, Assessment, Placement. Each phase is designed to surface signal quickly and reduce time-to-offer without sacrificing candidate experience.</p>
            <p style={S.body}>Our agents are transparent about being AI. We believe that honesty builds more trust with candidates than pretending otherwise, and that trust produces better hiring outcomes.</p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(0,0,0,.07)', paddingTop: 64 }}>
          <div style={{ ...S.eyebrow }}>Boston Tech Labs</div>
          <p style={{ ...S.body, maxWidth: 640 }}>Taltas is built by Boston Tech Labs, a venture studio focused on platform and hyper-scalable technologies across Enterprise Tech, Deep Tech, and emerging verticals. We are based in Boston, MA.</p>
        </div>
      </div>
    </>
  );
}

/* -- CAREERS PAGE ------------------------------------------ */
function CareersPage() {
  const roles = [
    { title: 'Senior Full-Stack Engineer', team: 'Engineering', location: 'Boston, MA / Remote', type: 'Full-time' },
    { title: 'AI/ML Engineer', team: 'Engineering', location: 'Boston, MA / Remote', type: 'Full-time' },
    { title: 'Product Designer', team: 'Design', location: 'Remote', type: 'Full-time' },
    { title: 'Enterprise Account Executive', team: 'Sales', location: 'New York, NY', type: 'Full-time' },
    { title: 'Customer Success Manager', team: 'CS', location: 'Remote', type: 'Full-time' },
  ];
  return (
    <>
      <div style={S.hero}>
        <div style={S.eyebrow}>Careers</div>
        <h1 style={S.h1}>Help us rebuild how hiring works.</h1>
        <p style={S.sub}>We are a small, focused team working on a hard problem. If you want to build systems that change how millions of people find work, we want to hear from you.</p>
      </div>
      <div style={S.container}>
        <div style={{ marginBottom: 48 }}>
          <h2 style={S.h2}>Open roles</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {roles.map((r, i) => (
              <div key={i} style={{ ...S.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 16, fontWeight: 500, color: '#0d1b3e', marginBottom: 6 }}>{r.title}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={S.tag}>{r.team}</span>
                    <span style={S.tag}>{r.location}</span>
                    <span style={S.tag}>{r.type}</span>
                  </div>
                </div>
                <a href="mailto:careers@taltas.ai" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14, color: '#1a56db', textDecoration: 'none', fontWeight: 500 }}>Apply</a>
              </div>
            ))}
          </div>
        </div>
        <div style={{ ...S.card, background: '#f8faff', borderColor: '#dbeafe' }}>
          <div style={{ ...S.eyebrow, color: '#1a56db' }}>Don't see your role?</div>
          <p style={S.body}>We hire for potential and craft, not just job descriptions. Send us a note at <a href="mailto:careers@taltas.ai" style={{ color: '#1a56db' }}>careers@taltas.ai</a> and tell us what you would build.</p>
        </div>
      </div>
    </>
  );
}

/* -- CONTACT PAGE ------------------------------------------ */
function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-dm-mono), monospace",
    fontSize: 10,
    letterSpacing: '.1em',
    textTransform: 'uppercase',
    color: '#64748b',
    marginBottom: 6,
    fontWeight: 600,
    display: 'block',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    fontSize: 13,
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    color: '#0d1b3e',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    background: '#f8fafc',
    transition: 'border-color 0.2s, background 0.2s',
  };

  const handleSend = () => {
    if (!name.trim() || !email.trim() || !message.trim()) return;
    const sub = encodeURIComponent(`[${subject}] Message from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`);
    window.location.href = `mailto:hello@taltas.ai?subject=${sub}&body=${body}`;
    setSent(true);
  };

  return (
    <>
      <div style={{ marginBottom: 36, maxWidth: 780, margin: '0 auto', padding: '52px 48px 0' }}>
        <div style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: '#1a56db', marginBottom: 12 }}>Contact</div>
        <div style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: 40, fontWeight: 600, color: '#0d1b3e', letterSpacing: '-1px', lineHeight: 1.05, marginBottom: 10 }}>Get in touch.</div>
        <p style={{ fontSize: 15, color: '#4a5a7a', lineHeight: 1.65, maxWidth: 480 }}>Have a question, issue, or suggestion? We respond to all queries within 24 hours on business days.</p>
      </div>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '24px 48px 100px' }}>
        <div style={{ marginBottom: 44 }}>
          <div style={{ padding: 22, background: 'rgba(26,86,219,.05)', border: '1px solid rgba(26,86,219,.15)', borderRadius: 12, display: 'inline-block' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a56db" strokeWidth="2" style={{ marginBottom: 10 }}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0d1b3e', marginBottom: 3 }}>Email Support</div>
            <div style={{ fontSize: 12, color: '#1a56db' }}>hello@taltas.ai</div>
          </div>
        </div>

        <div style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: 22, fontWeight: 600, color: '#0d1b3e', letterSpacing: '-.5px', marginBottom: 22 }}>Send a message</div>

        {sent && (
          <div style={{ background: 'rgba(26,86,219,.07)', border: '1px solid rgba(26,86,219,.2)', borderRadius: 10, padding: '14px 18px', marginBottom: 20, fontSize: 13, color: '#1e40af' }}>
            Your email client should open shortly. If it did not, email us directly at <strong>hello@taltas.ai</strong>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Name</label>
              <input style={inputStyle} placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} placeholder="you@company.com" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Subject</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={subject} onChange={e => setSubject(e.target.value)}>
              <option>General Inquiry</option>
              <option>Sales Question</option>
              <option>Technical Issue</option>
              <option>Billing Question</option>
              <option>Feature Request</option>
              <option>Privacy &amp; Data</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Message</label>
            <textarea
              style={{ ...inputStyle, minHeight: 130, resize: 'vertical' } as React.CSSProperties}
              placeholder="How can we help?"
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={sent || !name || !email || !message}
            style={{
              padding: '12px 28px',
              fontSize: 12,
              fontWeight: 500,
              fontFamily: "var(--font-dm-mono), monospace",
              letterSpacing: '.06em',
              background: sent ? '#94a3b8' : '#1a56db',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: sent || !name || !email || !message ? 'not-allowed' : 'pointer',
              alignSelf: 'flex-start',
              transition: 'all 0.2s',
              opacity: !name || !email || !message ? 0.6 : 1,
            }}
          >
            {sent ? 'Opening email client...' : 'Send Message'}
          </button>
        </div>
      </div>
    </>
  );
}

/* -- CHANGELOG PAGE ---------------------------------------- */
function ChangelogPage() {
  const entries = [
    { date: 'March 2026', version: 'v1.4', title: 'Strategy Campaigns', body: 'Recruiters can now launch multi-phase hiring campaigns with phase gates, automatic activation logic, and team-wide analytics.' },
    { date: 'February 2026', version: 'v1.3', title: 'Candidate Portal Launch', body: 'Candidates now have a dedicated portal to track their application status, review assessment summaries, and manage their profile.' },
    { date: 'January 2026', version: 'v1.2', title: 'ATS Integrations', body: 'Native integrations with Greenhouse, Lever, Workday, and Bullhorn. Sync candidate data and pipeline stages bidirectionally.' },
    { date: 'December 2025', version: 'v1.1', title: 'Agent-to-Agent Negotiation', body: 'The Negotiation phase of SNAP now supports automated agent negotiation sessions, surfacing alignment summaries for recruiter review.' },
    { date: 'November 2025', version: 'v1.0', title: 'General Availability', body: 'Taltas launches publicly. The Explorer Agent handles screening, scheduling, and first-round assessment for any open role.' },
  ];
  return (
    <>
      <div style={S.hero}>
        <div style={S.eyebrow}>Changelog</div>
        <h1 style={S.h1}>What we have shipped.</h1>
        <p style={S.sub}>A running log of new features, improvements, and fixes across the Taltas platform.</p>
      </div>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 48px 100px' }}>
        {entries.map((e, i) => (
          <div key={i} style={{ display: 'flex', gap: 40, marginBottom: 52, paddingBottom: 52, borderBottom: i < entries.length - 1 ? '1px solid rgba(0,0,0,.07)' : 'none' }}>
            <div style={{ minWidth: 120 }}>
              <div style={{ ...S.mono, fontSize: 11, color: '#94a3b8', letterSpacing: '.08em' }}>{e.date}</div>
              <div style={{ ...S.tag, marginTop: 8 }}>{e.version}</div>
            </div>
            <div>
              <h3 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: 22, fontWeight: 400, color: '#0d1b3e', margin: '0 0 12px', letterSpacing: '-.01em' }}>{e.title}</h3>
              <p style={{ ...S.body, marginBottom: 0 }}>{e.body}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* -- BLOG PAGE --------------------------------------------- */
function BlogPage() {
  const posts = [
    { date: 'Mar 15, 2026', tag: 'Product', title: 'Why we built Strategy Campaigns', excerpt: 'Most recruiting tools optimize for individual requisitions. We think the real leverage is at the campaign level -- here is why.' },
    { date: 'Mar 08, 2026', tag: 'Hiring', title: 'The hidden cost of slow offer cycles', excerpt: 'Every week between final interview and signed offer loses you roughly 20% of candidates. Here is what the data shows.' },
    { date: 'Feb 22, 2026', tag: 'AI', title: 'Agent transparency builds candidate trust', excerpt: 'We ran an experiment: what happens when you tell candidates they are talking to an AI from the start? The results surprised us.' },
    { date: 'Feb 10, 2026', tag: 'Product', title: 'Introducing the Candidate Portal', excerpt: 'Candidates deserve visibility into where they stand. The new portal gives them a clear view of every stage of the process.' },
    { date: 'Jan 28, 2026', tag: 'Hiring', title: 'The SNAP protocol explained', excerpt: 'Screening, Negotiation, Assessment, Placement. Why we structured the hiring process this way and what each phase optimizes for.' },
  ];
  return (
    <>
      <div style={S.hero}>
        <div style={S.eyebrow}>Blog</div>
        <h1 style={S.h1}>Ideas on hiring, AI, and talent.</h1>
        <p style={S.sub}>Perspectives from the Taltas team on building better hiring systems.</p>
      </div>
      <div style={S.container}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {posts.map((p, i) => (
            <div key={i} style={{ ...S.card, cursor: 'pointer' }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
                <span style={S.tag}>{p.tag}</span>
                <span style={{ ...S.mono, fontSize: 11, color: '#94a3b8' }}>{p.date}</span>
              </div>
              <h3 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: 22, fontWeight: 400, color: '#0d1b3e', margin: '0 0 12px', lineHeight: 1.25, letterSpacing: '-.01em' }}>{p.title}</h3>
              <p style={{ ...S.body, marginBottom: 0 }}>{p.excerpt}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* -- INSIGHTS PAGE ----------------------------------------- */
function InsightsPage() {
  const reports = [
    { tag: 'Report', year: '2026', title: 'State of AI Recruiting', desc: 'How 400 talent teams are using AI in their hiring process today, and what separates the leaders from the laggards.' },
    { tag: 'Benchmark', year: '2026', title: 'Time-to-Offer Benchmarks', desc: 'Industry-by-industry data on how long each hiring stage takes, and where the biggest delays occur.' },
    { tag: 'Research', year: '2025', title: 'Candidate Experience in the AI Era', desc: 'Survey of 2,000 candidates on their perceptions of AI-assisted hiring -- what they trust, what they resist, and what builds confidence.' },
    { tag: 'Guide', year: '2025', title: 'Building an Assessment Framework', desc: 'A practical guide to designing assessments that predict job performance without adding friction to the candidate experience.' },
  ];
  return (
    <>
      <div style={S.hero}>
        <div style={S.eyebrow}>Insights</div>
        <h1 style={S.h1}>Research and data on modern hiring.</h1>
        <p style={S.sub}>Reports, benchmarks, and guides to help talent teams make better decisions.</p>
      </div>
      <div style={S.container}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {reports.map((r, i) => (
            <div key={i} style={{ ...S.card }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
                <span style={S.tag}>{r.tag}</span>
                <span style={{ ...S.mono, fontSize: 11, color: '#94a3b8' }}>{r.year}</span>
              </div>
              <h3 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: 22, fontWeight: 400, color: '#0d1b3e', margin: '0 0 12px', letterSpacing: '-.01em' }}>{r.title}</h3>
              <p style={{ ...S.body, marginBottom: 20 }}>{r.desc}</p>
              <a href="mailto:insights@taltas.ai" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: '#1a56db', textDecoration: 'none', fontWeight: 500 }}>Request report</a>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* -- HELP CENTER PAGE -------------------------------------- */
function HelpCenterPage() {
  const sections = [
    { icon: 'G', title: 'Getting started', articles: ['Setting up your first role', 'Inviting your team', 'Connecting your ATS', 'Running your first screening campaign'] },
    { icon: 'A', title: 'Explorer Agent', articles: ['How screening conversations work', 'Configuring screening criteria', 'Reviewing agent transcripts', 'Escalation settings'] },
    { icon: 'N', title: 'Negotiation phase', articles: ['Agent-to-agent negotiation overview', 'Setting compensation parameters', 'Reviewing alignment summaries', 'Manual override'] },
    { icon: 'I', title: 'Integrations', articles: ['Greenhouse setup', 'Lever setup', 'Workday setup', 'API authentication'] },
    { icon: 'B', title: 'Billing', articles: ['Plan comparison', 'Upgrading your plan', 'Usage and invoices', 'Cancellation policy'] },
    { icon: 'S', title: 'Security', articles: ['SSO configuration', 'Data retention settings', 'Audit logs', 'GDPR compliance tools'] },
  ];
  return (
    <>
      <div style={S.hero}>
        <div style={S.eyebrow}>Help Center</div>
        <h1 style={S.h1}>How can we help?</h1>
        <p style={S.sub}>Documentation, guides, and answers to common questions.</p>
      </div>
      <div style={S.container}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          {sections.map((sec, i) => (
            <div key={i} style={S.card}>
              <div style={{ width: 36, height: 36, background: '#eff6ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "var(--font-dm-mono), monospace", fontSize: 14, color: '#1a56db', marginBottom: 16 }}>{sec.icon}</div>
              <h3 style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 15, fontWeight: 600, color: '#0d1b3e', margin: '0 0 16px' }}>{sec.title}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sec.articles.map((a, j) => (
                  <a key={j} href="mailto:support@taltas.ai" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: '#475569', textDecoration: 'none', lineHeight: 1.5 }}>{a}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 48, ...S.card, background: '#f8faff', borderColor: '#dbeafe', textAlign: 'center' as const }}>
          <p style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 15, color: '#475569', margin: '0 0 12px' }}>Can't find what you're looking for?</p>
          <a href="mailto:support@taltas.ai" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14, color: '#1a56db', fontWeight: 500, textDecoration: 'none' }}>Contact support</a>
        </div>
      </div>
    </>
  );
}

/* -- API REFERENCE PAGE ------------------------------------ */
function ApiRefPage() {
  const endpoints = [
    { method: 'GET', path: '/api/v1/roles', desc: 'List all active roles for your organization.' },
    { method: 'POST', path: '/api/v1/roles', desc: 'Create a new role and optionally launch a screening campaign.' },
    { method: 'GET', path: '/api/v1/candidates', desc: 'List candidates across all roles with filtering and pagination.' },
    { method: 'GET', path: '/api/v1/candidates/:id', desc: 'Retrieve full candidate profile including SNAP phase history.' },
    { method: 'POST', path: '/api/v1/campaigns', desc: 'Launch a new Strategy Campaign with phase gate configuration.' },
    { method: 'GET', path: '/api/v1/transcripts/:id', desc: 'Retrieve an agent conversation transcript.' },
    { method: 'POST', path: '/api/v1/webhooks', desc: 'Register a webhook endpoint for real-time event delivery.' },
  ];
  const methodColor = (m: string) => m === 'GET' ? '#0891b2' : m === 'POST' ? '#059669' : m === 'DELETE' ? '#dc2626' : '#d97706';
  return (
    <>
      <div style={S.hero}>
        <div style={S.eyebrow}>API Reference</div>
        <h1 style={S.h1}>Build on Taltas.</h1>
        <p style={S.sub}>A RESTful API for integrating Taltas data and workflows into your own tools and systems.</p>
      </div>
      <div style={S.container}>
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 48 }}>
          <div>
            <div style={{ ...S.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 12 }}>Base URL</div>
            <div style={{ ...S.card, padding: '12px 16px' }}>
              <code style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: 12, color: '#1a56db' }}>https://api.taltas.ai/api/v1</code>
            </div>
            <div style={{ ...S.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: '#94a3b8', margin: '24px 0 12px' }}>Authentication</div>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>All requests require a Bearer token in the Authorization header. Generate API keys from Settings &gt; Keys.</p>
          </div>
          <div>
            <h2 style={{ ...S.h2, fontSize: 20, marginBottom: 24 }}>Endpoints</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {endpoints.map((ep, i) => (
                <div key={i} style={{ ...S.card, padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: 11, fontWeight: 700, color: methodColor(ep.method), minWidth: 44, paddingTop: 2 }}>{ep.method}</div>
                  <div style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: 12, color: '#0d1b3e', minWidth: 260, paddingTop: 2 }}>{ep.path}</div>
                  <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{ep.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 32, ...S.card, background: '#f8faff', borderColor: '#dbeafe' }}>
              <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>Full documentation including request/response schemas, webhooks, and SDKs: <a href="mailto:api@taltas.ai" style={{ color: '#1a56db' }}>api@taltas.ai</a></p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* -- STATUS PAGE ------------------------------------------- */
function StatusPage() {
  const services = [
    { name: 'API', status: 'operational' },
    { name: 'Explorer Agent', status: 'operational' },
    { name: 'Candidate Portal', status: 'operational' },
    { name: 'Recruiter Portal', status: 'operational' },
    { name: 'ATS Integrations', status: 'operational' },
    { name: 'Webhooks', status: 'operational' },
    { name: 'Email Delivery', status: 'operational' },
  ];
  const statusColor = (s: string) => s === 'operational' ? '#059669' : s === 'degraded' ? '#d97706' : '#dc2626';
  const statusLabel = (s: string) => s === 'operational' ? 'Operational' : s === 'degraded' ? 'Degraded' : 'Outage';
  return (
    <>
      <div style={S.hero}>
        <div style={S.eyebrow}>Status</div>
        <h1 style={S.h1}>All systems operational.</h1>
        <p style={S.sub}>Real-time status for all Taltas platform services.</p>
      </div>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 48px 100px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 48 }}>
          {services.map((svc, i) => (
            <div key={i} style={{ ...S.card, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 15, color: '#0d1b3e' }}>{svc.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor(svc.status) }} />
                <span style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: 12, color: statusColor(svc.status) }}>{statusLabel(svc.status)}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ ...S.card, background: '#f0fdf4', borderColor: '#bbf7d0' }}>
          <p style={{ fontSize: 13, color: '#166534', margin: 0 }}>Subscribe to status updates at <a href="mailto:status@taltas.ai" style={{ color: '#15803d' }}>status@taltas.ai</a></p>
        </div>
      </div>
    </>
  );
}

/* -- COMMUNITY PAGE ---------------------------------------- */
function CommunityPage({ router }: { router: ReturnType<typeof useRouter> }) {
  const [activeChannel, setActiveChannel] = useState('general');
  const channels = [
    { id: 'general', name: 'general', unread: 0 },
    { id: 'screening', name: 'screening', unread: 3 },
    { id: 'negotiation', name: 'negotiation', unread: 1 },
    { id: 'integrations', name: 'integrations', unread: 0 },
    { id: 'feedback', name: 'product-feedback', unread: 2 },
  ];
  const posts = [
    { initials: 'SR', name: 'Sarah R.', role: 'Head of Talent', company: 'Fintech', time: '1h ago', text: 'We just closed a 45-day time-to-offer down to 12 days after turning on the full SNAP pipeline. The negotiation alignment summary saved at least 2 weeks on its own.', replies: 14 },
    { initials: 'MK', name: 'Marcus K.', role: 'Recruiter', company: 'Enterprise SaaS', time: '3h ago', text: 'Tip for anyone new: set your screening criteria to weight for async communication quality, not just role-specific answers. It is a much better signal for remote roles.', replies: 8 },
    { initials: 'JL', name: 'Jamie L.', role: 'TA Lead', company: 'Healthcare Tech', time: '1d ago', text: 'Has anyone used the Greenhouse sync for high-volume roles? We are seeing a slight lag on status updates coming back from Taltas. Looking for anyone who has tuned this.', replies: 6 },
    { initials: 'TN', name: 'Tom N.', role: 'Recruiter', company: 'Consumer Tech', time: '2d ago', text: 'First agent-to-agent negotiation session just completed. The alignment summary was surprisingly good. It surfaced a start date conflict that would have delayed the offer by two weeks.', replies: 19 },
  ];
  return (
    <>
      <div style={{ ...S.hero, paddingBottom: 32 }}>
        <div style={S.eyebrow}>Community</div>
        <h1 style={S.h1}>Where talent teams share what works.</h1>
        <p style={S.sub}>Ask questions, share workflows, and connect with recruiters building with Taltas.</p>
      </div>
      <div style={{ ...S.container, paddingTop: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 220px', gap: 32 }}>
          <div>
            <div style={{ ...S.mono, fontSize: 9, textTransform: 'uppercase', letterSpacing: '.14em', color: '#94a3b8', marginBottom: 12 }}>Channels</div>
            {channels.map(ch => (
              <div key={ch.id} onClick={() => setActiveChannel(ch.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', background: activeChannel === ch.id ? '#eff6ff' : 'transparent', marginBottom: 2 }}>
                <span style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: activeChannel === ch.id ? '#1a56db' : '#64748b' }}>#{ch.name}</span>
                {ch.unread > 0 && <span style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: 10, background: '#1a56db', color: '#fff', borderRadius: 10, padding: '1px 6px' }}>{ch.unread}</span>}
              </div>
            ))}
          </div>
          <div>
            {posts.map((p, i) => (
              <div key={i} style={{ ...S.card, marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "var(--font-dm-mono), monospace", fontSize: 12, color: '#1a56db', flexShrink: 0 }}>{p.initials}</div>
                  <div>
                    <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14, fontWeight: 600, color: '#0d1b3e' }}>{p.name}</div>
                    <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: '#94a3b8' }}>{p.role} - {p.company} - {p.time}</div>
                  </div>
                </div>
                <p style={{ ...S.body, marginBottom: 16 }}>{p.text}</p>
                <div style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: 11, color: '#94a3b8' }}>{p.replies} replies</div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ ...S.card, marginBottom: 16 }}>
              <div style={{ ...S.mono, fontSize: 9, textTransform: 'uppercase', letterSpacing: '.14em', color: '#94a3b8', marginBottom: 12 }}>Community</div>
              <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 28, fontWeight: 700, color: '#0d1b3e', marginBottom: 4 }}>1,240</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>Talent professionals</div>
            </div>
            <div style={{ ...S.card }}>
              <div style={{ ...S.mono, fontSize: 9, textTransform: 'uppercase', letterSpacing: '.14em', color: '#94a3b8', marginBottom: 12 }}>Guidelines</div>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 0 }}>Be specific. Share real numbers when you can. Ask what you actually need. Help others when you know the answer.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* -- SECURITY PAGE ----------------------------------------- */
function SecurityPage() {
  const items = [
    { title: 'SOC 2 Type II', desc: 'Taltas is SOC 2 Type II certified. Our annual audit covers security, availability, and confidentiality. Contact sales for the full report.' },
    { title: 'Encryption', desc: 'All data is encrypted at rest (AES-256) and in transit (TLS 1.3). Encryption keys are managed via AWS KMS with automatic rotation.' },
    { title: 'Access control', desc: 'Role-based access control with SSO support (SAML 2.0, OIDC). All access events are logged in immutable audit trails.' },
    { title: 'Infrastructure', desc: 'Hosted on AWS in us-east-1 and eu-west-1. Isolated per-customer environments. Automated vulnerability scanning and penetration testing quarterly.' },
    { title: 'Incident response', desc: 'Dedicated security team with a 2-hour initial response SLA for critical incidents. Customers are notified within 24 hours of any breach affecting their data.' },
    { title: 'Data retention', desc: 'Configurable retention periods by data type. Automated deletion at end of retention period. Full data export available at any time.' },
  ];
  return (
    <>
      <div style={S.hero}>
        <div style={S.eyebrow}>Security</div>
        <h1 style={S.h1}>Built for enterprise-grade trust.</h1>
        <p style={S.sub}>Candidate data is sensitive. We treat it that way at every level of the stack.</p>
      </div>
      <div style={S.container}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 48 }}>
          {items.map((item, i) => (
            <div key={i} style={S.card}>
              <h3 style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 15, fontWeight: 600, color: '#0d1b3e', margin: '0 0 10px' }}>{item.title}</h3>
              <p style={{ ...S.body, marginBottom: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ ...S.card, background: '#f8faff', borderColor: '#dbeafe' }}>
          <div style={{ ...S.eyebrow, color: '#1a56db' }}>Security contact</div>
          <p style={{ ...S.body, marginBottom: 0 }}>Report vulnerabilities or request our security documentation: <a href="mailto:security@taltas.ai" style={{ color: '#1a56db' }}>security@taltas.ai</a></p>
        </div>
      </div>
    </>
  );
}

/* -- INVESTORS PAGE ---------------------------------------- */
function InvestorsPage() {
  return (
    <>
      <div style={S.hero}>
        <div style={S.eyebrow}>Investors</div>
        <h1 style={S.h1}>Building the future of talent acquisition.</h1>
        <p style={S.sub}>Taltas is backed by investors who believe AI will fundamentally change how companies find and place talent.</p>
      </div>
      <div style={S.container}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginBottom: 80 }}>
          <div>
            <h2 style={S.h2}>The opportunity</h2>
            <p style={S.body}>Global talent acquisition is a $200B+ market. The coordination and process layer -- screening, scheduling, assessment, negotiation -- is almost entirely manual. We are building the AI infrastructure that automates it.</p>
            <p style={S.body}>Enterprise customers spend an average of 47 days on time-to-offer. Taltas customers average 14 days. That compression compounds across every requisition.</p>
          </div>
          <div>
            <h2 style={S.h2}>Our approach</h2>
            <p style={S.body}>We are a horizontal platform with vertical deployment. The same SNAP protocol that works for engineering hiring works for clinical staffing, financial services, and logistics. We build once and deploy everywhere.</p>
            <p style={S.body}>Boston Tech Labs operates a hybrid studio-fund model (BTL Fund I). Taltas is our flagship platform company.</p>
          </div>
        </div>
        <div style={{ ...S.card, background: '#f8faff', borderColor: '#dbeafe' }}>
          <div style={{ ...S.eyebrow, color: '#1a56db' }}>Investor relations</div>
          <p style={{ ...S.body, marginBottom: 0 }}>For investor inquiries, financial information, or partnership discussions: <a href="mailto:investors@taltas.ai" style={{ color: '#1a56db' }}>investors@taltas.ai</a></p>
        </div>
      </div>
    </>
  );
}

/* -- CASE STUDIES PAGE ------------------------------------- */
function CaseStudiesPage() {
  const cases = [
    { company: 'Series B Fintech', role: 'Head of Engineering', metric: '11 days', label: 'Time to offer', outcome: 'Reduced from 38 days. Used Explorer Agent for initial screening of 340 applicants, then agent negotiation for top-6 finalists.' },
    { company: 'Healthcare SaaS', role: 'Clinical Informatics Team (8 roles)', metric: '4.2x', label: 'Pipeline throughput', outcome: 'Ran parallel SNAP pipelines across all 8 roles simultaneously. Previous process was sequential. All roles filled within one quarter.' },
    { company: 'Enterprise Logistics', role: 'Regional Operations Managers', metric: '91%', label: 'Offer acceptance rate', outcome: 'Negotiation phase surfaced relocation and start-date constraints early, eliminating last-minute declines. Up from 67% baseline.' },
    { company: 'Growth-Stage Consumer App', role: 'Product and Design (12 roles)', metric: '$340K', label: 'Recruiting cost savings', outcome: 'Replaced two contract recruiting agencies with Taltas + one internal recruiter. Maintained same fill rate and improved candidate NPS.' },
  ];
  return (
    <>
      <div style={S.hero}>
        <div style={S.eyebrow}>Case Studies</div>
        <h1 style={S.h1}>Results from real hiring teams.</h1>
        <p style={S.sub}>How companies are using Taltas to hire faster, with less overhead.</p>
      </div>
      <div style={S.container}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {cases.map((c, i) => (
            <div key={i} style={S.card}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <span style={S.tag}>{c.company}</span>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: 48, fontWeight: 400, color: '#1a56db', lineHeight: 1 }}>{c.metric}</div>
                <div style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: 11, color: '#94a3b8', letterSpacing: '.08em', marginTop: 4 }}>{c.label}</div>
              </div>
              <h3 style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 15, fontWeight: 600, color: '#0d1b3e', margin: '0 0 10px' }}>{c.role}</h3>
              <p style={{ ...S.body, marginBottom: 0 }}>{c.outcome}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* -- PRESS KIT PAGE ---------------------------------------- */
function PressKitPage() {
  return (
    <>
      <div style={S.hero}>
        <div style={S.eyebrow}>Press Kit</div>
        <h1 style={S.h1}>Media resources for Taltas.</h1>
        <p style={S.sub}>Logos, boilerplate, executive bios, and approved images for press and media use.</p>
      </div>
      <div style={S.container}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginBottom: 64 }}>
          <div>
            <h2 style={S.h2}>Company boilerplate</h2>
            <p style={S.body}>Taltas is an AI-powered talent acquisition platform that uses the SNAP protocol (Screening, Negotiation, Assessment, Placement) to reduce time-to-offer from weeks to days. Built by Boston Tech Labs, Taltas serves enterprise recruiting teams across technology, healthcare, financial services, and logistics.</p>
            <p style={S.body}>Founded: 2025. Headquarters: Boston, MA. Stage: Seed.</p>
          </div>
          <div>
            <h2 style={S.h2}>Assets</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Logo pack (SVG, PNG)', 'Brand guidelines', 'Product screenshots', 'Executive headshots', 'Fact sheet'].map((asset, i) => (
                <div key={i} style={{ ...S.card, padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14, color: '#0d1b3e' }}>{asset}</span>
                  <a href="mailto:press@taltas.ai" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: '#1a56db', textDecoration: 'none' }}>Request</a>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ ...S.card, background: '#f8faff', borderColor: '#dbeafe' }}>
          <div style={{ ...S.eyebrow, color: '#1a56db' }}>Press contact</div>
          <p style={{ ...S.body, marginBottom: 0 }}>For interviews, quotes, and media inquiries: <a href="mailto:press@taltas.ai" style={{ color: '#1a56db' }}>press@taltas.ai</a></p>
        </div>
      </div>
    </>
  );
}

/* -- PARTNERS PAGE ----------------------------------------- */
function PartnersPage() {
  const tiers = [
    { name: 'Technology Partners', desc: 'ATS providers, HRIS platforms, and assessment vendors who integrate with Taltas via our API.', examples: 'Greenhouse, Lever, Workday, Bullhorn, Rippling' },
    { name: 'Implementation Partners', desc: 'Consulting firms and HR technology advisors who help enterprise customers deploy and optimise Taltas.', examples: 'Systems integrators, HR transformation consultancies' },
    { name: 'Referral Partners', desc: 'Recruiting agencies and talent advisors who recommend Taltas to their clients and earn revenue share.', examples: 'Staffing agencies, executive search firms, fractional CHROs' },
  ];
  return (
    <>
      <div style={S.hero}>
        <div style={S.eyebrow}>Partners</div>
        <h1 style={S.h1}>Build with Taltas.</h1>
        <p style={S.sub}>We work with technology platforms, implementation consultants, and talent advisors to bring Taltas to more hiring teams.</p>
      </div>
      <div style={S.container}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 48 }}>
          {tiers.map((t, i) => (
            <div key={i} style={S.card}>
              <h3 style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 16, fontWeight: 600, color: '#0d1b3e', margin: '0 0 10px' }}>{t.name}</h3>
              <p style={{ ...S.body, marginBottom: 12 }}>{t.desc}</p>
              <div style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: 11, color: '#94a3b8', letterSpacing: '.06em' }}>Examples: {t.examples}</div>
            </div>
          ))}
        </div>
        <div style={{ ...S.card, background: '#f8faff', borderColor: '#dbeafe' }}>
          <div style={{ ...S.eyebrow, color: '#1a56db' }}>Apply to partner</div>
          <p style={{ ...S.body, marginBottom: 0 }}>Tell us about your company and what kind of partnership you have in mind: <a href="mailto:partners@taltas.ai" style={{ color: '#1a56db' }}>partners@taltas.ai</a></p>
        </div>
      </div>
    </>
  );
}

/* -- PAPERS PAGE ------------------------------------------- */
function PapersPage() {
  const papers = [
    { tag: 'Technical', date: 'Feb 2026', title: 'The SNAP Protocol: A Framework for AI-Mediated Talent Acquisition', authors: 'Taltas Research', abstract: 'We describe the design principles behind SNAP (Screening, Negotiation, Assessment, Placement) and present data from 14,000 hiring processes conducted on the Taltas platform.' },
    { tag: 'Research', date: 'Jan 2026', title: 'Candidate Perception of AI Agents in Early-Stage Hiring', authors: 'Taltas Research', abstract: 'A mixed-methods study examining how candidates respond to AI-conducted screening interviews, with particular attention to transparency, perceived fairness, and completion rates.' },
    { tag: 'Analysis', date: 'Dec 2025', title: 'Predictive Validity of Asynchronous Text-Based Screening', authors: 'Taltas Research', abstract: 'We analyse the correlation between Explorer Agent screening scores and 90-day performance ratings across 1,200 placements, controlling for role type, level, and industry.' },
  ];
  return (
    <>
      <div style={S.hero}>
        <div style={S.eyebrow}>Research Papers</div>
        <h1 style={S.h1}>The science behind the platform.</h1>
        <p style={S.sub}>Our research on AI-mediated hiring, candidate experience, and predictive assessment.</p>
      </div>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 48px 100px' }}>
        {papers.map((p, i) => (
          <div key={i} style={{ ...S.card, marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
              <span style={S.tag}>{p.tag}</span>
              <span style={{ ...S.mono, fontSize: 11, color: '#94a3b8' }}>{p.date}</span>
            </div>
            <h3 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: 22, fontWeight: 400, color: '#0d1b3e', margin: '0 0 8px', letterSpacing: '-.01em', lineHeight: 1.3 }}>{p.title}</h3>
            <div style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>{p.authors}</div>
            <p style={{ ...S.body, marginBottom: 20 }}>{p.abstract}</p>
            <a href="mailto:research@taltas.ai" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: '#1a56db', textDecoration: 'none', fontWeight: 500 }}>Request full paper</a>
          </div>
        ))}
      </div>
    </>
  );
}

/* -- STANDARD PAGES (policy / legal) ----------------------- */
const STANDARD_PAGES: Record<string, { label: string; title: string; subtitle?: string; content: { heading?: string; body: string }[] }> = {
  privacy: {
    label: 'Legal', title: 'Privacy Policy', subtitle: 'Last updated March 2026',
    content: [
      { heading: 'What we collect', body: 'We collect information you provide directly (name, email, role), information generated through platform use (session data, agent transcripts, assessment responses), and technical data (IP address, browser type, device identifiers).' },
      { heading: 'How we use it', body: 'We use your data to provide and improve the Taltas platform, to send product and account communications, to detect and prevent fraud and abuse, and to comply with legal obligations. We do not sell your data to third parties.' },
      { heading: 'Candidate data', body: 'Candidate data is processed on behalf of recruiter organizations (our customers). Candidates who wish to access, correct, or delete their data should contact the recruiting organization that collected it. We will cooperate with all valid data subject requests.' },
      { heading: 'Retention', body: 'We retain account data for the duration of your subscription plus 90 days. Candidate data is retained according to your configured retention settings. You can export or delete all data at any time from your account settings.' },
      { heading: 'Contact', body: 'Privacy questions: privacy@taltas.ai\nTaltas Inc., 340 Pine Street, San Francisco, CA 94104' },
    ],
  },
  terms: {
    label: 'Legal', title: 'Terms of Service', subtitle: 'Last updated March 2026',
    content: [
      { heading: 'Acceptance', body: 'By accessing or using Taltas, you agree to these Terms. If you are using Taltas on behalf of an organization, you represent that you have authority to bind that organization.' },
      { heading: 'Permitted use', body: 'Taltas is a talent acquisition platform. You may use it to screen, assess, negotiate with, and place candidates for legitimate employment purposes. You may not use Taltas for discriminatory hiring, to collect data for non-employment purposes, or to circumvent applicable employment law.' },
      { heading: 'Your data', body: 'You own your data. We process it on your instructions. You grant us a limited license to process your data solely to provide the service. We do not use your candidate data to train models without explicit consent.' },
      { heading: 'Limitation of liability', body: 'Taltas is provided as-is. We are not liable for hiring decisions made using the platform. Our liability to you for any claim is limited to fees paid in the 12 months preceding the claim.' },
      { heading: 'Contact', body: 'Legal notices: legal@taltas.ai\nTaltas Inc., 340 Pine Street, San Francisco, CA 94104' },
    ],
  },
  cookies: {
    label: 'Legal', title: 'Cookie Policy', subtitle: 'Last updated March 2026',
    content: [
      { heading: 'What we use', body: 'We use strictly necessary cookies (session management, authentication), functional cookies (preferences, language), and analytics cookies (product usage, error tracking). We do not use advertising cookies.' },
      { heading: 'Third parties', body: 'Our analytics provider is PostHog, hosted on our own infrastructure. We do not embed third-party advertising pixels or tracking scripts.' },
      { heading: 'Your choices', body: 'You can disable functional and analytics cookies in your account settings at any time. Strictly necessary cookies cannot be disabled as they are required for the platform to function.' },
    ],
  },
  accessibility: {
    label: 'Legal', title: 'Accessibility', subtitle: 'Our commitment to inclusive design',
    content: [
      { heading: 'Standards', body: 'Taltas targets WCAG 2.1 Level AA conformance across all platform interfaces, including the Recruiter Portal, Candidate Portal, and all public-facing pages.' },
      { heading: 'Known issues', body: 'We maintain a public list of known accessibility issues and their remediation timelines. Our current backlog is available on request.' },
      { heading: 'Contact', body: 'If you encounter an accessibility barrier, please contact us at accessibility@taltas.ai. We aim to respond within 2 business days.' },
    ],
  },
  gdpr: {
    label: 'Legal', title: 'GDPR Compliance', subtitle: 'Taltas is designed to help you comply with the General Data Protection Regulation.',
    content: [
      { heading: 'Our role under GDPR', body: 'When you use Taltas to evaluate candidates, you are the data controller. You determine the purposes and means of processing candidate data. Taltas acts as a data processor, processing candidate data only on your instructions.\n\nWe have a Data Processing Agreement (DPA) available for all customers. Enterprise customers can request a signed DPA from their account manager.' },
      { heading: 'Lawful basis', body: 'Taltas supports two lawful bases for candidate data processing: legitimate interests (evaluating candidates for a role they applied to) and consent (where you configure Explorer Agents to obtain explicit consent at the start of screening conversations). We recommend documenting your chosen basis.' },
      { heading: 'Data subject rights', body: 'The Taltas platform includes tools to help you respond to data subject requests. From the Candidates dashboard, you can export all data held on a candidate (Article 20), delete a candidate record (Article 17), or view and correct stored information (Article 16).' },
      { heading: 'Data transfers', body: 'Taltas processes data in the EU (AWS eu-west-1) and the US (AWS us-east-1). Cross-border transfers are covered by Standard Contractual Clauses. EU customers can request EU-only data residency (Enterprise plan).' },
      { heading: 'DPA and contact', body: 'To request a Data Processing Agreement or reach our DPO: dpo@taltas.ai\nTaltas Inc., 340 Pine Street, San Francisco, CA 94104' },
    ],
  },
};

function StandardPage({ slug }: { slug: string }) {
  const page = STANDARD_PAGES[slug];
  if (!page) return null;
  return (
    <>
      <div style={S.hero}>
        <div style={S.eyebrow}>{page.label}</div>
        <h1 style={S.h1}>{page.title}</h1>
        {page.subtitle && <p style={S.sub}>{page.subtitle}</p>}
      </div>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 48px 100px' }}>
        {page.content.map((s, i) => (
          <div key={i} style={{ marginTop: i > 0 ? 40 : 0, marginBottom: i === page.content.length - 1 ? 0 : 40 }}>
            {s.heading && <h2 style={{ ...S.serif, fontSize: 20, fontWeight: 400, color: '#0d1b3e', marginBottom: 12, letterSpacing: '-.01em' }}>{s.heading}</h2>}
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.85, whiteSpace: 'pre-line', maxWidth: 760 }}>{s.body}</p>
          </div>
        ))}
      </div>
    </>
  );
}

/* -- SLUG ROUTER ------------------------------------------- */
const CUSTOM_PAGES = ['about', 'careers', 'contact', 'changelog', 'blog', 'insights', 'helpcenter', 'apiref', 'status', 'community', 'partners', 'security', 'investors', 'casestudies', 'presskit', 'papers'];

export default function InfoPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const renderPage = () => {
    switch (slug) {
      case 'about':        return <AboutPage router={router} />;
      case 'careers':      return <CareersPage />;
      case 'contact':      return <ContactPage />;
      case 'changelog':    return <ChangelogPage />;
      case 'blog':         return <BlogPage />;
      case 'insights':     return <InsightsPage />;
      case 'helpcenter':   return <HelpCenterPage />;
      case 'apiref':       return <ApiRefPage />;
      case 'status':       return <StatusPage />;
      case 'community':    return <CommunityPage router={router} />;
      case 'partners':     return <PartnersPage />;
      case 'security':     return <SecurityPage />;
      case 'investors':    return <InvestorsPage />;
      case 'casestudies':  return <CaseStudiesPage />;
      case 'presskit':     return <PressKitPage />;
      case 'papers':       return <PapersPage />;
      default:             return <StandardPage slug={slug} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fafbfd', display: 'flex', flexDirection: 'column' }}>
      <PubNav router={router} />
      <div style={{ flex: 1 }}>
        {renderPage()}
      </div>
      <SiteFooter />
    </div>
  );
}
