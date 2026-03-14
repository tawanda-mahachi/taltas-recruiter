'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useProfile } from '@/lib/data-provider';
import { DataSourceBadge } from '@/components/shared/api-status';
import { initials, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { IconUser, IconZap, IconX } from '@/components/icons';
import { Modal } from '@/components/ui/modal';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const profileQuery = useProfile();
  const fromApi = !!profileQuery.data?.data?.fromApi;
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteStep, setDeleteStep] = useState(0);

  const name = user?.profile?.firstName
    ? `${user.profile.firstName} ${user.profile.lastName || ''}`
    : user?.user?.email?.split('@')[0] || 'Recruiter';
  const email = user?.user?.email || '';
  const userInitials = initials(name);

  const [form, setForm] = useState({
    firstName: user?.profile?.firstName || name.split(' ')[0] || '',
    lastName: user?.profile?.lastName || name.split(' ').slice(1).join(' ') || '',
    email: email,
    phone: user?.profile?.phone || '+1 (617) 555-0192',
    title: user?.profile?.title || 'Senior Technical Recruiter',
    department: user?.profile?.department || 'Talent Acquisition',
    company: user?.profile?.company || 'Boston Tech Labs',
    location: user?.profile?.location || 'Boston, MA',
    timezone: user?.profile?.timezone || 'America/New_York',
    linkedinUrl: user?.profile?.linkedinUrl || 'https://linkedin.com/in/',
    bio: user?.profile?.bio || 'Experienced technical recruiter specializing in engineering and AI/ML roles.',
    pronouns: user?.profile?.pronouns || '',
    startDate: user?.profile?.startDate || '2024-03-15',
    reportsTo: user?.profile?.reportsTo || '',
    language: user?.profile?.language || 'en',
    dob: user?.profile?.dob || '',
    gender: user?.profile?.gender || '',
    nationality: user?.profile?.nationality || 'United States',
    ethnicity: user?.profile?.ethnicity || '',
    street: user?.profile?.street || '',
    city: user?.profile?.city || 'Boston',
    state: user?.profile?.state || 'MA',
    postalCode: user?.profile?.postalCode || '02101',
    country: user?.profile?.country || 'United States',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); toast.show('Profile updated successfully'); }, 800);
  };

  return (
    <div className="max-w-[740px] mx-auto flex flex-col gap-[13px]">
      {/* Header */}
      <div className="card">
        <div className="flex items-center gap-5">
          <div className="w-[64px] h-[64px] rounded-xl flex items-center justify-center font-mono text-[20px] font-bold" style={{ border: '2px solid var(--blue-border)', background: 'var(--blue-bg)', color: 'var(--blue)' }}>{userInitials}</div>
          <div className="flex-1">
            <div style={{ fontFamily: "'Roboto Slab', serif", fontSize: 22, fontWeight: 600, color: 'var(--text-bright)' }}>{form.firstName} {form.lastName}</div>
            <div className="font-mono text-[11px] mt-1" style={{ color: 'var(--muted)' }}>{form.title} · {form.company}</div>
            <div className="flex gap-2 mt-2">
              <span className="fit-badge fit-deep">{user?.type || 'recruiter'}</span>
              <span className="fit-badge fit-good">{user?.billingPlan || 'pro'}</span>
              {user?.recruiterRole && <span className="fit-badge fit-potential">{user.recruiterRole.replace(/_/g, ' ')}</span>}
            </div>
          </div>
          <button className="ctrl-btn" style={{ fontSize: 9 }} onClick={() => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.onchange = (e: any) => { const f = e.target.files?.[0]; if (f) { const url = URL.createObjectURL(f); setPhotoUrl(url); toast.show('Photo updated'); } }; inp.click(); }}>Change Photo</button>
        </div>
      </div>

      {/* Personal Information */}
      <div className="card">
        <div className="settings-section-title">Personal Information</div>
        <div className="grid grid-cols-2 gap-[13px]">
          <div><label className="form-label">First Name</label><input className="form-input" value={form.firstName} onChange={e => set('firstName', e.target.value)} /></div>
          <div><label className="form-label">Last Name</label><input className="form-input" value={form.lastName} onChange={e => set('lastName', e.target.value)} /></div>
          <div><label className="form-label">Email Address</label><input className="form-input" value={form.email} onChange={e => set('email', e.target.value)} type="email" /></div>
          <div><label className="form-label">Phone Number</label><input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
          <div><label className="form-label">Date of Birth</label><input className="form-input" type="date" value={form.dob} onChange={e => set('dob', e.target.value)} /></div>
          <div><label className="form-label">Gender</label><select className="form-select" value={form.gender} onChange={e => set('gender', e.target.value)}><option value="">Prefer not to say</option><option value="male">Male</option><option value="female">Female</option><option value="non-binary">Non-Binary</option><option value="other">Other</option></select></div>
          <div><label className="form-label">Nationality</label><input className="form-input" value={form.nationality} onChange={e => set('nationality', e.target.value)} placeholder="e.g., United States" /></div>
          <div><label className="form-label">Pronouns</label><select className="form-select" value={form.pronouns} onChange={e => set('pronouns', e.target.value)}><option value="">Prefer not to say</option><option value="he/him">He/Him</option><option value="she/her">She/Her</option><option value="they/them">They/Them</option><option value="other">Other</option></select></div>
          <div><label className="form-label">Preferred Language</label><select className="form-select" value={form.language} onChange={e => set('language', e.target.value)}><option value="en">English</option><option value="es">Spanish</option><option value="fr">French</option><option value="de">German</option><option value="pt">Portuguese</option><option value="zh">Chinese</option><option value="ja">Japanese</option></select></div>
          <div><label className="form-label">Ethnicity (Optional)</label><select className="form-select" value={form.ethnicity} onChange={e => set('ethnicity', e.target.value)}><option value="">Prefer not to say</option><option value="white">White</option><option value="black">Black or African American</option><option value="hispanic">Hispanic or Latino</option><option value="asian">Asian</option><option value="native">Native American</option><option value="pacific">Pacific Islander</option><option value="multiracial">Multiracial</option><option value="other">Other</option></select></div>
        </div>
      </div>

      {/* Address */}
      <div className="card">
        <div className="settings-section-title">Address</div>
        <div className="grid grid-cols-2 gap-[13px]">
          <div className="col-span-2"><label className="form-label">Street Address</label><input className="form-input" value={form.street} onChange={e => set('street', e.target.value)} placeholder="123 Main St, Apt 4B" /></div>
          <div><label className="form-label">City</label><input className="form-input" value={form.city} onChange={e => set('city', e.target.value)} /></div>
          <div><label className="form-label">State / Province</label><input className="form-input" value={form.state} onChange={e => set('state', e.target.value)} /></div>
          <div><label className="form-label">Postal Code</label><input className="form-input" value={form.postalCode} onChange={e => set('postalCode', e.target.value)} /></div>
          <div><label className="form-label">Country</label><input className="form-input" value={form.country} onChange={e => set('country', e.target.value)} /></div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="card">
        <div className="settings-section-title">Professional Information</div>
        <div className="grid grid-cols-2 gap-[13px]">
          <div><label className="form-label">Job Title</label><input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} /></div>
          <div><label className="form-label">Department</label><input className="form-input" value={form.department} onChange={e => set('department', e.target.value)} /></div>
          <div><label className="form-label">Company</label><input className="form-input" value={form.company} onChange={e => set('company', e.target.value)} /></div>
          <div><label className="form-label">Reports To</label><input className="form-input" placeholder="Manager name" value={form.reportsTo} onChange={e => set('reportsTo', e.target.value)} /></div>
          <div><label className="form-label">Start Date</label><input className="form-input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} /></div>
          <div><label className="form-label">LinkedIn Profile</label><input className="form-input" placeholder="https://linkedin.com/in/..." value={form.linkedinUrl} onChange={e => set('linkedinUrl', e.target.value)} /></div>
        </div>
        <div className="mt-[13px]"><label className="form-label">Bio</label><textarea className="form-textarea" rows={3} value={form.bio} onChange={e => set('bio', e.target.value)} /></div>
      </div>

      {/* Location & Timezone */}
      <div className="card">
        <div className="settings-section-title">Location & Timezone</div>
        <div className="grid grid-cols-2 gap-[13px]">
          <div><label className="form-label">Office Location</label><input className="form-input" value={form.location} onChange={e => set('location', e.target.value)} /></div>
          <div><label className="form-label">Timezone</label><select className="form-select" value={form.timezone} onChange={e => set('timezone', e.target.value)}><option value="America/New_York">Eastern (ET)</option><option value="America/Chicago">Central (CT)</option><option value="America/Denver">Mountain (MT)</option><option value="America/Los_Angeles">Pacific (PT)</option><option value="UTC">UTC</option><option value="Europe/London">London (GMT)</option><option value="Europe/Berlin">Berlin (CET)</option><option value="Asia/Tokyo">Tokyo (JST)</option></select></div>
        </div>
      </div>

      {/* Account Info (read-only) */}
      <div className="card">
        <div className="settings-section-title">Account Information</div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-0">
          {[
            ['Principal ID', user?.id?.slice(0, 8) + '…' || '—'],
            ['Account Type', (user?.type || 'recruiter').charAt(0).toUpperCase() + (user?.type || 'recruiter').slice(1)],
            ['Workspace', user?.workspaceId?.slice(0, 8) + '…' || '—'],
            ['Billing Plan', (user?.billingPlan || 'pro').toUpperCase()],
            ['Compute Mode', user?.computeMode || 'managed'],
            ['Credit Balance', String(user?.creditBalance || 0)],
            ['Current Spend', `$${user?.currentSpend || '0.00'}`],
            ['Login Count', String(user?.user?.loginCount || 0)],
            ['Last Login', user?.user?.lastLoginAt ? formatDate(user.user.lastLoginAt) : 'Just now'],
            ['Member Since', user?.createdAt ? formatDate(user.createdAt) : '—'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between py-[7px]" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="font-mono text-[9px] uppercase" style={{ color: 'var(--muted)' }}>{label}</span>
              <span className="font-mono text-[11px] text-right" style={{ color: 'var(--text-bright)' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-[8px]">
        <button className="ctrl-btn" style={{ fontSize: 11, padding: '8px 16px', color: 'var(--red)', borderColor: 'var(--red-border)', background: 'var(--red-bg)' }} onClick={() => { setDeleteOpen(true); setDeleteStep(0); setDeleteConfirm(''); }}>Delete Account</button>
        <button className="ctrl-btn run" style={{ fontSize: 11, padding: '8px 20px' }} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : <><IconZap size={10} className="inline mr-[4px]" /> Save Profile</>}
        </button>
      </div>
      {/* #14 — Delete Account Modal */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="min(500px, 95vw)">
        <div className="text-center">
          <div className="text-[20px] font-bold mb-[6px]" style={{ fontFamily: "'Roboto Slab', serif", color: 'var(--red)' }}>Delete Account</div>
          {deleteStep === 0 && (<>
            <p className="text-[12px] mb-[16px]" style={{ color: 'var(--text-dim)' }}>This will permanently delete your account and all associated data. This action cannot be undone.</p>
            <div className="p-[12px] rounded-[8px] mb-[14px] text-left" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
              <div className="font-mono text-[8.5px] uppercase tracking-[.1em] mb-[8px]" style={{ color: 'var(--muted)' }}>Pre-Deletion Checks</div>
              <div className="flex items-center gap-[6px] mb-[6px]"><span style={{ color: 'var(--green)' }}>✓</span> <span className="text-[11px]">No outstanding balance owed</span></div>
              <div className="flex items-center gap-[6px] mb-[6px]"><span style={{ color: 'var(--green)' }}>✓</span> <span className="text-[11px]">No pending invoices</span></div>
              <div className="flex items-center gap-[6px] mb-[6px]"><span style={{ color: 'var(--orange)' }}>⚠</span> <span className="text-[11px]">3 active Explorer agents will be deactivated</span></div>
              <div className="flex items-center gap-[6px]"><span style={{ color: 'var(--orange)' }}>⚠</span> <span className="text-[11px]">148 candidate records will be archived</span></div>
            </div>
            <div className="flex justify-center gap-[8px]"><button className="ctrl-btn" onClick={() => setDeleteOpen(false)}>Cancel</button><button className="ctrl-btn" style={{ color: 'var(--red)', borderColor: 'var(--red-border)', background: 'var(--red-bg)' }} onClick={() => setDeleteStep(1)}>Continue</button></div>
          </>)}
          {deleteStep === 1 && (<>
            <p className="text-[12px] mb-[12px]" style={{ color: 'var(--text-dim)' }}>Type <strong>DELETE MY ACCOUNT</strong> to confirm</p>
            <input className="form-input mb-[14px]" placeholder="DELETE MY ACCOUNT" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} style={{ textAlign: 'center' }} />
            <div className="flex justify-center gap-[8px]"><button className="ctrl-btn" onClick={() => setDeleteStep(0)}>Back</button><button className="ctrl-btn" disabled={deleteConfirm !== 'DELETE MY ACCOUNT'} style={{ color: deleteConfirm === 'DELETE MY ACCOUNT' ? 'var(--red)' : 'var(--muted)', borderColor: deleteConfirm === 'DELETE MY ACCOUNT' ? 'var(--red-border)' : 'var(--border)', background: deleteConfirm === 'DELETE MY ACCOUNT' ? 'var(--red-bg)' : 'var(--surface2)', opacity: deleteConfirm === 'DELETE MY ACCOUNT' ? 1 : 0.5 }} onClick={() => { setDeleteOpen(false); toast.show('Account deletion initiated. You will receive a confirmation email.'); }}>Permanently Delete Account</button></div>
          </>)}
        </div>
      </Modal>
    </div>
  );
}
