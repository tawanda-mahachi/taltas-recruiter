'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { NetworkCanvas } from '@/components/auth/network-canvas';
import { useLogin } from '@/lib/hooks/use-auth';
import { IconArrowRight } from '@/components/icons';

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();
  const [email, setEmail] = useState('test@taltas.ai');
  const [password, setPassword] = useState('TestPass123!');
  const [role, setRole] = useState('senior_recruiter');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!password.trim()) { setError('Please enter your password.'); return; }
    try {
      await loginMutation.mutateAsync({ email: email.trim(), password: password.trim() });
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Login failed. Please check your credentials.');
    }
  };

  const loading = loginMutation.isPending;

  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden" style={{ background: '#fafbfd' }}>
      <NetworkCanvas />

      <div className="relative z-10 w-full max-w-[420px] px-5">
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
          <div className="font-serif text-[22px] font-normal mb-[5px]" style={{ color: '#0f172a' }}>Welcome back</div>
          <div className="text-[12px] mb-[22px]" style={{ color: '#94a3b8' }}>Sign in to your workspace</div>

          {/* Error */}
          {error && (
            <div className="rounded-lg px-[13px] py-[10px] text-[11.5px] mb-4" style={{ background: 'var(--red-bg)', border: '1px solid var(--red-border)', color: 'var(--red)' }}>
              {error}
            </div>
          )}

          {/* Email */}
          <div className="mb-[14px]">
            <label className="auth-label">EMAIL</label>
            <input
              type="email"
              className="auth-input"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {/* Password */}
          <div className="mb-[6px]">
            <div className="flex justify-between items-center mb-[6px]">
              <label className="auth-label" style={{ margin: 0 }}>PASSWORD</label>
              <span className="text-[11px] cursor-pointer" style={{ color: 'var(--blue)' }}>Forgot password?</span>
            </div>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                style={{ paddingRight: 40 }}
              />
              <button type="button" className="pw-eye-btn" onClick={() => setShowPw(!showPw)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {showPw ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Role */}
          <div className="mb-[22px]">
            <label className="auth-label" style={{ marginTop: 14 }}>ROLE</label>
            <select
              className="auth-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="hiring_manager">Hiring Manager</option>
              <option value="senior_recruiter">Senior Recruiter</option>
              <option value="recruiter">Recruiter</option>
              <option value="coordinator">Coordinator</option>
            </select>
          </div>

          {/* Submit */}
          <button
            className="auth-primary-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Signing in\u2026' : <span className="flex items-center gap-[5px]">Sign In <IconArrowRight size={13} /></span>}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-[10px] my-[18px]">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="font-mono text-[11px]" style={{ color: '#c4c8d0' }}>OR</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          {/* SSO */}
          <button className="auth-sso-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.45 }}>
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            Continue with SSO
          </button>
        </div>

        {/* Toggle */}
        <div className="text-center mt-[18px]">
          <span className="text-[12px]" style={{ color: 'var(--text-dim)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium" style={{ color: 'var(--blue)' }}>
              <span className="inline-flex items-center gap-[3px]">Create one <IconArrowRight size={11} /></span>
            </Link>
          </span>
        </div>

        {/* Demo hint */}
        <div className="text-center mt-3">
          <div className="inline-flex items-center gap-[6px] rounded-lg px-[13px] py-[7px]" style={{ background: 'rgba(255,255,255,.85)', border: '1px solid var(--border)' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9aa0ad" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
            </svg>
            <span className="font-mono text-[9px]" style={{ color: '#9aa0ad' }}>
              Test: test@taltas.ai / TestPass123!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
