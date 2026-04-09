// @ts-nocheck
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useToast } from '@/components/ui/toast';
import { useFleet, usePipeline } from '@/lib/data-provider';
import { DataSourceBadge } from '@/components/shared/api-status';
import { Modal } from '@/components/ui/modal';

const ReportsRadarChart   = dynamic(() => import('@/components/charts/reports-charts').then(m => m.ReportsRadarChart),   { ssr: false });
const ReportsParetoChart  = dynamic(() => import('@/components/charts/reports-charts').then(m => m.ReportsParetoChart),  { ssr: false });
const PipelineVolumeChart = dynamic(() => import('@/components/charts/reports-charts').then(m => m.PipelineVolumeChart), { ssr: false });
const MonthlyTrendChart   = dynamic(() => import('@/components/charts/reports-charts').then(m => m.MonthlyTrendChart),   { ssr: false });
const SourceChart         = dynamic(() => import('@/components/charts/reports-charts').then(m => m.SourceChart),         { ssr: false });
const GenderBar           = dynamic(() => import('@/components/charts/reports-charts').then(m => m.GenderBar),           { ssr: false });
const EthnicBar           = dynamic(() => import('@/components/charts/reports-charts').then(m => m.EthnicBar),           { ssr: false });

const F      = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const BLUE   = '#2563eb';
const TEAL   = '#1D9E75';
const DARK   = '#0A0A0A';
const MID    = '#6B6B6B';
const MUTED  = '#AAAAAA';
const BORDER = '#E8E8E5';
const BLIGHT = '#F4F4F2';
const RED    = '#CC3300';
const AMBER  = '#D97706';
const PURPLE = '#7C3AED';

const MONTHS = ['Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb'];
const PIPELINE_DATA = [42,55,61,78,89,102,94,118,127,135,148,162];

const METRICS_ROWS = [
  { label: 'Time-to-Fill',          values: ['24d','22d','20d','19d','18d','18d'], trend: 'down' },
  { label: 'Offer Accept Rate',      values: ['68%','71%','72%','75%','78%','79%'], trend: 'up'   },
  { label: 'Explorer Screen Rate',   values: ['72%','76%','78%','80%','82%','84%'], trend: 'up'   },
  { label: 'Candidate NPS',          values: ['+42','+45','+48','+51','+54','+56'], trend: 'up'  },
  { label: 'Cost-per-Hire',          values: ['$4.2K','$3.9K','$3.6K','$3.4K','$3.1K','$2.9K'], trend: 'down' },
];

const ROLE_PIPELINE_HEALTH = [
  { role: 'Staff ML Eng',  applied:47, screened:38, interview:12, offer:3, health:'strong'  },
  { role: 'Principal Eng', applied:31, screened:24, interview:8,  offer:2, health:'strong'  },
  { role: 'DevRel Eng',    applied:19, screened:14, interview:5,  offer:1, health:'monitor' },
  { role: 'Staff AI Sys',  applied:28, screened:18, interview:6,  offer:1, health:'strong'  },
  { role: 'Senior Data',   applied:14, screened:9,  interview:3,  offer:0, health:'at-risk' },
  { role: 'Founding Eng',  applied:9,  screened:6,  interview:2,  offer:0, health:'at-risk' },
];
const HC: any = {
  'strong':  { bg:'#E6F5EE', c:'#15703A', label:'Strong'  },
  'monitor': { bg:'#FFF7E0', c:'#8A6000', label:'Monitor' },
  'at-risk': { bg:'#FFEAEA', c:RED,       label:'At Risk' },
};

const REPORT_TILES = [
  { title:'Pipeline Health Report',   desc:'Stage velocity & conversion analysis' },
  { title:'Explorer Performance',     desc:'Agent conversation metrics & quality' },
  { title:'Candidate Quality Report', desc:'Deep match & fit dimension analysis' },
  { title:'Compensation Benchmarks',  desc:'Offer vs. market rate comparison' },
  { title:'Compliance & EEO Report',  desc:'Equal opportunity tracking & compliance' },
  { title:'Recruiter Productivity',   desc:'Team metrics & individual KPIs' },
];

function SL({ label, color = TEAL, children }: any) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 16px', flexShrink: 0, fontFamily: F }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 9, color: MUTED, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 400, flex: 1 }}>{label}</span>
      {children}
    </div>
  );
}

