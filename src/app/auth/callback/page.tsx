// @ts-nocheck
'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';

function Inner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setTokens = useAuthStore(s => s.setTokens);
  const [err, setErr] = useState('');

  useEffect(() => {
    const at = searchParams.get('accessToken');
    const rt = searchParams.get('refreshToken');
    const isNew = searchParams.get('isNew') === '1';
    const provider = searchParams.get('provider') || '';
    if (!at || !rt) { setErr('Authentication failed. Please try again.'); return; }
    try { const p = JSON.parse(atob(at.split('.')[1])); if (p.principalId) setTokens(at, rt); } catch(e) {}
    router.push(isNew ? '/register?provider=' + provider : '/dashboard');
  }, []);

  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'#F4F4F2',fontFamily:'Helvetica Neue,Helvetica,Arial,sans-serif'}}>
      {err ? (
        <div style={{textAlign:'center',padding:32}}>
          <div style={{fontSize:18,fontWeight:300,color:'#0A0A0A',marginBottom:8}}>Authentication Error</div>
          <div style={{fontSize:13,fontWeight:300,color:'#AAAAAA',marginBottom:24}}>{err}</div>
          <a href='/login' style={{padding:'10px 20px',background:'#0033FF',color:'#fff',textDecoration:'none',fontSize:13}}>Back to Login</a>
        </div>
      ) : (
        <div style={{textAlign:'center'}}>
          <div style={{width:32,height:32,border:'2px solid #0033FF',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 16px'}}/>
          <div style={{fontFamily:'Courier New,monospace',fontSize:10,color:'#AAAAAA',letterSpacing:'.1em'}}>SIGNING IN...</div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}/>}>
      <Inner/>
    </Suspense>
  );
}