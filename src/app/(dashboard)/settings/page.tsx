'use client';

import { useState, useEffect } from 'react';
import { IconSettings, IconUser, IconBell, IconShield, IconBot, IconZap, IconGlobe, IconCreditCard, IconX } from '@/components/icons';
import { useToast } from '@/components/ui/toast';
import { useCreditSummary, useApiHealth } from '@/lib/data-provider';
import { ApiStatusPanel, DataSourceBadge } from '@/components/shared/api-status';
import { Modal } from '@/components/ui/modal';

type Section = 'general' | 'roles' | 'notifications' | 'explorers' | 'security' | 'api' | 'billing';

const INITIAL_MEMBERS = [
  { name: 'Tawanda M.', email: 'tawanda@taltas.ai', role: 'admin', status: 'Active', avatar: 'TM' },
  { name: 'Julia Martinez', email: 'julia@taltas.ai', role: 'manager', status: 'Active', avatar: 'JM' },
  { name: 'David Park', email: 'david@taltas.ai', role: 'recruiter', status: 'Active', avatar: 'DP' },
  { name: 'Aisha Patel', email: 'aisha@taltas.ai', role: 'recruiter', status: 'Active', avatar: 'AP' },
  { name: 'Carlos Reyes', email: 'carlos@taltas.ai', role: 'viewer', status: 'Invited', avatar: 'CR' },
];

const DEFAULT_PERMS: Record<string, Record<string, boolean>> = {
  admin: { viewCandidates: true, editCandidates: true, managePipeline: true, configExplorers: true, manageIntegrations: true, viewReports: true, exportData: true, manageTeam: true, billing: true, apiAccess: true },
  manager: { viewCandidates: true, editCandidates: true, managePipeline: true, configExplorers: true, manageIntegrations: false, viewReports: true, exportData: true, manageTeam: false, billing: false, apiAccess: false },
  recruiter: { viewCandidates: true, editCandidates: true, managePipeline: true, configExplorers: false, manageIntegrations: false, viewReports: true, exportData: false, manageTeam: false, billing: false, apiAccess: false },
  viewer: { viewCandidates: true, editCandidates: false, managePipeline: false, configExplorers: false, manageIntegrations: false, viewReports: true, exportData: false, manageTeam: false, billing: false, apiAccess: false },
};
const ROLE_META: Record<string, { label: string; cls: string }> = { admin: { label: 'Admin', cls: 'perm-admin' }, manager: { label: 'Hiring Manager', cls: 'perm-manager' }, recruiter: { label: 'Recruiter', cls: 'perm-recruiter' }, viewer: { label: 'Viewer', cls: 'perm-viewer' } };
const PERM_LABELS: Record<string, string> = { viewCandidates: 'View Candidates', editCandidates: 'Edit Candidates', managePipeline: 'Manage Pipeline', configExplorers: 'Configure Explorers', manageIntegrations: 'Manage Integrations', viewReports: 'View Reports', exportData: 'Export Data', manageTeam: 'Manage Team', billing: 'Billing & Plans', apiAccess: 'API Access' };
function formatCard(num: string) { return num.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19); }