function Cell({ children, style = {} }: any) {
  return <div style={{ border: '1px solid ' + BORDER, display: 'flex', flexDirection: 'column', overflow: 'hidden', ...style }}>{children}</div>;
}

function KPI({ label, value, sub, col = DARK, unit = '' }: any) {
  return (
    <div style={{ padding: '10px 14px' }}>
      <div style={{ fontSize: 9, color: MUTED, letterSpacing: '.09em', textTransform: 'uppercase', marginBottom: 4, fontWeight: 400 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1, color: col, marginBottom: 3 }}>
        {value}{unit && <span style={{ fontSize: 11, color: MUTED, marginLeft: 2 }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontSize: 10, color: MUTED, fontWeight: 300 }}>{sub}</div>}
    </div>
  );
}

export default function ReportsPage() {
  const [dateRange, setDateRange]     = useState('6m');
  const [roleFilter, setRoleFilter]   = useState('all');
  const [deptFilter, setDeptFilter]   = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [previewReport, setPreviewReport] = useState<any>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ frequency:'weekly', day:'Monday', time:'09:00', recipients:'', reportType:'Pipeline Health Report' });
  const [generating, setGenerating]   = useState<string | null>(null);
  const [startDate, setStartDate]     = useState('2025-09-01');
  const [endDate, setEndDate]         = useState('2026-02-28');
  const toast = useToast();

  const fleetQuery    = useFleet();
  const pipelineQuery = usePipeline();
  const fromApi = !!fleetQuery.data?.fromApi || !!pipelineQuery.data?.fromApi;

  const rangeMonths = dateRange === '1m' ? MONTHS.slice(11) : dateRange === '3m' ? MONTHS.slice(9) : MONTHS.slice(6);

  const handleExport = (reportName?: string) => {
    const label = reportName || 'All Reports';
    const fmt = exportFormat.toUpperCase();
    setGenerating(label);
    setTimeout(() => {
      setGenerating(null);
      if (fmt === 'CSV' || fmt === 'XLSX') {
        const rows = [['Metric', ...rangeMonths], ...METRICS_ROWS.map(r => [r.label, ...r.values])];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type:'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href=url; a.download=`taltas-${label.toLowerCase().replace(/\s/g,'-')}.csv`; a.click(); URL.revokeObjectURL(url);
      } else {
        const metricsHtml = METRICS_ROWS.map(r=>`<tr><td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:12px">${r.label}</td>${r.values.map(v=>`<td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:12px;text-align:center;font-family:monospace">${v}</td>`).join('')}</tr>`).join('');
        const html=`<!DOCTYPE html><html><head><title>${label} — Taltas</title><style>body{font-family:sans-serif;padding:40px;max-width:900px;margin:0 auto}h1{font-size:22px;margin-bottom:4px}h2{font-size:14px;color:#64748b;margin-bottom:24px}table{width:100%;border-collapse:collapse;margin-bottom:24px}th{text-align:left;padding:8px 10px;background:#f1f5f9;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;border-bottom:2px solid #e2e8f0}.footer{margin-top:40px;font-size:10px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:16px}@media print{body{padding:20px}}</style></head><body><h1>${label}</h1><h2>Taltas Recruiter Portal - ${startDate} to ${endDate}</h2><table><thead><tr><th>Metric</th>${rangeMonths.map(m=>`<th style="text-align:center">${m}</th>`).join('')}</tr></thead><tbody>${metricsHtml}</tbody></table><div class="footer">Generated by Taltas - ${new Date().toLocaleDateString()} - Confidential</div><script>window.print();</script></body></html>`;
        const blob=new Blob([html],{type:'text/html'}); const url=URL.createObjectURL(blob); window.open(url,'_blank');
      }
      toast.show(`${label} ${fmt} downloaded`);
    }, 1200);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', fontFamily:F, overflowY:'auto' }}>

      {/* PAGE HEADER */}
      <div style={{ height: 68, paddingLeft: 24, paddingRight: 24, borderBottom: '1px solid ' + BORDER, background: '#fff', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>  
        <div>
          <div style={{ fontSize:15, fontWeight:400, letterSpacing:'-0.01em', color:DARK }}>Reports</div>
          <div style={{ fontSize:11, color:MUTED, fontWeight:300, marginTop:1 }}>{startDate.slice(0,7).replace('-','/')} - {endDate.slice(0,7).replace('-','/')}</div>
        </div>
        <div style={{ 
      {/* METRICS STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', background: BLUE, flexShrink: 0 }}>
        {[
          { v: '6', l: 'Report Types', sub: 'Pipeline, source, velocity' },
          { v: '2', l: 'Scheduled', sub: 'Weekly & monthly' },
          { v: '14', l: 'Exports This Month', sub: 'CSV & PDF' },
          { v: '90d', l: 'Date Range', sub: 'Rolling window' },
        ].map((m, i) => (
          <div key={i} style={{ padding: '18px 24px', borderRight: i < 3 ? '1px solid rgba(255,255,255,.1)' : 'none' }}>
            <div style={{ fontSize: 36, fontWeight: 300, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 4 }}>{m.v}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', fontWeight: 300, marginBottom: 2 }}>{m.l}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontWeight: 300 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      display:'flex', gap:1, marginLeft:16 }}>
          {[{k:'1m',l:'1M'},{k:'3m',l:'3M'},{k:'6m',l:'6M'},{k:'12m',l:'12M'}].map(({k,l})=>(
            <button key={k} onClick={()=>setDateRange(k)}
              style={{ background:'none', border:'none', borderBottom: dateRange===k ? `2px solid ${BLUE}` : '2px solid transparent', padding:'0 14px', height:36, fontSize:12, color:dateRange===k?DARK:MUTED, fontFamily:F, fontWeight:dateRange===k?400:300, cursor:'pointer' }}>{l}</button>
          ))}
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center', marginLeft:8 }}>
          <DataSourceBadge fromApi={fromApi} />
          {[
            ['roleFilter', roleFilter, setRoleFilter, ['All Roles','Staff ML Eng','Principal Eng','DevRel Eng','Staff AI Sys','Senior Data']],
            ['deptFilter', deptFilter, setDeptFilter, ['All Departments','Engineering','AI/ML','DevRel','Data']],
            ['srcFilter',  sourceFilter, setSourceFilter, ['All Sources','Taltas Network','LinkedIn','Greenhouse','Indeed','Referral']],
          ].map(([id,val,set,opts]: any)=>(
            <div key={id} style={{ position:'relative' }}>
              <select value={val} onChange={e=>set(e.target.value)}
                style={{ appearance:'none', padding:'5px 24px 5px 10px', border:'1px solid '+BORDER, fontSize:12, fontFamily:F, color:MID, background:'#fff', outline:'none', cursor:'pointer' }}>
                {opts.map((o:string)=><option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <select value={exportFormat} onChange={e=>setExportFormat(e.target.value)}
            style={{ appearance:'none', padding:'5px 10px', border:'1px solid '+BORDER, fontSize:11, fontFamily:F, color:MID, background:'#fff', outline:'none', cursor:'pointer' }}>
            <option value="pdf">PDF</option><option value="csv">CSV</option><option value="xlsx">Excel</option>
          </select>
          <button onClick={()=>handleExport()}
            style={{ padding:'5px 12px', border:'1px solid '+BORDER, background:'none', cursor:'pointer', fontFamily:F, fontSize:11, color:MID, display:'flex', alignItems:'center', gap:5 }}>
            {generating ? 'Generating...' : `Export ${exportFormat.toUpperCase()}`}
          </button>
          <button onClick={()=>setScheduleOpen(true)}
            style={{ padding:'5px 14px', border:'none', background:BLUE, cursor:'pointer', fontFamily:F, fontSize:11, color:'#fff' }}>
            Schedule Report
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex:1, padding:'20px 24px', display:'flex', flexDirection:'column', gap:16, overflowY:'auto' }}>

        {/* ROW 1: Pipeline Volume + Time-to-Fill + Source + Quality */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 260px 250px', gap:16 }}>

          {/* Pipeline Volume */}
          <Cell>
            <SL label="Pipeline Volume" color={BLUE}>
              <span style={{ fontSize:9, background:'#E8F0FF', color:BLUE, padding:'1px 7px', fontWeight:500 }}>API</span>
              <span style={{ fontSize:11, color:MUTED, fontWeight:300 }}>{startDate.slice(0,7)} - {endDate.slice(0,7)}</span>
            </SL>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', borderTop:'1px solid '+BORDER, borderBottom:'1px solid '+BORDER }}>
              <div style={{ padding:'10px 14px', borderRight:'1px solid '+BORDER }}><div style={{ fontSize:9, color:MUTED, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:4, fontWeight:400 }}>Total Applied</div><div style={{ fontSize:24, fontWeight:300, color:DARK, letterSpacing:'-0.02em', lineHeight:1, marginBottom:3 }}>162</div><div style={{ fontSize:10, color:MUTED, fontWeight:300 }}>+9.5% vs last period</div></div>
              <div style={{ padding:'10px 14px', borderRight:'1px solid '+BORDER }}><div style={{ fontSize:9, color:MUTED, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:4, fontWeight:400 }}>Avg / Month</div><div style={{ fontSize:24, fontWeight:300, color:DARK, letterSpacing:'-0.02em', lineHeight:1, marginBottom:3 }}>131</div><div style={{ fontSize:10, color:MUTED, fontWeight:300 }}>6-month average</div></div>
              <div style={{ padding:'10px 14px' }}><div style={{ fontSize:9, color:MUTED, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:4, fontWeight:400 }}>Screened</div><div style={{ fontSize:24, fontWeight:300, color:BLUE, letterSpacing:'-0.02em', lineHeight:1, marginBottom:3 }}>87</div><div style={{ fontSize:10, color:MUTED, fontWeight:300 }}>54% screen rate</div></div>
            </div>
            <div style={{ height:220, padding:'8px 8px 4px', flexShrink:0 }}><PipelineVolumeChart /></div>
          </Cell>

          {/* Time-to-Fill & Offer Rate */}
          <Cell>
            <SL label="Time-to-Fill & Offer Rate" color={BLUE} />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderTop:'1px solid '+BORDER, borderBottom:'1px solid '+BORDER }}>
              <div style={{ padding:'10px 14px', borderRight:'1px solid '+BORDER }}>
                <div style={{ fontSize:9, color:MUTED, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:4, fontWeight:400 }}>Time-to-Fill</div>
                <div style={{ fontSize:24, fontWeight:300, color:TEAL, letterSpacing:'-0.02em', lineHeight:1, marginBottom:3 }}>18<span style={{ fontSize:11, color:MUTED, marginLeft:2 }}>days</span></div>
                <div style={{ fontSize:10, color:MUTED, fontWeight:300 }}>6 days faster than Sep</div>
              </div>
              <div style={{ padding:'10px 14px' }}>
                <div style={{ fontSize:9, color:MUTED, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:4, fontWeight:400 }}>Offer Accept</div>
                <div style={{ fontSize:24, fontWeight:300, color:BLUE, letterSpacing:'-0.02em', lineHeight:1, marginBottom:3 }}>79%</div>
                <div style={{ fontSize:10, color:MUTED, fontWeight:300 }}>11pp higher than Sep</div>
              </div>
            </div>
            <div style={{ height:220, padding:'8px 8px 4px', flexShrink:0 }}><MonthlyTrendChart /></div>
          </Cell>

          {/* Source Effectiveness */}
          <Cell>
            <SL label="Source Effectiveness" color={PURPLE} />
            <div style={{ height:220, padding:'8px', flexShrink:0 }}><SourceChart /></div>
            <div style={{ padding:'8px 14px 10px', borderTop:'1px solid '+BORDER, fontSize:10, color:MUTED, fontWeight:300, lineHeight:1.5 }}>Quality: 40% offer rate · 35% deep match avg</div>
          </Cell>

          {/* Explorer vs ATS Quality */}
          <Cell>
            <SL label="Explorer vs ATS Quality" color={TEAL} />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderTop:'1px solid '+BORDER, borderBottom:'1px solid '+BORDER }}>
              <div style={{ padding:'12px 14px', borderRight:'1px solid '+BORDER }}>
                <div style={{ fontSize:9, color:MUTED, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:6, fontWeight:400 }}>ATS Only</div>
                <div style={{ fontSize:26, fontWeight:300, color:AMBER, letterSpacing:'-0.02em', lineHeight:1, marginBottom:4 }}>64%</div>
                <div style={{ height:3, background:'#FFF3DC' }}><div style={{ height:3, width:'64%', background:AMBER }} /></div>
              </div>
              <div style={{ padding:'12px 14px' }}>
                <div style={{ fontSize:9, color:MUTED, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:6, fontWeight:400 }}>Taltas Explorer</div>
                <div style={{ fontSize:26, fontWeight:300, color:TEAL, letterSpacing:'-0.02em', lineHeight:1, marginBottom:4 }}>91%</div>
                <div style={{ height:3, background:'#E6F5EE' }}><div style={{ height:3, width:'91%', background:TEAL }} /></div>
              </div>
            </div>
            <div style={{ padding:'14px 16px' }}>
              <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:5 }}>
                <div style={{ fontSize:32, fontWeight:300, color:BLUE, letterSpacing:'-0.02em' }}>34</div>
                <div style={{ fontSize:9, color:MUTED, letterSpacing:'.08em', textTransform:'uppercase' }}>Hidden Gems</div>
              </div>
              <div style={{ fontSize:11, color:MID, fontWeight:300, lineHeight:1.5, marginBottom:8 }}>Candidates passed by ATS then advanced by Explorer.</div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:17, fontWeight:300, color:TEAL }}>11</span>
                <span style={{ fontSize:10, color:MUTED, fontWeight:300 }}>now in Final Round or Offer</span>
              </div>
            </div>
          </Cell>
        </div>

        {/* ROW 2: Monthly Metrics + Explorer ROI */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 520px', gap:16 }}>

          {/* Monthly Metrics Table */}
          <Cell>
            <SL label="Monthly Hiring Metrics" color={TEAL} />
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                <thead>
                  <tr style={{ borderTop:'1px solid '+BORDER, borderBottom:'1px solid '+BORDER, background:BLIGHT }}>
                    <th style={{ padding:'7px 16px', textAlign:'left', fontSize:9, color:MUTED, letterSpacing:'.09em', textTransform:'uppercase', fontWeight:400, whiteSpace:'nowrap' }}>Metric</th>
                    {rangeMonths.map(m=><th key={m} style={{ padding:'7px 14px', textAlign:'right', fontSize:9, color:MUTED, letterSpacing:'.09em', textTransform:'uppercase', fontWeight:400 }}>{m}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {METRICS_ROWS.map((row,ri)=>(
                    <tr key={ri} style={{ background: ri%2===1 ? 'rgba(0,0,0,.012)' : '#fff', borderBottom:'1px solid '+BLIGHT }}>
                      <td style={{ padding:'9px 16px', color:MID, fontWeight:300, whiteSpace:'nowrap' }}>{row.label}</td>
                      {row.values.map((v,vi)=>{
                        const isLast = vi===row.values.length-1;
                        return <td key={vi} style={{ padding:'9px 14px', textAlign:'right', fontSize:12, color:isLast?(row.trend==='up'?TEAL:RED):DARK, fontWeight:isLast?500:300 }}>{v}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Cell>

          {/* Explorer ROI */}
          <Cell>
            <SL label="Explorer ROI Analysis" color={TEAL} />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderTop:'1px solid '+BORDER }}>
              {[
                { l:'Cost Per Hire (Explorer)', v:'$2.9K', sub:'31% less than manual',     col:TEAL  },
                { l:'Cost Per Hire (Manual)',   v:'$4.2K', sub:'Industry avg',              col:AMBER },
                { l:'Time Saved / Month',       v:'127',   sub:'hrs - Screening automation', col:BLUE  },
                { l:'Quality Improvement',      v:'+34%',  sub:'Offer rate vs ATS-only',    col:TEAL  },
                { l:'Explorer API Cost',        v:'$42.80',sub:'This billing period',        col:MID   },
                { l:'Net ROI',                  v:'18.4x', sub:'Return on investment',      col:TEAL  },
              ].map((s,i)=>(
                <div key={i} style={{ padding:'12px 14px', borderRight:i%2===0?'1px solid '+BORDER:'none', borderBottom:i<4?'1px solid '+BORDER:'none' }}>
                  <div style={{ fontSize:9, color:MUTED, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:5, lineHeight:1.3, fontWeight:400 }}>{s.l}</div>
                  <div style={{ fontSize:20, fontWeight:300, letterSpacing:'-0.02em', color:s.col, lineHeight:1, marginBottom:3 }}>{s.v}</div>
                  <div style={{ fontSize:10, color:MUTED, fontWeight:300 }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </Cell>
        </div>

        {/* ROW 3: Role Pipeline Health */}
        <Cell>
          <SL label="Role Pipeline Health" color={AMBER} />
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
            <thead>
              <tr style={{ borderTop:'1px solid '+BORDER, borderBottom:'1px solid '+BORDER, background:BLIGHT }}>
                {['Role','Applied','Screened','Interview','Offers','Funnel','Health'].map(h=>(
                  <th key={h} style={{ padding:'7px 14px', textAlign:h==='Role'?'left':'right', fontSize:9, color:MUTED, letterSpacing:'.09em', textTransform:'uppercase', fontWeight:400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLE_PIPELINE_HEALTH.map((r,i)=>{
                const hc = HC[r.health];
                const maxA = 47;
                return (
                  <tr key={i} style={{ background:i%2===1?'rgba(0,0,0,.012)':'#fff', borderBottom:'1px solid '+BLIGHT }}>
                    <td style={{ padding:'9px 14px', fontWeight:400, color:DARK }}>{r.role}</td>
                    <td style={{ padding:'9px 14px', textAlign:'right', color:MID }}>{r.applied}</td>
                    <td style={{ padding:'9px 14px', textAlign:'right', color:BLUE }}>{r.screened}</td>
                    <td style={{ padding:'9px 14px', textAlign:'right', color:PURPLE }}>{r.interview}</td>
                    <td style={{ padding:'9px 14px', textAlign:'right', color:r.offer>0?TEAL:MUTED }}>{r.offer||'—'}</td>
                    <td style={{ padding:'9px 14px', textAlign:'right' }}>
                      <div style={{ display:'flex', gap:2, justifyContent:'flex-end' }}>
                        {[r.applied,r.screened,r.interview,r.offer].map((v,vi)=>(
                          <div key={vi} style={{ height:6, width:Math.max(4,Math.round((v/maxA)*40)), background:vi===0?'#C8D8FF':vi===1?BLUE:vi===2?PURPLE:TEAL, opacity:v===0?.2:1 }} />
                        ))}
                      </div>
                    </td>
                    <td style={{ padding:'9px 14px', textAlign:'right' }}>
                      <span style={{ fontSize:10, padding:'2px 8px', background:hc.bg, color:hc.c, fontWeight:500 }}>{hc.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Cell>

        {/* ROW 4: Diversity + Radar + Pareto */}
        <div style={{ display:'grid', gridTemplateColumns:'460px 1fr 1fr', gap:16 }}>

          {/* Diversity */}
          <Cell>
            <div style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 16px', flexShrink:0 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:PURPLE, flexShrink:0 }} />
              <span style={{ fontSize:9, color:MUTED, letterSpacing:'.1em', textTransform:'uppercase', fontWeight:400, flex:1, fontFamily:F }}>Diversity</span>
              <span style={{ fontSize:10, color:MUTED, fontWeight:300 }}>Pipeline - Feb 2026</span>
            </div>
            <div style={{ padding:'12px 16px', borderTop:'1px solid '+BORDER, display:'flex', flexDirection:'column', gap:14, overflowY:'auto' }}>

              <div>
                <div style={{ fontSize:9, color:MUTED, letterSpacing:'.09em', textTransform:'uppercase', marginBottom:6, fontWeight:400 }}>Gender</div>
                <div style={{ height:18 }}><GenderBar /></div>
                <div style={{ display:'flex', gap:12, marginTop:6, flexWrap:'wrap' }}>
                  {[['Male 48%',BLUE],['Female 44%',PURPLE],['Non-Binary 8%',TEAL]].map(([l,col]:any)=>(
                    <div key={l} style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <div style={{ width:7, height:7, borderRadius:'50%', background:col }} />
                      <span style={{ fontSize:9.5, color:MUTED }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize:9, color:MUTED, letterSpacing:'.09em', textTransform:'uppercase', marginBottom:6, fontWeight:400 }}>Ethnicity</div>
                <div style={{ height:18 }}><EthnicBar /></div>
                <div style={{ display:'flex', gap:8, marginTop:6, flexWrap:'wrap' }}>
                  {[['White 38%',BLUE],['Asian 32%',TEAL],['Black 15%',PURPLE],['Hispanic 10%','#F5A623'],['Other 5%','#CCCCCC']].map(([l,col]:any)=>(
                    <div key={l} style={{ display:'flex', alignItems:'center', gap:3 }}>
                      <div style={{ width:6, height:6, borderRadius:'50%', background:col }} />
                      <span style={{ fontSize:9, color:MUTED }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize:9, color:MUTED, letterSpacing:'.09em', textTransform:'uppercase', marginBottom:8, fontWeight:400 }}>Seniority Level</div>
                {[{l:'Senior / Staff',pct:42,col:BLUE},{l:'Mid-Level',pct:35,col:PURPLE},{l:'Junior / Entry',pct:23,col:'#CCCCCC'}].map((s,i)=>(
                  <div key={i} style={{ marginBottom:6 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                      <span style={{ fontSize:10.5, color:MID, fontWeight:300 }}>{s.l}</span>
                      <span style={{ fontSize:10.5, color:s.col, fontWeight:500 }}>{s.pct}%</span>
                    </div>
                    <div style={{ height:3, background:'#EBEBEB' }}><div style={{ height:3, width:s.pct+'%', background:s.col }} /></div>
                  </div>
                ))}
              </div>

              <div>
                <div style={{ fontSize:9, color:MUTED, letterSpacing:'.09em', textTransform:'uppercase', marginBottom:8, fontWeight:400 }}>Interview to Offer Rate by Gender</div>
                {[{l:'Male',rate:'22%',col:BLUE},{l:'Female',rate:'19%',col:PURPLE},{l:'Non-Binary',rate:'17%',col:TEAL}].map((s,i)=>(
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:i<2?'1px solid '+BLIGHT:'none' }}>
                    <span style={{ fontSize:11, color:MID, fontWeight:300 }}>{s.l}</span>
                    <span style={{ fontSize:11, color:s.col, fontWeight:500 }}>{s.rate}</span>
                  </div>
                ))}
                <div style={{ marginTop:5, fontSize:10, color:MUTED, fontWeight:300, lineHeight:1.5 }}>3pp gap between highest and lowest group.</div>
              </div>

              <div>
                <div style={{ fontSize:9, color:MUTED, letterSpacing:'.09em', textTransform:'uppercase', marginBottom:8, fontWeight:400 }}>Funnel Drop-off vs Baseline</div>
                {[{l:'Black',delta:'-8pp',flag:true},{l:'Hispanic',delta:'-5pp',flag:true},{l:'Asian',delta:'+2pp',flag:false},{l:'White',delta:'+4pp',flag:false}].map((s,i)=>(
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:i<3?'1px solid '+BLIGHT:'none' }}>
                    <span style={{ fontSize:11, color:MID, fontWeight:300 }}>{s.l}</span>
                    <span style={{ fontSize:11, color:s.flag?RED:TEAL, fontWeight:500 }}>{s.delta}</span>
                  </div>
                ))}
                <div style={{ marginTop:5, fontSize:10, color:RED, fontWeight:300, lineHeight:1.5 }}>Black and Hispanic candidates drop off at higher rates at Recruiter Review.</div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[{l:'Disability Disclosed',v:'6%',col:BLUE},{l:'Veteran Status',v:'4%',col:TEAL}].map((s,i)=>(
                  <div key={i} style={{ padding:'10px 12px', border:'1px solid '+BORDER }}>
                    <div style={{ fontSize:9, color:MUTED, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:4, lineHeight:1.3, fontWeight:400 }}>{s.l}</div>
                    <div style={{ fontSize:18, fontWeight:300, color:s.col, letterSpacing:'-0.02em', lineHeight:1, marginBottom:2 }}>{s.v}</div>
                    <div style={{ fontSize:9.5, color:MUTED, fontWeight:300 }}>of applicants</div>
                  </div>
                ))}
              </div>
            </div>
          </Cell>

          {/* Quality Radar */}
          <Cell>
            <SL label="Quality Dimensions Radar" color={BLUE} />
            <div style={{ height:260, padding:4, flexShrink:0 }}><ReportsRadarChart /></div>
            <div style={{ padding:'8px 16px 12px', borderTop:'1px solid '+BORDER, fontSize:10.5, color:MID, fontWeight:300, lineHeight:1.5, flexShrink:0 }}>
              Explorer candidates score <strong style={{ color:BLUE }}>27%</strong> higher across all dimensions on average.
            </div>
          </Cell>

          {/* Rejection Pareto */}
          <Cell>
            <div style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 16px', flexShrink:0, fontFamily:F }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:RED, flexShrink:0 }} />
              <span style={{ fontSize:9, color:MUTED, letterSpacing:'.1em', textTransform:'uppercase', fontWeight:400, flex:1 }}>Rejection Pareto Analysis</span>
              <span style={{ fontSize:11, color:MUTED, fontWeight:300 }}>Top 3 = 70%</span>
            </div>
            <div style={{ height:240, padding:'4px 8px', flexShrink:0 }}><ReportsParetoChart /></div>
            <div style={{ padding:'8px 16px 12px', borderTop:'1px solid '+BORDER, fontSize:10.5, color:MID, fontWeight:300, flexShrink:0 }}>
              Top 3 rejection reasons account for <strong style={{ color:RED }}>70%</strong> of all rejections.
            </div>
          </Cell>
        </div>

        {/* Available Reports */}
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:MUTED }} />
              <span style={{ fontSize:9, color:MUTED, letterSpacing:'.1em', textTransform:'uppercase', fontWeight:400, fontFamily:F }}>Available Reports</span>
            </div>
            <button onClick={()=>setScheduleOpen(true)}
              style={{ padding:'6px 14px', border:'none', background:TEAL, cursor:'pointer', fontFamily:F, fontSize:11, color:'#fff' }}>
              Schedule Report
            </button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            {REPORT_TILES.map((rc,i)=>(
              <div key={i} onClick={()=>setPreviewReport(rc)}
                style={{ border:'1px solid '+BORDER, padding:'18px 20px', display:'flex', flexDirection:'column', gap:8, cursor:'pointer', transition:'border-color .12s' }}
                onMouseEnter={e=>(e.currentTarget.style.borderColor=BLUE)}
                onMouseLeave={e=>(e.currentTarget.style.borderColor=BORDER)}>
                <div style={{ fontSize:14, fontWeight:400, color:DARK }}>{rc.title}</div>
                <div style={{ fontSize:11, color:MUTED, fontWeight:300, lineHeight:1.5 }}>{rc.desc}</div>
                <button onClick={e=>{e.stopPropagation();handleExport(rc.title);}}
                  style={{ alignSelf:'flex-start', padding:'5px 14px', background:BLUE, border:'none', fontSize:11, color:'#fff', cursor:'pointer', fontFamily:F, marginTop:4 }}>
                  {generating===rc.title ? 'Generating...' : 'Preview'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {scheduleOpen && (
        <Modal open={scheduleOpen} onClose={()=>setScheduleOpen(false)} title="Schedule Report">
          <div style={{ display:'flex', flexDirection:'column', gap:12, padding:'4px 0', fontFamily:F }}>
            {[
              { l:'Report Type', el:<select value={scheduleForm.reportType} onChange={e=>setScheduleForm(f=>({...f,reportType:e.target.value}))} style={{ width:'100%', padding:'6px 10px', border:'1px solid '+BORDER, fontFamily:F, fontSize:12, color:DARK, outline:'none' }}>{REPORT_TILES.map(r=><option key={r.title}>{r.title}</option>)}</select> },
              { l:'Frequency',   el:<select value={scheduleForm.frequency} onChange={e=>setScheduleForm(f=>({...f,frequency:e.target.value}))} style={{ width:'100%', padding:'6px 10px', border:'1px solid '+BORDER, fontFamily:F, fontSize:12, color:DARK, outline:'none' }}><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="daily">Daily</option></select> },
              { l:'Recipients',  el:<input value={scheduleForm.recipients} onChange={e=>setScheduleForm(f=>({...f,recipients:e.target.value}))} placeholder="email@company.com, ..." style={{ width:'100%', padding:'6px 10px', border:'1px solid '+BORDER, fontFamily:F, fontSize:12, color:DARK, outline:'none' }} /> },
            ].map(({l,el})=>(
              <div key={l}>
                <div style={{ fontSize:11, color:MID, fontWeight:400, marginBottom:5, fontFamily:F }}>{l}</div>
                {el}
              </div>
            ))}
            <button onClick={()=>{toast.show('Report scheduled');setScheduleOpen(false);}}
              style={{ background:BLUE, border:'none', color:'#fff', padding:'9px', cursor:'pointer', fontFamily:F, fontSize:13, marginTop:4 }}>
              Confirm Schedule
            </button>
          </div>
        </Modal>
      )}

      {/* Preview Modal */}
      {previewReport && (
        <Modal open={!!previewReport} onClose={()=>setPreviewReport(null)} title={previewReport.title}>
          <div style={{ fontFamily:F }}>
            <div style={{ fontSize:12, color:MUTED, fontWeight:300, marginBottom:16 }}>{previewReport.desc}</div>
            <button onClick={()=>{handleExport(previewReport.title);setPreviewReport(null);}}
              style={{ background:BLUE, border:'none', color:'#fff', padding:'8px 16px', cursor:'pointer', fontFamily:F, fontSize:12 }}>
              Export {exportFormat.toUpperCase()}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
