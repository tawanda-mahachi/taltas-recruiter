// @ts-nocheck
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useLogin } from '@/lib/hooks/use-auth';

const STATS = [
  { num: '100%', label: 'Of applicants given a real conversation' },
  { num: '6', label: 'Fit dimensions scored per interview' },
  { num: '2×', label: 'Faster time to qualified shortlist' },
  { num: '24/7', label: 'Agent availability' },
];

const STEPS = [
  {
    letter: 'S',
    title: 'Screening',
    recruiter: 'Every applicant assessed in full',
    desc: 'Your Explorer conducts a real structured conversation with every inbound candidate — not a keyword filter. Every person gets a fair hearing.',
  },
  {
    letter: 'N',
    title: 'Negotiation',
    recruiter: 'Budget and fit pre-aligned',
    desc: 'Role requirements negotiated upfront — so your conversations are decisive, not exploratory. No surprises at offer stage.',
  },
  {
    letter: 'A',
    title: 'Assessment',
    recruiter: '6-dimension fit beyond the ATS',
    desc: 'Deep Match scoring built from live conversation — behavioral signals, motivation, and role alignment. Not keyword matching.',
  },
  {
    letter: 'P',
    title: 'Placement',
    recruiter: 'Your shortlist, your judgment',
    desc: 'Candidates ranked with full conversation context. Advance, hold, or pass with confidence — with everything you need to decide well.',
  },
];

