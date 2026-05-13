// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useLogin, useFinalizeAuth } from '@/lib/hooks/use-auth';
import { isMfaChallenge } from '@/types/api';
import MfaSetupCard from '@/components/auth/mfa-setup-card';
import MfaChallengeCard from '@/components/auth/mfa-challenge-card';
import BackupCodesScreen from '@/components/auth/backup-codes-screen';

// -- Content data --
const STATS = [
  { num: '91%', label: 'Candidate quality rate with Explorer screening' },
  { num: '34%', label: 'Higher offer rate vs ATS-only screening' },
  { num: '24/7', label: 'Autonomous screening, no recruiter required' },
];

const STEPS = [
  {
    letter: 'S',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    title: 'Screen with structure',
    desc: 'Every candidate is assessed across six dimensions: skills, motivation, working style, culture, compensation fit, and timeline.',
  },
  {
    letter: 'N',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    title: 'Negotiate before the first call',
    desc: 'Compensation bands, expectations, and timelines are surfaced agent-to-agent. Both sides know it is worth the meeting.',
  },
  {
    letter: 'A',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    title: 'Assess with depth',
    desc: 'AI-powered conversation surfaces motivation, working style, and career context that a resume was never designed to carry.',
  },
  {
    letter: 'P',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    title: 'Place with confidence',
    desc: 'Receive a full candidate summary with match scores, sentiment analysis, and conversation transcript before making any decision.',
  },
];

