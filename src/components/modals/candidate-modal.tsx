// @ts-nocheck
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { MockCandidate } from '@/lib/mock-data';
import { IconX, IconBot, IconHandshake, IconZap, IconClipboard, IconMessageCircle } from '@/components/icons';

/* ── Per-candidate timeline data (3-band: pos/neu/neg) ── */
type TLPoint = { s: 'pos' | 'neu' | 'neg'; label: string; sig?: string };
const TIMELINES: Record<string, TLPoint[]> = {
  'sara-kim': [
    { s: 'neu', label: 'Intro' }, { s: 'pos', label: 'Stack exp', sig: '✓ Skills +0.94' },
    { s: 'pos', label: 'Scale work', sig: '✓ Domain +0.88' }, { s: 'pos', label: 'Remote pref', sig: '✓ Culture' },
    { s: 'neu', label: 'Team size' }, { s: 'pos', label: 'Roadmap Q', sig: '⭐ High Interest' },
    { s: 'neg', label: 'Comp ask', sig: '⚠ Comp gap' }, { s: 'pos', label: 'Growth plan', sig: '+ Value Add' },
    { s: 'pos', label: 'Closing' },
  ],
  'marcus-p': [
    { s: 'pos', label: 'Intro', sig: '✓ Culture' }, { s: 'pos', label: 'Leadership', sig: '✓ Skills +0.99' },
    { s: 'pos', label: 'Scale exp', sig: '✓ Domain' }, { s: 'pos', label: 'Architecture' },
    { s: 'pos', label: 'Ownership', sig: '⭐ Interest' }, { s: 'neg', label: 'Comp offer', sig: '⚠ Risk' },
    { s: 'pos', label: 'Decision' }, { s: 'pos', label: 'Comp discuss' }, { s: 'pos', label: 'Closing' },
  ],
  'aiko-j': [
    { s: 'pos', label: 'Intro', sig: '✓ Culture' }, { s: 'pos', label: 'Community', sig: '+ Value Add' },
    { s: 'neu', label: 'Tool exp' }, { s: 'pos', label: 'OSS contrib', sig: '✓ Growth +0.91' },
    { s: 'pos', label: 'Speaking', sig: '⭐ Interest' }, { s: 'neg', label: 'Tool gap', sig: '⚠ Skills gap' },
    { s: 'pos', label: 'Learn pace', sig: '✓ Fast Learner' }, { s: 'pos', label: 'Closing' },
  ],
};
function getTimeline(id: string, score: number): TLPoint[] {
  if (TIMELINES[id]) return TIMELINES[id];
  const topics = ['Intro', 'Skills', 'Domain', 'Culture', 'Team fit', 'Growth', 'Comp', 'Closing'];
  return topics.map((label, i) => {
    const s: TLPoint['s'] = i === 0 ? 'neu' : i === 6 && score < 85 ? 'neg' : score + (Math.sin(i) * 15) > 75 ? 'pos' : 'neu';
    const sig = s === 'pos' && i > 0 && i < 6 ? `✓ ${label} +${(0.7 + score / 300).toFixed(2)}` : s === 'neg' ? '⚠ Risk' : undefined;
    return { s, label, sig };
  });
}

