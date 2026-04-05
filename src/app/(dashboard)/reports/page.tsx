// @ts-nocheck
'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast';
import { IconTrendingUp, IconTarget, IconBot, IconCalendar, IconDiamond, IconUploadCloud, IconDownload, IconClock, IconX, IconActivity } from '@/components/icons';
import { resolveIcon } from '@/components/icon-resolver';
import { useFleet, usePipeline } from '@/lib/data-provider';
import { DataSourceBadge } from '@/components/shared/api-status';
import { Modal } from '@/components/ui/modal';

const MONTHS = ['Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb'];
const PIPELINE_DATA = [42, 55, 61, 78, 89, 102, 94, 118, 127, 135, 148, 162];
const SOURCES = [
  { name: 'Taltas Network', vol: 89, quality: 91, color: 'var(--blue)' },
  { name: 'LinkedIn', vol: 72, quality: 78, color: '#0077b5' },
  { name: 'Greenhouse', vol: 58, quality: 82, color: 'var(--green)' },
  { name: 'Indeed', vol: 45, quality: 64, color: 'var(--purple)' },
  { name: 'Referral', vol: 34, quality: 88, color: 'var(--orange)' },
  { name: 'GitHub', vol: 22, quality: 76, color: 'var(--text-dim)' },
];
const METRICS_ROWS = [
  { label: 'Time-to-Fill', values: ['24d','22d','20d','19d','18d','18d'], trend: 'down' },
  { label: 'Offer Accept Rate', values: ['68%','71%','72%','75%','78%','79%'], trend: 'up' },
  { label: 'Explorer Screen Rate', values: ['72%','76%','78%','80%','82%','84%'], trend: 'up' },
  { label: 'Candidate NPS', values: ['+42','+45','+48','+51','+54','+56'], trend: 'up' },
  { label: 'Cost-per-Hire', values: ['$4.2K','$3.9K','$3.6K','$3.4K','$3.1K','$2.9K'], trend: 'down' },
];

const DIVERSITY_DATA = [
  { category: 'Gender', segments: [{ label: 'Male', pct: 48, color: 'var(--blue)' }, { label: 'Female', pct: 44, color: 'var(--purple)' }, { label: 'Non-Binary', pct: 8, color: 'var(--green)' }] },
  { category: 'Ethnicity', segments: [{ label: 'White', pct: 38, color: 'var(--blue)' }, { label: 'Asian', pct: 32, color: 'var(--green)' }, { label: 'Black', pct: 15, color: 'var(--purple)' }, { label: 'Hispanic', pct: 10, color: 'var(--orange)' }, { label: 'Other', pct: 5, color: 'var(--muted)' }] },
];

const ROLE_PIPELINE_HEALTH = [
  { role: 'Staff ML Eng', applied: 47, screened: 38, interview: 12, offer: 3, health: 'strong' },
  { role: 'Principal Eng', applied: 31, screened: 24, interview: 8, offer: 2, health: 'strong' },
  { role: 'DevRel Eng', applied: 19, screened: 14, interview: 5, offer: 1, health: 'monitor' },
  { role: 'Staff AI Sys', applied: 28, screened: 18, interview: 6, offer: 1, health: 'strong' },
  { role: 'Senior Data', applied: 14, screened: 9, interview: 3, offer: 0, health: 'at-risk' },
  { role: 'Founding Eng', applied: 9, screened: 6, interview: 2, offer: 0, health: 'at-risk' },
];

const REPORT_TILES = [
  { iconKey: 'bar-chart', title: 'Pipeline Health Report', desc: 'Stage velocity & conversion analysis' },
  { iconKey: 'bot', title: 'Explorer Performance', desc: 'Agent conversation metrics & quality' },
  { iconKey: 'candidates', title: 'Candidate Quality Report', desc: 'Deep match & fit dimension analysis' },
  { iconKey: 'money', title: 'Compensation Benchmarks', desc: 'Offer vs. market rate comparison' },
  { iconKey: 'shield', title: 'Compliance & EEO Report', desc: 'Equal opportunity tracking & compliance' },
  { iconKey: 'trending-up', title: 'Recruiter Productivity', desc: 'Team metrics & individual KPIs' },
];

