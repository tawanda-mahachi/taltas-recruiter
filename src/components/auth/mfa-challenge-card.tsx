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

export default function MfaChallengeCard({ mfaToken: initialToken, hasPhone, onSuccess, onCancel }: Props) {
  const [mfaToken, setMfaToken] = useState(initialToken);
  const [code, setCode] = useState('');
  const [method, setMethod] = useState<'totp' | 'backup'>('totp');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [verifying, setVerifying] = useState(false);

  const expectedLen = method === 'totp' ? 6 : 8;
  const canSubmit = code.length === expectedLen && !verifying;

  const handleVerify = async () => {
    setError('');
    setInfo('');
    if (code.length !== expectedLen) { setError(`Enter the ${expectedLen}-character code.`); return; }
    setVerifying(true);
    try {
      const resp = await authApi.mfaVerify(mfaToken, code, method);
      onSuccess(resp);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || '';
      if (msg.toLowerCase().includes('invalid or expired')) {
        setError('Code incorrect or session expired. Please log in again.');
      } else {
        setError(msg || 'Verification failed. Please log in again.');
      }
      setVerifying(false);
    }
  };

  const handleSendSms = async () => {
    setError('');
    setInfo('');
    setVerifying(true);
    try {
      const resp = await authApi.mfaSendSms(mfaToken);
      setMfaToken(resp.mfaToken);
      setInfo('Code sent. Check your phone.');
    } catch (e: any) {
      setError('Failed to send SMS. Try again.');
    }
    setVerifying(false);
  };

  const toggleMethod = () => {
    setMethod(method === 'totp' ? 'backup' : 'totp');
    setCode('');
    setError('');
    setInfo('');
  };

  return (
    <>
      <div style={{fontSize:13,fontWeight:300,color:'rgba(255,255,255,.45)',marginBottom:32}}>
        {method === 'totp' ? 'Enter the code from your authenticator app' : 'Enter one of your backup codes'}
      </div>

      {error && <div style={{background:'rgba(255,255,255,.12)',border:'1px solid rgba(255,100,100,.4)',padding:'10px 14px',fontSize:12,fontWeight:300,color:'#fca5a5',marginBottom:16,lineHeight:1.5}}>{error}</div>}
      {info && <div style={{background:'rgba(255,255,255,.12)',border:'1px solid rgba(255,255,255,.3)',padding:'10px 14px',fontSize:12,fontWeight:300,color:'#fff',marginBottom:16,lineHeight:1.5}}>{info}</div>}

      <div style={{marginBottom:20}}>
        <label style={{display:'block',fontFamily:MONO,fontSize:9,letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(255,255,255,.45)',marginBottom:6}}>
          {method === 'totp' ? '6-digit code' : 'Backup code'}
        </label>
        <input
          type="text"
          inputMode={method === 'totp' ? 'numeric' : 'text'}
          maxLength={expectedLen}
          value={code}
          onChange={e => {
            if (method === 'totp') setCode(e.target.value.replace(/[^0-9]/g, ''));
            else setCode(e.target.value.replace(/[^A-Fa-f0-9]/g, '').toUpperCase());
          }}
          onKeyDown={e => e.key === 'Enter' && handleVerify()}
          placeholder={method === 'totp' ? '000000' : 'XXXXXXXX'}
          autoFocus
          style={{width:'100%',background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.2)',padding:'14px 16px',fontSize:20,fontFamily:MONO,letterSpacing:'.4em',textAlign:'center',color:'#fff',outline:'none',boxSizing:'border-box'}}
        />
      </div>

      <button onClick={handleVerify} type="button" disabled={!canSubmit} style={{width:'100%',padding:'14px',background:'#fff',color:'#2563eb',border:'none',fontSize:14,fontWeight:500,fontFamily:F,cursor:canSubmit?'pointer':'not-allowed',opacity:canSubmit?1:0.6}}>
        {verifying ? 'Verifying...' : 'Verify'}
      </button>

      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10,marginTop:20}}>
        <button onClick={toggleMethod} type="button" style={{background:'none',border:'none',color:'rgba(255,255,255,.6)',fontSize:12,fontWeight:300,fontFamily:F,cursor:'pointer'}}>
          {method === 'totp' ? 'Use a backup code instead' : 'Use authenticator code instead'}
        </button>
        {hasPhone && method === 'totp' && (
          <button onClick={handleSendSms} type="button" disabled={verifying} style={{background:'none',border:'none',color:'rgba(255,255,255,.6)',fontSize:12,fontWeight:300,fontFamily:F,cursor:verifying?'not-allowed':'pointer'}}>
            Send code via SMS
          </button>
        )}
        <button onClick={onCancel} type="button" style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:12,fontWeight:300,fontFamily:F,cursor:'pointer',marginTop:6}}>
          Back to login
        </button>
      </div>
    </>
  );
}