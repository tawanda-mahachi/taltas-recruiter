// @ts-nocheck
'use client';

import { useState, useMemo, useEffect } from 'react';
import { MOCK_CANDIDATES, fitBadgeClass, stageBadgeClass } from '@/lib/mock-data';
import { useCandidates } from '@/lib/data-provider';
import { DataSourceBadge } from '@/components/shared/api-status';
import { IconSearch, IconX, IconDownload, IconMap, IconUser, IconPlus } from '@/components/icons';
import { CandidateModal } from '@/components/modals/candidate-modal';
import { useAuthStore } from '@/lib/stores/auth-store';

type SortKey = 'name' | 'score' | 'stage' | 'sentiment';
type SortDir = 'asc' | 'desc';

function ScoreDots({ score }: { score: number }) {
  const filled = Math.round(score / 10);
  return (
    <div className="score-dots">
      {Array.from({ length: 10 }, (_, i) => (<div key={i} className={`sd ${i < filled ? (score >= 90 ? 'g' : score >= 75 ? 'b' : 'o') : ''}`} />))}
      <span className="font-mono text-[10px] ml-1" style={{ color: score >= 90 ? 'var(--green)' : score >= 75 ? 'var(--blue)' : 'var(--text-dim)', fontWeight: 600 }}>{score}</span>
    </div>
  );
}

function DeepMatchBars({ dm }: { dm: NonNullable<typeof MOCK_CANDIDATES[0]['deepMatch']> }) {
  return (
    <div className="flex flex-col gap-[3px]" style={{ minWidth: 100 }}>
      {[{ key: 'Tech', val: dm.technical, color: 'var(--blue)' }, { key: 'Culture', val: dm.culture, color: 'var(--green)' }, { key: 'Lead', val: dm.leadership, color: 'var(--purple)' }].map(d => (
        <div key={d.key} className="dm-row"><span className="dm-label">{d.key}</span><div className="dm-track"><div className="dm-fill" style={{ width: `${d.val}%`, background: d.color }} /></div><span className="dm-pct">{d.val}</span></div>
      ))}
    </div>
  );
}

function SentimentBar({ value, trend = '' }: { value: string; trend?: string }) {
  const pct = parseInt(value);
  const col = pct >= 75 ? 'var(--green)' : pct >= 50 ? 'var(--blue)' : 'var(--orange)';
  return (
    <div className="flex items-center gap-[6px]">
      <div className="w-[50px] h-[4px] overflow-hidden" style={{ background: 'var(--surface3)' }}>
        <div className="h-full" style={{ width: `${pct}%`, background: col }} />
      </div>
      <span className="font-mono text-[10px]" style={{ color: col }}>{value}%</span>
      <span className="font-mono text-[8px]" style={{ color: (trend || '').includes('↑') ? 'var(--green)' : 'var(--orange)' }}>{trend || '—'}</span>
    </div>
  );
}

