// @ts-nocheck
'use client';

import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/components/ui/toast';
import { useMessages } from '@/lib/data-provider';
import { DataSourceBadge } from '@/components/shared/api-status';

const F      = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const BLUE   = '#2563eb';
const TEAL   = '#1D9E75';
const DARK   = '#0A0A0A';
const MID    = '#6B6B6B';
const MUTED  = '#AAAAAA';
const BORDER = '#E8E8E5';
const BLIGHT = '#F4F4F2';
const AMBER  = '#D97706';

type ThreadType = 'agent' | 'a2a' | 'team';
type MsgKind = 'agent' | 'cand' | 'recruiter' | 'recruiter2' | 'high-signal' | 'signal' | 'human-join';

interface Msg {
  id: string;
  from: string;
  kind: MsgKind;
  text: string;
  time: string;
  signal?: string;
}
interface Thread {
  id: string;
  type: ThreadType;
  name: string;
  sub: string;
  preview: string;
  time: string;
  unread: boolean;
  live?: boolean;
  meta?: { score?: number; stage?: string; candidate?: string; role?: string; seed?: number };
  messages: Msg[];
  a2aTranscript?: Msg[];
}

const AVC = ['#2563eb','#1D9E75','#E84B3A','#F5A623','#635BFF','#C8571A','#5E6AD2','#0A7A3A'];

