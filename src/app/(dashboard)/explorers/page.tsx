'use client';

import { useState, useMemo } from 'react';
import { useToast } from '@/components/ui/toast';
import { useExplorers } from '@/lib/data-provider';
import { DataSourceBadge } from '@/components/shared/api-status';
import { resolveIcon } from '@/components/icon-resolver';
import { IconChart, IconArrowUp, IconSearch } from '@/components/icons';
import { ExplorerDetailModal } from '@/components/modals/explorer-detail-modal';
import { NewExplorerModal } from '@/components/modals/new-explorer-modal';

const EXPLORER_PERF = [
  { id: 'staffml', name: 'StaffML-Agent', icon: 'bot', iconBg: 'var(--green-bg)', role: 'Staff ML Engineer', mode: 'AUTO', modeCls: 'bm-auto', conversations: 47, a2a: 12, interviews: 9, rejected: 14, rejPct: '29.8%', offerRate: '19.1%', deepMatch: 87, status: 'Active', statusCls: 'green', live: true, variant: '' },
  { id: 'principaleng', name: 'PrincipalEng-Agent', icon: 'dna', iconBg: 'var(--blue-bg)', role: 'Principal Eng., Platform', mode: 'AUTO', modeCls: 'bm-auto', conversations: 31, a2a: 8, interviews: 6, rejected: 9, rejPct: '29.0%', offerRate: '19.4%', deepMatch: 91, status: 'Active', statusCls: 'green', live: true, variant: 'v2' },
  { id: 'devrel', name: 'DevRel-Agent', icon: 'target', iconBg: 'var(--purple-bg)', role: 'DevRel Engineer', mode: 'ASSIST', modeCls: 'bm-assist', conversations: 19, a2a: 5, interviews: 3, rejected: 6, rejPct: '31.6%', offerRate: '15.8%', deepMatch: 82, status: 'Assist', statusCls: 'blue', live: true, variant: 'v3' },
  { id: 'dataeng', name: 'DataEng-Agent', icon: 'chart', iconBg: 'var(--surface3)', role: 'Senior Data Engineer', mode: 'DRAFT', modeCls: 'bm-draft', conversations: 0, a2a: 0, interviews: 0, rejected: 0, rejPct: '—', offerRate: '—', deepMatch: 0, status: 'Draft', statusCls: '', live: false, variant: '' },
  { id: 'staffai', name: 'AISystem-Agent', icon: 'brain', iconBg: 'var(--purple-bg)', role: 'Staff Engineer, AI Systems', mode: 'AUTO', modeCls: 'bm-auto', conversations: 28, a2a: 7, interviews: 5, rejected: 8, rejPct: '28.6%', offerRate: '17.9%', deepMatch: 85, status: 'Active', statusCls: 'green', live: true, variant: '' },
  { id: 'founding', name: 'FoundingEng-Agent', icon: 'rocket', iconBg: 'var(--orange-bg)', role: 'Founding Engineer, Product', mode: 'ASSIST', modeCls: 'bm-assist', conversations: 9, a2a: 3, interviews: 2, rejected: 3, rejPct: '33.3%', offerRate: '22.2%', deepMatch: 78, status: 'Assist', statusCls: 'blue', live: true, variant: 'v2' },
];

function PerfBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-[6px]">
      <div className="w-[70px] h-[4px] rounded-[2px] overflow-hidden" style={{ background: 'var(--surface3)' }}>
        <div className="h-full rounded-[2px]" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
      <span className="font-mono text-[10px]" style={{ color: 'var(--text-dim)' }}>{value}</span>
    </div>
  );
}

