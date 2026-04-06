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
  { id:'j1', title:'Senior Backend Engineer',  sub:'Data Platform · SF / Remote',     comp:'$200–250K', status:'HOT',  candidates:20 },
  { id:'j2', title:'Platform AI Lead',         sub:'AI Infrastructure · NYC / Remote', comp:'$180–220K', status:'WARM', candidates:23 },
  { id:'j3', title:'Staff Infra Engineer',     sub:'Infrastructure · SF / Seattle',    comp:'$215–270K', status:'HOT',  candidates:18 },
  { id:'j4', title:'Founding Engineer',        sub:'Engineering · Remote',             comp:'$170–210K', status:'HOT',  candidates:15 },
  { id:'j5', title:'Backend Engineer — APIs',  sub:'API Platform · NYC',               comp:'$160–195K', status:'OPEN', candidates:3  },
];

const MOCK_EXPLS = [
  { id:'e1', name:'New Explorer',   mode:'AUTO',   role:'Unknown Role',         company:'Taltas',    convos:0,  a2a:0  },
  { id:'e2', name:'New Explorer',   mode:'AUTO',   role:'Unknown Role',         company:'Taltas',    convos:0,  a2a:0  },
  { id:'e3', name:'StaffML-Agent',  mode:'ACTIVE', role:'Staff ML Engineer',    company:'Anthropic', convos:47, a2a:12 },
  { id:'e4', name:'PrincipalEng',   mode:'ACTIVE', role:'Principal Eng, Platform',company:'Taltas', convos:31, a2a:8  },
];

const STAGES = [
  { l:'Applied',          n:14 },
  { l:'Explorer Screen',  n:11 },
  { l:'Recruiter Review', n:10 },
  { l:'Interview',        n:9  },
  { l:'Hiring Mgr',       n:8  },
  { l:'Final Round',      n:8  },
  { l:'Offer',            n:3  },
];
const MAX_N = 14;

const METRICS = [
  { v:'15',  l:'Open Jobs',         sub:'0 this week',    up:null,  d:'',  desc:'15 open roles across 6 client accounts.' },
  { v:'9',   l:'In Pipeline',       sub:'6 active',       up:true,  d:'↑', desc:'9 candidates in SNAP pipeline. 6 with active sessions.' },
  { v:'14',  l:'Explorer Convos',   sub:'38% match rate', up:true,  d:'↑', desc:'14 Explorer conversations completed. 38% match signal.' },
  { v:'6',   l:'Interviews Sched.', sub:'on track',       up:null,  d:'',  desc:'6 interviews confirmed and scheduled.' },
  { v:'3',   l:'Offers Sent',       sub:'38% rate',       up:true,  d:'↑', desc:'3 offers sent. 38% offer-to-hire rate.' },
  { v:'18d', l:'Avg. Time-to-Hire', sub:'3d vs last mo.', up:false, d:'↓', desc:'18 day avg offer accepted. Industry avg is 44 days.' },
];

const SC: any = {
  'Offer Extended':   { bg:'#E6F5EE', c:'#15703A' },
  'Final Round':      { bg:'#E8F0FF', c:BLUE },
  'Interview':        { bg:'#EDF5FF', c:'#1d4ed8' },
  'Recruiter Review': { bg:'#FFF7E0', c:'#8A6000' },
  'Explorer Screen':  { bg:'#F3EEFF', c:'#7C3AED' },
  'Sourced':          { bg:'#F0F0F0', c:MID },
  'Pending':          { bg:BLIGHT,   c:MUTED },
  'Applied':          { bg:BLIGHT,   c:MUTED },
};

const fitCol: any = {
  'Deep Match':    { bg:'#E8F0FF', c:BLUE },
  'Strong Fit':    { bg:'#E6F5EE', c:TEAL },
  'Good Fit':      { bg:'#E6F5EE', c:TEAL },
  'Potential Fit': { bg:'#FFF7E0', c:'#8A6000' },
  'Pending':       { bg:BLIGHT,   c:MUTED },
};

const jobSt: any = {
  HOT:  { bg:'#FFEAEA', c:'#CC3300' },
  WARM: { bg:'#FFF3DC', c:'#8A5000' },
  OPEN: { bg:'#EEF2FF', c:BLUE },
};

