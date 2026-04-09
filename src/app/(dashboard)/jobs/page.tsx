// @ts-nocheck
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRoles } from '@/lib/data-provider';

const F      = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const BLUE   = '#2563eb';
const TEAL   = '#1D9E75';
const DARK   = '#0A0A0A';
const MID    = '#6B6B6B';
const MUTED  = '#AAAAAA';
const BORDER = '#E8E8E5';
const BLIGHT = '#F4F4F2';

const MOCK_LIVE = [
  { title:'Senior Backend Engineer',    comp:'$200K-$250K', dept:'Data Platform',     loc:'SF / Remote',   status:'Active', urg:'HOT',    cands:12, screen:0,  iv:0, offers:0, expl:2, posted:'Jan 5'  },
  { title:'Platform AI Lead',           comp:'$180K-$220K', dept:'AI Infrastructure', loc:'NYC / Remote',  status:'Active', urg:'WARM',   cands:18, screen:0,  iv:0, offers:0, expl:1, posted:'Jan 12' },
  { title:'Staff Infrastructure Eng.',  comp:'$215K-$270K', dept:'Infrastructure',    loc:'SF / Seattle',  status:'Active', urg:'HOT',    cands:8,  screen:0,  iv:0, offers:0, expl:3, posted:'Feb 1'  },
  { title:'Founding Engineer',          comp:'$170K-$210K', dept:'Engineering',       loc:'Remote',        status:'Paused', urg:'HOT',    cands:14, screen:0,  iv:0, offers:0, expl:1, posted:'Feb 8'  },
  { title:'Senior Frontend Engineer',   comp:'$190K-$240K', dept:'DX Engineering',    loc:'Remote',        status:'Active', urg:'WARM',   cands:22, screen:0,  iv:0, offers:0, expl:2, posted:'Feb 14' },
  { title:'ML Platform Lead',           comp:'$250K-$320K', dept:'ML Infrastructure', loc:'SF',            status:'Active', urg:'HOT',    cands:10, screen:0,  iv:0, offers:0, expl:2, posted:'Jan 5'  },
  { title:'Staff Security Engineer',    comp:'$220K-$270K', dept:'Security',          loc:'SF / Remote',   status:'Active', urg:'HOT',    cands:12, screen:0,  iv:0, offers:0, expl:1, posted:'Jan 12' },
  { title:'Senior Design Systems Eng.', comp:'$180K-$220K', dept:'Engineering',       loc:'Remote',        status:'Active', urg:'HOT',    cands:18, screen:0,  iv:0, offers:0, expl:3, posted:'Feb 1'  },
  { title:'DevRel Engineer',            comp:'$140K-$190K', dept:'Marketing',         loc:'Remote',        status:'Active', urg:'NORMAL', cands:41, screen:13, iv:5, offers:1, expl:2, posted:'Jan 5'  },
  { title:'Senior Product Designer',    comp:'$150K-$200K', dept:'Design',            loc:'Remote',        status:'Active', urg:'WARM',   cands:31, screen:14, iv:6, offers:2, expl:1, posted:'Jan 12' },
  { title:'Engineering Manager',        comp:'$220K-$300K', dept:'Engineering',       loc:'NYC',           status:'Active', urg:'NORMAL', cands:26, screen:9,  iv:4, offers:1, expl:3, posted:'Feb 1'  },
  { title:'Product Manager - AI Plat.', comp:'$180K-$250K', dept:'Product',           loc:'SF / Remote',   status:'Active', urg:'WARM',   cands:38, screen:14, iv:6, offers:2, expl:1, posted:'Feb 8'  },
  { title:'Staff Backend Engineer',     comp:'$200K-$280K', dept:'Engineering',       loc:'Remote',        status:'Active', urg:'HOT',    cands:31, screen:16, iv:6, offers:2, expl:2, posted:'Feb 14' },
  { title:'Senior Frontend Engineer II',comp:'$160K-$220K', dept:'Engineering',       loc:'Remote / NYC',  status:'Active', urg:'HOT',    cands:32, screen:12, iv:5, offers:2, expl:2, posted:'Jan 5'  },
];

