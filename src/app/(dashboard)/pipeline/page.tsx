// @ts-nocheck
'use client';
import { useState } from 'react';
import { usePipeline } from '@/lib/data-provider';
import { DataSourceBadge } from '@/components/shared/api-status';

const F = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const MONO = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const BLUE = '#2563eb';
const TEAL = '#1D9E75';
const DARK = '#0A0A0A';
const MID = '#6B6B6B';
const MUTED = '#AAAAAA';
const BORDER = '#E8E8E5';
const BLIGHT = '#F4F4F2';

const MOCK_STAGES = [
  { stage: 'Applied',          n: 14 },
  { stage: 'Explorer Screen',  n: 11 },
  { stage: 'Recruiter Review', n: 10 },
  { stage: 'Interview',        n: 9  },
  { stage: 'Hiring Mgr',       n: 8  },
  { stage: 'Final Round',      n: 8  },
  { stage: 'Offer',            n: 3  },
];

const MOCK_BOTTLENECKS = [
  { stage: 'Recruiter Review', desc: 'Avg 6.2d — above target', pct: 82, days: '6.2d', status: 'Slow',   statusColor: 'orange', color: '#D97706' },
  { stage: 'Interview',        desc: 'Avg 4.8d — on track',    pct: 64, days: '4.8d', status: 'OK',     statusColor: 'blue',   color: BLUE },
  { stage: 'Final Round',      desc: 'Avg 2.1d — fast',        pct: 28, days: '2.1d', status: 'Fast',   statusColor: 'green',  color: TEAL },
];

const MOCK_SOURCES = [
  { source: 'Taltas Network', applied: 89, screened: 71, offered: 18, convRate: '20.2%', color: BLUE },
  { source: 'LinkedIn',       applied: 72, screened: 52, offered: 9,  convRate: '12.5%', color: MID },
  { source: 'Greenhouse',     applied: 58, screened: 44, offered: 11, convRate: '19.0%', color: TEAL },
  { source: 'Indeed',         applied: 45, screened: 28, offered: 4,  convRate: '8.9%',  color: '#D97706' },
  { source: 'Referral',       applied: 34, screened: 30, offered: 10, convRate: '29.4%', color: '#635BFF' },
];

const MOCK_VELOCITY = [
  { role: 'Staff ML Engineer',    avgDays: 18, status: 'fast'   },
  { role: 'Principal Engineer',   avgDays: 24, status: 'ok'     },
  { role: 'DevRel Engineer',      avgDays: 31, status: 'slow'   },
  { role: 'Staff AI Systems',     avgDays: 20, status: 'ok'     },
  { role: 'Senior Data Engineer', avgDays: 38, status: 'slow'   },
];

const MOCK_WEEKLY = [
  { week: 'W1 Feb', applied: 28, screened: 19, offered: 3 },
  { week: 'W2 Feb', applied: 34, screened: 25, offered: 4 },
  { week: 'W3 Feb', applied: 41, screened: 30, offered: 5 },
  { week: 'W4 Feb', applied: 47, screened: 38, offered: 6 },
];

function SL({ t }: { t: string }) {
  return <div style={{ fontSize: 10, color: MUTED, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12, fontFamily: F, fontWeight: 400 }}>{t}</div>;
}

