// @ts-nocheck
// cache-bust: chart-heights-v2
'use client';
import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { usePipeline } from '@/lib/data-provider';
import { DataSourceBadge } from '@/components/shared/api-status';

const RadarChart        = dynamic(() => import('@/components/charts/pipeline-charts').then(m => m.RadarChart),          { ssr: false });
const ParetoChart       = dynamic(() => import('@/components/charts/pipeline-charts').then(m => m.ParetoChart),         { ssr: false });
const ConversionGauge   = dynamic(() => import('@/components/charts/pipeline-charts').then(m => m.ConversionGauge),     { ssr: false });
const MatchDistribution = dynamic(() => import('@/components/charts/pipeline-charts').then(m => m.MatchDistribution),   { ssr: false });
const StageVelocityChart= dynamic(() => import('@/components/charts/pipeline-charts').then(m => m.StageVelocityChart),  { ssr: false });
const PipelineTrend     = dynamic(() => import('@/components/charts/pipeline-charts').then(m => m.PipelineTrend),       { ssr: false });
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

// SVG Trapezoid Funnel
function SVGFunnel({ stages }: { stages: typeof MOCK_STAGES }) {
  const maxN = Math.max(...stages.map(s => s.n));
  const W = 340, H = 42, GAP = 5;
  const svgH = stages.length * (H + GAP);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${svgH}`} xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      {stages.map((s, i) => {
        const pct = s.n / maxN;
        const nextPct = i < stages.length - 1 ? stages[i + 1].n / maxN : pct * 0.8;
        const topW = Math.round(pct * W);
        const botW = Math.round(nextPct * W);
        const topX = (W - topW) / 2;
        const botX = (W - botW) / 2;
        const y = i * (H + GAP);
        const drop = i > 0 ? Math.round((1 - s.n / stages[i - 1].n) * 100) : null;
        return (
          <g key={s.stage}>
            <polygon points={`${topX},${y} ${topX + topW},${y} ${botX + botW},${y + H} ${botX},${y + H}`} fill={s.color} opacity="0.92" />
            <text x={W / 2} y={y + H / 2 - 5} textAnchor="middle" fontFamily={F} fontSize="11" fill="white" fontWeight="300">{s.stage}</text>
            <text x={W / 2} y={y + H / 2 + 10} textAnchor="middle" fontFamily={F} fontSize="12" fill="rgba(255,255,255,0.8)" fontWeight="300">{s.n}</text>
            {drop !== null && drop > 0 && (
              <text x={topX - 6} y={y + H / 2 + 4} textAnchor="end" fontFamily={F} fontSize="10" fill="#CC3300" fontWeight="400">-{drop}%</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function PipelinePage() {
  const pipelineQuery = usePipeline();
  const pipeData = pipelineQuery.data?.data;
  const fromApi = !!pipelineQuery.data?.fromApi;

  const stages = pipeData?.stages?.length
    ? pipeData.stages.map((s: any, i: number) => ({ stage: s.stage || s.name, n: s.count || s.n, color: MOCK_STAGES[i]?.color || '#1e3a8a' }))
    : MOCK_STAGES;
  const bottlenecks  = pipeData?.bottlenecks?.length  ? pipeData.bottlenecks  : MOCK_BOTTLENECKS;
  const sourceData   = pipeData?.sourceData?.length   ? pipeData.sourceData   : MOCK_SOURCES;
  const roleVelocity = pipeData?.roleVelocity?.length ? pipeData.roleVelocity : MOCK_VELOCITY;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: F, overflowY: 'auto', height: '100%', padding: '24px 32px', boxSizing: 'border-box' as 'border-box' }}>

      {/* PAGE HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 400, letterSpacing: '-0.01em', color: DARK }}>Pipeline</div>
          <div style={{ fontSize: 11, color: MUTED, fontWeight: 300, marginTop: 2 }}>Hiring Analytics · Feb 2026</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <DataSourceBadge fromApi={fromApi} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
            <span style={{ fontSize: 11, color: MUTED, fontWeight: 300 }}>All Synced</span>
          </div>
          <button style={{ fontSize: 11, color: '#fff', background: BLUE, border: 'none', padding: '5px 14px', cursor: 'pointer', fontFamily: F }}>Export</button>
        </div>
      </div>

      {/* ROW 1: Funnel + Gauge/Match + Velocity/Trend */}
      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr 1fr', gap: 16 }}>

        {/* SVG Funnel */}
        <Panel>
          <SL label="Pipeline Funnel" color={TEAL}>
            <DataSourceBadge fromApi={fromApi} />
          </SL>
          <SVGFunnel stages={stages} />
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderTop: '1px solid ' + BORDER, marginTop: 14 }}>
            {[
              { label: 'Conversion', value: '14.3%', sub: 'Applied to Offer', col: BLUE },
              { label: 'Avg Velocity', value: '4.2', sub: 'Days per stage', col: DARK },
              { label: 'Uplift', value: '+34%', sub: 'vs ATS-only', col: TEAL },
            ].map((s, i) => (
              <div key={s.label} style={{ padding: '12px 14px', borderRight: i < 2 ? '1px solid ' + BORDER : 'none', textAlign: 'center' }}>
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
        <Panel>
          <SL label="Conversion Rate" color="#F5A623" />
          <ConversionGauge value={14.3} />
          <div style={{ marginTop: 22, paddingTop: 22, borderTop: '1px solid ' + BORDER }}>
            <SL label="Match Distribution" color={BLUE} />
            <MatchDistribution data={MOCK_MATCH_DIST} />
          </div>
        </Panel>

        {/* Stage Velocity + Pipeline Trend */}
        <Panel>
          <SL label="Stage Velocity" color="#F5A623">
            <span style={{ fontSize: 9, color: MUTED }}>Avg days</span>
          </SL>
          <StageVelocityChart data={MOCK_STAGE_VEL} />
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid ' + BORDER }}>
            <PipelineTrend />
          </div>
        </Panel>
      </div>

      {/* ROW 2: Time in Stage + Source Effectiveness */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

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
                {String(b.days).replace(/d$/,'')} avg days
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

      {/* ROW 3: Role Velocity + Radar + Pareto */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>

        {/* Role Velocity */}
        <Panel>
          <SL label="Role Velocity (Days to Hire)" color={TEAL} />
          <RoleVelocityChart roles={roleVelocity} />
        </Panel>

        {/* Quality Radar */}
        <Panel>
          <SL label="Quality Dimensions Radar" color={TEAL} />
          <div style={{ fontSize: 11, color: MUTED, marginBottom: 10, fontWeight: 300 }}>Explorer candidates score 27% higher on average</div>
          <RadarChart dims={MOCK_RADAR_DIMS} />
        </Panel>

        {/* Pareto */}
        <Panel>
          <SL label="Rejection Pareto Analysis" color="#E85B3A" />
          <div style={{ fontSize: 11, color: MUTED, marginBottom: 10, fontWeight: 300 }}>Top 3 reasons account for 82% of rejections</div>
          <ParetoChart data={MOCK_PARETO} />
        </Panel>
      </div>

    </div>
  );
}