const MOCK_BANK = [
  { title:'Senior Data Engineer',      comp:'$180K-$220K', dept:'Data',        loc:'Remote',       ats:'Greenhouse', synced:'Apr 5', status:'Available' },
  { title:'Head of Design',            comp:'$160K-$200K', dept:'Design',      loc:'SF',           ats:'Greenhouse', synced:'Apr 5', status:'Available' },
  { title:'Staff Product Manager',     comp:'$200K-$250K', dept:'Product',     loc:'NYC / Remote', ats:'Lever',      synced:'Apr 4', status:'Available' },
  { title:'Principal Engineer',        comp:'$240K-$300K', dept:'Engineering', loc:'Remote',       ats:'Lever',      synced:'Apr 4', status:'Available' },
  { title:'VP of Engineering',         comp:'$280K-$360K', dept:'Engineering', loc:'SF',           ats:'BambooHR',   synced:'Apr 3', status:'Available' },
  { title:'Senior ML Engineer',        comp:'$210K-$270K', dept:'ML',          loc:'Remote',       ats:'Greenhouse', synced:'Apr 3', status:'Available' },
  { title:'Growth Marketing Manager',  comp:'$130K-$160K', dept:'Marketing',   loc:'Remote',       ats:'Lever',      synced:'Apr 2', status:'Available' },
  { title:'Senior Recruiter',          comp:'$120K-$150K', dept:'People',      loc:'SF / Remote',  ats:'BambooHR',   synced:'Apr 2', status:'Imported'  },
  { title:'Technical Program Manager', comp:'$170K-$210K', dept:'Engineering', loc:'Remote',       ats:'Greenhouse', synced:'Apr 1', status:'Imported'  },
  { title:'Product Design Lead',       comp:'$160K-$210K', dept:'Design',      loc:'NYC',          ats:'Lever',      synced:'Mar 31',status:'Available' },
];

const urgColor = (u: string) => u === 'HOT' ? '#CC3300' : u === 'WARM' ? '#D97706' : MUTED;
const atsColor = (a: string) => a === 'Greenhouse' ? '#24A86E' : a === 'Lever' ? BLUE : a === 'BambooHR' ? '#75C045' : MID;

function SearchIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
    </svg>
  );
}

