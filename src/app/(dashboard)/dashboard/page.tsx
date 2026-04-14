// @ts-nocheck
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCandidates, useRoles, useExplorers } from '@/lib/data-provider';

const F = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const MONO = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const BLUE = '#2563eb';
const TEAL = '#1D9E75';
const DARK = '#0A0A0A';
const MID = '#6B6B6B';
const MUTED = '#AAAAAA';
const BORDER = '#E8E8E5';
const BLIGHT = '#F4F4F2';

const MOCK_CANDS = [
  { id:'c1', name:'Kai Nakamura',    role:'Product Designer',    company:'Linear',     stage:'Offer Extended',   score:92, deepMatch:92, fit:'Deep Match',   source:'Taltas Network', sentiment:94 },
  { id:'c2', name:'Sara Kim',        role:'Sr. Product Manager', company:'Figma',      stage:'Offer Extended',   score:89, deepMatch:89, fit:'Strong Fit',   source:'Taltas Network', sentiment:88 },
  { id:'c3', name:'Maria Gonzalez',  role:'Engineering Manager', company:'Datadog',    stage:'Final Round',      score:88, deepMatch:85, fit:'Strong Fit',   source:'Taltas Network', sentiment:86 },
  { id:'c4', name:'Alex Chen',       role:'Staff Engineer',      company:'Stripe',     stage:'Offer Extended',   score:85, deepMatch:83, fit:'Strong Fit',   source:'Taltas Network', sentiment:82 },
  { id:'c5', name:'Omar Hassan',     role:'ML Engineer',         company:'Anthropic',  stage:'Final Round',      score:53, deepMatch:55, fit:'Potential Fit',source:'Taltas Network', sentiment:65 },
  { id:'c6', name:'Tawanda Mahachi', role:'Engineer',            company:'Taltas',     stage:'Recruiter Review', score:0,  deepMatch:0,  fit:'Pending',      source:'Taltas Network', sentiment:0  },
  { id:'c7', name:'Emma Wilson',     role:'Security Engineer',   company:'Cloudflare', stage:'Sourced',          score:0,  deepMatch:0,  fit:'Pending',      source:'Taltas Network', sentiment:0  },
  { id:'c8', name:'Priya Sharma',    role:'DevRel Engineer',     company:'Vercel',     stage:'Explorer Screen',  score:0,  deepMatch:0,  fit:'Pending',      source:'Taltas Network', sentiment:0  },
  { id:'c9', name:'James Park',      role:'Frontend Lead',       company:'Notion',     stage:'Interview',        score:74, deepMatch:72, fit:'Good Fit',     source:'Taltas Network', sentiment:78 },
];

const MOCK_JOBS = [
  { id:'j1', title:'Senior Backend Engineer',  sub:'Data Platform - SF / Remote',     comp:'$200-250K', status:'HOT',  candidates:20 },
  { id:'j2', title:'Platform AI Lead',         sub:'AI Infrastructure - NYC / Remote', comp:'$180-220K', status:'WARM', candidates:23 },
  { id:'j3', title:'Staff Infra Engineer',     sub:'Infrastructure - SF / Seattle',    comp:'$215-270K', status:'HOT',  candidates:18 },
  { id:'j4', title:'Founding Engineer',        sub:'Engineering - Remote',             comp:'$170-210K', status:'HOT',  candidates:15 },
  { id:'j5', title:'Backend Engineer',         sub:'API Platform - NYC',               comp:'$160-195K', status:'OPEN', candidates:3  },
];

const MOCK_EXPLS = [
  { id:'e3', name:'StaffML-Agent',  mode:'ACTIVE', role:'Staff ML Engineer',    company:'Anthropic', convos:47, a2a:12 },
  { id:'e4', name:'PrincipalEng',   mode:'ACTIVE', role:'Principal Eng',        company:'Taltas',    convos:31, a2a:8  },
  { id:'e1', name:'DevRel-Agent',   mode:'AUTO',   role:'DevRel Engineer',      company:'Vercel',    convos:12, a2a:3  },
  { id:'e2', name:'DataEng-Agent',  mode:'AUTO',   role:'Data Engineer',        company:'Datadog',   convos:8,  a2a:1  },
];