/* ── Per-candidate heatmap data (numeric scores) ── */
type HMRow = { topic: string; exp: number; cand: number; verdict: string };
function getHeatmap(id: string, score: number): HMRow[] {
  const base: Record<string, HMRow[]> = {
    'sara-kim': [
      { topic: 'Tech Stack', exp: 88, cand: 94, verdict: 'Strong Alignment' },
      { topic: 'Collaboration', exp: 75, cand: 82, verdict: 'Alignment' },
      { topic: 'Ambiguity', exp: 70, cand: 76, verdict: 'Alignment' },
      { topic: 'Compensation', exp: 55, cand: 62, verdict: 'Moderate Risk' },
      { topic: 'Growth Mindset', exp: 80, cand: 85, verdict: 'Strong Alignment' },
    ],
    'marcus-p': [
      { topic: 'Tech Stack', exp: 95, cand: 99, verdict: 'Strong Alignment' },
      { topic: 'Leadership', exp: 90, cand: 95, verdict: 'Strong Alignment' },
      { topic: 'Ambiguity', exp: 85, cand: 91, verdict: 'Strong Alignment' },
      { topic: 'Compensation', exp: 74, cand: 78, verdict: 'Alignment' },
      { topic: 'Growth Mindset', exp: 82, cand: 88, verdict: 'Strong Alignment' },
    ],
  };
  if (base[id]) return base[id];
  return [
    { topic: 'Tech Stack', exp: Math.round(score * 0.9), cand: Math.round(score * 0.95), verdict: score > 80 ? 'Strong Alignment' : 'Alignment' },
    { topic: 'Communication', exp: Math.round(score * 0.82), cand: Math.round(score * 0.88), verdict: score > 75 ? 'Alignment' : 'Moderate Gap' },
    { topic: 'Leadership', exp: Math.round(score * 0.78), cand: Math.round(score * 0.85), verdict: score > 80 ? 'Alignment' : 'Moderate Gap' },
    { topic: 'Compensation', exp: Math.round(score * 0.65), cand: Math.round(score * 0.7), verdict: score > 85 ? 'Alignment' : 'Moderate Risk' },
    { topic: 'Growth Mindset', exp: Math.round(score * 0.85), cand: Math.round(score * 0.9), verdict: score > 75 ? 'Strong Alignment' : 'Alignment' },
  ];
}

function scoreColor(s: number) {
  if (s >= 80) return { bg: 'rgba(22,163,74,.1)', fg: '#16a34a' };
  if (s >= 65) return { bg: 'rgba(37,99,235,.08)', fg: '#2563eb' };
  if (s >= 50) return { bg: 'rgba(234,88,12,.08)', fg: '#ea580c' };
  return { bg: 'rgba(220,38,38,.1)', fg: '#dc2626' };
}

/* ── Standardized fit dimensions (synced with design) ── */
const FIT_DIMS = [
  { key: 'technical', label: 'Role Skills', req: 0.85 },
  { key: 'domain', label: 'Domain Know.', req: 0.80 },
  { key: 'culture', label: 'Culture/Values', req: 0.75 },
  { key: 'growth', label: 'Growth Velocity', req: 0.70 },
  { key: 'constraints', label: 'Constraints', req: 0.75 },
  { key: 'valueadd', label: 'Value Add', req: 0.80 },
] as const;

/* Deterministic seeded hash from candidate id → stable per-dimension scores */
function seedHash(id: string, dim: number): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  return Math.abs((h * (dim + 7) * 2654435761) % 1000) / 1000;
}

function getCandidateDimScores(id: string, baseScore: number): Record<string, number> {
  const out: Record<string, number> = {};
  FIT_DIMS.forEach((d, i) => {
    const jitter = seedHash(id, i) * 20 - 10;  // ±10 range
    const raw = baseScore + jitter;
    out[d.key] = Math.max(30, Math.min(99, Math.round(raw)));
  });
  return out;
}

function dimColor(score: number): string {
  if (score >= 80) return '#16a34a';
  if (score >= 65) return '#2563eb';
  if (score >= 50) return '#ea580c';
  return '#dc2626';
}

/* ── Conversation data ── */
const CONV: Record<string, Array<{ type: string; speaker: string; text: string; moment?: boolean; label?: string }>> = {
  'sara-kim': [
    { type: 'agent', speaker: 'StaffML-Agent', text: "Hi Sara! I'm the screening agent for the Staff ML Engineer position. Could you tell me about your experience building ML platforms at scale?" },
    { type: 'cand', speaker: 'Sara Kim', text: "At Figma, I led the team that rebuilt our recommendation engine from scratch — real-time inference serving 40M+ users with p99 latency under 50ms.", moment: true, label: 'High' },
    { type: 'b2b', speaker: 'StaffML-Agent → CultureBot', text: "Candidate has deep PLG experience aligning with our product-led motion." },
    { type: 'agent', speaker: 'StaffML-Agent', text: "How do you approach building consensus across engineering and product teams?" },
    { type: 'cand', speaker: 'Sara Kim', text: "Data-driven prioritization combined with empathy. At Figma, we created a shared metrics dashboard.", moment: true, label: 'High' },
    { type: 'agent', speaker: 'StaffML-Agent', text: "Our team is exploring RLHF techniques. What's your experience?" },
    { type: 'cand', speaker: 'Sara Kim', text: "Deeply involved since 2023. We implemented a custom reward model that reduced harmful content surfacing by 73%." },
  ],
  'marcus-p': [
    { type: 'agent', speaker: 'PrincipalEng-Agent', text: "Marcus, can you walk me through a critical architecture decision under pressure?" },
    { type: 'cand', speaker: 'Marcus Peterson', text: "At Stripe, during a peak traffic event, I implemented circuit breakers and graceful degradation in real-time. 99.97% uptime during 3x spike.", moment: true, label: 'High' },
    { type: 'b2b', speaker: 'PrincipalEng-Agent → CTOBot', text: "Competing offer deadline Friday. Recommend expediting recruiter review." },
    { type: 'agent', speaker: 'PrincipalEng-Agent', text: "How do you approach mentoring senior engineers?" },
    { type: 'cand', speaker: 'Marcus Peterson', text: "Leading by example and blameless culture. I introduced ADRs that democratized technical decisions.", moment: true, label: 'High' },
  ],
};

