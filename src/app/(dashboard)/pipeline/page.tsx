'use client';

import { useState } from 'react';
import { PIPELINE_FUNNEL, BOTTLENECKS } from '@/lib/mock-data';
import { usePipeline } from '@/lib/data-provider';
import { DataSourceBadge } from '@/components/shared/api-status';
import { IconDownload, IconClock, IconTrendingUp, IconTarget, IconZap, IconCalendar } from '@/components/icons';

export default function PipelinePage() {
  const [roleFilter, setRoleFilter] = useState('');
  const [dateRange, setDateRange] = useState('1m');
  const pipelineQuery = usePipeline();
  const pipeData = pipelineQuery.data?.data;
  const apiFunnel = Array.isArray(pipeData?.funnel) ? pipeData.funnel : PIPELINE_FUNNEL;
  const apiBottlenecks = Array.isArray(pipeData?.bottlenecks) ? pipeData.bottlenecks : BOTTLENECKS;
  const apiPipelineStages = Array.isArray(pipeData?.stages) ? pipeData.stages : [];
  const sourceData = Array.isArray(pipeData?.sourceData) ? pipeData.sourceData : [];
  const weeklyTrend = Array.isArray(pipeData?.weeklyTrend) ? pipeData.weeklyTrend : [];
  const roleVelocity = Array.isArray(pipeData?.roleVelocity) ? pipeData.roleVelocity : [];
  const fromApi = !!pipelineQuery.data?.fromApi;
  const [startDate, setStartDate] = useState('2026-02-01');
  const [endDate, setEndDate] = useState('2026-02-28');
  const dateLabel = dateRange === '1m' ? 'Feb 2026' : dateRange === '3m' ? 'Dec 2025 – Feb 2026' : dateRange === '6m' ? 'Sep 2025 – Feb 2026' : 'Mar 2025 – Feb 2026';

  return (
    <div className="flex flex-col gap-[13px]">
      {/* #17 — Configurable Pipeline Parameters */}
      <div className="card" style={{ padding: '12px 18px' }}>
        <div className="flex items-center justify-between mb-[10px] flex-wrap gap-[6px]">
          <span className="mono-label flex items-center gap-[6px]"><IconCalendar size={11} /> Pipeline Parameters</span>
          <div className="flex gap-[2px] p-[3px] rounded-[7px]" style={{ background: 'var(--surface3)' }}>
            {[{ k: '1m', l: '1M' }, { k: '3m', l: '3M' }, { k: '6m', l: '6M' }, { k: '12m', l: '12M' }].map(({ k, l }) => (
              <button key={k} onClick={() => setDateRange(k)} className="font-mono text-[9px] px-[10px] py-[4px] rounded-[5px] transition-all" style={{ color: dateRange === k ? 'var(--blue)' : 'var(--text-dim)', background: dateRange === k ? 'var(--surface)' : 'transparent', fontWeight: dateRange === k ? 600 : 400, boxShadow: dateRange === k ? '0 1px 3px rgba(0,0,0,.08)' : 'none' }}>{l}</button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-[6px] items-center">
          <input type="date" className="form-input" style={{ fontSize: '10px', padding: '4px 8px', width: 130 }} value={startDate} onChange={e => setStartDate(e.target.value)} />
          <span className="font-mono text-[9px]" style={{ color: 'var(--muted)' }}>to</span>
          <input type="date" className="form-input" style={{ fontSize: '10px', padding: '4px 8px', width: 130 }} value={endDate} onChange={e => setEndDate(e.target.value)} />
          <select className="filter-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}><option value="">All Roles</option><option>Staff ML Engineer</option><option>Principal Eng.</option><option>DevRel Engineer</option></select>
        </div>
      </div>
      {/* Funnel Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-[14px] flex-wrap gap-[6px]">
          <span className="mono-label flex items-center gap-[6px]">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
            Pipeline Funnel · All Roles<DataSourceBadge fromApi={fromApi} />
          </span>
          <div className="flex gap-[6px]">
            <span className="font-mono text-[9px] px-[8px] py-[2px] rounded" style={{ color: 'var(--blue)', background: 'var(--blue-bg)', border: '1px solid var(--blue-border)' }}>{dateLabel}</span>
            <button className="ctrl-btn blue flex items-center gap-[3px]"><IconDownload size={10} /> Export</button>
          </div>
        </div>
        <div className="funnel-wrap">
          {apiFunnel.map((s) => (
            <div key={s.stage} className="funnel-stage">
              <div className="funnel-bar" style={{ height: s.height, background: `linear-gradient(180deg, ${s.gradient[0]}, ${s.gradient[1]})` }} />
              <div className="funnel-count">{s.count}</div>
              <div className="funnel-lbl">{s.stage}</div>
              <div className="funnel-conv" style={{ color: s.convColor }}>{s.conversion}</div>
            </div>
          ))}
        </div>
        <div className="pipeline-detail-grid">
          <div className="pipeline-stat"><div className="ps-label">Overall Conversion</div><div className="ps-val" style={{ color: 'var(--blue)' }}>10.1%</div><div className="ps-sub">Applied → Offer · ↑ 2.3% vs last quarter</div></div>
          <div className="pipeline-stat"><div className="ps-label">Avg. Stage Velocity</div><div className="ps-val">4.2d</div><div className="ps-sub">Per stage · ↓ 0.8d from last month</div></div>
          <div className="pipeline-stat"><div className="ps-label">Deep Match Uplift</div><div className="ps-val" style={{ color: 'var(--green)' }}>+34%</div><div className="ps-sub">Offer rate vs ATS-only screening</div></div>
        </div>
      </div>

      {/* #6 — Weekly Trend (moved up) */}
      <div className="card">
        <div className="flex items-center justify-between mb-[14px]">
          <span className="mono-label flex items-center gap-[6px]"><IconTrendingUp size={11} /> Weekly Pipeline Trend · {dateLabel}<DataSourceBadge fromApi={fromApi} /></span>
        </div>
        <div className="grid gap-[10px]" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {weeklyTrend.map(w => (
            <div key={w.week} className="p-[12px] rounded-[9px] text-center" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
              <div className="font-mono text-[9px] mb-[6px]" style={{ color: 'var(--muted)' }}>{w.week}</div>
              <div className="text-[20px] font-bold" style={{ fontFamily: "'Roboto Slab', serif", color: 'var(--text-bright)', lineHeight: 1 }}>{w.applied}</div>
              <div className="font-mono text-[8px] mt-[4px]" style={{ color: 'var(--muted)' }}>Applied</div>
              <div className="flex gap-[8px] justify-center mt-[8px]">
                <div><div className="text-[14px] font-semibold" style={{ fontFamily: "'Roboto Slab', serif", color: 'var(--blue)' }}>{w.screened}</div><div className="font-mono text-[7px]" style={{ color: 'var(--muted)' }}>Screened</div></div>
                <div><div className="text-[14px] font-semibold" style={{ fontFamily: "'Roboto Slab', serif", color: 'var(--green)' }}>{w.offered}</div><div className="font-mono text-[7px]" style={{ color: 'var(--muted)' }}>Offered</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time-in-Stage Analysis */}
      <div className="card">
        <div className="flex items-center justify-between mb-[14px]">
          <span className="mono-label flex items-center gap-[6px]"><IconClock size={11} /> Time-in-Stage Analysis</span>
          <span className="font-mono text-[9px] px-[8px] py-[2px] rounded" style={{ color: 'var(--orange)', background: 'var(--orange-bg)', border: '1px solid var(--orange-border)' }}>3 bottlenecks detected</span>
        </div>
        {apiBottlenecks.map((b) => (
          <div key={b.stage} className="bottleneck-row">
            <span className="text-[11px] flex-shrink-0" style={{ color: 'var(--text-mid)', width: 130 }}>{b.stage}</span>
            <span className="bn-stage">{b.desc}</span>
            <div className="bn-track"><div className="bn-fill" style={{ width: `${b.pct}%`, background: b.color }} /></div>
            <span className="bn-days">{b.days}</span>
            <span className="bn-badge" style={{ background: `var(--${b.statusColor}-bg)`, color: `var(--${b.statusColor})`, border: `1px solid var(--${b.statusColor}-border)` }}>{b.status}</span>
          </div>
        ))}
      </div>

      {/* Source Effectiveness + Role Velocity side by side */}
      <div className="grid gap-[13px]" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Source Effectiveness */}
        <div className="card">
          <div className="flex items-center justify-between mb-[14px]">
            <span className="mono-label flex items-center gap-[6px]"><IconTarget size={11} /> Source Effectiveness<DataSourceBadge fromApi={fromApi} /></span>
          </div>
          <div className="overflow-x-auto">
            <table className="cand-table" style={{ minWidth: 0 }}>
              <thead><tr><th>Source</th><th>Applied</th><th>Screened</th><th>Offered</th><th>Conv %</th></tr></thead>
              <tbody>
                {sourceData.map(s => (
                  <tr key={s.source}>
                    <td className="text-[11px]" style={{ color: 'var(--text-mid)' }}>{s.source}</td>
                    <td className="font-mono text-[11px]" style={{ color: 'var(--text-dim)' }}>{s.applied}</td>
                    <td className="font-mono text-[11px]" style={{ color: 'var(--text-dim)' }}>{s.screened}</td>
                    <td className="font-mono text-[11px] font-semibold" style={{ color: 'var(--green)' }}>{s.offered}</td>
                    <td><span className="font-mono text-[10px] font-bold px-[6px] py-[1px] rounded" style={{ color: s.color, background: `color-mix(in srgb, ${s.color} 10%, transparent)` }}>{s.convRate}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role Velocity */}
        <div className="card">
          <div className="flex items-center justify-between mb-[14px]">
            <span className="mono-label flex items-center gap-[6px]"><IconZap size={11} /> Role Velocity (Avg Days to Hire)<DataSourceBadge fromApi={fromApi} /></span>
          </div>
          {roleVelocity.map(r => {
            const pct = Math.min(100, (r.avgDays / 30) * 100);
            const col = r.status === 'fast' ? 'var(--green)' : r.status === 'slow' ? 'var(--orange)' : 'var(--blue)';
            return (
              <div key={r.role} className="flex items-center gap-[10px] mb-[10px]">
                <span className="text-[11px] flex-shrink-0" style={{ color: 'var(--text-mid)', width: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.role}</span>
                <div className="flex-1 h-[6px] rounded overflow-hidden" style={{ background: 'var(--surface3)' }}>
                  <div className="h-full rounded" style={{ width: `${pct}%`, background: col }} />
                </div>
                <span className="font-mono text-[11px] font-semibold" style={{ color: col, width: 34, textAlign: 'right' }}>{r.avgDays}d</span>
                <span className="font-mono text-[8px] px-[6px] py-[1px] rounded" style={{ color: col, background: `color-mix(in srgb, ${col} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${col} 25%, transparent)` }}>{r.status === 'fast' ? '↓ Fast' : r.status === 'slow' ? '↑ Slow' : '— OK'}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