const THREADS: Thread[] = [
  {
    id:'t1', type:'agent', name:'StaffML-Agent', sub:'Sara Kim screening',
    preview:'Screening complete — score 94, auto-advanced to Recruiter Review',
    time:'12m ago', unread:true, live:true,
    meta:{ score:94, stage:'Recruiter Review', candidate:'Sara Kim', role:'Staff ML Engineer', seed:1 },
    messages:[
      {id:'m1',from:'StaffML-Agent',kind:'agent',text:'Starting screening for Sara Kim (Staff ML Engineer). Candidate sourced from Taltas Network.',time:'2:14 PM'},
      {id:'m2',from:'StaffML-Agent',kind:'agent',text:'Initial engagement complete. Candidate demonstrated deep ML platform experience — led recommendation engine rebuild at Figma serving 40M+ users.',time:'2:22 PM'},
      {id:'m3',from:'StaffML-Agent',kind:'high-signal',signal:'HIGH SIGNAL',text:'Exceptional RLHF experience — implemented custom reward model reducing harmful content 73% while maintaining engagement. This is rare at this level.',time:'2:28 PM'},
      {id:'m4',from:'StaffML-Agent',kind:'high-signal',signal:'HIGH SIGNAL',text:'Screening complete — Deep Match score: 94. Auto-advanced to Recruiter Review. Recommend fast-tracking to interview panel.',time:'2:31 PM'},
      {id:'m5',from:'Sara Kim',kind:'cand',text:'Hi, I just received a notification that my application has advanced. Looking forward to connecting with the team!',time:'2:35 PM'},
      {id:'mj1',from:'',kind:'human-join',text:'Sarah Chen joined the conversation',time:'2:36 PM'},
      {id:'m6',from:'Sarah Chen',kind:'recruiter',text:'Hi Sara — great to connect. Your background is exactly what we are looking for. I will send over interview details shortly.',time:'2:37 PM'},
    ],
  },
  {
    id:'t2', type:'a2a', name:'A2A: Marcus Peterson', sub:'PrincipalEng-Agent ↔ CTOBot',
    preview:'Negotiation concluded — both sides aligned on comp range and timeline',
    time:'1h ago', unread:true, live:false,
    meta:{ score:88, stage:'Interview', candidate:'Marcus Peterson', role:'Principal Engineer', seed:4 },
    messages:[
      {id:'n1',from:'PrincipalEng-Agent',kind:'agent',text:'Initiating A2A session with CTOBot for Marcus Peterson. Target role: Principal Engineer, Platform.',time:'1:05 PM'},
      {id:'n2',from:'CTOBot',kind:'cand',text:'Career agent confirmed. Marcus is exploring senior platform engineering roles. Availability: 60-day notice. Comp expectation: $230K–$255K. Equity flexible.',time:'1:07 PM'},
      {id:'n3',from:'PrincipalEng-Agent',kind:'agent',text:'Approved band is $220K–$260K. Equity: 0.12% over 4 years. Timeline alignment: role open Q2, notice period acceptable.',time:'1:12 PM'},
      {id:'n4',from:'CTOBot',kind:'cand',text:'Comp and timeline aligned. Marcus confirms strong interest in distributed systems ownership scope. Requesting culture and team context before advancing.',time:'1:15 PM'},
      {id:'n5',from:'PrincipalEng-Agent',kind:'high-signal',signal:'NEGOTIATION COMPLETE',text:'Mutual interest confirmed. Comp aligned at $240K base. Timeline aligned. Forwarding to recruiter for human review and interview scheduling.',time:'1:21 PM'},
    ],
    a2aTranscript:[
      {id:'a1',from:'PrincipalEng-Agent',kind:'agent',text:"Hello CTOBot. I represent the hiring team for the Principal Engineer position. Marcus has expressed strong interest. Let's discuss alignment on key terms.",time:'1:05 PM'},
      {id:'a2',from:'CTOBot',kind:'cand',text:"Thanks for reaching out. Marcus is excited about the role but has a competing offer from a FAANG company with a Friday deadline. Let's ensure we can move quickly.",time:'1:07 PM'},
      {id:'a3',from:'PrincipalEng-Agent',kind:'agent',text:'Understood. Let me share the compensation framework: base range $260–$310K, equity package, and comprehensive benefits. We can expedite our timeline.',time:'1:10 PM'},
      {id:'a4',from:'CTOBot',kind:'cand',text:"Marcus's expectation is in the $280–$310K base range based on his 12 years of experience and Stripe leadership track record. The FAANG offer is at the upper end.",time:'1:14 PM'},
      {id:'a5',from:'PrincipalEng-Agent',kind:'agent',text:'We can work within that range. Our equity package vests over 4 years with a 1-year cliff. Can we discuss start date flexibility?',time:'1:18 PM'},
      {id:'a6',from:'CTOBot',kind:'cand',text:'Marcus prefers a March or early April start. He needs 3 weeks notice at his current role. A signing bonus would strengthen the offer.',time:'1:22 PM'},
      {id:'a7',from:'PrincipalEng-Agent',kind:'agent',text:"We can accommodate a March 17 start date. I'll flag the signing bonus request. Our standard range is $15–$25K for this level.",time:'1:26 PM'},
      {id:'a8',from:'CTOBot',kind:'cand',text:"$20K would be the minimum to offset the FAANG offer's sign-on. Marcus is genuinely excited about the technical challenges here.",time:'1:30 PM'},
      {id:'a9',from:'PrincipalEng-Agent',kind:'high-signal',signal:'SESSION COMPLETE',text:"Alignment reached: Base $280–$310K, equity, $20K signing bonus, March 17 start. I'll present this to the hiring manager for final approval.",time:'1:35 PM'},
    ],
  },
  {
    id:'t3', type:'agent', name:'DevRel-Agent', sub:'Weekly performance summary',
    preview:'Screened 8 candidates this week — 3 advanced, avg score 82',
    time:'5h ago', unread:false, live:false,
    meta:{ role:'DevRel Engineer' },
    messages:[
      {id:'d1',from:'DevRel-Agent',kind:'agent',text:'Weekly summary: DevRel Engineer role. 8 candidates screened this week.',time:'9:00 AM'},
      {id:'d2',from:'DevRel-Agent',kind:'agent',text:'3 advanced to Recruiter Review (avg Deep Match: 82). 4 held for follow-up. 1 passed — comp misalignment.',time:'9:00 AM'},
      {id:'d3',from:'DevRel-Agent',kind:'high-signal',signal:'INSIGHT',text:'Notable trend: 6 of 8 candidates mentioned async-first culture as a priority. Recommend updating the job description to emphasise remote flexibility.',time:'9:01 AM'},
    ],
  },
  {
    id:'t4', type:'team', name:'Engineering Hiring', sub:'Team channel',
    preview:'Updated Q1 hiring targets — 3 remaining positions',
    time:'6h ago', unread:false, live:false,
    messages:[
      {id:'mj2',from:'',kind:'human-join',text:'Sarah Chen joined the conversation',time:'8:44 AM'},
      {id:'e1',from:'Sarah Chen',kind:'recruiter',text:'Updated Q1 hiring targets. 3 positions still open: Staff ML Eng, Principal Eng, and DevRel. Priority is Staff ML — we have a strong candidate (Sara Kim, score 94) at Recruiter Review.',time:'8:45 AM'},
      {id:'mj3',from:'',kind:'human-join',text:'James Wright joined the conversation',time:'8:51 AM'},
      {id:'e2',from:'James Wright',kind:'recruiter2',text:'Noted. Can we schedule the panel for Sara Kim this week? I can do Thu or Fri afternoon.',time:'8:52 AM'},
      {id:'e3',from:'Sarah Chen',kind:'recruiter',text:'Booking Thu 3pm. Will send calendar invites. StaffML-Agent will prepare the assessment brief.',time:'8:55 AM'},
    ],
  },
  {
    id:'t5', type:'a2a', name:'A2A: Priya Sharma', sub:'StaffAI-Agent ↔ CareerBot',
    preview:'Session complete — mutual interest confirmed, timeline aligned',
    time:'14h ago', unread:false, live:false,
    meta:{ score:85, stage:'Explorer Screen', candidate:'Priya Sharma', role:'Staff AI Systems', seed:6 },
    messages:[
      {id:'p1',from:'StaffAI-Agent',kind:'agent',text:'Opening A2A session for Priya Sharma. Role: Staff Engineer, AI Systems.',time:'6:10 PM'},
      {id:'p2',from:'CareerBot',kind:'cand',text:'Priya is open to Staff-level AI infrastructure roles. Comp target $210K. Prefers remote with quarterly onsite.',time:'6:12 PM'},
      {id:'p3',from:'StaffAI-Agent',kind:'agent',text:'Comp and remote policy aligned. Role is fully remote with quarterly offsites in SF. Band: $200K–$230K.',time:'6:15 PM'},
      {id:'p4',from:'StaffAI-Agent',kind:'high-signal',signal:'SESSION COMPLETE',text:'Mutual interest confirmed. Timeline aligned — Priya available in 45 days. Forwarding to pipeline.',time:'6:17 PM'},
    ],
  },
];