/* ── Resume data ── */
const RESUME: Record<string, { summary: string; skills: string[]; experience: Array<{ role: string; company: string; dates: string; desc: string }>; education: Array<{ role: string; company: string; dates: string; desc: string }>; certs?: string[] }> = {
  'sara-kim': { summary: "Strategic PM with 8+ years building 0→1 B2B SaaS products.", experience: [{ role: 'Senior Product Manager', company: 'Figma', dates: '2021 – Present', desc: 'Led 0→1 enterprise dashboard. 3x ARR growth via PLG.' }, { role: 'Product Manager II', company: 'Notion', dates: '2019 – 2021', desc: 'Workspace collaboration for 4M users. TTV -40%.' }, { role: 'Associate PM', company: 'Dropbox', dates: '2017 – 2019', desc: 'Sharing & permissions overhaul.' }], education: [{ role: 'B.S. Computer Science', company: 'Carnegie Mellon', dates: '2013 – 2017', desc: "Dean's List, 3.9 GPA." }], skills: ['Product Strategy', 'PLG', 'B2B SaaS', 'SQL', 'Figma', 'A/B Testing'], certs: ['Certified Product Manager — Product School (2020)', 'Google Analytics IQ — Google (2022)'] },
  'marcus-p': { summary: "Engineering leader scaling distributed systems at fintech scale.", experience: [{ role: 'EM, Payments Infra', company: 'Stripe', dates: '2020 – Present', desc: 'Team 6→28. Ledger system $500B+ at 99.99% uptime.' }, { role: 'Senior SWE', company: 'Stripe', dates: '2018 – 2020', desc: 'Payment routing engine. Event-driven arch, latency -60%.' }, { role: 'SWE', company: 'Square', dates: '2015 – 2018', desc: 'PCI DSS Level 1 compliance.' }], education: [{ role: 'M.S. Distributed Systems', company: 'Georgia Tech', dates: '2013 – 2015', desc: '' }, { role: 'B.S. Computer Engineering', company: 'UC San Diego', dates: '2009 – 2013', desc: '' }], skills: ['Distributed Systems', 'Go', 'Kafka', 'Postgres', 'AWS', 'System Design'], certs: ['AWS SA Professional — Amazon (2021)', 'CKA — CNCF (2022)', 'GCP Data Engineer — Google (2023)'] },
  'aiko-j': { summary: "Staff ML Engineer. RLHF and LLM fine-tuning. GPT-4 alignment.", experience: [{ role: 'Staff ML Engineer', company: 'OpenAI', dates: '2021 – Present', desc: 'Core RLHF pipeline for GPT-4.' }, { role: 'Research Scientist', company: 'DeepMind', dates: '2019 – 2021', desc: '2 NeurIPS papers.' }, { role: 'ML Engineer', company: 'Google Brain', dates: '2017 – 2019', desc: 'TPU optimization +35%.' }], education: [{ role: 'Ph.D. Machine Learning', company: 'Stanford', dates: '2012 – 2017', desc: 'Meta-learning.' }], skills: ['RLHF', 'PyTorch', 'JAX', 'Python', 'Reward Modeling'], certs: ['Deep Learning Specialisation — Coursera (2019)'] },
};

