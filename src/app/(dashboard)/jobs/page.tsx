'use client';

import { useState, useMemo } from 'react';
import { MOCK_ROLES, MOCK_CANDIDATES } from '@/lib/mock-data';
import { useRoles, useCandidates } from '@/lib/data-provider';
import { DataSourceBadge } from '@/components/shared/api-status';
import { useToast } from '@/components/ui/toast';
import { IconX, IconSearch, IconBot, IconDownload, IconPlus } from '@/components/icons';
import { Modal } from '@/components/ui/modal';
import { NewRoleModal } from '@/components/modals/new-role-modal';

type JobRow = {
  id: string; title: string; department: string; location: string; salary: string;
  urgency: string; atsSource: string; candidateCount: number;
  applied: number; screened: number; interviewing: number; offered: number;
  status: 'Active' | 'Paused' | 'Draft' | 'Closed';
  created: string; explorers: number;
};

function rolesToJobs(roles: typeof MOCK_ROLES): JobRow[] {
  return roles.map((r, i) => ({
    ...r,
    applied: r.candidateCount + [12, 18, 8, 14, 22, 10][i % 6],
    screened: Math.floor(r.candidateCount * 0.7),
    interviewing: Math.floor(r.candidateCount * 0.3),
    offered: Math.floor(r.candidateCount * 0.1),
    status: (i === 3 ? 'Paused' : 'Active') as any,
    created: ['Jan 5, 2026', 'Jan 12, 2026', 'Feb 1, 2026', 'Feb 8, 2026', 'Feb 14, 2026'][i % 5],
    explorers: [2, 1, 3, 1, 2][i % 5],
  }));
}