export default function JobsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'all' | 'live' | 'bank'>('all');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [urgFilter, setUrgFilter] = useState('');

  const rolesQuery = useRoles();
  const apiLive = rolesQuery.data?.data?.length ? rolesQuery.data.data.map((r: any) => ({
    title: r.roleName || r.title || r.name,
    comp: r.salaryRange || r.comp || 'Competitive',
    dept: r.department || r.dept || '',
    loc: r.location || r.loc || 'Remote',
    status: r.status || 'Active',
    urg: 'NORMAL', cands: r.candidateCount ?? 0, screen: 0, iv: 0, offers: 0, expl: 0, posted: '',
  })) : MOCK_LIVE;

  const allDepts = [...new Set([...apiLive.map((j: any) => j.dept), ...MOCK_BANK.map(j => j.dept)].filter(Boolean))].sort();

  const filterLive = apiLive.filter((j: any) => {
    const ms = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.dept?.toLowerCase().includes(search.toLowerCase());
    const md = !deptFilter || j.dept === deptFilter;
    const mu = !urgFilter || j.urg === urgFilter;
    return ms && md && mu;
  });

  const filterBank = MOCK_BANK.filter(j => {
    const ms = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.dept.toLowerCase().includes(search.toLowerCase());
    const md = !deptFilter || j.dept === deptFilter;
    return ms && md;
  });

  const showLive = tab === 'all' || tab === 'live';
  const showBank = tab === 'all' || tab === 'bank';

  const totalActive = apiLive.filter((j: any) => j.status === 'Active').length;
  const totalCands  = apiLive.reduce((a: number, j: any) => a + (j.cands || 0), 0);
  const totalOffers = apiLive.reduce((a: number, j: any) => a + (j.offers || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, fontFamily: F, overflow: 'hidden' }}>

      {/* PAGE HEADER */}
      <div style={{ height: 68, paddingLeft: 24, paddingRight: 24, borderBottom: '1px solid ' + BORDER, background: '#fff', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>  
        <div>
          <div style={{ fontSize: 15, fontWeight: 400, letterSpacing: '-0.01em', color: DARK }}>Jobs</div>
          <div style={{ fontSize: 11, color: MUTED, fontWeight: 300, marginTop: 1 }}>Live Roles and Job Bank</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
            <span style={{ fontSize: 11, color: MUTED, fontWeight: 300 }}>Synced</span>
          </div>
          <button style={{ fontSize: 11, color: '#fff', background: BLUE, border: 'none', padding: '5px 14px', cursor: 'pointer', fontFamily: F }}>+ New Job</button>
        </div>
      </div>

      {/* METRICS STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', background: BLUE, flexShrink: 0 }}>
        {[
          { v: totalActive.toString(),        l: 'Active Roles',   sub: `${apiLive.length} total` },
          { v: MOCK_BANK.length.toString(),    l: 'In Job Bank',    sub: '3 imported' },
          { v: totalCands.toString(),          l: 'Total Candidates',sub: 'across all roles' },
          { v: apiLive.filter((j:any)=>j.urg==='HOT').length.toString(), l: 'Hot Roles', sub: 'urgent priority' },
          { v: totalOffers.toString(),         l: 'Offers Extended', sub: 'this period' },
          { v: '18d',                          l: 'Avg. Time to Hire',sub: '26d faster than avg' },
        ].map((m, i) => (
          <div key={i} style={{ padding: '18px 22px', borderRight: i < 5 ? '1px solid rgba(255,255,255,.1)' : 'none', cursor: 'default' }}>
            <div style={{ fontSize: 26, fontWeight: 300, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 4 }}>{m.v}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', fontWeight: 300, marginBottom: 2 }}>{m.l}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontWeight: 300 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* TAB + TOOLBAR */}
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid ' + BORDER, flexShrink: 0, background: '#fff', padding: '0 20px', gap: 0 }}>
        {[
          { id: 'all',  label: 'All Jobs',  count: filterLive.length + filterBank.length },
          { id: 'live', label: 'Live Roles', count: filterLive.length },
          { id: 'bank', label: 'Job Bank',  count: filterBank.length },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            style={{ background: 'none', border: 'none', borderBottom: tab === t.id ? `2px solid ${BLUE}` : '2px solid transparent', padding: '0 18px', height: 44, fontSize: 13, color: tab === t.id ? DARK : MUTED, fontFamily: F, fontWeight: tab === t.id ? 400 : 300, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, marginBottom: -1 }}>
            {t.label}
            <span style={{ fontSize: 10, color: tab === t.id ? BLUE : MUTED, fontWeight: 300 }}>{t.count}</span>
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center', paddingRight: 4 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><SearchIcon /></div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs..."
              style={{ padding: '5px 10px 5px 28px', border: '1px solid ' + BORDER, fontSize: 12, fontFamily: F, color: DARK, outline: 'none', width: 200 }} />
          </div>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
            style={{ padding: '5px 10px', border: '1px solid ' + BORDER, fontSize: 12, fontFamily: F, color: MID, background: '#fff', outline: 'none' }}>
            <option value="">All Depts</option>
            {allDepts.map(d => <option key={d}>{d}</option>)}
          </select>
          {(tab === 'all' || tab === 'live') && (
            <select value={urgFilter} onChange={e => setUrgFilter(e.target.value)}
              style={{ padding: '5px 10px', border: '1px solid ' + BORDER, fontSize: 12, fontFamily: F, color: MID, background: '#fff', outline: 'none' }}>
              <option value="">All Priority</option>
              <option value="HOT">HOT</option>
              <option value="WARM">WARM</option>
              <option value="NORMAL">NORMAL</option>
            </select>
          )}
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* LIVE ROLES */}
        {showLive && filterLive.length > 0 && (
          <div>
            {tab === 'all' && (
              <div style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8, background: '#F0F4FF', borderBottom: '1px solid ' + BORDER }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: BLUE }} />
                <span style={{ fontSize: 9, color: MUTED, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 400, fontFamily: F }}>Live Roles</span>
                <span style={{ fontSize: 10, color: BLUE, fontWeight: 300 }}>{filterLive.length} active</span>
              </div>
            )}
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '22%' }} /><col style={{ width: '11%' }} /><col style={{ width: '10%' }} />
                <col style={{ width: '8%' }} /><col style={{ width: '7%' }} /><col style={{ width: '8%' }} />
                <col style={{ width: '6%' }} /><col style={{ width: '6%' }} /><col style={{ width: '6%' }} />
                <col style={{ width: '8%' }} /><col style={{ width: '8%' }} />
              </colgroup>
              <thead style={{ position: 'sticky', top: 0, zIndex: 5 }}>
                <tr style={{ background: BLIGHT, borderBottom: '1px solid ' + BORDER }}>
                  {['Job Title','Compensation','Department','Location','Status','Priority','Cands','Screen','Offers','Explorer','Posted'].map(h => (
                    <th key={h} style={{ fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 400, padding: '0 12px', height: 34, textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filterLive.map((j: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid ' + BLIGHT, cursor: 'pointer', transition: 'background .1s', height: 54 }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(37,99,235,.018)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '0 12px' }}>
                      <div style={{ fontSize: 12.5, fontWeight: 400, color: DARK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{j.title}</div>
                      <div style={{ fontSize: 10, color: MUTED, fontWeight: 300 }}>{j.loc}</div>
                    </td>
                    <td style={{ padding: '0 12px', fontSize: 11, color: MID, fontWeight: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{j.comp}</td>
                    <td style={{ padding: '0 12px', fontSize: 11, color: MID, fontWeight: 300 }}>{j.dept}</td>
                    <td style={{ padding: '0 12px', fontSize: 11, color: MID, fontWeight: 300 }}>{j.loc?.split('/')[0]?.trim()}</td>
                    <td style={{ padding: '0 12px' }}><span style={{ fontSize: 10, color: j.status === 'Active' ? TEAL : MID, fontWeight: j.status === 'Active' ? 400 : 300 }}>{j.status}</span></td>
                    <td style={{ padding: '0 12px' }}><span style={{ fontSize: 10, color: urgColor(j.urg), fontWeight: j.urg !== 'NORMAL' ? 500 : 300 }}>{j.urg}</span></td>
                    <td style={{ padding: '0 12px', fontSize: 13, fontWeight: 300, color: j.cands > 0 ? DARK : MUTED }}>{j.cands || '-'}</td>
                    <td style={{ padding: '0 12px', fontSize: 13, fontWeight: 300, color: j.screen > 0 ? BLUE : MUTED }}>{j.screen || '-'}</td>
                    <td style={{ padding: '0 12px', fontSize: 13, fontWeight: 300, color: j.offers > 0 ? TEAL : MUTED }}>{j.offers || '-'}</td>
                    <td style={{ padding: '0 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: j.expl > 0 ? TEAL : BORDER }} />
                        <span style={{ fontSize: 11, color: j.expl > 0 ? MID : MUTED, fontWeight: 300 }}>{j.expl || 0}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0 12px', fontSize: 11, color: MUTED, fontWeight: 300 }}>{j.posted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* JOB BANK */}
        {showBank && filterBank.length > 0 && (
          <div>
            {tab === 'all' && (
              <div style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8, background: '#F0FFF8', borderBottom: '1px solid ' + BORDER, borderTop: '1px solid ' + BORDER }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: TEAL }} />
                <span style={{ fontSize: 9, color: MUTED, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 400, fontFamily: F }}>Job Bank</span>
                <span style={{ fontSize: 10, color: TEAL, fontWeight: 300 }}>{filterBank.length} available</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: MUTED, fontWeight: 300 }}>Import from ATS to activate</span>
              </div>
            )}
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '28%' }} /><col style={{ width: '13%' }} /><col style={{ width: '13%' }} />
                <col style={{ width: '10%' }} /><col style={{ width: '13%' }} /><col style={{ width: '11%' }} />
                <col style={{ width: '12%' }} />
              </colgroup>
              <thead style={{ position: 'sticky', top: 0, zIndex: 5 }}>
                <tr style={{ background: BLIGHT, borderBottom: '1px solid ' + BORDER }}>
                  {['Job Title','Compensation','Department','Location','ATS Source','Last Synced','Status'].map(h => (
                    <th key={h} style={{ fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 400, padding: '0 12px', height: 34, textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filterBank.map((j, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid ' + BLIGHT, cursor: 'pointer', transition: 'background .1s', height: 52 }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(29,158,117,.012)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '0 12px' }}>
                      <div style={{ fontSize: 12.5, fontWeight: 400, color: DARK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{j.title}</div>
                      <div style={{ fontSize: 10, color: MUTED, fontWeight: 300 }}>{j.loc}</div>
                    </td>
                    <td style={{ padding: '0 12px', fontSize: 11, color: MID, fontWeight: 300 }}>{j.comp}</td>
                    <td style={{ padding: '0 12px', fontSize: 11, color: MID, fontWeight: 300 }}>{j.dept}</td>
                    <td style={{ padding: '0 12px', fontSize: 11, color: MID, fontWeight: 300 }}>{j.loc?.split('/')[0]?.trim()}</td>
                    <td style={{ padding: '0 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: atsColor(j.ats) }} />
                        <span style={{ fontSize: 11, color: MID, fontWeight: 300 }}>{j.ats}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0 12px', fontSize: 11, color: MUTED, fontWeight: 300 }}>{j.synced}</td>
                    <td style={{ padding: '0 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, color: j.status === 'Available' ? TEAL : BLUE, fontWeight: 400 }}>{j.status}</span>
                        <button style={{ fontSize: 10, color: '#fff', background: BLUE, border: 'none', padding: '3px 10px', cursor: 'pointer', fontFamily: F }}>Activate</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* EMPTY STATE */}
        {filterLive.length === 0 && filterBank.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: MUTED, fontSize: 13, fontWeight: 300 }}>
            No jobs match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