function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-[4px]" style={{ height: 60 }}>
      {data.map((val, i) => (
        <div key={i} className="flex-1 cursor-pointer transition-opacity hover:opacity-75" style={{ height: `${(val / max) * 100}%`, background: color, minHeight: 4 }} title={`${val}`} />
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('6m');
  const fleetQuery = useFleet();
  const pipelineQuery = usePipeline();
  const fromApi = !!fleetQuery.data?.fromApi || !!pipelineQuery.data?.fromApi;
  const [startDate, setStartDate] = useState('2025-09-01');
  const [endDate, setEndDate] = useState('2026-02-28');
  const [generating, setGenerating] = useState<string | null>(null);
  const [previewReport, setPreviewReport] = useState<{ title: string; desc: string } | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ frequency: 'weekly', day: 'Monday', time: '09:00', recipients: '', reportType: 'Pipeline Health Report' });
  const [roleFilter, setRoleFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [exportFormat, setExportFormat] = useState('pdf');
  const toast = useToast();

  const rangeMonths = dateRange === '1m' ? MONTHS.slice(11) : dateRange === '3m' ? MONTHS.slice(9) : MONTHS.slice(6);
  const rangeData = dateRange === '1m' ? PIPELINE_DATA.slice(11) : dateRange === '3m' ? PIPELINE_DATA.slice(9) : PIPELINE_DATA.slice(6);

  const handleExport = (reportName?: string) => {
    const label = reportName || 'All Reports';
    const fmt = exportFormat.toUpperCase();
    setGenerating(label);
    setTimeout(() => {
      setGenerating(null);
      if (fmt === 'CSV' || fmt === 'XLSX') {
        const rows = [['Metric', ...rangeMonths], ...METRICS_ROWS.map(r => [r.label, ...r.values])];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `taltas-${label.toLowerCase().replace(/\s/g, '-')}.csv`; a.click(); URL.revokeObjectURL(url);
      } else {
        // PDF: generate printable HTML report in new tab
        const metricsHtml = METRICS_ROWS.map(r => `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:12px">${r.label}</td>${r.values.map(v => `<td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:12px;text-align:center;font-family:monospace">${v}</td>`).join('')}</tr>`).join('');
        const html = `<!DOCTYPE html><html><head><title>${label} — Taltas</title><style>body{font-family:-apple-system,sans-serif;padding:40px;max-width:900px;margin:0 auto}h1{font-size:22px;margin-bottom:4px}h2{font-size:14px;color:#64748b;margin-bottom:24px}table{width:100%;border-collapse:collapse;margin-bottom:24px}th{text-align:left;padding:8px 10px;background:#f1f5f9;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;border-bottom:2px solid #e2e8f0}.footer{margin-top:40px;font-size:10px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:16px}@media print{body{padding:20px}}</style></head><body><h1>${label}</h1><h2>Taltas Recruiter Portal · ${startDate} to ${endDate}</h2><table><thead><tr><th>Metric</th>${rangeMonths.map(m => `<th style="text-align:center">${m}</th>`).join('')}</tr></thead><tbody>${metricsHtml}</tbody></table><div class="footer">Generated by Taltas · ${new Date().toLocaleDateString()} · Confidential</div><script>window.print();</script></body></html>`;
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      }
      toast.show(`${label} ${fmt} downloaded`);
    }, 1200);
  };

  const openPreview = (tile: { title: string; desc: string }) => setPreviewReport(tile);

  return (
    <div className="flex flex-col gap-[13px]">
      {/* Report Parameters */}
      <div className="card" style={{ padding: '12px 18px' }}>
        <div className="flex items-center justify-between mb-[10px] flex-wrap gap-[6px]">
          <span className="mono-label flex items-center gap-[6px]"><IconCalendar size={11} /> Report Parameters</span>
          <div className="flex gap-[2px] p-[3px] " style={{ background: 'var(--surface3)' }}>
            {[{ k: '1m', l: '1M' }, { k: '3m', l: '3M' }, { k: '6m', l: '6M' }, { k: '12m', l: '12M' }].map(({ k, l }) => (
              <button key={k} onClick={() => setDateRange(k)} className="font-mono text-[9px] px-[10px] py-[4px]  transition-all" style={{ color: dateRange === k ? 'var(--blue)' : 'var(--text-dim)', background: dateRange === k ? 'var(--surface)' : 'transparent', fontWeight: dateRange === k ? 600 : 400, boxShadow: dateRange === k ? '0 1px 3px rgba(0,0,0,.08)' : 'none' }}>{l}</button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-[6px] items-center">
          <div className="flex items-center gap-[4px]">
            <input type="date" className="form-input" style={{ fontSize: '10px', padding: '4px 8px', width: 130 }} value={startDate} onChange={e => setStartDate(e.target.value)} />
            <span className="font-mono text-[9px]" style={{ color: 'var(--muted)' }}>to</span>
            <input type="date" className="form-input" style={{ fontSize: '10px', padding: '4px 8px', width: 130 }} value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <select className="filter-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option><option>Staff ML Eng</option><option>Principal Eng</option><option>DevRel Eng</option><option>Staff AI Sys</option><option>Senior Data</option>
          </select>
          <select className="filter-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option value="all">All Departments</option><option>Engineering</option><option>AI/ML</option><option>DevRel</option><option>Data</option>
          </select>
          <select className="filter-select" value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}>
            <option value="all">All Sources</option><option>Taltas Network</option><option>LinkedIn</option><option>Greenhouse</option><option>Indeed</option><option>Referral</option>
          </select>
          <div style={{ marginLeft: 'auto' }} className="flex gap-[4px] items-center">
            <select className="filter-select" value={exportFormat} onChange={e => setExportFormat(e.target.value)} style={{ fontWeight: 600 }}>
              <option value="pdf">PDF</option><option value="csv">CSV</option><option value="xlsx">Excel (.xlsx)</option>
            </select>
            <button className="ctrl-btn run flex items-center gap-[4px]" onClick={() => handleExport()}><IconDownload size={9} /> Export {exportFormat.toUpperCase()}</button>
          </div>
        </div>
      </div>

      {/* 2x2 Report Grid */}
      <div className="grid gap-[13px]" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Pipeline Volume */}
        <div className="card">
          <div className="flex items-center justify-between mb-[12px]">
            <span className="mono-label flex items-center gap-[6px]"><IconTrendingUp size={11} /> Pipeline Volume<DataSourceBadge fromApi={fromApi} /></span>
            <span className="font-mono text-[9px]" style={{ color: 'var(--muted)' }}>Sep 2025 → Feb 2026</span>
          </div>
          <MiniBarChart data={rangeData} color="var(--blue)" />
          <div className="flex gap-[4px] mt-[4px]">{rangeMonths.map(m => <div key={m} className="flex-1 text-center font-mono text-[7.5px]" style={{ color: 'var(--muted)' }}>{m}</div>)}</div>
          <div className="flex gap-[22px] mt-[14px] flex-wrap">
            <div><div className="font-mono text-[8px] uppercase mb-[2px]" style={{ color: 'var(--muted)', letterSpacing: '.06em' }}>Total Applied</div><span className="text-[17px] font-semibold" style={{ fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", color: 'var(--text-bright)' }}>162</span></div>
            <div><div className="font-mono text-[8px] uppercase mb-[2px]" style={{ color: 'var(--muted)', letterSpacing: '.06em' }}>vs Last Period</div><span className="text-[17px] font-semibold" style={{ fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", color: 'var(--green)' }}>+9.5%</span></div>
            <div><div className="font-mono text-[8px] uppercase mb-[2px]" style={{ color: 'var(--muted)', letterSpacing: '.06em' }}>Avg/Month</div><span className="text-[17px] font-semibold" style={{ fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", color: 'var(--text-bright)' }}>131</span></div>
          </div>
        </div>

        {/* Source Effectiveness */}
        <div className="card">
          <div className="flex items-center justify-between mb-[12px]"><span className="mono-label flex items-center gap-[6px]"><IconTarget size={11} /> Source Effectiveness</span></div>
          {SOURCES.map(s => (
            <div key={s.name} className="flex items-center gap-[9px] mb-[8px]">
              <span className="text-[11.5px] flex-shrink-0" style={{ color: 'var(--text-mid)', width: 120 }}>{s.name}</span>
              <div className="flex-1 h-[6px]  overflow-hidden" style={{ background: 'var(--surface3)' }}><div className="h-full " style={{ width: `${s.quality}%`, background: s.color }} /></div>
              <span className="font-mono text-[10px] w-[32px] text-right" style={{ color: 'var(--text-dim)' }}>{s.quality}</span>
            </div>
          ))}
          <div className="mt-[10px] p-[9px_11px] " style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <div className="font-mono text-[8.5px] font-medium mb-[6px]" style={{ color: 'var(--blue)' }}>HOW QUALITY SCORE IS WEIGHTED</div>
            <div className="grid gap-[6px] mb-[7px]" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              {[{ pct: '40%', label: 'Offer Rate' }, { pct: '35%', label: 'Deep Match Avg' }, { pct: '25%', label: '90-Day Retention' }].map(w => (
                <div key={w.label} className="text-center p-[6px] " style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}><div className="text-[13px] font-medium" style={{ color: 'var(--text-bright)' }}>{w.pct}</div><div className="font-mono text-[8px]" style={{ color: 'var(--muted)' }}>{w.label}</div></div>
              ))}
            </div>
          </div>
        </div>

        {/* Explorer vs ATS */}
        <div className="card">
          <div className="flex items-center justify-between mb-[12px]"><span className="mono-label flex items-center gap-[6px]"><IconBot size={11} /> Explorer vs ATS</span></div>
          <div className="flex flex-col gap-[10px] mb-[14px]">
            <div><div className="font-mono text-[8.5px] mb-[4px]" style={{ color: 'var(--muted)' }}>ATS-ONLY QUALITY RATE</div><div className="h-[20px] rounded overflow-hidden" style={{ background: 'var(--surface3)' }}><div className="h-full flex items-center pl-[8px]" style={{ width: '64%', background: 'var(--border2)' }}><span className="font-mono text-[9px]" style={{ color: 'var(--text-dim)' }}>64%</span></div></div></div>
            <div><div className="font-mono text-[8.5px] mb-[4px]" style={{ color: 'var(--blue)' }}>TALTAS EXPLORER QUALITY RATE</div><div className="h-[20px] rounded overflow-hidden" style={{ background: 'var(--surface3)' }}><div className="h-full flex items-center pl-[8px]" style={{ width: '91%', background: 'linear-gradient(90deg, var(--blue), #60a5fa)' }}><span className="font-mono text-[9px] font-semibold" style={{ color: '#fff' }}>91%</span></div></div></div>
          </div>
          <div className="p-[11px_13px] " style={{ background: 'var(--blue-bg)', border: '1px solid var(--blue-border)' }}>
            <div className="flex items-center justify-between mb-[8px]"><span className="font-mono text-[9px] font-medium flex items-center gap-[5px]" style={{ color: 'var(--blue)' }}><IconDiamond size={10} color="var(--blue)" /> HIDDEN GEMS UNCOVERED</span><span className="font-mono text-[18px] font-[800]" style={{ color: 'var(--blue)' }}>34</span></div>
            <div className="text-[11px] mb-[10px]" style={{ color: 'var(--text-mid)' }}>Candidates passed by ATS (AI Match &lt;70) advanced by Explorer</div>
            <div className="p-[7px_10px]  flex items-center gap-[8px]" style={{ background: 'rgba(22, 163, 74, 0.08)', border: '1px solid rgba(22, 163, 74, 0.2)' }}><span className="text-[16px] font-[800]" style={{ color: 'var(--green)' }}>11</span><span className="text-[11px]" style={{ color: 'var(--text-mid)' }}>now in <strong>Final Round or Offer</strong> stage</span></div>
          </div>
        </div>

        {/* Monthly Metrics */}
        <div className="card">
          <div className="flex items-center justify-between mb-[12px]"><span className="mono-label flex items-center gap-[6px]"><IconCalendar size={11} /> Monthly Hiring Metrics</span></div>
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead><tr><th className="font-mono text-[8.5px] uppercase tracking-[.1em] text-left pb-[6px]" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>Metric</th>{MONTHS.slice(6).map(m => <th key={m} className="font-mono text-[8.5px] uppercase tracking-[.1em] text-center pb-[6px]" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>{m}</th>)}</tr></thead>
            <tbody>{METRICS_ROWS.map(row => (<tr key={row.label}><td className="text-[11.5px] py-[7px]" style={{ color: 'var(--text-mid)', borderBottom: '1px solid var(--border)' }}>{row.label}</td>{row.values.map((v, i) => <td key={i} className="text-center font-mono text-[11px] py-[7px]" style={{ color: i === row.values.length - 1 ? (row.trend === 'up' ? 'var(--green)' : 'var(--blue)') : 'var(--text-dim)', borderBottom: '1px solid var(--border)', fontWeight: i === row.values.length - 1 ? 600 : 400 }}>{v}</td>)}</tr>))}</tbody>
          </table>
        </div>
      </div>

      {/* Role Pipeline Health */}
      <div className="card">
        <div className="flex items-center justify-between mb-[14px]"><span className="mono-label flex items-center gap-[6px]"><IconTrendingUp size={11} /> Role Pipeline Health</span></div>
        <div className="overflow-x-auto">
          <table className="cand-table" style={{ minWidth: 0 }}>
            <thead><tr><th>Role</th><th>Applied</th><th>Screened</th><th>Interview</th><th>Offers</th><th>Funnel</th><th>Health</th></tr></thead>
            <tbody>
              {ROLE_PIPELINE_HEALTH.map(r => {
                const maxApplied = Math.max(...ROLE_PIPELINE_HEALTH.map(x => x.applied));
                return (
                  <tr key={r.role}>
                    <td className="text-[11px] font-medium" style={{ color: 'var(--text-bright)' }}>{r.role}</td>
                    <td className="font-mono text-[11px]" style={{ color: 'var(--text-dim)' }}>{r.applied}</td>
                    <td className="font-mono text-[11px]" style={{ color: 'var(--text-dim)' }}>{r.screened}</td>
                    <td className="font-mono text-[11px]" style={{ color: 'var(--purple)' }}>{r.interview}</td>
                    <td className="font-mono text-[11px] font-semibold" style={{ color: 'var(--green)' }}>{r.offer}</td>
                    <td>
                      <div className="flex gap-[2px]" style={{ width: 120 }}>
                        {[r.applied, r.screened, r.interview, r.offer].map((v, i) => (
                          <div key={i} className="h-[8px] " style={{ width: `${(v / maxApplied) * 100}%`, background: ['var(--blue)', 'var(--purple)', 'var(--orange)', 'var(--green)'][i], minWidth: v > 0 ? 3 : 0 }} />
                        ))}
                      </div>
                    </td>
                    <td><span className="font-mono text-[9px] px-[8px] py-[2px] rounded" style={{ color: r.health === 'strong' ? 'var(--green)' : r.health === 'monitor' ? 'var(--orange)' : 'var(--red)', background: r.health === 'strong' ? 'var(--green-bg)' : r.health === 'monitor' ? 'var(--orange-bg)' : 'var(--red-bg)', border: `1px solid ${r.health === 'strong' ? 'var(--green-border)' : r.health === 'monitor' ? 'var(--orange-border)' : 'var(--red-border)'}` }}>{r.health === 'strong' ? 'Strong' : r.health === 'monitor' ? 'Monitor' : 'At Risk'}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diversity + Explorer ROI side by side */}
      <div className="grid gap-[13px]" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card">
          <div className="flex items-center justify-between mb-[14px]"><span className="mono-label flex items-center gap-[6px]"><IconTarget size={11} /> Diversity & Inclusion Metrics</span></div>
          {DIVERSITY_DATA.map(cat => (
            <div key={cat.category} className="mb-[14px]">
              <div className="font-mono text-[8.5px] uppercase tracking-[.08em] mb-[6px]" style={{ color: 'var(--muted)' }}>{cat.category} — Pipeline Representation</div>
              <div className="flex  overflow-hidden h-[18px] mb-[6px]">
                {cat.segments.map(s => <div key={s.label} style={{ width: `${s.pct}%`, background: s.color }} className="flex items-center justify-center"><span className="font-mono text-[7px] text-white font-medium">{s.pct > 10 ? `${s.pct}%` : ''}</span></div>)}
              </div>
              <div className="flex gap-[10px] flex-wrap">
                {cat.segments.map(s => <div key={s.label} className="flex items-center gap-[4px]"><div className="w-[6px] h-[6px] " style={{ background: s.color }} /><span className="font-mono text-[8px]" style={{ color: 'var(--text-dim)' }}>{s.label} {s.pct}%</span></div>)}
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-[14px]"><span className="mono-label flex items-center gap-[6px]"><IconBot size={11} /> Explorer ROI Analysis</span></div>
          <div className="grid gap-[8px]" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {[
              { l: 'Cost Per Hire (Explorer)', v: '$2.9K', color: 'var(--green)', sub: '↓ 31% vs manual' },
              { l: 'Cost Per Hire (Manual)', v: '$4.2K', color: 'var(--text-dim)', sub: 'Industry avg' },
              { l: 'Time Saved / Month', v: '127 hrs', color: 'var(--blue)', sub: 'Screening automation' },
              { l: 'Quality Improvement', v: '+34%', color: 'var(--green)', sub: 'Offer rate vs ATS-only' },
              { l: 'Explorer API Cost', v: '$42.80', color: 'var(--text-dim)', sub: 'This billing period' },
              { l: 'Net ROI', v: '18.4x', color: 'var(--green)', sub: 'Return on investment' },
            ].map(s => (
              <div key={s.l} className="p-[10px]  text-center" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                <div className="text-[18px] font-medium" style={{ fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", color: s.color }}>{s.v}</div>
                <div className="font-mono text-[8px]" style={{ color: 'var(--muted)' }}>{s.l}</div>
                <div className="font-mono text-[7px] mt-[2px]" style={{ color: s.sub.startsWith('↓') || s.sub.startsWith('+') || s.sub.startsWith('Return') ? 'var(--green)' : 'var(--muted)' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Analytics — Spider + Pareto Charts */}
      <div className="grid gap-[13px]" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Radar/Spider Chart — Candidate Quality Dimensions */}
        <div className="card">
          <div className="flex items-center justify-between mb-[14px]"><span className="mono-label flex items-center gap-[6px]"><IconDiamond size={11} /> Quality Dimensions Radar</span></div>
          <div className="flex items-center justify-center" style={{ padding: '8px 0' }}>
            <svg viewBox="-10 -20 320 330" width="320" height="330">
              {/* Radar grid rings */}
              {[100, 80, 60, 40, 20].map(r => {
                const pts = [0,1,2,3,4,5].map(i => {
                  const angle = (Math.PI * 2 * i / 6) - Math.PI / 2;
                  return `${140 + (r * 0.9) * Math.cos(angle)},${125 + (r * 0.9) * Math.sin(angle)}`;
                }).join(' ');
                return <polygon key={r} points={pts} fill="none" stroke="var(--border)" strokeWidth="0.5" opacity={r === 100 ? 0.6 : 0.3} />;
              })}
              {/* Axis lines */}
              {[0,1,2,3,4,5].map(i => {
                const angle = (Math.PI * 2 * i / 6) - Math.PI / 2;
                return <line key={i} x1="140" y1="125" x2={140 + 90 * Math.cos(angle)} y2={125 + 90 * Math.sin(angle)} stroke="var(--border)" strokeWidth="0.5" opacity="0.4" />;
              })}
              {/* Data: Explorer candidates (blue) */}
              {(() => {
                const vals = [88, 92, 85, 78, 90, 86];
                const pts = vals.map((v, i) => {
                  const angle = (Math.PI * 2 * i / 6) - Math.PI / 2;
                  const r = (v / 100) * 90;
                  return `${140 + r * Math.cos(angle)},${125 + r * Math.sin(angle)}`;
                }).join(' ');
                return <polygon points={pts} fill="rgba(37, 99, 235, 0.15)" stroke="var(--blue)" strokeWidth="2" />;
              })()}
              {/* Explorer value dots */}
              {(() => {
                const vals = [88, 92, 85, 78, 90, 86];
                return vals.map((v, i) => {
                  const angle = (Math.PI * 2 * i / 6) - Math.PI / 2;
                  const r = (v / 100) * 90;
                  const cx = 140 + r * Math.cos(angle);
                  const cy = 125 + r * Math.sin(angle);
                  return <circle key={`ev${i}`} cx={cx} cy={cy} r="3" fill="var(--blue)" stroke="var(--surface)" strokeWidth="1.5" />;
                });
              })()}
              {/* Data: ATS-only candidates (gray) */}
              {(() => {
                const vals = [64, 58, 70, 65, 55, 62];
                const pts = vals.map((v, i) => {
                  const angle = (Math.PI * 2 * i / 6) - Math.PI / 2;
                  const r = (v / 100) * 90;
                  return `${140 + r * Math.cos(angle)},${125 + r * Math.sin(angle)}`;
                }).join(' ');
                return <polygon points={pts} fill="rgba(148, 163, 184, 0.1)" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />;
              })()}
              {/* ATS value dots */}
              {(() => {
                const vals = [64, 58, 70, 65, 55, 62];
                return vals.map((v, i) => {
                  const angle = (Math.PI * 2 * i / 6) - Math.PI / 2;
                  const r = (v / 100) * 90;
                  const cx = 140 + r * Math.cos(angle);
                  const cy = 125 + r * Math.sin(angle);
                  return <circle key={`av${i}`} cx={cx} cy={cy} r="2.5" fill="#94a3b8" stroke="var(--surface)" strokeWidth="1" />;
                });
              })()}
              {/* Labels + Apex Values */}
              {(() => {
                const explorerVals = [88, 92, 85, 78, 90, 86];
                const atsVals = [64, 58, 70, 65, 55, 62];
                const labels = ['Technical','Culture','Leadership','Growth','Communication','Behavioural'];
                return labels.map((l, a) => {
                  const angle = (Math.PI * 2 * a / 6) - Math.PI / 2;
                  const lx = 140 + 128 * Math.cos(angle);
                  const ly = 125 + 128 * Math.sin(angle);
                  /* Compute text-anchor based on position */
                  const anchor = a === 0 || a === 3 ? 'middle' : a < 3 ? 'start' : 'end';
                  /* Offsets: top vertex gets stacked vertically above, bottom below, sides go outward */
                  const labelDy = a === 0 ? -22 : a === 3 ? 8 : -10;
                  const valDy = a === 0 ? -8 : a === 3 ? 22 : 4;
                  const atsValDy = a === 0 ? 5 : a === 3 ? 35 : 17;
                  return (
                    <g key={l}>
                      <text x={lx} y={ly + labelDy} textAnchor={anchor} dominantBaseline="middle" fontSize="8" fontFamily="var(--font-mono)" fill="var(--muted)" letterSpacing=".03em">{l}</text>
                      <text x={lx} y={ly + valDy} textAnchor={anchor} dominantBaseline="middle" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--blue)">{explorerVals[a]}</text>
                      <text x={lx} y={ly + atsValDy} textAnchor={anchor} dominantBaseline="middle" fontSize="9" fontFamily="var(--font-mono)" fill="#94a3b8">{atsVals[a]}</text>
                    </g>
                  );
                });
              })()}
            </svg>
          </div>
          <div className="flex justify-center gap-[16px] mt-[4px]">
            <div className="flex items-center gap-[5px]"><div className="w-[10px] h-[3px]" style={{ background: 'var(--blue)' }} /><span className="font-mono text-[8px]" style={{ color: 'var(--text-dim)' }}>Explorer Candidates</span></div>
            <div className="flex items-center gap-[5px]"><div className="w-[10px] h-[3px]" style={{ background: '#94a3b8', opacity: 0.5 }} /><span className="font-mono text-[8px]" style={{ color: 'var(--text-dim)' }}>ATS-Only Candidates</span></div>
          </div>
          <div className="font-mono text-[8px] text-center mt-[8px]" style={{ color: 'var(--muted)' }}>Explorer candidates score 27% higher across all dimensions on average</div>
        </div>

        {/* Pareto Chart — Rejection Reasons */}
        <div className="card">
          <div className="flex items-center justify-between mb-[14px]"><span className="mono-label flex items-center gap-[6px]"><IconActivity size={11} /> Rejection Pareto Analysis</span></div>
          {(() => {
            const reasons = [
              { label: 'Skill Mismatch', count: 42 },
              { label: 'Experience Gap', count: 31 },
              { label: 'Culture Fit', count: 24 },
              { label: 'Salary Gap', count: 18 },
              { label: 'Location', count: 11 },
              { label: 'Timeline', count: 7 },
              { label: 'Other', count: 5 },
            ];
            const total = reasons.reduce((s, r) => s + r.count, 0);
            let cumulative = 0;
            const maxCount = reasons[0].count;
            const barH = 130;
            const barW = 440;
            const colW = barW / reasons.length;
            const barPad = 14;
            return (
              <div className="flex flex-col items-center">
                <svg viewBox={`0 0 ${barW + 48} ${barH + 80}`} width={barW + 48} height={barH + 80}>
                  {/* Y-axis labels */}
                  {[0, 25, 50, 75, 100].map(v => (
                    <g key={v}>
                      <text x="28" y={barH - (v / 100) * barH + 12} textAnchor="end" fontSize="7" fontFamily="var(--font-mono)" fill="var(--muted)">{v}%</text>
                      <line x1="32" y1={barH - (v / 100) * barH + 10} x2={barW + 38} y2={barH - (v / 100) * barH + 10} stroke="var(--border)" strokeWidth="0.5" opacity="0.3" />
                    </g>
                  ))}
                  {/* Bars — wider spacing to avoid label overlap */}
                  {reasons.map((r, i) => {
                    const h = (r.count / maxCount) * (barH - 10);
                    cumulative += r.count;
                    const cumPct = (cumulative / total) * 100;
                    const x = 38 + i * colW;
                    return (
                      <g key={r.label}>
                        <rect x={x + barPad} y={barH - h + 10} width={colW - barPad * 2} height={h} rx="3" fill={cumPct <= 80 ? 'var(--red)' : 'var(--border2)'} opacity={cumPct <= 80 ? 0.85 - i * 0.08 : 0.4} />
                        <text x={x + colW / 2} y={barH + 34} textAnchor="end" fontSize="7" fontFamily="var(--font-mono)" fill="var(--muted)" transform={`rotate(-40, ${x + colW / 2}, ${barH + 34})`}>{r.label}</text>
                      </g>
                    );
                  })}
                  {/* Cumulative line */}
                  {(() => {
                    let cum = 0;
                    const pts = reasons.map((r, i) => {
                      cum += r.count;
                      const pct = (cum / total) * 100;
                      return `${38 + i * colW + colW / 2},${barH - (pct / 100) * (barH - 10) + 10}`;
                    }).join(' ');
                    return <polyline points={pts} fill="none" stroke="var(--orange)" strokeWidth="2" strokeLinejoin="round" />;
                  })()}
                  {/* Cumulative dots */}
                  {(() => {
                    let cum = 0;
                    return reasons.map((r, i) => {
                      cum += r.count;
                      const pct = (cum / total) * 100;
                      return <circle key={i} cx={38 + i * colW + colW / 2} cy={barH - (pct / 100) * (barH - 10) + 10} r="2.5" fill="var(--orange)" stroke="var(--surface)" strokeWidth="1" />;
                    });
                  })()}
                  {/* 80% line */}
                  <line x1="32" y1={barH - 0.8 * (barH - 10) + 10} x2={barW + 38} y2={barH - 0.8 * (barH - 10) + 10} stroke="var(--orange)" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
                  <text x={barW + 40} y={barH - 0.8 * (barH - 10) + 13} fontSize="7" fontFamily="var(--font-mono)" fill="var(--orange)">80%</text>
                </svg>
                <div className="flex justify-center gap-[16px] mt-[4px]">
                  <div className="flex items-center gap-[5px]"><div className="w-[10px] h-[3px]" style={{ background: 'var(--red)' }} /><span className="font-mono text-[8px]" style={{ color: 'var(--text-dim)' }}>Count (bars)</span></div>
                  <div className="flex items-center gap-[5px]"><div className="w-[10px] h-[3px]" style={{ background: 'var(--orange)' }} /><span className="font-mono text-[8px]" style={{ color: 'var(--text-dim)' }}>Cumulative % (line)</span></div>
                </div>
                <div className="font-mono text-[8px] text-center mt-[8px]" style={{ color: 'var(--muted)' }}>Top 3 rejection reasons account for 70% of all rejections</div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Export Reports */}
      <div className="card">
        <div className="flex items-center justify-between mb-[14px]">
          <span className="mono-label flex items-center gap-[6px]"><IconUploadCloud size={11} /> Available Reports</span>
          <button className="ctrl-btn run flex items-center gap-[4px]" onClick={() => setScheduleOpen(true)}><IconClock size={9} /> Schedule Report</button>
        </div>
        <div className="grid gap-[9px]" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {REPORT_TILES.map(r => (
            <div key={r.title} className="p-[14px] transition-all hover:border-[var(--blue)]" style={{ background: generating === r.title ? 'var(--blue-bg)' : 'var(--surface2)', border: `1px solid ${generating === r.title ? 'var(--blue-border)' : 'var(--border)'}` }}>
              <div className="mb-[7px]">{resolveIcon(r.iconKey, { size: 18 })}</div>
              <div className="text-[11.5px] font-medium mb-[3px]" style={{ color: 'var(--text-bright)' }}>{r.title}</div>
              <div className="font-mono text-[8.5px] mb-[8px]" style={{ color: generating === r.title ? 'var(--blue)' : 'var(--muted)' }}>{generating === r.title ? 'Generating…' : r.desc}</div>
              <div className="flex gap-[4px]">
                <button className="ctrl-btn blue" style={{ fontSize: '8px', padding: '2px 7px' }} onClick={() => openPreview(r)}>Preview</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Report Modal */}
      <Modal open={scheduleOpen} onClose={() => setScheduleOpen(false)} maxWidth="480px">
        <div style={{ fontSize:17, fontWeight:300, marginBottom:2 }} style={{ fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", color: 'var(--text-bright)' }}>Schedule Report</div>
        <div className="text-[11px] mb-[16px]" style={{ color: 'var(--muted)' }}>Set up automated report delivery to your team</div>
        <div className="flex flex-col gap-[10px]">
          <div><label className="form-label">Report Type</label><select className="form-select" value={scheduleForm.reportType} onChange={e => setScheduleForm(f => ({ ...f, reportType: e.target.value }))}>{REPORT_TILES.map(r => <option key={r.title}>{r.title}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-[8px]">
            <div><label className="form-label">Frequency</label><select className="form-select" value={scheduleForm.frequency} onChange={e => setScheduleForm(f => ({ ...f, frequency: e.target.value }))}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="biweekly">Bi-Weekly</option><option value="monthly">Monthly</option></select></div>
            <div><label className="form-label">Day</label><select className="form-select" value={scheduleForm.day} onChange={e => setScheduleForm(f => ({ ...f, day: e.target.value }))}>{['Monday','Tuesday','Wednesday','Thursday','Friday'].map(d => <option key={d}>{d}</option>)}</select></div>
          </div>
          <div><label className="form-label">Delivery Time</label><input className="form-input" type="time" value={scheduleForm.time} onChange={e => setScheduleForm(f => ({ ...f, time: e.target.value }))} /></div>
          <div><label className="form-label">Recipients (email, comma-separated)</label><input className="form-input" value={scheduleForm.recipients} onChange={e => setScheduleForm(f => ({ ...f, recipients: e.target.value }))} placeholder="tawanda@taltas.ai, julia@taltas.ai" /></div>
          <div><label className="form-label">Export Format</label><select className="form-select" value={exportFormat} onChange={e => setExportFormat(e.target.value)}><option value="pdf">PDF</option><option value="csv">CSV</option><option value="xlsx">Excel</option></select></div>
        </div>
        <div className="flex gap-[8px] mt-[16px] pt-[12px]" style={{ borderTop: '1px solid var(--border)' }}>
          <button className="ctrl-btn" onClick={() => setScheduleOpen(false)}>Cancel</button>
          <button className="ctrl-btn run" style={{ marginLeft: 'auto' }} onClick={() => { setScheduleOpen(false); toast.show(`${scheduleForm.reportType} scheduled ${scheduleForm.frequency} on ${scheduleForm.day}s at ${scheduleForm.time}`); }}>Schedule</button>
        </div>
      </Modal>

      {/* #13 — Report Preview Modal */}
      <Modal open={!!previewReport} onClose={() => setPreviewReport(null)} maxWidth="min(700px, 95vw)">
        {previewReport && (
          <div>
            <div className="flex items-center justify-between mb-[14px]">
              <div>
                <div style={{ fontSize:17, fontWeight:300 }} style={{ fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", color: 'var(--text-bright)' }}>{previewReport.title}</div>
                <div className="text-[11px]" style={{ color: 'var(--muted)' }}>{previewReport.desc}</div>
              </div>
              <button className="ctrl-btn" onClick={() => setPreviewReport(null)}><IconX size={10} /></button>
            </div>
            <div className="mb-[14px] p-[12px]" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
              <div className="font-mono text-[8.5px] uppercase tracking-[.1em] mb-[8px]" style={{ color: 'var(--muted)' }}>Report Settings</div>
              <div className="grid grid-cols-2 gap-[8px]">
                <div><label className="form-label">Date Range</label><div className="flex gap-[4px]"><input type="date" className="form-input" style={{ fontSize: 10, padding: '4px 8px' }} value={startDate} onChange={e => setStartDate(e.target.value)} /><input type="date" className="form-input" style={{ fontSize: 10, padding: '4px 8px' }} value={endDate} onChange={e => setEndDate(e.target.value)} /></div></div>
                <div><label className="form-label">Department</label><select className="form-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}><option value="all">All Departments</option><option>Engineering</option><option>AI/ML</option><option>DevRel</option></select></div>
                <div><label className="form-label">Role</label><select className="form-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}><option value="all">All Roles</option><option>Staff ML Eng</option><option>Principal Eng</option></select></div>
                <div><label className="form-label">Export Format</label><select className="form-select" value={exportFormat} onChange={e => setExportFormat(e.target.value)}><option value="pdf">PDF</option><option value="csv">CSV</option><option value="xlsx">Excel</option></select></div>
              </div>
            </div>
            <div className="report-preview-page">
              <div className="font-mono text-[8.5px] uppercase tracking-[.1em] mb-[10px]" style={{ color: 'var(--muted)' }}>Preview</div>
              <div style={{ fontSize:14, fontWeight:300, marginBottom:10 }} style={{ fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", color: 'var(--text-bright)' }}>{previewReport.title}</div>
              <table className="cand-table" style={{ minWidth: 0 }}>
                <thead><tr><th>Metric</th>{rangeMonths.map(m => <th key={m}>{m}</th>)}<th>Trend</th></tr></thead>
                <tbody>{METRICS_ROWS.map(r => (<tr key={r.label}><td className="text-[11px]" style={{ color: 'var(--text-mid)' }}>{r.label}</td>{r.values.map((v, i) => <td key={i} className="font-mono text-[10px]" style={{ color: 'var(--text-dim)' }}>{v}</td>)}<td><span className="font-mono text-[9px]" style={{ color: r.trend === 'up' ? 'var(--green)' : 'var(--blue)' }}>{r.trend === 'up' ? '↑' : '↓'}</span></td></tr>))}</tbody>
              </table>
            </div>
            <div className="flex justify-end gap-[6px] mt-[12px]">
              <button className="ctrl-btn" onClick={() => setPreviewReport(null)}>Cancel</button>
              <button className="ctrl-btn run" onClick={() => { handleExport(previewReport.title); setPreviewReport(null); }}><IconDownload size={10} /> Export {exportFormat.toUpperCase()}</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