export default function CandidatesPage() {
  const { token } = useAuthStore();
  const [pushLogs, setPushLogs] = useState<Record<string, any>>({});
  const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.taltas.ai/api/v1';

  useEffect(() => {
    if (!token) return;
    fetch(API + '/integrations/activity-feed?limit=100', { headers: { Authorization: 'Bearer ' + token } })
      .then(r => r.ok ? r.json() : [])
      .then((logs: any[]) => {
        const map: Record<string, any> = {};
        logs.filter(l => l.eventType === 'push_candidate' && l.sessionId).forEach(l => {
          if (!map[l.sessionId] || l.status === 'success') map[l.sessionId] = l;
        });
        setPushLogs(map);
      }).catch(() => {});
  }, [token]);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [fitFilter, setFitFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [candModal, setCandModal] = useState<string | null>(null);
  const candidatesQuery = useCandidates();
  const apiCandidates = candidatesQuery.data?.data || MOCK_CANDIDATES;
  const fromApi = !!candidatesQuery.data?.fromApi;

  const filtered = useMemo(() => {
    let cands = [...apiCandidates];
    if (search) { const q = search.toLowerCase(); cands = cands.filter(c => c.name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || (c.tags || []).some(t => t.toLowerCase().includes(q))); }
    if (stageFilter) cands = cands.filter(c => c.stage === stageFilter);
    if (fitFilter) cands = cands.filter(c => c.fitLabel === fitFilter);
    cands.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'score') cmp = a.score - b.score;
      else if (sortKey === 'stage') cmp = a.stage.localeCompare(b.stage);
      else if (sortKey === 'sentiment') cmp = parseInt(String(a.sentiment)) - parseInt(String(b.sentiment));
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return cands;
  }, [search, stageFilter, fitFilter, sortKey, sortDir, apiCandidates]);

  function toggleSort(key: SortKey) { if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDir('desc'); } }
  const sa = (key: SortKey) => sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  const selectedCandidate = candModal ? apiCandidates.find(c => c.id === candModal) || null : null;

  return (
    <div className="flex flex-col gap-[13px]">
      <div className="card">
        <div className="flex items-center justify-between mb-[14px] flex-wrap gap-[6px]">
          <span className="mono-label flex items-center gap-[6px]"><IconUser size={11} /> All Candidates · {apiCandidates.length} in Pipeline<DataSourceBadge fromApi={fromApi} /></span>
          <div className="flex gap-[6px]">
            <button className="ctrl-btn blue flex items-center gap-[3px]"><IconDownload size={10} /> Export CSV</button>
            <button className="ctrl-btn run flex items-center gap-[3px]"><IconPlus size={10} /> Add Candidate</button>
          </div>
        </div>

        <div className="flex flex-wrap gap-[6px] items-center mb-[12px]">
          <div className="relative flex-1" style={{ minWidth: 180, maxWidth: 320 }}><IconSearch size={12} className="absolute left-[10px] top-1/2 -translate-y-1/2 opacity-40" style={{ pointerEvents: 'none' }} /><input className="form-input" style={{ paddingLeft: 32, fontSize: 11 }} placeholder="Search by name, role, skills…" value={search} onChange={e => setSearch(e.target.value)} /></div>
          <select className="filter-select" value={stageFilter} onChange={e => setStageFilter(e.target.value)}>
            <option value="">All Stages</option><option>Explorer Screen</option><option>Recruiter Review</option><option>Interview</option><option>Hiring Mgr Review</option><option>Final Round</option><option>Offer Extended</option><option>On Hold</option>
          </select>
          <select className="filter-select" value={fitFilter} onChange={e => setFitFilter(e.target.value)}>
            <option value="">All Fit Labels</option><option>Deep Match</option><option>Strong Fit</option><option>Good Fit</option><option>Alignment</option><option>Potential Fit</option>
          </select>
          {(search || stageFilter || fitFilter) && <button className="ctrl-btn flex items-center gap-[3px]" onClick={() => { setSearch(''); setStageFilter(''); setFitFilter(''); }}><IconX size={9} /> Clear</button>}
        </div>
        <div className="font-mono text-[9px] mb-[8px]" style={{ color: 'var(--muted)' }}>{filtered.length} of {apiCandidates.length} candidates</div>

        <div className="overflow-x-auto">
          <table className="cand-table">
            <thead><tr>
              <th className="sortable" onClick={() => toggleSort('name')}>Candidate{sa('name')}</th>
              <th>Role</th>
              <th className="sortable" onClick={() => toggleSort('stage')}>Stage{sa('stage')}</th>
              <th className="sortable" onClick={() => toggleSort('score')}>AI Match{sa('score')}</th>
              <th>Deep Match</th>
              <th className="sortable" onClick={() => toggleSort('sentiment')}>Sentiment Map{sa('sentiment')}</th>
              <th>Fit · Source</th>
              <th>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} onClick={() => setCandModal(c.id)} style={{ cursor: 'pointer' }} className="hover:bg-[var(--surface2)]">
                  <td>
                    <div className="flex items-center gap-[8px]">
                      <img src={c.avatar} alt="" className="w-[28px] h-[28px] rounded-full object-cover flex-shrink-0" />
                      <div><div className="text-[12px] font-medium" style={{ color: 'var(--text)' }}>{c.name}</div><div className="text-[10px]" style={{ color: 'var(--muted)' }}>{c.title}</div></div>
                    </div>
                  </td>
                  <td className="text-[11px]" style={{ color: 'var(--muted)' }}>{c.company}</td>
                  <td><span className={`stage-badge ${stageBadgeClass(c.stage)}`}>{c.stage}</span></td>
                  <td><ScoreDots score={c.score} /></td>
                  <td>{c.deepMatch && <DeepMatchBars dm={c.deepMatch} />}</td>
                  <td><SentimentBar value={c.sentiment} trend={c.sentimentTrend} /></td>
                  <td>
                    <div className="flex flex-col gap-[3px]">
                      <span className={`fit-badge ${fitBadgeClass(c.fitLabel)}`}>{c.fitLabel}</span>
                      <span className={`font-mono text-[8.5px] ${c.source === 'Taltas Network' ? 'text-[var(--blue)]' : 'text-[var(--text-dim)]'}`}>{c.source}</span>
                    </div>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="flex gap-[4px]">
                      <button className="ctrl-btn purple flex items-center gap-[3px]" style={{ fontSize: '8.5px' }} onClick={() => setCandModal(c.id)}><IconMap size={9} /> Map</button>
                      <button className="ctrl-btn blue flex items-center gap-[3px]" style={{ fontSize: '8.5px' }} onClick={() => setCandModal(c.id)}><IconUser size={9} /> Profile</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} className="text-center py-8" style={{ color: 'var(--muted)' }}>No candidates match your filters</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <CandidateModal open={!!candModal} onClose={() => setCandModal(null)} candidate={selectedCandidate} />
    </div>
  );
}


