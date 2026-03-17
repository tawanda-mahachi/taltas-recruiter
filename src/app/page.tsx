// @ts-nocheck
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';

import { SiteFooter } from '@/components/shared/site-footer';

const INTEGRATIONS = ['Greenhouse', 'Lever', 'Workday', 'Bullhorn', 'BambooHR', 'Rippling', 'LinkedIn', 'Indeed'];

const FEATURES = [
  { name: 'Explorer Agents', desc: 'AI agents trained on your job description conduct real conversations with every applicant — probing skills, motivations, and culture fit automatically.', icon: 'agent' },
  { name: 'Deep Match Scoring', desc: 'Scores every candidate across 6 fit dimensions using behavioral signals from conversation — surfacing hidden gems traditional ATS misses.', icon: 'star' },
  { name: 'Sentiment Maps', desc: 'Visual breakdowns of every conversation — topic heatmaps, sentiment timelines, and key exchange moments — so you know exactly why a candidate scored the way they did.', icon: 'map' },
  { name: 'Agent-to-Agent Negotiation', desc: "When a candidate brings their own AI agent, Taltas negotiates directly — aligning on timeline, compensation, and expectations. The decision is always yours.", icon: 'a2a' },
  { name: 'Pipeline Analytics', desc: 'Funnel conversion, stage velocity, source quality scores, and bottleneck detection — everything you need to know about your hiring health in one view.', icon: 'chart' },
  { name: 'Auto-Reject & Advance', desc: "Set thresholds once. Below the bar gets a personalised rejection letter. Top candidates are advanced before you've had your morning coffee.", icon: 'check' },
];

const STEPS = [
  { num: '01', title: 'Create an Explorer', desc: 'Paste in your job description, set the evaluation focus, and choose your ATS. Your Explorer agent is trained in seconds and ready to interview candidates.' },
  { num: '02', title: 'Explorer screens every applicant', desc: 'Every inbound candidate has a real conversation with your Explorer. It probes, scores, and generates a full sentiment map — 24 hours a day, no recruiter involved.' },
  { num: '03', title: 'You review a ranked shortlist', desc: 'Open your dashboard to a ranked list with Deep Match scores, sentiment maps, and recruiter-ready profiles. Advance the ones you want. The rest are handled automatically.' },
];

