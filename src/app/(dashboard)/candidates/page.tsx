// @ts-nocheck
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_CANDIDATES, fitBadgeClass, stageBadgeClass } from '@/lib/mock-data';
import { useCandidates } from '@/lib/data-provider';
import { DataSourceBadge } from '@/components/shared/api-status';
import { CandidateModal } from '@/components/modals/candidate-modal';
import { useAuthStore } from '@/lib/stores/auth-store';

const F      = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const BLUE   = '#2563eb';
const TEAL   = '#1D9E75';
const DARK   = '#0A0A0A';
const MID    = '#6B6B6B';
const MUTED  = '#AAAAAA';
const BORDER = '#E8E8E5';
const BLIGHT = '#F4F4F2';
const AMBER  = '#D97706';
const PURPLE = '#7C3AED';

type SortKey = 'name' | 'score' | 'stage' | 'sentiment';
type SortDir = 'asc' | 'desc';

function ScoreDots({ score }: { score: number }) {
  const filled = Math.round(score / 10);
  const col = score >= 90 ? TEAL : score >= 75 ? BLUE : AMBER;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} style={{ width: 7, height: 7, borderRadius: 1, background: i < filled ? col : BORDER, flexShrink: 0 }} />
      ))}
      <span style={{ fontFamily: 'monospace', fontSize: 11, color: col, fontWeight: 600, marginLeft: 4 }}>{score}</span>
    </div>
  );
}

function DeepMatchBars({ dm }: { dm: any }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 90 }}>
      {[{ key: 'Tech', val: dm.technical, col: BLUE }, { key: 'Culture', val: dm.culture, col: TEAL }, { key: 'Lead', val: dm.leadership, col: PURPLE }].map(d => (
        <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 8, color: MUTED, width: 28, fontFamily: F }}>{d.key}</span>
          <div style={{ flex: 1, height: 3, background: BORDER, maxWidth: 70 }}>
            <div style={{ height: 3, width: `${d.val}%`, background: d.col }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SentimentBar({ value, trend = '' }: { value: string; trend?: string }) {
  const pct = parseInt(value);
  const col = pct >= 75 ? TEAL : pct >= 50 ? BLUE : AMBER;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 50, height: 4, background: BORDER }}>
        <div style={{ height: 4, width: `${pct}%`, background: col }} />
      </div>
      <span style={{ fontFamily: 'monospace', fontSize: 10, color: col }}>{value}%</span>
      <span style={{ fontFamily: 'monospace', fontSize: 8, color: (trend||'').includes('↑') ? TEAL : AMBER }}>{trend || '—'}</span>
    </div>
  );
}

function FitDot({ label }: { label: string }) {
  const col = label === 'Deep Match' ? TEAL : label === 'Strong Fit' ? BLUE : label === 'Potential Fit' ? AMBER : MID;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: col, flexShrink: 0 }} />
      <span style={{ fontSize: 11, color: col, fontWeight: 300, fontFamily: F }}>{label}</span>
    </div>
  );
}

