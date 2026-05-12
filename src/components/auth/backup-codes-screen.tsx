'use client';
import { useState } from 'react';

interface Props {
  codes: string[];
  onContinue: () => void;
}

const F = 'Helvetica Neue,Helvetica,Arial,sans-serif';
const MONO = 'Courier New,monospace';

export default function BackupCodesScreen({ codes, onContinue }: Props) {
  const [acked, setAcked] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codes.join('\n'));
      setCopied(true);
      setAcked(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API may fail in dev/non-https; user can still download
    }
  };

  const handleDownload = () => {
    const text = 'Taltas backup codes\nGenerated ' + new Date().toISOString() + '\nEach code is single-use.\n\n' + codes.join('\n') + '\n';
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'taltas-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setAcked(true);
  };

  return (
    <>
      <div style={{fontSize:13,fontWeight:300,color:'rgba(255,255,255,.45)',marginBottom:14}}>Save your backup codes</div>

      <div style={{background:'rgba(245,158,11,.15)',border:'1px solid rgba(245,158,11,.4)',padding:'10px 14px',fontSize:12,fontWeight:300,color:'#fbbf24',marginBottom:18,lineHeight:1.5}}>
        Store these somewhere safe. They will not be shown again. Each code is single-use and can replace your authenticator if you lose it.
      </div>

      <div style={{background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.15)',padding:'16px 18px',marginBottom:18}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 24px'}}>
          {codes.map((c, i) => (
            <div key={i} style={{color:'#fff',fontSize:14,fontFamily:MONO,letterSpacing:1,userSelect:'all'}}>{c}</div>
          ))}
        </div>
      </div>

      <div style={{display:'flex',gap:10,marginBottom:18}}>
        <button onClick={handleCopy} type="button" style={{flex:1,padding:'11px 0',background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.2)',color:'#fff',fontSize:12,fontWeight:300,fontFamily:F,cursor:'pointer'}}>
          {copied ? 'Copied' : 'Copy all'}
        </button>
        <button onClick={handleDownload} type="button" style={{flex:1,padding:'11px 0',background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.2)',color:'#fff',fontSize:12,fontWeight:300,fontFamily:F,cursor:'pointer'}}>
          Download .txt
        </button>
      </div>

      <button onClick={onContinue} type="button" disabled={!acked} style={{width:'100%',padding:'14px',background:acked?'#fff':'rgba(255,255,255,.15)',color:acked?'#2563eb':'rgba(255,255,255,.5)',border:'none',fontSize:14,fontWeight:500,fontFamily:F,cursor:acked?'pointer':'not-allowed'}}>
        I&apos;ve saved them, continue
      </button>

      {!acked && <div style={{textAlign:'center',marginTop:10,fontSize:11,fontWeight:300,color:'rgba(255,255,255,.4)',fontFamily:F}}>Copy or download once to continue</div>}
    </>
  );
}