const STAGES = [
  { l:'Applied',n:14 },{ l:'Explorer Screen',n:11 },{ l:'Recruiter Review',n:10 },
  { l:'Interview',n:9 },{ l:'Hiring Mgr',n:8 },{ l:'Final Round',n:8 },{ l:'Offer',n:3 },
];
const MAX_N = 14;

const METRICS = [
  { v:'15',  l:'Open Jobs',         sub:'0 this week',    desc:'15 open roles across 6 accounts.' },
  { v:'9',   l:'In Pipeline',       sub:'6 active',       desc:'9 candidates in SNAP pipeline.' },
  { v:'14',  l:'Explorer Convos',   sub:'38% match rate', desc:'14 Explorer conversations completed.' },
  { v:'6',   l:'Interviews',        sub:'on track',       desc:'6 interviews confirmed.' },
  { v:'3',   l:'Offers Sent',       sub:'38% rate',       desc:'3 offers sent this period.' },
  { v:'18d', l:'Avg. Hire Time',    sub:'26d faster',     desc:'18 day avg vs 44 day industry avg.' },
];

// Stage - color only (no background)
const SC: any = {
  'Offer Extended':   '#15703A',
  'Final Round':      BLUE,
  'Interview':        '#1d4ed8',
  'Recruiter Review': '#8A6000',
  'Explorer Screen':  '#7C3AED',
  'Sourced':          MID,
  'Applied':          MID,
};

// Fit - color only
const FC: any = {
  'Deep Match':    BLUE,
  'Strong Fit':    TEAL,
  'Good Fit':      TEAL,
  'Potential Fit': '#8A6000',
  'Pending':       MUTED,
};

// Stage dot color
const SD: any = {
  'Offer Extended':   '#15703A',
  'Final Round':      BLUE,
  'Interview':        '#1d4ed8',
  'Recruiter Review': '#D97706',
  'Explorer Screen':  '#7C3AED',
  'Sourced':          MUTED,
  'Applied':          MUTED,
};

function Avatar({ name = '', size = 30 }: { name?: string; size?: number }) {
  const ini = name.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2) || '?';
  const colors = [BLUE, TEAL, '#E84B3A', '#F5A623', '#635BFF', '#C8571A', '#5E6AD2'];
  const bg = colors[(name.charCodeAt(0) || 0) % colors.length];
  return <div style={{ width: size, height: size, borderRadius: '50%', background: bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.33, fontWeight: 400, flexShrink: 0, fontFamily: F }}>{ini}</div>;
}

function Dots({ v }: { v: number }) {
  const f = Math.round(v / 10);
  const col = v >= 85 ? TEAL : v >= 65 ? BLUE : '#F5A623';
  return <div style={{ display: 'flex', gap: 2 }}>{Array.from({ length: 10 }, (_, i) => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: i < f ? col : '#E8E8E5', flexShrink: 0 }} />)}</div>;
}

