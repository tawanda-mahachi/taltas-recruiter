// @ts-nocheck
'use client';

import { useState, useMemo } from 'react';
import { useToast } from '@/components/ui/toast';
import { useExplorers } from '@/lib/data-provider';
import { DataSourceBadge } from '@/components/shared/api-status';
import { ExplorerDetailModal } from '@/components/modals/explorer-detail-modal';
import { NewExplorerModal } from '@/components/modals/new-explorer-modal';

const F      = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const BLUE   = '#2563eb';
const TEAL   = '#1D9E75';
const DARK   = '#0A0A0A';
const MID    = '#6B6B6B';
const MUTED  = '#AAAAAA';
const BORDER = '#E8E8E5';
const BLIGHT = '#F4F4F2';
const RED    = '#CC3300';

const STATUS_CFG: any = {
  running:  { dot: '#22C55E', pulse: true,  label: 'Running',  bg: '#E6F5EE', tc: '#15703A' },
  active:   { dot: '#22C55E', pulse: false, label: 'Active',   bg: '#E6F5EE', tc: '#15703A' },
  idle:     { dot: '#22C55E', pulse: false, label: 'Active',   bg: '#E6F5EE', tc: '#15703A' },
  assist:   { dot: '#22C55E', pulse: false, label: 'Assist',   bg: '#E6F5EE', tc: '#15703A' },
  failed:   { dot: RED,       pulse: false, label: 'Failed',   bg: '#FFEAEA', tc: RED        },
  inactive: { dot: '#CCCCCC', pulse: false, label: 'Inactive', bg: BLIGHT,    tc: MUTED      },
  draft:    { dot: '#DDDDDD', pulse: false, label: 'Draft',    bg: BLIGHT,    tc: MUTED      },
};
const MODE_C: any = {
  AUTO:   { bg: '#E8F0FF', c: BLUE },
  ASSIST: { bg: '#F3EEFF', c: '#7C3AED' },
  DRAFT:  { bg: BLIGHT,    c: MUTED },
};

const MOCK_EXPLORERS = [
  { id:'staffml',      name:'StaffML-Agent',         role:'Staff ML Engineer',          mode:'AUTO',   status:'running',  convs:47, a2a:12, iv:9,  rej:14, rejPct:29.8, offerRate:13.1, dm:87 },
  { id:'principaleng', name:'PrincipalEng-Agent',    role:'Principal Eng., Platform',   mode:'AUTO',   status:'running',  convs:31, a2a:8,  iv:6,  rej:9,  rejPct:29.0, offerRate:19.4, dm:91 },
  { id:'aisystem',     name:'AISystem-Agent',         role:'Staff Engineer, AI Systems', mode:'AUTO',   status:'running',  convs:25, a2a:7,  iv:5,  rej:8,  rejPct:32.0, offerRate:17.9, dm:85 },
  { id:'devrel',       name:'DevRel-Agent',           role:'DevRel Engineer',            mode:'ASSIST', status:'active',   convs:19, a2a:5,  iv:3,  rej:6,  rejPct:31.6, offerRate:15.8, dm:82 },
  { id:'founding',     name:'FoundingEng-Agent',      role:'Founding Engineer, Product', mode:'ASSIST', status:'active',   convs:9,  a2a:3,  iv:2,  rej:3,  rejPct:33.3, offerRate:22.2, dm:78 },
  { id:'juliaasst',    name:'Julia Assistant Agent',  role:'Test Job - Assistant',       mode:'AUTO',   status:'active',   convs:0,  a2a:0,  iv:0,  rej:0,  rejPct:0,    offerRate:0,    dm:84 },
  { id:'gamma',        name:'Gamma Explorer',         role:'',                           mode:'AUTO',   status:'inactive', convs:0,  a2a:0,  iv:0,  rej:0,  rejPct:0,    offerRate:0,    dm:85 },
  { id:'beta',         name:'Beta Explorer',          role:'',                           mode:'AUTO',   status:'inactive', convs:0,  a2a:0,  iv:0,  rej:0,  rejPct:0,    offerRate:0,    dm:83 },
  { id:'alpha',        name:'Alpha Explorer',         role:'',                           mode:'AUTO',   status:'failed',   convs:0,  a2a:0,  iv:0,  rej:0,  rejPct:0,    offerRate:0,    dm:84 },
  { id:'dataeng',      name:'DataEng-Agent',          role:'Senior Data Engineer',       mode:'DRAFT',  status:'draft',    convs:0,  a2a:0,  iv:0,  rej:0,  rejPct:0,    offerRate:0,    dm:0  },
];

