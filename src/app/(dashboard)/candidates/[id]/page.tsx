// @ts-nocheck
'use client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCandidates } from '@/lib/data-provider';
import { MOCK_CANDIDATES } from '@/lib/mock-data';
import { CandidateModal } from '@/components/modals/candidate-modal';

const F = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const MONO = "'Courier New',monospace";
const BLUE = '#2563eb';
const TEAL = '#1D9E75';
const DARK = '#0A0A0A';
const MID = '#6B6B6B';
const MUTED = '#AAAAAA';
const BORDER = '#E8E8E5';
const BLIGHT = '#F4F4F2';

function SL({ t }: { t: string }) {
  return <div style={{ fontSize: 10, color: MUTED, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10, fontFamily: MONO, fontWeight: 400 }}>{t}</div>;
}

function Avatar({ size = 36, name = '' }: { size?: number; name?: string }) {
  const ini = name.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2) || '?';
  const colors = [BLUE, TEAL, '#E84B3A', '#F5A623', '#635BFF'];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.33, fontWeight: 400, flexShrink: 0, fontFamily: F }}>
      {ini}
    </div>
  );
}

function RadarSVG({ dims, size = 200 }: { dims: { label: string; value: number }[]; size?: number }) {
  const cx = size / 2, cy = size / 2, r = size * 0.36;
  const n = dims.length;
  const angles = dims.map((_, i) => (i / n) * Math.PI * 2 - Math.PI / 2);
  const pt = (angle: number, radius: number) => ({ x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) });
  const rings = [20, 40, 60, 80, 100];
  const dataPoints = dims.map((d, i) => pt(angles[i], r * (d.value / 100)));
  const dataPoly = dataPoints.map(p => `${p.x},${p.y}`).join(' ');
  const gridPts = (pct: number) => dims.map((_, i) => pt(angles[i], r * (pct / 100)));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {rings.map(pct => <polygon key={pct} points={gridPts(pct).map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={BORDER} strokeWidth="1" />)}
      {dims.map((_, i) => { const end = pt(angles[i], r); return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke={BORDER} strokeWidth="1" />; })}
      <polygon points={dataPoly} fill={`rgba(37,99,235,0.07)`} stroke={BLUE} strokeWidth="1.5" strokeLinejoin="round" />
      {dataPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill={BLUE} />)}
      {dims.map((d, i) => {
        const lp = pt(angles[i], r + 14);
        const anchor = lp.x < cx - 4 ? 'end' : lp.x > cx + 4 ? 'start' : 'middle';
        return <text key={i} x={lp.x} y={lp.y} textAnchor={anchor} dominantBaseline="middle" fontSize="8.5" fill={MUTED} fontFamily="Helvetica Neue,Arial">{d.label.split(' ')[0].toUpperCase()}</text>;
      })}
    </svg>
  );
}

