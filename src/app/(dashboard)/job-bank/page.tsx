// @ts-nocheck
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/components/ui/toast';
import { IconSearch, IconDownload, IconPlus, IconX } from '@/components/icons';
import { Modal } from '@/components/ui/modal';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.taltas.ai/api/v1';

type CachedJob = {
  id: string; atsJobId: string; provider: string;
  integrationId: string; integrationName: string;
  title: string; department?: string; location?: string;
  description?: string; salaryMin?: number; salaryMax?: number;
  atsStatus: string; atsCreatedAt?: string;
  imported: boolean; importedRole?: { id: string; status: string; title: string } | null;
  cachedAt: string;
};

type Stats = { total: number; imported: number; available: number; byProvider: { provider: string; count: number }[] };

const PROVIDER_LABELS: Record<string, string> = {
  greenhouse: 'Greenhouse', lever: 'Lever', workday: 'Workday',
};

const PROVIDER_COLORS: Record<string, string> = {
  greenhouse: '#27ae60', lever: '#2563eb', workday: '#d97706',
};

function ProviderBadge({ provider }: { provider: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px',
      fontSize: 10, fontWeight: 500, letterSpacing: '0.06em',
      textTransform: 'uppercase', background: PROVIDER_COLORS[provider] + '18',
      color: PROVIDER_COLORS[provider] || '#6b7280', border: '1px solid ' + (PROVIDER_COLORS[provider] || '#6b7280') + '30',
    }}>
      {PROVIDER_LABELS[provider] || provider}
    </span>
  );
}