function FeatureIcon({ type }: { type: string }) {
  const s = { width: 36, height: 36, fill: 'none', stroke: '#4f46e5', strokeWidth: 1.5 };
  switch (type) {
    case 'agent': return <svg {...s} viewBox="0 0 36 36"><circle cx="18" cy="12" r="6"/><path d="M6 30c0-6.627 5.373-12 12-12s12 5.373 12 12"/><circle cx="28" cy="10" r="3"/><path d="M33 10h-2M28 7v-2M25.5 7.5l-1.5-1.5"/></svg>;
    case 'star': return <svg {...s} viewBox="0 0 36 36"><polygon points="18,4 22,14 33,14 24,21 27,32 18,25 9,32 12,21 3,14 14,14"/></svg>;
    case 'map': return <svg {...s} viewBox="0 0 36 36"><rect x="4" y="8" width="28" height="20" rx="3"/><path d="M4 14h28M10 20h4M10 24h8"/></svg>;
    case 'a2a': return <svg {...s} viewBox="0 0 36 36"><path d="M10 18c0-4.418 3.582-8 8-8s8 3.582 8 8"/><circle cx="10" cy="18" r="4"/><circle cx="26" cy="18" r="4"/><path d="M14 18h8"/></svg>;
    case 'chart': return <svg {...s} viewBox="0 0 36 36"><polyline points="4,26 12,16 18,20 26,10 32,14"/><line x1="4" y1="32" x2="32" y2="32"/></svg>;
    case 'check': return <svg {...s} viewBox="0 0 36 36"><polyline points="6,18 12,24 30,10"/><circle cx="18" cy="18" r="14"/></svg>;
    default: return null;
  }
}

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [revealSet, setRevealSet] = useState(new Set<number>());
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Only redirect if user is genuinely logged in AND has a valid token
  useEffect(() => {
    if (mounted && user?.token) router.replace('/dashboard');
  }, [mounted]);

  // Hero canvas constellation animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let W: number, H: number, animId: number;
    const N = 80, CONN = 130;
    const nodeColors = ['rgba(55,48,163,0.69)', 'rgba(67,56,202,0.69)', 'rgba(49,46,129,0.69)', 'rgba(79,70,229,0.63)'];
    let pts: Array<{ x: number; y: number; vx: number; vy: number }> = [];

    function resize() {
      W = canvas!.width = canvas!.offsetWidth;
      H = canvas!.height = canvas!.offsetHeight;
    }
    function mkPts() {
      pts = Array.from({ length: N }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
      }));
    }
    function draw() {
      ctx!.clearRect(0, 0, W, H);
      for (let i = 0; i < N; i++) {
        const p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx!.fillStyle = nodeColors[i % nodeColors.length];
        ctx!.fill();
        for (let j = i + 1; j < N; j++) {
          const q = pts[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < CONN) {
            ctx!.beginPath();
            ctx!.moveTo(p.x, p.y);
            ctx!.lineTo(q.x, q.y);
            ctx!.strokeStyle = `rgba(55,48,163,${(1 - d / CONN) * 0.40})`;
            ctx!.lineWidth = 1;
            ctx!.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    }
    resize(); mkPts(); draw();
    const onResize = () => { resize(); mkPts(); };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(animId); };
  }, []);

  // Nav scroll class
  useEffect(() => {
    const onScroll = () => { navRef.current?.classList.toggle('scrolled', window.scrollY > 40); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Reveal on scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.lp-reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const goLogin = () => router.push('/login');
  const goRegister = () => router.push('/register');
  const smoothScroll = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); };

  return (
    <div className="landing-page">
      {/* NAV */}
      <nav ref={navRef} className="lp-nav">
        <div className="lp-nav-logo" style={{ cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Tal<span style={{ color: '#4f46e5' }}>tas</span></div>
        <div className="lp-nav-links">
          <button className="lp-nav-link" onClick={() => smoothScroll('lp-features')}>Features</button>
          <button className="lp-nav-link" onClick={() => smoothScroll('lp-how')}>How it works</button>
          <button className="lp-nav-link" onClick={() => smoothScroll('lp-integrations')}>Integrations</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="lp-nav-link" onClick={goLogin}>Sign in</button>
          <button className="lp-nav-cta" onClick={goRegister}>Get started</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <canvas ref={canvasRef} className="lp-hero-canvas" />
        <div className="lp-hero-inner">
          <div className="lp-hero-label">Recruitment Intelligence</div>
          <h1 className="hero-h1">Your next great hire<br/>is already in your pipeline.</h1>
          <p className="lp-hero-sub">Taltas deploys AI Explorer agents that interview candidates, score on 6 fit dimensions, and surface the hidden gems your ATS would have rejected.</p>
          <div className="lp-hero-actions">
            <button className="lp-btn-primary" onClick={goRegister}>
              Start free trial
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button className="lp-btn-ghost" onClick={goLogin}>
              Sign in
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
        <div className="lp-hero-scroll">
          <div className="lp-scroll-line" />
          Scroll
        </div>
      </section>

      {/* STATS */}
      <div className="lp-stats-band">
        {[
          { num: '91', unit: '%', label: 'Candidate quality rate with Explorer screening' },
          { num: '34', unit: '%', label: 'Higher offer rate vs ATS-only screening' },
          { num: '24', unit: '/7', label: 'Autonomous screening — no recruiter required' },
        ].map((s, i) => (
          <div key={i} className={`lp-stat-cell lp-reveal ${i > 0 ? `lp-reveal-d${i}` : ''}`}>
            <div className="lp-stat-num">{s.num}<span>{s.unit}</span></div>
            <div className="lp-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <section className="lp-section" id="lp-features">
        <div className="lp-section-eyebrow lp-reveal">What Taltas does</div>
        <h2 className="lp-section-title lp-reveal">Recruiting,<br/>fully automated.</h2>
        <div className="lp-features-grid">
          {FEATURES.map((f, i) => (
            <div key={f.name} className={`lp-feature-card lp-reveal ${i % 3 > 0 ? `lp-reveal-d${i % 3}` : ''}`}>
              <div className="lp-feature-icon"><FeatureIcon type={f.icon} /></div>
              <div className="lp-feature-name">{f.name}</div>
              <p className="lp-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="lp-how-section" id="lp-how">
        <div className="lp-how-inner">
          <div className="lp-section-eyebrow lp-reveal" style={{ color: 'rgba(255,255,255,.55)' }}>How it works</div>
          <h2 className="lp-section-title lp-reveal" style={{ color: '#fff' }}>Three steps<br/>to a shortlist.</h2>
          <div className="lp-steps">
            {STEPS.map((s, i) => (
              <div key={s.num} className={`lp-reveal ${i > 0 ? `lp-reveal-d${i}` : ''}`}>
                <div className="lp-step-num">{s.num}</div>
                <div className="lp-step-title">{s.title}</div>
                <p className="lp-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PULL QUOTE */}
      <div style={{ borderTop: '1px solid rgba(0,0,0,.07)' }}>
        <div className="lp-quote-section lp-reveal">
          <div>
            <div className="quote-text">&ldquo;The best candidate isn&apos;t always the most obvious one.&rdquo;</div>
            <div className="lp-quote-attr">The problem Taltas was built to solve</div>
          </div>
        </div>
      </div>

      {/* INTEGRATIONS */}
      <section id="lp-integrations" style={{ padding: '80px 0', textAlign: 'center', overflow: 'hidden', borderTop: '1px solid rgba(0,0,0,.07)' }}>
        <div className="lp-section-eyebrow lp-reveal" style={{ marginBottom: 36 }}>Works with your stack</div>
        <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 120, background: 'linear-gradient(to right,#fafbfd,transparent)', zIndex: 2, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 120, background: 'linear-gradient(to left,#fafbfd,transparent)', zIndex: 2, pointerEvents: 'none' }} />
          <div className="lp-ticker-wrap">
            <div className="lp-ticker-track">
              {[...INTEGRATIONS, ...INTEGRATIONS].map((name, i) => (
                <div key={i} className="lp-ticker-item">
                  <div style={{ width: 24, height: 24, borderRadius: 5, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#2563eb', fontWeight: 700 }}>{name[0]}</div>
                  <span className="lp-ticker-name">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta-section">
        <h2 className="cta-title lp-reveal">Stop filtering on keywords.<br/>Start finding people who thrive.</h2>
        <p className="lp-cta-sub lp-reveal">No credit card required · Company email only · Cancel anytime</p>
        <button className="lp-btn-primary lp-reveal" onClick={goRegister} style={{ fontSize: 12, padding: '16px 36px', background: '#fff', color: '#0f172a' }}>
          Get started free
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </section>

      {/* FOOTER */}
      <SiteFooter variant="full" />
    </div>
  );
}

