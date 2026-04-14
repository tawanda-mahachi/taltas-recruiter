// @ts-nocheck
// cache-bust: chart-heights-v2
'use client';
import { useState, useRef, useEffect, memo, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { usePipeline } from '@/lib/data-provider';
import { DataSourceBadge } from '@/components/shared/api-status';

const RadarChart        = dynamic(() => import('@/components/charts/pipeline-charts').then(m => m.RadarChart),          { ssr: false });
const ParetoChart       = dynamic(() => import('@/components/charts/pipeline-charts').then(m => m.ParetoChart),         { ssr: false });
const ConversionGauge   = dynamic(() => import('@/components/charts/pipeline-charts').then(m => m.ConversionGauge),     { ssr: false, loading: () => <div style={{ height: 200 }} /> });
const MatchDistribution = dynamic(() => import('@/components/charts/pipeline-charts').then(m => m.MatchDistribution),   { ssr: false, loading: () => <div style={{ height: 160 }} /> });
const StageVelocityChart= dynamic(() => import('@/components/charts/pipeline-charts').then(m => m.StageVelocityChart),  { ssr: false, loading: () => <div style={{ height: 220 }} /> });
const PipelineTrend     = dynamic(() => import('@/components/charts/pipeline-charts').then(m => m.PipelineTrend),       { ssr: false, loading: () => <div style={{ height: 220 }} /> });
const RoleVelocityChart = dynamic(() => import('@/components/charts/pipeline-charts').then(m => m.RoleVelocityChart),   { ssr: false });

const F      = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const BLUE   = '#2563eb';
const TEAL   = '#1D9E75';
const DARK   = '#0A0A0A';
const MID    = '#6B6B6B';
const MUTED  = '#AAAAAA';
const BORDER = '#E8E8E5';
const BLIGHT = '#F4F4F2';

const MOCK_STAGES = [
  { stage: 'Applied',          n: 63, color: '#1e3a8a' },
  { stage: 'Explorer Screen',  n: 47, color: '#1e40af' },
  { stage: 'Recruiter Review', n: 38, color: '#2563eb' },
  { stage: 'Interview',        n: 29, color: '#1D9E75' },
  { stage: 'Hiring Mgr',       n: 22, color: '#16a34a' },
  { stage: 'Final Round',      n: 14, color: '#15803d' },
  { stage: 'Offer',            n: 9,  color: '#166534' },
];

const MOCK_BOTTLENECKS = [
  { stage: 'Applied',          desc: 'Avg 31.1 days - above target', pct: 82, days: '31.1', status: 'Critical', color: '#DC2626' },
  { stage: 'Explorer Screen',  desc: 'Avg 50.4 days - above target', pct: 92, days: '50.4', status: 'Critical', color: '#DC2626' },
  { stage: 'Recruiter Review', desc: 'Avg 6.2 days - above target',  pct: 72, days: '6.2',  status: 'Slow',     color: '#D97706' },
  { stage: 'Interview',        desc: 'Avg 4.8 days - on track',      pct: 55, days: '4.8',  status: 'OK',       color: BLUE      },
  { stage: 'Final Round',      desc: 'Avg 2.1 days - fast',          pct: 28, days: '2.1',  status: 'Fast',     color: TEAL      },
];

const MOCK_SOURCES = [
  { source: 'Taltas Network', applied: 89, screened: 71, offered: 18, convRate: '20.2%', color: BLUE },
  { source: 'LinkedIn',       applied: 72, screened: 52, offered: 9,  convRate: '12.5%', color: MID },
  { source: 'Greenhouse',     applied: 58, screened: 44, offered: 11, convRate: '19.0%', color: TEAL },
  { source: 'Indeed',         applied: 45, screened: 28, offered: 4,  convRate: '8.9%',  color: '#D97706' },
  { source: 'Referral',       applied: 34, screened: 30, offered: 10, convRate: '29.4%', color: '#635BFF' },
];

const MOCK_VELOCITY = [
  { role: 'Staff ML Engineer',    avgDays: 18, status: 'fast' },
  { role: 'Principal Engineer',   avgDays: 24, status: 'ok'   },
  { role: 'DevRel Engineer',      avgDays: 31, status: 'slow' },
  { role: 'Staff AI Systems',     avgDays: 20, status: 'ok'   },
  { role: 'Sr. Data Engineer',    avgDays: 38, status: 'slow' },
  { role: 'Security Engineer',    avgDays: 22, status: 'ok'   },
  { role: 'Frontend Lead',        avgDays: 15, status: 'fast' },
  { role: 'Engineering Manager',  avgDays: 28, status: 'ok'   },
  { role: 'Product Designer',     avgDays: 19, status: 'fast' },
  { role: 'Backend Engineer',     avgDays: 33, status: 'slow' },
  { role: 'ML Engineer',          avgDays: 25, status: 'ok'   },
  { role: 'Staff Infra Engineer', avgDays: 17, status: 'fast' },
];

const MOCK_RADAR_DIMS = [
  { name: 'Technical',   value: 88, target: 64 },
  { name: 'Cultural',    value: 92, target: 58 },
  { name: 'Leadership',  value: 85, target: 70 },
  { name: 'Growth',      value: 78, target: 65 },
  { name: 'Application', value: 90, target: 55 },
  { name: 'Behavioural', value: 86, target: 62 },
];

const MOCK_PARETO = [
  { name: 'Skill Mismatch', count: 42, cumPct: 38  },
  { name: 'Experience Gap', count: 31, cumPct: 66  },
  { name: 'Culture Fit',    count: 18, cumPct: 82  },
  { name: 'Salary Gap',     count: 11, cumPct: 92  },
  { name: 'Location',       count: 5,  cumPct: 97  },
  { name: 'Timeline',       count: 2,  cumPct: 99  },
  { name: 'Other',          count: 1,  cumPct: 100 },
];

const MOCK_STAGE_VEL = [
  { stage: 'Offer',            target: 0.8, actual: 1.4 },
  { stage: 'Hiring Mgr',       target: 2.0, actual: 2.0 },
  { stage: 'Recruiter Review', target: 3.2, actual: 5.9 },
  { stage: 'Applied',          target: 2.1, actual: 4.8 },
];

const MOCK_MATCH_DIST = [3, 2, 4, 3, 6, 5];

function SL({ label, color = TEAL, children }: { label: string; color?: string; children?: any }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14, fontFamily: F }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 9, color: MUTED, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 400, flex: 1 }}>{label}</span>
      {children}
    </div>
  );
}