function BotIcon({ col = MUTED }: { col?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a2 2 0 0 1 2 2v2h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4V4a2 2 0 0 1 2-2z"/>
      <path d="M8 12h.01M16 12h.01"/>
      <path d="M9 16c.85.63 1.5 1 3 1s2.15-.37 3-1"/>
    </svg>
  );
}

function StatusDot({ status }: { status: string }) {
  const s = STATUS_CFG[status] || STATUS_CFG.inactive;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot, flexShrink: 0, animation: s.pulse ? 'pulse 1.8s ease-in-out infinite' : 'none' }} />
      <span style={{ fontSize: 11, color: status === 'failed' ? RED : status === 'inactive' ? MUTED : DARK, fontWeight: 300 }}>{s.label}</span>
    </div>
  );
}

export default function ExplorersPage() {
  const [search, setSearch]       = useState('');
  const [modeFilter, setModeFilter]     = useState('All Modes');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [detailId, setDetailId]   = useState<string | null>(null);
  const [newOpen, setNewOpen]     = useState(false);
  const toast = useToast();

  const explorersQuery = useExplorers();
  const apiExplorers   = explorersQuery.data?.data || [];
  const fromApi        = !!explorersQuery.data?.fromApi;

  const apiIds = new Set(apiExplorers.map((e: any) => e.id));
  const mapped = apiExplorers.map((e: any) => ({
    id: e.id, name: e.name, role: e.role || '',
    mode: e.mode || 'AUTO',
    status: e.mode === 'DRAFT' ? 'draft' : e.mode === 'ASSIST' ? 'active' : 'active',
    convs: e.conversations || 0, a2a: e.a2aSessions || 0, iv: e.interviewsSet || 0,
    rej: Math.floor((e.conversations || 0) * 0.3),
    rejPct: e.conversations ? +(((Math.floor((e.conversations||0)*0.3))/(e.conversations||1))*100).toFixed(1) : 0,
    offerRate: e.conversations ? +((e.interviewsSet||0)/(e.conversations||1)*100).toFixed(1) : 0,
    dm: (e as any).deepMatch || 0,
  }));
  const mockNotInApi = MOCK_EXPLORERS.filter(m => !apiIds.has(m.id));
  const allExplorers = [...mapped, ...mockNotInApi];
  const maxConvs = Math.max(...allExplorers.map(e => e.convs), 1);

  const filtered = useMemo(() => allExplorers.filter(e => {
    const ms = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.role.toLowerCase().includes(search.toLowerCase());
    const mm = modeFilter === 'All Modes' || e.mode === modeFilter;
    const ms2 = statusFilter === 'All Status' || (STATUS_CFG[e.status]?.label || '').toLowerCase() === statusFilter.toLowerCase() || e.status === statusFilter.toLowerCase();
    return ms && mm && ms2;
  }), [search, modeFilter, statusFilter, allExplorers]);

  const totalConvs = allExplorers.reduce((s, e) => s + e.convs, 0);
  const totalA2A   = allExplorers.reduce((s, e) => s + e.a2a, 0);
  const totalIV    = allExplorers.reduce((s, e) => s + e.iv, 0);
  const activeCount = allExplorers.filter(e => e.status !== 'draft' && e.status !== 'inactive').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, fontFamily: F, overflow: 'hidden' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.2)}}`}</style>

      {/* PAGE HEADER */}
      <div style={{ height: 68, paddingLeft: 24, paddingRight: 24, borderBottom: '1px solid ' + BORDER, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>  
        <div>
          <div style={{ fontSize: 15, fontWeight: 400, letterSpacing: '-0.01em', color: DARK }}>Explorers</div>
          <div style={{ fontSize: 11, color: MUTED, fontWeight: 300, marginTop: 1 }}>Explorer Performance Centre</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 16 }}>
          <DataSourceBadge fromApi={fromApi} />
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={() => setNewOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px', border: 'none', background: BLUE, cursor: 'pointer', fontFamily: F, fontSize: 12, color: '#fff', fontWeight: 400 }}>
            + New Explorer
          </button>
        </div>
      </div>

      {/* METRICS STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', background: BLUE, flexShrink: 0 }}>
        {[
          { v: activeCount,  l: 'Active Explorers',    sub: `${allExplorers.filter(e=>e.mode==='AUTO').length} Auto · ${allExplorers.filter(e=>e.mode==='ASSIST').length} Assist · ${allExplorers.filter(e=>e.mode==='DRAFT').length} Draft` },
          { v: totalConvs,   l: 'Total Conversations', sub: '+4 today' },
          { v: totalA2A,     l: 'Agent-to-Agent',      sub: 'Candidate agents negotiating' },
          { v: totalIV,      l: 'Interviews Booked',   sub: '+2 this week' },
        ].map((m, i) => (
          <div key={i} style={{ padding: '20px 28px', borderRight: i < 3 ? '1px solid rgba(255,255,255,.15)' : 'none', cursor: 'default' }}>
            <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,.55)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10, fontFamily: F }}>{m.l}</div>
            <div style={{ fontSize: 40, fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1, color: '#fff' }}>{m.v}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', fontWeight: 300, marginTop: 8 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div style={{ padding: '10px 24px', borderBottom: '1px solid ' + BORDER, display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', maxWidth: 280, flex: 1 }}>
          <svg style={{ position: 'absolute', left: 9, pointerEvents: 'none' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search explorers..."
            style={{ width: '100%', padding: '6px 10px 6px 28px', border: '1px solid ' + BORDER, fontSize: 12, fontFamily: F, color: DARK, background: '#fff', outline: 'none' }} />
          {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: 14, padding: 0 }}>×</button>}
        </div>
        <select value={modeFilter} onChange={e => setModeFilter(e.target.value)}
          style={{ appearance: 'none', padding: '6px 24px 6px 10px', border: '1px solid ' + BORDER, fontSize: 12, fontFamily: F, color: MID, background: '#fff', outline: 'none', cursor: 'pointer' }}>
          {['All Modes','AUTO','ASSIST','DRAFT'].map(o => <option key={o}>{o}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ appearance: 'none', padding: '6px 24px 6px 10px', border: '1px solid ' + BORDER, fontSize: 12, fontFamily: F, color: MID, background: '#fff', outline: 'none', cursor: 'pointer' }}>
          {['All Status','Running','Active','Failed','Inactive','Draft'].map(o => <option key={o}>{o}</option>)}
        </select>
        {/* Legend */}
        <div style={{ display: 'flex', gap: 14, marginLeft: 10 }}>
          {[['Running','#22C55E',true],['Active','#22C55E',false],['Failed',RED,false],['Inactive','#CCCCCC',false]].map(([l,col,pulse]: any) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: col, animation: pulse ? 'pulse 1.8s ease-in-out infinite' : 'none' }} />
              <span style={{ fontSize: 10.5, color: MUTED, fontWeight: 300 }}>{l}</span>
            </div>
          ))}
        </div>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: MUTED, fontWeight: 300 }}>{filtered.length} of {allExplorers.length}</span>
      </div>

      {/* TABLE */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '18%' }} /><col style={{ width: '15%' }} /><col style={{ width: '7%' }} />
            <col style={{ width: '10%' }} /><col style={{ width: '6%' }} /><col style={{ width: '7%' }} />
            <col style={{ width: '7%' }} /><col style={{ width: '8%' }} /><col style={{ width: '10%' }} />
            <col style={{ width: '12%' }} />
          </colgroup>
          <thead style={{ position: 'sticky', top: 0, zIndex: 5 }}>
            <tr style={{ background: BLIGHT, borderBottom: '1px solid ' + BORDER }}>
              {['Explorer','Target Role','Mode','Conversations','A-to-A','Interviews','Rejected','Offer Rate','Deep Match %','Status'].map(h => (
                <th key={h} style={{ fontSize: 9, color: MUTED, letterSpacing: '.09em', textTransform: 'uppercase', fontWeight: 400, padding: '0 12px', height: 34, textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => {
              const s = STATUS_CFG[e.status] || STATUS_CFG.inactive;
              const mc = MODE_C[e.mode] || MODE_C.AUTO;
              const isDraft = e.status === 'draft';
              const botCol = e.status === 'failed' ? RED : MUTED;
              const convW = Math.round((e.convs / maxConvs) * 80);
              const dmW = Math.round((e.dm / 100) * 100);
              return (
                <tr key={e.id || i}
                  onClick={() => setDetailId(e.id)}
                  style={{ borderBottom: '1px solid ' + BLIGHT, cursor: 'pointer', transition: 'background .1s', opacity: isDraft ? .7 : 1, height: 54 }}
                  onMouseEnter={el => (el.currentTarget.style.background = 'rgba(37,99,235,.016)')}
                  onMouseLeave={el => (el.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '0 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                      <div style={{ width: 28, height: 28, background: BLIGHT, border: '1px solid ' + BORDER, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <BotIcon col={botCol} />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 400, color: DARK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</div>
                    </div>
                  </td>
                  <td style={{ padding: '0 12px', fontSize: 11.5, color: MUTED, fontWeight: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.role || '—'}</td>
                  <td style={{ padding: '0 12px' }}><span style={{ fontSize: 10, padding: '2px 8px', background: mc.bg, color: mc.c, fontWeight: 500 }}>{e.mode}</span></td>
                  <td style={{ padding: '0 12px' }}>
                    {e.convs > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <div style={{ width: convW, height: 4, background: BLUE, opacity: .75, maxWidth: 80 }} />
                        <span style={{ fontSize: 11, color: MID }}>{e.convs}</span>
                      </div>
                    ) : <span style={{ fontSize: 11, color: MUTED }}>—</span>}
                  </td>
                  <td style={{ padding: '0 12px', fontSize: 13, fontWeight: 300, color: e.a2a > 0 ? BLUE : MUTED }}>{e.a2a > 0 ? e.a2a : '—'}</td>
                  <td style={{ padding: '0 12px', fontSize: 13, fontWeight: 300, color: e.iv > 0 ? TEAL : MUTED }}>{e.iv > 0 ? e.iv : '—'}</td>
                  <td style={{ padding: '0 12px' }}>
                    {e.rej > 0 ? (
                      <>
                        <div style={{ fontSize: 12, color: RED }}>{e.rej}</div>
                        <div style={{ fontSize: 9.5, color: MUTED }}>{e.rejPct.toFixed(1)}%</div>
                      </>
                    ) : <span style={{ fontSize: 11, color: MUTED }}>—</span>}
                  </td>
                  <td style={{ padding: '0 12px', fontSize: 12, fontWeight: e.offerRate > 0 ? 500 : 300, color: e.offerRate > 0 ? TEAL : MUTED }}>
                    {e.offerRate > 0 ? e.offerRate.toFixed(1) + '%' : '—'}
                  </td>
                  <td style={{ padding: '0 12px' }}>
                    {e.dm > 0 ? (
                      <>
                        <div style={{ height: 3, width: dmW, background: TEAL, maxWidth: 100, marginBottom: 3 }} />
                        <span style={{ fontSize: 11, color: TEAL, fontWeight: 500 }}>{e.dm}</span>
                      </>
                    ) : <span style={{ fontSize: 11, color: MUTED }}>—</span>}
                  </td>
                  <td style={{ padding: '0 12px' }} onClick={ev => ev.stopPropagation()}>
                    {isDraft ? (
                      <button onClick={() => toast.show(`Activating ${e.name}...`, 'info')}
                        style={{ fontSize: 11, padding: '4px 12px', background: BLUE, border: 'none', color: '#fff', cursor: 'pointer', fontFamily: F }}>
                        Activate
                      </button>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot, flexShrink: 0, animation: s.pulse ? 'pulse 1.8s ease-in-out infinite' : 'none' }} />
                        <span style={{ fontSize: 11, color: DARK, fontWeight: 300 }}>{s.label}</span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: MUTED, fontSize: 13, fontWeight: 300 }}>
            No explorers match your search
          </div>
        )}
      </div>

      <ExplorerDetailModal open={!!detailId} onClose={() => setDetailId(null)} explorerId={detailId} />
      <NewExplorerModal open={newOpen} onClose={() => setNewOpen(false)} />
    </div>
  );
}