function StatusBadge({ imported, role }: { imported: boolean; role?: any }) {
  if (!imported) return <span style={{ fontSize: 10, padding: '2px 8px', background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb', fontWeight: 500 }}>Available</span>;
  const color = role?.status === 'open' ? '#16a34a' : '#2563eb';
  const label = role?.status === 'open' ? 'Live' : role?.status === 'draft' ? 'Draft' : role?.status || 'Imported';
  return <span style={{ fontSize: 10, padding: '2px 8px', background: color + '15', color, border: '1px solid ' + color + '30', fontWeight: 500 }}>{label}</span>;
}

export default function JobBankPage() {
  const { token } = useAuthStore();
  const toast = useToast();

  const [jobs, setJobs] = useState<CachedJob[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [importedFilter, setImportedFilter] = useState('');

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState<string | null>(null);
  const [bulkImporting, setBulkImporting] = useState(false);

  const [detailJob, setDetailJob] = useState<CachedJob | null>(null);
  const [importOpts, setImportOpts] = useState<{ urgency: string; goLive: boolean }>({ urgency: 'medium', goLive: false });

  const headers = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token };

  const fetchStats = useCallback(async () => {
    try {
      const r = await fetch(API + '/integrations/job-bank/stats', { headers });
      if (r.ok) setStats(await r.json());
    } catch {}
  }, [token]);

  const fetchJobs = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '50' });
      if (search)         params.set('search', search);
      if (providerFilter) params.set('provider', providerFilter);
      if (importedFilter) params.set('imported', importedFilter);
      const r = await fetch(API + '/integrations/job-bank?' + params, { headers });
      if (r.ok) {
        const d = await r.json();
        setJobs(d.jobs); setTotal(d.total); setPage(d.page); setPages(d.pages);
      }
    } catch { toast.error('Failed to load Job Bank'); }
    finally { setLoading(false); }
  }, [search, providerFilter, importedFilter, token]);

  useEffect(() => { fetchJobs(1); fetchStats(); }, [search, providerFilter, importedFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh all connected ATS integrations
      const r = await fetch(API + '/admin/ats/sync-all', { method: 'POST', headers });
      if (r.ok) { toast.success('Job Bank refreshed'); fetchJobs(1); fetchStats(); }
      else toast.error('Refresh failed');
    } catch { toast.error('Refresh failed'); }
    finally { setRefreshing(false); }
  };

  const handleImport = async (job: CachedJob, opts = importOpts) => {
    setImporting(job.id);
    try {
      const r = await fetch(API + '/integrations/job-bank/' + job.id + '/import', {
        method: 'POST', headers, body: JSON.stringify(opts),
      });
      if (r.ok) {
        const d = await r.json();
        toast.success(job.title + ' imported as ' + (opts.goLive ? 'Live Job' : 'Draft'));
        fetchJobs(page); fetchStats();
        setDetailJob(null);
      } else { const e = await r.json(); toast.error(e.message || 'Import failed'); }
    } catch { toast.error('Import failed'); }
    finally { setImporting(null); }
  };

  const handleBulkImport = async () => {
    if (selected.size === 0) return;
    setBulkImporting(true);
    try {
      const r = await fetch(API + '/integrations/job-bank/bulk-import', {
        method: 'POST', headers,
        body: JSON.stringify({ ids: Array.from(selected), urgency: 'medium', goLive: false }),
      });
      if (r.ok) {
        const d = await r.json();
        toast.success(d.imported + ' job(s) imported as Draft');
        setSelected(new Set()); fetchJobs(page); fetchStats();
      } else toast.error('Bulk import failed');
    } catch { toast.error('Bulk import failed'); }
    finally { setBulkImporting(false); }
  };

  const toggleSelect = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const selectAll = () => {
    const unimported = jobs.filter(j => !j.imported).map(j => j.id);
    setSelected(new Set(unimported));
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    const fmt = (n: number) => n >= 1000 ? '$' + Math.round(n / 1000) + 'K' : '$' + n;
    if (min && max) return fmt(min) + '  ' + fmt(max);
    if (min) return fmt(min) + '+';
    return 'Up to ' + fmt(max!);
  };
  return (
    <div style={{ paddingTop: 8 }}>

      {/*  Header  */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 300, color: 'var(--dark)', letterSpacing: '-0.02em', letterSpacing: '-0.4px', marginBottom: 4 }}>Job Bank</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>ATS-sourced jobs available to import into Taltas</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {selected.size > 0 && (
            <button onClick={handleBulkImport} disabled={bulkImporting}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'var(--blue)', color: '#fff', fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', opacity: bulkImporting ? 0.7 : 1 }}>
              <IconDownload size={13} /> Import {selected.size} selected
            </button>
          )}
          <button onClick={selectAll} style={{ padding: '7px 12px', border: '1px solid var(--border)', background: '#FFFFFF', fontSize: 11, color: 'var(--mid)', cursor: 'pointer' }}>
            Select all available
          </button>
          <button onClick={handleRefresh} disabled={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: '1px solid var(--border)', background: '#FFFFFF', fontSize: 12, color: 'var(--mid)', cursor: 'pointer', opacity: refreshing ? 0.7 : 1 }}>
            {refreshing ? 'Refreshing...' : ' Refresh from ATS'}
          </button>
        </div>
      </div>

      {/*  Stats strip  */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Total in ATS', value: stats.total, color: 'var(--dark)' },
            { label: 'Available to import', value: stats.available, color: '#2563eb' },
            { label: 'Imported to Taltas', value: stats.imported, color: '#16a34a' },
            { label: 'Connected ATS', value: stats.byProvider.length, color: 'var(--mid)' },
          ].map(s => (
            <div key={s.label} style={{ background: '#FFFFFF', border: '1px solid var(--border)', padding: '14px 18px' }}>
              <div style={{ fontSize: 22, fontWeight: 400, color: s.color, letterSpacing: '-0.5px' }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/*  Filters  */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}><IconSearch size={13} /></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs, departments, locations..."
            style={{ width: '100%', paddingLeft: 30, paddingRight: 10, paddingTop: 8, paddingBottom: 8, border: '1px solid var(--border)', background: '#FFFFFF', fontSize: 12, color: 'var(--dark)', outline: 'none' }} />
        </div>
        <select value={providerFilter} onChange={e => setProviderFilter(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid var(--border)', background: '#FFFFFF', fontSize: 12, color: 'var(--mid)', cursor: 'pointer' }}>
          <option value="">All ATS</option>
          <option value="greenhouse">Greenhouse</option>
          <option value="lever">Lever</option>
          <option value="workday">Workday</option>
        </select>
        <select value={importedFilter} onChange={e => setImportedFilter(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid var(--border)', background: '#FFFFFF', fontSize: 12, color: 'var(--mid)', cursor: 'pointer' }}>
          <option value="">All jobs</option>
          <option value="false">Available to import</option>
          <option value="true">Already imported</option>
        </select>
        {(search || providerFilter || importedFilter) && (
          <button onClick={() => { setSearch(''); setProviderFilter(''); setImportedFilter(''); }}
            style={{ padding: '7px 10px', border: '1px solid var(--border)', background: '#FFFFFF', cursor: 'pointer', color: 'var(--muted)' }}>
            <IconX size={13} />
          </button>
        )}
        <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 4 }}>{total} job{total !== 1 ? 's' : ''}</span>
      </div>

      {/*  Table  */}
      <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ width: 36, padding: '10px 14px' }}></th>
              {['Job Title', 'Department', 'Location', 'ATS Source', 'Salary', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 9, fontWeight: 400, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Loading Job Bank...</td></tr>
            ) : jobs.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                {search || providerFilter || importedFilter ? 'No jobs match your filters.' : 'No jobs in your Job Bank yet. Connect an ATS in Integrations to get started.'}
              </td></tr>
            ) : jobs.map((job, i) => (
              <tr key={job.id} style={{ borderBottom: i < jobs.length - 1 ? '1px solid var(--border)' : 'none', background: selected.has(job.id) ? 'var(--blue-bg)' : 'transparent', transition: 'background 0.1s' }}
                onMouseEnter={e => { if (!selected.has(job.id)) (e.currentTarget as HTMLElement).style.background = 'var(--blight)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = selected.has(job.id) ? 'var(--blue-bg)' : 'transparent'; }}>
                <td style={{ padding: '12px 14px' }}>
                  {!job.imported && (
                    <input type="checkbox" checked={selected.has(job.id)} onChange={() => toggleSelect(job.id)}
                      style={{ width: 14, height: 14, cursor: 'pointer', accentColor: 'var(--blue)' }} />
                  )}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark)', cursor: 'pointer' }} onClick={() => setDetailJob(job)}>{job.title}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{job.integrationName}</div>
                </td>
                <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--mid)' }}>{job.department || ''}</td>
                <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--mid)' }}>{job.location || ''}</td>
                <td style={{ padding: '12px 14px' }}><ProviderBadge provider={job.provider} /></td>
                <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--mid)' }}>{formatSalary(job.salaryMin, job.salaryMax) || ''}</td>
                <td style={{ padding: '12px 14px' }}><StatusBadge imported={job.imported} role={job.importedRole} /></td>
                <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                  {job.imported ? (
                    <a href={'/jobs'} style={{ fontSize: 11, color: 'var(--blue)', textDecoration: 'none', fontWeight: 500 }}>View in Live Jobs </a>
                  ) : (
                    <button onClick={() => setDetailJob(job)} disabled={importing === job.id}
                      style={{ padding: '5px 12px', background: 'var(--blue)', color: '#fff', fontSize: 11, fontWeight: 500, border: 'none', cursor: 'pointer', opacity: importing === job.id ? 0.7 : 1 }}>
                      {importing === job.id ? 'Importing...' : 'Import'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center', gap: 6 }}>
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => fetchJobs(p)}
                style={{ width: 28, height: 28, border: '1px solid var(--border)', background: p === page ? 'var(--blue)' : '#FFFFFF', color: p === page ? '#fff' : 'var(--mid)', fontSize: 11, cursor: 'pointer', fontWeight: p === page ? 700 : 400 }}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/*  Import detail slide-over  */}
      {detailJob && !detailJob.imported && (
        <Modal onClose={() => setDetailJob(null)}>
          <div style={{ padding: 28, minWidth: 480, maxWidth: 560 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 400, color: 'var(--dark)', marginBottom: 4 }}>{detailJob.title}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <ProviderBadge provider={detailJob.provider} />
                  {detailJob.department && <span style={{ fontSize: 11, color: 'var(--muted)' }}>{detailJob.department}</span>}
                  {detailJob.location && <span style={{ fontSize: 11, color: 'var(--muted)' }}> {detailJob.location}</span>}
                </div>
              </div>
              <button onClick={() => setDetailJob(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}><IconX size={16} /></button>
            </div>

            {detailJob.description && (
              <div style={{ background: 'var(--blight)', padding: 14, marginBottom: 18, fontSize: 12, color: 'var(--mid)', lineHeight: 1.6, maxHeight: 140, overflowY: 'auto' }}>
                {detailJob.description.slice(0, 400)}{detailJob.description.length > 400 ? '...' : ''}
              </div>
            )}

            {formatSalary(detailJob.salaryMin, detailJob.salaryMax) && (
              <div style={{ marginBottom: 16, fontSize: 12, color: 'var(--mid)' }}>
                <span style={{ fontWeight: 500 }}>Salary: </span>{formatSalary(detailJob.salaryMin, detailJob.salaryMax)}
              </div>
            )}

            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--mid)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Import options</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Urgency</label>
                  <select value={importOpts.urgency} onChange={e => setImportOpts(o => ({ ...o, urgency: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', background: '#FFFFFF', fontSize: 12, color: 'var(--dark)' }}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High (Warm)</option>
                    <option value="critical">Critical (Hot)</option>
                  </select>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: 'var(--mid)' }}>
                  <input type="checkbox" checked={importOpts.goLive} onChange={e => setImportOpts(o => ({ ...o, goLive: e.target.checked }))}
                    style={{ width: 14, height: 14, accentColor: 'var(--blue)' }} />
                  Set live immediately (skip draft)
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setDetailJob(null)} style={{ padding: '8px 16px', border: '1px solid var(--border)', background: '#FFFFFF', fontSize: 12, color: 'var(--mid)', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleImport(detailJob)} disabled={importing === detailJob.id}
                style={{ padding: '8px 20px', background: 'var(--blue)', color: '#fff', fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', opacity: importing === detailJob.id ? 0.7 : 1 }}>
                {importing === detailJob.id ? 'Importing...' : importOpts.goLive ? 'Import & Go Live' : 'Import as Draft'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}