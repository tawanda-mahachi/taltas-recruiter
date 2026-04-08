// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast';
import { useCreditSummary, useApiHealth } from '@/lib/data-provider';
import { ApiStatusPanel, DataSourceBadge } from '@/components/shared/api-status';
import { Modal } from '@/components/ui/modal';

const F      = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const BLUE   = '#2563eb';
const TEAL   = '#1D9E75';
const DARK   = '#0A0A0A';
const MID    = '#6B6B6B';
const MUTED  = '#AAAAAA';
const BORDER = '#E8E8E5';
const BLIGHT = '#F4F4F2';
const RED    = '#CC3300';
const AMBER  = '#D97706';

type Section = 'general' | 'roles' | 'notifications' | 'explorers' | 'security' | 'api' | 'billing' | 'snap' | 'branding';

const INITIAL_MEMBERS = [
  { name: 'Tawanda M.',    email: 'tawanda@taltas.ai', role: 'admin',     status: 'Active', avatar: 'TM' },
  { name: 'Julia Martinez',email: 'julia@taltas.ai',   role: 'manager',   status: 'Active', avatar: 'JM' },
  { name: 'David Park',    email: 'david@taltas.ai',   role: 'recruiter', status: 'Active', avatar: 'DP' },
  { name: 'Aisha Patel',   email: 'aisha@taltas.ai',   role: 'recruiter', status: 'Active', avatar: 'AP' },
  { name: 'Carlos Reyes',  email: 'carlos@taltas.ai',  role: 'viewer',    status: 'Invited',avatar: 'CR' },
];

const DEFAULT_PERMS: Record<string, Record<string, boolean>> = {
  admin:     { viewCandidates:true, editCandidates:true, managePipeline:true, configExplorers:true, manageIntegrations:true, viewReports:true, exportData:true, manageTeam:true, billing:true, apiAccess:true },
  manager:   { viewCandidates:true, editCandidates:true, managePipeline:true, configExplorers:true, manageIntegrations:false,viewReports:true, exportData:true, manageTeam:false,billing:false,apiAccess:false},
  recruiter: { viewCandidates:true, editCandidates:true, managePipeline:true, configExplorers:false,manageIntegrations:false,viewReports:true, exportData:false,manageTeam:false,billing:false,apiAccess:false},
  viewer:    { viewCandidates:true, editCandidates:false,managePipeline:false,configExplorers:false,manageIntegrations:false,viewReports:true, exportData:false,manageTeam:false,billing:false,apiAccess:false},
};
const ROLE_META: Record<string, { label: string }> = {
  admin:     { label: 'Admin' },
  manager:   { label: 'Hiring Manager' },
  recruiter: { label: 'Recruiter' },
  viewer:    { label: 'Viewer' },
};
const PERM_LABELS: Record<string, string> = {
  viewCandidates:'View Candidates', editCandidates:'Edit Candidates', managePipeline:'Manage Pipeline',
  configExplorers:'Configure Explorers', manageIntegrations:'Manage Integrations', viewReports:'View Reports',
  exportData:'Export Data', manageTeam:'Manage Team', billing:'Billing & Plans', apiAccess:'API Access',
};

function formatCard(num: string) { return num.replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim().slice(0,19); }

// ── UI Primitives ──
function Toggle({ on, onToggle }: { on: boolean; onToggle: ()=>void }) {
  return (
    <div onClick={onToggle} style={{ width:36, height:20, background:on?TEAL:BORDER, borderRadius:10, position:'relative', cursor:'pointer', transition:'background .2s', flexShrink:0 }}>
      <div style={{ position:'absolute', width:14, height:14, background:'#fff', borderRadius:'50%', top:3, left:on?19:3, transition:'left .2s' }} />
    </div>
  );
}

function SL({ label, color = TEAL, children }: any) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:14, fontFamily:F }}>
      <div style={{ width:6, height:6, borderRadius:'50%', background:color, flexShrink:0 }} />
      <span style={{ fontSize:9, color:MUTED, letterSpacing:'.1em', textTransform:'uppercase', fontWeight:400, flex:1 }}>{label}</span>
      {children}
    </div>
  );
}