// -- Design tokens + minimal CSS (A2 approach) --
const CSS = `
:root {
  --blue: #2563eb;
  --blue-bg: rgba(37,99,235,.06);
  --blue-border: rgba(37,99,235,.14);
  --text: #0A0A0A;
  --text-dim: #6B6B6B;
  --muted: #AAAAAA;
  --border: #E8E8E5;
  --font: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  --font-mono: 'Courier New', monospace;
}
* { box-sizing: border-box; }
body { margin: 0; font-family: var(--font); background: #fff; }

.tlx-shell { min-height: 100vh; display: flex; flex-direction: column; background: #fff; position: relative; overflow: hidden; }

.tlx-nav {
  position: sticky; top: 0; z-index: 50;
  background: rgba(255,255,255,.92);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
  height: 64px; display: flex; align-items: center; padding: 0 56px;
}
.tlx-nav-logo { display: flex; align-items: center; gap: 12px; margin-right: auto; text-decoration: none; }
.tlx-nav-wordmark { display: flex; align-items: flex-end; gap: 10px; }
.tlx-nav-tal { font-size: 40px; font-weight: 300; letter-spacing: -.03em; line-height: 1; color: var(--text); }
.tlx-nav-tas { font-size: 40px; font-weight: 300; letter-spacing: -.03em; line-height: 1; color: var(--blue); }
.tlx-nav-tag { font-size: 11px; color: var(--muted); letter-spacing: .1em; text-transform: uppercase; font-weight: 400; line-height: 1; margin-bottom: 7px; }
.tlx-nav-link { font-size: 14px; color: var(--muted); font-weight: 300; text-decoration: none; }

.tlx-globe {
  position: fixed; top: 20px; right: 30%;
  pointer-events: none; z-index: 0; opacity: .04;
}

.tlx-grid { display: grid; grid-template-columns: 1fr 460px; flex: 1; position: relative; z-index: 1; }
.tlx-left { padding: 48px 72px; display: flex; flex-direction: column; justify-content: center; }
.tlx-h1 { font-size: clamp(32px, 3.5vw, 50px); font-weight: 300; letter-spacing: -.03em; line-height: 1.05; color: var(--text); margin: 0 0 16px; }
.tlx-sub { font-size: 15px; font-weight: 300; color: var(--text-dim); line-height: 1.8; margin: 0 0 32px; max-width: 480px; }

.tlx-stats { border: 1px solid var(--border); margin-bottom: 32px; max-width: 480px; }
.tlx-stat { display: flex; align-items: center; gap: 24px; padding: 14px 18px; border-bottom: 1px solid var(--border); }
.tlx-stat:last-child { border-bottom: none; }
.tlx-stat-num { font-size: 28px; font-weight: 300; letter-spacing: -1px; color: var(--blue); line-height: 1; flex-shrink: 0; width: 76px; }
.tlx-stat-label { font-size: 12px; font-weight: 300; color: var(--text-dim); line-height: 1.5; }

.tlx-steps { display: flex; flex-direction: column; }
.tlx-step { display: flex; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--border); }
.tlx-step:first-child { border-top: 1px solid var(--border); }
.tlx-step-icon { width: 30px; height: 30px; border-radius: 50%; background: var(--blue-bg); border: 1px solid var(--blue-border); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
.tlx-step-title { font-size: 13px; font-weight: 400; color: var(--text); margin-bottom: 3px; }
.tlx-step-desc { font-size: 12px; font-weight: 300; color: var(--text-dim); line-height: 1.6; }

.tlx-right { background: var(--blue); display: flex; flex-direction: column; justify-content: flex-start; padding: 48px 48px; position: relative; overflow: hidden; }
.tlx-right::before { content: ''; position: absolute; top: -80px; left: -80px; width: 300px; height: 300px; border-radius: 50%; background: rgba(255,255,255,.04); pointer-events: none; }
.tlx-right::after { content: ''; position: absolute; bottom: -60px; right: -60px; width: 220px; height: 220px; border-radius: 50%; background: rgba(255,255,255,.03); pointer-events: none; }
.tlx-right-inner { position: relative; z-index: 1; }

.tlx-portal-tag { font-size: 22px; font-weight: 300; letter-spacing: .08em; color: rgba(255,255,255,.95); margin-bottom: 6px; text-transform: uppercase; }
.tlx-portal-sub { font-size: 13px; font-weight: 300; color: rgba(255,255,255,.45); margin-bottom: 32px; }

.tlx-err { background: rgba(255,255,255,.12); border: 1px solid rgba(255,100,100,.4); padding: 10px 14px; font-size: 12px; font-weight: 300; color: #fca5a5; margin-bottom: 16px; line-height: 1.5; }
.tlx-field { margin-bottom: 14px; }
.tlx-field-pw { margin-bottom: 24px; }
.tlx-lbl { display: block; font-family: var(--font-mono); font-size: 9px; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.45); margin-bottom: 6px; }
.tlx-inp { width: 100%; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.2); padding: 12px 16px; font-size: 13px; font-weight: 300; font-family: var(--font); color: #fff; outline: none; }
.tlx-pw-wrap { position: relative; }
.tlx-pw-inp { padding-right: 48px; }
.tlx-pw-toggle { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: rgba(255,255,255,.4); font-size: 11px; font-family: var(--font); font-weight: 300; }
.tlx-btn { width: 100%; padding: 14px; background: #fff; color: var(--blue); border: none; font-size: 14px; font-weight: 500; font-family: var(--font); cursor: pointer; }
.tlx-btn:disabled { cursor: not-allowed; opacity: .7; }

.tlx-divider { display: flex; align-items: center; gap: 10px; margin: 20px 0; }
.tlx-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,.12); }
.tlx-divider-text { font-family: var(--font); font-size: 11px; font-weight: 300; color: rgba(255,255,255,.3); }

.tlx-sso-row { display: flex; gap: 10px; margin-bottom: 24px; }
.tlx-sso { flex: 1; padding: 11px 0; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.18); color: rgba(255,255,255,.8); font-family: var(--font); font-size: 12px; font-weight: 300; display: flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none; }

.tlx-reg { text-align: center; font-size: 13px; font-weight: 300; color: rgba(255,255,255,.5); }
.tlx-reg a { color: #fff; text-decoration: none; font-weight: 400; }

/* Footer */
.tlx-ft { background: #0B1D35; padding: 64px 56px 28px; position: relative; z-index: 1; font-family: var(--font); }
.tlx-ft-top { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 48px; padding-bottom: 40px; }
.tlx-ft-brand { display: flex; flex-direction: column; }
.tlx-ft-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.tlx-ft-tal { font-size: 24px; font-weight: 300; letter-spacing: -.03em; line-height: 1; color: #fff; }
.tlx-ft-tas { font-size: 24px; font-weight: 300; letter-spacing: -.03em; line-height: 1; color: var(--blue); }
.tlx-ft-atlas { font-family: var(--font-mono); font-size: 11px; color: rgba(255,255,255,.5); letter-spacing: .18em; text-transform: uppercase; margin-top: 4px; }
.tlx-ft-social { display: flex; gap: 10px; margin-top: 16px; }
.tlx-ft-social a { width: 28px; height: 28px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12); display: flex; align-items: center; justify-content: center; text-decoration: none; color: rgba(255,255,255,.5); }
.tlx-ft-col-head { font-family: var(--font-mono); font-size: 9px; color: rgba(255,255,255,.4); letter-spacing: .14em; text-transform: uppercase; margin-bottom: 18px; }
.tlx-ft-col a { display: block; font-size: 12px; font-weight: 300; color: rgba(255,255,255,.5); text-decoration: none; margin-bottom: 10px; }
.tlx-ft-col a:hover { color: rgba(255,255,255,.8); }
.tlx-ft-bottom { padding-top: 22px; border-top: 1px solid rgba(255,255,255,.08); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.tlx-ft-copy { font-family: var(--font-mono); font-size: 10px; color: rgba(255,255,255,.4); letter-spacing: .04em; }
.tlx-ft-legal { display: flex; gap: 24px; flex-wrap: wrap; }
.tlx-ft-legal a { font-family: var(--font-mono); font-size: 10px; color: rgba(255,255,255,.4); letter-spacing: .04em; text-decoration: none; }
.tlx-ft-legal a:hover { color: rgba(255,255,255,.7); }

@media (max-width: 960px) {
  .tlx-grid { grid-template-columns: 1fr; }
  .tlx-left { display: none; }
  .tlx-right { min-height: 100vh; padding: 48px 28px; }
  .tlx-ft-top { grid-template-columns: 1fr 1fr; gap: 32px; }
  .tlx-ft { padding: 48px 24px 28px; }
}
`;

