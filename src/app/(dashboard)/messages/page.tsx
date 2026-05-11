// @ts-nocheck
'use client';

import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/components/ui/toast';
import { useMessages } from '@/lib/data-provider';
import { DataSourceBadge } from '@/components/shared/api-status';

const F      = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const BLUE   = '#2563eb';
const BLUE_DARK = '#1E40AF';
const BLUE_BG = '#EEF3FF';
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
  ts?: number;
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

// Relative timestamps for stacking/day grouping
const nowMs = Date.now();
const t1Ms = nowMs - 12 * 60 * 1000;
const t2Ms = nowMs - 60 * 60 * 1000;
const t3Ms = nowMs - 5 * 60 * 60 * 1000;
const t4Ms = nowMs - 6 * 60 * 60 * 1000;
const t5Ms = nowMs - 14 * 60 * 60 * 1000;

const THREADS: Thread[] = [
  {
    id:'t1', type:'agent', name:'StaffML-Agent', sub:'Sara Kim screening',
    preview:'Screening complete \u2014 score 94, auto-advanced to Recruiter Review',
    time:'12m ago', unread:true, live:true,
    meta:{ score:94, stage:'Recruiter Review', candidate:'Sara Kim', role:'Staff ML Engineer', seed:1 },
    messages:[
      {id:'m1',from:'StaffML-Agent',kind:'agent',text:'Starting screening for Sara Kim (Staff ML Engineer). Candidate sourced from Taltas Network.',time:'2:14 PM', ts: t1Ms - 25 * 60 * 1000},
      {id:'m2',from:'StaffML-Agent',kind:'agent',text:'Initial engagement complete. Candidate demonstrated deep ML platform experience \u2014 led recommendation engine rebuild at Figma serving 40M+ users.',time:'2:22 PM', ts: t1Ms - 22 * 60 * 1000},
      {id:'m3',from:'StaffML-Agent',kind:'high-signal',signal:'HIGH SIGNAL',text:'Exceptional RLHF experience \u2014 implemented custom reward model reducing harmful content 73% while maintaining engagement. This is rare at this level.',time:'2:28 PM', ts: t1Ms - 17 * 60 * 1000},
      {id:'m4',from:'StaffML-Agent',kind:'high-signal',signal:'HIGH SIGNAL',text:'Screening complete \u2014 Deep Match score: 94. Auto-advanced to Recruiter Review. Recommend fast-tracking to interview panel.',time:'2:31 PM', ts: t1Ms - 14 * 60 * 1000},
      {id:'m5',from:'Sara Kim',kind:'cand',text:'Hi, I just received a notification that my application has advanced. Looking forward to connecting with the team!',time:'2:35 PM', ts: t1Ms - 10 * 60 * 1000},
      {id:'mj1',from:'',kind:'human-join',text:'Sarah Chen joined the conversation',time:'2:36 PM', ts: t1Ms - 9 * 60 * 1000},
      {id:'m6',from:'Sarah Chen',kind:'recruiter',text:'Hi Sara \u2014 great to connect. Your background is exactly what we are looking for. I will send over interview details shortly.',time:'2:37 PM', ts: t1Ms - 8 * 60 * 1000},
    ],
  },
  {
    id:'t2', type:'a2a', name:'A2A: Marcus Peterson', sub:'PrincipalEng-Agent \u2194 CTOBot',
    preview:'Negotiation concluded \u2014 both sides aligned on comp range and timeline',
    time:'1h ago', unread:true, live:false,
    meta:{ score:88, stage:'Interview', candidate:'Marcus Peterson', role:'Principal Engineer', seed:4 },
    messages:[
      {id:'n1',from:'PrincipalEng-Agent',kind:'agent',text:'Initiating A2A session with CTOBot for Marcus Peterson. Target role: Principal Engineer, Platform.',time:'1:05 PM', ts: t2Ms - 25 * 60 * 1000},
      {id:'n2',from:'CTOBot',kind:'cand',text:'Career agent confirmed. Marcus is exploring senior platform engineering roles. Availability: 60-day notice. Comp expectation: $230K\u2013$255K. Equity flexible.',time:'1:07 PM', ts: t2Ms - 23 * 60 * 1000},
      {id:'n3',from:'PrincipalEng-Agent',kind:'agent',text:'Approved band is $220K\u2013$260K. Equity: 0.12% over 4 years. Timeline alignment: role open Q2, notice period acceptable.',time:'1:12 PM', ts: t2Ms - 18 * 60 * 1000},
      {id:'n4',from:'CTOBot',kind:'cand',text:'Comp and timeline aligned. Marcus confirms strong interest in distributed systems ownership scope. Requesting culture and team context before advancing.',time:'1:15 PM', ts: t2Ms - 15 * 60 * 1000},
      {id:'n5',from:'PrincipalEng-Agent',kind:'high-signal',signal:'NEGOTIATION COMPLETE',text:'Mutual interest confirmed. Comp aligned at $240K base. Timeline aligned. Forwarding to recruiter for human review and interview scheduling.',time:'1:21 PM', ts: t2Ms - 9 * 60 * 1000},
    ],
    a2aTranscript:[
      {id:'a1',from:'PrincipalEng-Agent',kind:'agent',text:"Hello CTOBot. I represent the hiring team for the Principal Engineer position. Marcus has expressed strong interest. Let's discuss alignment on key terms.",time:'1:05 PM', ts: t2Ms - 25 * 60 * 1000},
      {id:'a2',from:'CTOBot',kind:'cand',text:"Thanks for reaching out. Marcus is excited about the role but has a competing offer from a FAANG company with a Friday deadline. Let's ensure we can move quickly.",time:'1:07 PM', ts: t2Ms - 23 * 60 * 1000},
      {id:'a3',from:'PrincipalEng-Agent',kind:'agent',text:'Understood. Let me share the compensation framework: base range $260\u2013$310K, equity package, and comprehensive benefits. We can expedite our timeline.',time:'1:10 PM', ts: t2Ms - 20 * 60 * 1000},
      {id:'a4',from:'CTOBot',kind:'cand',text:"Marcus's expectation is in the $280\u2013$310K base range based on his 12 years of experience and Stripe leadership track record. The FAANG offer is at the upper end.",time:'1:14 PM', ts: t2Ms - 16 * 60 * 1000},
      {id:'a5',from:'PrincipalEng-Agent',kind:'agent',text:'We can work within that range. Our equity package vests over 4 years with a 1-year cliff. Can we discuss start date flexibility?',time:'1:18 PM', ts: t2Ms - 12 * 60 * 1000},
      {id:'a6',from:'CTOBot',kind:'cand',text:'Marcus prefers a March or early April start. He needs 3 weeks notice at his current role. A signing bonus would strengthen the offer.',time:'1:22 PM', ts: t2Ms - 8 * 60 * 1000},
      {id:'a7',from:'PrincipalEng-Agent',kind:'agent',text:"We can accommodate a March 17 start date. I'll flag the signing bonus request. Our standard range is $15\u2013$25K for this level.",time:'1:26 PM', ts: t2Ms - 4 * 60 * 1000},
      {id:'a8',from:'CTOBot',kind:'cand',text:"$20K would be the minimum to offset the FAANG offer's sign-on. Marcus is genuinely excited about the technical challenges here.",time:'1:30 PM', ts: t2Ms - 60 * 1000},
      {id:'a9',from:'PrincipalEng-Agent',kind:'high-signal',signal:'SESSION COMPLETE',text:"Alignment reached: Base $280\u2013$310K, equity, $20K signing bonus, March 17 start. I'll present this to the hiring manager for final approval.",time:'1:35 PM', ts: t2Ms + 4 * 60 * 1000},
    ],
  },
  {
    id:'t3', type:'agent', name:'DevRel-Agent', sub:'Weekly performance summary',
    preview:'Screened 8 candidates this week \u2014 3 advanced, avg score 82',
    time:'5h ago', unread:false, live:false,
    meta:{ score:82, stage:'Active', candidate:undefined, role:'DevRel', seed:3 },
    messages:[
      {id:'d1',from:'DevRel-Agent',kind:'agent',text:'Weekly summary for DevRel pipeline. Total screened: 8. Advanced to Recruiter Review: 3 (avg score 87). Held: 4 (avg score 71). Disqualified: 1.',time:'9:30 AM', ts: t3Ms - 30 * 60 * 1000},
      {id:'d2',from:'DevRel-Agent',kind:'agent',text:'Top performer: Jamie Singh \u2014 score 91, strong open source contributions, 3 conference talks. Recommended for fast-track.',time:'9:33 AM', ts: t3Ms - 27 * 60 * 1000},
      {id:'d3',from:'DevRel-Agent',kind:'signal',signal:'TREND',text:'Candidate quality up 14% week-over-week. Recent referral boost from Discord community pipeline is driving higher-fit applicants.',time:'9:35 AM', ts: t3Ms - 25 * 60 * 1000},
    ],
  },
  {
    id:'t4', type:'team', name:'Internal: Q1 Hiring Sync', sub:'Sarah Chen + James Wright + 2 others',
    preview:'Updated Q1 hiring targets. Staff ML interview panel booked Thu 3pm.',
    time:'6h ago', unread:false, live:false,
    messages:[
      {id:'mj2',from:'',kind:'human-join',text:'Sarah Chen joined the conversation',time:'8:44 AM', ts: t4Ms - 16 * 60 * 1000},
      {id:'e1',from:'Sarah Chen',kind:'recruiter',text:'Updated Q1 hiring targets. 3 positions still open: Staff ML Eng, Principal Eng, and DevRel. Priority is Staff ML \u2014 we have a strong candidate (Sara Kim, score 94) at Recruiter Review.',time:'8:45 AM', ts: t4Ms - 15 * 60 * 1000},
      {id:'mj3',from:'',kind:'human-join',text:'James Wright joined the conversation',time:'8:51 AM', ts: t4Ms - 9 * 60 * 1000},
      {id:'e2',from:'James Wright',kind:'recruiter2',text:'Noted. Can we schedule the panel for Sara Kim this week? I can do Thu or Fri afternoon.',time:'8:52 AM', ts: t4Ms - 8 * 60 * 1000},
      {id:'e3',from:'Sarah Chen',kind:'recruiter',text:'Booking Thu 3pm. Will send calendar invites. StaffML-Agent will prepare the assessment brief.',time:'8:55 AM', ts: t4Ms - 5 * 60 * 1000},
    ],
  },
  {
    id:'t5', type:'a2a', name:'A2A: Priya Sharma', sub:'StaffAI-Agent \u2194 CareerBot',
    preview:'Session complete \u2014 mutual interest confirmed, timeline aligned',
    time:'14h ago', unread:false, live:false,
    meta:{ score:85, stage:'Explorer Screen', candidate:'Priya Sharma', role:'Staff AI Systems', seed:6 },
    messages:[
      {id:'p1',from:'StaffAI-Agent',kind:'agent',text:'Opening A2A session for Priya Sharma. Role: Staff Engineer, AI Systems.',time:'6:10 PM', ts: t5Ms - 25 * 60 * 1000},
      {id:'p2',from:'CareerBot',kind:'cand',text:'Priya is open to Staff-level AI infrastructure roles. Comp target $210K. Prefers remote with quarterly onsite.',time:'6:12 PM', ts: t5Ms - 23 * 60 * 1000},
      {id:'p3',from:'StaffAI-Agent',kind:'agent',text:'Comp and remote policy aligned. Role is fully remote with quarterly offsites in SF. Band: $200K\u2013$230K.',time:'6:15 PM', ts: t5Ms - 20 * 60 * 1000},
      {id:'p4',from:'StaffAI-Agent',kind:'high-signal',signal:'SESSION COMPLETE',text:'Mutual interest confirmed. Timeline aligned \u2014 Priya available in 45 days. Forwarding to pipeline.',time:'6:17 PM', ts: t5Ms - 18 * 60 * 1000},
    ],
  },
];