// ── Avatars ──
function RecruiterAgentAvatar({ size=34 }: any) {
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:BLUE, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <svg width={size*.52} height={size*.52} viewBox="0 0 60 60" fill="none">
        <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="1.5"/>
        <polygon points="30,9 35,29 30,25 25,29" fill="white"/>
        <polygon points="30,51 34,31 30,35 26,31" fill="white" opacity="0.35"/>
        <circle cx="30" cy="30" r="3.5" fill="white"/>
        <circle cx="30" cy="30" r="1.8" fill={BLUE}/>
      </svg>
    </div>
  );
}

function CandAgentAvatar({ size=34 }: any) {
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:TEAL, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <svg width={size*.52} height={size*.52} viewBox="0 0 60 60" fill="none">
        <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="1.5"/>
        <polygon points="30,9 35,29 30,25 25,29" fill="white"/>
        <polygon points="30,51 34,31 30,35 26,31" fill="white" opacity="0.35"/>
        <circle cx="30" cy="30" r="3.5" fill="white"/>
        <circle cx="30" cy="30" r="1.8" fill={TEAL}/>
      </svg>
    </div>
  );
}

function HumanAvatar({ name, seed=0, size=34 }: any) {
  const ini = (name||'?').split(' ').map((w:string)=>w[0]||'').join('').slice(0,2).toUpperCase();
  const bg = AVC[seed % AVC.length];
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*.34, fontWeight:400, color:'#fff', flexShrink:0, fontFamily:F }}>
      {ini}
    </div>
  );
}

