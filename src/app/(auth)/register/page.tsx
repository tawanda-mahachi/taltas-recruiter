// @ts-nocheck
'use client';
import { useState } from 'react';
import { useRegister } from '@/lib/hooks/use-auth';

const BENEFITS = ["AI-powered structured candidate conversations","Six-dimension fit scoring on every candidate","Agent-to-agent negotiation before the first call","Full candidate summaries with sentiment analysis","ATS integration with Greenhouse, Lever, and Workday","Push candidates directly to your ATS on match"];
const ACC = '#2563eb';
const font = 'Helvetica Neue,Helvetica,Arial,sans-serif';

export default function RegisterPage() {
  const registerMutation = useRegister ? useRegister() : { mutateAsync: async () => {}, isPending: false };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const loading = registerMutation.isPending;

  const handleSubmit = async () => {
    setError('');
    if (!email.trim() || !password.trim()) { setError('Email and password are required.'); return; }
    try {
      await registerMutation.mutateAsync({ email: email.trim(), password: password.trim(), firstName: firstName.trim(), lastName: lastName.trim(), principalType: 'recruiter' });
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Registration failed.');
    }
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',background:'#FFFFFF',fontFamily:font}}>
      <nav style={{position:'sticky',top:0,zIndex:50,background:'rgba(255,255,255,.92)',backdropFilter:'blur(8px)',borderBottom:'1px solid #E8E8E5',height:64,display:'flex',alignItems:'center',padding:'0 56px'}}>
        <a href="https://taltas.ai" style={{display:'flex',alignItems:'center',gap:12,marginRight:'auto',textDecoration:'none'}}>
          <svg width="50" height="50" viewBox="0 0 60 60" fill="none">
            <circle cx="30" cy="30" r="27" fill="#1D9E75"/>
            <polygon points="30,8 36,32 30,28 24,32" fill="white"/>
            <polygon points="30,52 34,32 30,36 26,32" fill="white" opacity="0.28"/>
            <line x1="12" y1="30" x2="48" y2="30" stroke="white" strokeWidth="1" opacity="0.25"/>
            <circle cx="30" cy="30" r="3.5" fill="white"/>
            <circle cx="30" cy="30" r="1.8" fill="#1D9E75"/>
          </svg>
          <div style={{display:'flex',alignItems:'flex-end',gap:10}}>
            <div style={{fontSize:40,fontWeight:300,letterSpacing:'-0.03em',lineHeight:1}}><span style={{color:'#0A0A0A'}}>Tal</span><span style={{color:'#1D9E75'}}>tas</span></div>
            <div style={{fontSize:11,color:'#AAAAAA',letterSpacing:'.1em',textTransform:'uppercase',fontWeight:400,lineHeight:1,marginBottom:7}}>Your Talent Atlas</div>
          </div>
        </a>
        <div style={{display:'flex',gap:32,alignItems:'center'}}>
          <a href="https://taltas.ai#how-it-works" style={{fontSize:14,color:'#AAAAAA',fontWeight:300,textDecoration:'none'}}>How it works</a>
          <a href="https://candidates.taltas.ai" style={{fontSize:14,color:'#AAAAAA',fontWeight:300,textDecoration:'none'}}>Candidates</a>
          <a href="https://recruiters.taltas.ai" style={{fontSize:14,color:'#AAAAAA',fontWeight:300,textDecoration:'none'}}>Recruiters</a>
        </div>
      </nav>

      <div style={{display:'grid',gridTemplateColumns:'1fr 460px',flex:1}}>
        <div style={{padding:'48px 72px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
          <h1 style={{fontSize:'clamp(32px,3.5vw,50px)',fontWeight:300,letterSpacing:'-0.03em',lineHeight:1.05,color:'#0A0A0A',marginBottom:16}}>Hire smarter.<br/>Starting today.</h1>
          <p style={{fontSize:15,fontWeight:300,color:'#6B6B6B',lineHeight:1.8,marginBottom:40,maxWidth:480}}>Stop reading resumes. Your Explorer Agent conducts structured conversations with candidates and surfaces what matters across six dimensions of fit.</p>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {BENEFITS.map((b,i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:20,height:20,borderRadius:'50%',background:'rgba(37,99,235,.06)',border:'1px solid rgba(37,99,235,.14)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span style={{fontSize:13,fontWeight:300,color:'#6B6B6B'}}>{b}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:ACC,display:'flex',flexDirection:'column',justifyContent:'center',padding:'48px 48px',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-80,left:-80,width:300,height:300,borderRadius:'50%',background:'rgba(255,255,255,.04)',pointerEvents:'none'}}/>
          <div style={{position:'absolute',bottom:-60,right:-60,width:220,height:220,borderRadius:'50%',background:'rgba(255,255,255,.03)',pointerEvents:'none'}}/>
          <div style={{position:'relative',zIndex:1}}>
            <div style={{fontSize:22,fontWeight:300,letterSpacing:'.08em',color:'rgba(255,255,255,.95)',marginBottom:6,textTransform:'uppercase'}}>Recruiter Portal</div>
            <div style={{fontSize:13,fontWeight:300,color:'rgba(255,255,255,.45)',marginBottom:32}}>Create your recruiter account</div>

            {error && <div style={{background:'rgba(255,255,255,.12)',border:'1px solid rgba(255,100,100,.4)',padding:'10px 14px',fontSize:12,fontWeight:300,color:'#fca5a5',marginBottom:16,lineHeight:1.5}}>{error}</div>}

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
              {[['First name',firstName,setFirstName],['Last name',lastName,setLastName]].map(([lbl,val,set]) => (
                <div key={lbl}>
                  <label style={{display:'block',fontFamily:'Helvetica Neue',Helvetica,Arial,sans-serif,fontSize:9,letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(255,255,255,.45)',marginBottom:6}}>{lbl}</label>
                  <input value={val} onChange={e=>set(e.target.value)} placeholder={lbl} style={{width:'100%',background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.2)',padding:'11px 14px',fontSize:13,fontWeight:300,fontFamily:font,color:'#fff',outline:'none',boxSizing:'border-box'}}/>
                </div>
              ))}
            </div>

            {[['Email',email,setEmail,'email','you@company.com'],['Password',password,setPassword,'password','password']].map(([lbl,val,set,type,ph]) => (
              <div key={lbl} style={{marginBottom:14}}>
                <label style={{display:'block',fontFamily:'Helvetica Neue',Helvetica,Arial,sans-serif,fontSize:9,letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(255,255,255,.45)',marginBottom:6}}>{lbl}</label>
                <input type={type} value={val} onChange={e=>set(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSubmit()} placeholder={ph} style={{width:'100%',background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.2)',padding:'11px 14px',fontSize:13,fontWeight:300,fontFamily:font,color:'#fff',outline:'none',boxSizing:'border-box'}}/>
              </div>
            ))}

            <button onClick={handleSubmit} disabled={loading} style={{width:'100%',padding:'14px',background:'#fff',color:ACC,border:'none',fontSize:14,fontWeight:500,fontFamily:font,cursor:loading?'not-allowed':'pointer',marginTop:8,opacity:loading?0.7:1}}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>

            <div style={{textAlign:'center',fontSize:13,fontWeight:300,color:'rgba(255,255,255,.5)',marginTop:20}}>
              Already have an account? <a href="/login" style={{color:'#fff',textDecoration:'none',fontWeight:400}}>Sign in</a>
            </div>
          </div>
        </div>
      </div>

      <footer style={{background:'#0B1D35',padding:'40px 56px 28px',fontFamily:font}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:28}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
              <svg width="36" height="36" viewBox="0 0 60 60" fill="none">
                <circle cx="30" cy="30" r="27" fill="#1D9E75"/>
                <polygon points="30,8 36,32 30,28 24,32" fill="white"/>
                <polygon points="30,52 34,32 30,36 26,32" fill="white" opacity="0.28"/>
                <circle cx="30" cy="30" r="3.5" fill="white"/>
              </svg>
              <div style={{fontSize:20,fontWeight:300,color:'#fff'}}>Tal<span style={{color:'#1D9E75'}}>tas</span></div>
            </div>
            <div style={{display:'flex',gap:14}}>
              <a href="https://linkedin.com/company/taltas-ai" target="_blank" style={{width:28,height:28,background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.12)',display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none',color:'rgba(255,255,255,.5)'}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="https://x.com/taltasai" target="_blank" style={{width:28,height:28,background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.12)',display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none',color:'rgba(255,255,255,.5)'}}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>
          <div style={{display:'flex',gap:48}}>
            <div>
              <div style={{fontSize:9,color:'rgba(255,255,255,.4)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:12,fontFamily:'Helvetica Neue',Helvetica,Arial,sans-serif}}>Platform</div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                <a href="https://candidates.taltas.ai" style={{fontSize:12,fontWeight:300,color:'rgba(255,255,255,.5)',textDecoration:'none'}}>Candidate Portal</a>
                <a href="https://recruiters.taltas.ai" style={{fontSize:12,fontWeight:300,color:'rgba(255,255,255,.5)',textDecoration:'none'}}>Recruiter Portal</a>
              </div>
            </div>
            <div>
              <div style={{fontSize:9,color:'rgba(255,255,255,.4)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:12,fontFamily:'Helvetica Neue',Helvetica,Arial,sans-serif}}>Legal</div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                <a href="https://taltas.ai/privacy.html" style={{fontSize:12,fontWeight:300,color:'rgba(255,255,255,.5)',textDecoration:'none'}}>Privacy</a>
                <a href="https://taltas.ai/terms.html" style={{fontSize:12,fontWeight:300,color:'rgba(255,255,255,.5)',textDecoration:'none'}}>Terms</a>
              </div>
            </div>
          </div>
        </div>
        <div style={{display:'flex',justifyContent:'flex-end'}}>
          <span style={{fontSize:11,fontWeight:300,color:'rgba(255,255,255,.3)'}}>2026 Taltas. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}