export default function CandidatesPage() {
  const router = useRouter();
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

  const [search, setSearch]         = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [fitFilter, setFitFilter]   = useState('');
  const [sortKey, setSortKey]       = useState<SortKey>('score');
  const [sortDir, setSortDir]       = useState<SortDir>('desc');
  const [candModal, setCandModal]   = useState<string | null>(null);

  const candidatesQuery = useCandidates();
  const apiCandidates   = candidatesQuery.data?.data || MOCK_CANDIDATES;
  const fromApi         = !!candidatesQuery.data?.fromApi;

  const filtered = useMemo(() => {
    let cands = [...apiCandidates];
    if (search) { const q = search.toLowerCase(); cands = cands.filter(c => c.name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || (c.tags||[]).some((t:string) => t.toLowerCase().includes(q))); }
    if (stageFilter) cands = cands.filter(c => c.stage === stageFilter);
    if (fitFilter)   cands = cands.filter(c => c.fitLabel === fitFilter);
    cands.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name')      cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'score')     cmp = a.score - b.score;
      else if (sortKey === 'stage')     cmp = a.stage.localeCompare(b.stage);
      else if (sortKey === 'sentiment') cmp = parseInt(String(a.sentiment)) - parseInt(String(b.sentiment));
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return cands;
  }, [search, stageFilter, fitFilter, sortKey, sortDir, apiCandidates]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }
  const sa = (key: SortKey) => sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  const selectedCandidate = candModal ? apiCandidates.find(c => c.id === candModal) || null : null;

  // Metrics
  const totalOffers   = apiCandidates.filter((c:any) => c.stage === 'Offer Extended').length;
  const avgScore      = apiCandidates.length ? Math.round(apiCandidates.reduce((s:number,c:any)=>s+c.score,0)/apiCandidates.length) : 0;
  const deepMatches   = apiCandidates.filter((c:any) => c.fitLabel === 'Deep Match').length;
  const inInterview   = apiCandidates.filter((c:any) => ['Interview','Final Round','Hiring Mgr Review'].includes(c.stage)).length;

  const thStyle = (key?: SortKey) => ({
    fontSize: 9, color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '.08em',
    fontWeight: 400, padding: '0 12px', height: 34, textAlign: 'left' as const,
    whiteSpace: 'nowrap' as const, cursor: key ? 'pointer' : 'default',
    userSelect: 'none' as const,
    color: key && sortKey === key ? BLUE : MUTED,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, fontFamily: F, overflow: 'hidden' }}>

      {/* PAGE HEADER */}
      <div style={{ padding: '12px 24px', borderBottom: '1px solid ' + BORDER, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 400, letterSpacing: '-0.01em', color: DARK }}>Candidates</div>
          <div style={{ fontSize: 11, color: MUTED, fontWeight: 300, marginTop: 1 }}>
            All Candidates · {apiCandidates.length} in Pipeline <DataSourceBadge fromApi={fromApi} />
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button style={{ fontSize: 11, color: MID, background: 'none', border: '1px solid ' + BORDER, padding: '5px 12px', cursor: 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            Export CSV
          </button>
          <button style={{ fontSize: 11, color: '#fff', background: BLUE, border: 'none', padding: '5px 14px', cursor: 'pointer', fontFamily: F }}>
            + Add Candidate
          </button>
        </div>
      </div>

      {/* METRICS STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', background: BLUE, flexShrink: 0 }}>
        {[
          { v: apiCandidates.length, l: 'Total Candidates', sub: `${filtered.length} matching filters` },
          { v: deepMatches,           l: 'Deep Match',        sub: 'highest quality candidates' },
          { v: inInterview,           l: 'In Interview',      sub: 'interview, final round, HM review' },
          { v: totalOffers,           l: 'Offers Extended',   sub: `avg score ${avgScore}` },
        ].map((m, i) => (
          <div key={i} style={{ padding: '18px 24px', borderRight: i < 3 ? '1px solid rgba(255,255,255,.1)' : 'none' }}>
            <div style={{ fontSize: 36, fontWeight: 300, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 4 }}>{m.v}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', fontWeight: 300, marginBottom: 2 }}>{m.l}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontWeight: 300 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderBottom: '1px solid ' + BORDER, flexShrink: 0, background: '#fff' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, maxWidth: 300 }}>
          <svg style={{ position: 'absolute', left: 9, pointerEvents: 'none' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, role, skills…"
            style={{ width: '100%', padding: '6px 10px 6px 28px', border: '1px solid ' + BORDER, fontSize: 12, fontFamily: F, color: DARK, outline: 'none' }} />
          {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: 14 }}>×</button>}
        </div>
        <select value={stageFilter} onChange={e => setStageFilter(e.target.value)}
          style={{ padding: '6px 10px', border: '1px solid ' + BORDER, fontSize: 12, fontFamily: F, color: MID, background: '#fff', outline: 'none', cursor: 'pointer', appearance: 'none' }}>
          <option value="">All Stages</option>
          <option>Explorer Screen</option><option>Recruiter Review</option><option>Interview</option>
          <option>Hiring Mgr Review</option><option>Final Round</option><option>Offer Extended</option><option>On Hold</option>
        </select>
        <select value={fitFilter} onChange={e => setFitFilter(e.target.value)}
          style={{ padding: '6px 10px', border: '1px solid ' + BORDER, fontSize: 12, fontFamily: F, color: MID, background: '#fff', outline: 'none', cursor: 'pointer', appearance: 'none' }}>
          <option value="">All Fit Labels</option>
          <option>Deep Match</option><option>Strong Fit</option><option>Good Fit</option><option>Alignment</option><option>Potential Fit</option>
        </select>
        {(search || stageFilter || fitFilter) && (
          <button onClick={() => { setSearch(''); setStageFilter(''); setFitFilter(''); }}
            style={{ fontSize: 11, padding: '6px 12px', border: '1px solid ' + BORDER, background: 'none', cursor: 'pointer', fontFamily: F, color: MID, display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={MID} strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Clear
          </button>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: MUTED, fontWeight: 300 }}>{filtered.length} of {apiCandidates.length} candidates</span>
      </div>

      {/* TABLE */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '16%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '14%' }} />
          </colgroup>
          <thead style={{ position: 'sticky', top: 0, zIndex: 5 }}>
            <tr style={{ background: BLIGHT, borderBottom: '1px solid ' + BORDER }}>
              <th onClick={() => toggleSort('name')} style={thStyle('name')}>Candidate{sa('name')}</th>
              <th style={thStyle()}>Role</th>
              <th onClick={() => toggleSort('stage')} style={thStyle('stage')}>Stage{sa('stage')}</th>
              <th onClick={() => toggleSort('score')} style={thStyle('score')}>AI Match{sa('score')}</th>
              <th style={thStyle()}>Deep Match</th>
              <th onClick={() => toggleSort('sentiment')} style={thStyle('sentiment')}>Sentiment{sa('sentiment')}</th>
              <th style={thStyle()}>Fit · Source</th>
              <th style={thStyle()}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid ' + BLIGHT, cursor: 'default', transition: 'background .1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(37,99,235,.016)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>

                {/* Candidate */}
                <td style={{ padding: '0 12px', height: 54 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <img src={c.avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 400, color: DARK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                      <div style={{ fontSize: 10, color: MUTED, fontWeight: 300 }}>{c.title}</div>
                    </div>
                  </div>
                </td>

                {/* Role/Company */}
                <td style={{ padding: '0 12px', fontSize: 11, color: MUTED, fontWeight: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.company}</td>

                {/* Stage */}
                <td style={{ padding: '0 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                      background: c.stage === 'Offer Extended' ? TEAL : c.stage === 'Final Round' ? BLUE : c.stage === 'Interview' ? PURPLE : c.stage === 'On Hold' ? AMBER : BORDER }} />
                    <span style={{ fontSize: 11, color: MID, fontWeight: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.stage}</span>
                  </div>
                </td>

                {/* AI Match */}
                <td style={{ padding: '0 12px' }}><ScoreDots score={c.score} /></td>

                {/* Deep Match */}
                <td style={{ padding: '0 12px' }}>{c.deepMatch && <DeepMatchBars dm={c.deepMatch} />}</td>

                {/* Sentiment */}
                <td style={{ padding: '0 12px' }}><SentimentBar value={c.sentiment} trend={c.sentimentTrend} /></td>

                {/* Fit · Source */}
                <td style={{ padding: '0 12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <FitDot label={c.fitLabel} />
                    <span style={{ fontSize: 9.5, color: c.source === 'Taltas Network' ? BLUE : MUTED, fontFamily: 'monospace', fontWeight: 300 }}>{c.source}</span>
                  </div>
                </td>

                {/* Actions */}
                <td style={{ padding: '0 12px' }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button onClick={e => { e.stopPropagation(); setCandModal(c.id); }}
                      style={{ fontSize: 10, color: '#fff', background: PURPLE, border: 'none', padding: '4px 10px', cursor: 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM2 12h20"/></svg>
                      Map
                    </button>
                    <button onClick={e => { e.stopPropagation(); router.push('/candidates/' + c.id); }}
                      style={{ fontSize: 10, color: '#fff', background: BLUE, border: 'none', padding: '4px 10px', cursor: 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      Profile
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ padding: '60px 20px', textAlign: 'center', color: MUTED, fontSize: 13, fontWeight: 300 }}>No candidates match your filters</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <CandidateModal open={!!candModal} onClose={() => setCandModal(null)} candidate={selectedCandidate} />
    </div>
  );
}
