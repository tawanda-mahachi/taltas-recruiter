// @ts-nocheck
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLogin } from '@/lib/hooks/use-auth';

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!password.trim()) { setError('Please enter your password.'); return; }
    try {
      await loginMutation.mutateAsync({ email: email.trim(), password: password.trim() });
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Login failed. Please check your credentials.');
    }
  };

  const loading = loginMutation.isPending;

  return (
    <div style={{ minHeight: '100vh', background: '#F4F4F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>

      {/* Logo */}
      <a href="https://taltas.ai" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48, textDecoration: 'none' }}>
        <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
          <circle cx="30" cy="30" r="27" fill="#1D9E75"/>
          <polygon points="30,8 36,32 30,28 24,32" fill="white"/>
          <polygon points="30,52 34,32 30,36 26,32" fill="white" opacity="0.28"/>
          <line x1="12" y1="30" x2="48" y2="30" stroke="white" strokeWidth="1" opacity="0.25"/>
          <circle cx="30" cy="30" r="3.5" fill="white"/>
          <circle cx="30" cy="30" r="1.8" fill="#1D9E75"/>
        </svg>
        <div>
          <div style={{ fontSize: 28, fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1, color: '#0A0A0A' }}>Tal<span style={{ color: '#1D9E75' }}>tas</span></div>
          <div style={{ fontSize: 9, color: '#AAAAAA', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 2 }}>Recruiter Portal</div>
        </div>
      </a>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 400, background: '#FFFFFF', border: '1px solid #E8E8E5', padding: '36px 32px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 300, letterSpacing: '-0.02em', color: '#0A0A0A', marginBottom: 6 }}>Sign in</h1>
        <p style={{ fontSize: 13, color: '#AAAAAA', fontWeight: 300, marginBottom: 28 }}>Access your recruiter dashboard</p>

        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(204,51,0,.05)', border: '1px solid rgba(204,51,0,.2)', color: '#CC3300', fontSize: 12, fontWeight: 300, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 9, color: '#AAAAAA', letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: 'Courier New, monospace', marginBottom: 6 }}>Email</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="you@company.com"
            style={{ width: '100%', padding: '10px 12px', fontSize: 14, fontWeight: 300, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: '#0A0A0A', background: '#FFFFFF', border: '1px solid #E8E8E5', outline: 'none', transition: 'border-color .12s', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = '#0033FF'}
            onBlur={e => e.target.style.borderColor = '#E8E8E5'}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 9, color: '#AAAAAA', letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: 'Courier New, monospace', marginBottom: 6 }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="��������"
              style={{ width: '100%', padding: '10px 40px 10px 12px', fontSize: 14, fontWeight: 300, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: '#0A0A0A', background: '#FFFFFF', border: '1px solid #E8E8E5', outline: 'none', transition: 'border-color .12s', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#0033FF'}
              onBlur={e => e.target.style.borderColor = '#E8E8E5'}
            />
            <button onClick={() => setShowPw(!showPw)} type="button" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#AAAAAA', fontSize: 11, fontFamily: 'Courier New, monospace' }}>
              {showPw ? 'hide' : 'show'}
            </button>
          </div>
        </div>

        <button
          onClick={handleSubmit} disabled={loading}
          style={{ width: '100%', padding: '12px', background: loading ? '#AAAAAA' : '#0033FF', color: '#fff', border: 'none', fontSize: 14, fontWeight: 400, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '.01em', transition: 'background .12s' }}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #E8E8E5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#AAAAAA', fontWeight: 300 }}>New to Taltas?</span>
          <a href="/register" style={{ fontSize: 12, color: '#0033FF', fontWeight: 400, textDecoration: 'none' }}>Create account ?</a>
        </div>
      </div>

      <div style={{ marginTop: 32, fontSize: 11, color: '#AAAAAA', display: 'flex', gap: 20 }}>
        <a href="https://taltas.ai/privacy.html" style={{ color: '#AAAAAA', textDecoration: 'none' }}>Privacy</a>
        <a href="https://taltas.ai/terms.html" style={{ color: '#AAAAAA', textDecoration: 'none' }}>Terms</a>
        <a href="https://taltas.ai" style={{ color: '#AAAAAA', textDecoration: 'none' }}>taltas.ai</a>
      </div>
    </div>
  );
}