function SentimentSVG({ data, w = 460, h = 140 }: { data: any[]; w?: number; h?: number }) {
  if (!data?.length) return null;
  const pad = { t: 16, r: 12, b: 28, l: 32 };
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const keys = ['technical', 'culture', 'leadership'];
  const cols = [BLUE, TEAL, '#635BFF'];
  const xs = data.map((_, i) => pad.l + i * (iw / (data.length - 1)));
  const medians = data.map(d => Math.round(((d.technical || 75) + (d.culture || 75) + (d.leadership || 75)) / 3));
  const ys = (v: number) => pad.t + ih - (v - 50) / (100 - 50) * ih;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      {[60, 70, 80, 90, 100].map(v => (
        <g key={v}>
          <line x1={pad.l} y1={ys(v)} x2={w - pad.r} y2={ys(v)} stroke="#F0F0EE" strokeWidth="1" />
          <text x={pad.l - 4} y={ys(v)} textAnchor="end" dominantBaseline="middle" fontSize="8" fill={MUTED} fontFamily="Helvetica Neue,Arial">{v}</text>
        </g>
      ))}
      <polyline points={data.map((d, i) => `${xs[i]},${ys(medians[i])}`).join(' ')} fill="none" stroke="#CCCCCC" strokeWidth="1.5" strokeDasharray="4,3" strokeLinecap="round" />
      {keys.map((k, ki) => (
        <polyline key={k} points={data.map((d, i) => `${xs[i]},${ys(d[k] || 75)}`).join(' ')} fill="none" stroke={cols[ki]} strokeWidth="1" strokeOpacity="0.4" strokeLinecap="round" />
      ))}
      {data.map((d, i) => {
        if (i === 0) return null;
        return keys.map((k, ki) => {
          const delta = (d[k] || 75) - (data[i - 1][k] || 75);
          const dotCol = delta > 1 ? '#1A7A45' : delta < -1 ? '#CC3300' : '#CCCCCC';
          const y = ys(d[k] || 75);
          return <circle key={k + i} cx={xs[i]} cy={y} r="4" fill={dotCol} fillOpacity="0.2" stroke={dotCol} strokeWidth="1.2" />;
        });
      })}
      {keys.map((k, ki) => {
        const last = data[data.length - 1];
        return <circle key={k} cx={xs[data.length - 1]} cy={ys(last[k] || 75)} r="3.5" fill={cols[ki]} />;
      })}
      {data.map((d, i) => (
        <text key={i} x={xs[i]} y={h - 5} textAnchor="middle" fontSize="8.5" fill={MUTED} fontFamily="Helvetica Neue,Arial">{d.turn || d.label || `T${i + 1}`}</text>
      ))}
    </svg>
  );
}

const dimCol = (s: number) => s >= 90 ? TEAL : s >= 80 ? BLUE : '#F5A623';

