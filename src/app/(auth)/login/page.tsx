// @ts-nocheck
'use client';
import { useState } from 'react';
import { useLogin } from '@/lib/hooks/use-auth';

const STEPS = [
  { letter:'S', icon:'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', title:'Screen with structure', desc:'Every candidate is assessed across six dimensions: skills, motivation, working style, culture, compensation fit, and timeline.' },
  { letter:'N', icon:'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', title:'Negotiate before the first call', desc:'Compensation bands, expectations, and timelines are surfaced agent-to-agent. Both sides know it is worth the meeting.' },
  { letter:'A', icon:'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', title:'Assess with depth', desc:'AI-powered conversation surfaces motivation, working style, and career context that a resume was never designed to carry.' },
  { letter:'P', icon:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', title:'Place with confidence', desc:'Receive a full candidate summary with match scores, sentiment analysis, and conversation transcript before making any decision.' },
];

export default function LoginPage() {
  const loginMutation = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const loading = loginMutation.isPending;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://api.taltas.ai/api/v1';

  const handleSubmit = async () => {
    setError('');
    if (!email.trim() || !password.trim()) { setError('Email and password are required.'); return; }
    try {
      await loginMutation.mutateAsync({ email: email.trim(), password: password.trim() });
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Login failed.');
    }
  };

  const METRICS = [{num:'6',label:'Fit dimensions per candidate'},{num:'4x',label:'Richer signal than a resume'},{num:'100%',label:'Structured evaluation, every time'}];

  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',background:'#FFFFFF',fontFamily:'Helvetica Neue,Helvetica,Arial,sans-serif',position:'relative',overflow:'hidden'}}>
      {/* Nav - matches landing page */}
      <nav style={{position:'sticky',top:0,zIndex:50,background:'rgba(255,255,255,.92)',backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)',borderBottom:'1px solid #E8E8E5',height:64,display:'flex',alignItems:'center',padding:'0 56px',fontFamily:'Helvetica Neue,Helvetica,Arial,sans-serif'}}>
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
      <div style={{position:'fixed',top:20,right:'30%',pointerEvents:'none',zIndex:0,opacity:.1}}>
        <svg width="700" height="700" viewBox="0 0 60 60" fill="none">
          <circle cx="30" cy="30" r="27" fill="none" stroke="#1D9E75" strokeWidth=".3"/>
                    <g>
              <animateTransform attributeName="transform" type="rotate"
                values="0 30 30;-28 30 30;33 30 30;-12 30 30;6 30 30;0 30 30;0 30 30;0 30 30"
                keyTimes="0;0.28;0.57;0.68;0.76;0.82;0.92;1"
                dur="6s" begin="1s" repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1"/>
              <polygon points="30,8 36,32 30,28 24,32" fill="#1D9E75" opacity="0.7"/>
              <polygon points="30,52 34,32 30,36 26,32" fill="#1D9E75" opacity="0.25"/>
              <circle cx="30" cy="30" r="2.5" fill="#1D9E75" opacity="0.6"/>
            </g>
          <g transform="rotate(23 30 30)">
            <ellipse cx="30" cy="10" rx="12" ry="3.5" fill="none" stroke="#1D9E75" strokeWidth=".18"/>
            <ellipse cx="30" cy="18" rx="22" ry="6" fill="none" stroke="#1D9E75" strokeWidth=".2"/>
            <ellipse cx="30" cy="26" rx="26.5" ry="7" fill="none" stroke="#1D9E75" strokeWidth=".22"/>
            <ellipse cx="30" cy="30" rx="27" ry="7.5" fill="none" stroke="#1D9E75" strokeWidth=".28"/>
            <ellipse cx="30" cy="34" rx="26.5" ry="7" fill="none" stroke="#1D9E75" strokeWidth=".22"/>
            <ellipse cx="30" cy="42" rx="22" ry="6" fill="none" stroke="#1D9E75" strokeWidth=".2"/>
            <ellipse cx="30" cy="50" rx="12" ry="3.5" fill="none" stroke="#1D9E75" strokeWidth=".18"/>
            <ellipse cx="30" cy="30" rx="27" ry="27" fill="none" stroke="#1D9E75" strokeWidth=".28">
              <animate attributeName="rx" values="27;0;27;0;27" dur="22s" repeatCount="indefinite" calcMode="spline" keySplines="0.5 0 0.5 1;0.5 0 0.5 1;0.5 0 0.5 1;0.5 0 0.5 1"/>
              <animate attributeName="opacity" values="1;0.15;1;0.15;1" dur="22s" repeatCount="indefinite"/>
            </ellipse>
            <ellipse cx="30" cy="30" rx="19" ry="27" fill="none" stroke="#1D9E75" strokeWidth=".22">
              <animate attributeName="rx" values="19;0;19;27;19;0;19" dur="22s" begin="-5.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.5 0 0.5 1;0.5 0 0.5 1;0.5 0 0.5 1;0.5 0 0.5 1;0.5 0 0.5 1;0.5 0 0.5 1"/>
              <animate attributeName="opacity" values="0.65;0.12;0.65;1;0.65;0.12;0.65" dur="22s" begin="-5.5s" repeatCount="indefinite"/>
            </ellipse>
            <ellipse cx="30" cy="30" rx="0" ry="27" fill="none" stroke="#1D9E75" strokeWidth=".28">
              <animate attributeName="rx" values="0;27;0;27;0" dur="22s" begin="-11s" repeatCount="indefinite" calcMode="spline" keySplines="0.5 0 0.5 1;0.5 0 0.5 1;0.5 0 0.5 1;0.5 0 0.5 1"/>
              <animate attributeName="opacity" values="0.15;1;0.15;1;0.15" dur="22s" begin="-11s" repeatCount="indefinite"/>
            </ellipse>
          </g>
        </svg>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 460px',flex:1,position:'relative',zIndex:1}}>
        <div style={{padding:'48px 72px',display:'flex',flexDirection:'column',justifyContent:'center',overflowY:'auto'}}>
          <h1 style={{fontSize:'clamp(32px,3.5vw,50px)',fontWeight:300,letterSpacing:'-0.03em',lineHeight:1.05,color:'#0A0A0A',marginBottom:16}}>Hire with depth.<br/>Not just keywords.</h1>
          <p style={{fontSize:15,fontWeight:300,color:'#6B6B6B',lineHeight:1.8,marginBottom:40,maxWidth:480}}>Stop reading resumes. Your Explorer Agent conducts structured conversations with candidates and surfaces what a two-page document was never designed to carry � motivation, working style, career context, and real fit across six dimensions.</p>
          <div style={{border:'1px solid #E8E8E5',marginBottom:40}}>
            {METRICS.map((m,i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:24,padding:'11px 20px',borderBottom:i<METRICS.length-1?'1px solid #E8E8E5':'none'}}>
                <div style={{fontSize:36,fontWeight:300,letterSpacing:'-2px',color:'#0033FF',lineHeight:1,flexShrink:0,width:72}}>{m.num}</div>
                <div style={{fontSize:12,fontWeight:300,color:'#6B6B6B',lineHeight:1.5}}>{m.label}</div>
              </div>
            ))}
          </div>
          <div style={{display:'flex',flexDirection:'column'}}>
            {STEPS.map((s,i) => (
              <div key={i} style={{display:'flex',gap:16,padding:'14px 0',borderBottom:'1px solid #E8E8E5',borderTop:i===0?'1px solid #E8E8E5':'none'}}>
                <div style={{width:30,height:30,borderRadius:'50%',background:'rgba(0,51,255,.06)',border:'1px solid rgba(0,51,255,.14)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0033FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon}/></svg>
                </div>
                <div>
                  <div style={{fontSize:13,fontWeight:400,color:'#0A0A0A',marginBottom:3}}>{s.title}</div>
                  <div style={{fontSize:12,fontWeight:300,color:'#6B6B6B',lineHeight:1.6}}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:'#0033FF',display:'flex',flexDirection:'column',justifyContent:'flex-start',padding:'48px 48px',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-80,left:-80,width:300,height:300,borderRadius:'50%',background:'rgba(255,255,255,.04)',pointerEvents:'none'}}/>
          <div style={{position:'absolute',bottom:-60,right:-60,width:220,height:220,borderRadius:'50%',background:'rgba(255,255,255,.03)',pointerEvents:'none'}}/>
          <div style={{position:'relative',zIndex:1}}>

            <div style={{fontSize:22,fontWeight:300,letterSpacing:'.08em',color:'rgba(255,255,255,.95)',marginBottom:6,textTransform:'uppercase'}}>Recruiter Portal</div>
            <div style={{fontSize:13,fontWeight:300,color:'rgba(255,255,255,.45)',marginBottom:32}}>Sign in to your account</div>

            {error && <div style={{background:'rgba(255,255,255,.12)',border:'1px solid rgba(255,100,100,.4)',padding:'10px 14px',fontSize:12,fontWeight:300,color:'#fca5a5',marginBottom:16,lineHeight:1.5}}>{error}</div>}

            <div style={{marginBottom:14}}>
              <label style={{display:'block',fontFamily:'Courier New,monospace',fontSize:9,letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(255,255,255,.45)',marginBottom:6}}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSubmit()} placeholder="you@email.com" style={{width:'100%',background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.2)',padding:'12px 16px',fontSize:13,fontWeight:300,fontFamily:'Helvetica Neue,Helvetica,Arial,sans-serif',color:'#fff',outline:'none',boxSizing:'border-box'}}/>
            </div>

            <div style={{marginBottom:24}}>
              <label style={{display:'block',fontFamily:'Courier New,monospace',fontSize:9,letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(255,255,255,.45)',marginBottom:6}}>Password</label>
              <div style={{position:'relative'}}>
                <input type={showPw?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSubmit()} placeholder="password" style={{width:'100%',background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.2)',padding:'12px 48px 12px 16px',fontSize:13,fontWeight:300,fontFamily:'Helvetica Neue,Helvetica,Arial,sans-serif',color:'#fff',outline:'none',boxSizing:'border-box'}}/>
                <button onClick={()=>setShowPw(!showPw)} type="button" style={{position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,.4)',fontSize:11,fontFamily:'Helvetica Neue,Helvetica,Arial,sans-serif',fontWeight:300}}>{showPw?'hide':'show'}</button>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={loading} style={{width:'100%',padding:'14px',background:'#fff',color:'#0033FF',border:'none',fontSize:14,fontWeight:500,fontFamily:'Helvetica Neue,Helvetica,Arial,sans-serif',cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1}}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div style={{display:'flex',alignItems:'center',gap:10,margin:'20px 0'}}>
              <div style={{flex:1,height:1,background:'rgba(255,255,255,.12)'}}/>
              <span style={{fontFamily:'Helvetica Neue,Helvetica,Arial,sans-serif',fontSize:11,fontWeight:300,color:'rgba(255,255,255,.3)'}}>or continue with</span>
              <div style={{flex:1,height:1,background:'rgba(255,255,255,.12)'}}/>
            </div>

            <div style={{display:'flex',gap:10,marginBottom:24}}>
              <a href={apiBase+'/auth/google'} style={{flex:1,padding:'11px 0',background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.18)',color:'rgba(255,255,255,.8)',fontFamily:'Helvetica Neue,Helvetica,Arial,sans-serif',fontSize:12,fontWeight:300,display:'flex',alignItems:'center',justifyContent:'center',gap:8,textDecoration:'none'}}>
                <svg width="14" height="14" viewBox="0 0 24 24"><path fill="rgba(255,255,255,.9)" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="rgba(255,255,255,.9)" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="rgba(255,255,255,.9)" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="rgba(255,255,255,.9)" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </a>
              <a href={apiBase+'/auth/linkedin'} style={{flex:1,padding:'11px 0',background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.18)',color:'rgba(255,255,255,.8)',fontFamily:'Helvetica Neue,Helvetica,Arial,sans-serif',fontSize:12,fontWeight:300,display:'flex',alignItems:'center',justifyContent:'center',gap:8,textDecoration:'none'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,.9)"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </a>
            </div>

            <div style={{textAlign:'center',fontSize:13,fontWeight:300,color:'rgba(255,255,255,.5)'}}>
              New to Taltas? <a href="/register" style={{color:'#fff',textDecoration:'none',fontWeight:400}}>Create account</a>
            </div>
          </div>
        </div>
      </div>
      <footer style={{background:'#0B1D35',padding:'40px 56px 28px',position:'relative',zIndex:1,fontFamily:'Helvetica Neue,Helvetica,Arial,sans-serif'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:28}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
              <svg width="36" height="36" viewBox="0 0 60 60" fill="none">
                <circle cx="30" cy="30" r="27" fill="#1D9E75"/>
                <polygon points="30,8 36,32 30,28 24,32" fill="white"/>
                <polygon points="30,52 34,32 30,36 26,32" fill="white" opacity="0.28"/>
                <line x1="12" y1="30" x2="48" y2="30" stroke="white" strokeWidth="1" opacity="0.25"/>
                <circle cx="30" cy="30" r="3.5" fill="white"/>
                <circle cx="30" cy="30" r="1.8" fill="#1D9E75"/>
              </svg>
              <div style={{fontSize:20,fontWeight:300,letterSpacing:'-0.03em',lineHeight:1}}><span style={{color:'#fff'}}>Tal</span><span style={{color:'#1D9E75'}}>tas</span></div>
            </div>
            <div style={{display:'flex',gap:14,marginTop:4}}>
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
              <div style={{fontSize:9,color:'rgba(255,255,255,.4)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:12,fontFamily:'Courier New,monospace'}}>Platform</div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                <a href="https://candidates.taltas.ai" style={{fontSize:12,fontWeight:300,color:'rgba(255,255,255,.5)',textDecoration:'none'}}>Candidate Portal</a>
                <a href="https://recruiters.taltas.ai" style={{fontSize:12,fontWeight:300,color:'rgba(255,255,255,.5)',textDecoration:'none'}}>Recruiter Portal</a>
              </div>
            </div>
            <div>
              <div style={{fontSize:9,color:'rgba(255,255,255,.4)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:12,fontFamily:'Courier New,monospace'}}>Legal</div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                <a href="https://taltas.ai/privacy.html" style={{fontSize:12,fontWeight:300,color:'rgba(255,255,255,.5)',textDecoration:'none'}}>Privacy</a>
                <a href="https://taltas.ai/terms.html" style={{fontSize:12,fontWeight:300,color:'rgba(255,255,255,.5)',textDecoration:'none'}}>Terms</a>
                <a href="https://taltas.ai/contact.html" style={{fontSize:12,fontWeight:300,color:'rgba(255,255,255,.5)',textDecoration:'none'}}>Contact</a>
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