function SentimentBar({ v }: { v: number }) {
  if (!v) return <span style={{ fontSize: 11, color: MUTED }}>-</span>;
  const col = v >= 85 ? TEAL : v >= 70 ? BLUE : '#F5A623';
  return <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
    <div style={{ width: 40, height: 3, background: '#EBEBEB' }}><div style={{ width: v + '%', height: 3, background: col }} /></div>
    <span style={{ fontSize: 10, color: col }}>{v}</span>
  </div>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('All Stages');
  const [profileOpen, setProfileOpen] = useState<any>(null);
  const [hovMetric, setHovMetric] = useState<number | null>(null);

  const candsQuery = useCandidates();
  const jobsQuery = useRoles();
  const explsQuery = useExplorers();

  const cands = candsQuery.data?.data?.length ? candsQuery.data.data : MOCK_CANDS;
  const jobs  = jobsQuery?.data?.data?.length  ? jobsQuery.data.data  : MOCK_JOBS;
  const expls = explsQuery.data?.data?.length ? explsQuery.data.data : MOCK_EXPLS;

  const filtered = cands.filter(c => {
    const ms = (c.name||'').toLowerCase().includes(search.toLowerCase()) || (c.company||'').toLowerCase().includes(search.toLowerCase()) || (c.role||'').toLowerCase().includes(search.toLowerCase());
    const mst = stageFilter === 'All Stages' || c.stage === stageFilter;
    return ms && mst;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, fontFamily: F, color: DARK, background: '#FFFFFF', overflow: 'hidden' }}>

      {/* TOPBAR */}
      <div style={{ height: 68, paddingLeft: 24, paddingRight: 24, borderBottom: '1px solid ' + BORDER, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 400, letterSpacing: '-0.01em', color: DARK }}>Dashboard</div>
          <div style={{ fontSize: 11, color: MUTED, fontWeight: 300 }}>Overview - Today</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
            <span style={{ fontSize: 11, color: MUTED, fontWeight: 300 }}>All Synced - 2m ago</span>
          </div>
          <button style={{ fontSize: 11, color: BLUE, background: 'none', border: 'none', cursor: 'pointer', fontFamily: F }}>Sync Now</button>
        </div>
      </div>

      {/* METRICS STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', flexShrink: 0, background: BLUE, borderBottom: 'none' }}>
        {METRICS.map((m, i) => (
          <div key={i}
            onMouseEnter={() => setHovMetric(i)}
            onMouseLeave={() => setHovMetric(null)}
            style={{ padding: '20px 24px', cursor: 'default', transition: 'background .15s', background: hovMetric === i ? 'rgba(255,255,255,.06)' : 'transparent', borderRight: i < 5 ? '1px solid rgba(255,255,255,.08)' : 'none' }}>
            <div style={{ fontSize: 28, fontWeight: 300, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 4 }}>{m.v}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', fontWeight: 300, marginBottom: 2 }}>{m.l}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', fontWeight: 300, overflow: 'hidden', maxHeight: hovMetric === i ? 48 : 16, transition: 'max-height .25s ease' }}>
              {hovMetric === i ? m.desc : m.sub}
            </div>
          </div>
        ))}
      </div>

      {/* MAIN GRID */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 420px', overflow: 'hidden' }}>

        {/* LEFT - PIPELINE + TABLE */}
        <div style={{ borderRight: '1px solid ' + BORDER, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Section label */}
          <div style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: TEAL, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: MUTED, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 400 }}>Active Pipeline</span>
            <span style={{ fontSize: 10, color: BLUE, fontWeight: 300 }}>{cands.length} candidates</span>
            <span style={{ fontSize: 9, background: '#E8F0FF', color: BLUE, padding: '1px 6px' }}>API</span>
          </div>

          {/* Funnel */}
          <div style={{ display: 'flex', height: 100, flexShrink: 0 }}>
            {STAGES.map((s, i) => {
              const drop = i > 0 ? Math.round((1 - s.n / STAGES[i - 1].n) * 100) : null;
              const pct = s.n / MAX_N;
              const numSz = Math.round(16 + pct * 14);
              return (
                <div key={s.l} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 2px', position: 'relative', borderRight: 'none' }}>
                  {drop !== null && drop > 0 && <div style={{ position: 'absolute', top: 3, fontSize: 11, color: '#CC3300', fontWeight: 400 }}>-{drop}%</div>}
                  <div style={{ fontSize: numSz, fontWeight: 300, color: DARK, lineHeight: 1, letterSpacing: '-0.01em' }}>{s.n}</div>
                  <div style={{ fontSize: 9.5, color: MUTED, textTransform: 'uppercase', letterSpacing: '.03em', textAlign: 'center', marginTop: 4, lineHeight: 1.2 }}>{s.l}</div>
                </div>
              );
            })}
          </div>

          {/* Search */}
          <div style={{ padding: '8px 16px', display: 'flex', gap: 8, flexShrink: 0, borderBottom: '1px solid ' + BORDER }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <svg style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search candidates..."
                style={{ width: '100%', padding: '6px 10px 6px 28px', border: '1px solid ' + BORDER, fontSize: 12, fontFamily: F, color: DARK, background: '#FFFFFF', outline: 'none' }} />
            </div>
            <select value={stageFilter} onChange={e => setStageFilter(e.target.value)}
              style={{ padding: '6px 10px', border: '1px solid ' + BORDER, fontSize: 12, fontFamily: F, color: MID, background: '#FFFFFF', outline: 'none' }}>
              <option>All Stages</option>
              {['Offer Extended','Final Round','Interview','Recruiter Review','Explorer Screen','Sourced'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '150px 95px 125px 70px 70px 85px 95px 145px', padding: '0 16px', height: 30, alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {['Candidate','Role','Stage','AI Match','Deep','Sentiment','Fit','Actions'].map(h => (
              <div key={h} style={{ fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 400 }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.map((c: any, i: number) => (
              <div key={c.id || i} onClick={() => setProfileOpen(c)}
                style={{ display: 'grid', gridTemplateColumns: '150px 95px 125px 70px 70px 85px 95px 145px', padding: '0 16px', height: 56, alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'background .1s', borderBottom: '1px solid ' + BLIGHT }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(37,99,235,.016)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>

                <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                  <Avatar name={c.name || ''} size={26} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                    <div style={{ fontSize: 10, color: MUTED, fontWeight: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.company}</div>
                  </div>
                </div>

                <div style={{ fontSize: 11, color: MID, fontWeight: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.role}</div>

                {/* Stage - dot + text, no box */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: SD[c.stage] || MUTED, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: SC[c.stage] || MUTED, fontWeight: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.stage}</span>
                </div>

                <div>{c.score > 0 ? <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><Dots v={c.score} /><span style={{ fontSize: 9.5, color: MID }}>{c.score}</span></div> : <span style={{ fontSize: 11, color: MUTED }}>-</span>}</div>

                <div>{c.deepMatch > 0 ? <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><Dots v={c.deepMatch} /><span style={{ fontSize: 9.5, color: TEAL }}>{c.deepMatch}</span></div> : <span style={{ fontSize: 11, color: MUTED }}>-</span>}</div>

                <SentimentBar v={c.sentiment || 0} />

                {/* Fit - plain colored text, no box */}
                <div>
                  <div style={{ fontSize: 11, color: FC[c.fit || 'Pending'] || MUTED, fontWeight: 400, whiteSpace: 'nowrap' }}>{c.fit || 'Pending'}</div>
                  <div style={{ fontSize: 9.5, color: MUTED, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.source || 'Taltas Network'}</div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', whiteSpace: 'nowrap' }}>
                  <button onClick={e => { e.stopPropagation(); setProfileOpen(c); }}
                    style={{ fontSize: 11, color: BLUE, background: 'none', border: 'none', cursor: 'pointer', fontFamily: F, padding: 0 }}>Sentiment Map</button>
                  <span style={{ color: BORDER }}>-</span>
                  <button onClick={e => { e.stopPropagation(); router.push('/candidates/' + (c.id || '')); }}
                    style={{ fontSize: 11, color: DARK, background: 'none', border: 'none', cursor: 'pointer', fontFamily: F, padding: 0, fontWeight: 400 }}>View Profile</button>
                </div>
              </div>
            ))}

          </div>

        </div>

        {/* RIGHT - JOBS + EXPLORERS */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* OPEN JOBS */}
          <div style={{ flex: '0 0 auto', maxHeight: '48%', borderBottom: '1px solid ' + BORDER, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, background: '#F0F4FF' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: BLUE, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: MUTED, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 400 }}>Open Jobs</span>
              <span style={{ fontSize: 10, color: MID, fontWeight: 300 }}>24 active</span>
              <span style={{ fontSize: 9, background: '#E8F0FF', color: BLUE, padding: '1px 6px' }}>API</span>
              <button onClick={() => router.push('/jobs')}
                style={{ marginLeft: 'auto', fontSize: 11, color: '#fff', background: BLUE, border: 'none', padding: '4px 10px', cursor: 'pointer', fontFamily: F }}>
                + New Job
              </button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {jobs.map((j: any, i: number) => {
                const hotCol = j.status === 'HOT' ? '#CC3300' : j.status === 'WARM' ? '#D97706' : MID;
                return (
                  <div key={j.id || i} style={{ padding: '12px 18px', borderTop: i === 0 ? '1px solid ' + BORDER : 'none', borderBottom: '1px solid ' + BLIGHT, cursor: 'pointer', transition: 'background .1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(37,99,235,.015)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                          {j.status === 'HOT' && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#CC3300', flexShrink: 0 }} />}
                          <div style={{ fontSize: 12.5, fontWeight: 400, color: DARK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.title || j.roleName || j.name}</div>
                        </div>
                        <div style={{ fontSize: 11, color: MUTED, fontWeight: 300 }}>{j.sub || j.department}</div>
                        <div style={{ fontSize: 11, color: MUTED, fontWeight: 300 }}>{j.comp || j.salaryRange}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 20, fontWeight: 300, color: DARK, letterSpacing: '-0.02em', lineHeight: 1 }}>{j.candidateCount ?? j.candidates ?? 0}</div>
                        <div style={{ fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '.05em' }}>cands</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* EXPLORER INTERACTIONS */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
            <div style={{ padding: '10px 18px', borderBottom: '1px solid ' + BORDER, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, background: '#F0F4FF' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: TEAL, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: MUTED, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 400 }}>Explorer Agents</span>
              <span style={{ fontSize: 9, background: '#E8F0FF', color: BLUE, padding: '1px 6px' }}>API</span>
              <button onClick={() => router.push('/explorers')}
                style={{ marginLeft: 'auto', fontSize: 11, color: '#fff', background: TEAL, border: 'none', padding: '4px 10px', cursor: 'pointer', fontFamily: F }}>
                + New Agent
              </button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {expls.map((e: any, i: number) => {
                const isAct = e.mode === 'ACTIVE' || e.status === 'active';
                return (
                  <div key={e.id || i} style={{ padding: '12px 18px', borderBottom: '1px solid ' + BLIGHT, cursor: 'pointer', transition: 'background .1s' }}
                    onMouseEnter={el => (el.currentTarget.style.background = 'rgba(29,158,117,.015)')}
                    onMouseLeave={el => (el.currentTarget.style.background = 'transparent')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                          {isAct && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />}
                          <span style={{ fontSize: 12.5, fontWeight: 400, color: DARK }}>{e.name}</span>
                          <span style={{ fontSize: 10, color: isAct ? TEAL : MUTED, fontWeight: 300 }}>{e.mode || 'AUTO'}</span>
                        </div>
                        <div style={{ fontSize: 11, color: MUTED, fontWeight: 300 }}>{e.role}{e.company ? ' - ' + e.company : ''}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 16, fontWeight: 300, color: DARK, letterSpacing: '-0.01em' }}>{e.convos || 0}</div>
                        <div style={{ fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '.05em' }}>convos</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* PROFILE SLIDE-OVER */}
      {profileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', justifyContent: 'flex-end' }}
          onClick={() => setProfileOpen(null)}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,10,.15)' }} />
          <div style={{ position: 'relative', width: 520, background: '#FFFFFF', borderLeft: '1px solid ' + BORDER, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid ' + BORDER, display: 'flex', alignItems: 'flex-start', gap: 14, flexShrink: 0 }}>
              <Avatar name={profileOpen.name || ''} size={48} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 22, fontWeight: 300, letterSpacing: '-0.02em', marginBottom: 4 }}>{profileOpen.name}</div>
                <div style={{ fontSize: 13, color: MID, fontWeight: 300, marginBottom: 6 }}>{profileOpen.role} - {profileOpen.company}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: SD[profileOpen.stage] || MUTED }} />
                  <span style={{ fontSize: 12, color: SC[profileOpen.stage] || MUTED, fontWeight: 300 }}>{profileOpen.stage}</span>
                </div>
              </div>
              <button onClick={() => setProfileOpen(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: 20, lineHeight: 1, padding: 0, flexShrink: 0 }}>-</button>
            </div>

            {profileOpen.score > 0 && (
              <div style={{ padding: '18px 24px', borderBottom: '1px solid ' + BORDER, flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
                  <div><div style={{ fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>AI Match</div><div style={{ fontSize: 28, fontWeight: 300, color: BLUE, letterSpacing: '-0.02em' }}>{profileOpen.score}</div></div>
                  <div><div style={{ fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Deep Match</div><div style={{ fontSize: 28, fontWeight: 300, color: TEAL, letterSpacing: '-0.02em' }}>{profileOpen.deepMatch}</div></div>
                  <div><div style={{ fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Sentiment</div><div style={{ fontSize: 28, fontWeight: 300, color: DARK, letterSpacing: '-0.02em' }}>{profileOpen.sentiment || '-'}</div></div>
                </div>
                {[['Technical Depth',96],['System Thinking',91],['Communication',88],['Culture Alignment',90],['Compensation Fit',94],['Timeline',97]].map(([l,v]: any) => (
                  <div key={l} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 12, color: MID, fontWeight: 300 }}>{l}</span>
                      <span style={{ fontSize: 12, fontWeight: 400, color: v >= 90 ? TEAL : BLUE }}>{v}</span>
                    </div>
                    <div style={{ height: 3, background: '#EBEBEB' }}><div style={{ height: 3, width: v + '%', background: v >= 90 ? TEAL : BLUE }} /></div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ padding: '16px 24px', borderBottom: '1px solid ' + BORDER, flexShrink: 0 }}>
              <div style={{ fontSize: 9, color: MUTED, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10 }}>Compensation</div>
              <div style={{ display: 'flex', gap: 24 }}>
                <div><div style={{ fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 2 }}>Expecting</div><div style={{ fontSize: 20, fontWeight: 300, color: DARK }}>{profileOpen.salaryExpectation || '-'}</div></div>
                <div><div style={{ fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 2 }}>Band</div><div style={{ fontSize: 20, fontWeight: 300, color: TEAL }}>{profileOpen.salaryBand || '-'}</div></div>
                <div><div style={{ fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 2 }}>Start</div><div style={{ fontSize: 20, fontWeight: 300, color: DARK }}>{profileOpen.startDate || '-'}</div></div>
              </div>
            </div>

            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ flex: 1, background: TEAL, border: 'none', color: '#fff', fontFamily: F, fontSize: 13, padding: '10px', cursor: 'pointer' }}>Advance</button>
                <button style={{ flex: 1, background: 'none', border: '1px solid ' + BORDER, color: MID, fontFamily: F, fontSize: 13, padding: '10px', cursor: 'pointer' }}>Hold</button>
                <button style={{ flex: 1, background: 'none', border: '1px solid #FFDDD8', color: '#CC3300', fontFamily: F, fontSize: 13, padding: '10px', cursor: 'pointer' }}>Pass</button>
              </div>
              <button onClick={() => { setProfileOpen(null); router.push('/candidates/' + (profileOpen.id || '')); }}
                style={{ width: '100%', background: 'none', border: 'none', color: BLUE, fontFamily: F, fontSize: 12, padding: '8px', cursor: 'pointer', textAlign: 'left' }}>
                Open full profile -
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Integrations strip */}
      <div style={{ height: 36, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 20, flexShrink: 0, background: '#F0F4FF', borderTop: '1px solid ' + BORDER }}>
        <span style={{ fontSize: 9, color: MUTED, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 400, marginRight: 4, fontFamily: F }}>Integrations</span>
        {[{name:'Greenhouse',ok:true},{name:'BambooHR',ok:true},{name:'Lever',ok:true},{name:'Deel',ok:false},{name:'Bullhorn',ok:false}].map((intg,i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: intg.ok ? '#22C55E' : BORDER, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: intg.ok ? DARK : MUTED, fontWeight: intg.ok ? 400 : 300, fontFamily: F }}>{intg.name}</span>
          </div>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 9.5, color: MUTED, fontFamily: F }}>Last updated - API live</span>
      </div>
    </div>
  );
}