export default function SettingsPage() {
  const toast = useToast();
  const [section, setSection] = useState<Section>('general');
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [rolePerms, setRolePerms] = useState<Record<string, Record<string, boolean>>>(JSON.parse(JSON.stringify(DEFAULT_PERMS)));
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardForm, setCardForm] = useState({ number: '', expiry: '', cvc: '', name: '', zip: '' });
  const [savedCard, setSavedCard] = useState({ last4: '4242', brand: 'VISA', expiry: '08/2027' });
  const [currentPlan, setCurrentPlan] = useState('Professional');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [apiCredits, setApiCredits] = useState(12.20);
  const [customTopUp, setCustomTopUp] = useState('');
  /* Issue 8: Editable API fields */
  const [apiKey, setApiKey] = useState('tlts_prod_••••••••••••••••k7x9');
  const [apiKeyRevealed, setApiKeyRevealed] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://api.taltas.ai/webhooks/recruiter');
  const [apiEvents, setApiEvents] = useState({ candidateCreated: true, candidateAdvanced: true, explorerConversation: true, interviewScheduled: true, offerSent: true, offerAccepted: true, snapComplete: false, agentError: false });
  const [editingApiKey, setEditingApiKey] = useState(false);
  const [newApiKeyValue, setNewApiKeyValue] = useState('');

  const [settings, setSettings] = useState({
    companyName: 'Boston Tech Labs', timezone: 'America/New_York', language: 'en',
    defaultPipeline: '7-stage', autoArchiveDays: '90', theme: typeof document !== 'undefined' ? (document.documentElement.getAttribute('data-theme') || 'light') : 'light',
    emailNotifs: true, slackNotifs: true, agentAlerts: true, weeklyDigest: true,
    interviewReminders: true, offerAlerts: true, a2aNotifs: true, systemAlerts: true,
    explorerAutoMode: true, maxConvPerDay: '100', requireApproval: false,
    deepMatchThreshold: '75', autoAdvanceScore: '90', sentimentTracking: true,
    twoFactor: false, ssoEnabled: false, sessionTimeout: '24', ipWhitelist: false,
    auditLog: true, dataRetention: '365',
  });

  /* Issue 3: Actually apply theme changes */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    if (settings.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  }, [settings.theme]);

  const toggle = (k: string) => setSettings(s => ({ ...s, [k]: !(s as any)[k] }));
  const togglePerm = (role: string, perm: string) => {
    if (role === 'admin') { toast.show('Admin permissions cannot be modified', 'error'); return; }
    setRolePerms(prev => ({ ...prev, [role]: { ...prev[role], [perm]: !prev[role][perm] } }));
    toast.show('Permission updated for ' + (ROLE_META[role]?.label || role));
  };
  const updateMemberRole = (email: string, newRole: string) => { setMembers(prev => prev.map(m => m.email === email ? { ...m, role: newRole } : m)); toast.show('Role updated to ' + (ROLE_META[newRole]?.label || newRole)); };
  const handleSaveCard = () => {
    const num = cardForm.number.replace(/\s/g, '');
    if (num.length < 16 || !cardForm.expiry || !cardForm.cvc || cardForm.cvc.length < 3) { toast.show('Please complete all card fields', 'error'); return; }
    const brand = num.startsWith('4') ? 'VISA' : num.startsWith('5') ? 'MC' : num.startsWith('3') ? 'AMEX' : 'CARD';
    setSavedCard({ last4: num.slice(-4), brand, expiry: cardForm.expiry });
    setShowCardModal(false); setCardForm({ number: '', expiry: '', cvc: '', name: '', zip: '' });
    toast.show('Payment method updated successfully');
  };
  /* Issue 2: Top up and reduce */
  const topUp = (amount: number) => { setApiCredits(prev => +(prev + amount).toFixed(2)); toast.show('$' + amount.toFixed(2) + ' credits added'); };
  const reduceCredits = (amount: number) => {
    if (amount > apiCredits) { toast.show('Cannot reduce below $0', 'error'); return; }
    setApiCredits(prev => +(prev - amount).toFixed(2)); toast.show('$' + amount.toFixed(2) + ' credits removed');
  };

  const SECTIONS: Array<{ key: Section; label: string; icon: JSX.Element }> = [
    { key: 'general', label: 'General', icon: <IconSettings size={14} /> },
    { key: 'roles', label: 'Roles & Permissions', icon: <IconShield size={14} /> },
    { key: 'notifications', label: 'Notifications', icon: <IconBell size={14} /> },
    { key: 'explorers', label: 'Explorer Defaults', icon: <IconBot size={14} /> },
    { key: 'security', label: 'Security', icon: <IconShield size={14} /> },
    { key: 'api', label: 'API & Webhooks', icon: <IconGlobe size={14} /> },
    { key: 'billing', label: 'Billing & Plans', icon: <IconCreditCard size={14} /> },
  ];

  return (
    <div className="grid gap-[13px]" style={{ gridTemplateColumns: '220px 1fr' }}>
      <div className="card" style={{ position: 'sticky', top: 100, alignSelf: 'start' }}>
        <div className="text-[15px] font-semibold mb-[12px]" style={{ fontFamily: "'Roboto Slab', serif", color: 'var(--text-bright)' }}>Settings</div>
        {SECTIONS.map(s => (
          <div key={s.key} onClick={() => setSection(s.key)} className="flex items-center gap-[9px] px-[10px] py-[8px] rounded-[7px] cursor-pointer transition-all mb-[2px]" style={{ color: section === s.key ? 'var(--blue)' : 'var(--text-dim)', background: section === s.key ? 'var(--blue-bg)' : 'transparent', fontWeight: section === s.key ? 600 : 400 }}>
            {s.icon} <span className="text-[12px]">{s.label}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-[13px]">
        {section === 'general' && (<><div className="card"><div className="settings-section-title">Workspace</div><div className="grid grid-cols-2 gap-[13px]"><div><label className="form-label">Company Name</label><input className="form-input" value={settings.companyName} onChange={e => setSettings(s => ({ ...s, companyName: e.target.value }))} /></div><div><label className="form-label">Default Timezone</label><select className="form-select" value={settings.timezone} onChange={e => setSettings(s => ({ ...s, timezone: e.target.value }))}><option value="America/New_York">Eastern (ET)</option><option value="America/Chicago">Central (CT)</option><option value="America/Denver">Mountain (MT)</option><option value="America/Los_Angeles">Pacific (PT)</option><option value="UTC">UTC</option></select></div><div><label className="form-label">Language</label><select className="form-select" value={settings.language} onChange={e => setSettings(s => ({ ...s, language: e.target.value }))}><option value="en">English</option><option value="es">Spanish</option><option value="fr">French</option></select></div><div><label className="form-label">Theme</label><select className="form-select" value={settings.theme} onChange={e => { setSettings(s => ({ ...s, theme: e.target.value })); toast.show('Theme changed to ' + e.target.value); }}><option value="dark">Dark</option><option value="light">Light</option><option value="system">System</option></select></div></div></div><div className="card"><div className="settings-section-title">Pipeline Configuration</div><div className="grid grid-cols-2 gap-[13px]"><div><label className="form-label">Default Pipeline</label><select className="form-select" value={settings.defaultPipeline} onChange={e => setSettings(s => ({ ...s, defaultPipeline: e.target.value }))}><option value="7-stage">7-Stage (Applied → Offer)</option><option value="5-stage">5-Stage (Simplified)</option><option value="custom">Custom</option></select></div><div><label className="form-label">Auto-Archive (days inactive)</label><input className="form-input" type="number" value={settings.autoArchiveDays} onChange={e => setSettings(s => ({ ...s, autoArchiveDays: e.target.value }))} /></div></div></div></>)}

        {section === 'roles' && (<><div className="card"><div className="flex items-center justify-between mb-[14px]"><div className="settings-section-title" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>Team Members</div><button className="ctrl-btn blue" style={{ fontSize: '9px' }} onClick={() => toast.show('Invitation email sent!')}>+ Invite Member</button></div><div className="overflow-x-auto"><table className="cand-table" style={{ minWidth: 0 }}><thead><tr><th>Member</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody>{members.map(m => (<tr key={m.email}><td><div className="flex items-center gap-[8px]"><div className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center font-mono text-[9px] font-bold flex-shrink-0" style={{ background: 'var(--blue-bg)', color: 'var(--blue)', border: '1px solid var(--blue-border)' }}>{m.avatar}</div><span className="text-[12px] font-medium" style={{ color: 'var(--text-bright)' }}>{m.name}</span></div></td><td className="font-mono text-[10px]" style={{ color: 'var(--text-dim)' }}>{m.email}</td><td><span className={`perm-badge ${ROLE_META[m.role]?.cls}`}>{ROLE_META[m.role]?.label}</span></td><td><span className="font-mono text-[9px]" style={{ color: m.status === 'Active' ? 'var(--green)' : 'var(--orange)' }}>{m.status}</span></td><td><select className="filter-select" style={{ fontSize: '9px', padding: '3px 6px' }} value={m.role} onChange={e => updateMemberRole(m.email, e.target.value)}><option value="admin">Admin</option><option value="manager">Hiring Manager</option><option value="recruiter">Recruiter</option><option value="viewer">Viewer</option></select></td></tr>))}</tbody></table></div></div>
          <div className="card"><div className="settings-section-title">Role Permissions Matrix</div><div className="font-mono text-[9px] mb-[10px] p-[8px] rounded-[6px]" style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>Click checkmarks to toggle permissions. Admin permissions are locked.</div><div className="overflow-x-auto"><table className="cand-table" style={{ minWidth: 0 }}><thead><tr><th>Permission</th>{Object.entries(ROLE_META).map(([k, r]) => <th key={k}><span className={`perm-badge ${r.cls}`}>{r.label}</span></th>)}</tr></thead><tbody>{Object.entries(PERM_LABELS).map(([pk, label]) => (<tr key={pk}><td className="text-[11px]" style={{ color: 'var(--text-mid)' }}>{label}</td>{Object.keys(ROLE_META).map(rk => (<td key={rk} className="text-center"><button onClick={() => togglePerm(rk, pk)} style={{ background: 'none', border: 'none', cursor: rk === 'admin' ? 'not-allowed' : 'pointer', opacity: rk === 'admin' ? 0.6 : 1, padding: 2 }}>{rolePerms[rk]?.[pk] ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--border2)" strokeWidth="2"><line x1="5" y1="5" x2="19" y2="19" /></svg>}</button></td>))}</tr>))}</tbody></table></div></div>
        </>)}

        {section === 'notifications' && (<div className="card"><div className="settings-section-title">Notification Preferences</div>{[{ k: 'emailNotifs', label: 'Email Notifications', desc: 'Receive email for important updates' },{ k: 'slackNotifs', label: 'Slack Notifications', desc: 'Post updates to Slack' },{ k: 'agentAlerts', label: 'Explorer Agent Alerts', desc: 'High-signal candidate alerts' },{ k: 'a2aNotifs', label: 'Agent-to-Agent Updates', desc: 'A2A session outcomes' },{ k: 'weeklyDigest', label: 'Weekly Digest', desc: 'Monday summary email' },{ k: 'interviewReminders', label: 'Interview Reminders', desc: '15-min before scheduled' },{ k: 'offerAlerts', label: 'Offer Status Alerts', desc: 'Offers accepted or declined' },{ k: 'systemAlerts', label: 'System Alerts', desc: 'Integration errors, sync failures' }].map(({ k, label, desc }) => (<div key={k} className="settings-row"><div><div className="text-[12px] font-medium" style={{ color: 'var(--text-bright)' }}>{label}</div><div className="text-[10px]" style={{ color: 'var(--muted)' }}>{desc}</div></div><button onClick={() => { toggle(k); toast.show(label + ((settings as any)[k] ? ' disabled' : ' enabled')); }} className={`settings-toggle ${(settings as any)[k] ? 'on' : 'off'}`} /></div>))}</div>)}

        {section === 'explorers' && (<div className="card"><div className="settings-section-title">Explorer Defaults</div>{[{ k: 'explorerAutoMode', label: 'Default to AUTO Mode', desc: 'New explorers start autonomous' },{ k: 'requireApproval', label: 'Require Approval', desc: 'Human approval before advance' },{ k: 'sentimentTracking', label: 'Sentiment Tracking', desc: 'Track conversation sentiment' }].map(({ k, label, desc }) => (<div key={k} className="settings-row"><div><div className="text-[12px] font-medium" style={{ color: 'var(--text-bright)' }}>{label}</div><div className="text-[10px]" style={{ color: 'var(--muted)' }}>{desc}</div></div><button onClick={() => { toggle(k); toast.show(label + ((settings as any)[k] ? ' disabled' : ' enabled')); }} className={`settings-toggle ${(settings as any)[k] ? 'on' : 'off'}`} /></div>))}<div className="grid grid-cols-2 gap-[13px] mt-[14px] pt-[14px]" style={{ borderTop: '1px solid var(--border)' }}><div><label className="form-label">Max Conversations / Day</label><input className="form-input" type="number" value={settings.maxConvPerDay} onChange={e => setSettings(s => ({ ...s, maxConvPerDay: e.target.value }))} /></div><div><label className="form-label">Deep Match Threshold</label><input className="form-input" type="number" value={settings.deepMatchThreshold} onChange={e => setSettings(s => ({ ...s, deepMatchThreshold: e.target.value }))} /></div><div><label className="form-label">Auto-Advance Score</label><input className="form-input" type="number" value={settings.autoAdvanceScore} onChange={e => setSettings(s => ({ ...s, autoAdvanceScore: e.target.value }))} /></div></div></div>)}

        {section === 'security' && (<div className="card"><div className="settings-section-title">Security & Access</div>{[{ k: 'twoFactor', label: 'Two-Factor Authentication', desc: 'Require 2FA for all' },{ k: 'ssoEnabled', label: 'SSO / SAML', desc: 'Single sign-on' },{ k: 'ipWhitelist', label: 'IP Whitelist', desc: 'Restrict to approved IPs' },{ k: 'auditLog', label: 'Audit Logging', desc: 'Log all actions' }].map(({ k, label, desc }) => (<div key={k} className="settings-row"><div><div className="text-[12px] font-medium" style={{ color: 'var(--text-bright)' }}>{label}</div><div className="text-[10px]" style={{ color: 'var(--muted)' }}>{desc}</div></div><button onClick={() => { toggle(k); toast.show(label + ((settings as any)[k] ? ' disabled' : ' enabled')); }} className={`settings-toggle ${(settings as any)[k] ? 'on' : 'off'}`} /></div>))}<div className="grid grid-cols-2 gap-[13px] mt-[14px] pt-[14px]" style={{ borderTop: '1px solid var(--border)' }}><div><label className="form-label">Session Timeout (hours)</label><input className="form-input" type="number" value={settings.sessionTimeout} onChange={e => setSettings(s => ({ ...s, sessionTimeout: e.target.value }))} /></div><div><label className="form-label">Data Retention (days)</label><input className="form-input" type="number" value={settings.dataRetention} onChange={e => setSettings(s => ({ ...s, dataRetention: e.target.value }))} /></div></div></div>)}

        {/* Issue 8: Full editable API section */}
        {section === 'api' && (<div className="flex flex-col gap-[12px]">
          <ApiStatusPanel />
          <div className="card"><div className="settings-section-title">API Keys</div>
            <div className="p-[14px] rounded-[9px] mb-[12px]" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-[6px]"><span className="text-[11px] font-medium" style={{ color: 'var(--text-bright)' }}>Production API Key</span><div className="flex gap-[4px]"><button className="ctrl-btn" style={{ fontSize: '8px' }} onClick={() => setApiKeyRevealed(!apiKeyRevealed)}>{apiKeyRevealed ? 'Hide' : 'Reveal'}</button><button className="ctrl-btn" style={{ fontSize: '8px' }} onClick={() => setEditingApiKey(true)}>Edit</button><button className="ctrl-btn" style={{ fontSize: '8px', color: 'var(--orange)' }} onClick={() => { setApiKey('tlts_prod_' + Math.random().toString(36).slice(2, 18)); toast.show('API key regenerated — update your integrations'); }}>Regenerate</button></div></div>
              {editingApiKey ? (<div className="flex gap-[6px]"><input className="form-input flex-1" value={newApiKeyValue} onChange={e => setNewApiKeyValue(e.target.value)} placeholder="Enter new API key" style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 11 }} /><button className="ctrl-btn run" style={{ fontSize: 9 }} onClick={() => { if (newApiKeyValue.trim()) { setApiKey(newApiKeyValue.trim()); setEditingApiKey(false); setNewApiKeyValue(''); toast.show('API key updated'); } }}>Save</button><button className="ctrl-btn" style={{ fontSize: 9 }} onClick={() => { setEditingApiKey(false); setNewApiKeyValue(''); }}>Cancel</button></div>
              ) : (<div className="font-mono text-[10px] p-[8px] rounded-[6px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-dim)' }}>{apiKeyRevealed ? apiKey : apiKey.replace(/[a-z0-9]/gi, (c, i) => i > 9 && i < apiKey.length - 4 ? '•' : c)}</div>)}
            </div>
            <div className="p-[14px] rounded-[9px] mb-[12px]" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-[6px]"><span className="text-[11px] font-medium" style={{ color: 'var(--text-bright)' }}>Staging API Key</span><button className="ctrl-btn" style={{ fontSize: '8px' }} onClick={() => toast.show('Staging key copied to clipboard')}>Copy</button></div>
              <div className="font-mono text-[10px] p-[8px] rounded-[6px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-dim)' }}>tlts_stg_••••••••••••••••m3q7</div>
            </div>
          </div>
          <div className="card"><div className="settings-section-title">Webhooks</div>
            <div className="p-[14px] rounded-[9px] mb-[12px]" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-[6px]"><span className="text-[11px] font-medium" style={{ color: 'var(--text-bright)' }}>Webhook URL</span><div className="flex gap-[4px]"><button className="ctrl-btn blue" style={{ fontSize: '8px' }} onClick={() => toast.show('Webhook test dispatched — check your endpoint')}>Test</button></div></div>
              <input className="form-input" style={{ fontSize: '11px', fontFamily: "'Roboto Mono', monospace" }} value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} />
            </div>
            <div className="settings-section-title" style={{ fontSize: 11, marginBottom: 8 }}>Event Subscriptions</div>
            {[{ k: 'candidateCreated', l: 'candidate.created', d: 'New candidate enters pipeline' },{ k: 'candidateAdvanced', l: 'candidate.advanced', d: 'Candidate moves to next stage' },{ k: 'explorerConversation', l: 'explorer.conversation', d: 'Explorer agent conversation completed' },{ k: 'interviewScheduled', l: 'interview.scheduled', d: 'Interview booked' },{ k: 'offerSent', l: 'offer.sent', d: 'Offer letter dispatched' },{ k: 'offerAccepted', l: 'offer.accepted', d: 'Candidate accepted offer' },{ k: 'snapComplete', l: 'snap.complete', d: 'A2A SNAP session finished' },{ k: 'agentError', l: 'agent.error', d: 'Explorer agent encountered an error' }].map(({ k, l, d }) => (
              <div key={k} className="flex items-center justify-between py-[6px]" style={{ borderBottom: '1px solid var(--border)' }}><div><code className="font-mono text-[10px]" style={{ color: 'var(--blue)' }}>{l}</code><div className="text-[9px]" style={{ color: 'var(--muted)' }}>{d}</div></div><button onClick={() => { setApiEvents(prev => ({ ...prev, [k]: !prev[k as keyof typeof prev] })); toast.show(l + ((apiEvents as any)[k] ? ' unsubscribed' : ' subscribed')); }} className={`settings-toggle ${(apiEvents as any)[k] ? 'on' : 'off'}`} /></div>
            ))}
          </div>
        </div>)}

        {section === 'billing' && (<div className="flex flex-col gap-[12px]">
          <div className="card"><div className="settings-section-title">Current Plan</div><div className="p-[20px] rounded-[10px] mb-[12px]" style={{ background: 'linear-gradient(135deg, var(--blue-bg), #eff6ff)', border: '1px solid var(--blue-border)' }}><div className="flex items-center justify-between mb-[10px]"><div><div className="text-[18px] font-bold" style={{ fontFamily: "'Roboto Slab', serif", color: 'var(--blue)' }}>{currentPlan}</div><div className="font-mono text-[9px]" style={{ color: 'var(--muted)' }}>Billed monthly · Renews Mar 15, 2026</div></div><div className="text-right"><div className="text-[24px] font-bold" style={{ fontFamily: "'Roboto Slab', serif", color: 'var(--text-bright)' }}>$299<span className="text-[12px] font-normal" style={{ color: 'var(--muted)' }}>/mo</span></div></div></div><div className="flex gap-[16px] flex-wrap">{[{ l: 'Explorers', v: '5 active', used: 3 },{ l: 'Conversations/mo', v: '2,000', used: 847 },{ l: 'Team seats', v: '10', used: 5 }].map(m => (<div key={m.l} className="flex-1 min-w-[120px]"><div className="flex justify-between mb-[3px]"><span className="font-mono text-[8px]" style={{ color: 'var(--muted)' }}>{m.l}</span><span className="font-mono text-[8px] font-bold" style={{ color: 'var(--text-dim)' }}>{m.used} / {m.v}</span></div><div className="h-[4px] rounded-[2px] overflow-hidden" style={{ background: 'var(--border)' }}><div className="h-full rounded-[2px]" style={{ width: (m.used / parseInt(m.v.replace(/,/g, '')) * 100) + '%', background: 'var(--blue)' }} /></div></div>))}</div></div><div className="flex gap-[8px]"><button className="ctrl-btn blue" onClick={() => toast.show('Contact sales@taltas.ai for upgrades')}>Upgrade Plan</button><button className="ctrl-btn" onClick={() => { const next = billingPeriod === 'monthly' ? 'annual' : 'monthly'; setBillingPeriod(next); toast.show(next === 'annual' ? 'Switched to annual billing — 20% saved! New rate: $239/mo' : 'Switched back to monthly billing — $299/mo'); }}>{billingPeriod === 'monthly' ? 'Switch to Annual (Save 20%)' : 'Switch to Monthly'}</button></div></div>
          <div className="card"><div className="settings-section-title">Available Plans</div><div className="grid gap-[10px]" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>{[{ name: 'Starter', price: '$99', period: '/mo', features: ['2 Explorers','500 conv/mo','3 seats','Basic analytics'], current: false },{ name: 'Professional', price: '$299', period: '/mo', features: ['5 Explorers','2,000 conv/mo','10 seats','Full analytics & A2A','API access'], current: true },{ name: 'Enterprise', price: 'Custom', period: '', features: ['Unlimited Explorers','Unlimited conv','Unlimited seats','Dedicated support','Custom integrations','SLA'], current: false }].map(p => (<div key={p.name} className="p-[16px] rounded-[10px]" style={{ border: p.current ? '2px solid var(--blue)' : '1px solid var(--border)', background: p.current ? 'var(--blue-bg)' : 'var(--surface2)' }}>{p.current && <div className="font-mono text-[8px] font-bold mb-[6px]" style={{ color: 'var(--blue)' }}>CURRENT PLAN</div>}<div className="text-[15px] font-semibold mb-[2px]" style={{ color: 'var(--text-bright)' }}>{p.name}</div><div className="text-[22px] font-bold mb-[10px]" style={{ fontFamily: "'Roboto Slab', serif", color: 'var(--text-bright)' }}>{p.price}<span className="text-[11px] font-normal" style={{ color: 'var(--muted)' }}>{p.period}</span></div>{p.features.map(f => (<div key={f} className="text-[10.5px] mb-[5px] flex items-center gap-[5px]" style={{ color: 'var(--text-mid)' }}><span style={{ color: 'var(--green)', fontSize: 10 }}>✓</span> {f}</div>))}<button className={'ctrl-btn ' + (p.current ? '' : p.name === 'Enterprise' ? 'purple' : 'blue') + ' w-full mt-[10px]'} style={{ textAlign: 'center', display: 'block' }} onClick={() => { if (p.current) toast.show("You're on the " + p.name + " plan"); else if (p.name === 'Enterprise') toast.show('Sales team will reach out — sales@taltas.ai'); else { setCurrentPlan(p.name); toast.show('Upgraded to ' + p.name + '!'); } }}>{p.current ? 'Current' : p.name === 'Enterprise' ? 'Contact Sales' : 'Upgrade'}</button></div>))}</div></div>
          {/* Issue 2: Payment + credits with reduce/custom amount */}
          <div className="card"><div className="settings-section-title">Payment Method & Balance</div><div className="grid gap-[12px]" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="p-[14px] rounded-[9px]" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}><div className="font-mono text-[8.5px] uppercase tracking-[.1em] mb-[8px]" style={{ color: 'var(--muted)' }}>Payment Method</div><div className="flex items-center gap-[10px]"><div className="w-[40px] h-[26px] rounded-[4px] flex items-center justify-center font-mono text-[8px] font-bold" style={{ background: '#1a1f36', color: '#fff' }}>{savedCard.brand}</div><div><div className="text-[12px] font-medium" style={{ color: 'var(--text-bright)' }}>•••• •••• •••• {savedCard.last4}</div><div className="font-mono text-[9px]" style={{ color: 'var(--muted)' }}>Expires {savedCard.expiry}</div></div></div><button className="ctrl-btn mt-[10px]" style={{ fontSize: '9px' }} onClick={() => setShowCardModal(true)}>Update Card</button></div>
            <div className="p-[14px] rounded-[9px]" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}><div className="font-mono text-[8.5px] uppercase tracking-[.1em] mb-[8px]" style={{ color: 'var(--muted)' }}>Explorer API Credits</div><div className="flex items-center justify-between mb-[6px]"><span className="text-[22px] font-bold" style={{ fontFamily: "'Roboto Slab', serif", color: apiCredits < 15 ? 'var(--orange)' : 'var(--green)' }}>${apiCredits.toFixed(2)}</span><span className="font-mono text-[9px]" style={{ color: 'var(--muted)' }}>of $55.00 budget</span></div><div className="h-[5px] rounded-[3px] overflow-hidden mb-[8px]" style={{ background: 'var(--border)' }}><div className="h-full rounded-[3px]" style={{ width: Math.min(100, (apiCredits / 55) * 100) + '%', background: apiCredits < 15 ? 'var(--orange)' : 'var(--green)' }} /></div>
              <div className="font-mono text-[8px] mb-[4px]" style={{ color: 'var(--muted)' }}>ADD CREDITS</div>
              <div className="flex gap-[4px] mb-[6px]"><button className="ctrl-btn run" style={{ fontSize: '8px' }} onClick={() => topUp(25)}>+ $25</button><button className="ctrl-btn blue" style={{ fontSize: '8px' }} onClick={() => topUp(50)}>+ $50</button><button className="ctrl-btn" style={{ fontSize: '8px' }} onClick={() => topUp(100)}>+ $100</button></div>
              <div className="font-mono text-[8px] mb-[4px]" style={{ color: 'var(--muted)' }}>REMOVE CREDITS</div>
              <div className="flex gap-[4px] mb-[6px]"><button className="ctrl-btn" style={{ fontSize: '8px', color: 'var(--orange)' }} onClick={() => reduceCredits(25)}>− $25</button><button className="ctrl-btn" style={{ fontSize: '8px', color: 'var(--orange)' }} onClick={() => reduceCredits(50)}>− $50</button><button className="ctrl-btn" style={{ fontSize: '8px', color: 'var(--orange)' }} onClick={() => reduceCredits(100)}>− $100</button></div>
              <div className="flex gap-[4px] items-center"><input className="form-input" type="number" min="0" step="5" placeholder="Custom $" value={customTopUp} onChange={e => setCustomTopUp(e.target.value)} style={{ fontSize: 10, width: 80, padding: '3px 6px' }} /><button className="ctrl-btn run" style={{ fontSize: '8px' }} onClick={() => { const v = parseFloat(customTopUp); if (v > 0) { topUp(v); setCustomTopUp(''); } else toast.show('Enter a valid amount', 'error'); }}>Add</button><button className="ctrl-btn" style={{ fontSize: '8px', color: 'var(--orange)' }} onClick={() => { const v = parseFloat(customTopUp); if (v > 0) { reduceCredits(v); setCustomTopUp(''); } else toast.show('Enter an amount to remove', 'error'); }}>Remove</button></div>
            </div>
          </div></div>
          <div className="card"><div className="settings-section-title">Billing History</div><table className="cand-table" style={{ minWidth: 0 }}><thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Status</th><th>Invoice</th></tr></thead><tbody>{[{ date: 'Feb 15, 2026', desc: 'Professional Plan — Monthly', amount: '$299.00', status: 'Paid' },{ date: 'Feb 12, 2026', desc: 'API Credit Top-Up', amount: '$55.00', status: 'Paid' },{ date: 'Jan 15, 2026', desc: 'Professional Plan — Monthly', amount: '$299.00', status: 'Paid' },{ date: 'Jan 8, 2026', desc: 'API Credit Top-Up', amount: '$50.00', status: 'Paid' },{ date: 'Dec 15, 2025', desc: 'Professional Plan — Monthly', amount: '$299.00', status: 'Paid' }].map((r, i) => (<tr key={i}><td className="font-mono text-[10px]" style={{ color: 'var(--text-dim)' }}>{r.date}</td><td className="text-[11px]" style={{ color: 'var(--text-bright)' }}>{r.desc}</td><td className="font-mono text-[11px] font-semibold" style={{ color: 'var(--text-bright)' }}>{r.amount}</td><td><span className="font-mono text-[8px] px-[6px] py-[2px] rounded" style={{ color: 'var(--green)', background: 'var(--green-bg)', border: '1px solid var(--green-border)' }}>{r.status}</span></td><td><button className="ctrl-btn" style={{ fontSize: '8px', padding: '2px 6px' }} onClick={() => toast.show('Downloading ' + r.date + ' invoice...')}>PDF</button></td></tr>))}</tbody></table></div>
        </div>)}

        <div className="flex justify-end"><button className="ctrl-btn run" style={{ fontSize: '11px', padding: '8px 20px' }} onClick={() => toast.show('Settings saved!')}><IconZap size={10} className="inline mr-[4px]" /> Save Changes</button></div>
      </div>

      <Modal open={showCardModal} onClose={() => setShowCardModal(false)} maxWidth="420px">
        <div className="text-[16px] font-semibold mb-[4px]" style={{ fontFamily: "'Roboto Slab', serif", color: 'var(--text-bright)' }}>Update Payment Method</div>
        <div className="font-mono text-[9px] mb-[16px]" style={{ color: 'var(--muted)' }}>Card information is encrypted end-to-end</div>
        <div style={{ marginBottom: 12 }}><label className="form-label">Card Number</label><input className="form-input" placeholder="1234 5678 9012 3456" value={cardForm.number} onChange={e => setCardForm(f => ({ ...f, number: formatCard(e.target.value) }))} maxLength={19} style={{ fontSize: 13, letterSpacing: '.05em', fontFamily: "'Roboto Mono', monospace" }} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}><div><label className="form-label">Expiry (MM/YY)</label><input className="form-input" placeholder="08/27" value={cardForm.expiry} onChange={e => { let v = e.target.value.replace(/\D/g, '').slice(0, 4); if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2); setCardForm(f => ({ ...f, expiry: v })); }} maxLength={5} /></div><div><label className="form-label">CVC</label><input className="form-input" placeholder="123" type="password" value={cardForm.cvc} onChange={e => setCardForm(f => ({ ...f, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) }))} maxLength={4} /></div></div>
        <div style={{ marginBottom: 12 }}><label className="form-label">Cardholder Name</label><input className="form-input" placeholder="Full name on card" value={cardForm.name} onChange={e => setCardForm(f => ({ ...f, name: e.target.value }))} /></div>
        <div style={{ marginBottom: 16 }}><label className="form-label">Billing ZIP</label><input className="form-input" placeholder="02101" value={cardForm.zip} onChange={e => setCardForm(f => ({ ...f, zip: e.target.value }))} maxLength={10} /></div>
        <div className="flex gap-[8px]"><button className="ctrl-btn run" style={{ flex: 1, fontSize: 11, padding: '9px 16px', textAlign: 'center' }} onClick={handleSaveCard}>Save Card</button><button className="ctrl-btn" style={{ fontSize: 11, padding: '9px 16px' }} onClick={() => setShowCardModal(false)}>Cancel</button></div>
        <div className="font-mono text-[8px] text-center mt-[10px]" style={{ color: 'var(--muted)' }}>🔒 TLS 1.3 · PCI DSS Level 1</div>
      </Modal>
    </div>
  );
}