// === Avatars (preserved verbatim) ===

function RecruiterAgentAvatar({ size=28 }: any) {
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

function CandAgentAvatar({ size=28 }: any) {
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

function HumanAvatar({ name, seed=0, size=28 }: any) {
  const ini = (name||'?').split(' ').map((w:string)=>w[0]||'').join('').slice(0,2).toUpperCase();
  const bg = AVC[seed % AVC.length];
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*.34, fontWeight:400, color:'#fff', flexShrink:0, fontFamily:F }}>
      {ini}
    </div>
  );
}

function ThreadDot({ type, size=32 }: any) {
  const cfg: any = {
    agent: { bg:'#E8F0FF', col:BLUE },
    a2a:   { bg:'#F3EEFF', col:'#7C3AED' },
    team:  { bg:BLIGHT,    col:MID },
  };
  const { bg, col } = cfg[type] || cfg.team;
  const ico = size * 0.44;
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      {type === 'agent' && <svg width={ico} height={ico} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round"><path d="M12 2a2 2 0 0 1 2 2v2h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4V4a2 2 0 0 1 2-2z"/><path d="M8 12h.01M16 12h.01"/></svg>}
      {type === 'a2a'  && <svg width={ico} height={ico} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>}
      {type === 'team' && <svg width={ico} height={ico} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
    </div>
  );
}

function SignalBadge({ label }: any) {
  const isBlue = label==='HIGH SIGNAL'||label==='SESSION COMPLETE'||label==='NEGOTIATION COMPLETE';
  const col = isBlue ? BLUE : AMBER;
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:5, marginBottom:6 }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
      <span style={{ fontSize:9.5, letterSpacing:'.1em', textTransform:'uppercase' as const, color:col, fontWeight:600 }}>{label}</span>
    </div>
  );
}

