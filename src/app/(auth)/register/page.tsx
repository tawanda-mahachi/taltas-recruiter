'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { NetworkCanvas } from '@/components/auth/network-canvas';
import { PasswordStrength } from '@/components/auth/password-strength';
import { useRegister } from '@/lib/hooks/use-auth';
import { IconArrowRight } from '@/components/icons';

const PERSONAL_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'mail.com', 'protonmail.com', 'live.com'];

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegister();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [terms, setTerms] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [emailStatus, setEmailStatus] = useState<null | 'valid' | 'personal'>(null);

  const checkEmail = (v: string) => {
    const domain = v.split('@')[1]?.toLowerCase();
    if (!domain || !v.includes('.')) { setEmailStatus(null); return; }
    setEmailStatus(PERSONAL_DOMAINS.includes(domain) ? 'personal' : 'valid');
  };

  const handleSubmit = async () => {
    setError('');
    if (!firstName || !lastName) { setError('Please enter your full name.'); return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address.'); return; }
    if (emailStatus === 'personal') { setError(`"${email.split('@')[1]}" is a personal email provider. Please use your work email.`); return; }
    if (!company) { setError('Please enter your company name.'); return; }
    if (password.length < 10) { setError('Password must be at least 10 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (!terms) { setError('Please accept the Terms of Service to continue.'); return; }

    try {
      await registerMutation.mutateAsync({
        email, password,
        principalType: 'recruiter',
        recruiterRole: 'recruiter',
        profile: { firstName, lastName, company, jobTitle },
      });
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Registration failed.');
    }
  };

  const loading = registerMutation.isPending;

  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden" style={{ background: '#fafbfd' }}>
      <NetworkCanvas />

      <div className="relative z-10 w-full max-w-[420px] px-5 py-8">
        {/* Back to landing */}
        <div className="mb-4">
          <button onClick={() => router.push('/')} className="flex items-center gap-[5px] text-[12px] font-medium transition-opacity hover:opacity-80" style={{ color: 'var(--blue)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to Taltas
          </button>
        </div>
        {/* Brand */}
        <div className="text-center mb-7">
          <div className="font-serif text-[38px] font-normal tracking-tight" style={{ color: '#0f172a' }}>
            Tal<span style={{ color: 'var(--blue)' }}>tas</span>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[.16em] mt-[5px]" style={{ color: '#94a3b8' }}>
            Recruitment Intelligence Platform
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[20px] px-8 pt-[30px] pb-8" style={{ border: '1px solid rgba(0,0,0,.08)', boxShadow: '0 4px 6px rgba(0,0,0,.04), 0 20px 60px rgba(37,99,235,.08)' }}>
          <div className="font-serif text-[22px] font-normal mb-[5px]" style={{ color: '#0f172a' }}>Create your account</div>
          <div className="text-[12px] mb-[22px]" style={{ color: '#94a3b8' }}>Work email required — company accounts only</div>

          {error && (
            <div className="rounded-lg px-[13px] py-[10px] text-[11.5px] mb-4" style={{ background: 'var(--red-bg)', border: '1px solid var(--red-border)', color: 'var(--red)' }}>
              {error}
            </div>
          )}

          {/* Name */}
          <div className="grid grid-cols-2 gap-[10px] mb-[14px]">
            <div>
              <label className="auth-label">FIRST NAME</label>
              <input className="auth-input" placeholder="Jordan" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <label className="auth-label">LAST NAME</label>
              <input className="auth-input" placeholder="Rivera" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>

          {/* Email */}
          <div className="mb-[14px]">
            <label className="auth-label">WORK EMAIL</label>
            <div className="relative">
              <input
                type="email"
                className={`auth-input ${emailStatus === 'personal' ? 'error' : ''}`}
                placeholder="you@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); checkEmail(e.target.value); }}
              />
              {emailStatus && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: emailStatus === 'valid' ? '#4ade80' : '#f87171' }}>
                  {emailStatus === 'valid'
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>}
                </span>
              )}
            </div>
            {emailStatus === 'personal' && (
              <div className="font-mono text-[10.5px] mt-[5px]" style={{ color: 'rgba(248,113,113,.8)' }}>
                &quot;{email.split('@')[1]}&quot; is a personal email provider — use your work email
              </div>
            )}
            {emailStatus === 'valid' && (
              <div className="font-mono text-[10.5px] mt-[5px] flex items-center gap-[4px]" style={{ color: 'rgba(74,222,128,.7)' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                Company email accepted
              </div>
            )}
          </div>

          {/* Company / Title */}
          <div className="grid grid-cols-2 gap-[10px] mb-[14px]">
            <div>
              <label className="auth-label">COMPANY</label>
              <input className="auth-input" placeholder="Acme Corp" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <div>
              <label className="auth-label">JOB TITLE</label>
              <input className="auth-input" placeholder="Senior Recruiter" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            </div>
          </div>

          {/* Password */}
          <div className="mb-[14px]">
            <label className="auth-label">PASSWORD</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                className="auth-input"
                placeholder="Min. 10 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: 40 }}
              />
              <button type="button" className="pw-eye-btn" onClick={() => setShowPw(!showPw)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {showPw ? (
                    <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>
                  ) : (
                    <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                  )}
                </svg>
              </button>
            </div>
            <PasswordStrength password={password} />
          </div>

          {/* Confirm */}
          <div className="mb-[22px]">
            <label className="auth-label">CONFIRM PASSWORD</label>
            <input type="password" className="auth-input" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>

          {/* Terms */}
          <label className="flex items-start gap-[10px] cursor-pointer mb-5">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="w-[15px] h-[15px] mt-[2px] flex-shrink-0" style={{ accentColor: 'var(--blue)' }} />
            <span className="text-[11.5px] leading-[1.6]" style={{ color: 'var(--text-dim)' }}>
              I agree to Taltas&apos; <span style={{ color: 'var(--blue)', cursor: 'pointer' }}>Terms of Service</span> and <span style={{ color: 'var(--blue)', cursor: 'pointer' }}>Privacy Policy</span>
            </span>
          </label>

          <button className="auth-primary-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </div>

        {/* Toggle */}
        <div className="text-center mt-[18px]">
          <span className="text-[12px]" style={{ color: 'var(--text-dim)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-medium" style={{ color: 'var(--blue)' }}>
              <span className="inline-flex items-center gap-[3px]">Sign in <IconArrowRight size={11} /></span>
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
