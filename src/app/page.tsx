// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useLogin } from '@/lib/hooks/use-auth';

const STATS = [
  { num: '91%', label: 'Candidate quality rate with Explorer screening' },
  { num: '34%', label: 'Higher offer rate vs ATS-only screening' },
  { num: '24/7', label: 'Autonomous screening — no recruiter required' },
];

const STEPS = [
  {
    letter: 'S',
    title: 'Every applicant assessed in full',
    desc: 'Your Explorer conducts a real structured conversation with every inbound candidate — not a keyword filter. Every person gets a fair hearing, at any hour, at any volume, with full sentiment mapping on every exchange.',
  },
  {
    letter: 'N',
    title: 'Budget and fit pre-aligned',
    desc: 'Role requirements, compensation range, and timeline are negotiated upfront through bilateral conversation — so every interview you conduct is decisive, not exploratory. No surprises at offer stage.',
  },
  {
    letter: 'A',
    title: '6-dimension fit beyond the ATS',
    desc: 'Deep Match scoring built from live conversation — behavioral signals, motivation, working style, and role alignment. Not keyword matching. Not a form score. Real qualitative signal from real dialogue.',
  },
  {
    letter: 'P',
    title: 'Your shortlist, your judgment',
    desc: 'Candidates ranked with full conversation context, sentiment analysis, and alignment scores. Advance, hold, or pass with confidence — with everything you need to decide well, not just a number on a screen.',
  },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --blue:#1a56db;--blue-dark:#1240a8;--blue-bg:rgba(26,86,219,0.07);--blue-border:rgba(26,86,219,0.18);
  --text:#0d1b3e;--text-dim:#4a5a7a;--muted:#9aaac8;--border:rgba(30,60,120,0.1);
  --fd:var(--font-cormorant), Georgia, serif;--fm:var(--font-dm-mono), monospace;--fb:var(--font-dm-sans), sans-serif;
}
html,body{min-height:100%;margin:0}
body{font-family:var(--fb);background:#fff;display:flex;flex-direction:column}
.r-wrap{display:grid;grid-template-columns:1fr 500px;min-height:100vh;flex:1}
.r-left{display:flex;flex-direction:column;justify-content:flex-start;padding:52px 72px 80px;background:#fff;overflow-y:auto}
.r-brand{font-family:var(--fd);font-size:48px;font-weight:700;letter-spacing:-1px;color:var(--text);line-height:1;margin-bottom:6px}
.r-brand span{color:var(--blue)}
.r-brand-tag{font-family:var(--fm);font-size:13px;color:var(--muted);letter-spacing:.18em;text-transform:uppercase;margin-bottom:52px}
.r-eyebrow{font-family:var(--fm);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--blue);margin-bottom:16px;display:flex;align-items:center;gap:10px}
.r-eyebrow::before{content:'';width:20px;height:1px;background:var(--blue)}
.r-headline{font-family:var(--fd);font-size:clamp(40px,4.2vw,62px);font-weight:600;letter-spacing:-2px;line-height:1.0;color:var(--text);margin-bottom:16px}
.r-headline em{font-style:italic;color:var(--blue)}
.r-sub{font-size:16px;color:var(--text-dim);line-height:1.75;font-weight:300;margin-bottom:52px}
.r-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:52px}
.r-stat{background:#fff;padding:22px 24px}
.r-stat-num{font-family:var(--fd);font-size:40px;font-weight:600;letter-spacing:-1px;color:var(--blue);line-height:1;margin-bottom:5px}
.r-stat-label{font-family:var(--fm);font-size:10px;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;line-height:1.5}
.r-steps{display:flex;flex-direction:column}
.r-step{display:flex;gap:18px;padding:16px 0;border-bottom:1px solid var(--border)}
.r-step:first-child{border-top:1px solid var(--border)}
.r-s-letter{width:30px;height:30px;border-radius:50%;background:var(--blue-bg);border:1px solid var(--blue-border);color:var(--blue);font-family:var(--fm);font-size:10px;font-weight:500;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:3px}
.r-s-title{font-size:15px;font-weight:500;color:var(--text);margin-bottom:5px}
.r-s-desc{font-size:13px;color:var(--text-dim);line-height:1.65}
.r-right{background:#1a56db;display:flex;flex-direction:column;justify-content:center;padding:60px 52px;position:relative;overflow:hidden}
.r-right::before{content:'';position:absolute;top:-80px;right:-80px;width:300px;height:300px;border-radius:50%;background:rgba(255,255,255,.04);pointer-events:none}
.r-right::after{content:'';position:absolute;bottom:-60px;left:-60px;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,.03);pointer-events:none}
.r-ri{position:relative;z-index:1}
.r-logo-row{display:flex;align-items:baseline;gap:14px;margin-bottom:6px;text-decoration:none;cursor:pointer}
.r-f-brand{font-family:var(--fd);font-size:48px;font-weight:700;color:#fff;letter-spacing:-.5px;line-height:1}
.r-f-brand span{color:rgba(255,255,255,.55)}
.r-f-atlas{font-family:var(--fm);font-size:13px;color:rgba(255,255,255,.45);letter-spacing:.18em;text-transform:uppercase;padding-left:14px;border-left:1px solid rgba(255,255,255,.2)}
.r-f-tag{font-family:var(--fm);font-size:9px;color:rgba(255,255,255,.4);letter-spacing:.18em;text-transform:uppercase;margin-bottom:32px}
.r-f-title{font-family:var(--fd);font-size:26px;font-weight:500;color:#fff;margin-bottom:5px;letter-spacing:-.5px}
.r-f-sub{font-size:13px;color:rgba(255,255,255,.5);margin-bottom:26px}
.r-err{background:rgba(255,255,255,.12);border:1px solid rgba(255,100,100,.4);border-radius:8px;padding:10px 14px;font-size:12px;color:#fca5a5;margin-bottom:16px;line-height:1.5}
.r-field{margin-bottom:15px}
.r-lbl{display:block;font-family:var(--fm);font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.45);margin-bottom:6px}
.r-inp{width:100%;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:10px;padding:12px 16px;font-size:13px;color:#fff;font-family:var(--fb);outline:none;transition:border-color .2s,background .2s}
.r-inp::placeholder{color:rgba(255,255,255,.3)}
.r-inp:focus{border-color:rgba(255,255,255,.5);background:rgba(255,255,255,.15)}
.r-inp option{background:#1a56db;color:#fff}
.r-pw-wrap{position:relative}
.r-pw-btn{position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:rgba(255,255,255,.4);padding:0;display:flex}
.r-btn{width:100%;padding:14px;background:#fff;color:var(--blue);border:none;border-radius:10px;font-family:var(--fm);font-size:12px;font-weight:500;letter-spacing:.08em;cursor:pointer;margin-top:6px;transition:all .2s}
.r-btn:hover:not(:disabled){background:rgba(255,255,255,.92);transform:translateY(-1px);box-shadow:0 8px 24px rgba(0,0,0,.15)}
.r-btn:disabled{opacity:.6;cursor:not-allowed}
.r-divider{display:flex;align-items:center;gap:10px;margin:18px 0}
.r-divider-line{flex:1;height:1px;background:rgba(255,255,255,.12)}
.r-divider span{font-family:var(--fm);font-size:9px;color:rgba(255,255,255,.3);letter-spacing:.1em;text-transform:uppercase}
.r-sso{width:100%;padding:12px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:10px;color:rgba(255,255,255,.65);font-family:var(--fm);font-size:11px;letter-spacing:.06em;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s}
.r-sso:hover{background:rgba(255,255,255,.13);color:#fff}
.r-reg{text-align:center;margin-top:20px;font-size:12px;color:rgba(255,255,255,.4)}
.r-reg a{color:rgba(255,255,255,.8);text-decoration:none;font-weight:500}
.r-demo{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:13px;padding:7px 14px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:8px}
.r-demo span{font-family:var(--fm);font-size:9px;color:rgba(255,255,255,.3);letter-spacing:.05em}
.r-ft{background:#0f172a;border-top:1px solid rgba(255,255,255,.06);width:100%}
.r-ft-top{padding:64px 52px 48px;display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr;gap:48px}
.r-ft-logo{font-family:'Cormorant Garamond',Georgia,serif;font-size:36px;font-weight:700;color:#fff;letter-spacing:-0.5px;line-height:1}
.r-ft-logo span{color:#1a56db}.r-ft-atlas{font-family:'DM Mono',monospace;font-size:13px;color:rgba(255,255,255,0.75);letter-spacing:0.18em;text-transform:uppercase;margin-top:6px;display:block}
.r-ft-tagline{display:none}
.r-ft-social{display:flex;gap:10px;margin-top:16px}
.r-ft-social a{width:32px;height:32px;border-radius:6px;border:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.4);text-decoration:none;transition:all .2s}
.r-ft-social a:hover{border-color:#1a56db;color:#1a56db;background:rgba(26,86,219,0.1)}
.r-ft-col-head{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.9);margin-bottom:18px}
.r-ft-col a{display:block;font-size:13px;color:#94a3b8;text-decoration:none;margin-bottom:10px;transition:color .15s}
.r-ft-col a:hover{color:#e2e8f0}
.r-ft-bottom{padding:22px 52px;border-top:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.r-ft-copy{font-family:'Space Mono',monospace;font-size:10px;color:#e2e8f0;letter-spacing:.04em}
.r-ft-legal{display:flex;gap:24px;flex-wrap:wrap}
.r-ft-legal a{font-family:'Space Mono',monospace;font-size:10px;color:#e2e8f0;letter-spacing:.04em;text-decoration:none;transition:color .15s}
.r-ft-legal a:hover{color:#94a3b8}
@media(max-width:960px){
  .r-wrap{grid-template-columns:1fr}
  .r-left{display:none}
  .r-right{min-height:100vh;padding:48px 28px}
  .r-ft-top{grid-template-columns:1fr 1fr;gap:32px;padding:48px 24px 32px}
  .r-ft-bottom{padding:16px 24px;flex-direction:column}
}
`;

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
  useEffect(() => { if (mounted && user?.token) router.replace('/dashboard'); }, [mounted, user]);

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
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div className="r-wrap">
          {/* LEFT */}
          <div className="r-left">
            <a href="https://taltas.ai" style={{textDecoration:"none"}}><div className="r-brand">Tal<span>tas</span></div></a>
            <div className="r-brand-tag">Talent Atlas</div>
            <div className="r-eyebrow">Explorer Agent</div>
            <h1 className="r-headline">Your next great hire is already<br/><em>in your pipeline.</em></h1>
            <p className="r-sub">Taltas deploys AI Explorer agents that conduct real structured conversations with every inbound candidate — scoring on 6 fit dimensions, mapping sentiment, and surfacing the hidden gems your ATS would have rejected. Agents do the groundwork. You make every call.</p>
            <div className="r-stats">
              {STATS.map((s, i) => (
                <div key={i} className="r-stat">
                  <div className="r-stat-num">{s.num}</div>
                  <div className="r-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="r-steps">
              {STEPS.map((s) => (
                <div key={s.letter} className="r-step">
                  <div className="r-s-letter">{s.letter}</div>
                  <div>
                    <div className="r-s-title">{s.title}</div>
                    <div className="r-s-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="r-right">
            <div className="r-ri">
              <a href="https://taltas.ai" className="r-logo-row" style={{ textDecoration: 'none' }}>
                <div className="r-f-brand">Tal<span>tas</span></div>
                <span className="r-f-atlas">Talent Atlas</span>
              </a>
              <div className="r-f-tag">Recruiter Portal</div>
              <div className="r-f-title">Welcome back</div>
              <div className="r-f-sub">Sign in to your workspace</div>
              {error && <div className="r-err">{error}</div>}
              <div className="r-field">
                <label className="r-lbl">Email</label>
                <input type="email" className="r-inp" placeholder="you@company.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />
              </div>
              <div className="r-field">
                <label className="r-lbl">Password</label>
                <div className="r-pw-wrap">
                  <input type={showPw ? 'text' : 'password'} className="r-inp" placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    style={{ paddingRight: 42 }} />
                  <button type="button" className="r-pw-btn" onClick={() => setShowPw(!showPw)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {showPw ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
                    </svg>
                  </button>
                </div>
              </div>
              <div className="r-field">
                <label className="r-lbl">Role</label>
                <select className="r-inp" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="hiring_manager">Hiring Manager</option>
                  <option value="senior_recruiter">Senior Recruiter</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="coordinator">Coordinator</option>
                </select>
              </div>
              <button className="r-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>
              <div className="r-divider"><div className="r-divider-line"/><span>or</span><div className="r-divider-line"/></div>
              <button className="r-sso">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: .5 }}><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                Continue with SSO
              </button>
              <div className="r-reg">Don't have an account? <a href="/register">Create one →</a></div>
              <div className="r-demo">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                <span>Demo: test@taltas.ai / TestPass123!</span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="r-ft">
          <div className="r-ft-top">
            <div>
              <div className="r-ft-logo">Tal<span>tas</span></div>
              <div className="r-ft-atlas">Talent Atlas</div>
              <div className="r-ft-social">
                <a href="#" aria-label="LinkedIn"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg></a>
                <a href="#" aria-label="X"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
              </div>
            </div>
            <div className="r-ft-col">
              <div className="r-ft-col-head">Product</div>
              <a href="/info/changelog">Explorer Agents</a>
              <a href="/info/changelog">Deep Match Scoring</a>
              <a href="/info/changelog">Sentiment Maps</a>
              <a href="/info/insights">Pipeline Analytics</a>
              <a href="/info/changelog">Integrations</a>
              <a href="/info/changelog">Changelog</a>
            </div>
            <div className="r-ft-col">
              <div className="r-ft-col-head">Resources</div>
              <a href="/info/papers">Documentation</a>
              <a href="/info/insights">Insights &amp; Reports</a>
              <a href="/info/papers">Research Papers</a>
              <a href="/info/casestudies">Case Studies</a>
              <a href="/info/presskit">Press Kit</a>
              <a href="/info/blog">Blog</a>
            </div>
            <div className="r-ft-col">
              <div className="r-ft-col-head">Support</div>
              <a href="/info/helpcenter">Help Center</a>
              <a href="/info/apiref">API Reference</a>
              <a href="/info/status">Status</a>
              <a href="/info/contact">Contact Us</a>
            </div>
            <div className="r-ft-col">
              <div className="r-ft-col-head">Company</div>
              <a href="/info/about">About</a>
              <a href="/info/careers">Careers</a>
              <a href="/info/partners">Partners</a>
              <a href="/info/security">Security</a>
              <a href="/info/investors">Investors</a>
            </div>
          </div>
          <div className="r-ft-bottom">
            <div className="r-ft-copy">© 2026 Taltas Inc. All rights reserved.</div>
            <div className="r-ft-legal">
              <a href="/info/privacy">Privacy Policy</a><a href="/info/terms">Terms of Service</a>
              <a href="/info/cookie">Cookie Policy</a><a href="/info/gdpr">GDPR</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
