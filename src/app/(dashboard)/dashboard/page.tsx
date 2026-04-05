// @ts-nocheck
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_CANDIDATES, MOCK_ROLES, MOCK_INTEGRATIONS, MOCK_EXPLORERS, PIPELINE_STAGES, fitBadgeClass, stageBadgeClass, urgencyClass } from '@/lib/mock-data';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useExplorers, useCandidates, useRoles, useIntegrations, useFleet, usePipeline, useCreateExplorer, useUpdateExplorer, useDashboard } from '@/lib/data-provider';
import { DataSourceBadge } from '@/components/shared/api-status';
import { resolveIcon } from '@/components/icon-resolver';
import { IconMap, IconMessageCircle, IconHandshake, IconCalendar, IconChevronRight, IconArrowUp, IconArrowDown, IconUser, IconSearch } from '@/components/icons';
import { CandidateModal } from '@/components/modals/candidate-modal';
import { NewRoleModal } from '@/components/modals/new-role-modal';
import { NewExplorerModal } from '@/components/modals/new-explorer-modal';
import { EditExplorerModal } from '@/components/modals/edit-explorer-modal';
import { ExplorerDetailModal } from '@/components/modals/explorer-detail-modal';

function KpiCard({ label, value, delta, dir, delay }: { label: string; value: string; delta: string; dir: 'up' | 'down' | 'flat'; delay: string }) {
  const Arrow = dir === 'up' ? IconArrowUp : dir === 'down' ? IconArrowDown : IconChevronRight;
  return (
    <div className="kpi" style={{ animationDelay: delay }}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-num">{value}</div>
      <div className={`kpi-delta ${dir}`}><Arrow size={9} /> {delta}</div>
    </div>
  );
}

function ScoreDots({ score }: { score: number }) {
  const filled = Math.round(score / 10);
  return (
    <div className="score-dots">
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className={`sd ${i < filled ? (score >= 90 ? 'g' : score >= 75 ? 'b' : 'o') : ''}`} />
      ))}
      <span className="font-mono text-[10px] ml-1" style={{ color: score >= 90 ? 'var(--green)' : score >= 75 ? 'var(--blue)' : 'var(--text-dim)', fontWeight: 600 }}>{score}</span>
    </div>
  );
}

function DeepMatchBars({ dm }: { dm: NonNullable<typeof MOCK_CANDIDATES[0]['deepMatch']> }) {
  return (
    <div className="flex flex-col gap-[3px]" style={{ minWidth: 100 }}>
      {[{ key: 'Tech', val: dm.technical, color: 'var(--blue)' },{ key: 'Culture', val: dm.culture, color: 'var(--green)' },{ key: 'Lead', val: dm.leadership, color: 'var(--purple)' }].map((d) => (
        <div key={d.key} className="dm-row"><span className="dm-label">{d.key}</span><div className="dm-track"><div className="dm-fill" style={{ width: `${d.val}%`, background: d.color }} /></div><span className="dm-pct">{d.val}</span></div>
      ))}
    </div>
  );
}

function SentimentBar({ value, trend = '' }: { value: number; trend?: string }) {
  const col = value >= 80 ? 'var(--green)' : value >= 65 ? 'var(--blue)' : 'var(--orange)';
  return (
    <div className="flex items-center gap-[5px]">
      <div className="w-[44px] h-[4px] overflow-hidden" style={{ background: 'var(--surface3)' }}>
        <div className="h-full" style={{ width: `${value}%`, background: col }} />
      </div>
      <span className="font-mono text-[10px]" style={{ color: col }}>{value}%</span>
      <span className="font-mono text-[8px]" style={{ color: (trend || '').includes('+') ? 'var(--green)' : !trend || trend === '0' ? 'var(--muted)' : 'var(--orange)' }}>{!trend || trend === '0' ? '—' : trend}</span>
    </div>
  );
}

