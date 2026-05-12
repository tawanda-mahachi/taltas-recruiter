'use client';
import { useState } from 'react';
import { authApi } from '@/lib/api/auth';
import type { MfaVerifyResponse } from '@/types/api';

interface Props {
  mfaToken: string;
  hasPhone: boolean;
  onSuccess: (resp: MfaVerifyResponse) => void;
  onCancel: () => void;
}

const F = 'Helvetica Neue,Helvetica,Arial,sans-serif';
const MONO = 'Courier New,monospace';

function extractMessage(e: any): string {
  let msg: any = e?.response?.data?.message ?? e?.message ?? '';
  if (Array.isArray(msg)) msg = msg.join('; ');
  if (typeof msg !== 'string') msg = String(msg);
  return msg;
}

export default function MfaChallengeCard({ mfaToken, hasPhone: _hasPhone, onSuccess, onCancel }: Props) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const canSubmit = code.length === 6 && !verifying;

  const handleVerify = async () => {
    setError('');
    if (code.length !== 6) { setError('Enter the 6-digit code from your authenticator.'); return; }
    setVerifying(true);
    try {
      const resp = await authApi.mfaVerify(mfaToken, code);
      onSuccess(resp);
    } catch (e: any) {
      const msg = extractMessage(e);
      if (msg.toLowerCase().includes('invalid or expired')) {
        setError('Code incorrect or session expired. Please log in again.');
      } else {
        setError(msg || 'Verification failed. Please log in again.');
      }
      setVerifying(false);
    }
  };

  return (
    <>
      <div style={{fontSize:13,fontWeight:300,color:'rgba(255,255,255,.45)',marginBottom:32}}>Enter the code from your authenticator app</div>

      {error && <div style={{background:'rgba(255,255,255,.12)',border:'1px solid rgba(255,100,100,.4)',padding:'10px 14px',fontSize:12,fontWeight:300,color:'#fca5a5',marginBottom:16,lineHeight:1.5}}>{error}</div>}

      <div style={{marginBottom:20}}>
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
        {verifying ? 'Verifying...' : 'Verify'}
      </button>

      <div style={{textAlign:'center',marginTop:20}}>
        <button onClick={onCancel} type="button" style={{background:'none',border:'none',color:'rgba(255,255,255,.5)',fontSize:12,fontWeight:300,fontFamily:F,cursor:'pointer'}}>Back to login</button>
      </div>
    </>
  );
}