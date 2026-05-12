'use client';
import { useEffect, useState } from 'react';
import { authApi } from '@/lib/api/auth';
import type { MfaSetupData, MfaEnableResponse } from '@/types/api';

interface Props {
  mfaToken: string;
  onSuccess: (resp: MfaEnableResponse) => void;
  onCancel: () => void;
}

const F = 'Helvetica Neue,Helvetica,Arial,sans-serif';
const MONO = 'Courier New,monospace';

export default function MfaSetupCard({ mfaToken, onSuccess, onCancel }: Props) {
  const [setup, setSetup] = useState<MfaSetupData | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [setupError, setSetupError] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await authApi.mfaSetupPending(mfaToken);
        if (!cancelled) setSetup(data);
      } catch (e: any) {
        if (!cancelled) {
          setSetupError(e?.response?.data?.message || e?.message || 'Failed to load MFA setup. Please log in again.');
        }
      }
    })();
    return () => { cancelled = true; };
  }, [mfaToken]);

  const handleVerify = async () => {
    setError('');
    if (code.length !== 6) { setError('Enter the 6-digit code from your authenticator.'); return; }
    setVerifying(true);
    try {
      const resp = await authApi.mfaEnablePending(mfaToken, code);
      onSuccess(resp);
    } catch (e: any) {
      let msg: any = e?.response?.data?.message ?? e?.message ?? '';
      if (Array.isArray(msg)) msg = msg.join('; ');
      if (typeof msg !== 'string') msg = String(msg);
      if (msg.toLowerCase().includes('invalid or expired')) {
        setError('Setup session expired or code rejected. Please log in again.');
      } else {
        setError(msg || 'Verification failed. Please log in again.');
      }
      setVerifying(false);
    }
  };

  if (setupError) {
    return (
      <>
        <div style={{fontSize:13,fontWeight:300,color:'rgba(255,255,255,.45)',marginBottom:32}}>Two-factor setup</div>
        <div style={{background:'rgba(255,255,255,.12)',border:'1px solid rgba(255,100,100,.4)',padding:'10px 14px',fontSize:12,fontWeight:300,color:'#fca5a5',marginBottom:16,lineHeight:1.5}}>{setupError}</div>
        <button onClick={onCancel} type="button" style={{width:'100%',padding:'14px',background:'#fff',color:'#2563eb',border:'none',fontSize:14,fontWeight:500,fontFamily:F,cursor:'pointer'}}>Back to login</button>
      </>
    );
  }

  if (!setup) {
    return (
      <>
        <div style={{fontSize:13,fontWeight:300,color:'rgba(255,255,255,.45)',marginBottom:32}}>Two-factor setup</div>
        <div style={{color:'rgba(255,255,255,.6)',fontSize:13,fontWeight:300,fontFamily:F}}>Preparing your authenticator setup...</div>
      </>
    );
  }

  const canSubmit = code.length === 6 && !verifying;

  return (
    <>
      <div style={{fontSize:13,fontWeight:300,color:'rgba(255,255,255,.45)',marginBottom:24}}>Scan with your authenticator app</div>

      <div style={{background:'#fff',padding:16,marginBottom:18,display:'flex',justifyContent:'center'}}>
        <img src={setup.qrDataUrl} width={200} height={200} alt="Authenticator QR code" style={{display:'block'}} />
      </div>

      <div style={{marginBottom:18}}>
        <label style={{display:'block',fontFamily:MONO,fontSize:9,letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(255,255,255,.45)',marginBottom:6}}>Or enter key manually</label>
        <code style={{display:'block',padding:'10px 14px',background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.2)',color:'#fff',fontSize:11,fontFamily:MONO,letterSpacing:1,wordBreak:'break-all',userSelect:'all'}}>{setup.secret}</code>
      </div>

      {error && <div style={{background:'rgba(255,255,255,.12)',border:'1px solid rgba(255,100,100,.4)',padding:'10px 14px',fontSize:12,fontWeight:300,color:'#fca5a5',marginBottom:16,lineHeight:1.5}}>{error}</div>}

      <div style={{marginBottom:18}}>
        <label style={{display:'block',fontFamily:MONO,fontSize:9,letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(255,255,255,.45)',marginBottom:6}}>6-digit code</label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={e => setCode(e.target.value.replace(/[^0-9]/g, ''))}
          onKeyDown={e => e.key === 'Enter' && handleVerify()}
          placeholder="000000"
          autoFocus
          style={{width:'100%',background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.2)',padding:'14px 16px',fontSize:20,fontFamily:MONO,letterSpacing:'.4em',textAlign:'center',color:'#fff',outline:'none',boxSizing:'border-box'}}
        />
      </div>

      <button onClick={handleVerify} type="button" disabled={!canSubmit} style={{width:'100%',padding:'14px',background:'#fff',color:'#2563eb',border:'none',fontSize:14,fontWeight:500,fontFamily:F,cursor:canSubmit?'pointer':'not-allowed',opacity:canSubmit?1:0.6}}>
        {verifying ? 'Verifying...' : 'Verify and continue'}
      </button>

      <div style={{textAlign:'center',marginTop:18}}>
        <button onClick={onCancel} type="button" style={{background:'none',border:'none',color:'rgba(255,255,255,.5)',fontSize:12,fontWeight:300,fontFamily:F,cursor:'pointer'}}>Back to login</button>
      </div>
    </>
  );
}