type SortKey = 'name' | 'score' | 'stage' | 'company' | 'sentiment';
type SortDir = 'asc' | 'desc';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeStage, setActiveStage] = useState(-1);
  const [openBots, setOpenBots] = useState<Record<string, boolean>>({ jbot0: true });
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [fitFilter, setFitFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [candModal, setCandModal] = useState<string | null>(null);
  const [newRoleOpen, setNewRoleOpen] = useState(false);
  const [newExplorerOpen, setNewExplorerOpen] = useState(false);
  const explorersQuery = useExplorers();
  const candidatesQuery = useCandidates();
  const rolesQuery = useRoles();
  const integrationsQuery = useIntegrations();
  const fleetQuery = useFleet();
  const pipelineQuery = usePipeline();
  const apiExplorers = explorersQuery.data?.data || MOCK_EXPLORERS;
  const apiCandidates = candidatesQuery.data?.data || MOCK_CANDIDATES;
  const apiRoles = rolesQuery.data?.data || MOCK_ROLES;
  const apiIntegrations = integrationsQuery.data?.data || MOCK_INTEGRATIONS;
  const apiPipelineStages = pipelineQuery.data?.data?.stages || PIPELINE_STAGES;
  const dashboardQuery = useDashboard();
  const dashData = dashboardQuery.data?.data;
  const allRoles = apiRoles;
  const allExplorers = [...apiExplorers].sort((a, b) => { const order: Record<string, number> = { AUTO: 0, ASSIST: 1, DRAFT: 2 }; return (order[a.mode] ?? 2) - (order[b.mode] ?? 2); });
  const [explorerDetail, setExplorerDetail] = useState<string | null>(null);
  const [editExplorer, setEditExplorer] = useState<any>(null);
  const [intToggles, setIntToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(apiIntegrations.map(i => [i.name, i.connected]))
  );

  const filtered = useMemo(() => {
    let cands = [...apiCandidates];
    if (search) { const q = search.toLowerCase(); cands = cands.filter(c => c.name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.company.toLowerCase().includes(q)); }
    if (activeStage >= 0) { const stageKey = apiPipelineStages[activeStage]?.key; if (stageKey) cands = cands.filter(c => c.stage === stageKey); }
    if (stageFilter) cands = cands.filter(c => c.stage === stageFilter);
    if (fitFilter) cands = cands.filter(c => c.fitLabel === fitFilter);
    cands.sort((a, b) => { let cmp = 0; if (sortKey === 'name') cmp = a.name.localeCompare(b.name); else if (sortKey === 'score') cmp = a.score - b.score; else if (sortKey === 'stage') cmp = a.stage.localeCompare(b.stage); else if (sortKey === 'company') cmp = a.company.localeCompare(b.company); else if (sortKey === 'sentiment') cmp = a.sentiment - b.sentiment; return sortDir === 'desc' ? -cmp : cmp; });
    return cands;
  }, [search, activeStage, stageFilter, fitFilter, sortKey, sortDir, apiCandidates, apiPipelineStages]);

  function toggleSort(key: SortKey) { if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDir('desc'); } }
  const sortArrow = (key: SortKey) => sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';
  const selectedCandidate = candModal ? apiCandidates.find(c => c.id === candModal) || null : null;

  return (
    <div>
      <div className="grid gap-[9px] mb-[14px]" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
        <KpiCard label="Open Jobs" value={String(dashData?.roles?.open ?? allRoles.length)} delta={`${dashData?.newThisWeek ?? 3} this week`} dir="up" delay=".02s" />
        <KpiCard label="In Pipeline" value={String(dashData?.totalCandidates ?? apiCandidates.length)} delta={`${dashData?.activeSessions ?? 0} active`} dir="up" delay=".05s" />
        <KpiCard label="Explorer Convos" value={String(dashData?.conversations ?? 0)} delta={`${dashData?.matchRate ?? 0}% match rate`} dir="up" delay=".08s" />
        <KpiCard label="Interviews Sched." value={String(dashData?.activeSessions ?? 0)} delta="on track" dir="flat" delay=".11s" />
        <KpiCard label="Offers Sent" value={String(dashData?.matches ?? 0)} delta={`${dashData?.matchRate ?? 0}% rate`} dir="up" delay=".14s" />
        <KpiCard label="Avg. Time-to-Hire" value="18d" delta="3d vs last mo." dir="up" delay=".17s" />
      </div>

      <div className="grid gap-[13px]" style={{ gridTemplateColumns: '1fr 380px', alignItems: 'start' }}>
        <div className="flex flex-col gap-[13px]">
          <div className="card" style={{ display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 180px)', minHeight: 300 }}>
            <div className="flex items-center justify-between mb-[14px] flex-wrap gap-[6px]">
              <span className="mono-label flex items-center gap-[6px]"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg> Active Pipeline<DataSourceBadge fromApi={!!candidatesQuery.data?.fromApi} /></span>
              <span className="fit-badge fit-deep">{filtered.length} candidates</span>
            </div>
            <div className="pipeline-stages mb-[13px]">
              {apiPipelineStages.map((s, i) => (
                <div key={s.key} style={{ display: 'contents' }}>
                  <div className={`stage ${i === activeStage ? 'active' : ''}`} onClick={() => setActiveStage(i === activeStage ? -1 : i)}>
                    <div className="stage-num">{s.count}</div>
                    <div className="stage-label">{s.key}</div>
                  </div>
                  {i < apiPipelineStages.length - 1 && <div className="stage-sep">›</div>}
                </div>
              ))}
            </div>
            <div className="flex gap-[7px] px-[14px] py-[8px] flex-wrap" style={{ borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 2 }}>
              <div className="relative flex-1" style={{ minWidth: 140 }}>
                <IconSearch size={12} className="absolute left-[9px] top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
                <input className="w-full bg-[var(--surface2)] pr-3 py-[5px] text-[11.5px] outline-none" style={{ border: '1px solid var(--border)', height: 30, paddingLeft: 32 }} placeholder="Search candidates…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <select className="filter-select" style={{ fontSize: '10px' }} value={stageFilter} onChange={e => setStageFilter(e.target.value)}><option value="">All Stages</option><option>Explorer Screen</option><option>Recruiter Review</option><option>Interview</option><option>Hiring Mgr Review</option><option>Final Round</option><option>Offer Extended</option></select>
              <select className="filter-select" style={{ fontSize: '10px' }} value={fitFilter} onChange={e => setFitFilter(e.target.value)}><option value="">All Fit</option><option>Deep Match</option><option>Strong Fit</option><option>Good Fit</option></select>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              <table className="cand-table">
                <thead><tr>
                  <th className="sortable" onClick={() => toggleSort('name')}>Candidate{sortArrow('name')}</th>
                  <th className="sortable" onClick={() => toggleSort('company')}>Role{sortArrow('company')}</th>
                  <th className="sortable" onClick={() => toggleSort('stage')}>Stage{sortArrow('stage')}</th>
                  <th className="sortable" onClick={() => toggleSort('score')}>AI Match{sortArrow('score')}</th>
                  <th>Deep Match</th>
                  <th className="sortable" onClick={() => toggleSort('sentiment')}>Sentiment Map{sortArrow('sentiment')}</th>
                  <th>Fit · Source</th>
                  <th>Actions</th>
                </tr></thead>
                <tbody>
                  {filtered.slice(0, 14).map((c) => (
                    <tr key={c.id} onClick={() => setCandModal(c.id)} style={{ cursor: 'pointer' }} className="hover:bg-[var(--surface2)]">
                      <td><div className="flex items-center gap-[8px]"><img src={c.avatar} alt="" className="w-[28px] h-[28px] rounded-full object-cover flex-shrink-0" /><div><div className="text-[12px] font-medium" style={{ color: 'var(--text)' }}>{c.name}</div><div className="text-[10px]" style={{ color: 'var(--muted)' }}>{c.title}</div></div></div></td>
                      <td className="text-[11px]" style={{ color: 'var(--muted)' }}>{c.company}</td>
                      <td><span className={`stage-badge ${stageBadgeClass(c.stage)}`}>{c.stage}</span></td>
                      <td><ScoreDots score={c.score} /></td>
                      <td>{c.deepMatch && <DeepMatchBars dm={c.deepMatch} />}</td>
                      <td><SentimentBar value={c.sentiment} trend={c.sentimentTrend} /></td>
                      <td><div className="flex flex-col gap-[3px]"><span className={`fit-badge ${fitBadgeClass(c.fitLabel)}`}>{c.fitLabel}</span><span className={`font-mono text-[8.5px] ${c.source === 'Taltas Network' ? 'text-[var(--blue)]' : 'text-[var(--text-dim)]'}`}>{c.source}</span></div></td>
                      <td onClick={e => e.stopPropagation()}><div className="flex gap-[4px]"><button className="ctrl-btn purple flex items-center gap-[3px]" style={{ fontSize: '8.5px' }} onClick={() => setCandModal(c.id)}><IconMap size={9} /> Map</button><button className="ctrl-btn blue flex items-center gap-[3px]" style={{ fontSize: '8.5px' }} onClick={() => setCandModal(c.id)}><IconUser size={9} /> Profile</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-[14px]">
              <span className="mono-label flex items-center gap-[6px]"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 4v16M15 4v16M4 9h16M4 15h16"/></svg> HR Platforms & Job Site Integrations<DataSourceBadge fromApi={!!integrationsQuery.data?.fromApi} /></span>
              <div className="flex gap-[6px] items-center">
                <span className="fit-badge fit-good">{Object.values(intToggles).filter(Boolean).length} Connected</span>
                <span className="fit-badge" style={{ color: 'var(--orange)', background: 'var(--orange-bg)', borderColor: 'var(--orange-border)' }}>{apiIntegrations.filter(i => i.needsAttention).length} Needs Attention</span>
              </div>
            </div>
            <div className="int-grid" style={{ maxHeight: 360, overflowY: 'auto' }}>
              {apiIntegrations.map((int) => (
                <div key={int.name} className="int-tile">
                  <div className="w-[32px] h-[32px] flex items-center justify-center flex-shrink-0" style={{ background: int.iconBg, border: '1px solid var(--border)' }}>{resolveIcon(int.icon, { size: 16 })}</div>
                  <div className="flex-1">
                    <div className="text-[11.5px] font-medium" style={{ color: 'var(--text-bright)' }}>{int.name}</div>
                    <div className="font-mono text-[8.5px]" style={{ color: 'var(--muted)' }}>{int.category}</div>
                    <div className="flex items-center gap-[5px] mt-[5px]"><div className="w-[5px] h-[5px]" style={{ background: intToggles[int.name || int.id || ""] ? 'var(--green)' : 'var(--orange)' }} /><span className="font-mono text-[9px]" style={{ color: intToggles[int.name || int.id || ""] ? 'var(--green)' : 'var(--orange)' }}>{intToggles[int.name || int.id || ""] ? 'Connected' : int.needsAttention ? 'Needs Setup' : 'Disconnected'}</span></div>
                    {intToggles[int.name || int.id || ""] && <div className="font-mono text-[8px] mt-[2px]" style={{ color: 'var(--muted)' }}>{(int.records || 0).toLocaleString()} records · {int.lastSync || 'Never'}</div>}
                  </div>
                  <button className={`int-toggle ${intToggles[int.name || int.id || ""] ? (int.needsAttention ? 'warn' : 'on') : 'off'}`} onClick={(e) => { e.stopPropagation(); setIntToggles(prev => ({ ...prev, [int.name]: !prev[int.name] })); }} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-[13px]">
          <div className="card">
            <div className="flex items-center justify-between mb-[14px]">
              <span className="mono-label flex items-center gap-[6px]"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /></svg> Open Jobs<DataSourceBadge fromApi={!!rolesQuery.data?.fromApi} /></span>
              <div className="flex gap-[6px] items-center">
                <span className="font-mono text-[9px] px-[8px] py-[2px] " style={{ color: 'var(--text-dim)', background: 'var(--surface2)', border: '1px solid var(--border2)' }}>24 active</span>
                <button className="ctrl-btn flex items-center gap-[4px]" style={{ fontSize: '9px', background: 'var(--blue)', color: '#fff', borderColor: 'var(--blue)' }} onClick={() => setNewRoleOpen(true)}><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> New Job</button>
              </div>
            </div>
            <div style={{ maxHeight: 350, overflowY: 'auto' }}>
              {allRoles.map((role) => (
                <div key={role.id} className="role-row" onClick={() => router.push('/jobs')}><div><div className="role-title">{role.title}</div><div className="role-meta">{role.department} · {role.location} · {role.salary}</div></div><div className="role-right"><span className={`urg-badge ${urgencyClass(role.urgency)}`}>{role.urgency}</span><span className="ats-source">{role.atsSource}</span><div><div className="role-count-num">{role.candidateCount}</div><div className="role-count-label">candidates</div></div></div></div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-[14px]">
              <span className="mono-label flex items-center gap-[6px]"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4M8 11V9M16 11V9" /></svg> Explorer Interactions<DataSourceBadge fromApi={!!explorersQuery.data?.fromApi} /></span>
              <button className="ctrl-btn blue flex items-center gap-[4px]" style={{ fontSize: '9.5px' }} onClick={() => setNewExplorerOpen(true)}><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> New Explorer</button>
            </div>
            {allExplorers.map((bot) => {
              const isOpen = openBots[bot.id] || false;
              const botKey = bot.id === 'jbot0' ? 'staffml' : bot.id === 'jbot1' ? 'principaleng' : bot.id === 'jbot2' ? 'devrel' : 'dataeng';
              return (
                <div key={bot.id} className="jbot" style={{ opacity: bot.mode === 'DRAFT' ? 0.6 : 1 }}>
                  <div className="jbot-header" onClick={() => setOpenBots((prev) => ({ ...prev, [bot.id]: !prev[bot.id] }))}>
                    <div className="jbot-icon" style={{ background: bot.iconBg }}>{resolveIcon(bot.icon, { size: 16 })}</div>
                    <div className="jbot-main">
                      <div className="jbot-title-row"><span className="jbot-name">{bot.name}</span><span className={`jbot-mode ${bot.mode === 'AUTO' ? 'bm-auto' : bot.mode === 'ASSIST' ? 'bm-assist' : 'bm-draft'}`}>{bot.mode}</span>{bot.mode !== 'DRAFT' && <div className="agent-blob"><div className={`agent-blob-inner live ${bot.id === 'jbot1' ? 'v2' : bot.id === 'jbot2' ? 'v3' : ''}`}><div className="agent-blob-glow" /></div></div>}</div>
                      <div className="jbot-role"><IconChevronRight size={10} /> {bot.role} · {bot.ats}</div>
                      <div className="jbot-stats-row"><div className="jbot-chip"><IconMessageCircle size={10} /> {bot.conversations} convos</div><div className="jbot-chip"><IconHandshake size={10} /> {bot.a2aSessions} A2A</div>{bot.interviewsSet > 0 && <div className="jbot-chip"><IconCalendar size={10} /> {bot.interviewsSet} interviews</div>}</div>
                    </div>
                    <div className="jbot-right">{bot.interviewsSet > 0 && <div><div className="jbot-int-num">{bot.interviewsSet}</div><div className="jbot-int-label">Interviews<br/>Set</div></div>}<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}><polyline points="6 9 12 15 18 9" /></svg></div>
                  </div>
                  {isOpen && (
                    <div className="jbot-body" style={{ paddingTop: 10 }}>
                      <div className="font-mono text-[8.5px] uppercase tracking-[.1em] mb-[8px]" style={{ color: 'var(--muted)' }}>{(bot.interactions || []).length > 0 ? 'Recent Interactions' : 'No activity yet — explorer is in draft'}</div>
                      {(bot.interactions || []).map((ip, i) => {
                        const cand = apiCandidates.find(c => c.name === ip.name);
                        return (
                          <div key={i} className="ip-row" style={{ cursor: cand ? 'pointer' : 'default' }} onClick={() => { if (cand) setCandModal(cand.id); }}>
                            <div className="ip-avatar"><img src={ip.avatar} alt="" /></div>
                            <span className="ip-name">{ip.name}</span>
                            <span className="ip-agent">via {ip.via}</span>
                            <span className="ip-sent" style={{ background: `var(--${ip.sentimentColor}-bg)`, color: `var(--${ip.sentimentColor})`, borderColor: `var(--${ip.sentimentColor}-border)` }}>{ip.sentiment}</span>
                            <span style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                              <button className="ctrl-btn flex items-center gap-[3px]" style={{ fontSize: '8px', padding: '2px 6px' }} onClick={(e) => { e.stopPropagation(); if (cand) setCandModal(cand.id); }}><IconUser size={8} /> Profile</button>
                              <button className="ctrl-btn purple flex items-center gap-[3px]" style={{ fontSize: '8px', padding: '2px 6px' }} onClick={(e) => { e.stopPropagation(); if (cand) setCandModal(cand.id); }}><IconMap size={8} /> Sentiment Map</button>
                            </span>
                          </div>
                        );
                      })}
                      <div className="flex gap-[6px] mt-[10px] pt-[8px]" style={{ borderTop: '1px solid var(--border)' }}>
                        <button className="ctrl-btn blue flex items-center gap-[3px]" style={{ fontSize: '9px' }} onClick={() => setExplorerDetail(botKey)}><IconMessageCircle size={10} /> View All</button>
                        <button className="ctrl-btn flex items-center gap-[3px]" style={{ fontSize: '9px' }} onClick={() => setEditExplorer(bot)}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <CandidateModal open={!!candModal} onClose={() => setCandModal(null)} candidate={selectedCandidate} />
      <NewRoleModal open={newRoleOpen} onClose={() => setNewRoleOpen(false)} onCreateExplorer={(title) => { setNewRoleOpen(false); setTimeout(() => setNewExplorerOpen(true), 200); }} />
      <NewExplorerModal open={newExplorerOpen} onClose={() => setNewExplorerOpen(false)} />
      <ExplorerDetailModal open={!!explorerDetail} onClose={() => setExplorerDetail(null)} explorerId={explorerDetail} />
      <EditExplorerModal open={!!editExplorer} onClose={() => setEditExplorer(null)} explorer={editExplorer} />
    </div>
  );
}