function Panel({ children, style = {} }: { children: any; style?: any }) {
  return <div style={{ background: '#FFFFFF', border: '1px solid ' + BORDER, padding: '18px 22px', ...style }}>{children}</div>;
}



const SVGFunnel = memo(function SVGFunnel({ stages }: { stages: typeof MOCK_STAGES }) {
  const maxN = Math.max(...stages.map(s => s.n));
  const H = 48, GAP = 3;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
      {stages.map((s, i) => {
        const pct = s.n / maxN;
        const nextPct = i < stages.length - 1 ? stages[i + 1].n / maxN : pct * 0.82;
        const tl = ((1 - pct) / 2 * 100).toFixed(1);
        const tr = (100 - (1 - pct) / 2 * 100).toFixed(1);
        const bl = ((1 - nextPct) / 2 * 100).toFixed(1);
        const br = (100 - (1 - nextPct) / 2 * 100).toFixed(1);
        const drop = i > 0 ? Math.round((1 - s.n / stages[i - 1].n) * 100) : null;
        return (
          <div key={s.stage} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 38, flexShrink: 0, textAlign: 'right' }}>
              {drop !== null && drop > 0 && (
                <span style={{ fontSize: 9, color: '#CC3300', fontWeight: 400, fontFamily: F }}>-{drop}%</span>
              )}
            </div>
            <div style={{ flex: 1, height: H, position: 'relative' }}>
              <div style={{
                position: 'absolute', inset: 0,
                clipPath: `polygon(${tl}% 0%, ${tr}% 0%, ${br}% 100%, ${bl}% 100%)`,
                background: s.color, opacity: 0.92
              }} />
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}>
                <span style={{ fontSize: 11, color: '#fff', fontWeight: 300, fontFamily: F, whiteSpace: 'nowrap' }}>{s.stage}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 300, fontFamily: F }}>{s.n}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default function PipelinePage() {
  const pipelineQuery = usePipeline();
  const pipeData = pipelineQuery.data?.data;
  const fromApi = !!pipelineQuery.data?.fromApi;

  const stages = useMemo(() => pipeData?.stages?.length
    ? pipeData.stages.map((s: any, i: number) => ({ stage: s.stage || s.name || s.key || MOCK_STAGES[i]?.stage || ('Stage ' + (i+1)), n: s.count || s.n || s.candidateCount || 0, color: MOCK_STAGES[i]?.color || '#1e3a8a' }))
    : MOCK_STAGES, [pipeData?.stages]);
  const bottlenecks  = pipeData?.bottlenecks?.length  ? pipeData.bottlenecks  : MOCK_BOTTLENECKS;
  const sourceData   = pipeData?.sourceData?.length   ? pipeData.sourceData   : MOCK_SOURCES;
  const roleVelocity = pipeData?.roleVelocity?.length ? pipeData.roleVelocity : MOCK_VELOCITY;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, fontFamily: F, overflow: 'hidden' }}>

      {/* PAGE HEADER */}
      <div style={{ height: 68, paddingLeft: 24, paddingRight: 24, borderBottom: '1px solid ' + BORDER, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>  
        <div>
          <div style={{ fontSize: 15, fontWeight: 400, letterSpacing: '-0.01em', color: DARK }}>Pipeline</div>
          <div style={{ fontSize: 11, color: MUTED, fontWeight: 300, marginTop: 1 }}>Hiring Analytics · Feb 2026 <DataSourceBadge fromApi={fromApi} /></div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button style={{ fontSize: 11, color: '#fff', background: BLUE, border: 'none', padding: '5px 14px', cursor: 'pointer', fontFamily: F }}>Export</button>
        </div>
      </div>

      {/* METRICS STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', background: BLUE, flexShrink: 0 }}>
        {[
          { v: '89',      l: 'Total Candidates',   sub: 'Active in pipeline' },
          { v: '14.3%',   l: 'Conversion Rate',    sub: 'Applied to offer' },
          { v: '4.2d',    l: 'Avg Stage Velocity',  sub: 'Days per stage' },
          { v: fromApi ? 'Live' : 'Mock', l: 'Data Status', sub: fromApi ? 'API connected' : 'Using mock data' },
        ].map((m, i) => (
          <div key={i} style={{ padding: '18px 24px', borderRight: i < 3 ? '1px solid rgba(255,255,255,.1)' : 'none' }}>
            <div style={{ fontSize: 28, fontWeight: 300, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 4 }}>{m.v}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', fontWeight: 300, marginBottom: 2 }}>{m.l}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontWeight: 300 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* SCROLLABLE CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, padding: '0 0 24px' }}>

      {/* ROW 1: Funnel + Gauge/Match + Velocity/Trend */}
      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr 1fr', gap: 16, padding: '0 24px' }}>

        {/* SVG Funnel */}
        <Panel style={{ minHeight: 420 }}>
          <SL label="Pipeline Funnel" color={TEAL}>
            <DataSourceBadge fromApi={fromApi} />
          </SL>
          <SVGFunnel stages={stages} />
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderTop: '1px solid ' + BORDER, marginTop: 14, }}>
            {[
              { label: 'Conversion', value: '14.3%', sub: 'Applied to Offer', col: BLUE },
              { label: 'Avg Velocity', value: '4.2', sub: 'Days per stage', col: DARK },
              { label: 'Uplift', value: '+34%', sub: 'vs ATS-only', col: TEAL },
            ].map((s, i) => (
              <div key={s.label} style={{ padding: '12px 14px', borderRight: i < 2 ? '1px solid ' + BORDER : 'none', textAlign: 'center', padding: '12px 14px' }}>  
                <div style={{ fontSize: 9, color: MUTED, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 5, fontFamily: F }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 300, color: s.col, letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {s.value}
                  
                </div>
                {s.sub && <div style={{ fontSize: 10, color: MUTED, marginTop: 3 }}>{s.sub}</div>}
              </div>
            ))}
          </div>
        </Panel>

        {/* Gauge + Match Distribution */}
        <Panel style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '18px 22px', height: 300, flexShrink: 0 }}>
            <SL label="Conversion Rate" color="#F5A623" />
            <ConversionGauge value={14.3} />
          </div>
          <div style={{ borderTop: '1px solid ' + BORDER, padding: '18px 22px', flex: 1 }}>
            <SL label="Match Distribution" color={BLUE} />
            <MatchDistribution data={MOCK_MATCH_DIST} />
          </div>
        </Panel>

        {/* Stage Velocity + Pipeline Trend */}
        <Panel style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '18px 22px', height: 300, flexShrink: 0 }}>
            <SL label="Stage Velocity" color="#F5A623">
              <span style={{ fontSize: 9, color: MUTED }}>Avg days</span>
            </SL>
            <StageVelocityChart data={MOCK_STAGE_VEL} />
          </div>
          <div style={{ borderTop: '1px solid ' + BORDER, padding: '18px 22px', flex: 1 }}>
            <PipelineTrend />
          </div>
        </Panel>
      </div>

      {/* ROW 2: Time in Stage + Source Effectiveness */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '0 24px' }}>

        {/* Time in Stage */}
        <Panel>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#F5A623', flexShrink: 0, marginRight: 7 }} />
            <span style={{ fontSize: 9, color: MUTED, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 400, flex: 1, fontFamily: F }}>Time-in-Stage Analysis</span>
            <span style={{ fontSize: 9, color: '#D97706', background: 'rgba(217,119,6,.08)', padding: '2px 8px', fontFamily: F }}>
              {bottlenecks.filter((b: any) => b.status === 'Slow' || b.status === 'Critical').length} bottlenecks
            </span>
          </div>
          {bottlenecks.map((b: any, i: number) => (
            <div key={b.stage} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < bottlenecks.length - 1 ? '1px solid ' + BLIGHT : 'none' }}>
              <span style={{ fontSize: 12, color: MID, flexShrink: 0, width: 140, fontWeight: 300 }}>{b.stage}</span>
              <span style={{ fontSize: 11, color: MUTED, flex: 1, fontWeight: 300 }}>{String(b.desc).replace(/(\d)d\b/g, '')}</span>
              <div style={{ width: 80, height: 3, background: BLIGHT, flexShrink: 0 }}>
                <div style={{ height: 3, width: `${b.pct}%`, background: b.color }} />
              </div>
              <span style={{ fontSize: 11, color: MID, fontWeight: 300, flexShrink: 0 }}>
                <strong style={{ fontWeight: 500, color: DARK }}>{parseFloat(String(b.days))}</strong> avg days
              </span>
              <span style={{ fontSize: 8, padding: '2px 7px', color: b.color, background: 'rgba(0,0,0,.04)', flexShrink: 0, fontFamily: F }}>{b.status}</span>
            </div>
          ))}
        </Panel>

        {/* Source Effectiveness */}
        <Panel>
          <SL label="Source Effectiveness" color={BLUE} />
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: BLIGHT }}>
                {['Source', 'Applied', 'Screened', 'Offered', 'Conv %'].map(h => (
                  <th key={h} style={{ padding: '7px 10px', textAlign: 'left', fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '.08em', borderBottom: '1px solid ' + BORDER, fontFamily: F, fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sourceData.map((s: any, i: number) => (
                <tr key={s.source} style={{ background: i % 2 === 0 ? '#fff' : BLIGHT }}>
                  <td style={{ padding: '8px 10px', fontSize: 12, color: MID, fontWeight: 300 }}>{s.source}</td>
                  <td style={{ padding: '8px 10px', fontSize: 11, color: MUTED }}>{s.applied}</td>
                  <td style={{ padding: '8px 10px', fontSize: 11, color: MUTED }}>{s.screened}</td>
                  <td style={{ padding: '8px 10px', fontSize: 11, color: TEAL, fontWeight: 500 }}>{s.offered}</td>
                  <td style={{ padding: '8px 10px' }}>
                    <span style={{ fontSize: 10, color: s.color || BLUE, background: 'rgba(37,99,235,.06)', padding: '2px 7px', fontFamily: F }}>{s.convRate}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>

      {/* ROW 3: Role Velocity (stretch) + Radar & Pareto stacked */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '0 24px' }}>

        {/* Role Velocity - scrollable full height */}
        <Panel style={{ display: 'flex', flexDirection: 'column' }}>
          <SL label="Role Velocity (Days to Hire)" color={TEAL} />
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: 520, margin: '0 -22px -22px', padding: '0 22px 22px' }}>
            <RoleVelocityChart roles={roleVelocity} />
          </div>
        </Panel>

        {/* Radar + Pareto stacked */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Panel>
            <SL label="Quality Dimensions Radar" color={TEAL} />
            <div style={{ fontSize: 11, color: MUTED, marginBottom: 10, fontWeight: 300 }}>Explorer candidates score 27% higher on average</div>
            <RadarChart dims={MOCK_RADAR_DIMS} />
          </Panel>
          <Panel>
            <SL label="Rejection Pareto Analysis" color="#E85B3A" />
            <div style={{ fontSize: 11, color: MUTED, marginBottom: 10, fontWeight: 300 }}>Top 3 reasons account for 82% of rejections</div>
            <ParetoChart data={MOCK_PARETO} />
          </Panel>
        </div>
      </div>

      </div>
    </div>
  );
}
