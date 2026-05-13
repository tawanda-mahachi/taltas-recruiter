// @ts-nocheck
'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api/client';

const font = 'Helvetica Neue,Helvetica,Arial,sans-serif';
const BLUE = '#2563eb';
const TEAL = '#1D9E75';

function VerifyInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading'|'success'|'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('No verification token found.'); return; }
    api.get('/auth/verify-email?token=' + token)
      .then(() => setStatus('success'))
      .catch(e => {
        setStatus('error');
        setMessage(e?.response?.data?.message || 'This link is invalid or has expired.');
      });
  }, [token]);

  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#FFFFFF',fontFamily:font,padding:24}}>
      <a href="https://taltas.ai" style={{display:'flex',alignItems:'center',gap:10,marginBottom:48,textDecoration:'none'}}>
        <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
          <circle cx="30" cy="30" r="27" fill={BLUE}/>
          <polygon points="30,8 36,32 30,28 24,32" fill="white"/>
          <polygon points="30,52 34,32 30,36 26,32" fill="white" opacity="0.28"/>
          <line x1="12" y1="30" x2="48" y2="30" stroke="white" strokeWidth="1" opacity="0.25"/>
          <circle cx="30" cy="30" r="3.5" fill="white"/>
          <circle cx="30" cy="30" r="1.8" fill={BLUE}/>
        </svg>
        <div style={{fontSize:32,fontWeight:300,letterSpacing:'-0.03em'}}><span style={{color:'#0A0A0A'}}>Tal</span><span style={{color:BLUE}}>tas</span></div>
      </a>

      <div style={{maxWidth:420,width:'100%',textAlign:'center'}}>
        {status === 'loading' && (
          <>
            <div style={{fontSize:9,color:'#AAAAAA',letterSpacing:'.1em',textTransform:'uppercase',fontFamily:'Courier New,monospace',marginBottom:12}}>Verifying</div>
            <div style={{fontSize:22,fontWeight:300,color:'#0A0A0A',marginBottom:12}}>Confirming your email...</div>
            <div style={{fontSize:13,fontWeight:300,color:'#6B6B6B'}}>Just a moment.</div>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{width:56,height:56,borderRadius:'50%',background:'rgba(29,158,117,.08)',border:'1px solid rgba(29,158,117,.2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style={{fontSize:9,color:'#AAAAAA',letterSpacing:'.1em',textTransform:'uppercase',fontFamily:'Courier New,monospace',marginBottom:12}}>Verified</div>
            <div style={{fontSize:22,fontWeight:300,color:'#0A0A0A',marginBottom:12}}>Email confirmed</div>
            <p style={{fontSize:13,fontWeight:300,color:'#6B6B6B',lineHeight:1.7,marginBottom:32}}>Your email address has been verified. You can now sign in to your Taltas recruiter account.</p>
            <a href="/" style={{display:'inline-block',padding:'13px 32px',background:BLUE,color:'#fff',fontSize:14,fontWeight:500,fontFamily:font,textDecoration:'none'}}>
              Sign in to your account
            </a>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{width:56,height:56,borderRadius:'50%',background:'rgba(239,68,68,.08)',border:'1px solid rgba(239,68,68,.2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
            <div style={{fontSize:9,color:'#AAAAAA',letterSpacing:'.1em',textTransform:'uppercase',fontFamily:'Courier New,monospace',marginBottom:12}}>Error</div>
            <div style={{fontSize:22,fontWeight:300,color:'#0A0A0A',marginBottom:12}}>Verification failed</div>
            <p style={{fontSize:13,fontWeight:300,color:'#6B6B6B',lineHeight:1.7,marginBottom:32}}>{message}</p>
            <div style={{display:'flex',gap:12,justifyContent:'center'}}>
              <a href="/" style={{fontSize:13,color:'#6B6B6B',textDecoration:'none',fontWeight:300,padding:'10px 20px',border:'1px solid #E8E8E5'}}>Back to sign in</a>
              <a href="/register" style={{fontSize:13,color:'#fff',background:BLUE,textDecoration:'none',fontWeight:400,padding:'10px 20px',border:'none'}}>Register again</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return <Suspense fallback={null}><VerifyInner/></Suspense>;
}
