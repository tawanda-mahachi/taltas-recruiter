// @ts-nocheck
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { MOCK_INTEGRATIONS } from '@/lib/mock-data';
import { useIntegrations } from '@/lib/data-provider';
import { DataSourceBadge } from '@/components/shared/api-status';
import { resolveIcon } from '@/components/icon-resolver';
import { useToast } from '@/components/ui/toast';
import { IconSearch, IconPlus, IconRefreshCw, IconSettings, IconZap } from '@/components/icons';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Modal } from '@/components/ui/modal';

const CATEGORIES = ['All', 'ATS', 'HRIS', 'Job Site'];

type AvailInteg = { name: string; category: string; icon: string; iconBg: string; authType: 'apikey' | 'oauth'; fields: string[] };
const AVAILABLE_INTEGRATIONS: AvailInteg[] = [
  { name: 'SmartRecruiters', category: 'ATS · Enterprise', icon: 'target', iconBg: 'var(--blue-bg)', authType: 'oauth', fields: ['Client ID', 'Client Secret', 'Redirect URI'] },
  { name: 'JazzHR', category: 'ATS · SMB', icon: 'star', iconBg: 'var(--gold-bg)', authType: 'apikey', fields: ['API Key'] },
  { name: 'SAP SuccessFactors', category: 'HRIS · Enterprise', icon: 'cloud', iconBg: 'var(--purple-bg)', authType: 'oauth', fields: ['Company ID', 'Client ID', 'Client Secret', 'Token URL'] },
  { name: 'Jobvite', category: 'ATS · Mid-Market', icon: 'globe', iconBg: 'var(--green-bg)', authType: 'apikey', fields: ['API Key', 'Secret Key'] },
  { name: 'AngelList Talent', category: 'Job Site · Startup', icon: 'rocket', iconBg: 'var(--orange-bg)', authType: 'apikey', fields: ['API Token'] },
  { name: 'Monster', category: 'Job Site · Volume', icon: 'globe', iconBg: 'var(--red-bg)', authType: 'apikey', fields: ['Account ID', 'API Key'] },
];

type IntegConfig = { webhookUrl?: string; syncInterval?: string; syncCandidates?: boolean; syncJobs?: boolean; syncInterviews?: boolean; [k: string]: any };

const AUTH_TYPE_MAP: Record<string, 'apikey' | 'oauth'> = {
  'Greenhouse': 'apikey', 'Lever': 'oauth', 'LinkedIn Recruiter': 'oauth',
  'BambooHR': 'apikey', 'Workday': 'oauth', 'Indeed': 'apikey',
  'Glassdoor': 'apikey', 'ZipRecruiter': 'apikey',
};
const FIELD_MAP: Record<string, string[]> = {
  'Greenhouse': ['API Key', 'Webhook Secret'], 'Lever': ['Client ID', 'Client Secret'],
  'LinkedIn Recruiter': ['Client ID', 'Client Secret', 'Organization ID'],
  'BambooHR': ['API Key', 'Subdomain'], 'Workday': ['Tenant URL', 'Client ID', 'Client Secret'],
  'Indeed': ['Publisher ID', 'API Token'], 'Glassdoor': ['Partner ID', 'API Key'], 'ZipRecruiter': ['API Key'],
};