export default function RecruiterPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const loginMutation = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('senior_recruiter');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && user?.token) router.replace('/dashboard');
  }, [mounted, user]);

  const handleSubmit = async () => {
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!password.trim()) { setError('Please enter your password.'); return; }
    try {
      await loginMutation.mutateAsync({ email: email.trim(), password: password.trim() });
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Login failed. Please check your credentials.');
    }
  };

  const loading = loginMutation.isPending;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --blue: #1a56db;
          --blue-dark: #1240a8;
          --blue-bg: rgba(26,86,219,0.07);
          --blue-border: rgba(26,86,219,0.18);
          --text: #0d1b3e;
          --text-dim: #4a5a7a;
          --muted: #9aaac8;
          --border: rgba(30,60,120,0.1);
          --font-display: 'Cormorant Garamond', Georgia, serif;
          --font-mono: 'DM Mono', monospace;
          --font-body: 'DM Sans', sans-serif;
        }

        .rp-wrap {
          display: grid;
          grid-template-columns: 1fr 480px;
          min-height: 100vh;
          font-family: var(--font-body);
          background: #ffffff;
        }

        /* ── LEFT PANEL ── */
        .rp-left {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 80px 72px;
          overflow: hidden;
          background: #ffffff;
        }
        .rp-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .rp-left-inner {
          position: relative;
          z-index: 2;
        }
        .rp-brand {
          font-family: var(--font-display);
          font-size: 42px;
          font-weight: 700;
          letter-spacing: -1px;
          color: var(--text);
          margin-bottom: 52px;
          line-height: 1;
        }
        .rp-brand span { color: var(--blue); }

        .rp-eyebrow {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--blue);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .rp-eyebrow::before { content: ''; width: 20px; height: 1px; background: var(--blue); }

        .rp-headline {
          font-family: var(--font-display);
          font-size: clamp(38px, 4vw, 58px);
          font-weight: 600;
          letter-spacing: -2px;
          line-height: 1.0;
          color: var(--text);
          margin-bottom: 12px;
        }
        .rp-headline em { font-style: italic; color: var(--blue); }

        .rp-sub {
          font-size: 15px;
          color: var(--text-dim);
          line-height: 1.7;
          font-weight: 300;
          max-width: 520px;
          margin-bottom: 56px;
        }

        /* Stats */
        .rp-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          max-width: 520px;
          margin-bottom: 56px;
        }
        .rp-stat {
          background: #ffffff;
          padding: 20px 24px;
        }
        .rp-stat-num {
          font-family: var(--font-display);
          font-size: 36px;
          font-weight: 600;
          letter-spacing: -1px;
          color: var(--blue);
          line-height: 1;
          margin-bottom: 4px;
        }
        .rp-stat-label {
          font-family: var(--font-mono);
          font-size: 9px;
          color: var(--muted);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          line-height: 1.4;
        }

        /* Steps */
        .rp-steps { display: flex; flex-direction: column; gap: 0; max-width: 520px; }
        .rp-step {
          display: flex;
          gap: 18px;
          padding: 16px 0;
          border-bottom: 1px solid var(--border);
        }
        .rp-step:first-child { border-top: 1px solid var(--border); }
        .rp-step-letter {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--blue-bg);
          border: 1px solid var(--blue-border);
          color: var(--blue);
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .rp-step-title { font-size: 13px; font-weight: 500; color: var(--text); margin-bottom: 3px; }
        .rp-step-desc { font-size: 12px; color: var(--text-dim); line-height: 1.55; }

        /* ── RIGHT PANEL ── */
        .rp-right {
          background: #1a56db;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 52px;
          position: relative;
        }
        .rp-right::before {
          content: '';
          position: absolute;
          top: -80px;
          right: -80px;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
          pointer-events: none;
        }
        .rp-right::after {
          content: '';
          position: absolute;
          bottom: -60px;
          left: -60px;
          width: 240px;
          height: 240px;
          border-radius: 50%;
          background: rgba(255,255,255,0.03);
          pointer-events: none;
        }
        .rp-right-inner { position: relative; z-index: 1; }

        .rp-form-brand {
          font-family: var(--font-display);
          font-size: 32px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.5px;
          margin-bottom: 4px;
        }
        .rp-form-brand span { color: rgba(255,255,255,0.6); }
        .rp-form-tagline {
          font-family: var(--font-mono);
          font-size: 9px;
          color: rgba(255,255,255,0.45);
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin-bottom: 36px;
        }

        .rp-form-title {
          font-family: var(--font-display);
          font-size: 26px;
          font-weight: 500;
          color: #ffffff;
          margin-bottom: 6px;
          letter-spacing: -0.5px;
        }
        .rp-form-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.55);
          margin-bottom: 28px;
        }

        .rp-error {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,100,100,0.4);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 12px;
          color: #fca5a5;
          margin-bottom: 16px;
          line-height: 1.5;
        }

        .rp-field { margin-bottom: 16px; }
        .rp-label {
          display: block;
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          margin-bottom: 6px;
        }
        .rp-input {
          width: 100%;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 13px;
          color: #ffffff;
          font-family: var(--font-body);
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .rp-input::placeholder { color: rgba(255,255,255,0.3); }
        .rp-input:focus {
          border-color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.15);
        }
        .rp-input option { background: #1a56db; color: #ffffff; }

        .rp-pw-wrap { position: relative; }
        .rp-pw-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.4);
          padding: 0;
          display: flex;
          align-items: center;
        }
        .rp-forgot {
          font-family: var(--font-mono);
          font-size: 9px;
          color: rgba(255,255,255,0.45);
          letter-spacing: 0.08em;
          float: right;
          margin-top: 1px;
          cursor: pointer;
          text-decoration: none;
          transition: color 0.2s;
        }
        .rp-forgot:hover { color: rgba(255,255,255,0.75); }

        .rp-submit {
          width: 100%;
          padding: 14px;
          background: #ffffff;
          color: var(--blue);
          border: none;
          border-radius: 10px;
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
        }
        .rp-submit:hover:not(:disabled) {
          background: rgba(255,255,255,0.92);
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }
        .rp-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .rp-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 20px 0;
        }
        .rp-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.12); }
        .rp-divider span {
          font-family: var(--font-mono);
          font-size: 9px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .rp-sso {
          width: 100%;
          padding: 12px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 10px;
          color: rgba(255,255,255,0.7);
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .rp-sso:hover {
          background: rgba(255,255,255,0.13);
          color: rgba(255,255,255,0.9);
        }

        .rp-register {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: rgba(255,255,255,0.45);
        }
        .rp-register a {
          color: rgba(255,255,255,0.8);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }
        .rp-register a:hover { color: #ffffff; }

        .rp-demo-hint {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 14px;
          padding: 7px 14px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
        }
        .rp-demo-hint span {
          font-family: var(--font-mono);
          font-size: 9px;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.06em;
        }

        @media (max-width: 900px) {
          .rp-wrap { grid-template-columns: 1fr; }
          .rp-left { display: none; }
          .rp-right { min-height: 100vh; padding: 48px 28px; }
        }
      `}</style>

      <div className="rp-wrap">
        {/* ── LEFT: Value prop ── */}
        <div className="rp-left">
          <div className="rp-left-inner">
            <div className="rp-brand">Tal<span>tas</span></div>

            <div className="rp-eyebrow">Explorer Agent</div>
            <h1 className="rp-headline">
              Resumes are<br />not enough.<br />
              <em>Neither are ATS scores.</em>
            </h1>
            <p className="rp-sub">
              Taltas puts intelligent agents to work on both sides of the hire — conducting structured bilateral conversations that surface real fit, real context, and real intent. Agents do the groundwork. Humans decide.
            </p>

            <div className="rp-stats">
              {STATS.map((s, i) => (
                <div key={i} className="rp-stat">
                  <div className="rp-stat-num">{s.num}</div>
                  <div className="rp-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="rp-steps">
              {STEPS.map((s) => (
                <div key={s.letter} className="rp-step">
                  <div className="rp-step-letter">{s.letter}</div>
                  <div>
                    <div className="rp-step-title">{s.recruiter}</div>
                    <div className="rp-step-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Login form ── */}
        <div className="rp-right">
          <div className="rp-right-inner">
            <div className="rp-form-brand">Tal<span>tas</span></div>
            <div className="rp-form-tagline">Recruiter Portal</div>

            <div className="rp-form-title">Welcome back</div>
            <div className="rp-form-sub">Sign in to your workspace</div>

            {error && <div className="rp-error">{error}</div>}

            <div className="rp-field">
              <label className="rp-label">Email</label>
              <input
                type="email"
                className="rp-input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            <div className="rp-field">
              <label className="rp-label">
                Password
                <span className="rp-forgot" style={{ float: 'right' }}>Forgot password?</span>
              </label>
              <div className="rp-pw-wrap">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="rp-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  style={{ paddingRight: 42 }}
                />
                <button type="button" className="rp-pw-toggle" onClick={() => setShowPw(!showPw)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {showPw
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                    }
                  </svg>
                </button>
              </div>
            </div>

            <div className="rp-field">
              <label className="rp-label">Role</label>
              <select className="rp-input" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="hiring_manager">Hiring Manager</option>
                <option value="senior_recruiter">Senior Recruiter</option>
                <option value="recruiter">Recruiter</option>
                <option value="coordinator">Coordinator</option>
              </select>
            </div>

            <button className="rp-submit" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>

            <div className="rp-divider">
              <div className="rp-divider-line" />
              <span>or</span>
              <div className="rp-divider-line" />
            </div>

            <button className="rp-sso">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5 }}>
                <rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              Continue with SSO
            </button>

            <div className="rp-register">
              Don't have an account?{' '}
              <Link href="/register">Create one →</Link>
            </div>

            <div className="rp-demo-hint">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
              </svg>
              <span>Demo: test@taltas.ai / TestPass123!</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