// === Day + stacking helpers (NEW for modernized design) ===

function dayKey(ts?: number): string {
  if (!ts) return 'today';
  const d = new Date(ts); d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function formatDayLabel(ts?: number): string {
  if (!ts) return 'Today';
  const d = new Date(ts);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const dDay = new Date(d); dDay.setHours(0, 0, 0, 0);
  if (dDay.getTime() === today.getTime())     return 'Today';
  if (dDay.getTime() === yesterday.getTime()) return 'Yesterday';
  const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 6);
  if (dDay > weekAgo) return d.toLocaleDateString('en-US', { weekday: 'long' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
  }, [selectedId, recruiterMsgs, showA2A]);

  const togglePause = () => {
    setPausedThreads(prev => {
      const next = new Set(prev);
      if (next.has(selectedId)) { next.delete(selectedId); toast.show('Agent resumed'); }
      else { next.add(selectedId); toast.show('Agent paused \u2014 you can respond now'); }
      return next;
    });
  };

  const sendReply = () => {
    if (!reply.trim()) return;
    const msg: Msg = { id:`r-${Date.now()}`, from:'Sarah Chen', kind:'recruiter', text:reply, time:'Just now', ts: Date.now() };
    setRecruiterMsgs(prev => ({ ...prev, [selectedId]: [...(prev[selectedId]||[]), msg] }));
    setReply('');
    toast.show('Message sent');
  };

  const isPaused = pausedThreads.has(selectedId);
  const extraMsgs = recruiterMsgs[selectedId] || [];

  const getAvatar = (msg: Msg, t: Thread) => {
    const { kind, from } = msg;
    if (kind === 'agent' || kind === 'high-signal' || kind === 'signal') return <RecruiterAgentAvatar size={28} />;
    if (kind === 'recruiter') return <HumanAvatar name="Sarah Chen" seed={2} size={28} />;
    if (kind === 'recruiter2') return <HumanAvatar name={from} seed={5} size={28} />;
    if (kind === 'cand') {
      if (from.includes('Bot') || from.includes('bot')) return <CandAgentAvatar size={28} />;
      return <HumanAvatar name={from} seed={t.meta?.seed||3} size={28} />;
    }
    return null;
  };

  const isRight = (kind: MsgKind) => kind === 'recruiter' || kind === 'agent' || kind === 'high-signal' || kind === 'signal';

  const nameColor = (kind: MsgKind, from: string) => {
    if (kind === 'agent' || kind === 'high-signal') return BLUE;
    if (kind === 'cand' && (from.includes('Bot')||from.includes('bot'))) return TEAL;
    return MID;
  };

  const bubbleBg = (msg: Msg) => {
    if (msg.kind === 'high-signal') return BLUE_BG;
    if (msg.kind === 'signal') return '#FFFBF0';
    if (msg.kind === 'recruiter' || msg.kind === 'recruiter2') return BLUE_BG;
    if (msg.kind === 'agent') return BLUE_BG;
    return '#FAFAFA';
  };

  const bubbleBorder = (msg: Msg) => {
    if (msg.kind === 'high-signal') return 'none';
    if (msg.kind === 'signal') return 'none';
    if (msg.kind === 'recruiter' || msg.kind === 'agent') return `1px solid #C8D8FF`;
    if (msg.kind === 'recruiter2') return `1px solid #C8D8FF`;
    return `1px solid ${BORDER}`;
  };

  // Build renderable items with day separators + human-join + signal rows + stacked bubbles.
  // Signal/human-join rows DO NOT stack. Regular bubbles stack same sender within 5 minutes.
  const buildItems = (msgs: Msg[]) => {
    const items: any[] = [];
    let lastDay = '';
    let currentStack: any = null;

    for (let i = 0; i < msgs.length; i++) {
      const msg = msgs[i];
      const day = dayKey(msg.ts);
      if (day !== lastDay) {
        items.push({ kind:'day', label: formatDayLabel(msg.ts), key:'day-'+day+'-'+i });
        lastDay = day;
        currentStack = null;
      }

      if (msg.kind === 'human-join') {
        items.push({ kind:'human-join', msg, key:'hj-'+(msg.id||i) });
        currentStack = null;
        continue;
      }

      if (msg.kind === 'high-signal' || msg.kind === 'signal') {
        items.push({ kind:'signal', msg, key:'sig-'+(msg.id||i) });
        currentStack = null;
        continue;
      }

      const right = isRight(msg.kind);
      const within5min = currentStack && currentStack.lastTs && msg.ts &&
        (msg.ts - currentStack.lastTs) < 5 * 60 * 1000;
      if (currentStack && currentStack.right === right && currentStack.from === msg.from && within5min) {
        currentStack.msgs.push(msg);
        currentStack.lastTs = msg.ts;
      } else {
        currentStack = { kind:'stack', right, from: msg.from, msgs:[msg], lastTs: msg.ts, key:'stack-'+(msg.id||i) };
        items.push(currentStack);
      }
    }
    return items;
  };

  const renderItems = (msgs: Msg[]) => {
    const items = buildItems(msgs);
    return items.map((item: any) => {
      if (item.kind === 'day') {
        return (
          <div key={item.key} style={{ alignSelf:'center', fontSize:10, color:MUTED, padding:'4px 12px', background:'#fff', border:'1px solid '+BORDER, letterSpacing:'.06em', textTransform:'uppercase' as const, fontWeight:500, margin:'6px 0' }}>
            {item.label}
          </div>
        );
      }
      if (item.kind === 'human-join') {
        return (
          <div key={item.key} style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 0' }}>
            <div style={{ flex:1, height:1, background:BORDER }} />
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 12px', border:'1px solid '+BORDER, background:'#fff' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span style={{ fontSize:10, color:MUTED, fontWeight:300 }}>{item.msg.text}</span>
            </div>
            <div style={{ flex:1, height:1, background:BORDER }} />
          </div>
        );
      }
      if (item.kind === 'signal') {
        const msg = item.msg;
        const right = isRight(msg.kind);
        return (
          <div key={item.key} style={{ display:'flex', gap:10, alignItems:'flex-start', flexDirection:right?'row-reverse':'row' }}>
            {getAvatar(msg, thread!)}
            <div style={{ display:'flex', flexDirection:'column' as const, gap:4, maxWidth:'66%', alignItems:right?'flex-end':'flex-start' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, flexDirection:right?'row-reverse':'row' }}>
                <span style={{ fontSize:11, fontWeight:400, color:nameColor(msg.kind, msg.from), fontFamily:F }}>{msg.from}</span>
                <span style={{ fontSize:10, color:MUTED, fontWeight:300 }}>{msg.time}</span>
              </div>
              <div style={{
                padding:'11px 15px', fontSize:13, lineHeight:1.6, fontWeight:300, color:MID, fontFamily:F,
                background:bubbleBg(msg),
                borderLeft:`3px solid ${msg.kind==='high-signal'?BLUE:AMBER}`,
              }}>
                {msg.signal && <SignalBadge label={msg.signal} />}
                {msg.text}
              </div>
            </div>
          </div>
        );
      }
      // Regular bubble stack
      const stack = item;
      return (
        <div key={stack.key} style={{ display:'flex', gap:10, alignItems:'flex-start', flexDirection:stack.right?'row-reverse':'row' }}>
          {getAvatar(stack.msgs[0], thread!)}
          <div style={{ display:'flex', flexDirection:'column' as const, gap:3, maxWidth:'66%', alignItems:stack.right?'flex-end':'flex-start' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, flexDirection:stack.right?'row-reverse':'row' }}>
              <span style={{ fontSize:11, fontWeight:400, color:nameColor(stack.msgs[0].kind, stack.msgs[0].from), fontFamily:F }}>{stack.msgs[0].from}</span>
              <span style={{ fontSize:10, color:MUTED, fontWeight:300 }}>{stack.msgs[stack.msgs.length-1].time}</span>
            </div>
            {stack.msgs.map((m: Msg, i: number) => (
              <div key={m.id||i} style={{
                padding:'9px 14px', fontSize:13, lineHeight:1.55, fontWeight:300, color:stack.right?'#fff':MID, fontFamily:F,
                background: stack.right ? BLUE : bubbleBg(m),
                border: stack.right ? 'none' : bubbleBorder(m),
                wordBreak:'break-word' as const,
              }}>{m.text}</div>
            ))}
          </div>
        </div>
      );
    });
  };

  const allMsgs = thread ? (showA2A && thread.a2aTranscript ? thread.a2aTranscript : [...thread.messages, ...extraMsgs]) : [];

  return (
    <div style={{ display:'flex', flexDirection:'column' as const, flex:1, minHeight:0, fontFamily:F, overflow:'hidden' }}>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>

      {/* PAGE HEADER */}
      <div style={{ height: 68, paddingLeft: 24, paddingRight: 24, borderBottom: '1px solid ' + BORDER, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div>
          <div style={{ fontSize:11, color:MUTED, letterSpacing:'.1em', textTransform:'uppercase' as const, marginBottom:4, display:'flex', alignItems:'center' }}>
            Messages <DataSourceBadge fromApi={fromApi} />
          </div>
          <div style={{ fontSize:22, fontWeight:300, letterSpacing:'-0.02em', color:DARK }}>Conversations &amp; Agent Activity</div>
        </div>
      </div>

      {/* METRICS STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', background: BLUE, flexShrink: 0 }}>
        {[
          { v: '24', l: 'Conversations', sub: '8 active today' },
          { v: '3', l: 'Active Agents', sub: 'Explorer threads' },
          { v: '12', l: 'A2A Sessions', sub: 'Agent-to-agent' },
          { v: '4.2m', l: 'Avg Response', sub: 'Agent reply time' },
        ].map((m, i) => (
          <div key={i} style={{ padding: '18px 24px', borderRight: i < 3 ? '1px solid rgba(255,255,255,.1)' : 'none' }}>
            <div style={{ fontSize: 36, fontWeight: 300, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 4 }}>{m.v}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', fontWeight: 300, marginBottom: 2 }}>{m.l}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontWeight: 300 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* BODY */}
      <div style={{ display:'flex', flex:1, minHeight:0, overflow:'hidden' }}>

        {/* THREAD LIST */}
        <div style={{ width:380, flexShrink:0, borderRight:'1px solid '+BORDER, display:'flex', flexDirection:'column' as const, overflow:'hidden' }}>
          <div style={{ padding:'12px 14px 10px', borderBottom:'1px solid '+BORDER, flexShrink:0, background:'#fff' }}>
            {/* Filter pills */}
            <div style={{ display:'flex', gap:5, flexWrap:'wrap' as const, marginBottom:10 }}>
              {([['all','All'],['agent','Agents'],['a2a','A2A'],['team','Team']] as any[]).map(([k,l]:any)=>(
                <button key={k} onClick={()=>setFilter(k)} style={{
                  padding:'4px 10px', fontSize:11,
                  border:'1px solid '+(filter===k?BLUE:BORDER),
                  background:filter===k?'rgba(37,99,235,0.08)':'transparent',
                  color:filter===k?BLUE:MID,
                  cursor:'pointer', fontFamily:F,
                  fontWeight:filter===k?500:400,
                }}>{l}</button>
              ))}
            </div>
            {/* Search */}
            <div style={{ display:'flex', alignItems:'center', gap:8, background:BLIGHT, padding:'7px 11px', fontSize:12, color:MUTED }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search conversations\u2026"
                style={{ flex:1, border:'none', outline:'none', background:'transparent', fontSize:12, fontFamily:F, color:DARK }} />
            </div>
          </div>

          {/* Thread rows (custom recruiter design with score + stage) */}
          <div style={{ flex:1, overflowY:'auto' as const }}>
            {filtered.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center' as const }}>
                <div style={{ fontSize: 13, color: DARK, fontWeight: 500, marginBottom: 6 }}>No conversations</div>
                <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.5 }}>Try a different filter or clear the search.</div>
              </div>
            )}
            {filtered.map(t=>{
              const isSel = selectedId===t.id;
              return (
                <div key={t.id} onClick={()=>{ setSelectedId(t.id); setShowA2A(false); }}
                  style={{ padding:'12px 16px', borderBottom:'1px solid '+BLIGHT, cursor:'pointer', borderLeft:`2px solid ${isSel?BLUE:'transparent'}`, background:isSel?'rgba(37,99,235,.04)':'#fff', transition:'background .1s' }}>
                  <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                    <div style={{ position:'relative' as const, flexShrink:0 }}>
                      <ThreadDot type={t.type} size={32} />
                      {t.live && <div style={{ position:'absolute' as const, bottom:0, right:0, width:9, height:9, borderRadius:'50%', background:'#22C55E', border:'2px solid #fff', animation:'pulse 2s ease-in-out infinite' }} />}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:2, gap:6 }}>
                        <span style={{ fontSize:13, fontWeight:t.unread?500:400, color:DARK, whiteSpace:'nowrap' as const, overflow:'hidden', textOverflow:'ellipsis', flex:1, minWidth:0 }}>{t.name}</span>
                        <span style={{ fontSize:10, color:MUTED, fontWeight:300, flexShrink:0 }}>{t.time}</span>
                      </div>
                      <div style={{ fontSize:11, color:MUTED, fontWeight:300, marginBottom:5, whiteSpace:'nowrap' as const, overflow:'hidden', textOverflow:'ellipsis' }}>{t.sub}</div>
                      <div style={{ fontSize:11.5, color:t.unread?DARK:MUTED, fontWeight:300, lineHeight:1.45, marginBottom:6, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as const, overflow:'hidden' }}>{t.preview}</div>
                      {(t.meta?.score !== undefined || t.meta?.stage || t.unread) && (
                        <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' as const }}>
                          {t.meta?.score !== undefined && (
                            <span style={{ fontSize:10, padding:'2px 7px', background:BLUE_BG, color:BLUE_DARK, fontWeight:500, letterSpacing:'.02em' }}>Score {t.meta.score}</span>
                          )}
                          {t.meta?.stage && (
                            <span style={{ fontSize:10, padding:'2px 7px', background:BLIGHT, color:MID, fontWeight:400, border:'1px solid '+BORDER }}>{t.meta.stage}</span>
                          )}
                          {t.unread && <span style={{ marginLeft:'auto', width:6, height:6, borderRadius:'50%', background:BLUE }} />}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CONVERSATION */}
        {thread ? (
          <div style={{ flex:1, display:'flex', flexDirection:'column' as const, overflow:'hidden', minWidth:0 }}>

            {/* Conversation header (folded candidate context inline) */}
            <div style={{ padding:'14px 24px', borderBottom:'1px solid '+BORDER, display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
              {thread.meta?.candidate ? (
                <HumanAvatar name={thread.meta.candidate} seed={thread.meta.seed||thread.id.charCodeAt(1)} size={38} />
              ) : (
                <ThreadDot type={thread.type} size={38} />
              )}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:500, marginBottom:2, display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' as const }}>
                  {thread.meta?.candidate || thread.name}
                  {thread.meta?.role && (
                    <span style={{ fontSize:9, padding:'1px 6px', background:BLUE_BG, color:BLUE_DARK, letterSpacing:'.06em', textTransform:'uppercase' as const, fontWeight:500 }}>
                      {thread.type === 'a2a' ? 'A2A' : 'SNAP'} &middot; {thread.meta.role}
                    </span>
                  )}
                  {thread.live && <div style={{ width:6, height:6, borderRadius:'50%', background:'#22C55E', animation:'pulse 2s ease-in-out infinite' }} />}
                </div>
                <div style={{ fontSize:11, color:MUTED }}>
                  {thread.meta?.candidate ? thread.name + ' \u00b7 ' + thread.sub : thread.sub}
                </div>
              </div>
              {thread.meta?.score && (
                <div style={{ textAlign:'center' as const, padding:'0 14px', borderLeft:'1px solid '+BORDER }}>
                  <div style={{ fontSize:9, color:MUTED, letterSpacing:'.09em', textTransform:'uppercase' as const, marginBottom:3 }}>Deep Match</div>
                  <div style={{ fontSize:22, fontWeight:300, letterSpacing:'-0.02em', color:BLUE, lineHeight:1 }}>{thread.meta.score}</div>
                </div>
              )}
              {thread.meta?.stage && (
                <div style={{ textAlign:'center' as const, padding:'0 14px', borderLeft:'1px solid '+BORDER }}>
                  <div style={{ fontSize:9, color:MUTED, letterSpacing:'.09em', textTransform:'uppercase' as const, marginBottom:6 }}>Stage</div>
                  <span style={{ fontSize:10.5, padding:'3px 10px', background:BLIGHT, color:MID, fontWeight:400, border:'1px solid '+BORDER }}>{thread.meta.stage}</span>
                </div>
              )}
              <div style={{ display:'flex', gap:6, marginLeft:8 }}>
                {thread.a2aTranscript && (
                  <button onClick={()=>setShowA2A(!showA2A)}
                    style={{ padding:'6px 12px', border:'1px solid '+BORDER, background:showA2A?BLUE:'#fff', color:showA2A?'#fff':MID, fontFamily:F, fontSize:11, cursor:'pointer', whiteSpace:'nowrap' as const }}>
                    {showA2A ? 'Agent Summary' : 'Full A2A Transcript'}
                  </button>
                )}
                {thread.meta?.candidate && (
                  <button style={{ padding:'6px 12px', border:'1px solid '+BORDER, background:'#fff', color:MID, fontFamily:F, fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', gap:5, whiteSpace:'nowrap' as const }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    View Profile
                  </button>
                )}
                {thread.type !== 'team' && (
                  <button onClick={togglePause}
                    style={{
                      padding:'6px 12px',
                      border: isPaused ? 'none' : '1px solid '+BORDER,
                      background: isPaused ? BLUE : '#fff',
                      color: isPaused ? '#fff' : DARK,
                      fontFamily:F, fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontWeight:500, whiteSpace:'nowrap' as const,
                    }}>
                    {isPaused
                      ? <><svg width="10" height="10" viewBox="0 0 24 24" fill="#fff"><polygon points="5,3 19,12 5,21"/></svg> Resume Agent</>
                      : <><svg width="10" height="10" viewBox="0 0 24 24" fill={DARK}><rect x="4" y="3" width="6" height="18"/><rect x="14" y="3" width="6" height="18"/></svg> Pause Agent</>
                    }
                  </button>
                )}
              </div>
            </div>

            {/* A2A banner */}
            {showA2A && thread.a2aTranscript && (
              <div style={{ padding:'10px 24px', background:'#F3EEFF', borderBottom:'1px solid #DDD6FE', flexShrink:0 }}>
                <div style={{ fontSize:9, color:'#7C3AED', letterSpacing:'.1em', textTransform:'uppercase' as const, fontWeight:500 }}>Agent-to-Agent Transcript</div>
                <div style={{ fontSize:11, color:MID, fontWeight:300, marginTop:2 }}>Full conversation between recruiting agent and candidate agent</div>
              </div>
            )}

            {/* Paused banner */}
            {isPaused && !showA2A && (
              <div style={{ padding:'11px 24px', background:'#FAEEDA', borderBottom:'1px solid #FAC775', display:'flex', alignItems:'center', gap:12, flexShrink:0, fontSize:12, color:'#854F0B' }}>
                <span style={{ fontSize:14 }}>{'\u26A0'}</span>
                <div style={{ flex:1, lineHeight:1.5 }}>
                  <strong style={{ fontWeight:500 }}>You&rsquo;re in the loop.</strong>{' '}
                  Agent auto-replies are paused for this thread. Type below to message directly &mdash; resume the agent when you&rsquo;re ready to step back.
                </div>
              </div>
            )}

            {/* Messages */}
            <div style={{ flex:1, overflowY:'auto' as const, padding:'22px 28px', display:'flex', flexDirection:'column' as const, gap:14, background:BLIGHT }}>
              {renderItems(allMsgs)}
              <div ref={bottomRef} />
            </div>

            {/* Composer */}
            <div style={{ borderTop:'1px solid '+BORDER, padding:'12px 24px', flexShrink:0, background:'#fff' }}>
              {thread.type !== 'team' && !isPaused ? (
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ flex:1, padding:'9px 14px', background:BLIGHT, border:'1px solid '+BORDER, fontSize:12, color:MUTED, fontWeight:300, fontStyle:'italic' as const }}>
                    Agent is managing this conversation autonomously.
                  </div>
                  <button onClick={togglePause}
                    style={{ padding:'8px 14px', border:'1px solid '+BORDER, background:'#fff', cursor:'pointer', fontFamily:F, fontSize:12, color:DARK, display:'flex', alignItems:'center', gap:6, fontWeight:500 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill={DARK}><rect x="4" y="3" width="6" height="18"/><rect x="14" y="3" width="6" height="18"/></svg>
                    Pause Agent
                  </button>
                  <button onClick={togglePause}
                    style={{ padding:'8px 14px', border:'none', background:BLUE, cursor:'pointer', fontFamily:F, fontSize:12, color:'#fff', fontWeight:500 }}>
                    Intervene
                  </button>
                </div>
              ) : (
                <div style={{ background:BLIGHT, padding:'10px 12px', border:'1px solid '+BORDER }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
                    <HumanAvatar name="Sarah Chen" seed={2} size={26} />
                    <textarea
                      value={reply}
                      onChange={e=>setReply(e.target.value)}
                      onKeyDown={e=>{ if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                      placeholder={isPaused ? 'Respond while agent is paused\u2026' : 'Reply to thread\u2026'}
                      rows={1}
                      style={{ flex:1, border:'none', outline:'none', background:'transparent', resize:'none' as const, fontSize:13, color:DARK, fontFamily:F, lineHeight:1.5, minHeight:20, padding:0, marginTop:3 }}
                    />
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:8 }}>
                    <span style={{ flex:1, fontSize:10, color:MUTED, padding:'0 4px' }}>
                      Enter to send &middot; Shift + Enter for newline
                    </span>
                    <button onClick={sendReply} disabled={!reply.trim()}
                      style={{ background:BLUE, color:'#fff', border:'none', padding:'6px 16px', fontSize:12, fontWeight:500, cursor: reply.trim() ? 'pointer' : 'not-allowed', fontFamily:F, opacity: reply.trim() ? 1 : 0.5 }}>
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' as const, color:MUTED, fontSize:13, fontWeight:300, background:BLIGHT }}>
            <div style={{ fontSize:28, marginBottom:14, opacity:.4, letterSpacing:'-.05em' }}>{'\u2014\u2014'}</div>
            <div>Select a conversation</div>
          </div>
        )}
      </div>
    </div>
  );
}