export default function CandidateProfilePage() {
  const router = useRouter();
  const params = useParams();
  const [tab, setTab] = useState('assess');
  const [showSentimentModal, setShowSentimentModal] = useState(false);
  const [note, setNote] = useState('');

  const candidatesQuery = useCandidates();
  const all = candidatesQuery.data?.data || MOCK_CANDIDATES;
  const id = params?.id as string;
  const c = all.find(x => x.id === id) || all[0];

  if (!c) return <div style={{ padding: 40, fontFamily: F, color: MUTED }}>Candidate not found.</div>;

  const name = c.name || '';
  const title = c.title || '';
  const company = c.company || '';
  const score = c.score || 0;
  const stage = c.stage || 'Applied';
  const fitLabel = c.fitLabel || 'Good Fit';
  const dm = c.deepMatch;

  const dims = dm ? [
    { label: 'Technical', value: dm.technical || 80 },
    { label: 'Domain Know', value: dm.domain || 78 },
    { label: 'Culture', value: dm.culture || 82 },
    { label: 'Growth', value: dm.growth || 75 },
    { label: 'Constraints', value: dm.communication || 77 },
    { label: 'Value Add', value: Math.round((dm.technical + dm.culture) / 2) || 79 },
  ] : [];

  const sentData = c.sentimentTimeline || [
    { turn: 'Opening', technical: 72, culture: 65, leadership: 60 },
    { turn: 'Background', technical: 82, culture: 74, leadership: 70 },
    { turn: 'Motivation', technical: 84, culture: 88, leadership: 78 },
    { turn: 'Comp', technical: 88, culture: 86, leadership: 80 },
    { turn: 'Role Fit', technical: score - 2, culture: score - 4, leadership: score - 8 },
    { turn: 'Close', technical: score, culture: score - 2, leadership: score - 6 },
  ];

  const work = Array.isArray(c.workHistory) ? c.workHistory : (c.experience ? [c.experience] : []);
  const edu = Array.isArray(c.education) ? c.education : [];
  const skills = Array.isArray(c.skills) ? c.skills : [];
  const conv = c.conversation || [];
  const timeline = c.timeline || [];

  const STAGE_OPTS = ['Explorer Screen', 'Recruiter Review', 'Interview', 'Hiring Mgr Review', 'Final Round', 'Offer Extended', 'Hired', 'Rejected'];
  const [nextStage, setNextStage] = useState('');

  const stageColor: any = { 'Offer Extended': { bg: '#EDF5FF', c: BLUE }, 'Final Round': { bg: '#E8F0FF', c: BLUE }, 'Interview': { bg: '#FFF7E0', c: '#8A6000' }, 'Explorer Screen': { bg: '#F4F4F2', c: MUTED }, 'Recruiter Review': { bg: '#F4F4F2', c: MID } };
  const sc = stageColor[stage] || { bg: BLIGHT, c: MUTED };
  const fitColor = fitLabel === 'Deep Match' ? { bg: '#EDF5FF', c: BLUE } : fitLabel === 'Strong Fit' ? { bg: '#E6F5EE', c: TEAL } : { bg: BLIGHT, c: MID };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: F, color: DARK, background: '#FFFFFF' }}>

      {/* Topbar breadcrumb */}
      <div style={{ height: 46, borderBottom: '1px solid ' + BORDER, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 10, flexShrink: 0, background: '#FFFFFF' }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', fontFamily: F, fontSize: 12, color: MUTED, padding: '3px 0' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 5l-7 7 7 7"/></svg>
          Candidates
        </button>
        <span style={{ color: BORDER }}>·</span>
        <span style={{ fontSize: 12, color: MID }}>{company}</span>
        <span style={{ color: BORDER }}>·</span>
        <span style={{ fontSize: 12, color: DARK, fontWeight: 400 }}>{name}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={() => setShowSentimentModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid ' + BORDER, padding: '4px 12px', cursor: 'pointer', fontFamily: F, fontSize: 11, color: MID }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4M8 2v16M16 6v16"/></svg>
            Sentiment Map
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid ' + BORDER, padding: '4px 12px', cursor: 'pointer', fontFamily: F, fontSize: 11, color: MID }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={MID} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            Message
          </button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ borderBottom: '1px solid ' + BORDER, padding: '20px 24px', flexShrink: 0, background: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <Avatar size={64} name={name} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 26, fontWeight: 300, letterSpacing: '-0.02em' }}>{name}</span>
              <span style={{ fontSize: 10, padding: '3px 9px', background: sc.bg, color: sc.c, fontWeight: 400 }}>{stage}</span>
              <span style={{ fontSize: 10, padding: '3px 9px', background: fitColor.bg, color: fitColor.c, fontWeight: 400 }}>{fitLabel}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: BLUE }}>{score}</span>
            </div>
            <div style={{ fontSize: 13, color: MID, fontWeight: 300, marginBottom: 6 }}>{title} · {company}</div>
            <div style={{ fontSize: 12, color: MUTED, fontWeight: 300 }}>{c.source || 'Taltas Network'}</div>
          </div>
          {/* Score strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', border: '1px solid ' + BORDER, flexShrink: 0 }}>
            {[
              { l: 'AI Match', v: score, col: BLUE },
              { l: 'Deep Match', v: dm ? Math.round((dm.technical + dm.culture + dm.growth) / 3) : '—', col: TEAL },
              { l: 'Sessions', v: c.sessionCount || 1, col: DARK },
              { l: 'Sentiment', v: (c.sentiment || '75') + '%', col: MID },
            ].map((s, i) => (
              <div key={i} style={{ padding: '10px 16px', borderRight: i % 2 === 0 ? '1px solid ' + BORDER : 'none', borderBottom: i < 2 ? '1px solid ' + BORDER : 'none', minWidth: 82 }}>
                <div style={{ fontSize: 9, color: MUTED, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4, fontFamily: MONO }}>{s.l}</div>
                <div style={{ fontSize: 22, fontWeight: 300, letterSpacing: '-0.02em', color: s.col, lineHeight: 1 }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid ' + BORDER, display: 'flex', flexShrink: 0, padding: '0 24px', background: '#FFFFFF' }}>
        {[{ id: 'assess', l: 'SNAP Assessment' }, { id: 'profile', l: 'Profile' }, { id: 'conv', l: 'Conversation' }, { id: 'act', l: 'Activity' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.id ? BLUE : 'transparent'}`, padding: '11px 20px', fontSize: 12, color: tab === t.id ? DARK : MUTED, cursor: 'pointer', fontFamily: F, transition: 'all .12s' }}>{t.l}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* Assessment Tab */}
        {tab === 'assess' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', minHeight: '100%' }}>
            <div style={{ borderRight: '1px solid ' + BORDER, padding: '24px' }}>

              {/* Agent recommendation */}
              <div style={{ background: '#F6FFF9', border: '1px solid #B8E0CC', padding: '12px 16px', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: TEAL }} />
                  <span style={{ fontSize: 10, color: TEAL, letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: MONO }}>Explorer Agent Recommendation</span>
                </div>
                <p style={{ fontSize: 13, color: '#0E6640', fontWeight: 300, lineHeight: 1.7 }}>
                  {c.agentRecommendation || `Strong match across all dimensions. Technical depth is exceptional. Culture alignment and timeline fully aligned. Recommend advancing to next stage.`}
                </p>
              </div>

              {/* Deep Match Radar + Bars */}
              {dims.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <SL t="6-Dimension Deep Match" />
                  <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                    <RadarSVG dims={dims} size={200} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {dims.map((d, i) => (
                        <div key={i}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 12, color: MID, fontWeight: 300 }}>{d.label}</span>
                            <span style={{ fontSize: 12, fontWeight: 500, color: dimCol(d.value) }}>{d.value}</span>
                          </div>
                          <div style={{ height: 3, background: '#EBEBEB' }}>
                            <div style={{ height: 3, width: d.value + '%', background: dimCol(d.value) }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sentiment chart */}
              <div style={{ marginBottom: 24 }}>
                <SL t="Sentiment Across Conversation" />
                <SentimentSVG data={sentData} w={500} h={140} />
                <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  {[['Technical', BLUE], ['Culture', TEAL], ['Leadership', '#635BFF']].map(([l, col]) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 16, height: 2, background: col }} />
                      <span style={{ fontSize: 10, color: MUTED }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              {c.highlights?.length > 0 && (
                <div>
                  <SL t="Key Highlights" />
                  {c.highlights.map((h: any, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: i < c.highlights.length - 1 ? '1px solid ' + BLIGHT : 'none', alignItems: 'flex-start' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 5, background: h.sentiment === 'positive' ? TEAL : h.sentiment === 'negative' ? '#CC3300' : '#F5A623' }} />
                      <span style={{ fontSize: 13, color: MID, fontWeight: 300, lineHeight: 1.6 }}>{h.text || h}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right panel */}
            <div style={{ padding: '24px' }}>

              {/* Compensation */}
              <div style={{ border: '1px solid ' + BORDER, marginBottom: 16 }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid ' + BORDER, fontSize: 10, color: MUTED, letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: MONO }}>Compensation</div>
                <div style={{ padding: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 9, color: MUTED, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 3, fontFamily: MONO }}>Expecting</div>
                      <div style={{ fontSize: 20, fontWeight: 300, color: DARK, letterSpacing: '-0.02em' }}>{c.salaryExpectation || c.compensation?.expectation || '$—'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: MUTED, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 3, fontFamily: MONO }}>Band</div>
                      <div style={{ fontSize: 20, fontWeight: 300, color: TEAL, letterSpacing: '-0.02em' }}>{c.salaryBand || c.compensation?.band || '$—'}</div>
                    </div>
                  </div>
                  <div style={{ height: 4, background: '#E6F5EE', marginBottom: 6, position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '50%', width: 2, height: 8, background: TEAL, top: -2 }} />
                  </div>
                  <div style={{ fontSize: 11, color: TEAL, fontWeight: 300, marginBottom: 10 }}>Within approved band</div>
                  <div style={{ borderTop: '1px solid ' + BLIGHT, paddingTop: 10, display: 'flex', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 9, color: MUTED, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 2, fontFamily: MONO }}>Equity</div>
                      <div style={{ fontSize: 13, color: DARK, fontWeight: 300 }}>{c.equity || '—'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: MUTED, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 2, fontFamily: MONO }}>Start</div>
                      <div style={{ fontSize: 13, color: DARK, fontWeight: 300 }}>{c.startDate || '—'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recruiter Decision */}
              <div style={{ border: '1px solid ' + BORDER }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid ' + BORDER, fontSize: 10, color: MUTED, letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: MONO }}>Recruiter Decision</div>
                <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <select value={nextStage} onChange={e => setNextStage(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid ' + BORDER, fontFamily: F, fontSize: 12, color: DARK, background: '#fff', outline: 'none', marginBottom: 4 }}>
                    <option value="">Move to stage...</option>
                    {STAGE_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button style={{ background: TEAL, border: 'none', color: '#fff', fontFamily: F, fontSize: 12, padding: '9px 14px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    Advance
                  </button>
                  <button style={{ background: 'none', border: '1px solid ' + BORDER, color: MID, fontFamily: F, fontSize: 12, padding: '9px 14px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                    Hold — request more info
                  </button>
                  <button style={{ background: 'none', border: '1px solid #FFDDD8', color: '#CC3300', fontFamily: F, fontSize: 12, padding: '9px 14px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#CC3300" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                    Pass — not proceeding
                  </button>
                  <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note..." rows={3} style={{ width: '100%', padding: '8px 10px', border: '1px solid ' + BORDER, fontSize: 12, fontFamily: F, color: DARK, resize: 'none' as const, outline: 'none', lineHeight: 1.6, marginTop: 4 }} />
                  <button style={{ background: BLUE, border: 'none', color: '#fff', fontFamily: F, fontSize: 12, padding: '9px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    Save Decision
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', minHeight: '100%' }}>
            <div style={{ borderRight: '1px solid ' + BORDER, padding: '24px' }}>
              {work.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <SL t="Work History" />
                  {work.map((w: any, i: number) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 12, padding: '14px 0', borderBottom: i < work.length - 1 ? '1px solid ' + BLIGHT : 'none' }}>
                      <Avatar size={34} name={w.company || w.co || ''} />
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                          <span style={{ fontSize: 13.5, fontWeight: 400, color: DARK }}>{w.role || w.title || ''}</span>
                          <span style={{ fontSize: 11, color: MUTED, fontFamily: MONO, flexShrink: 0, marginLeft: 12 }}>{w.period || w.duration || ''}</span>
                        </div>
                        <div style={{ fontSize: 12, color: BLUE, marginBottom: 5 }}>{w.company || w.co || ''}</div>
                        <div style={{ fontSize: 13, color: MUTED, fontWeight: 300, lineHeight: 1.65 }}>{w.description || w.note || ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {edu.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <SL t="Education" />
                  {edu.map((e: any, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: i < edu.length - 1 ? '1px solid ' + BLIGHT : 'none' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#E84B3A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 400, color: DARK, marginBottom: 2 }}>{e.degree || e.qualification || ''}</div>
                        <div style={{ fontSize: 12, color: BLUE }}>{e.school || e.institution || ''} {e.year ? '· ' + e.year : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {skills.length > 0 && (
                <div>
                  <SL t="Skills" />
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {skills.map((s: any, i: number) => (
                      <span key={i} style={{ fontSize: 12, padding: '5px 12px', border: '1px solid #C8D8FF', color: BLUE, background: '#F0F4FF', fontWeight: 300 }}>{typeof s === 'string' ? s : s.name || s.skill || ''}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div style={{ padding: '24px' }}>
              <SL t="Contact" />
              {[
                { icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22,6 12,13 2,6', val: c.email || '', blue: true },
                { icon: 'M12 2C8.68 2 6 4.68 6 8c0 5.5 6 14 6 14s6-8.5 6-14c0-3.32-2.68-6-6-6z', val: c.location || '', blue: false },
              ].filter(x => x.val).map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 9, padding: '11px 0', borderBottom: '1px solid ' + BLIGHT }}>
                  <span style={{ fontSize: 13, color: item.blue ? BLUE : MID, fontWeight: 300 }}>{item.val}</span>
                </div>
              ))}
              <div style={{ marginTop: 20 }}>
                <SL t="Application" />
                <div style={{ padding: '12px 14px', border: '1px solid ' + BORDER }}>
                  <div style={{ fontSize: 13.5, fontWeight: 400, color: DARK, marginBottom: 3 }}>{c.applying || title}</div>
                  <div style={{ fontSize: 12, color: BLUE, marginBottom: 8 }}>{company}</div>
                  <div style={{ display: 'flex', gap: 7 }}>
                    <span style={{ fontSize: 10, padding: '3px 9px', background: sc.bg, color: sc.c }}>{stage}</span>
                    <span style={{ fontSize: 10, padding: '3px 9px', background: fitColor.bg, color: fitColor.c }}>{fitLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conversation Tab */}
        {tab === 'conv' && (
          <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <SL t="Explorer Agent Conversation" />
              <span style={{ fontSize: 10, color: MUTED, fontFamily: MONO }}>{conv.length} turns</span>
            </div>
            {conv.length === 0 && <p style={{ fontSize: 13, color: MUTED, fontWeight: 300 }}>No conversation data yet.</p>}
            {conv.map((msg: any, i: number) => {
              const isAgent = msg.type === 'agent' || msg.speaker === 'agent' || msg.role === 'agent';
              return (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 16, flexDirection: isAgent ? 'row' : 'row-reverse' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: isAgent ? TEAL : BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      {isAgent ? <><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></> : <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>}
                    </svg>
                  </div>
                  <div style={{ maxWidth: '74%' }}>
                    <div style={{ fontSize: 9, color: MUTED, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4, fontFamily: MONO }}>{isAgent ? 'Explorer Agent' : name}</div>
                    <div style={{ padding: '10px 14px', background: isAgent ? BLIGHT : '#F0F4FF', border: '1px solid ' + (isAgent ? BORDER : '#C8D8FF'), fontSize: 13, color: MID, fontWeight: 300, lineHeight: 1.75 }}>
                      {msg.text || msg.content || msg.message || ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Activity Tab */}
        {tab === 'act' && (
          <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px' }}>
            <SL t="Activity Timeline" />
            {timeline.length === 0 && <p style={{ fontSize: 13, color: MUTED, fontWeight: 300 }}>No activity yet.</p>}
            <div style={{ position: 'relative', paddingLeft: 20 }}>
              <div style={{ position: 'absolute', left: 5, top: 6, bottom: 0, width: 1, background: BORDER }} />
              {timeline.map((ev: any, i: number) => (
                <div key={i} style={{ position: 'relative', paddingBottom: 20 }}>
                  <div style={{ position: 'absolute', left: -20, top: 4, width: 10, height: 10, borderRadius: '50%', border: '2px solid #fff', background: ev.type === 'advance' ? TEAL : ev.type === 'score' ? BLUE : ev.type === 'snap' ? '#635BFF' : '#E8E8E5' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 13, color: ev.type === 'advance' ? TEAL : ev.type === 'score' ? BLUE : DARK, fontWeight: ev.type === 'advance' ? 400 : 300, lineHeight: 1.5 }}>{ev.event || ev.text || ev.description || ''}</span>
                    <span style={{ fontSize: 10, color: MUTED, fontFamily: MONO, flexShrink: 0, marginLeft: 14 }}>{ev.date || ev.time || ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sentiment modal */}
      {showSentimentModal && (
        <CandidateModal open={true} onClose={() => setShowSentimentModal(false)} candidate={c} />
      )}
    </div>
  );
}