export default function PipelinePage() {
  const [dateRange, setDateRange] = useState('1m');
  const [roleFilter, setRoleFilter] = useState('');
  const [startDate, setStartDate] = useState('2026-02-01');
  const [endDate, setEndDate] = useState('2026-02-28');

  const pipelineQuery = usePipeline();
  const pipeData = pipelineQuery.data?.data;
  const fromApi = !!pipelineQuery.data?.fromApi;

  const stages = pipeData?.stages?.length ? pipeData.stages.map((s: any) => ({ stage: s.stage || s.name, n: s.count || s.n })) : MOCK_STAGES;
  const bottlenecks = pipeData?.bottlenecks?.length ? pipeData.bottlenecks : MOCK_BOTTLENECKS;
  const sourceData = pipeData?.sourceData?.length ? pipeData.sourceData : MOCK_SOURCES;
  const roleVelocity = pipeData?.roleVelocity?.length ? pipeData.roleVelocity : MOCK_VELOCITY;
  const weeklyTrend = pipeData?.weeklyTrend?.length ? pipeData.weeklyTrend : MOCK_WEEKLY;

  const maxN = Math.max(...stages.map((s: any) => s.n));
  const dateLabel = dateRange === '1m' ? 'Feb 2026' : dateRange === '3m' ? 'Dec 2025 - Feb 2026' : dateRange === '6m' ? 'Sep 2025 - Feb 2026' : 'Mar 2025 - Feb 2026';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: F }}>

      {/* Parameters */}
      <div style={{ background: '#FFFFFF', border: '1px solid ' + BORDER, padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
          <SL t="Pipeline Parameters" />
          <div style={{ display: 'flex', gap: 2, padding: 3, background: BLIGHT }}>
            {[{ k: '1m', l: '1M' }, { k: '3m', l: '3M' }, { k: '6m', l: '6M' }, { k: '12m', l: '12M' }].map(({ k, l }) => (
              <button key={k} onClick={() => setDateRange(k)}
                style={{ fontSize: 10, padding: '3px 10px', background: dateRange === k ? '#fff' : 'transparent', border: dateRange === k ? '1px solid ' + BORDER : '1px solid transparent', color: dateRange === k ? BLUE : MUTED, cursor: 'pointer', fontFamily: F }}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            style={{ fontSize: 11, padding: '5px 8px', border: '1px solid ' + BORDER, fontFamily: F, color: DARK, outline: 'none', width: 130 }} />
          <span style={{ fontSize: 11, color: MUTED }}>to</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            style={{ fontSize: 11, padding: '5px 8px', border: '1px solid ' + BORDER, fontFamily: F, color: DARK, outline: 'none', width: 130 }} />
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            style={{ padding: '5px 10px', border: '1px solid ' + BORDER, fontSize: 12, fontFamily: F, color: MID, background: '#fff', outline: 'none' }}>
            <option value="">All Roles</option>
            <option>Staff ML Engineer</option>
            <option>Principal Eng.</option>
            <option>DevRel Engineer</option>
          </select>
        </div>
      </div>

      {/* Pipeline Funnel — typography as data */}
      <div style={{ background: '#FFFFFF', border: '1px solid ' + BORDER, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: TEAL }} />
            <span style={{ fontSize: 12, color: MUTED, letterSpacing: '.06em', textTransform: 'uppercase', fontFamily: F, fontWeight: 400 }}>
              Pipeline Funnel · All Roles
            </span>
            <DataSourceBadge fromApi={fromApi} />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: BLUE, background: '#EDF5FF', padding: '2px 8px', fontFamily: F }}>{dateLabel}</span>
            <button style={{ fontSize: 11, color: '#fff', background: BLUE, border: 'none', padding: '5px 12px', cursor: 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', gap: 4 }}>
              Export
            </button>
          </div>
        </div>

        {/* Typography funnel */}
        <div style={{ display: 'flex', borderBottom: '1px solid ' + BORDER, borderTop: '1px solid ' + BORDER }}>
          {stages.map((s: any, i: number) => {
            const pct = s.n / maxN;
            const numSz = Math.round(13 + pct * 22);
            const drop = i > 0 ? Math.round((1 - s.n / stages[i - 1].n) * 100) : null;
            return (
              <div key={s.stage} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 4px', borderRight: i < stages.length - 1 ? '1px solid ' + BORDER : 'none', cursor: 'pointer', position: 'relative', minHeight: 90 }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(37,99,235,.016)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                {drop !== null && drop > 0 && (
                  <div style={{ position: 'absolute', left: -1, top: '50%', transform: 'translateY(-50%)', fontSize: 7.5, color: '#CC3300', background: '#FFFFFF', padding: '1px 3px', zIndex: 1, lineHeight: 1, borderLeft: '1px solid ' + BORDER }}>-{drop}%</div>
                )}
                <div style={{ fontSize: numSz, fontWeight: 300, letterSpacing: '-0.02em', color: DARK, lineHeight: 1, marginBottom: 6 }}>{s.n}</div>
                <div style={{ fontSize: 8, color: MUTED, textTransform: 'uppercase', letterSpacing: '.06em', textAlign: 'center', lineHeight: 1.3, fontFamily: F }}>{s.stage}</div>
              </div>
            );
          })}
        </div>

        {/* Summary stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 16, gap: 0 }}>
          {[
            { label: 'Overall Conversion', value: '10.1%', sub: 'Applied to Offer · +2.3% vs last quarter', col: BLUE },
            { label: 'Avg. Stage Velocity', value: '4.2d', sub: 'Per stage · -0.8d from last month', col: DARK },
            { label: 'Deep Match Uplift', value: '+34%', sub: 'Offer rate vs ATS-only screening', col: TEAL },
          ].map((s, i) => (
            <div key={s.label} style={{ padding: '14px 20px', borderRight: i < 2 ? '1px solid ' + BORDER : 'none', textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: MUTED, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6, fontFamily: F }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 300, color: s.col, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: MUTED, fontWeight: 300 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Trend */}
      {weeklyTrend.length > 0 && (
        <div style={{ background: '#FFFFFF', border: '1px solid ' + BORDER, padding: '20px 24px' }}>
          <SL t={`Weekly Pipeline Trend · ${dateLabel}`} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: BORDER, border: '1px solid ' + BORDER }}>
            {weeklyTrend.map((w: any, i: number) => (
              <div key={w.week || i} style={{ background: '#FFFFFF', padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: MUTED, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8, fontFamily: F }}>{w.week}</div>
                <div style={{ fontSize: 28, fontWeight: 300, color: DARK, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 4 }}>{w.applied}</div>
                <div style={{ fontSize: 9, color: MUTED, marginBottom: 12, fontFamily: F }}>Applied</div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 300, color: BLUE, letterSpacing: '-0.01em' }}>{w.screened}</div>
                    <div style={{ fontSize: 9, color: MUTED, fontFamily: F }}>Screened</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 300, color: TEAL, letterSpacing: '-0.01em' }}>{w.offered}</div>
                    <div style={{ fontSize: 9, color: MUTED, fontFamily: F }}>Offered</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time-in-Stage */}
      <div style={{ background: '#FFFFFF', border: '1px solid ' + BORDER, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <SL t="Time-in-Stage Analysis" />
          <span style={{ fontSize: 10, color: '#D97706', background: 'rgba(217,119,6,.08)', border: '1px solid rgba(217,119,6,.2)', padding: '2px 10px', fontFamily: F }}>
            {bottlenecks.filter((b: any) => b.status === 'Slow' || b.status === 'slow').length} bottlenecks detected
          </span>
        </div>
        {bottlenecks.map((b: any, i: number) => {
          const col = b.status === 'Fast' || b.status === 'fast' ? TEAL : b.status === 'Slow' || b.status === 'slow' ? '#D97706' : BLUE;
          return (
            <div key={b.stage} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < bottlenecks.length - 1 ? '1px solid ' + BORDER : 'none' }}>
              <span style={{ fontSize: 12, color: MID, flexShrink: 0, width: 140, fontWeight: 300 }}>{b.stage}</span>
              <span style={{ fontSize: 11, color: MUTED, flex: 1, fontWeight: 300 }}>{b.desc}</span>
              <div style={{ width: 120, height: 4, background: BLIGHT, flexShrink: 0 }}>
                <div style={{ height: 4, width: `${b.pct}%`, background: col }} />
              </div>
              <span style={{ fontSize: 18, fontWeight: 300, color: DARK, width: 48, textAlign: 'right', flexShrink: 0, letterSpacing: '-0.01em' }}>{b.days}</span>
              <span style={{ fontSize: 9, padding: '2px 8px', color: col, background: `rgba(${col === TEAL ? '29,158,117' : col === '#D97706' ? '217,119,6' : '37,99,235'},.08)`, fontFamily: F, flexShrink: 0 }}>{b.status}</span>
            </div>
          );
        })}
      </div>

      {/* Source Effectiveness + Role Velocity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Source Effectiveness */}
        <div style={{ background: '#FFFFFF', border: '1px solid ' + BORDER, padding: '20px 24px' }}>
          <SL t="Source Effectiveness" />
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Source', 'Applied', 'Screened', 'Offered', 'Conv %'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '.08em', borderBottom: '1px solid ' + BORDER, background: BLIGHT, fontFamily: F, fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sourceData.map((s: any, i: number) => (
                <tr key={s.source} style={{ background: i % 2 === 0 ? '#fff' : BLIGHT }}>
                  <td style={{ padding: '8px 10px', fontSize: 12, color: MID, fontWeight: 300 }}>{s.source}</td>
                  <td style={{ padding: '8px 10px', fontSize: 11, color: MUTED, fontFamily: F }}>{s.applied}</td>
                  <td style={{ padding: '8px 10px', fontSize: 11, color: MUTED, fontFamily: F }}>{s.screened}</td>
                  <td style={{ padding: '8px 10px', fontSize: 11, color: TEAL, fontFamily: F, fontWeight: 500 }}>{s.offered}</td>
                  <td style={{ padding: '8px 10px' }}>
                    <span style={{ fontSize: 10, color: s.color || BLUE, background: 'rgba(37,99,235,.06)', padding: '2px 7px', fontFamily: F }}>{s.convRate}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Role Velocity */}
        <div style={{ background: '#FFFFFF', border: '1px solid ' + BORDER, padding: '20px 24px' }}>
          <SL t="Role Velocity (Avg Days to Hire)" />
          {roleVelocity.map((r: any, i: number) => {
            const pct = Math.min(100, (r.avgDays / 40) * 100);
            const col = r.status === 'fast' ? TEAL : r.status === 'slow' ? '#D97706' : BLUE;
            return (
              <div key={r.role} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: MID, flexShrink: 0, width: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 300 }}>{r.role}</span>
                <div style={{ flex: 1, height: 5, background: BLIGHT }}>
                  <div style={{ height: 5, width: `${pct}%`, background: col }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 400, color: col, width: 36, textAlign: 'right', flexShrink: 0 }}>{r.avgDays}d</span>
                <span style={{ fontSize: 8, padding: '2px 7px', color: col, background: `rgba(${col === TEAL ? '29,158,117' : col === '#D97706' ? '217,119,6' : '37,99,235'},.08)`, flexShrink: 0, fontFamily: F }}>
                  {r.status === 'fast' ? 'Fast' : r.status === 'slow' ? 'Slow' : 'OK'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
