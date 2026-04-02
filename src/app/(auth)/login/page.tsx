// @ts-nocheck
'use client';
import { useState } from 'react';
import { useLogin } from '@/lib/hooks/use-auth';

const STEPS = [
  { letter:'S', title:'Screen with structure, not guesswork', desc:'Every candidate is assessed across six dimensions � skills, motivation, working style, culture, compensation fit, and timeline.' },
  { letter:'N', title:'Negotiate before the first call', desc:'Compensation bands, expectations, and timelines are surfaced agent-to-agent. Both sides know it is worth the meeting before it happens.' },
  { letter:'A', title:'Assess with depth', desc:'AI-powered conversation surfaces what a resume compresses into a bullet point � motivation, working style, career context.' },
  { letter:'P', title:'Place with confidence', desc:'You receive a full candidate summary with match scores, sentiment analysis, and conversation transcript before making any decision.' },
];

const METRICS = [
  { num:'6', label:'Fit dimensions per candidate' },
  { num:'4x', label:'Richer signal than a resume' },
  { num:'100%', label:'Structured evaluation, every time' },
];

const ACC = '#0033FF';
const font = 'Helvetica Neue,Helvetica,Arial,sans-serif';

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

  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',background:'#FFFFFF',fontFamily:font,position:'relative',overflow:'hidden'}}>
      {/* Globe */}
      <div style={{position:'fixed',top:20,right:40,pointerEvents:'none',zIndex:0,opacity:.1}}>
        <svg width="700" height="700" viewBox="0 0 60 60" fill="none">
          <circle cx="30" cy="30" r="27" fill="none" stroke="#1D9E75" strokeWidth=".3"/>
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

      {/* Two-column layout */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 480px',flex:1,position:'relative',zIndex:1}}>

        {/* LEFT � value prop */}
        <div style={{padding:'64px 72px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
          <div style={{fontFamily:'Courier New,monospace',fontSize:10,color:ACC,letterSpacing:'.18em',textTransform:'uppercase',marginBottom:20,display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:20,height:1,background:ACC}}/>
            Explorer Agent
          </div>
          <h1 style={{fontSize:'clamp(36px,3.5vw,54px)',fontWeight:300,letterSpacing:'-0.03em',lineHeight:1.05,color:'#0A0A0A',marginBottom:16}}>Hire with depth.<br/>Not just keywords.</h1>
          <p style={{fontSize:15,color:'#6B6B6B',lineHeight:1.8,fontWeight:300,marginBottom:48,maxWidth:480}}>Taltas Explorer Agents conduct structured conversations with candidates � surfacing the six dimensions of fit that a resume was never designed to carry.</p>

          <div style={{display:'flex',flexDirection:'column',marginBottom:48,border:'1px solid #E8E8E5',overflow:'hidden'}}>
            {METRICS.map((m, i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:24,padding:'18px 24px',borderBottom:i<METRICS.length-1?'1px solid #E8E8E5':'none',background:'#FFFFFF'}}>
                <div style={{fontSize:40,fontWeight:300,letterSpacing:'-2px',color:ACC,lineHeight:1,flexShrink:0,width:80}}>{m.num}</div>
                <div style={{fontSize:12,color:'#6B6B6B',fontWeight:300,lineHeight:1.5}}>{m.label}</div>
              </div>
            ))}
          </div>

          <div style={{display:'flex',flexDirection:'column'}}>
            {STEPS.map((s, i) => (
              <div key={i} style={{display:'flex',gap:16,padding:'14px 0',borderBottom:'1px solid #E8E8E5',borderTop:i===0?'1px solid #E8E8E5':'none'}}>
                <div style={{width:28,height:28,borderRadius:'50%',background:'rgba(0,51,255,.08)',border:'1px solid rgba(0,51,255,.18)',color:ACC,fontFamily:'Courier New,monospace',fontSize:10,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:2}}>{s.letter}</div>
                <div>
                  <div style={{fontSize:13,fontWeight:400,color:'#0A0A0A',marginBottom:3}}>{s.title}</div>
                  <div style={{fontSize:12,color:'#6B6B6B',fontWeight:300,lineHeight:1.6}}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT � login */}
        <div style={{background:ACC,display:'flex',flexDirection:'column',justifyContent:'flex-start',padding:'52px 48px',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-80,left:-80,width:300,height:300,borderRadius:'50%',background:'rgba(255,255,255,.04)',pointerEvents:'none'}}/>
          <div style={{position:'absolute',bottom:-60,right:-60,width:220,height:220,borderRadius:'50%',background:'rgba(255,255,255,.03)',pointerEvents:'none'}}/>
          <div style={{position:'relative',zIndex:1}}>
            <a href="https://taltas.ai" style={{display:'flex',alignItems:'center',gap:10,textDecoration:'none',marginBottom:40}}>
              <svg width="32" height="32" viewBox="0 0 60 60" fill="none">
                <circle cx="30" cy="30" r="27" fill="rgba(255,255,255,.2)"/>
                <polygon points="30,8 36,32 30,28 24,32" fill="white"/>
                <polygon points="30,52 34,32 30,36 26,32" fill="white" opacity="0.28"/>
                <line x1="12" y1="30" x2="48" y2="30" stroke="white" strokeWidth="1" opacity="0.25"/>
                <circle cx="30" cy="30" r="3.5" fill="white"/>
              </svg>
              <div>
                <div style={{fontSize:22,fontWeight:300,letterSpacing:'-0.03em',lineHeight:1,color:'#fff'}}>Taltas</div>
                <div style={{fontSize:8,color:'rgba(255,255,255,.5)',letterSpacing:'.1em',textTransform:'uppercase',marginTop:2}}>Recruiter Portal</div>
              </div>
            </a>

            <div style={{fontFamily:'Courier New,monospace',fontSize:9,color:'rgba(255,255,255,.4)',letterSpacing:'.18em',textTransform:'uppercase',marginBottom:24}}>Sign In</div>
            <div style={{fontSize:24,fontWeight:300,color:'#fff',marginBottom:6,letterSpacing:'-0.02em'}}>Welcome back</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,.5)',marginBottom:28}}>Sign in to your recruiter account</div>

            {error && <div style={{background:'rgba(255,255,255,.12)',border:'1px solid rgba(255,100,100,.4)',padding:'10px 14px',fontSize:12,color:'#fca5a5',marginBottom:16,lineHeight:1.5}}>{error}</div>}

            <div style={{marginBottom:14}}>
              <label style={{display:'block',fontFamily:'Courier New,monospace',fontSize:9,letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(255,255,255,.45)',marginBottom:6}}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSubmit()} placeholder="you@company.com" style={{width:'100%',background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.2)',padding:'12px 16px',fontSize:13,color:'#fff',fontFamily:font,outline:'none',boxSizing:'border-box'}}/>
            </div>

            <div style={{marginBottom:24}}>
              <label style={{display:'block',fontFamily:'Courier New,monospace',fontSize:9,letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(255,255,255,.45)',marginBottom:6}}>Password</label>
              <div style={{position:'relative'}}>
                <input type={showPw?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSubmit()} placeholder="��������" style={{width:'100%',background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.2)',padding:'12px 48px 12px 16px',fontSize:13,color:'#fff',fontFamily:font,outline:'none',boxSizing:'border-box'}}/>
                <button onClick={()=>setShowPw(!showPw)} type="button" style={{position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,.4)',fontSize:11,fontFamily:'Courier New,monospace'}}>{showPw?'hide':'show'}</button>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={loading} style={{width:'100%',padding:'14px',background:'#fff',color:ACC,border:'none',fontSize:13,fontWeight:500,fontFamily:font,cursor:loading?'not-allowed':'pointer',letterSpacing:'.01em',opacity:loading?0.7:1}}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div style={{display:'flex',alignItems:'center',gap:10,margin:'20px 0'}}>
              <div style={{flex:1,height:1,background:'rgba(255,255,255,.12)'}}/>
              <span style={{fontFamily:'Courier New,monospace',fontSize:9,color:'rgba(255,255,255,.3)',letterSpacing:'.1em',textTransform:'uppercase'}}>or continue with</span>
              <div style={{flex:1,height:1,background:'rgba(255,255,255,.12)'}}/>
            </div>

            <div style={{display:'flex',gap:10,marginBottom:24}}>
              <a href={apiBase+'/auth/google'} style={{flex:1,padding:'11px 0',background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.18)',color:'rgba(255,255,255,.75)',fontFamily:'Courier New,monospace',fontSize:10,letterSpacing:'.06em',display:'flex',alignItems:'center',justifyContent:'center',gap:8,textDecoration:'none'}}>
                <svg width="14" height="14" viewBox="0 0 24 24"><path fill="rgba(255,255,255,.8)" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="rgba(255,255,255,.8)" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="rgba(255,255,255,.8)" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="rgba(255,255,255,.8)" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </a>
              <a href={apiBase+'/auth/linkedin'} style={{flex:1,padding:'11px 0',background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.18)',color:'rgba(255,255,255,.75)',fontFamily:'Courier New,monospace',fontSize:10,letterSpacing:'.06em',display:'flex',alignItems:'center',justifyContent:'center',gap:8,textDecoration:'none'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,.8)"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </a>
            </div>

            <div style={{textAlign:'center',fontSize:13,color:'rgba(255,255,255,.5)'}}>
              New to Taltas? <a href="/register" style={{color:'#fff',textDecoration:'none',fontWeight:400}}>Create account</a>
            </div>
          </div>
        </div>
      </div>

      {/* Navy Footer */}
      <footer style={{background:'#0B1D35',padding:'40px 56px 28px',position:'relative',zIndex:1}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:28}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <svg width="24" height="24" viewBox="0 0 60 60" fill="none">
              <circle cx="30" cy="30" r="27" fill="#1D9E75"/>
              <polygon points="30,8 36,32 30,28 24,32" fill="white"/>
              <polygon points="30,52 34,32 30,36 26,32" fill="white" opacity="0.28"/>
              <circle cx="30" cy="30" r="3.5" fill="white"/>
            </svg>
            <div style={{fontSize:16,fontWeight:300,letterSpacing:'-0.03em',color:'#fff'}}>Tal<span style={{color:'#1D9E75'}}>tas</span></div>
          </div>
          <div style={{display:'flex',gap:48}}>
            <div>
              <div style={{fontSize:9,color:'rgba(255,255,255,.4)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:12}}>Platform</div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                <a href="https://candidates.taltas.ai" style={{fontSize:12,color:'rgba(255,255,255,.5)',textDecoration:'none'}}>Candidate Portal</a>
                <a href="https://recruiters.taltas.ai" style={{fontSize:12,color:'rgba(255,255,255,.5)',textDecoration:'none'}}>Recruiter Portal</a>
              </div>
            </div>
            <div>
              <div style={{fontSize:9,color:'rgba(255,255,255,.4)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:12}}>Legal</div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                <a href="https://taltas.ai/privacy.html" style={{fontSize:12,color:'rgba(255,255,255,.5)',textDecoration:'none'}}>Privacy</a>
                <a href="https://taltas.ai/terms.html" style={{fontSize:12,color:'rgba(255,255,255,.5)',textDecoration:'none'}}>Terms</a>
              </div>
            </div>
          </div>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontSize:10,color:'rgba(255,255,255,.3)',letterSpacing:'.06em',textTransform:'uppercase'}}>Taltas � Talent Atlas</span>
          <div style={{display:'flex',gap:16,alignItems:'center'}}>
            <a href="https://linkedin.com/company/taltas-ai" style={{color:'rgba(255,255,255,.35)',textDecoration:'none',fontSize:10}}>LinkedIn</a>
            <a href="https://x.com/taltasai" style={{color:'rgba(255,255,255,.35)',textDecoration:'none',fontSize:10}}>X / Twitter</a>
            <span style={{fontSize:10,color:'rgba(255,255,255,.3)'}}>2026 Taltas</span>
          </div>
        </div>
      </footer>
    </div>
  );
}