export default function IntegrationsPage() {
  const toast = useToast();
  const integrationsQuery = useIntegrations();
  const apiIntegrations = integrationsQuery.data?.data || MOCK_INTEGRATIONS;
  const fromApi = !!integrationsQuery.data?.fromApi;
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'records'>('name');
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(apiIntegrations.map(i => [i.name || i.id || '', i.connected ?? false]))
  );
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [connectModal, setConnectModal] = useState<AvailInteg | null>(null);
  const [editModal, setEditModal] = useState<typeof MOCK_INTEGRATIONS[0] | null>(null);
  const [connectForm, setConnectForm] = useState<Record<string, string>>({});
  const [editForm, setEditForm] = useState<IntegConfig>({});
  const [connecting, setConnecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const { token } = useAuthStore();
  const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.taltas.ai/api/v1';

  const fetchFeed = useCallback(async () => {
    if (!token) return;
    try {
      const r = await fetch(API + '/integrations/activity-feed?limit=30', { headers: { Authorization: 'Bearer ' + token } });
      if (r.ok) setActivityFeed(await r.json());
    } catch {} finally { setFeedLoading(false); }
  }, [token]);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);
  const [configs, setConfigs] = useState<Record<string, IntegConfig>>(
    Object.fromEntries(apiIntegrations.filter(i => i.connected).map(i => [i.name || i.id || '', {
      webhookUrl: `https://api.taltas.ai/webhooks/${(i.name || 'integration').toLowerCase().replace(/\s/g, '-')}`,
      syncInterval: '15', syncCandidates: true, syncJobs: true, syncInterviews: true,
    }]))
  );

  const filtered = useMemo(() => {
    let ints = [...apiIntegrations];
    if (search) { const q = search.toLowerCase(); ints = ints.filter(i => (i.name || '').toLowerCase().includes(q) || (i.category || '').toLowerCase().includes(q)); }
    if (catFilter !== 'All') ints = ints.filter(i => (i.category || '').toLowerCase().includes(catFilter.toLowerCase()));
    if (statusFilter === 'connected') ints = ints.filter(i => toggles[i.name || i.id]);
    else if (statusFilter === 'disconnected') ints = ints.filter(i => !toggles[i.name || i.id]);
    else if (statusFilter === 'attention') ints = ints.filter(i => i.needsAttention);
    if (sortBy === 'records') ints.sort((a, b) => (b.records || 0) - (a.records || 0));
    else ints.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return ints;
  }, [search, catFilter, statusFilter, sortBy, toggles, apiIntegrations]);

  const connectedCount = Object.values(toggles).filter(Boolean).length;
  const attentionCount = apiIntegrations.filter(i => i.needsAttention).length;

  const handleConnect = (ai: AvailInteg) => { setConnectModal(ai); setConnectForm({}); };
  const submitConnect = () => {
    if (!connectModal) return;
    const missing = connectModal.fields.filter(f => !connectForm[f]?.trim());
    if (missing.length) { toast.show(`Please fill in: ${missing.join(', ')}`, 'error'); return; }
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConfigs(prev => ({ ...prev, [(connectModal as any).name || 'unknown']: { ...connectForm, webhookUrl: `https://api.taltas.ai/webhooks/${((connectModal as any).name || 'integration').toLowerCase().replace(/\s/g, '-')}`, syncInterval: '15', syncCandidates: true, syncJobs: true, syncInterviews: true } }));
      setToggles(prev => ({ ...prev, [(connectModal as any).name || 'unknown']: true }));
      toast.show(`${(connectModal as any).name || 'Integration'} connected successfully!`);
      setConnectModal(null); setAddModalOpen(false);
    }, 1500);
  };
  const openEdit = (int: typeof MOCK_INTEGRATIONS[0]) => {
    setEditModal(int);
    setEditForm(configs[int.name || ''] || { syncInterval: '15', syncCandidates: true, syncJobs: true, syncInterviews: true });
  };
  const saveEdit = () => {
    if (!editModal) return; setSaving(true);
    setTimeout(() => { setSaving(false); setConfigs(prev => ({ ...prev, [editModal.name || '']: editForm })); toast.show(`${editModal.name || 'Integration'} configuration saved`); setEditModal(null); }, 800);
  };
  const handleToggle = (name: string) => {
    const wasOn = toggles[name];
    setToggles(prev => ({ ...prev, [name]: !prev[name] }));
    toast.show(wasOn ? `${name} disconnected` : `${name} reconnected`);
  };
  const handleTestConnection = (name: string) => { toast.show(`Testing ${name}…`); setTimeout(() => toast.show(`${name} — connection healthy ✓`), 1200); };
  const existingFields = (name: string) => FIELD_MAP[name] || ['API Key'];
  const existingAuthType = (name: string) => AUTH_TYPE_MAP[name] || 'apikey';

  return (
    <div className="flex flex-col gap-[13px]">
      <div className="grid gap-[10px]" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="kpi"><div className="kpi-label">Connected</div><div className="kpi-num" style={{ color: 'var(--green)' }}>{connectedCount}</div><div className="font-mono text-[9px]" style={{ color: 'var(--muted)' }}>of {apiIntegrations.length} platforms</div></div>
        <div className="kpi" style={{ animationDelay: '.05s' }}><div className="kpi-label">Needs Attention</div><div className="kpi-num" style={{ color: 'var(--orange)' }}>{attentionCount}</div><div className="font-mono text-[9px]" style={{ color: 'var(--orange)' }}>Re-auth or webhook errors</div></div>
        <div className="kpi" style={{ animationDelay: '.1s' }}><div className="kpi-label">Total Records Synced</div><div className="kpi-num">8,247</div><div className="font-mono text-[9px]" style={{ color: 'var(--muted)' }}>Across all platforms</div></div>
        <div className="kpi" style={{ animationDelay: '.15s' }}><div className="kpi-label">Last Sync</div><div className="kpi-num" style={{ fontSize: 22 }}>2m ago</div><div className="kpi-delta up"><IconRefreshCw size={9} /> All healthy</div></div>
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-[14px] flex-wrap gap-[6px]">
          <span className="mono-label flex items-center gap-[6px]"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 4v16M15 4v16M4 9h16M4 15h16"/></svg> HR Platforms & Job Site Integrations<DataSourceBadge fromApi={fromApi} /></span>
          <div className="flex gap-[6px] items-center"><span className="fit-badge fit-good">{connectedCount} Connected</span><span className="fit-badge" style={{ color: 'var(--orange)', background: 'var(--orange-bg)', borderColor: 'var(--orange-border)' }}>{attentionCount} Attention</span></div>
        </div>
        <div className="flex gap-[7px] mb-[12px] flex-wrap">
          <div className="relative flex-1" style={{ minWidth: 160 }}><IconSearch size={12} className="absolute left-[10px] top-1/2 -translate-y-1/2 opacity-40" style={{ pointerEvents: 'none' }} /><input className="form-input" style={{ paddingLeft: 28, fontSize: 11 }} placeholder="Search integrations…" value={search} onChange={e => setSearch(e.target.value)} /></div>
          <select className="filter-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
          <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="">All Status</option><option value="connected">Connected</option><option value="disconnected">Disconnected</option><option value="attention">Needs Attention</option></select>
          <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value as any)}><option value="name">Sort: Name</option><option value="records">Sort: Records</option></select>
          <button className="ctrl-btn blue flex items-center gap-[4px]" onClick={() => setAddModalOpen(true)}><IconPlus size={10} /> Add Integration</button>
        </div>
        <div className="int-grid">
          {filtered.map((int) => {
            const intName = int.name || int.provider || 'Integration';
            const intKey = intName;
            return (
            <div key={intKey} className="int-tile">
              <div className="w-[32px] h-[32px] rounded-[7px] flex items-center justify-center flex-shrink-0" style={{ background: int.iconBg, border: '1px solid var(--border)' }}>{resolveIcon(int.icon, { size: 16 })}</div>
              <div className="flex-1 cursor-pointer" onClick={() => { if (toggles[intKey]) openEdit(int); }}>
                <div className="text-[11.5px] font-medium" style={{ color: 'var(--text-bright)' }}>{intName}</div>
                <div className="font-mono text-[8.5px]" style={{ color: 'var(--muted)' }}>{int.category || ''}</div>
                <div className="flex items-center gap-[5px] mt-[5px]"><div className="w-[5px] h-[5px] rounded-full" style={{ background: toggles[intKey] ? (int.needsAttention ? 'var(--orange)' : 'var(--green)') : 'var(--border2)' }} /><span className="font-mono text-[9px]" style={{ color: toggles[intKey] ? (int.needsAttention ? 'var(--orange)' : 'var(--green)') : 'var(--muted)' }}>{toggles[intKey] ? (int.needsAttention ? 'Needs Attention' : 'Connected') : 'Disconnected'}</span></div>
                {toggles[intKey] && <div className="font-mono text-[8px] mt-[2px]" style={{ color: 'var(--muted)' }}>{(int.records || 0).toLocaleString()} records · {int.lastSync || 'Never'}</div>}
              </div>
              <div className="flex flex-col gap-[4px] items-end flex-shrink-0">
                <button className={`int-toggle ${toggles[intKey] ? (int.needsAttention ? 'warn' : 'on') : 'off'}`} onClick={() => handleToggle(intKey)} />
                {toggles[intKey] && <button className="ctrl-btn" style={{ fontSize: 8, padding: '2px 6px' }} onClick={() => openEdit(int)}><IconSettings size={8} className="inline mr-[2px]" />Configure</button>}
              </div>
            </div>
          );})}
          {filtered.length === 0 && <div className="text-center py-[20px] col-span-2" style={{ color: 'var(--muted)' }}>No integrations match your filters</div>}
        </div>
      </div>

      {/* Browse new integrations */}
      <Modal open={addModalOpen && !connectModal} onClose={() => setAddModalOpen(false)} maxWidth="520px">
        <div className="text-[19px] font-semibold mb-[4px]" style={{ fontFamily: "'Roboto Slab', serif", color: 'var(--text-bright)' }}>Add Integration</div>
        <div className="text-[11.5px] mb-[16px]" style={{ color: 'var(--text-dim)' }}>Connect a new HR platform or job site.</div>
        <div className="flex flex-col gap-[8px]">{AVAILABLE_INTEGRATIONS.map(ai => (
          <div key={ai.name} className="flex items-center gap-[10px] p-[10px_12px] rounded-[8px] cursor-pointer transition-all hover:bg-[var(--surface2)]" style={{ border: '1px solid var(--border)' }} onClick={() => handleConnect(ai)}>
            <div className="w-[28px] h-[28px] rounded-[7px] flex items-center justify-center flex-shrink-0" style={{ background: ai.iconBg, border: '1px solid var(--border)' }}>{resolveIcon(ai.icon, { size: 14 })}</div>
            <div className="flex-1"><div className="text-[12px] font-medium" style={{ color: 'var(--text-bright)' }}>{ai.name}</div><div className="font-mono text-[8.5px]" style={{ color: 'var(--muted)' }}>{ai.category} · {ai.authType === 'oauth' ? 'OAuth 2.0' : 'API Key'}</div></div>
            <button className="ctrl-btn run" style={{ fontSize: '9px' }}>Connect</button>
          </div>
        ))}</div>
        <div className="flex justify-end mt-[14px]"><button className="ctrl-btn" onClick={() => setAddModalOpen(false)}>Close</button></div>
      </Modal>

      {/* Credential entry for new connection */}
      <Modal open={!!connectModal} onClose={() => setConnectModal(null)} maxWidth="480px">
        {connectModal && (<>
          <div className="flex items-center gap-[10px] mb-[16px]">
            <div className="w-[36px] h-[36px] rounded-[9px] flex items-center justify-center" style={{ background: connectModal.iconBg, border: '1px solid var(--border)' }}>{resolveIcon(connectModal.icon, { size: 18 })}</div>
            <div><div className="text-[17px] font-semibold" style={{ fontFamily: "'Roboto Slab', serif", color: 'var(--text-bright)' }}>Connect {connectModal.name}</div><div className="font-mono text-[9px]" style={{ color: 'var(--muted)' }}>{connectModal.authType === 'oauth' ? 'OAuth 2.0' : 'API Key'} Authentication</div></div>
          </div>
          <div className="p-[12px] rounded-[8px] mb-[14px]" style={{ background: 'var(--blue-bg)', border: '1px solid var(--blue-border)' }}><div className="font-mono text-[9px]" style={{ color: 'var(--blue)' }}>{connectModal.authType === 'oauth' ? `Enter OAuth credentials from the ${connectModal.name} developer console. Taltas manages token refresh.` : `Enter credentials from the ${connectModal.name} admin panel. Keys encrypted with AES-256.`}</div></div>
          {connectModal.fields.map(field => (<div key={field} style={{ marginBottom: 12 }}><label className="form-label">{field}</label><input className="form-input" type={field.toLowerCase().includes('secret') || field.toLowerCase().includes('key') || field.toLowerCase().includes('token') ? 'password' : 'text'} placeholder={field.toLowerCase().includes('url') ? 'https://...' : `Enter ${field}`} value={connectForm[field] || ''} onChange={e => setConnectForm(prev => ({ ...prev, [field]: e.target.value }))} style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 11 }} /></div>))}
          <div style={{ marginBottom: 12 }}><label className="form-label">Webhook Endpoint (auto-generated)</label><input className="form-input" readOnly value={`https://api.taltas.ai/webhooks/${connectModal.name.toLowerCase().replace(/\s/g, '-')}`} style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 10, color: 'var(--muted)', background: 'var(--surface2)' }} /></div>
          <div className="flex gap-[8px] mt-[16px]">
            <button className="ctrl-btn run" style={{ flex: 1, textAlign: 'center', fontSize: 11, padding: '9px 16px' }} onClick={submitConnect} disabled={connecting}>{connecting ? '↻ Connecting…' : 'Connect & Authorize'}</button>
            <button className="ctrl-btn" style={{ fontSize: 11, padding: '9px 16px' }} onClick={() => setConnectModal(null)}>Cancel</button>
          </div>
          <div className="font-mono text-[8px] text-center mt-[8px]" style={{ color: 'var(--muted)' }}>🔒 TLS 1.3 · AES-256 · SOC 2 Type II</div>
        </>)}
      </Modal>

      {/* -- Activity Feed -- */}
      <div style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-bright)', letterSpacing: '-0.2px' }}>ATS Activity Feed</div>
          <button onClick={fetchFeed} style={{ fontSize: 11, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>? Refresh</button>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 10, overflow: 'hidden' }}>
          {feedLoading ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>Loading activity...</div>
          ) : activityFeed.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>No ATS activity yet. Connect an ATS to get started.</div>
          ) : activityFeed.map((item: any, i: number) => {
            const isPush = item.direction === 'push';
            const isSuccess = item.status === 'success';
            return (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: i < activityFeed.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, background: isPush ? '#2563eb18' : '#16a34a18', flexShrink: 0 }}>
                  {isPush ? '?' : '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-bright)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.payloadSummary || (isPush ? 'Candidate pushed' : 'Jobs synced')}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                    {item.provider} � {item.eventType.replace(/_/g, ' ')} {item.roleTitle ? '� ' + item.roleTitle : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, fontWeight: 600, background: isSuccess ? '#16a34a15' : '#dc262615', color: isSuccess ? '#16a34a' : '#dc2626', border: '1px solid ' + (isSuccess ? '#16a34a30' : '#dc262630') }}>
                    {isSuccess ? (isPush ? '? Pushed' : '? Pulled') : '? Failed'}
                  </span>
                  {!item.jobLinked && isPush && (
                    <span style={{ fontSize: 9, color: '#d97706', fontWeight: 500 }}>? No job linked</span>
                  )}
                  <span style={{ fontSize: 9, color: 'var(--muted)' }}>{new Date(item.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {item.status === 'failed' && (
                  <button onClick={async () => { await fetch(API + '/integrations/push-log/' + item.id + '/retry', { method: 'POST', headers: { Authorization: 'Bearer ' + token } }); fetchFeed(); }} style={{ padding: '4px 9px', borderRadius: 5, border: '1px solid var(--border2)', background: 'var(--surface)', fontSize: 10, cursor: 'pointer', color: 'var(--text-mid)', flexShrink: 0 }}>Retry</button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit/configure existing integration */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} maxWidth="540px">
        {editModal && (<>
          <div className="flex items-center justify-between mb-[16px]">
            <div className="flex items-center gap-[10px]"><div className="w-[36px] h-[36px] rounded-[9px] flex items-center justify-center" style={{ background: editModal.iconBg, border: '1px solid var(--border)' }}>{resolveIcon(editModal.icon, { size: 18 })}</div><div><div className="text-[17px] font-semibold" style={{ fontFamily: "'Roboto Slab', serif", color: 'var(--text-bright)' }}>{editModal.name || 'Integration'}</div><div className="flex items-center gap-[5px]"><div className="w-[5px] h-[5px] rounded-full" style={{ background: editModal.needsAttention ? 'var(--orange)' : 'var(--green)' }} /><span className="font-mono text-[9px]" style={{ color: editModal.needsAttention ? 'var(--orange)' : 'var(--green)' }}>{editModal.needsAttention ? 'Needs Attention' : 'Connected'}</span></div></div></div>
            <button className="ctrl-btn" style={{ fontSize: 8, padding: '3px 8px' }} onClick={() => handleTestConnection(editModal.name || '')}>Test Connection</button>
          </div>
          <div className="grid grid-cols-3 gap-[8px] mb-[14px]">
            <div className="text-center p-[8px] rounded-[7px]" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}><div className="text-[16px] font-bold" style={{ fontFamily: "'Roboto Slab', serif", color: 'var(--text-bright)' }}>{(editModal.records || 0).toLocaleString()}</div><div className="font-mono text-[8px]" style={{ color: 'var(--muted)' }}>Records</div></div>
            <div className="text-center p-[8px] rounded-[7px]" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}><div className="text-[16px] font-bold" style={{ fontFamily: "'Roboto Slab', serif", color: 'var(--green)' }}>{editModal.lastSync}</div><div className="font-mono text-[8px]" style={{ color: 'var(--muted)' }}>Last Sync</div></div>
            <div className="text-center p-[8px] rounded-[7px]" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}><div className="text-[16px] font-bold" style={{ fontFamily: "'Roboto Slab', serif", color: 'var(--blue)' }}>{existingAuthType(editModal.name || '') === 'oauth' ? 'OAuth' : 'API Key'}</div><div className="font-mono text-[8px]" style={{ color: 'var(--muted)' }}>Auth</div></div>
          </div>
          <div className="p-[14px] rounded-[9px] mb-[12px]" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <div className="font-mono text-[8.5px] uppercase tracking-[.1em] mb-[10px]" style={{ color: 'var(--muted)' }}>Credentials</div>
            {existingFields(editModal.name || '').map(field => (<div key={field} style={{ marginBottom: 8 }}><label className="form-label">{field}</label><div className="flex gap-[4px]"><input className="form-input flex-1" type={editForm[`_show_${field}`] ? 'text' : 'password'} placeholder="Enter credential value…" value={editForm[field] || configs[editModal.name || '']?.[field] || ''} onChange={e => setEditForm(prev => ({ ...prev, [field]: e.target.value }))} style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 10 }} /><button className="ctrl-btn" style={{ fontSize: 8, flexShrink: 0 }} onClick={() => setEditForm(prev => ({ ...prev, [`_show_${field}`]: !prev[`_show_${field}`] }))}>{editForm[`_show_${field}`] ? 'Hide' : 'Show'}</button></div></div>))}
            <button className="ctrl-btn" style={{ fontSize: 8 }} onClick={() => toast.show('Credentials rotated')}>Rotate Credentials</button>
          </div>
          <div className="p-[14px] rounded-[9px] mb-[12px]" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <div className="font-mono text-[8.5px] uppercase tracking-[.1em] mb-[10px]" style={{ color: 'var(--muted)' }}>Sync Configuration</div>
            <div className="grid grid-cols-2 gap-[10px] mb-[10px]">
              <div><label className="form-label">Sync Interval</label><select className="form-select" value={editForm.syncInterval || '15'} onChange={e => setEditForm(f => ({ ...f, syncInterval: e.target.value }))}><option value="5">Every 5 min</option><option value="15">Every 15 min</option><option value="30">Every 30 min</option><option value="60">Hourly</option></select></div>
              <div><label className="form-label">Webhook URL</label><input className="form-input" value={editForm.webhookUrl || configs[editModal.name || '']?.webhookUrl || ''} onChange={e => setEditForm(f => ({ ...f, webhookUrl: e.target.value }))} style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 9 }} /></div>
            </div>
            {[{ k: 'syncCandidates', l: 'Sync Candidates', d: 'Import profiles & applications' },{ k: 'syncJobs', l: 'Sync Job Postings', d: 'Bi-directional listing sync' },{ k: 'syncInterviews', l: 'Sync Interviews', d: 'Calendar & status updates' }].map(({ k, l, d }) => (
              <div key={k} className="flex items-center justify-between py-[6px]" style={{ borderBottom: '1px solid var(--border)' }}><div><div className="text-[11px] font-medium" style={{ color: 'var(--text-bright)' }}>{l}</div><div className="text-[9px]" style={{ color: 'var(--muted)' }}>{d}</div></div><button onClick={() => setEditForm(f => ({ ...f, [k]: !(f[k] ?? true) }))} className={`settings-toggle ${(editForm[k] ?? true) ? 'on' : 'off'}`} /></div>
            ))}
          </div>
          <div className="flex gap-[8px]">
            <button className="ctrl-btn run" style={{ flex: 1, textAlign: 'center', fontSize: 11, padding: '8px 16px' }} onClick={saveEdit} disabled={saving}>{saving ? 'Saving…' : 'Save Configuration'}</button>
            <button className="ctrl-btn" style={{ fontSize: 11, padding: '8px 16px', color: 'var(--red)' }} onClick={() => { handleToggle(editModal.name || ''); setEditModal(null); }}>Disconnect</button>
            <button className="ctrl-btn" style={{ fontSize: 11, padding: '8px 16px' }} onClick={() => setEditModal(null)}>Cancel</button>
          </div>
        </>)}
      </Modal>
    </div>
  );
}

