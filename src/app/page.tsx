<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Taltas — Recruiter Portal</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --blue:#1a56db;--blue-dark:#1240a8;--blue-bg:rgba(26,86,219,0.07);--blue-border:rgba(26,86,219,0.18);
  --text:#0d1b3e;--text-dim:#4a5a7a;--muted:#9aaac8;--border:rgba(30,60,120,0.1);
  --font-display:'Cormorant Garamond',Georgia,serif;--font-mono:'DM Mono',monospace;--font-body:'DM Sans',sans-serif;
}
html,body{min-height:100%;margin:0}
body{font-family:var(--font-body);background:#fff;display:flex;flex-direction:column}

/* ── SPLIT ── */
.wrap{display:grid;grid-template-columns:1fr 460px;min-height:100vh;flex:1}

/* LEFT */
.left{position:relative;display:flex;flex-direction:column;justify-content:center;padding:72px 68px;overflow:hidden;background:#fff}
.li{position:relative;z-index:2}
.brand{font-family:var(--font-display);font-size:48px;font-weight:700;letter-spacing:-1px;color:var(--text);margin-bottom:12px;line-height:1}
.brand span{color:var(--blue)}
.brand-tag{font-family:var(--font-mono);font-size:13px;color:var(--muted);letter-spacing:0.18em;text-transform:uppercase;margin-bottom:48px}
.eyebrow{font-family:var(--font-mono);font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:var(--blue);margin-bottom:14px;display:flex;align-items:center;gap:10px}
.eyebrow::before{content:'';width:20px;height:1px;background:var(--blue)}
.headline{font-family:var(--font-display);font-size:clamp(34px,3.8vw,54px);font-weight:600;letter-spacing:-2px;line-height:1.0;color:var(--text);margin-bottom:10px}
.headline em{font-style:italic;color:var(--blue)}
.sub{font-size:14px;color:var(--text-dim);line-height:1.7;font-weight:300;max-width:100%;margin-bottom:44px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:12px;overflow:hidden;max-width:100%;margin-bottom:44px}
.stat{background:#fff;padding:18px 20px}
.stat-num{font-family:var(--font-display);font-size:32px;font-weight:600;letter-spacing:-1px;color:var(--blue);line-height:1;margin-bottom:3px}
.stat-label{font-family:var(--font-mono);font-size:9px;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;line-height:1.4}
.steps{display:flex;flex-direction:column;max-width:100%}
.step{display:flex;gap:16px;padding:13px 0;border-bottom:1px solid var(--border)}
.step:first-child{border-top:1px solid var(--border)}
.s-letter{width:26px;height:26px;border-radius:50%;background:var(--blue-bg);border:1px solid var(--blue-border);color:var(--blue);font-family:var(--font-mono);font-size:9px;font-weight:500;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px}
.s-title{font-size:12px;font-weight:500;color:var(--text);margin-bottom:2px}
.s-desc{font-size:11px;color:var(--text-dim);line-height:1.5}

/* RIGHT */
.right{background:#1a56db;display:flex;flex-direction:column;justify-content:center;padding:56px 48px;position:relative;overflow:hidden}
.right::before{content:'';position:absolute;top:-80px;right:-80px;width:300px;height:300px;border-radius:50%;background:rgba(255,255,255,.04);pointer-events:none}
.right::after{content:'';position:absolute;bottom:-60px;left:-60px;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,.03);pointer-events:none}
.ri{position:relative;z-index:1}
.f-brand-link{text-decoration:none;display:inline-block}
.f-brand{font-family:var(--font-display);font-size:48px;font-weight:700;color:#fff;letter-spacing:-.5px;margin-bottom:0;display:inline-block}
.f-brand-row{display:flex;align-items:center;gap:12px;margin-bottom:4px}
.f-talent-atlas{font-family:var(--font-mono);font-size:13px;color:rgba(255,255,255,.5);letter-spacing:.18em;text-transform:uppercase}
.f-brand span{color:rgba(255,255,255,.55)}
.f-tag{font-family:var(--font-mono);font-size:9px;color:rgba(255,255,255,.4);letter-spacing:.18em;text-transform:uppercase;margin-bottom:28px;margin-top:8px}
.f-title{font-family:var(--font-display);font-size:24px;font-weight:500;color:#fff;margin-bottom:5px;letter-spacing:-.5px}
.f-sub{font-size:12px;color:rgba(255,255,255,.5);margin-bottom:24px}
.field{margin-bottom:14px}
.lbl{display:block;font-family:var(--font-mono);font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.45);margin-bottom:5px}
.inp{width:100%;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:10px;padding:11px 15px;font-size:13px;color:#fff;font-family:var(--font-body);outline:none;transition:border-color .2s,background .2s}
.inp::placeholder{color:rgba(255,255,255,.3)}
.inp:focus{border-color:rgba(255,255,255,.45);background:rgba(255,255,255,.14)}
.inp option{background:#1a56db;color:#fff}
.btn{width:100%;padding:13px;background:#fff;color:var(--blue);border:none;border-radius:10px;font-family:var(--font-mono);font-size:12px;font-weight:500;letter-spacing:.08em;cursor:pointer;margin-top:6px;transition:all .2s}
.btn:hover{background:rgba(255,255,255,.92);transform:translateY(-1px);box-shadow:0 8px 24px rgba(0,0,0,.15)}
.divider{display:flex;align-items:center;gap:10px;margin:16px 0}
.divider-line{flex:1;height:1px;background:rgba(255,255,255,.12)}
.divider span{font-family:var(--font-mono);font-size:9px;color:rgba(255,255,255,.3);letter-spacing:.1em;text-transform:uppercase}
.sso{width:100%;padding:11px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:10px;color:rgba(255,255,255,.65);font-family:var(--font-mono);font-size:11px;letter-spacing:.06em;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s}
.sso:hover{background:rgba(255,255,255,.13);color:#fff}
.reg{text-align:center;margin-top:18px;font-size:12px;color:rgba(255,255,255,.4)}
.reg a{color:rgba(255,255,255,.75);text-decoration:none;font-weight:500}
.demo{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:12px;padding:6px 14px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:8px}
.demo span{font-family:var(--font-mono);font-size:9px;color:rgba(255,255,255,.3);letter-spacing:.05em}

/* ── FOOTER ── */
.ft{background:#0f172a;border-top:1px solid rgba(255,255,255,.06);width:100%}
.ft-top{max-width:1200px;margin:0 auto;padding:64px 48px 48px;display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr;gap:48px}
.ft-logo{font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#fff;margin-bottom:14px;cursor:pointer}
.ft-logo span{color:#2563eb}
.ft-tagline{font-size:13px;color:#cbd5e1;line-height:1.7;max-width:220px;margin-bottom:24px}
.ft-social{display:flex;gap:10px}
.ft-social a{width:32px;height:32px;border-radius:8px;border:1px solid rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center;color:#e2e8f0;text-decoration:none;transition:all .2s}
.ft-social a:hover{border-color:#2563eb;color:#2563eb;background:rgba(37,99,235,.1)}
.ft-col-head{font-family:'Space Mono','Roboto Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.7);margin-bottom:18px}
.ft-col a{display:block;font-size:13px;color:#94a3b8;text-decoration:none;margin-bottom:10px;transition:color .15s}
.ft-col a:hover{color:#e2e8f0}
.ft-bottom{max-width:1200px;margin:0 auto;padding:22px 48px;border-top:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.ft-copy{font-family:'Space Mono','Roboto Mono',monospace;font-size:10px;color:#e2e8f0;letter-spacing:.04em}
.ft-legal{display:flex;gap:24px;flex-wrap:wrap}
.ft-legal a{font-family:'Space Mono','Roboto Mono',monospace;font-size:10px;color:#e2e8f0;letter-spacing:.04em;text-decoration:none;transition:color .15s}
.ft-legal a:hover{color:#94a3b8}
</style>
</head>
<body>

<div class="wrap">
  <!-- LEFT: Value prop with canvas -->
  <div class="left">
    <div class="li">
      <div class="brand">Tal<span>tas</span></div>
      <div class="brand-tag">Talent Atlas</div>
      <div class="eyebrow">Explorer Agent</div>
      <h1 class="headline">Your next great hire<br>is already in<br><em>your pipeline.</em></h1>
      <p class="sub">Taltas deploys AI Explorer agents that interview every candidate, score on 6 fit dimensions, and surface the hidden gems your ATS would have rejected. Agents do the groundwork. You make every call.</p>
      <div class="stats">
        <div class="stat"><div class="stat-num">91%</div><div class="stat-label">Candidate quality rate with Explorer screening</div></div>
        <div class="stat"><div class="stat-num">34%</div><div class="stat-label">Higher offer rate vs ATS-only screening</div></div>
        <div class="stat"><div class="stat-num">24/7</div><div class="stat-label">Autonomous screening — no recruiter required</div></div>
      </div>
      <div class="steps">
        <div class="step"><div class="s-letter">01</div><div><div class="s-title">Create an Explorer</div><div class="s-desc">Paste in your job description, set evaluation focus, and choose your ATS. Your Explorer is trained in seconds and ready to interview.</div></div></div>
        <div class="step"><div class="s-letter">02</div><div><div class="s-title">Explorer screens every applicant</div><div class="s-desc">Every inbound candidate has a real conversation with your Explorer — scored and sentiment-mapped, 24 hours a day.</div></div></div>
        <div class="step"><div class="s-letter">03</div><div><div class="s-title">You review a ranked shortlist</div><div class="s-desc">Open your dashboard to Deep Match scores, sentiment maps, and recruiter-ready profiles. Advance the ones you want.</div></div></div>
      </div>
    </div>
  </div>

  <!-- RIGHT: Login form -->
  <div class="right">
    <div class="ri">
      <a href="https://taltas.ai" class="f-brand-link"><div class="f-brand">Tal<span>tas</span></div></a>
      <div class="f-brand-row"><span class="f-talent-atlas">Talent Atlas</span></div>
      <div class="f-tag">Recruiter Portal</div>
      <div class="f-title">Welcome back</div>
      <div class="f-sub">Sign in to your workspace</div>
      <div class="field"><label class="lbl">Email</label><input class="inp" type="email" placeholder="you@company.com"></div>
      <div class="field"><label class="lbl">Password</label><input class="inp" type="password" placeholder="••••••••"></div>
      <div class="field">
        <label class="lbl">Role</label>
        <select class="inp">
          <option>Hiring Manager</option>
          <option selected>Senior Recruiter</option>
          <option>Recruiter</option>
          <option>Coordinator</option>
        </select>
      </div>
      <button class="btn">Sign In →</button>
      <div class="divider"><div class="divider-line"></div><span>or</span><div class="divider-line"></div></div>
      <button class="sso">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:.5"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
        Continue with SSO
      </button>
      <div class="reg">Don't have an account? <a href="#">Create one →</a></div>
      <div class="demo"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg><span>Demo: <a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="f387968087b387929f879280dd929a">[email&#160;protected]</a> / TestPass123!</span></div>
    </div>
  </div>
</div>

<!-- FOOTER -->
<footer class="ft">
  <div class="ft-top">
    <div>
      <div class="ft-logo">Tal<span>tas</span></div>
      <p class="ft-tagline">Recruitment Intelligence Platform.<br>AI-native hiring, built for the people who care about quality.</p>
      <div class="ft-social">
        <a href="#" aria-label="LinkedIn"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg></a>
        <a href="#" aria-label="X"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
      </div>
    </div>
    <div class="ft-col"><div class="ft-col-head">Product</div><a href="#">Explorer Agents</a><a href="#">Deep Match Scoring</a><a href="#">Sentiment Maps</a><a href="#">Pipeline Analytics</a><a href="#">Integrations</a><a href="#">Changelog</a></div>
    <div class="ft-col"><div class="ft-col-head">Resources</div><a href="#">Documentation</a><a href="#">Insights & Reports</a><a href="#">Research Papers</a><a href="#">Case Studies</a><a href="#">Press Kit</a><a href="#">Blog</a></div>
    <div class="ft-col"><div class="ft-col-head">Support</div><a href="#">Help Center</a><a href="#">API Reference</a><a href="#">Status</a><a href="#">Community</a><a href="#">Contact Us</a></div>
    <div class="ft-col"><div class="ft-col-head">Company</div><a href="#">About</a><a href="#">Careers</a><a href="#">Partners</a><a href="#">Security</a><a href="#">Investors</a></div>
  </div>
  <div class="ft-bottom">
    <div class="ft-copy">© 2026 Taltas Inc. All rights reserved.</div>
    <div class="ft-legal"><a href="#">Privacy Policy</a><a href=