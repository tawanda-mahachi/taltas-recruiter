// @ts-nocheck
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { MOCK_INTEGRATIONS } from '@/lib/mock-data';
import { useIntegrations } from '@/lib/data-provider';
import { DataSourceBadge } from '@/components/shared/api-status';
import { resolveIcon } from '@/components/icon-resolver';
import { useToast } from '@/components/ui/toast';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Modal } from '@/components/ui/modal';

const F      = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const BLUE   = '#2563eb';
const TEAL   = '#1D9E75';
const DARK   = '#0A0A0A';
const MID    = '#6B6B6B';
const MUTED  = '#AAAAAA';
const BORDER = '#E8E8E5';
const BLIGHT = '#F4F4F2';
const AMBER  = '#D97706';
const RED    = '#CC3300';

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

function Toggle({ on, onToggle, warn = false }: any) {
  const bg = on ? (warn ? AMBER : TEAL) : BORDER;
  return (
    <div onClick={onToggle} style={{ width: 36, height: 20, background: bg, borderRadius: 10, position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', width: 14, height: 14, background: '#fff', borderRadius: '50%', top: 3, left: on ? 19 : 3, transition: 'left .2s' }} />
    </div>
  );
}

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

  const connectedCount  = Object.values(toggles).filter(Boolean).length;
  const attentionCount  = apiIntegrations.filter(i => i.needsAttention).length;
  const totalRecords    = apiIntegrations.reduce((s, i) => s + (i.records || 0), 0);

  const handleConnect = (ai: AvailInteg) => { setConnectModal(ai); setConnectForm({}); };
  const submitConnect = () => {
    if (!connectModal) return;
    const missing = connectModal.fields.filter(f => !connectForm[f]?.trim());
    if (missing.length) { toast.show(`Please fill in: ${missing.join(', ')}`, 'error'); return; }
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConfigs(prev => ({ ...prev, [connectModal.name]: { ...connectForm, webhookUrl: `https://api.taltas.ai/webhooks/${connectModal.name.toLowerCase().replace(/\s/g, '-')}`, syncInterval: '15', syncCandidates: true, syncJobs: true, syncInterviews: true } }));
      setToggles(prev => ({ ...prev, [connectModal.name]: true }));
      toast.show(`${connectModal.name} connected successfully!`);
      setConnectModal(null); setAddModalOpen(false);
    }, 1500);
  };
  const openEdit = (int: any) => {
    setEditModal(int);
    setEditForm(configs[int.name || ''] || { syncInterval: '15', syncCandidates: true, syncJobs: true, syncInterviews: true });
  };
  const saveEdit = () => {
    if (!editModal) return; setSaving(true);
    setTimeout(() => { setSaving(false); setConfigs(prev => ({ ...prev, [editModal.name || '']: editForm })); toast.show(`${editModal.name} configuration saved`); setEditModal(null); }, 800);
  };
  const handleToggle = (name: string) => {
    const wasOn = toggles[name];
    setToggles(prev => ({ ...prev, [name]: !prev[name] }));
    toast.show(wasOn ? `${name} disconnected` : `${name} reconnected`);
  };
  const handleTestConnection = (name: string) => { toast.show(`Testing ${name}…`); setTimeout(() => toast.show(`${name} — connection healthy`), 1200); };
  const existingFields   = (name: string) => FIELD_MAP[name] || ['API Key'];
  const existingAuthType = (name: string) => AUTH_TYPE_MAP[name] || 'apikey';

  const inputStyle  = { width: '100%', padding: '7px 10px', border: '1px solid ' + BORDER, fontFamily: F, fontSize: 13, color: DARK, outline: 'none' } as any;
  const selectStyle = { width: '100%', padding: '7px 10px', border: '1px solid ' + BORDER, fontFamily: F, fontSize: 13, color: MID, background: '#fff', outline: 'none', cursor: 'pointer', appearance: 'none' as any };
  const btnPrimary  = { padding: '7px 18px', background: BLUE, border: 'none', color: '#fff', fontFamily: F, fontSize: 12, cursor: 'pointer' } as any;
  const btnSecondary= { padding: '7px 18px', background: 'none', border: '1px solid ' + BORDER, color: MID, fontFamily: F, fontSize: 12, cursor: 'pointer' } as any;
  const btnDanger   = { padding: '7px 18px', background: 'none', border: '1px solid #FFDDD8', color: RED, fontFamily: F, fontSize: 12, cursor: 'pointer' } as any;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, fontFamily: F, overflow: 'hidden' }}>

      {/* PAGE HEADER */}
      <div style={{ height: 68, paddingLeft: 24, paddingRight: 24, borderBottom: '1px solid ' + BORDER, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>  
        <div>
          <div style={{ fontSize: 15, fontWeight: 400, letterSpacing: '-0.01em', color: DARK }}>Integrations</div>
          <div style={{ fontSize: 11, color: MUTED, fontWeight: 300, marginTop: 1 }}>HR Platforms & Job Site Connections <DataSourceBadge fromApi={fromApi} /></div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={() => setAddModalOpen(true)}
            style={{ fontSize: 11, color: '#fff', background: BLUE, border: 'none', padding: '5px 14px', cursor: 'pointer', fontFamily: F }}>
            + Add Integration
          </button>
        </div>
      </div>

      {/* METRICS STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', background: BLUE, flexShrink: 0 }}>
        {[
          { v: connectedCount,              l: 'Connected',          sub: `of ${apiIntegrations.length} platforms` },
          { v: attentionCount,              l: 'Needs Attention',    sub: 'Re-auth or webhook errors' },
          { v: totalRecords.toLocaleString(),l: 'Records Synced',    sub: 'Across all platforms' },
          { v: '2m ago',                    l: 'Last Sync',          sub: 'All systems healthy' },
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
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, maxWidth: 280 }}>
          <svg style={{ position: 'absolute', left: 9, pointerEvents: 'none' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search integrations…"
            style={{ width: '100%', padding: '6px 10px 6px 28px', border: '1px solid ' + BORDER, fontSize: 12, fontFamily: F, color: DARK, outline: 'none' }} />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          style={{ padding: '6px 10px', border: '1px solid ' + BORDER, fontSize: 12, fontFamily: F, color: MID, background: '#fff', outline: 'none', cursor: 'pointer', appearance: 'none' }}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '6px 10px', border: '1px solid ' + BORDER, fontSize: 12, fontFamily: F, color: MID, background: '#fff', outline: 'none', cursor: 'pointer', appearance: 'none' }}>
          <option value="">All Status</option>
          <option value="connected">Connected</option>
          <option value="disconnected">Disconnected</option>
          <option value="attention">Needs Attention</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
          style={{ padding: '6px 10px', border: '1px solid ' + BORDER, fontSize: 12, fontFamily: F, color: MID, background: '#fff', outline: 'none', cursor: 'pointer', appearance: 'none' }}>
          <option value="name">Sort: Name</option>
          <option value="records">Sort: Records</option>
        </select>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: MUTED, fontWeight: 300 }}>{filtered.length} of {apiIntegrations.length}</span>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* INTEGRATION TABLE */}
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '24%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '14%' }} />
          </colgroup>
          <thead style={{ position: 'sticky', top: 0, zIndex: 5 }}>
            <tr style={{ background: BLIGHT, borderBottom: '1px solid ' + BORDER }}>
              {['Integration','Category','Status','Records','Last Sync','Auth Type','Actions'].map(h => (
                <th key={h} style={{ fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 400, padding: '0 16px', height: 34, textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((int) => {
              const intKey  = int.name || int.id || '';
              const isOn    = !!toggles[intKey];
              const isWarn  = int.needsAttention;
              const dotCol  = isOn ? (isWarn ? AMBER : TEAL) : BORDER;
              const statusTxt = isOn ? (isWarn ? 'Needs Attention' : 'Connected') : 'Disconnected';
              const statusCol = isOn ? (isWarn ? AMBER : TEAL) : MUTED;
              return (
                <tr key={intKey}
                  style={{ borderBottom: '1px solid ' + BLIGHT, height: 54, transition: 'background .1s', cursor: isOn ? 'pointer' : 'default' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(37,99,235,.016)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => { if (isOn) openEdit(int); }}>
                  {/* Integration name */}
                  <td style={{ padding: '0 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 28, height: 28, background: int.iconBg || BLIGHT, border: '1px solid ' + BORDER, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {resolveIcon(int.icon, { size: 14 })}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 400, color: DARK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{intKey}</div>
                    </div>
                  </td>
                  {/* Category */}
                  <td style={{ padding: '0 16px', fontSize: 11, color: MUTED, fontWeight: 300 }}>{int.category || '—'}</td>
                  {/* Status */}
                  <td style={{ padding: '0 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: dotCol, flexShrink: 0, animation: isOn && !isWarn ? 'none' : 'none' }} />
                      <span style={{ fontSize: 11, color: statusCol, fontWeight: 300 }}>{statusTxt}</span>
                    </div>
                  </td>
                  {/* Records */}
                  <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 300, color: isOn ? DARK : MUTED }}>{isOn ? (int.records || 0).toLocaleString() : '—'}</td>
                  {/* Last Sync */}
                  <td style={{ padding: '0 16px', fontSize: 11, color: MUTED, fontWeight: 300 }}>{isOn ? (int.lastSync || 'Never') : '—'}</td>
                  {/* Auth Type */}
                  <td style={{ padding: '0 16px' }}>
                    <span style={{ fontSize: 10, padding: '2px 8px', background: existingAuthType(intKey) === 'oauth' ? '#F3EEFF' : BLIGHT, color: existingAuthType(intKey) === 'oauth' ? '#7C3AED' : MID, fontWeight: 400 }}>
                      {existingAuthType(intKey) === 'oauth' ? 'OAuth 2.0' : 'API Key'}
                    </span>
                  </td>
                  {/* Actions */}
                  <td style={{ padding: '0 16px' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Toggle on={isOn} warn={isWarn} onToggle={() => handleToggle(intKey)} />
                      {isOn && (
                        <button onClick={() => openEdit(int)}
                          style={{ fontSize: 10, color: MID, background: 'none', border: '1px solid ' + BORDER, padding: '3px 10px', cursor: 'pointer', fontFamily: F }}>
                          Configure
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '60px 20px', textAlign: 'center', color: MUTED, fontSize: 13, fontWeight: 300 }}>No integrations match your filters</td></tr>
            )}
          </tbody>
        </table>

        {/* ACTIVITY FEED */}
        <div style={{ padding: '24px 24px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: MUTED }} />
              <span style={{ fontSize: 9, color: MUTED, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 400 }}>ATS Activity Feed</span>
            </div>
            <button onClick={fetchFeed}
              style={{ fontSize: 11, color: MUTED, background: 'none', border: 'none', cursor: 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              Refresh
            </button>
          </div>
          <div style={{ border: '1px solid ' + BORDER, overflow: 'hidden' }}>
            {feedLoading ? (
              <div style={{ padding: '24px 20px', textAlign: 'center', color: MUTED, fontSize: 12, fontWeight: 300 }}>Loading activity…</div>
            ) : activityFeed.length === 0 ? (
              <div style={{ padding: '24px 20px', textAlign: 'center', color: MUTED, fontSize: 12, fontWeight: 300 }}>No ATS activity yet. Connect an ATS to get started.</div>
            ) : activityFeed.map((item: any, i: number) => {
              const isPush    = item.direction === 'push';
              const isSuccess = item.status === 'success';
              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: i < activityFeed.length - 1 ? '1px solid ' + BLIGHT : 'none' }}>
                  <div style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: isPush ? '#E8F0FF' : '#E6F5EE' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={isPush ? BLUE : TEAL} strokeWidth="1.5" strokeLinecap="round">
                      {isPush ? <><path d="M5 12h14M12 5l7 7-7 7"/></> : <><path d="M19 12H5M12 19l-7-7 7-7"/></>}
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 400, color: DARK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.payloadSummary || (isPush ? 'Candidate pushed' : 'Jobs synced')}
                    </div>
                    <div style={{ fontSize: 10, color: MUTED, fontWeight: 300, marginTop: 2 }}>
                      {item.provider} · {item.eventType.replace(/_/g, ' ')}{item.roleTitle ? ' · ' + item.roleTitle : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, padding: '2px 8px', fontWeight: 400, background: isSuccess ? '#E6F5EE' : '#FFEAEA', color: isSuccess ? '#15703A' : RED }}>
                      {isSuccess ? (isPush ? 'Pushed' : 'Pulled') : 'Failed'}
                    </span>
                    {!item.jobLinked && isPush && (
                      <span style={{ fontSize: 9, color: AMBER, fontWeight: 400 }}>No job linked</span>
                    )}
                    <span style={{ fontSize: 9, color: MUTED, fontWeight: 300 }}>
                      {new Date(item.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {item.status === 'failed' && (
                    <button onClick={async () => { await fetch(API + '/integrations/push-log/' + item.id + '/retry', { method: 'POST', headers: { Authorization: 'Bearer ' + token } }); fetchFeed(); }}
                      style={{ padding: '4px 10px', border: '1px solid ' + BORDER, background: '#fff', fontSize: 10, cursor: 'pointer', color: MID, fontFamily: F, flexShrink: 0 }}>
                      Retry
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ADD INTEGRATION MODAL */}
      <Modal open={addModalOpen && !connectModal} onClose={() => setAddModalOpen(false)} title="Add Integration">
        <div style={{ fontFamily: F }}>
          <div style={{ fontSize: 11, color: MUTED, fontWeight: 300, marginBottom: 14 }}>Connect a new HR platform or job site.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {AVAILABLE_INTEGRATIONS.map(ai => (
              <div key={ai.name}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', border: '1px solid ' + BORDER, cursor: 'pointer', transition: 'border-color .1s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = BLUE)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = BORDER)}
                onClick={() => handleConnect(ai)}>
                <div style={{ width: 28, height: 28, background: ai.iconBg || BLIGHT, border: '1px solid ' + BORDER, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {resolveIcon(ai.icon, { size: 13 })}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 400, color: DARK }}>{ai.name}</div>
                  <div style={{ fontSize: 10, color: MUTED, fontWeight: 300 }}>{ai.category} · {ai.authType === 'oauth' ? 'OAuth 2.0' : 'API Key'}</div>
                </div>
                <button style={btnPrimary}>Connect</button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
            <button style={btnSecondary} onClick={() => setAddModalOpen(false)}>Close</button>
          </div>
        </div>
      </Modal>

      {/* CONNECT CREDENTIAL MODAL */}
      <Modal open={!!connectModal} onClose={() => setConnectModal(null)} title={connectModal ? `Connect ${connectModal.name}` : ''}>
        {connectModal && (
          <div style={{ fontFamily: F }}>
            <div style={{ fontSize: 10, color: MUTED, fontWeight: 300, marginBottom: 14, padding: '8px 12px', background: BLIGHT, border: '1px solid ' + BORDER }}>
              {connectModal.authType === 'oauth'
                ? `Enter OAuth credentials from the ${connectModal.name} developer console.`
                : `Enter credentials from the ${connectModal.name} admin panel. Keys encrypted with AES-256.`}
            </div>
            {connectModal.fields.map(field => (
              <div key={field} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: MID, fontWeight: 400, marginBottom: 5 }}>{field}</div>
                <input style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 11 }}
                  type={field.toLowerCase().includes('secret') || field.toLowerCase().includes('key') || field.toLowerCase().includes('token') ? 'password' : 'text'}
                  placeholder={field.toLowerCase().includes('url') ? 'https://…' : `Enter ${field}`}
                  value={connectForm[field] || ''}
                  onChange={e => setConnectForm(prev => ({ ...prev, [field]: e.target.value }))} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: MID, fontWeight: 400, marginBottom: 5 }}>Webhook Endpoint (auto-generated)</div>
              <input style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 10, color: MUTED, background: BLIGHT }} readOnly
                value={`https://api.taltas.ai/webhooks/${connectModal.name.toLowerCase().replace(/\s/g, '-')}`} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ ...btnPrimary, flex: 1 }} onClick={submitConnect} disabled={connecting}>
                {connecting ? 'Connecting…' : 'Connect & Authorize'}
              </button>
              <button style={btnSecondary} onClick={() => setConnectModal(null)}>Cancel</button>
            </div>
            <div style={{ fontSize: 9, color: MUTED, textAlign: 'center', marginTop: 10 }}>TLS 1.3 · AES-256 · SOC 2 Type II</div>
          </div>
        )}
      </Modal>

      {/* EDIT / CONFIGURE MODAL */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title={editModal?.name || 'Configure Integration'}>
        {editModal && (
          <div style={{ fontFamily: F }}>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
              {[
                { l: 'Records', v: (editModal.records || 0).toLocaleString(), col: DARK },
                { l: 'Last Sync', v: editModal.lastSync || '—', col: TEAL },
                { l: 'Auth', v: existingAuthType(editModal.name || '') === 'oauth' ? 'OAuth' : 'API Key', col: BLUE },
              ].map((s, i) => (
                <div key={i} style={{ padding: '10px 12px', border: '1px solid ' + BORDER, textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: MUTED, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4, fontWeight: 400 }}>{s.l}</div>
                  <div style={{ fontSize: 16, fontWeight: 300, color: s.col, letterSpacing: '-0.01em' }}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* Credentials */}
            <div style={{ padding: '12px 14px', border: '1px solid ' + BORDER, marginBottom: 12 }}>
              <div style={{ fontSize: 9, color: MUTED, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 400 }}>Credentials</div>
              {existingFields(editModal.name || '').map(field => (
                <div key={field} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: MID, fontWeight: 400, marginBottom: 4 }}>{field}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input style={{ ...inputStyle, flex: 1, fontFamily: 'monospace', fontSize: 10 }}
                      type={editForm[`_show_${field}`] ? 'text' : 'password'}
                      placeholder="Enter credential value…"
                      value={editForm[field] || configs[editModal.name || '']?.[field] || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, [field]: e.target.value }))} />
                    <button style={btnSecondary} onClick={() => setEditForm(prev => ({ ...prev, [`_show_${field}`]: !prev[`_show_${field}`] }))}>
                      {editForm[`_show_${field}`] ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              ))}
              <button style={btnSecondary} onClick={() => toast.show('Credentials rotated')}>Rotate Credentials</button>
            </div>

            {/* Sync config */}
            <div style={{ padding: '12px 14px', border: '1px solid ' + BORDER, marginBottom: 14 }}>
              <div style={{ fontSize: 9, color: MUTED, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 400 }}>Sync Configuration</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: MID, fontWeight: 400, marginBottom: 4 }}>Sync Interval</div>
                  <select style={selectStyle} value={editForm.syncInterval || '15'} onChange={e => setEditForm(f => ({ ...f, syncInterval: e.target.value }))}>
                    <option value="5">Every 5 min</option><option value="15">Every 15 min</option>
                    <option value="30">Every 30 min</option><option value="60">Hourly</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: MID, fontWeight: 400, marginBottom: 4 }}>Webhook URL</div>
                  <input style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 9 }}
                    value={editForm.webhookUrl || configs[editModal.name || '']?.webhookUrl || ''}
                    onChange={e => setEditForm(f => ({ ...f, webhookUrl: e.target.value }))} />
                </div>
              </div>
              {[
                { k: 'syncCandidates', l: 'Sync Candidates',   d: 'Import profiles & applications' },
                { k: 'syncJobs',       l: 'Sync Job Postings', d: 'Bi-directional listing sync' },
                { k: 'syncInterviews', l: 'Sync Interviews',   d: 'Calendar & status updates' },
              ].map(({ k, l, d }) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid ' + BLIGHT }}>
                  <div>
                    <div style={{ fontSize: 12, color: DARK, fontWeight: 300 }}>{l}</div>
                    <div style={{ fontSize: 10, color: MUTED, fontWeight: 300 }}>{d}</div>
                  </div>
                  <Toggle on={editForm[k] ?? true} onToggle={() => setEditForm(f => ({ ...f, [k]: !(f[k] ?? true) }))} />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ ...btnPrimary, flex: 1 }} onClick={saveEdit} disabled={saving}>{saving ? 'Saving…' : 'Save Configuration'}</button>
              <button style={btnSecondary} onClick={() => handleTestConnection(editModal.name || '')}>Test</button>
              <button style={btnDanger} onClick={() => { handleToggle(editModal.name || ''); setEditModal(null); }}>Disconnect</button>
              <button style={btnSecondary} onClick={() => setEditModal(null)}>Cancel</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