function getResume(id: string, c: MockCandidate) {
  if (RESUME[id]) return RESUME[id];
  return { summary: `${c.title} at ${c.company}.`, experience: [{ role: c.title, company: c.company, dates: '2021 – Present', desc: '' }], education: [{ role: 'Degree', company: 'University', dates: '', desc: '' }], skills: c.tags, certs: [] };
}

interface Props { open: boolean; onClose: () => void; candidate: MockCandidate | null; }

export function CandidateModal({ open, onClose, candidate }: Props) {
  const [tab, setTab] = useState<'overview' | 'resume' | 'sentmap' | 'materials'>('overview');
  const [stage, setStage] = useState('');
  const [prevId, setPrevId] = useState<string | null>(null);
  const toast = useToast();
  const router = useRouter();

  // Reset to overview when candidate changes
  if (candidate && candidate.id !== prevId) {
    setPrevId(candidate.id);
    if (tab !== 'overview') setTab('overview');
  }

  if (!candidate) return null;
  const c = candidate;
  const conv = CONV[c.id] || [];
  const resume = getResume(c.id, c);
  const timeline = getTimeline(c.id, c.score);
  const heatmap = getHeatmap(c.id, c.score);

  const doAdvance = () => { if (!stage) return; toast.show(`${c.name} advanced to ${stage}`); onClose(); };

  /* Standardized dim scores — deterministic from candidate id + score */
  const dimScores = getCandidateDimScores(c.id, c.score);

  /* SVG timeline builder matching the reference design */
  const tW = 560, tH = 80, tPad = 26;
  const tStep = (tW - 2 * tPad) / (timeline.length - 1);
  const yMap = { pos: 16, neu: 38, neg: 60 };
  const cMap = { pos: '#16a34a', neu: '#9aa0ad', neg: '#ea580c' };

  return (
    <Modal open={open} onClose={onClose} maxWidth="min(1020px, 95vw)">
      {/* Header */}
      <div style={{ display: 'flex', gap: 13, alignItems: 'flex-start', marginBottom: 14, position: 'relative' }}>
        <img src={c.avatar} alt="" style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover', flexShrink: 0, border: '2px solid var(--border)' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 19, fontWeight: 300, fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", color: 'var(--text-bright)' }}>{c.name}</div>
          <div style={{ fontSize: 13, marginTop: 3, color: 'var(--muted)' }}>{c.title}</div>
          <div style={{ fontSize: 12, marginTop: 2, fontWeight: 600, color: 'var(--text-mid)' }}>{c.company}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginTop: 9 }}>
            <span className={`fit-badge ${c.fitLabel === 'Deep Match' ? 'fit-deep' : c.fitLabel === 'Strong Fit' ? 'fit-strong' : 'fit-good'}`}>{c.fitLabel}</span>
            <span className="font-mono" style={{ fontSize: 9, padding: '1px 8px', fontWeight: 500, color: 'var(--blue)', background: 'var(--blue-bg)', border: '1px solid var(--blue-border)' }}>{c.stage}</span>
            <span className="font-mono" style={{ fontSize: 9, color: 'var(--muted)' }}>{c.source}</span>
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 7 }}>{(c.tags || []).map(t => <span key={t} className="tag">{t}</span>)}</div>
        </div>
        <div style={{ textAlign: 'center', padding: '10px 18px', borderRadius: 12, background: 'var(--blue-bg)', border: '1px solid var(--blue-border)', flexShrink: 0 }}>
          <div style={{ fontSize: 32, fontWeight: 300, color: 'var(--blue)', lineHeight: 1, fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif" }}>{c.score}</div>
          <div className="font-mono" style={{ fontSize: 9, marginTop: 2, color: 'var(--muted)' }}>DEEP MATCH</div>
        </div>
        <button onClick={onClose} className="ctrl-btn" style={{ position: 'absolute', top: 0, right: 0, fontSize: 9, padding: '4px 8px' }}><IconX size={10} /></button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', overflowX: 'auto', margin: '0 -24px', padding: '0 24px', borderBottom: '1px solid var(--border)' }}>
        {(['overview', 'resume', 'sentmap', 'materials'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className="font-mono" style={{ fontSize: 10, padding: '8px 14px', cursor: 'pointer', whiteSpace: 'nowrap', background: 'transparent', border: 'none', color: tab === t ? 'var(--blue)' : 'var(--muted)', borderBottom: tab === t ? '2px solid var(--blue)' : '2px solid transparent', fontWeight: tab === t ? 700 : 400 }}>
            {t === 'overview' ? 'Overview' : t === 'resume' ? 'Resume' : t === 'sentmap' ? 'Sentiment Map' : 'Materials'}
          </button>
        ))}
      </div>

      <div style={{ margin: '0 -24px', padding: '16px 24px 0', overflowY: 'auto', maxHeight: '60vh' }}>
        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '1fr 1fr' }}>
            <div>
              {resume.summary && <div style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 16, padding: 12, borderRadius: 8, color: 'var(--text-mid)', background: 'var(--surface2)', borderLeft: '3px solid var(--blue)' }}>{resume.summary}</div>}
              {resume.skills && <div style={{ marginBottom: 16 }}><div className="resume-section-title">Skills</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{resume.skills.map(s => <span key={s} className="tag">{s}</span>)}</div></div>}
              <div className="resume-section-title">Conversation Transcript</div>
              {conv.length > 0 ? (
                <div style={{ maxHeight: 280, overflowY: 'auto', paddingRight: 4 }}>
                  {conv.map((turn, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, flexDirection: turn.type === 'cand' ? 'row-reverse' : 'row', ...(turn.type === 'b2b' ? { padding: '8px 10px', borderRadius: 8, background: 'var(--purple-bg)', border: '1px solid var(--purple-border)' } : {}) }}>
                      {turn.type === 'agent' && <div style={{ width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'var(--blue-bg)', border: '1px solid var(--border)' }}><IconBot size={14} color="var(--blue)" /></div>}
                      {turn.type === 'cand' && <img src={c.avatar} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />}
                      {turn.type === 'b2b' && <div style={{ width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'var(--purple-bg)', border: '1px solid var(--purple-border)' }}><IconHandshake size={14} color="var(--purple)" /></div>}
                      <div style={{ flex: 1, minWidth: 0, textAlign: turn.type === 'cand' ? 'right' : 'left' }}>
                        <div className="font-mono" style={{ fontSize: 9, marginBottom: 2, color: turn.type === 'b2b' ? 'var(--purple)' : 'var(--muted)' }}>{turn.speaker}</div>
                        <div style={{ fontSize: 11.5, lineHeight: 1.5, padding: '8px 10px', borderRadius: 8, display: 'inline-block', color: 'var(--text-mid)', background: turn.type === 'agent' ? 'var(--surface2)' : turn.type === 'b2b' ? 'transparent' : 'var(--blue-bg)', maxWidth: '90%', textAlign: 'left' }}>
                          {turn.moment && <div className="font-mono" style={{ fontSize: 8, fontWeight: 700, marginBottom: 3, color: 'var(--green)' }}><IconZap size={8} color="var(--green)" className="inline" /> {turn.label?.toUpperCase()} SIGNAL</div>}
                          {turn.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div style={{ textAlign: 'center', padding: 16, fontSize: 11.5, borderRadius: 8, color: 'var(--muted)', background: 'var(--surface2)' }}>No conversation data yet</div>}
              {conv.length > 0 && <button className="ctrl-btn blue flex items-center gap-[4px]" style={{ fontSize: '9px', marginTop: 8 }} onClick={() => { onClose(); router.push('/messages'); }}><IconMessageCircle size={10} /> Continue in Messages</button>}
            </div>
            <div>
              <div style={{ marginBottom: 16 }}><div className="resume-section-title">Fit Dimensions</div>
                {FIT_DIMS.map(d => { const v = dimScores[d.key] || 75; const col = dimColor(v); return (<div key={d.key} style={{ marginBottom: 7 }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2, color: 'var(--muted)' }}><span>{d.label}</span><span style={{ color: col, fontWeight: 600 }}>{v}</span></div><div style={{ height: 5, overflow: 'hidden', background: 'var(--border2)' }}><div style={{ height: '100%', width: `${v}%`, background: col }} /></div></div>); })}
              </div>
              {resume.experience?.[0] && (<div style={{ marginBottom: 16 }}><div className="resume-section-title">Current Role</div><div style={{ padding: 12, borderRadius: 9, background: 'var(--surface2)', border: '1px solid var(--border)' }}><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-bright)' }}>{resume.experience[0].role}</div><div style={{ fontSize: 11.5, marginTop: 2, color: 'var(--muted)' }}>{resume.experience[0].company} · {resume.experience[0].dates}</div>{resume.experience[0].desc && <div style={{ fontSize: 11.5, marginTop: 5, lineHeight: 1.5, color: 'var(--text-mid)' }}>{resume.experience[0].desc}</div>}</div></div>)}
            </div>
          </div>
        )}

        {/* RESUME */}
        {tab === 'resume' && (<div>
          <div className="resume-section"><div className="resume-section-title">Experience</div>
            {resume.experience.map((e, i) => (<div key={i} className="resume-item"><div className="resume-dot" /><div className="resume-body"><div className="resume-role">{e.role}</div><div className="resume-company">{e.company}</div><div className="resume-dates">{e.dates}</div>{e.desc && <div className="resume-desc">{e.desc}</div>}</div></div>))}
          </div>
          {resume.education?.length > 0 && <div className="resume-section"><div className="resume-section-title">Education</div>
            {resume.education.map((e, i) => (<div key={i} className="resume-item"><div className="resume-dot edu" /><div className="resume-body"><div className="resume-role">{e.role}</div><div className="resume-company">{e.company}</div><div className="resume-dates">{e.dates}</div>{e.desc && <div className="resume-desc">{e.desc}</div>}</div></div>))}
          </div>}
          {resume.certs && resume.certs.length > 0 && <div className="resume-section"><div className="resume-section-title" style={{ color: 'var(--orange)' }}>Certifications</div>
            {resume.certs.map((cert, i) => { const parts = cert.split('—'); return (<div key={i} className="resume-item"><div className="resume-dot cert" /><div className="resume-body"><div className="resume-role" style={{ fontSize: 12 }}>{parts[0].trim()}</div>{parts.length > 1 && <div className="resume-company">{parts.slice(1).join('—').trim()}</div>}</div></div>); })}
          </div>}
          {resume.skills?.length > 0 && <div className="resume-section"><div className="resume-section-title">Skills</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{resume.skills.map(s => <span key={s} className="tag">{s}</span>)}</div></div>}
        </div>)}

        {/* SENTIMENT MAP */}
        {tab === 'sentmap' && (() => {
          const roleReqs = FIT_DIMS.map(d => d.req);
          const candProfile = FIT_DIMS.map(d => (dimScores[d.key] || 75) / 100);
          const sCx = 110, sCy = 110, sR = 85;
          function spt(idx: number, r: number) { const a = (Math.PI * 2 * idx / 6) - Math.PI / 2; return [sCx + Math.cos(a) * r, sCy + Math.sin(a) * r]; }
          const valPoly = candProfile.map((v, idx) => spt(idx, v * sR).join(',')).join(' ');
          const reqPoly = roleReqs.map((v, idx) => spt(idx, v * sR).join(',')).join(' ');

          return (<div>
            <div className="resume-section-title" style={{ marginBottom: 12, fontSize: 13 }}>🗺️ Sentiment Map</div>
            {/* Spider + Fit Dims */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 16 }}>
              <div>
                <svg width="240" height="240" viewBox="-10 -10 240 240">
                  {[25, 50, 75, 100].map(s => <polygon key={s} points={Array.from({ length: 6 }, (_, idx) => spt(idx, sR * s / 100).join(',')).join(' ')} fill="none" stroke="var(--border)" strokeWidth="0.5" />)}
                  {Array.from({ length: 6 }, (_, idx) => <line key={idx} x1={sCx} y1={sCy} x2={spt(idx, sR)[0]} y2={spt(idx, sR)[1]} stroke="var(--border)" strokeWidth="1" />)}
                  <polygon points={reqPoly} fill="rgba(99,102,241,.12)" stroke="rgba(99,102,241,.5)" strokeWidth="1.5" />
                  <polygon points={valPoly} fill="rgba(16,185,129,.15)" stroke="var(--green)" strokeWidth="2" />
                  {candProfile.map((v, idx) => <circle key={idx} cx={spt(idx, v * sR)[0]} cy={spt(idx, v * sR)[1]} r="3" fill="var(--green)" />)}
                  {FIT_DIMS.map((d, idx) => { const [x, y] = spt(idx, sR + 18); const v = dimScores[d.key] || 75; return <text key={d.key} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="var(--muted)" fontFamily="Helvetica Neue,Arial,sans-serif">{d.label.split(' ')[0]}</text>; })}
                  {FIT_DIMS.map((d, idx) => { const [x, y] = spt(idx, sR + 28); const v = dimScores[d.key] || 75; const col = v >= 80 ? 'var(--green)' : v >= 60 ? 'var(--blue)' : 'var(--orange)'; return <text key={`v-${d.key}`} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill={col} fontFamily="Helvetica Neue,Arial,sans-serif" fontWeight="600">{v}</text>; })}
                </svg>
                <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 8, height: 8, background: 'rgba(99,102,241,.5)' }} /><span className="font-mono" style={{ fontSize: 9, color: 'var(--muted)' }}>Role Requirement</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 8, height: 8, background: 'var(--green)' }} /><span className="font-mono" style={{ fontSize: 9, color: 'var(--muted)' }}>Candidate Profile</span></div>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div className="resume-section-title" style={{ marginBottom: 8 }}>Fit Dimensions</div>
                {FIT_DIMS.map(d => { const v = dimScores[d.key] || 75; const col = dimColor(v); return (<div key={d.key} style={{ marginBottom: 7 }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}><span>{d.label}</span><span style={{ fontFamily: "'Helvetica Neue,Arial,sans-serif", fontWeight: 500, color: col }}>{v}</span></div><div style={{ height: 5, background: 'var(--border2)', overflow: 'hidden' }}><div style={{ height: '100%', width: `${v}%`, background: col }} /></div></div>); })}
              </div>
            </div>

            {/* Conversation Timeline — 3-band with signal annotations */}
            <div className="resume-section-title" style={{ marginBottom: 6 }}>📈 Conversation Sentiment Timeline</div>
            <div style={{ marginBottom: 6 }}>
              <svg viewBox={`0 0 ${tW} ${tH}`} style={{ width: '100%' }}>
                <line x1={tPad} y1={38} x2={tW - tPad} y2={38} stroke="#e2e5ea" strokeWidth="1" />
                <polyline points={timeline.map((t, i) => `${tPad + i * tStep},${yMap[t.s]}`).join(' ')} fill="none" stroke="#e2e5ea" strokeWidth="1.5" strokeDasharray="3 2" />
                {timeline.map((t, i) => {
                  const x = tPad + i * tStep, y = yMap[t.s], col = cMap[t.s];
                  return <g key={i}>
                    {t.sig && <text x={x} y={y - 11} fontFamily="Helvetica Neue,Arial,sans-serif" fontSize="6.5" fill={col} textAnchor="middle">{t.sig}</text>}
                    <circle cx={x} cy={y} r="5" fill={col} opacity="0.85" />
                    <text x={x} y={tH - 3} fontFamily="Helvetica Neue,Arial,sans-serif" fontSize="7" fill="#9aa0ad" textAnchor="middle">{t.label}</text>
                  </g>;
                })}
              </svg>
            </div>
            <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} /><span className="font-mono" style={{ fontSize: 9, color: 'var(--muted)' }}>Positive signal</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#9aa0ad' }} /><span className="font-mono" style={{ fontSize: 9, color: 'var(--muted)' }}>Neutral</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ea580c' }} /><span className="font-mono" style={{ fontSize: 9, color: 'var(--muted)' }}>Caution / Risk</span></div>
            </div>

            {/* Topic Heatmap — Agent-to-Agent Comparison */}
            <div className="resume-section-title" style={{ marginBottom: 8 }}>🔥 Topic Interaction Heatmap</div>
            <div style={{ fontFamily: "'Helvetica Neue,Arial,sans-serif", fontSize: 8.5, color: 'var(--muted)', marginBottom: 10 }}>Each agent independently evaluates signal strength per topic (0–100)</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                <th style={{ fontFamily: "'Helvetica Neue,Arial,sans-serif", fontSize: 8.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', padding: '6px 10px', borderBottom: '1px solid var(--border)', textAlign: 'left', background: 'var(--surface2)' }}>Topic</th>
                <th style={{ fontFamily: "'Helvetica Neue,Arial,sans-serif", fontSize: 8.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', padding: '6px 10px', borderBottom: '1px solid var(--border)', textAlign: 'center', background: 'var(--surface2)', width: 80 }}>Explorer</th>
                <th style={{ fontFamily: "'Helvetica Neue,Arial,sans-serif", fontSize: 8.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', padding: '6px 10px', borderBottom: '1px solid var(--border)', textAlign: 'center', background: 'var(--surface2)', width: 80 }}>Candidate</th>
                <th style={{ fontFamily: "'Helvetica Neue,Arial,sans-serif", fontSize: 8.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', padding: '6px 10px', borderBottom: '1px solid var(--border)', textAlign: 'center', background: 'var(--surface2)', width: 50 }}>Δ</th>
                <th style={{ fontFamily: "'Helvetica Neue,Arial,sans-serif", fontSize: 8.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', padding: '6px 10px', borderBottom: '1px solid var(--border)', textAlign: 'left', background: 'var(--surface2)' }}>Verdict</th>
              </tr></thead>
              <tbody>{heatmap.map((row, idx) => {
                const ec = scoreColor(row.exp), cc = scoreColor(row.cand);
                const delta = row.cand - row.exp;
                const vc = row.verdict.includes('Strong') ? scoreColor(85) : row.verdict.includes('Risk') || row.verdict.includes('Gap') || row.verdict.includes('Mismatch') ? scoreColor(40) : scoreColor(68);
                return (<tr key={idx} style={{ borderBottom: idx < heatmap.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ fontSize: 11.5, color: 'var(--text-mid)', padding: '8px 10px', fontWeight: 500 }}>{row.topic}</td>
                  <td style={{ textAlign: 'center', padding: '6px 10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <span style={{ fontFamily: "'Helvetica Neue,Arial,sans-serif", fontSize: 11, fontWeight: 600, padding: '3px 10px', background: ec.bg, color: ec.fg }}>{row.exp}</span>
                      <div style={{ width: 50, height: 3, background: 'var(--surface3)', overflow: 'hidden' }}><div style={{ width: `${row.exp}%`, height: '100%', background: ec.fg, opacity: 0.6 }} /></div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', padding: '6px 10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <span style={{ fontFamily: "'Helvetica Neue,Arial,sans-serif", fontSize: 11, fontWeight: 600, padding: '3px 10px', background: cc.bg, color: cc.fg }}>{row.cand}</span>
                      <div style={{ width: 50, height: 3, background: 'var(--surface3)', overflow: 'hidden' }}><div style={{ width: `${row.cand}%`, height: '100%', background: cc.fg, opacity: 0.6 }} /></div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', padding: '6px 10px' }}>
                    <span style={{ fontFamily: "'Helvetica Neue,Arial,sans-serif", fontSize: 9, fontWeight: 500, color: delta >= 0 ? '#16a34a' : '#ea580c' }}>{delta >= 0 ? '+' : ''}{delta}</span>
                  </td>
                  <td style={{ padding: '6px 10px' }}><span style={{ fontFamily: "'Helvetica Neue,Arial,sans-serif", fontSize: 9, padding: '2px 7px', color: vc.fg, background: vc.bg }}>{row.verdict}</span></td>
                </tr>);
              })}</tbody>
            </table>
          </div>);
        })()}

        {tab === 'materials' && (<div style={{ textAlign: 'center', padding: 40 }}><IconClipboard size={28} color="var(--muted)" style={{ margin: '0 auto 8px' }} /><div style={{ fontSize: 13, color: 'var(--muted)' }}>No materials uploaded yet</div><button className="ctrl-btn blue" style={{ marginTop: 10 }}>Upload Materials</button></div>)}
      </div>

      {/* Stage Advance */}
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
        <select className="form-select" style={{ fontSize: 11, padding: '7px 10px', width: '100%', marginBottom: 8 }} value={stage} onChange={e => setStage(e.target.value)}>
          <option value="">Move to stage…</option>
          <option>Explorer Screen</option><option>Recruiter Review</option><option>Interview</option>
          <option>Hiring Mgr Review</option><option>Final Round</option><option>Offer Extended</option>
          <option>Hired</option><option>Rejected</option>
        </select>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="ctrl-btn run" style={{ fontSize: 11, padding: '7px 16px' }} onClick={doAdvance}>Advance</button>
          <button className="ctrl-btn" style={{ fontSize: 11, padding: '7px 16px' }} onClick={onClose}>Close</button>
        </div>
      </div>
    </Modal>
  );
}