function ThreadDot({ type }: any) {
  const cfg: any = {
    agent: { bg:'#E8F0FF', col:BLUE },
    a2a:   { bg:'#F3EEFF', col:'#7C3AED' },
    team:  { bg:BLIGHT,    col:MID },
  };
  const { bg, col } = cfg[type] || cfg.team;
  return (
    <div style={{ width:32, height:32, borderRadius:'50%', background:bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      {type === 'agent' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round"><path d="M12 2a2 2 0 0 1 2 2v2h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4V4a2 2 0 0 1 2-2z"/><path d="M8 12h.01M16 12h.01"/></svg>}
      {type === 'a2a'  && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>}
      {type === 'team' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
    </div>
  );
}

function SignalBadge({ label }: any) {
  const isBlue = label==='HIGH SIGNAL'||label==='SESSION COMPLETE'||label==='NEGOTIATION COMPLETE';
  const col = isBlue ? BLUE : AMBER;
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:5, marginBottom:6 }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
      <span style={{ fontSize:9.5, letterSpacing:'.1em', textTransform:'uppercase', color:col, fontWeight:600 }}>{label}</span>
    </div>
  );
}

export default function MessagesPage() {
  const toast = useToast();
  const messagesQuery = useMessages();
  const fromApi = !!messagesQuery.data?.fromApi;

  const [filter, setFilter]     = useState<'all'|ThreadType>('all');
  const [selectedId, setSelectedId] = useState<string>('t2');
  const [showA2A, setShowA2A]   = useState(false);
  const [reply, setReply]       = useState('');
  const [search, setSearch]     = useState('');
  const [pausedThreads, setPausedThreads] = useState<Set<string>>(new Set());
  const [recruiterMsgs, setRecruiterMsgs] = useState<Record<string, Msg[]>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  const filtered = THREADS.filter(t =>
    (filter === 'all' || t.type === filter) &&
    (t.name.toLowerCase().includes(search.toLowerCase()) || t.sub.toLowerCase().includes(search.toLowerCase()))
  );
  const thread = THREADS.find(t => t.id === selectedId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [selectedId, recruiterMsgs]);

  const togglePause = () => {
    setPausedThreads(prev => {
      const next = new Set(prev);
      if (next.has(selectedId)) { next.delete(selectedId); toast.show('Agent resumed'); }
      else { next.add(selectedId); toast.show('Agent paused — you can respond now'); }
      return next;
    });
  };

  const sendReply = () => {
    if (!reply.trim()) return;
    const msg: Msg = { id:`r-${Date.now()}`, from:'Sarah Chen', kind:'recruiter', text:reply, time:'Just now' };
    setRecruiterMsgs(prev => ({ ...prev, [selectedId]: [...(prev[selectedId]||[]), msg] }));
    setReply('');
    toast.show('Message sent');
  };

  const isPaused = pausedThreads.has(selectedId);
  const extraMsgs = recruiterMsgs[selectedId] || [];

  // Determine avatar for a message
  const getAvatar = (msg: Msg, t: Thread) => {
    const { kind, from } = msg;
    if (kind === 'agent' || kind === 'high-signal' || kind === 'signal') return <RecruiterAgentAvatar size={34} />;
    if (kind === 'recruiter') return <HumanAvatar name="Sarah Chen" seed={2} size={34} />;
    if (kind === 'recruiter2') return <HumanAvatar name={from} seed={5} size={34} />;
    if (kind === 'cand') {
      if (from.includes('Bot') || from.includes('bot')) return <CandAgentAvatar size={34} />;
      return <HumanAvatar name={from} seed={t.meta?.seed||3} size={34} />;
    }
    return null;
  };

  // Right = outgoing (recruiter & recruiter's agents). Left = incoming (candidate side)
  const isRight = (kind: MsgKind) => kind === 'recruiter' || kind === 'agent' || kind === 'high-signal' || kind === 'signal';

  const nameColor = (kind: MsgKind, from: string) => {
    if (kind === 'agent' || kind === 'high-signal') return BLUE;
    if (kind === 'cand' && (from.includes('Bot')||from.includes('bot'))) return TEAL;
    return MID;
  };

  const bubbleBg = (msg: Msg) => {
    if (msg.kind === 'high-signal') return '#EEF3FF';
    if (msg.kind === 'signal') return '#FFFBF0';
    if (msg.kind === 'recruiter' || msg.kind === 'recruiter2') return '#F0F4FF';
    if (msg.kind === 'agent') return '#F0F4FF';
    return '#FAFAFA';
  };

  const bubbleBorder = (msg: Msg) => {
    if (msg.kind === 'high-signal') return 'none';
    if (msg.kind === 'signal') return 'none';
    if (msg.kind === 'recruiter' || msg.kind === 'agent') return `1px solid #C8D8FF`;
    if (msg.kind === 'recruiter2') return `1px solid #C8D8FF`;
    return `1px solid ${BORDER}`;
  };

  const renderMessages = (msgs: Msg[]) => [...msgs, ...extraMsgs].map((msg, i) => {
    if (msg.kind === 'human-join') return (
      <div key={msg.id||i} style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 0' }}>
        <div style={{ flex:1, height:1, background:BORDER }} />
        <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 12px', border:`1px solid ${BORDER}`, background:BLIGHT }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span style={{ fontSize:10, color:MUTED, fontWeight:300 }}>{msg.text}</span>
        </div>
        <div style={{ flex:1, height:1, background:BORDER }} />
      </div>
    );

    const right = isRight(msg.kind);
    const isSignal = msg.kind === 'high-signal' || msg.kind === 'signal';
    return (
      <div key={msg.id||i} style={{ display:'flex', gap:12, alignItems:'flex-start', flexDirection:right?'row-reverse':'row' }}>
        {getAvatar(msg, thread!)}
        <div style={{ display:'flex', flexDirection:'column', gap:4, maxWidth:'66%', alignItems:right?'flex-end':'flex-start' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, flexDirection:right?'row-reverse':'row' }}>
            <span style={{ fontSize:11, fontWeight:400, color:nameColor(msg.kind, msg.from), fontFamily:F }}>{msg.from}</span>
            <span style={{ fontSize:10, color:MUTED, fontWeight:300 }}>{msg.time}</span>
          </div>
          <div style={{
            padding:'11px 15px', fontSize:13, lineHeight:1.7, fontWeight:300, color:MID, fontFamily:F,
            background:bubbleBg(msg),
            borderLeft:isSignal?`3px solid ${msg.kind==='high-signal'?BLUE:AMBER}`:'none',
            border:isSignal?undefined:bubbleBorder(msg),
          }}>
            {isSignal && msg.signal && <SignalBadge label={msg.signal} />}
            {msg.text}
          </div>
        </div>
      </div>
    );
  });

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, minHeight:0, fontFamily:F, overflow:'hidden' }}>

      {/* PAGE HEADER */}
      <div style={{ padding:'12px 24px', borderBottom:'1px solid '+BORDER, display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <div>
          <div style={{ fontSize:15, fontWeight:400, letterSpacing:'-0.01em', color:DARK }}>Messages</div>
          <div style={{ fontSize:11, color:MUTED, fontWeight:300, marginTop:1 }}>Conversations & Agent Activity<DataSourceBadge fromApi={fromApi} /></div>
        </div>
        <div style={{ display:'flex', gap:1, marginLeft:16 }}>
          {([['all','All'],['agent','Agents'],['a2a','A2A Sessions'],['team','Team']] as const).map(([k,l])=>(
            <button key={k} onClick={()=>setFilter(k)}
              style={{ background:'none', border:'none', borderBottom:filter===k?`2px solid ${BLUE}`:'2px solid transparent', padding:'0 14px', height:36, fontSize:12, color:filter===k?DARK:MUTED, fontFamily:F, fontWeight:filter===k?400:300, cursor:'pointer' }}>{l}
            </button>
          ))}
        </div>
      </div>

      {/* BODY */}
      <div style={{ display:'flex', flex:1, minHeight:0, overflow:'hidden' }}>

        {/* THREAD LIST */}
        <div style={{ width:300, flexShrink:0, borderRight:'1px solid '+BORDER, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {/* Search */}
          <div style={{ padding:'10px 14px', borderBottom:'1px solid '+BORDER, flexShrink:0 }}>
            <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
              <svg style={{ position:'absolute', left:8, pointerEvents:'none' }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search conversations..."
                style={{ width:'100%', padding:'6px 10px 6px 26px', border:'1px solid '+BORDER, fontSize:12, fontFamily:F, color:DARK, background:'#fff', outline:'none' }} />
            </div>
          </div>

          {/* Threads */}
          <div style={{ flex:1, overflowY:'auto' }}>
            {filtered.map(t=>(
              <div key={t.id} onClick={()=>{ setSelectedId(t.id); setShowA2A(false); }}
                style={{ padding:'12px 16px', borderBottom:'1px solid '+BLIGHT, cursor:'pointer', borderLeft:`2px solid ${selectedId===t.id?BLUE:'transparent'}`, background:selectedId===t.id?'rgba(37,99,235,.03)':'#fff', transition:'background .1s' }}>
                <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                  <div style={{ position:'relative', flexShrink:0 }}>
                    <ThreadDot type={t.type} />
                    {t.live && <div style={{ position:'absolute', bottom:0, right:0, width:9, height:9, borderRadius:'50%', background:'#22C55E', border:'2px solid #fff', animation:'pulse 2s ease-in-out infinite' }} />}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
                      <span style={{ fontSize:13, fontWeight:t.unread?500:300, color:DARK, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:160 }}>{t.name}</span>
                      <span style={{ fontSize:10, color:MUTED, fontWeight:300, flexShrink:0, marginLeft:4 }}>{t.time}</span>
                    </div>
                    <div style={{ fontSize:11, color:MUTED, fontWeight:300, marginBottom:3 }}>{t.sub}</div>
                    <div style={{ fontSize:11.5, color:t.unread?DARK:MUTED, fontWeight:300, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t.preview}</div>
                    {t.unread && <div style={{ width:6, height:6, borderRadius:'50%', background:BLUE, marginTop:4 }} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CONVERSATION */}
        {thread ? (
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

            {/* Conv header */}
            <div style={{ height:46, borderBottom:'1px solid '+BORDER, display:'flex', alignItems:'center', padding:'0 24px', gap:10, flexShrink:0 }}>
              <ThreadDot type={thread.type} />
              <div>
                <div style={{ fontSize:13.5, fontWeight:400, letterSpacing:'-0.01em', color:DARK }}>{thread.name}</div>
                <div style={{ fontSize:10, color:MUTED, fontWeight:300 }}>{thread.sub}</div>
              </div>
              {thread.live && <div style={{ width:5, height:5, borderRadius:'50%', background:'#22C55E', animation:'pulse 2s ease-in-out infinite', marginLeft:4 }} />}
              <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
                {thread.a2aTranscript && (
                  <button onClick={()=>setShowA2A(!showA2A)}
                    style={{ padding:'5px 12px', border:'1px solid '+BORDER, background:showA2A?BLUE:'none', color:showA2A?'#fff':MID, fontFamily:F, fontSize:11, cursor:'pointer' }}>
                    {showA2A ? 'Agent Summary' : 'Full A2A Transcript'}
                  </button>
                )}
                {thread.meta?.candidate && (
                  <button style={{ padding:'5px 12px', border:'1px solid '+BORDER, background:'none', color:MID, fontFamily:F, fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    View Profile
                  </button>
                )}
                {thread.type !== 'team' && (
                  <button onClick={togglePause}
                    style={{ padding:'5px 12px', border:'1px solid '+BORDER, background:'none', color:MID, fontFamily:F, fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
                    {isPaused
                      ? <><svg width="10" height="10" viewBox="0 0 24 24" fill={MID}><polygon points="5,3 19,12 5,21"/></svg> Resume Agent</>
                      : <><svg width="10" height="10" viewBox="0 0 24 24" fill={MID}><rect x="4" y="3" width="6" height="18"/><rect x="14" y="3" width="6" height="18"/></svg> Pause Agent</>
                    }
                  </button>
                )}
              </div>
            </div>

            {/* Candidate bar */}
            {thread.meta?.candidate && (
              <div style={{ padding:'12px 24px', borderBottom:'1px solid '+BORDER, background:BLIGHT, display:'flex', alignItems:'center', gap:16, flexShrink:0 }}>
                <HumanAvatar name={thread.meta.candidate} seed={thread.meta.seed||thread.id.charCodeAt(1)} size={44} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:15, fontWeight:400, letterSpacing:'-0.01em', marginBottom:2, color:DARK }}>{thread.meta.candidate}</div>
                  <div style={{ fontSize:12, color:MID, fontWeight:300 }}>{thread.meta.role}</div>
                </div>
                {thread.meta.score && (
                  <div style={{ textAlign:'center', padding:'0 20px', borderLeft:'1px solid '+BORDER, borderRight:'1px solid '+BORDER }}>
                    <div style={{ fontSize:9, color:MUTED, letterSpacing:'.09em', textTransform:'uppercase', marginBottom:4 }}>Deep Match</div>
                    <div style={{ fontSize:26, fontWeight:300, letterSpacing:'-0.02em', color:BLUE, lineHeight:1 }}>{thread.meta.score}</div>
                  </div>
                )}
                {thread.meta.stage && (
                  <div style={{ textAlign:'center', paddingLeft:20 }}>
                    <div style={{ fontSize:9, color:MUTED, letterSpacing:'.09em', textTransform:'uppercase', marginBottom:6 }}>Stage</div>
                    <span style={{ fontSize:10.5, padding:'4px 12px', background:BLIGHT, color:MID, fontWeight:400, border:'1px solid '+BORDER }}>{thread.meta.stage}</span>
                  </div>
                )}
              </div>
            )}

            {/* Messages */}
            <div style={{ flex:1, overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:18 }}>
              <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
              {showA2A && thread.a2aTranscript ? (
                <>
                  <div style={{ padding:'10px 14px', background:'#F3EEFF', border:'1px solid #DDD6FE', marginBottom:4 }}>
                    <div style={{ fontSize:9, color:'#7C3AED', letterSpacing:'.1em', textTransform:'uppercase', fontWeight:500 }}>Agent-to-Agent Transcript</div>
                    <div style={{ fontSize:11, color:MID, fontWeight:300, marginTop:2 }}>Full conversation between recruiting agent and candidate agent</div>
                  </div>
                  {renderMessages(thread.a2aTranscript)}
                </>
              ) : (
                renderMessages(thread.messages)
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ borderTop:'1px solid '+BORDER, padding:'12px 24px', flexShrink:0, display:'flex', alignItems:'center', gap:10 }}>
              {thread.type !== 'team' && !isPaused ? (
                <>
                  <div style={{ flex:1, padding:'9px 14px', background:BLIGHT, border:'1px solid '+BORDER, fontSize:12, color:MUTED, fontWeight:300, fontStyle:'italic' }}>
                    Agent is managing this conversation autonomously.
                  </div>
                  <button onClick={togglePause}
                    style={{ padding:'8px 16px', border:'1px solid '+BORDER, background:'none', cursor:'pointer', fontFamily:F, fontSize:12, color:MID, display:'flex', alignItems:'center', gap:6 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill={MID}><rect x="4" y="3" width="6" height="18"/><rect x="14" y="3" width="6" height="18"/></svg>
                    Pause Agent
                  </button>
                  <button style={{ padding:'8px 16px', border:'none', background:BLUE, cursor:'pointer', fontFamily:F, fontSize:12, color:'#fff', display:'flex', alignItems:'center', gap:6 }}>
                    Intervene
                  </button>
                </>
              ) : (
                <>
                  <HumanAvatar name="Sarah Chen" seed={2} size={28} />
                  <input value={reply} onChange={e=>setReply(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendReply()}
                    placeholder={isPaused ? 'Respond while agent is paused…' : 'Reply to thread…'}
                    style={{ flex:1, padding:'9px 14px', border:'1px solid '+BORDER, fontSize:12, fontFamily:F, color:DARK, background:'#fff', outline:'none' }} />
                  <button onClick={sendReply}
                    style={{ padding:'9px 20px', background:BLUE, border:'none', cursor:'pointer', fontFamily:F, fontSize:12, color:'#fff' }}>Send</button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:MUTED, fontSize:13, fontWeight:300 }}>
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}