function Avatar({ name = '', size = 30 }: { name?: string; size?: number }) {
  const ini = name.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2) || '?';
  const colors = [BLUE, TEAL, '#E84B3A', '#F5A623', '#635BFF', '#C8571A', '#5E6AD2'];
  const bg = colors[(name.charCodeAt(0) || 0) % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.33, fontWeight: 400, flexShrink: 0, fontFamily: F }}>
      {ini}
    </div>
  );
}

function Dots({ v }: { v: number }) {
  const f = Math.round(v / 10);
  const col = v >= 85 ? TEAL : v >= 65 ? BLUE : '#F5A623';
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: i < f ? col : '#E0E0DB', flexShrink: 0 }} />
      ))}
    </div>
  );
}

function SentimentBar({ v }: { v: number }) {
  if (!v) return <span style={{ fontSize: 11, color: MUTED }}>—</span>;
  const col = v >= 85 ? TEAL : v >= 70 ? BLUE : '#F5A623';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 40, height: 3, background: '#EBEBEB' }}>
        <div style={{ width: v + '%', height: 3, background: col }} />
      </div>
      <span style={{ fontSize: 10, color: col, fontFamily: MONO }}>{v}</span>
    </div>
  );
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
    const ms = (c.name || '').toLowerCase().includes(search.toLowerCase()) || (c.company || '').toLowerCase().includes(search.toLowerCase()) || (c.role || '').toLowerCase().includes(search.toLowerCase());
    const mst = stageFilter === 'All Stages' || c.stage === stageFilter;
    return ms && mst;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: F, color: DARK, background: '#FFFFFF', overflow: 'hidden' }}>

      {/* ── TOPBAR ── */}
      <div style={{ padding: '14px 32px', borderBottom: '1px solid ' + BORDER, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, background: '#FFFFFF' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 400, letterSpacing: '-0.01em', color: DARK }}>Dashboard</div>
          <div style={{ fontSize: 11, color: MUTED, fontWeight: 300 }}>Overview · Today</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', border: '1px solid ' + BORDER }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
            <span style={{ fontSize: 11, color: MID, fontWeight: 300 }}>All Synced · 2m ago</span>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', border: '1px solid ' + BORDER, background: 'none', cursor: 'pointer', fontFamily: F, fontSize: 11, color: MID }}>
            Sync Now
          </button>
        </div>
      </div>

      {/* ── METRICS STRIP ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', borderBottom: '1px solid ' + BORDER, flexShrink: 0, background: BLUE }}>
        {METRICS.map((m, i) => (
          <div key={i}
            onMouseEnter={() => setHovMetric(i)}
            onMouseLeave={() => setHovMetric(null)}
            style={{ padding: '24px 28px', borderRight: i < 5 ? '1px solid rgba(255,255,255,.15)' : 'none', cursor: 'default', transition: 'background .15s', background: hovMetric === i ? 'rgba(255,255,255,.06)' : 'transparent' }}>
            <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,.55)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10, fontFamily: MONO }}>{m.l}</div>
            <div style={{ fontSize: 36, fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1, color: '#fff' }}>{m.v}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
              {m.d && <span style={{ fontSize: 12, color: m.up ? '#6FECB8' : '#FF9E91', fontWeight: 500 }}>{m.d}</span>}
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', fontWeight: 300 }}>{m.sub}</span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', fontWeight: 300, lineHeight: 1.5, marginTop: hovMetric === i ? 8 : 0, maxHeight: hovMetric === i ? 48 : 0, overflow: 'hidden', transition: 'max-height .25s ease, margin-top .25s ease, opacity .25s ease', opacity: hovMetric === i ? 1 : 0 }}>
              {m.desc}
            </div>
          </div>
        ))}
      </div>

      {/* ── BODY ── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 360px', overflow: 'hidden' }}>

        {/* LEFT — PIPELINE + TABLE */}
        <div style={{ borderRight: '1px solid ' + BORDER, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Pipeline header */}
          <div style={{ padding: '12px 24px', borderBottom: '1px solid ' + BORDER, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: TEAL, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: MUTED, letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: MONO }}>Active Pipeline</span>
            <span style={{ fontSize: 9, background: '#E8F0FF', color: BLUE, padding: '2px 7px', fontFamily: MONO }}>API</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: BLUE, fontWeight: 400 }}>{filtered.length} candidates</span>
          </div>

          {/* Funnel — typography as data */}
          <div style={{ display: 'flex', height: 76, borderBottom: '1px solid ' + BORDER, flexShrink: 0 }}>
            {STAGES.map((s, i) => {
              const pct = s.n / MAX_N;
              const numSz = Math.round(13 + pct * 18);
              const drop = i > 0 ? Math.round((1 - s.n / STAGES[i - 1].n) * 100) : null;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 4px', borderRight: i < STAGES.length - 1 ? '1px solid ' + BORDER : 'none', cursor: 'pointer', position: 'relative' }}>
                  {drop !== null && drop > 0 && (
                    <div style={{ position: 'absolute', left: -1, top: '50%', transform: 'translateY(-50%)', fontSize: 7.5, color: '#CC3300', background: '#FFFFFF', padding: '1px 3px', zIndex: 1, lineHeight: 1, borderLeft: '1px solid ' + BORDER }}>-{drop}%</div>
                  )}
                  <div style={{ fontSize: numSz, fontWeight: 300, letterSpacing: '-0.02em', color: DARK, lineHeight: 1, marginBottom: 4 }}>{s.n}</div>
                  <div style={{ fontSize: 7.5, color: MUTED, textTransform: 'uppercase', letterSpacing: '.05em', textAlign: 'center', lineHeight: 1.3, fontFamily: MONO }}>{s.l}</div>
                </div>
              );
            })}
          </div>

          {/* Filters */}
          <div style={{ padding: '10px 24px', borderBottom: '1px solid ' + BORDER, display: 'flex', gap: 8, flexShrink: 0 }}>
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg style={{ position: 'absolute', left: 8 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search candidates..."
                style={{ width: '100%', padding: '6px 10px 6px 28px', border: '1px solid ' + BORDER, fontSize: 12, fontFamily: F, color: DARK, background: '#FFFFFF', outline: 'none' }} />
            </div>
            <select value={stageFilter} onChange={e => setStageFilter(e.target.value)}
              style={{ padding: '6px 10px', border: '1px solid ' + BORDER, fontSize: 12, fontFamily: F, color: MID, background: '#FFFFFF', outline: 'none' }}>
              <option>All Stages</option>
              {STAGES.map(s => <option key={s.l}>{s.l}</option>)}
              <option>Offer Extended</option>
            </select>
          </div>

          {/* Table header — all columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px 110px 130px 80px 90px 110px 100px 90px', padding: '0 16px', height: 34, alignItems: 'center', background: BLIGHT, borderBottom: '1px solid ' + BORDER, flexShrink: 0, gap: 8 }}>
            {['Candidate', 'Role', 'Stage', 'AI Match', 'Deep Match', 'Sentiment Map', 'Fit · Source', 'Actions'].map((h, i) => (
              <div key={i} style={{ fontSize: 9, color: MUTED, letterSpacing: '.09em', textTransform: 'uppercase', fontFamily: MONO, fontWeight: 400, whiteSpace: 'nowrap' }}>{h}</div>
            ))}
          </div>

          {/* Rows — scrollable */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.map((c: any, i: number) => {
              const sc = SC[c.stage] || { bg: BLIGHT, c: MUTED };
              const fc = fitCol[c.fit || 'Pending'] || { bg: BLIGHT, c: MUTED };
              return (
                <div key={c.id || i} onClick={() => setProfileOpen(c)}
                  style={{ display: 'grid', gridTemplateColumns: '180px 110px 130px 80px 90px 110px 100px 90px', padding: '0 16px', height: 52, alignItems: 'center', borderBottom: '1px solid ' + BLIGHT, gap: 8, cursor: 'pointer', transition: 'background .1s', background: '#FFFFFF' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(37,99,235,.016)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#FFFFFF')}>

                  {/* Candidate */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <Avatar name={c.name || ''} size={28} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                      <div style={{ fontSize: 10.5, color: MUTED, fontWeight: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.company}</div>
                    </div>
                  </div>

                  {/* Role */}
                  <div style={{ fontSize: 11, color: MID, fontWeight: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.role}</div>

                  {/* Stage */}
                  <div><span style={{ fontSize: 9.5, padding: '2px 8px', background: sc.bg, color: sc.c, fontWeight: 400, whiteSpace: 'nowrap', display: 'inline-block' }}>{c.stage}</span></div>

                  {/* AI Match */}
                  <div>
                    {c.score > 0
                      ? <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><Dots v={c.score} /><span style={{ fontSize: 9.5, color: MID, fontFamily: MONO }}>{c.score}</span></div>
                      : <span style={{ fontSize: 11, color: MUTED }}>—</span>}
                  </div>

                  {/* Deep Match */}
                  <div>
                    {c.deepMatch > 0
                      ? <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><Dots v={c.deepMatch} /><span style={{ fontSize: 9.5, color: TEAL, fontFamily: MONO }}>{c.deepMatch}</span></div>
                      : <span style={{ fontSize: 11, color: MUTED }}>—</span>}
                  </div>

                  {/* Sentiment */}
                  <SentimentBar v={c.sentiment || 0} />

                  {/* Fit · Source */}
                  <div>
                    <div><span style={{ fontSize: 9, padding: '2px 7px', background: fc.bg, color: fc.c, display: 'inline-block', whiteSpace: 'nowrap' }}>{c.fit || 'Pending'}</span></div>
                    <div style={{ fontSize: 9.5, color: MUTED, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.source || 'Taltas Network'}</div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={e => { e.stopPropagation(); setProfileOpen(c); }}
                      style={{ fontSize: 10, color: BLUE, background: 'none', border: '1px solid #C8D8FF', padding: '3px 8px', cursor: 'pointer', fontFamily: F, whiteSpace: 'nowrap' }}>
                      Map
                    </button>
                    <button onClick={e => { e.stopPropagation(); router.push('/candidates/' + (c.id || '')); }}
                      style={{ fontSize: 10, color: '#fff', background: BLUE, border: 'none', padding: '3px 8px', cursor: 'pointer', fontFamily: F, whiteSpace: 'nowrap' }}>
                      Profile
                    </button>
                  </div>
                </div>
              );
            })}

          {/* Integrations strip */}
          <div style={{ flexShrink: 0, borderTop: '1px solid ' + BORDER }}>
            <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, background: BLIGHT }}>
              <span style={{ fontSize: 9, color: MID, letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: F, fontWeight: 400 }}>HR Integrations</span>
              <span style={{ fontSize: 9, background: '#E8F0FF', color: BLUE, padding: '1px 6px', fontFamily: MONO }}>API</span>
              <span style={{ marginLeft: 'auto', fontSize: 10, color: TEAL }}>10 Connected</span>
            </div>
            <div style={{ padding: '8px 16px', display: 'flex', gap: 16 }}>
              {[{name:'Greenhouse',status:'connected'},{name:'BambooHR',status:'connected'},{name:'Lever',status:'needs-setup'}].map((intg,i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: intg.status === 'connected' ? TEAL : '#F5A623', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: MID, fontWeight: 300 }}>{intg.name}</span>
                </div>
              ))}
            </div>
          </div>
          </div>
        </div>

        {/* RIGHT — JOBS + EXPLORERS */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* OPEN JOBS */}
          <div style={{ flex: '0 0 auto', maxHeight: '52%', borderBottom: '1px solid ' + BORDER, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid ' + BORDER, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, background: '#F0F4FF' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: BLUE, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: BLUE, letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: MONO }}>Open Jobs</span>
              <span style={{ fontSize: 9, background: '#E8F0FF', color: BLUE, padding: '2px 7px', fontFamily: MONO }}>API</span>
              <span style={{ fontSize: 11, color: MID, fontWeight: 300 }}>24 active</span>
              <button onClick={() => {}} onClick={() => router.push('/jobs')} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', background: BLUE, border: 'none', fontSize: 11, color: '#fff', cursor: 'pointer', fontFamily: F }}>
                + New Job
              </button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {jobs.map((j: any, i: number) => {
                const st = jobSt[j.status] || jobSt.OPEN;
                return (
                  <div key={j.id || i} style={{ padding: '14px 20px', borderBottom: i < jobs.length - 1 ? '1px solid ' + BLIGHT : 'none', cursor: 'pointer', transition: 'background .1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(37,99,235,.015)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                          <div style={{ fontSize: 13, fontWeight: 400, color: DARK }}>{j.title || j.roleName || j.name}</div>
                          <span style={{ fontSize: 9, padding: '2px 7px', background: st.bg, color: st.c, fontWeight: 500, letterSpacing: '.04em', flexShrink: 0 }}>{j.status}</span>
                        </div>
                        <div style={{ fontSize: 11.5, color: MID, fontWeight: 300, marginBottom: 2 }}>{j.sub}</div>
                        <div style={{ fontSize: 11, color: MUTED, fontWeight: 300 }}>{j.comp}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 22, fontWeight: 300, color: DARK, letterSpacing: '-0.02em', lineHeight: 1 }}>{j.candidateCount ?? j.candidates ?? 0}</div>
                        <div style={{ fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: MONO }}>cands</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* EXPLORER INTERACTIONS */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid ' + BORDER, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, background: '#F0FFF8' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: TEAL, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: TEAL, letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: MONO }}>Explorer Interactions</span>
              <span style={{ fontSize: 9, background: '#E8F0FF', color: BLUE, padding: '2px 7px', fontFamily: MONO }}>API</span>
              <button onClick={() => router.push('/explorers')} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', border: '1px solid ' + BORDER, background: 'none', fontSize: 11, color: MID, cursor: 'pointer', fontFamily: F }}>
                + New Explorer
              </button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {expls.map((e: any, i: number) => {
                const isAct = e.mode === 'ACTIVE' || e.status === 'active';
                return (
                  <div key={e.id || i} style={{ padding: '12px 20px', borderBottom: i < expls.length - 1 ? '1px solid ' + BLIGHT : 'none', cursor: 'pointer', transition: 'background .1s' }}
                    onMouseEnter={el => (el.currentTarget.style.background = 'rgba(29,158,117,.015)')}
                    onMouseLeave={el => (el.currentTarget.style.background = 'transparent')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 30, height: 30, background: BLIGHT, border: '1px solid ' + BORDER, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z"/><path d="M12 3a4 4 0 0 0-4 4v4h8V7a4 4 0 0 0-4-4z"/></svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 400, color: DARK }}>{e.name}</span>
                          <span style={{ fontSize: 9, padding: '2px 7px', background: isAct ? '#E6F5EE' : '#E8F0FF', color: isAct ? '#15703A' : BLUE, fontFamily: MONO }}>{e.mode || e.status || 'AUTO'}</span>
                          {isAct && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />}
                        </div>
                        <div style={{ fontSize: 11, color: MUTED, fontWeight: 300 }}>{e.role}{e.company ? ' · ' + e.company : ''}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, paddingLeft: 40, marginTop: 6 }}>
                      <span style={{ fontSize: 11, color: MUTED, fontWeight: 300 }}>{e.convos || 0} convos</span>
                      <span style={{ fontSize: 11, color: MUTED, fontWeight: 300 }}>{e.a2a || 0} A2A</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* INTEGRATIONS */}
          <div style={{ flexShrink: 0, borderTop: '1px solid ' + BORDER }}>
  
          </div>
        </div>
      </div>

      {/* ── PROFILE SLIDE-OVER ── */}
      {profileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', justifyContent: 'flex-end' }}
          onClick={() => setProfileOpen(null)}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,10,.2)' }} />
          <div style={{ position: 'relative', width: 540, background: '#FFFFFF', borderLeft: '1px solid ' + BORDER, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}>

            <div style={{ padding: '20px 24px', borderBottom: '1px solid ' + BORDER, display: 'flex', alignItems: 'flex-start', gap: 14, flexShrink: 0 }}>
              <Avatar name={profileOpen.name || ''} size={52} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 22, fontWeight: 300, letterSpacing: '-0.02em' }}>{profileOpen.name}</span>
                  <span style={{ fontSize: 9.5, padding: '2px 8px', background: (SC[profileOpen.stage] || { bg: BLIGHT }).bg, color: (SC[profileOpen.stage] || { c: MUTED }).c }}>{profileOpen.stage}</span>
                </div>
                <div style={{ fontSize: 13, color: MID, fontWeight: 300, marginBottom: 4 }}>{profileOpen.role} · {profileOpen.company}</div>
                {profileOpen.score > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <Dots v={profileOpen.score} />
                    <span style={{ fontSize: 12, fontWeight: 400, color: BLUE }}>{profileOpen.score} AI Match</span>
                    <span style={{ fontSize: 12, fontWeight: 400, color: TEAL }}>{profileOpen.deepMatch} Deep Match</span>
                  </div>
                )}
              </div>
              <button onClick={() => setProfileOpen(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: 20, lineHeight: 1, padding: '2px', flexShrink: 0 }}>×</button>
            </div>

            {profileOpen.score > 0 && (
              <div style={{ padding: '18px 24px', borderBottom: '1px solid ' + BORDER, flexShrink: 0 }}>
                <div style={{ fontSize: 10, color: MUTED, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12, fontFamily: MONO }}>6-Dimension Match</div>
                {[['Technical Depth', 96], ['System Thinking', 91], ['Communication', 88], ['Culture Alignment', 90], ['Compensation Fit', 94], ['Timeline', 97]].map(([l, v]: any) => (
                  <div key={l} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 12, color: MID, fontWeight: 300 }}>{l}</span>
                      <span style={{ fontSize: 12, fontWeight: 400, color: v >= 90 ? TEAL : BLUE }}>{v}</span>
                    </div>
                    <div style={{ height: 3, background: '#EBEBEB' }}>
                      <div style={{ height: 3, width: v + '%', background: v >= 90 ? TEAL : BLUE }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ padding: '16px 24px', borderBottom: '1px solid ' + BORDER, flexShrink: 0 }}>
              <div style={{ fontSize: 10, color: MUTED, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10, fontFamily: MONO }}>Compensation</div>
              <div style={{ display: 'flex', gap: 24 }}>
                <div><div style={{ fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 2, fontFamily: MONO }}>Expecting</div><div style={{ fontSize: 20, fontWeight: 300, color: DARK }}>{profileOpen.salaryExpectation || '—'}</div></div>
                <div><div style={{ fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 2, fontFamily: MONO }}>Band</div><div style={{ fontSize: 20, fontWeight: 300, color: TEAL }}>{profileOpen.salaryBand || '—'}</div></div>
                <div><div style={{ fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 2, fontFamily: MONO }}>Start</div><div style={{ fontSize: 20, fontWeight: 300, color: DARK }}>{profileOpen.startDate || '—'}</div></div>
              </div>
            </div>

            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ flex: 1, background: TEAL, border: 'none', color: '#fff', fontFamily: F, fontSize: 13, padding: '10px', cursor: 'pointer' }}>Advance →</button>
                <button style={{ flex: 1, background: 'none', border: '1px solid ' + BORDER, color: MID, fontFamily: F, fontSize: 13, padding: '10px', cursor: 'pointer' }}>Hold</button>
                <button style={{ flex: 1, background: 'none', border: '1px solid #FFDDD8', color: '#CC3300', fontFamily: F, fontSize: 13, padding: '10px', cursor: 'pointer' }}>Pass</button>
              </div>
              <button onClick={() => { setProfileOpen(null); router.push('/candidates/' + (profileOpen.id || '')); }}
                style={{ width: '100%', background: 'none', border: '1px solid ' + BORDER, color: BLUE, fontFamily: F, fontSize: 12, padding: '8px', cursor: 'pointer' }}>
                Open full profile →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <div style={{ height: 32, borderTop: '1px solid ' + BORDER, background: '#FFFFFF', display: 'flex', alignItems: 'center', padding: '0 28px', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: 9.5, color: MUTED, letterSpacing: '.06em', textTransform: 'uppercase', fontFamily: MONO }}>Taltas · Talent Atlas</span>
        <span style={{ fontSize: 9.5, color: MUTED, fontFamily: MONO }}>Last updated · API live</span>
      </div>
    </div>
  );
}