function FieldRow({ label, hint, children }: any) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'200px 1fr', gap:32, alignItems:'start', padding:'16px 0', borderBottom:'1px solid '+BLIGHT }}>
      <div>
        <div style={{ fontSize:12, color:DARK, fontWeight:400, marginBottom:3, fontFamily:F }}>{label}</div>
        {hint && <div style={{ fontSize:10, color:MUTED, fontWeight:300, lineHeight:1.5 }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Input({ value, onChange, type='text', placeholder='' }: any) {
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    style={{ width:'100%', padding:'7px 10px', border:'1px solid '+BORDER, fontFamily:F, fontSize:13, color:DARK, outline:'none' }} />;
}

function Select({ value, onChange, options }: any) {
  return (
    <select value={value} onChange={onChange}
      style={{ width:'100%', padding:'7px 10px', border:'1px solid '+BORDER, fontFamily:F, fontSize:13, color:MID, background:'#fff', outline:'none', cursor:'pointer', appearance:'none' }}>
      {options.map((o: any) => typeof o === 'string' ? <option key={o}>{o}</option> : <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );
}

function NotifRow({ label, desc, on, onToggle }: any) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid '+BLIGHT }}>
      <div>
        <div style={{ fontSize:13, color:DARK, fontWeight:300 }}>{label}</div>
        <div style={{ fontSize:10, color:MUTED, fontWeight:300 }}>{desc}</div>
      </div>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  );
}

function Avatar({ ini, size=28 }: any) {
  const colors = [BLUE, TEAL, '#E84B3A', '#F5A623', '#635BFF'];
  const bg = colors[ini.charCodeAt(0) % colors.length];
  return <div style={{ width:size, height:size, borderRadius:'50%', background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:400, color:'#fff', flexShrink:0 }}>{ini}</div>;
}

export default function SettingsPage() {
  const toast = useToast();
  const [section, setSection] = useState<Section>('general');
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [rolePerms, setRolePerms] = useState<Record<string, Record<string, boolean>>>(JSON.parse(JSON.stringify(DEFAULT_PERMS)));
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardForm, setCardForm] = useState({ number:'', expiry:'', cvc:'', name:'', zip:'' });
  const [savedCard, setSavedCard] = useState({ last4:'4242', brand:'VISA', expiry:'08/2027' });
  const [currentPlan, setCurrentPlan] = useState('Professional');
  const [billingPeriod, setBillingPeriod] = useState<'monthly'|'annual'>('monthly');
  const [apiCredits, setApiCredits] = useState(12.20);
  const [customTopUp, setCustomTopUp] = useState('');
  const [apiKey, setApiKey] = useState('tlts_prod_••••••••••••••••k7x9');
  const [apiKeyRevealed, setApiKeyRevealed] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://api.taltas.ai/webhooks/recruiter');
  const [apiEvents, setApiEvents] = useState({ candidateCreated:true, candidateAdvanced:true, explorerConversation:true, interviewScheduled:true, offerSent:true, offerAccepted:true, snapComplete:false, agentError:false });
  const [editingApiKey, setEditingApiKey] = useState(false);
  const [newApiKeyValue, setNewApiKeyValue] = useState('');

  const [settings, setSettings] = useState({
    companyName:'Boston Tech Labs', timezone:'America/New_York', language:'en',
    defaultPipeline:'7-stage', autoArchiveDays:'90', theme:'light',
    emailNotifs:true, slackNotifs:true, agentAlerts:true, weeklyDigest:true,
    interviewReminders:true, offerAlerts:true, a2aNotifs:true, systemAlerts:true,
    explorerAutoMode:true, maxConvPerDay:'100', requireApproval:false,
    deepMatchThreshold:'75', autoAdvanceScore:'90', sentimentTracking:true,
    twoFactor:false, ssoEnabled:false, sessionTimeout:'24', ipWhitelist:false,
    auditLog:true, dataRetention:'365',
    brandName:'Boston Tech Labs', brandColor:'#2563EB', showTaltasBranding:true,
    snapS:true, snapN:true, snapA:true, snapP:true,
    salaryFlex:'10', deepMatchMin:'75', autoAdvance:'90',
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  const toggle = (k: string) => setSettings(s => ({ ...s, [k]: !(s as any)[k] }));
  const set = (k: string, v: any) => setSettings(s => ({ ...s, [k]: v }));

  const togglePerm = (role: string, perm: string) => {
    if (role === 'admin') { toast.show('Admin permissions cannot be modified', 'error'); return; }
    setRolePerms(prev => ({ ...prev, [role]: { ...prev[role], [perm]: !prev[role][perm] } }));
    toast.show('Permission updated for ' + (ROLE_META[role]?.label || role));
  };
  const updateMemberRole = (email: string, newRole: string) => {
    setMembers(prev => prev.map(m => m.email === email ? { ...m, role: newRole } : m));
    toast.show('Role updated to ' + (ROLE_META[newRole]?.label || newRole));
  };
  const handleSaveCard = () => {
    const num = cardForm.number.replace(/\s/g,'');
    if (num.length < 16 || !cardForm.expiry || !cardForm.cvc || cardForm.cvc.length < 3) { toast.show('Please complete all card fields', 'error'); return; }
    const brand = num.startsWith('4')?'VISA':num.startsWith('5')?'MC':num.startsWith('3')?'AMEX':'CARD';
    setSavedCard({ last4:num.slice(-4), brand, expiry:cardForm.expiry });
    setShowCardModal(false); setCardForm({ number:'', expiry:'', cvc:'', name:'', zip:'' });
    toast.show('Payment method updated successfully');
  };
  const topUp = (amount: number) => { setApiCredits(prev => +(prev+amount).toFixed(2)); toast.show('$' + amount.toFixed(2) + ' credits added'); };
  const reduceCredits = (amount: number) => {
    if (amount > apiCredits) { toast.show('Cannot reduce below $0', 'error'); return; }
    setApiCredits(prev => +(prev-amount).toFixed(2)); toast.show('$' + amount.toFixed(2) + ' credits removed');
  };

  const NAV_ITEMS: { key: Section; label: string; group: string }[] = [
    { key:'general',       label:'General',             group:'Account' },
    { key:'roles',         label:'Roles & Permissions',  group:'Account' },
    { key:'notifications', label:'Notifications',        group:'Account' },
    { key:'branding',      label:'Branding',             group:'Account' },
    { key:'security',      label:'Security',             group:'Platform' },
    { key:'explorers',     label:'Explorer Defaults',    group:'Platform' },
    { key:'snap',          label:'SNAP Protocol',        group:'Platform' },
    { key:'api',           label:'API & Webhooks',       group:'Platform' },
    { key:'billing',       label:'Billing & Plans',      group:'Platform' },
  ];

  const btnPrimary = { padding:'7px 18px', background:BLUE, border:'none', color:'#fff', fontFamily:F, fontSize:12, cursor:'pointer' } as any;
  const btnSecondary = { padding:'7px 18px', background:'none', border:'1px solid '+BORDER, color:MID, fontFamily:F, fontSize:12, cursor:'pointer' } as any;
  const btnDanger = { padding:'7px 18px', background:'none', border:'1px solid #FFDDD8', color:RED, fontFamily:F, fontSize:12, cursor:'pointer' } as any;
  const inputStyle = { width:'100%', padding:'7px 10px', border:'1px solid '+BORDER, fontFamily:F, fontSize:13, color:DARK, outline:'none' } as any;
  const selectStyle = { width:'100%', padding:'7px 10px', border:'1px solid '+BORDER, fontFamily:F, fontSize:13, color:MID, background:'#fff', outline:'none', cursor:'pointer', appearance:'none' as any };

  let lastGroup = '';

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', fontFamily:F, overflow:'hidden' }}>

      {/* PAGE HEADER */}
      <div style={{ padding:'12px 28px', borderBottom:'1px solid '+BORDER, display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <div>
          <div style={{ fontSize:15, fontWeight:400, letterSpacing:'-0.01em', color:DARK }}>Settings</div>
          <div style={{ fontSize:11, color:MUTED, fontWeight:300, marginTop:1 }}>Account, workspace and platform configuration</div>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <button style={btnSecondary} onClick={()=>toast.show('Changes discarded')}>Discard</button>
          <button style={btnPrimary} onClick={()=>toast.show('Settings saved!')}>Save Changes</button>
        </div>
      </div>

      {/* TWO-PANEL BODY */}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* SETTINGS SUB-NAV */}
        <div style={{ width:172, flexShrink:0, borderRight:'1px solid '+BORDER, overflowY:'auto', padding:'6px 0', background:'#FAFAFA' }}>
          {NAV_ITEMS.map(item => {
            const showGroup = item.group !== lastGroup;
            if (showGroup) lastGroup = item.group;
            return (
              <div key={item.key}>
                {showGroup && (
                  <div style={{ fontSize:8.5, color:MUTED, letterSpacing:'.12em', textTransform:'uppercase', padding:'14px 14px 3px', fontWeight:400, opacity:.7 }}>
                    {item.group}
                  </div>
                )}
                <button onClick={() => setSection(item.key)}
                  style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 14px', cursor:'pointer', fontSize:12, color:section===item.key?BLUE:MUTED, fontWeight:section===item.key?400:300, borderLeft:`2px solid ${section===item.key?BLUE:'transparent'}`, background:section===item.key?'rgba(37,99,235,.04)':'none', border:`none`, borderLeft:`2px solid ${section===item.key?BLUE:'transparent'}`, width:'100%', textAlign:'left', fontFamily:F, transition:'all .1s' }}>
                  {item.label}
                </button>
              </div>
            );
          })}
        </div>

        {/* CONTENT */}
        <div style={{ flex:1, overflowY:'auto', padding:'0 0 40px' }}>

          {/* ── GENERAL ── */}
          {section === 'general' && (
            <div style={{ padding:'24px 32px', display:'flex', flexDirection:'column', gap:0 }}>
              <SL label="Workspace" color={BLUE} />
              <FieldRow label="Company Name" hint="Used across the platform and candidate-facing pages.">
                <input style={inputStyle} value={settings.companyName} onChange={e=>set('companyName',e.target.value)} />
              </FieldRow>
              <FieldRow label="Timezone" hint="Used for scheduling and digest emails.">
                <select style={selectStyle} value={settings.timezone} onChange={e=>set('timezone',e.target.value)}>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                  <option value="UTC">UTC</option>
                </select>
              </FieldRow>
              <FieldRow label="Language">
                <select style={selectStyle} value={settings.language} onChange={e=>set('language',e.target.value)}>
                  <option value="en">English</option><option value="es">Spanish</option><option value="fr">French</option>
                </select>
              </FieldRow>
              <FieldRow label="Theme">
                <select style={selectStyle} value={settings.theme} onChange={e=>{set('theme',e.target.value);toast.show('Theme changed to '+e.target.value);}}>
                  <option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option>
                </select>
              </FieldRow>

              <div style={{ marginTop:28, marginBottom:14 }}><SL label="Pipeline Configuration" color={TEAL} /></div>
              <FieldRow label="Default Pipeline Stage">
                <select style={selectStyle} value={settings.defaultPipeline} onChange={e=>set('defaultPipeline',e.target.value)}>
                  <option value="7-stage">7-Stage (Applied to Offer)</option>
                  <option value="5-stage">5-Stage (Simplified)</option>
                  <option value="custom">Custom</option>
                </select>
              </FieldRow>
              <FieldRow label="Auto-Archive" hint="Days of inactivity before a candidate is archived.">
                <input style={{...inputStyle, width:120}} type="number" value={settings.autoArchiveDays} onChange={e=>set('autoArchiveDays',e.target.value)} />
              </FieldRow>
            </div>
          )}

          {/* ── ROLES & PERMISSIONS ── */}
          {section === 'roles' && (
            <div style={{ padding:'24px 32px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <SL label="Team Members" color={BLUE} />
                <button style={btnPrimary} onClick={()=>toast.show('Invitation email sent!')}>+ Invite Member</button>
              </div>
              <div style={{ border:'1px solid '+BORDER, marginBottom:24 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 160px 110px 100px 110px', padding:'7px 16px', background:BLIGHT, borderBottom:'1px solid '+BORDER }}>
                  {['Member','Email','Role','Status','Actions'].map(h=>(
                    <div key={h} style={{ fontSize:9, color:MUTED, letterSpacing:'.09em', textTransform:'uppercase', fontWeight:400 }}>{h}</div>
                  ))}
                </div>
                {members.map(m=>(
                  <div key={m.email} style={{ display:'grid', gridTemplateColumns:'1fr 160px 110px 100px 110px', padding:'10px 16px', alignItems:'center', borderBottom:'1px solid '+BLIGHT }}>
                    <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                      <Avatar ini={m.avatar} />
                      <span style={{ fontSize:12.5, fontWeight:400, color:DARK }}>{m.name}</span>
                    </div>
                    <div style={{ fontSize:10, color:MUTED, fontWeight:300 }}>{m.email}</div>
                    <div style={{ fontSize:11, color:MID, fontWeight:300 }}>{ROLE_META[m.role]?.label}</div>
                    <div>
                      <span style={{ fontSize:10, padding:'2px 7px', background:m.status==='Active'?'#E6F5EE':'#FFF7E0', color:m.status==='Active'?'#15703A':'#8A6000', fontWeight:500 }}>{m.status}</span>
                    </div>
                    <div>
                      <select value={m.role} onChange={e=>updateMemberRole(m.email,e.target.value)}
                        style={{ fontSize:11, padding:'3px 8px', border:'1px solid '+BORDER, fontFamily:F, color:MID, background:'#fff', outline:'none', cursor:'pointer' }}>
                        {Object.entries(ROLE_META).map(([k,r])=><option key={k} value={k}>{r.label}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <SL label="Role Permissions Matrix" color={TEAL} />
              <div style={{ fontSize:10, color:MUTED, fontWeight:300, marginBottom:12 }}>Click to toggle. Admin permissions are locked.</div>
              <div style={{ border:'1px solid '+BORDER, overflowX:'auto' }}>
                <div style={{ display:'grid', gridTemplateColumns:'180px 1fr 1fr 1fr 1fr', padding:'7px 16px', background:BLIGHT, borderBottom:'1px solid '+BORDER }}>
                  {['Permission','Admin','Hiring Mgr','Recruiter','Viewer'].map(h=>(
                    <div key={h} style={{ fontSize:9, color:MUTED, letterSpacing:'.09em', textTransform:'uppercase', fontWeight:400 }}>{h}</div>
                  ))}
                </div>
                {Object.entries(PERM_LABELS).map(([pk,label],i)=>(
                  <div key={pk} style={{ display:'grid', gridTemplateColumns:'180px 1fr 1fr 1fr 1fr', padding:'9px 16px', alignItems:'center', borderBottom:'1px solid '+BLIGHT, background:i%2===1?'rgba(0,0,0,.012)':'#fff' }}>
                    <div style={{ fontSize:12, color:MID, fontWeight:300 }}>{label}</div>
                    {Object.keys(ROLE_META).map(rk=>(
                      <div key={rk}>
                        <button onClick={()=>togglePerm(rk,pk)} style={{ background:'none', border:'none', cursor:rk==='admin'?'not-allowed':'pointer', opacity:rk==='admin'?.6:1, padding:2 }}>
                          {rolePerms[rk]?.[pk]
                            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={BORDER} strokeWidth="2"><line x1="5" y1="5" x2="19" y2="19"/></svg>
                          }
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {section === 'notifications' && (
            <div style={{ padding:'24px 32px' }}>
              <SL label="Email Notifications" color={BLUE} />
              {[
                {k:'emailNotifs',    l:'Email Notifications',       d:'Receive email for important updates'},
                {k:'slackNotifs',    l:'Slack Notifications',       d:'Post updates to connected Slack workspace'},
                {k:'agentAlerts',    l:'Explorer Agent Alerts',     d:'High-signal candidate alerts from agents'},
                {k:'a2aNotifs',      l:'Agent-to-Agent Updates',    d:'A2A session outcomes'},
                {k:'weeklyDigest',   l:'Weekly Digest',             d:'Monday morning pipeline summary email'},
                {k:'interviewReminders',l:'Interview Reminders',   d:'15 min before scheduled interviews'},
                {k:'offerAlerts',    l:'Offer Status Alerts',       d:'When offers are accepted or declined'},
                {k:'systemAlerts',   l:'System Alerts',             d:'Integration errors and sync failures'},
              ].map(({k,l,d})=>(
                <NotifRow key={k} label={l} desc={d} on={(settings as any)[k]} onToggle={()=>{toggle(k);toast.show(l+((settings as any)[k]?' disabled':' enabled'));}} />
              ))}

              <div style={{ marginTop:28, marginBottom:14 }}><SL label="Digest Frequency" color={TEAL} /></div>
              <FieldRow label="Pipeline Summary">
                <select style={selectStyle} defaultValue="weekly">
                  <option value="weekly">Weekly — Monday 9am</option>
                  <option value="daily">Daily</option>
                  <option value="never">Never</option>
                </select>
              </FieldRow>
              <FieldRow label="Analytics Digest">
                <select style={selectStyle} defaultValue="monthly">
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="never">Never</option>
                </select>
              </FieldRow>
            </div>
          )}

          {/* ── BRANDING ── */}
          {section === 'branding' && (
            <div style={{ padding:'24px 32px' }}>
              <SL label="Company Identity" color={BLUE} />
              <FieldRow label="Company Name" hint="Shown on candidate-facing pages and emails.">
                <input style={inputStyle} value={settings.brandName} onChange={e=>set('brandName',e.target.value)} />
              </FieldRow>
              <FieldRow label="Company Logo" hint="PNG or SVG, max 2MB.">
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:80, height:40, background:BLIGHT, border:'1px solid '+BORDER, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:MUTED }}>LOGO</div>
                  <button style={btnSecondary} onClick={()=>toast.show('Upload dialog coming soon')}>Upload Logo</button>
                </div>
              </FieldRow>
              <FieldRow label="Brand Color" hint="Primary color used on candidate portal.">
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <input style={{...inputStyle, width:120}} value={settings.brandColor} onChange={e=>set('brandColor',e.target.value)} />
                  <div style={{ width:32, height:32, background:settings.brandColor, border:'1px solid '+BORDER, flexShrink:0 }} />
                </div>
              </FieldRow>
              <FieldRow label="Taltas Co-branding" hint='"Powered by Taltas" shown on candidate pages.'>
                <Toggle on={settings.showTaltasBranding} onToggle={()=>toggle('showTaltasBranding')} />
              </FieldRow>
            </div>
          )}

          {/* ── SECURITY ── */}
          {section === 'security' && (
            <div style={{ padding:'24px 32px' }}>
              <SL label="Authentication" color={BLUE} />
              {[
                {k:'twoFactor',   l:'Two-Factor Authentication', d:'Require 2FA for all team members'},
                {k:'ssoEnabled',  l:'SSO / SAML',               d:'Single sign-on via your identity provider'},
                {k:'ipWhitelist', l:'IP Whitelist',              d:'Restrict access to approved IP ranges'},
                {k:'auditLog',    l:'Audit Logging',             d:'Log all user actions with timestamps'},
              ].map(({k,l,d})=>(
                <NotifRow key={k} label={l} desc={d} on={(settings as any)[k]} onToggle={()=>{toggle(k);toast.show(l+((settings as any)[k]?' disabled':' enabled'));}} />
              ))}

              <div style={{ marginTop:28, marginBottom:14 }}><SL label="Session & Data" color={TEAL} /></div>
              <FieldRow label="Session Timeout" hint="Hours before inactive sessions are signed out.">
                <input style={{...inputStyle, width:120}} type="number" value={settings.sessionTimeout} onChange={e=>set('sessionTimeout',e.target.value)} />
              </FieldRow>
              <FieldRow label="Data Retention" hint="Days to retain candidate data after archival.">
                <input style={{...inputStyle, width:120}} type="number" value={settings.dataRetention} onChange={e=>set('dataRetention',e.target.value)} />
              </FieldRow>

              <div style={{ marginTop:28, marginBottom:14 }}><SL label="Active Sessions" color={AMBER} /></div>
              {[
                {device:'MacBook Pro — Chrome', loc:'Boston, MA', time:'Now',        current:true},
                {device:'iPhone 16 — Safari',   loc:'Boston, MA', time:'2 hours ago',current:false},
                {device:'Windows 11 — Edge',    loc:'New York, NY',time:'3 days ago', current:false},
              ].map((s,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', border:'1px solid '+BORDER, marginBottom:6 }}>
                  <div>
                    <div style={{ fontSize:12.5, fontWeight:400, color:DARK }}>{s.device}</div>
                    <div style={{ fontSize:10, color:MUTED, fontWeight:300 }}>{s.loc} · {s.time}</div>
                  </div>
                  {s.current
                    ? <span style={{ fontSize:10, padding:'2px 7px', background:'#E6F5EE', color:'#15703A', fontWeight:500 }}>This device</span>
                    : <button style={btnDanger} onClick={()=>toast.show('Session revoked')}>Revoke</button>
                  }
                </div>
              ))}
            </div>
          )}

          {/* ── EXPLORER DEFAULTS ── */}
          {section === 'explorers' && (
            <div style={{ padding:'24px 32px' }}>
              <SL label="Explorer Defaults" color={TEAL} />
              {[
                {k:'explorerAutoMode', l:'Default to AUTO Mode',   d:'New explorers start in autonomous mode'},
                {k:'requireApproval',  l:'Require Human Approval', d:'Recruiter approval required before agent advances candidate'},
                {k:'sentimentTracking',l:'Sentiment Tracking',     d:'Track and score candidate conversation sentiment'},
              ].map(({k,l,d})=>(
                <NotifRow key={k} label={l} desc={d} on={(settings as any)[k]} onToggle={()=>{toggle(k);toast.show(l+((settings as any)[k]?' disabled':' enabled'));}} />
              ))}

              <div style={{ marginTop:28, marginBottom:14 }}><SL label="Scoring Thresholds" color={BLUE} /></div>
              <FieldRow label="Max Conversations / Day" hint="Per-agent daily conversation limit.">
                <input style={{...inputStyle, width:120}} type="number" value={settings.maxConvPerDay} onChange={e=>set('maxConvPerDay',e.target.value)} />
              </FieldRow>
              <FieldRow label="Deep Match Threshold" hint="Minimum score for a candidate to be surfaced.">
                <input style={{...inputStyle, width:120}} type="number" value={settings.deepMatchThreshold} onChange={e=>set('deepMatchThreshold',e.target.value)} />
              </FieldRow>
              <FieldRow label="Auto-Advance Score" hint="Candidates above this score are automatically advanced.">
                <input style={{...inputStyle, width:120}} type="number" value={settings.autoAdvanceScore} onChange={e=>set('autoAdvanceScore',e.target.value)} />
              </FieldRow>
            </div>
          )}

          {/* ── SNAP PROTOCOL ── */}
          {section === 'snap' && (
            <div style={{ padding:'24px 32px' }}>
              <SL label="SNAP Protocol Configuration" color={BLUE} />
              <div style={{ fontSize:11, color:MUTED, fontWeight:300, marginBottom:20, lineHeight:1.6 }}>
                Configure the Screening, Negotiation, Assessment, and Placement stages for your pipeline.
              </div>
              {[
                {stage:'S', label:'Screening',   color:BLUE,   key:'snapS', desc:'Explorer agent screening depth and pass criteria.',
                 fields:[{l:'Screening Depth', k:'snapScreenDepth', opts:['Standard','Deep','Comprehensive']},{l:'Auto-advance threshold',k:'snapThreshold',type:'text',def:'score > 70'}]},
                {stage:'N', label:'Negotiation', color:TEAL,   key:'snapN', desc:'Agent-to-agent salary and terms negotiation parameters.',
                 fields:[{l:'Salary Flex Range',k:'salaryFlex',type:'text',suf:'%'},{l:'Auto-negotiate up to',k:'snapNegLimit',opts:['$10K','$20K','$30K']}]},
                {stage:'A', label:'Assessment',  color:AMBER,  key:'snapA', desc:'Quality dimension weights and Deep Match scoring.',
                 fields:[{l:'Minimum Deep Match',k:'deepMatchMin',type:'text',def:'75'},{l:'Dimension Weights',k:'snapDims',opts:['Equal','Custom','Role-weighted']}]},
                {stage:'P', label:'Placement',   color:'#7C3AED',key:'snapP',desc:'Placement recommendations and automated offer triggers.',
                 fields:[{l:'Auto-offer threshold',k:'snapOffer',type:'text',def:'Deep Match > 88'},{l:'Placement Mode',k:'snapPlaceMode',opts:['Recommend','Auto-place']}]},
              ].map(s=>(
                <div key={s.stage} style={{ border:'1px solid '+BORDER, marginBottom:12, overflow:'hidden' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', background:BLIGHT, borderBottom:'1px solid '+BORDER }}>
                    <div style={{ width:22, height:22, background:s.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:500, color:'#fff', flexShrink:0 }}>{s.stage}</div>
                    <span style={{ fontSize:13, fontWeight:400, color:DARK, flex:1 }}>{s.label}</span>
                    <Toggle on={(settings as any)[s.key]} onToggle={()=>toggle(s.key)} />
                  </div>
                  <div style={{ padding:'14px 16px' }}>
                    <div style={{ fontSize:11, color:MUTED, fontWeight:300, marginBottom:12, lineHeight:1.5 }}>{s.desc}</div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      {s.fields.map((f:any)=>(
                        <div key={f.k}>
                          <div style={{ fontSize:11, color:MID, fontWeight:400, marginBottom:5 }}>{f.l}</div>
                          {f.opts
                            ? <select style={selectStyle}>{f.opts.map((o:string)=><option key={o}>{o}</option>)}</select>
                            : <input style={inputStyle} defaultValue={f.def||''} />
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── API & WEBHOOKS ── */}
          {section === 'api' && (
            <div style={{ padding:'24px 32px', display:'flex', flexDirection:'column', gap:24 }}>
              <ApiStatusPanel />

              <div>
                <SL label="API Keys" color={BLUE} />
                {[
                  {name:'Production Key', key:apiKey, revealed:apiKeyRevealed, prod:true},
                  {name:'Staging Key',    key:'tlts_stg_••••••••••••••••m3q7', revealed:false, prod:false},
                ].map((k,i)=>(
                  <div key={i} style={{ border:'1px solid '+BORDER, padding:'14px 16px', marginBottom:10 }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                      <div style={{ fontSize:13, fontWeight:400, color:DARK }}>{k.name}</div>
                      <div style={{ display:'flex', gap:6 }}>
                        {k.prod && <button style={btnSecondary} onClick={()=>setApiKeyRevealed(!apiKeyRevealed)}>{apiKeyRevealed?'Hide':'Reveal'}</button>}
                        {k.prod && <button style={btnSecondary} onClick={()=>setEditingApiKey(true)}>Edit</button>}
                        <button style={btnSecondary} onClick={()=>toast.show('Key copied to clipboard')}>Copy</button>
                        {k.prod && <button style={{...btnSecondary, color:AMBER}} onClick={()=>{setApiKey('tlts_prod_'+Math.random().toString(36).slice(2,18));toast.show('API key regenerated');}}>Regenerate</button>}
                      </div>
                    </div>
                    {k.prod && editingApiKey ? (
                      <div style={{ display:'flex', gap:8 }}>
                        <input style={{...inputStyle, fontFamily:'monospace', fontSize:11}} value={newApiKeyValue} onChange={e=>setNewApiKeyValue(e.target.value)} placeholder="Enter new API key" />
                        <button style={btnPrimary} onClick={()=>{if(newApiKeyValue.trim()){setApiKey(newApiKeyValue.trim());setEditingApiKey(false);setNewApiKeyValue('');toast.show('API key updated');}}}>Save</button>
                        <button style={btnSecondary} onClick={()=>{setEditingApiKey(false);setNewApiKeyValue('');}}>Cancel</button>
                      </div>
                    ) : (
                      <div style={{ fontFamily:'monospace', fontSize:11, padding:'8px 10px', background:BLIGHT, border:'1px solid '+BORDER, color:MID }}>
                        {k.prod ? (apiKeyRevealed ? apiKey : apiKey.replace(/[a-z0-9]/gi,(c,i)=>i>9&&i<apiKey.length-4?'•':c)) : k.key}
                      </div>
                    )}
                  </div>
                ))}
                <button style={btnPrimary} onClick={()=>toast.show('New key generated')}>+ Generate New Key</button>
              </div>

              <div>
                <SL label="Webhooks" color={TEAL} />
                <FieldRow label="Endpoint URL" hint="Your server endpoint to receive events.">
                  <input style={{...inputStyle, fontFamily:'monospace', fontSize:11}} value={webhookUrl} onChange={e=>setWebhookUrl(e.target.value)} />
                </FieldRow>
                <div style={{ marginTop:16 }}>
                  <div style={{ fontSize:11, color:MID, fontWeight:400, marginBottom:10 }}>Event Subscriptions</div>
                  {[
                    {k:'candidateCreated',      l:'candidate.created',      d:'New candidate enters pipeline'},
                    {k:'candidateAdvanced',      l:'candidate.advanced',     d:'Candidate moves to next stage'},
                    {k:'explorerConversation',   l:'explorer.conversation',  d:'Explorer conversation completed'},
                    {k:'interviewScheduled',     l:'interview.scheduled',    d:'Interview booked'},
                    {k:'offerSent',              l:'offer.sent',             d:'Offer letter dispatched'},
                    {k:'offerAccepted',          l:'offer.accepted',         d:'Candidate accepted offer'},
                    {k:'snapComplete',           l:'snap.complete',          d:'A2A SNAP session finished'},
                    {k:'agentError',             l:'agent.error',            d:'Explorer agent encountered error'},
                  ].map(({k,l,d})=>(
                    <div key={k} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid '+BLIGHT }}>
                      <div>
                        <code style={{ fontFamily:'monospace', fontSize:11, color:BLUE }}>{l}</code>
                        <div style={{ fontSize:10, color:MUTED, fontWeight:300 }}>{d}</div>
                      </div>
                      <Toggle on={(apiEvents as any)[k]} onToggle={()=>{setApiEvents(prev=>({...prev,[k]:!prev[k as keyof typeof prev]}));toast.show(l+((apiEvents as any)[k]?' unsubscribed':' subscribed'));}} />
                    </div>
                  ))}
                  <div style={{ marginTop:12 }}>
                    <button style={btnSecondary} onClick={()=>toast.show('Test webhook dispatched')}>Test Webhook</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── BILLING ── */}
          {section === 'billing' && (
            <div style={{ padding:'24px 32px', display:'flex', flexDirection:'column', gap:24 }}>

              {/* Current Plan */}
              <div>
                <SL label="Current Plan" color={BLUE} />
                <div style={{ border:'1px solid '+BORDER, padding:20, marginBottom:16 }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
                    <div>
                      <div style={{ fontSize:22, fontWeight:300, color:DARK, letterSpacing:'-0.02em', marginBottom:4 }}>{currentPlan}</div>
                      <div style={{ fontSize:13, color:MID, fontWeight:300 }}>$299 / month · Renews Apr 15, 2026</div>
                    </div>
                    <span style={{ fontSize:10, padding:'2px 9px', background:'#E6F5EE', color:'#15703A', fontWeight:500 }}>Active</span>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, paddingTop:16, borderTop:'1px solid '+BORDER, marginBottom:16 }}>
                    {[{l:'Active Explorers',used:3,limit:10},{l:'Candidates This Month',used:124,limit:500},{l:'API Calls Today',used:2840,limit:10000}].map(u=>(
                      <div key={u.l}>
                        <div style={{ fontSize:9, color:MUTED, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:6, fontWeight:400 }}>{u.l}</div>
                        <div style={{ fontSize:18, fontWeight:300, color:DARK, letterSpacing:'-0.01em', marginBottom:6 }}>{u.used}<span style={{ fontSize:11, color:MUTED, marginLeft:3 }}>/ {u.limit}</span></div>
                        <div style={{ height:3, background:BLIGHT }}><div style={{ height:3, width:Math.round(u.used/u.limit*100)+'%', background:u.used/u.limit>0.8?AMBER:TEAL }} /></div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button style={btnPrimary} onClick={()=>toast.show('Contact sales@taltas.ai for upgrades')}>Upgrade Plan</button>
                    <button style={btnSecondary} onClick={()=>{const n=billingPeriod==='monthly'?'annual':'monthly';setBillingPeriod(n);toast.show(n==='annual'?'Switched to annual — 20% saved':'Switched to monthly');}}>
                      {billingPeriod==='monthly'?'Switch to Annual (Save 20%)':'Switch to Monthly'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Available Plans */}
              <div>
                <SL label="Available Plans" color={TEAL} />
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
                  {[
                    {name:'Starter',      price:'$99',   period:'/mo', features:['2 Explorers','500 conv/mo','3 seats','Basic analytics'],                           current:false},
                    {name:'Professional', price:'$299',  period:'/mo', features:['5 Explorers','2,000 conv/mo','10 seats','Full analytics & A2A','API access'],      current:true},
                    {name:'Enterprise',   price:'Custom',period:'',    features:['Unlimited Explorers','Unlimited conv','Unlimited seats','Dedicated support','SLA'], current:false},
                  ].map(p=>(
                    <div key={p.name} style={{ border:`${p.current?2:1}px solid ${p.current?BLUE:BORDER}`, padding:16, background:p.current?'#F0F4FF':'#fff' }}>
                      {p.current && <div style={{ fontSize:9, color:BLUE, letterSpacing:'.08em', textTransform:'uppercase', fontWeight:500, marginBottom:6 }}>Current Plan</div>}
                      <div style={{ fontSize:14, fontWeight:400, color:DARK, marginBottom:4 }}>{p.name}</div>
                      <div style={{ fontSize:22, fontWeight:300, color:DARK, letterSpacing:'-0.02em', marginBottom:12 }}>{p.price}<span style={{ fontSize:11, color:MUTED }}>{p.period}</span></div>
                      {p.features.map(f=>(
                        <div key={f} style={{ display:'flex', alignItems:'center', gap:5, fontSize:10.5, color:MID, fontWeight:300, marginBottom:5 }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                          {f}
                        </div>
                      ))}
                      <button style={{...btnPrimary, marginTop:12, width:'100%', textAlign:'center', opacity:p.current?.7:1}} onClick={()=>{if(p.current)toast.show("You're on the "+p.name+" plan");else if(p.name==='Enterprise')toast.show('Contact sales@taltas.ai');else{setCurrentPlan(p.name);toast.show('Upgraded to '+p.name+'!');}}}>
                        {p.current?'Current':p.name==='Enterprise'?'Contact Sales':'Upgrade'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment + Credits */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div>
                  <SL label="Payment Method" color={BLUE} />
                  <div style={{ border:'1px solid '+BORDER, padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:40, height:26, background:'#1a1f36', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:500, color:'#fff' }}>{savedCard.brand}</div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:400, color:DARK }}>•••• •••• •••• {savedCard.last4}</div>
                        <div style={{ fontSize:10, color:MUTED, fontWeight:300 }}>Expires {savedCard.expiry}</div>
                      </div>
                    </div>
                    <button style={btnSecondary} onClick={()=>setShowCardModal(true)}>Update</button>
                  </div>
                </div>
                <div>
                  <SL label="API Credits" color={TEAL} />
                  <div style={{ border:'1px solid '+BORDER, padding:'14px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ fontSize:22, fontWeight:300, color:apiCredits<15?AMBER:TEAL, letterSpacing:'-0.02em' }}>${apiCredits.toFixed(2)}</span>
                      <span style={{ fontSize:10, color:MUTED, fontWeight:300 }}>of $55.00 budget</span>
                    </div>
                    <div style={{ height:3, background:BLIGHT, marginBottom:12 }}><div style={{ height:3, width:Math.min(100,(apiCredits/55)*100)+'%', background:apiCredits<15?AMBER:TEAL }} /></div>
                    <div style={{ display:'flex', gap:6, marginBottom:8 }}>
                      {[25,50,100].map(v=><button key={v} style={btnPrimary} onClick={()=>topUp(v)}>+${v}</button>)}
                    </div>
                    <div style={{ display:'flex', gap:6, marginBottom:8 }}>
                      {[25,50,100].map(v=><button key={v} style={btnDanger} onClick={()=>reduceCredits(v)}>-${v}</button>)}
                    </div>
                    <div style={{ display:'flex', gap:6 }}>
                      <input style={{...inputStyle, width:80, padding:'5px 8px', fontSize:11}} type="number" placeholder="Custom $" value={customTopUp} onChange={e=>setCustomTopUp(e.target.value)} />
                      <button style={btnPrimary} onClick={()=>{const v=parseFloat(customTopUp);if(v>0){topUp(v);setCustomTopUp('');}else toast.show('Enter a valid amount','error');}}>Add</button>
                      <button style={btnDanger} onClick={()=>{const v=parseFloat(customTopUp);if(v>0){reduceCredits(v);setCustomTopUp('');}else toast.show('Enter an amount','error');}}>Remove</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing History */}
              <div>
                <SL label="Billing History" color={MUTED} />
                <div style={{ border:'1px solid '+BORDER }}>
                  <div style={{ display:'grid', gridTemplateColumns:'130px 1fr 100px 80px 80px', padding:'7px 16px', background:BLIGHT, borderBottom:'1px solid '+BORDER }}>
                    {['Date','Description','Amount','Status','Invoice'].map(h=>(
                      <div key={h} style={{ fontSize:9, color:MUTED, letterSpacing:'.09em', textTransform:'uppercase', fontWeight:400 }}>{h}</div>
                    ))}
                  </div>
                  {[
                    {date:'Feb 15, 2026',desc:'Professional Plan — Monthly',  amount:'$299.00'},
                    {date:'Feb 12, 2026',desc:'API Credit Top-Up',             amount:'$55.00'},
                    {date:'Jan 15, 2026',desc:'Professional Plan — Monthly',  amount:'$299.00'},
                    {date:'Jan 8, 2026', desc:'API Credit Top-Up',             amount:'$50.00'},
                    {date:'Dec 15, 2025',desc:'Professional Plan — Monthly',  amount:'$299.00'},
                  ].map((r,i)=>(
                    <div key={i} style={{ display:'grid', gridTemplateColumns:'130px 1fr 100px 80px 80px', padding:'10px 16px', alignItems:'center', borderBottom:'1px solid '+BLIGHT, background:i%2===1?'rgba(0,0,0,.012)':'#fff' }}>
                      <div style={{ fontSize:11, color:MUTED, fontWeight:300 }}>{r.date}</div>
                      <div style={{ fontSize:12, color:DARK, fontWeight:300 }}>{r.desc}</div>
                      <div style={{ fontSize:12, fontWeight:400, color:DARK }}>{r.amount}</div>
                      <div><span style={{ fontSize:10, padding:'2px 7px', background:'#E6F5EE', color:'#15703A', fontWeight:500 }}>Paid</span></div>
                      <div><button style={btnSecondary} onClick={()=>toast.show('Downloading invoice...')}>PDF</button></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Card Modal */}
      <Modal open={showCardModal} onClose={()=>setShowCardModal(false)} title="Update Payment Method">
        <div style={{ display:'flex', flexDirection:'column', gap:12, fontFamily:F }}>
          <div style={{ fontSize:10, color:MUTED, fontWeight:300, marginBottom:4 }}>Card information is encrypted end-to-end.</div>
          <div>
            <div style={{ fontSize:11, color:MID, fontWeight:400, marginBottom:5 }}>Card Number</div>
            <input style={{...inputStyle, fontFamily:'monospace', fontSize:13, letterSpacing:'.05em'}} placeholder="1234 5678 9012 3456" value={cardForm.number} onChange={e=>setCardForm(f=>({...f,number:formatCard(e.target.value)}))} maxLength={19} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <div style={{ fontSize:11, color:MID, fontWeight:400, marginBottom:5 }}>Expiry (MM/YY)</div>
              <input style={inputStyle} placeholder="08/27" value={cardForm.expiry} onChange={e=>{let v=e.target.value.replace(/\D/g,'').slice(0,4);if(v.length>2)v=v.slice(0,2)+'/'+v.slice(2);setCardForm(f=>({...f,expiry:v}));}} maxLength={5} />
            </div>
            <div>
              <div style={{ fontSize:11, color:MID, fontWeight:400, marginBottom:5 }}>CVC</div>
              <input style={inputStyle} placeholder="123" type="password" value={cardForm.cvc} onChange={e=>setCardForm(f=>({...f,cvc:e.target.value.replace(/\D/g,'').slice(0,4)}))} maxLength={4} />
            </div>
          </div>
          <div>
            <div style={{ fontSize:11, color:MID, fontWeight:400, marginBottom:5 }}>Cardholder Name</div>
            <input style={inputStyle} placeholder="Full name on card" value={cardForm.name} onChange={e=>setCardForm(f=>({...f,name:e.target.value}))} />
          </div>
          <div>
            <div style={{ fontSize:11, color:MID, fontWeight:400, marginBottom:5 }}>Billing ZIP</div>
            <input style={inputStyle} placeholder="02101" value={cardForm.zip} onChange={e=>setCardForm(f=>({...f,zip:e.target.value}))} maxLength={10} />
          </div>
          <div style={{ display:'flex', gap:8, marginTop:4 }}>
            <button style={{...btnPrimary, flex:1}} onClick={handleSaveCard}>Save Card</button>
            <button style={btnSecondary} onClick={()=>setShowCardModal(false)}>Cancel</button>
          </div>
          <div style={{ fontSize:9, color:MUTED, textAlign:'center' }}>TLS 1.3 · PCI DSS Level 1</div>
        </div>
      </Modal>
    </div>
  );
}