export default function ExplorersPage() {
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [newExplorerOpen, setNewExplorerOpen] = useState(false);
  const toast = useToast();
  const explorersQuery = useExplorers();
  const apiExplorers = explorersQuery.data?.data || [];
  const fromApi = !!explorersQuery.data?.fromApi;

  // Map API/mock explorers to performance view shape
  const apiIds = new Set(apiExplorers.map(e => e.id));
  const mappedApiExplorers = apiExplorers.map(e => ({
    id: e.id, name: e.name, icon: e.icon || 'bot', iconBg: e.iconBg || 'var(--green-bg)', role: e.role || '',
    mode: e.mode || 'AUTO', modeCls: `bm-${(e.mode || 'AUTO').toLowerCase()}`,
    conversations: e.conversations || 0, a2a: e.a2aSessions || 0, interviews: e.interviewsSet || 0,
    rejected: Math.floor((e.conversations || 0) * 0.3), rejPct: e.conversations ? `${((Math.floor((e.conversations || 0) * 0.3) / (e.conversations || 1)) * 100).toFixed(1)}%` : '—',
    offerRate: e.conversations ? `${((e.interviewsSet || 0) / (e.conversations || 1) * 100).toFixed(1)}%` : '—',
    deepMatch: (e as any).deepMatch || Math.floor(Math.random() * 15 + 75),
    status: e.mode === 'DRAFT' ? 'Draft' : e.mode === 'ASSIST' ? 'Assist' : 'Active',
    statusCls: e.mode === 'DRAFT' ? '' : e.mode === 'ASSIST' ? 'blue' : 'green',
    live: e.mode !== 'DRAFT', variant: '',
  }));
  // Merge: API agents first, then EXPLORER_PERF entries not already covered by API
  const perfNotInApi = EXPLORER_PERF.filter(ep => !apiIds.has(ep.id));
  const baseExplorers = [...mappedApiExplorers, ...perfNotInApi];

  const modeOrder = { AUTO: 0, ASSIST: 1, DRAFT: 2 };
  const allExplorers = baseExplorers.sort((a, b) => (modeOrder[a.mode as keyof typeof modeOrder] ?? 2) - (modeOrder[b.mode as keyof typeof modeOrder] ?? 2));

  const filtered = useMemo(() => {
    return allExplorers.filter(e => {
      if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.role.toLowerCase().includes(search.toLowerCase())) return false;
      if (modeFilter && e.mode !== modeFilter) return false;
      return true;
    });
  }, [search, modeFilter, allExplorers]);

  return (
    <div className="flex flex-col gap-[13px]">
      {/* KPI Row */}
      <div className="grid gap-[10px]" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="kpi"><div className="kpi-label">Active Explorers</div><div className="kpi-num" style={{ color: 'var(--blue)' }}>{allExplorers.length}</div><div className="font-mono text-[9px]" style={{ color: 'var(--muted)' }}>{allExplorers.filter(e=>e.mode==='AUTO').length} Auto · {allExplorers.filter(e=>e.mode==='ASSIST').length} Assist · {allExplorers.filter(e=>e.mode==='DRAFT').length} Draft</div></div>
        <div className="kpi" style={{ animationDelay: '.05s' }}><div className="kpi-label">Total Conversations</div><div className="kpi-num">{allExplorers.reduce((s,e)=>s+e.conversations,0)}</div><div className="kpi-delta up"><IconArrowUp size={9} /> today</div></div>
        <div className="kpi" style={{ animationDelay: '.1s' }}><div className="kpi-label">Agent-to-Agent Sessions</div><div className="kpi-num" style={{ color: 'var(--purple)' }}>{allExplorers.reduce((s,e)=>s+e.a2a,0)}</div><div className="font-mono text-[9px]" style={{ color: 'var(--muted)' }}>Candidate agents negotiating</div></div>
        <div className="kpi" style={{ animationDelay: '.15s' }}><div className="kpi-label">Interviews Booked</div><div className="kpi-num" style={{ color: 'var(--green)' }}>{allExplorers.reduce((s,e)=>s+e.interviews,0)}</div><div className="kpi-delta up"><IconArrowUp size={9} /> this week</div></div>
      </div>

      {/* Performance Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-[10px]">
          <span className="mono-label flex items-center gap-[6px]"><IconChart size={12} /> Explorer Performance Center<DataSourceBadge fromApi={fromApi} /></span>
          <button className="ctrl-btn blue flex items-center gap-[4px]" style={{ fontSize: '9.5px' }} onClick={() => setNewExplorerOpen(true)}>
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            New Explorer
          </button>
        </div>
        <div className="flex gap-[6px] mb-[14px]">
          <div className="relative">
            <IconSearch size={12} className="absolute left-[9px] top-1/2 -translate-y-1/2 opacity-40" />
            <input className="bg-[var(--surface2)] rounded-lg pr-3 py-[5px] text-[11px] outline-none" style={{ border: '1px solid var(--border)', width: 200, paddingLeft: 30 }} placeholder="Search explorers…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" style={{ fontSize: '10px' }} value={modeFilter} onChange={e => setModeFilter(e.target.value)}>
            <option value="">All Modes</option><option>AUTO</option><option>ASSIST</option><option>DRAFT</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="cand-table" style={{ minWidth: 1000 }}>
            <thead><tr><th>Explorer</th><th>Target Role</th><th>Mode</th><th>Conversations</th><th>Agent-to-Agent</th><th>Interviews Set</th><th>Rejected</th><th>Offer Rate</th><th>Deep Match %</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} onClick={() => setDetailId(e.id)} style={{ cursor: 'pointer', opacity: e.mode === 'DRAFT' ? 0.6 : 1 }} className="hover:bg-[var(--surface2)]">
                  <td>
                    <div className="flex items-center gap-[8px]">
                      <div className="w-[28px] h-[28px] rounded-[7px] flex items-center justify-center flex-shrink-0" style={{ background: e.iconBg, border: '1px solid var(--border)' }}>{resolveIcon(e.icon, { size: 14 })}</div>
                      <span className="text-[12px] font-medium" style={{ color: 'var(--text-bright)' }}>{e.name}</span>
                      {e.live && <div className="agent-blob"><div className={`agent-blob-inner live ${e.variant}`}><div className="agent-blob-glow" /></div></div>}
                    </div>
                  </td>
                  <td className="text-[11px]" style={{ color: 'var(--text-dim)' }}>{e.role}</td>
                  <td><span className={`jbot-mode ${e.modeCls}`}>{e.mode}</span></td>
                  <td>{e.mode !== 'DRAFT' ? <PerfBar value={e.conversations} max={50} color="var(--blue)" /> : <span className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>—</span>}</td>
                  <td className="font-mono text-[11px]" style={{ color: 'var(--text-dim)' }}>{e.mode !== 'DRAFT' ? e.a2a : '—'}</td>
                  <td>{e.mode !== 'DRAFT' ? <span className="text-[16px] font-semibold" style={{ fontFamily: "'Roboto Slab', serif", color: 'var(--text-bright)' }}>{e.interviews}</span> : '—'}</td>
                  <td>{e.mode !== 'DRAFT' ? <span><span className="font-mono text-[13px] font-bold" style={{ color: 'var(--red)' }}>{e.rejected}</span><span className="text-[8px] ml-[3px]" style={{ color: 'var(--muted)' }}>{e.rejPct}</span></span> : '—'}</td>
                  <td className="font-mono text-[11px]" style={{ color: e.mode !== 'DRAFT' ? 'var(--green)' : 'var(--muted)' }}>{e.offerRate}</td>
                  <td>{e.mode !== 'DRAFT' ? <PerfBar value={e.deepMatch} max={100} color="var(--green)" /> : '—'}</td>
                  <td onClick={ev => ev.stopPropagation()}>
                    {e.mode === 'DRAFT' ? (
                      <button className="ctrl-btn run" style={{ fontSize: '9px' }} onClick={() => { toast.show(`Activating ${e.name}...`, 'info'); }}>Activate</button>
                    ) : (
                      <span className="font-mono text-[9px] px-[8px] py-[2px] rounded" style={{ color: `var(--${e.statusCls})`, background: `var(--${e.statusCls}-bg)`, border: `1px solid var(--${e.statusCls}-border)` }}>{e.status}</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={10} className="text-center py-8" style={{ color: 'var(--muted)' }}>No explorers match your search</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <ExplorerDetailModal open={!!detailId} onClose={() => setDetailId(null)} explorerId={detailId} />
      <NewExplorerModal open={newExplorerOpen} onClose={() => setNewExplorerOpen(false)} />
    </div>
  );
}