export default function JobsPage() {
  const toast = useToast();
  const rolesQuery = useRoles();
  const candidatesQuery = useCandidates();
  const apiRoles = rolesQuery.data?.data || MOCK_ROLES;
  const apiCandidatesForJobs = candidatesQuery.data?.data || MOCK_CANDIDATES;
  const fromApi = !!rolesQuery.data?.fromApi;
  const apiJobs = useMemo(() => rolesToJobs(apiRoles), [apiRoles]);
  const apiDepartments = useMemo(() => [...new Set(apiRoles.map(r => r.department))], [apiRoles]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'title' | 'candidates' | 'date'>('date');
  const [selected, setSelected] = useState<JobRow | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [newJobOpen, setNewJobOpen] = useState(false);

  const allJobs = apiJobs; // All roles now come from API

  const filtered = useMemo(() => {
    let jobs = allJobs.filter(j => {
      if (search) { const q = search.toLowerCase(); if (!j.title.toLowerCase().includes(q) && !j.department.toLowerCase().includes(q) && !j.location.toLowerCase().includes(q)) return false; }
      if (statusFilter !== 'all' && j.status.toLowerCase() !== statusFilter) return false;
      if (deptFilter !== 'all' && j.department !== deptFilter) return false;
      if (urgencyFilter !== 'all' && j.urgency !== urgencyFilter) return false;
      return true;
    });
    if (sortBy === 'title') jobs.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortBy === 'candidates') jobs.sort((a, b) => b.candidateCount - a.candidateCount);
    return jobs;
  }, [search, statusFilter, deptFilter, urgencyFilter, sortBy, apiJobs]);

  const openDetail = (job: JobRow) => { setSelected(job); setEditMode(false); setEditForm({ title: job.title, department: job.department, location: job.location, salary: job.salary, urgency: job.urgency }); };
  const saveEdit = () => { toast.show('Job "' + editForm.title + '" updated'); setEditMode(false); };
  const statusColor = (s: string) => s === 'Active' ? 'var(--green)' : s === 'Paused' ? 'var(--orange)' : s === 'Closed' ? 'var(--red)' : 'var(--muted)';
  const urgCls = (u: string) => u === 'HOT' ? 'urg-hot' : u === 'WARM' ? 'urg-warm' : 'urg-normal';

  const totalActive = allJobs.filter(j => j.status === 'Active').length;
  const totalCands = allJobs.reduce((a, j) => a + j.candidateCount, 0);
  const totalInterviews = allJobs.reduce((a, j) => a + j.interviewing, 0);
  const totalOffers = allJobs.reduce((a, j) => a + j.offered, 0);

  return (
    <div className="flex flex-col gap-[13px]">
      {/* Issue 6: Horizontal KPI Row — same grid as Explorers */}
      <div className="grid gap-[10px]" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="kpi"><div className="kpi-label">Open Jobs</div><div className="kpi-num" style={{ color: 'var(--blue)' }}>{totalActive}</div><div className="kpi-delta up">+2 this week</div></div>
        <div className="kpi" style={{ animationDelay: '.05s' }}><div className="kpi-label">Total Candidates</div><div className="kpi-num">{totalCands}</div><div className="kpi-delta up">+18 this week</div></div>
        <div className="kpi" style={{ animationDelay: '.1s' }}><div className="kpi-label">In Interview</div><div className="kpi-num" style={{ color: 'var(--purple, #7c3aed)' }}>{totalInterviews}</div><div className="kpi-delta up">+5 this week</div></div>
        <div className="kpi" style={{ animationDelay: '.15s' }}><div className="kpi-label">Offers Extended</div><div className="kpi-num" style={{ color: 'var(--green)' }}>{totalOffers}</div><div className="kpi-delta up">Avg 18d to fill</div></div>
      </div>

      {/* Issue 7: Full search/filter bar like Integrations */}
      <div className="card">
        <div className="flex items-center justify-between mb-[12px] flex-wrap gap-[6px]">
          <span className="mono-label flex items-center gap-[6px]">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 7h8M8 12h8M8 17h4"/></svg>
            Job Listings & Pipeline<DataSourceBadge fromApi={fromApi} />
          </span>
          <div className="flex gap-[6px] items-center">
            <span className="fit-badge fit-good">{totalActive} Active</span>
            <span className="fit-badge" style={{ color: 'var(--orange)', background: 'var(--orange-bg)', borderColor: 'var(--orange-border)' }}>{allJobs.filter(j => j.urgency === 'HOT').length} Hot</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-[6px] items-center">
          <div className="relative flex-1" style={{ minWidth: 180, maxWidth: 320 }}>
            <IconSearch size={12} className="absolute left-[10px] top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
            <input className="form-input" style={{ paddingLeft: 32, fontSize: 11 }} placeholder="Search title, department, location…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option value="all">All Departments</option>
            {apiDepartments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option><option value="paused">Paused</option><option value="draft">Draft</option><option value="closed">Closed</option>
          </select>
          <select className="filter-select" value={urgencyFilter} onChange={e => setUrgencyFilter(e.target.value)}>
            <option value="all">All Urgency</option>
            <option value="HOT">Hot</option><option value="WARM">Warm</option><option value="NORMAL">Normal</option>
          </select>
          <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
            <option value="date">Sort: Date</option><option value="title">Sort: Title</option><option value="candidates">Sort: Candidates</option>
          </select>
          {(search || statusFilter !== 'all' || deptFilter !== 'all' || urgencyFilter !== 'all') && (
            <button className="ctrl-btn flex items-center gap-[3px]" onClick={() => { setSearch(''); setStatusFilter('all'); setDeptFilter('all'); setUrgencyFilter('all'); }}><IconX size={9} /> Clear</button>
          )}
          <div style={{ marginLeft: 'auto' }} className="flex gap-[6px]">
            <button className="ctrl-btn blue flex items-center gap-[3px]" onClick={() => {
              const csv = ['Title,Department,Location,Status,Urgency,Candidates,Screened,Interviews,Offers', ...filtered.map(j => `"${j.title}",${j.department},${j.location},${j.status},${j.urgency},${j.applied},${j.screened},${j.interviewing},${j.offered}`)].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = 'taltas-jobs.csv'; a.click(); URL.revokeObjectURL(url);
              toast.show('Jobs exported as CSV');
            }}><IconDownload size={10} /> Export</button>
            <button className="ctrl-btn run flex items-center gap-[3px]" onClick={() => setNewJobOpen(true)}><IconPlus size={10} /> New Job</button>
          </div>
        </div>
        <div className="font-mono text-[9px] mt-[8px]" style={{ color: 'var(--muted)' }}>{filtered.length} of {allJobs.length} jobs</div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="cand-table" style={{ minWidth: 0 }}>
            <thead><tr>
              <th>Job Title</th><th>Department</th><th>Location</th><th>Status</th><th>Urgency</th>
              <th>Candidates</th><th>Screened</th><th>Interviews</th><th>Offers</th><th>Explorers</th><th>Posted</th>
            </tr></thead>
            <tbody>
              {filtered.map(j => (
                <tr key={j.id} onClick={() => openDetail(j)} className="cursor-pointer" style={{ transition: 'background .15s' }}>
                  <td><div className="text-[12px] font-semibold" style={{ color: 'var(--text-bright)' }}>{j.title}</div><div className="font-mono text-[9px]" style={{ color: 'var(--muted)' }}>{j.salary}</div></td>
                  <td className="text-[11px]" style={{ color: 'var(--text-mid)' }}>{j.department}</td>
                  <td className="text-[11px]" style={{ color: 'var(--text-mid)' }}>{j.location}</td>
                  <td><span className="font-mono text-[8.5px] px-[7px] py-[2px] rounded" style={{ color: statusColor(j.status), background: `color-mix(in srgb, ${statusColor(j.status)} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${statusColor(j.status)} 25%, transparent)` }}>{j.status}</span></td>
                  <td><span className={'urg-badge ' + urgCls(j.urgency)}>{j.urgency}</span></td>
                  <td className="font-mono text-[11px] font-semibold" style={{ color: 'var(--text-bright)' }}>{j.applied}</td>
                  <td className="font-mono text-[11px]" style={{ color: 'var(--blue)' }}>{j.screened}</td>
                  <td className="font-mono text-[11px]" style={{ color: 'var(--purple, #7c3aed)' }}>{j.interviewing}</td>
                  <td className="font-mono text-[11px]" style={{ color: 'var(--green)' }}>{j.offered}</td>
                  <td className="text-center"><span className="font-mono text-[10px]" style={{ color: 'var(--text-dim)' }}>{j.explorers}</span></td>
                  <td className="font-mono text-[9px]" style={{ color: 'var(--muted)' }}>{j.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} maxWidth="min(800px, 95vw)">
        {selected && (<>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              {!editMode ? (<div className="text-[19px] font-bold" style={{ fontFamily: "'Roboto Slab', serif", color: 'var(--text-bright)' }}>{selected.title}</div>) : (<input className="form-input" style={{ fontSize: 17, fontWeight: 700, fontFamily: "'Roboto Slab', serif" }} value={editForm.title} onChange={e => setEditForm((f: any) => ({ ...f, title: e.target.value }))} />)}
              <div className="text-[12px] mt-[2px]" style={{ color: 'var(--muted)' }}>{selected.department} · {selected.location}</div>
            </div>
            <div className="flex gap-[6px] items-center">
              <span className="font-mono text-[8.5px] px-[7px] py-[2px] rounded" style={{ color: statusColor(selected.status), background: `color-mix(in srgb, ${statusColor(selected.status)} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${statusColor(selected.status)} 25%, transparent)` }}>{selected.status}</span>
              <span className={'urg-badge ' + urgCls(selected.urgency)}>{selected.urgency}</span>
              <button onClick={() => setSelected(null)} className="ctrl-btn" style={{ padding: '4px 8px' }}><IconX size={10} /></button>
            </div>
          </div>
          <div className="grid gap-[10px] mb-[16px]" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
            {[{ l: 'Applied', v: selected.applied, c: 'var(--text-bright)' },{ l: 'Screened', v: selected.screened, c: 'var(--blue)' },{ l: 'Interviewing', v: selected.interviewing, c: 'var(--purple, #7c3aed)' },{ l: 'Offers', v: selected.offered, c: 'var(--green)' },{ l: 'Explorers', v: selected.explorers, c: 'var(--orange)' }].map(s => (
              <div key={s.l} className="text-center p-[10px] rounded-[8px]" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}><div className="text-[20px] font-bold" style={{ fontFamily: "'Roboto Slab', serif", color: s.c }}>{s.v}</div><div className="font-mono text-[8px]" style={{ color: 'var(--muted)' }}>{s.l}</div></div>
            ))}
          </div>
          <div className="mb-[16px]"><div className="font-mono text-[8.5px] uppercase tracking-[.1em] mb-[6px]" style={{ color: 'var(--muted)' }}>Pipeline Funnel</div><div className="flex rounded-[6px] overflow-hidden" style={{ height: 18, background: 'var(--border)' }}>{selected.applied > 0 && <div style={{ flex: selected.applied, background: 'var(--blue-bg)', borderRight: '1px solid var(--border)' }} />}{selected.screened > 0 && <div style={{ flex: selected.screened, background: 'var(--blue)', opacity: 0.4 }} />}{selected.interviewing > 0 && <div style={{ flex: selected.interviewing, background: 'var(--purple, #7c3aed)', opacity: 0.6 }} />}{selected.offered > 0 && <div style={{ flex: selected.offered, background: 'var(--green)' }} />}</div><div className="flex justify-between mt-[4px]"><span className="font-mono text-[8px]" style={{ color: 'var(--muted)' }}>Applied ({selected.applied})</span><span className="font-mono text-[8px]" style={{ color: 'var(--muted)' }}>Offered ({selected.offered})</span></div></div>
          {editMode ? (<div className="p-[14px] rounded-[9px] mb-[14px]" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}><div className="font-mono text-[8.5px] uppercase tracking-[.1em] mb-[10px]" style={{ color: 'var(--muted)' }}>Edit Job Details</div><div className="grid grid-cols-2 gap-[10px]"><div><label className="form-label">Department</label><input className="form-input" value={editForm.department} onChange={e => setEditForm((f: any) => ({ ...f, department: e.target.value }))} /></div><div><label className="form-label">Location</label><input className="form-input" value={editForm.location} onChange={e => setEditForm((f: any) => ({ ...f, location: e.target.value }))} /></div><div><label className="form-label">Salary Range</label><input className="form-input" value={editForm.salary} onChange={e => setEditForm((f: any) => ({ ...f, salary: e.target.value }))} /></div><div><label className="form-label">Urgency</label><select className="form-select" value={editForm.urgency} onChange={e => setEditForm((f: any) => ({ ...f, urgency: e.target.value }))}><option>HOT</option><option>WARM</option><option>NORMAL</option></select></div></div><div className="flex gap-[8px] mt-[12px]"><button className="ctrl-btn run" onClick={saveEdit}>Save Changes</button><button className="ctrl-btn" onClick={() => setEditMode(false)}>Cancel</button></div></div>) : (<div className="mb-[14px]"><div className="grid grid-cols-2 gap-[8px]"><div className="p-[10px] rounded-[7px]" style={{ background: 'var(--surface2)' }}><div className="font-mono text-[8px]" style={{ color: 'var(--muted)' }}>SALARY</div><div className="text-[12px] font-medium" style={{ color: 'var(--text-bright)' }}>{selected.salary}</div></div><div className="p-[10px] rounded-[7px]" style={{ background: 'var(--surface2)' }}><div className="font-mono text-[8px]" style={{ color: 'var(--muted)' }}>ATS SOURCE</div><div className="text-[12px] font-medium" style={{ color: 'var(--text-bright)' }}>{selected.atsSource}</div></div><div className="p-[10px] rounded-[7px]" style={{ background: 'var(--surface2)' }}><div className="font-mono text-[8px]" style={{ color: 'var(--muted)' }}>POSTED</div><div className="text-[12px] font-medium" style={{ color: 'var(--text-bright)' }}>{selected.created}</div></div><div className="p-[10px] rounded-[7px]" style={{ background: 'var(--surface2)' }}><div className="font-mono text-[8px]" style={{ color: 'var(--muted)' }}>EXPLORERS</div><div className="text-[12px] font-medium" style={{ color: 'var(--text-bright)' }}>{selected.explorers} active</div></div></div></div>)}
          <div className="font-mono text-[8.5px] uppercase tracking-[.1em] mb-[8px]" style={{ color: 'var(--muted)' }}>Top Candidates</div>
          <div className="overflow-x-auto" style={{ maxHeight: 200, overflowY: 'auto' }}><table className="cand-table" style={{ minWidth: 0 }}><thead><tr><th>Candidate</th><th>Score</th><th>Stage</th><th>Fit</th></tr></thead><tbody>{apiCandidatesForJobs.slice(0, 6).map(c => (<tr key={c.id}><td><div className="flex items-center gap-[6px]"><img src={c.avatar} style={{ width: 24, height: 24, borderRadius: '50%' }} /><span className="text-[11px] font-medium" style={{ color: 'var(--text-bright)' }}>{c.name}</span></div></td><td className="font-mono text-[11px] font-bold" style={{ color: 'var(--blue)' }}>{c.score}</td><td><span className="font-mono text-[8.5px] px-[6px] py-[1px] rounded" style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-dim)' }}>{c.stage}</span></td><td><span className={'fit-badge ' + (c.fitLabel === 'Deep Match' ? 'fit-deep' : c.fitLabel === 'Strong Fit' ? 'fit-strong' : 'fit-good')}>{c.fitLabel}</span></td></tr>))}</tbody></table></div>
          <div className="flex gap-[8px] mt-[14px] pt-[12px]" style={{ borderTop: '1px solid var(--border)' }}><button className="ctrl-btn blue" onClick={() => setEditMode(true)}>Edit Job</button><button className="ctrl-btn run" onClick={() => toast.show('Explorer deployed for ' + selected.title)}><IconBot size={10} className="inline mr-[3px]" /> Deploy Explorer</button><button className="ctrl-btn" onClick={() => toast.show('Job paused')}>Pause</button><button className="ctrl-btn" style={{ marginLeft: 'auto' }} onClick={() => setSelected(null)}>Close</button></div>
        </>)}
      </Modal>
      <NewRoleModal open={newJobOpen} onClose={() => setNewJobOpen(false)} />
    </div>
  );
}