export default function RecruiterPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const loginMutation = useLogin();
  const finalizeAuth = useFinalizeAuth();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://api.taltas.ai/api/v1';

  const [phase, setPhase] = useState({ kind: 'idle' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [isReturning, setIsReturning] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsReturning(!!localStorage.getItem('taltas_r_visited'));
  }, []);

  useEffect(() => {
    if (mounted && user) {
      localStorage.setItem('taltas_r_visited', '1');
      router.replace('/dashboard');
    }
  }, [mounted, user]);

  const loading = loginMutation.isPending;

  const handleSubmit = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }
    try {
      const result = await loginMutation.mutateAsync({ email: email.trim(), password: password.trim() });
      if (isMfaChallenge(result)) {
        if (result.mfaSetupRequired) {
          setPhase({ kind: 'mfa_setup', mfaToken: result.mfaToken });
        } else {
          setPhase({ kind: 'mfa_challenge', mfaToken: result.mfaToken, hasPhone: result.hasPhone });
        }
        return;
      }
      localStorage.setItem('taltas_r_visited', '1');
      router.push('/dashboard');
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Login failed.');
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="tlx-shell">
        {/* Nav */}
        <nav className="tlx-nav">
          <a href="https://taltas.ai" className="tlx-nav-logo">
            <svg width="50" height="50" viewBox="0 0 60 60" fill="none">
              <circle cx="30" cy="30" r="27" fill="#2563eb"/>
              <polygon points="30,8 36,32 30,28 24,32" fill="white"/>
              <polygon points="30,52 34,32 30,36 26,32" fill="white" opacity="0.28"/>
              <line x1="12" y1="30" x2="48" y2="30" stroke="white" strokeWidth="1" opacity="0.25"/>
              <circle cx="30" cy="30" r="3.5" fill="white"/>
              <circle cx="30" cy="30" r="1.8" fill="#2563eb"/>
            </svg>
            <div className="tlx-nav-wordmark">
              <div><span className="tlx-nav-tal">Tal</span><span className="tlx-nav-tas">tas</span></div>
              <div className="tlx-nav-tag">Your Talent Atlas</div>
            </div>
          </a>
          <a href="https://candidates.taltas.ai" className="tlx-nav-link">Candidates</a>
        </nav>

        {/* Globe decoration */}
        <div className="tlx-globe">
          <svg width="700" height="700" viewBox="0 0 60 60" fill="none">
            <circle cx="30" cy="30" r="27" fill="none" stroke="#2563eb" strokeWidth=".3"/>
            <g>
              <animateTransform attributeName="transform" type="rotate"
                values="0 30 30;-28 30 30;33 30 30;-12 30 30;6 30 30;0 30 30;0 30 30;0 30 30"
                keyTimes="0;0.28;0.57;0.68;0.76;0.82;0.92;1"
                dur="6s" begin="1s" repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1"/>
              <polygon points="30,8 36,32 30,28 24,32" fill="#2563eb" opacity="0.7"/>
              <polygon points="30,52 34,32 30,36 26,32" fill="#2563eb" opacity="0.25"/>
              <circle cx="30" cy="30" r="2.5" fill="#2563eb" opacity="0.6"/>
            </g>
            <g transform="rotate(23 30 30)">
              <ellipse cx="30" cy="10" rx="12" ry="3.5" fill="none" stroke="#2563eb" strokeWidth=".18"/>
              <ellipse cx="30" cy="18" rx="22" ry="6" fill="none" stroke="#2563eb" strokeWidth=".2"/>
              <ellipse cx="30" cy="26" rx="26.5" ry="7" fill="none" stroke="#2563eb" strokeWidth=".22"/>
              <ellipse cx="30" cy="30" rx="27" ry="7.5" fill="none" stroke="#2563eb" strokeWidth=".28"/>
              <ellipse cx="30" cy="34" rx="26.5" ry="7" fill="none" stroke="#2563eb" strokeWidth=".22"/>
              <ellipse cx="30" cy="42" rx="22" ry="6" fill="none" stroke="#2563eb" strokeWidth=".2"/>
              <ellipse cx="30" cy="50" rx="12" ry="3.5" fill="none" stroke="#2563eb" strokeWidth=".18"/>
              <ellipse cx="30" cy="30" rx="27" ry="27" fill="none" stroke="#2563eb" strokeWidth=".28">
                <animate attributeName="rx" values="27;0;27;0;27" dur="22s" repeatCount="indefinite" calcMode="spline" keySplines="0.5 0 0.5 1;0.5 0 0.5 1;0.5 0 0.5 1;0.5 0 0.5 1"/>
                <animate attributeName="opacity" values="1;0.15;1;0.15;1" dur="22s" repeatCount="indefinite"/>
              </ellipse>
              <ellipse cx="30" cy="30" rx="19" ry="27" fill="none" stroke="#2563eb" strokeWidth=".22">
                <animate attributeName="rx" values="19;0;19;27;19;0;19" dur="22s" begin="-5.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.5 0 0.5 1;0.5 0 0.5 1;0.5 0 0.5 1;0.5 0 0.5 1;0.5 0 0.5 1;0.5 0 0.5 1"/>
                <animate attributeName="opacity" values="0.65;0.12;0.65;1;0.65;0.12;0.65" dur="22s" begin="-5.5s" repeatCount="indefinite"/>
              </ellipse>
              <ellipse cx="30" cy="30" rx="0" ry="27" fill="none" stroke="#2563eb" strokeWidth=".28">
                <animate attributeName="rx" values="0;27;0;27;0" dur="22s" begin="-11s" repeatCount="indefinite" calcMode="spline" keySplines="0.5 0 0.5 1;0.5 0 0.5 1;0.5 0 0.5 1;0.5 0 0.5 1"/>
                <animate attributeName="opacity" values="0.15;1;0.15;1;0.15" dur="22s" begin="-11s" repeatCount="indefinite"/>
              </ellipse>
            </g>
          </svg>
        </div>

        {/* Main grid */}
        <div className="tlx-grid">
          {/* LEFT - Marketing */}
          <div className="tlx-left">
            <h1 className="tlx-h1">Hire with depth.<br/>Not just keywords.</h1>
            <p className="tlx-sub">Stop relying on resumes. Your Explorer Agent conducts structured conversations with candidates and surfaces what a two-page document was never designed to carry: motivation, working style, career context, and real fit across six dimensions.</p>

            <div className="tlx-stats">
              {STATS.map((s, i) => (
                <div key={i} className="tlx-stat">
                  <div className="tlx-stat-num">{s.num}</div>
                  <div className="tlx-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="tlx-steps">
              {STEPS.map((s) => (
                <div key={s.letter} className="tlx-step">
                  <div className="tlx-step-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon}/></svg>
                  </div>
                  <div>
                    <div className="tlx-step-title">{s.title}</div>
                    <div className="tlx-step-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT - Login / MFA */}
          <div className="tlx-right">
            <div className="tlx-right-inner">
              <div className="tlx-portal-tag">Recruiter Portal</div>

              {phase.kind === 'idle' ? (
                <>
                  <div className="tlx-portal-sub">{isReturning ? 'Welcome back. Sign in to your company.' : 'Sign in to get started.'}</div>

                  {error && <div className="tlx-err">{error}</div>}

                  <div className="tlx-field">
                    <label className="tlx-lbl">Email</label>
                    <input
                      type="email"
                      className="tlx-inp"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                      placeholder="you@email.com"
                    />
                  </div>

                  <div className="tlx-field-pw">
                    <label className="tlx-lbl">Password</label>
                    <div className="tlx-pw-wrap">
                      <input
                        type={showPw ? 'text' : 'password'}
                        className="tlx-inp tlx-pw-inp"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                        placeholder="password"
                      />
                      <button onClick={() => setShowPw(!showPw)} type="button" className="tlx-pw-toggle">
                        {showPw ? 'hide' : 'show'}
                      </button>
                    </div>
                  </div>

                  <button onClick={handleSubmit} disabled={loading} className="tlx-btn">
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>

                  <div className="tlx-divider">
                    <div className="tlx-divider-line"/>
                    <span className="tlx-divider-text">or continue with</span>
                    <div className="tlx-divider-line"/>
                  </div>

                  <div className="tlx-sso-row">
                    <a href={apiBase + '/auth/google'} className="tlx-sso">
                      <svg width="14" height="14" viewBox="0 0 24 24"><path fill="rgba(255,255,255,.9)" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="rgba(255,255,255,.9)" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="rgba(255,255,255,.9)" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="rgba(255,255,255,.9)" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                      Google
                    </a>
                    <a href={apiBase + '/auth/linkedin'} className="tlx-sso">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,.9)"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      LinkedIn
                    </a>
                  </div>

                  <div className="tlx-reg">
                    New to Taltas? <a href="/register">Create account</a>
                  </div>
                </>
              ) : phase.kind === 'mfa_setup' ? (
                <MfaSetupCard
                  mfaToken={phase.mfaToken}
                  onSuccess={(resp) => setPhase({ kind: 'backup_codes', codes: resp.backupCodes, accessToken: resp.accessToken, refreshToken: resp.refreshToken })}
                  onCancel={() => setPhase({ kind: 'idle' })}
                />
              ) : phase.kind === 'mfa_challenge' ? (
                <MfaChallengeCard
                  mfaToken={phase.mfaToken}
                  hasPhone={phase.hasPhone}
                  onSuccess={async (resp) => {
                    await finalizeAuth(resp.accessToken, resp.refreshToken);
                    localStorage.setItem('taltas_r_visited', '1');
                    router.push('/dashboard');
                  }}
                  onCancel={() => setPhase({ kind: 'idle' })}
                />
              ) : phase.kind === 'backup_codes' ? (
                <BackupCodesScreen
                  codes={phase.codes}
                  onContinue={async () => {
                    await finalizeAuth(phase.accessToken, phase.refreshToken);
                    localStorage.setItem('taltas_r_visited', '1');
                    router.push('/dashboard');
                  }}
                />
              ) : null}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="tlx-ft">
          <div className="tlx-ft-top">
            <div className="tlx-ft-brand">
              <div className="tlx-ft-logo">
                <svg width="36" height="36" viewBox="0 0 60 60" fill="none">
                  <circle cx="30" cy="30" r="27" fill="#2563eb"/>
                  <polygon points="30,8 36,32 30,28 24,32" fill="white"/>
                  <polygon points="30,52 34,32 30,36 26,32" fill="white" opacity="0.28"/>
                  <line x1="12" y1="30" x2="48" y2="30" stroke="white" strokeWidth="1" opacity="0.25"/>
                  <circle cx="30" cy="30" r="3.5" fill="white"/>
                  <circle cx="30" cy="30" r="1.8" fill="#2563eb"/>
                </svg>
                <div><span className="tlx-ft-tal">Tal</span><span className="tlx-ft-tas">tas</span></div>
              </div>
              <div className="tlx-ft-atlas">Talent Atlas</div>
              <div className="tlx-ft-social">
                <a href="https://linkedin.com/company/taltas-ai" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="https://x.com/taltasai" target="_blank" rel="noreferrer" aria-label="X">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              </div>
            </div>
            <div className="tlx-ft-col">
              <div className="tlx-ft-col-head">Resources</div>
              <a href="/info/papers">Documentation</a>
              <a href="/info/insights">Insights &amp; Reports</a>
              <a href="/info/papers">Research Papers</a>
              <a href="/info/casestudies">Case Studies</a>
              <a href="/info/presskit">Press Kit</a>
              <a href="/info/blog">Blog</a>
            </div>
            <div className="tlx-ft-col">
              <div className="tlx-ft-col-head">Support</div>
              <a href="/info/helpcenter">Help Center</a>
              <a href="/info/apiref">API Reference</a>
              <a href="/info/status">Status</a>
              <a href="/info/contact">Contact Us</a>
            </div>
            <div className="tlx-ft-col">
              <div className="tlx-ft-col-head">Company</div>
              <a href="/info/about">About</a>
              <a href="/info/careers">Careers</a>
              <a href="/info/partners">Partners</a>
              <a href="/info/security">Security</a>
              <a href="/info/investors">Investors</a>
            </div>
            <div className="tlx-ft-col">
              <div className="tlx-ft-col-head">Legal</div>
              <a href="/info/privacy">Privacy Policy</a>
              <a href="/info/terms">Terms of Service</a>
              <a href="/info/cookie">Cookie Policy</a>
              <a href="/info/gdpr">GDPR</a>
            </div>
          </div>
          <div className="tlx-ft-bottom">
            <div className="tlx-ft-copy">&copy; 2026 Taltas Inc. All rights reserved.</div>
            <div className="tlx-ft-legal">
              <a href="/info/privacy">Privacy</a>
              <a href="/info/terms">Terms</a>
              <a href="/info/cookie">Cookies</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
