'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast';
import { useMessages } from '@/lib/data-provider';
import { DataSourceBadge } from '@/components/shared/api-status';
import { IconBot, IconHandshake, IconUser, IconSend, IconChevronRight } from '@/components/icons';

type ThreadType = 'agent' | 'a2a' | 'team';

interface Message {
  id: string;
  sender: string;
  type: 'agent' | 'user' | 'system' | 'a2a-left' | 'a2a-right';
  text: string;
  time: string;
  signal?: string;
}

interface Thread {
  id: string;
  type: ThreadType;
  title: string;
  subtitle: string;
  lastMsg: string;
  time: string;
  unread: boolean;
  messages: Message[];
  a2aTranscript?: Message[];
}

const THREADS: Thread[] = [
  {
    id: 't1', type: 'agent', title: 'StaffML-Agent', subtitle: 'Sara Kim screening', lastMsg: 'Screening complete — score 94, auto-advanced to Recruiter Review', time: '12m ago', unread: true,
    messages: [
      { id: 'm1', sender: 'StaffML-Agent', type: 'agent', text: 'Starting screening for Sara Kim (Staff ML Engineer). Candidate sourced from Taltas Network.', time: '2:14 PM' },
      { id: 'm2', sender: 'StaffML-Agent', type: 'agent', text: 'Initial engagement complete. Candidate demonstrated deep ML platform experience — led recommendation engine rebuild at Figma serving 40M+ users.', time: '2:22 PM' },
      { id: 'm3', sender: 'StaffML-Agent', type: 'agent', text: 'HIGH SIGNAL: Exceptional RLHF experience — implemented custom reward model reducing harmful content 73% while maintaining engagement. This is rare at this level.', time: '2:28 PM', signal: 'high' },
      { id: 'm4', sender: 'StaffML-Agent', type: 'agent', text: 'Screening complete — Deep Match score: 94. Auto-advanced to Recruiter Review. Recommend fast-tracking to interview panel.', time: '2:31 PM', signal: 'high' },
    ],
  },
  {
    id: 't2', type: 'a2a', title: 'A2A: Marcus Peterson', subtitle: 'PrincipalEng-Agent ↔ CTOBot', lastMsg: 'Negotiation concluded — both sides aligned on comp range and timeline', time: '1h ago', unread: true,
    messages: [
      { id: 'm5', sender: 'PrincipalEng-Agent', type: 'agent', text: 'A2A session initiated with CTOBot (representing Marcus Peterson). Competing FAANG offer detected with Friday deadline.', time: '1:05 PM' },
      { id: 'm6', sender: 'PrincipalEng-Agent', type: 'agent', text: 'Negotiation concluded. Both agents aligned on: compensation range $280-310K, signing bonus discussion, flexible start date. Full transcript available.', time: '1:42 PM' },
      { id: 'm7', sender: 'PrincipalEng-Agent', type: 'agent', text: 'Recommendation: Move to final round immediately. Candidate showed strong enthusiasm but has hard deadline Friday.', time: '1:44 PM', signal: 'high' },
    ],
    a2aTranscript: [
      { id: 'a1', sender: 'PrincipalEng-Agent', type: 'a2a-left', text: 'Hello CTOBot. I represent the hiring team for the Principal Engineer position. Marcus has expressed strong interest. Let\'s discuss alignment on key terms.', time: '1:05 PM' },
      { id: 'a2', sender: 'CTOBot', type: 'a2a-right', text: 'Thanks for reaching out. Marcus is excited about the role but has a competing offer from a FAANG company with a Friday deadline. Let\'s ensure we can move quickly.', time: '1:07 PM' },
      { id: 'a3', sender: 'PrincipalEng-Agent', type: 'a2a-left', text: 'Understood. Let me share the compensation framework: base range $260-310K, equity package, and comprehensive benefits. We can expedite our timeline.', time: '1:10 PM' },
      { id: 'a4', sender: 'CTOBot', type: 'a2a-right', text: 'Marcus\'s expectation is in the $280-310K base range based on his 12 years of experience and Stripe leadership track record. The FAANG offer is at the upper end.', time: '1:14 PM' },
      { id: 'a5', sender: 'PrincipalEng-Agent', type: 'a2a-left', text: 'We can work within that range. Our equity package vests over 4 years with a 1-year cliff and is competitive with FAANG RSU grants. Can we discuss start date flexibility?', time: '1:18 PM' },
      { id: 'a6', sender: 'CTOBot', type: 'a2a-right', text: 'Marcus prefers a March or early April start. He needs 3 weeks notice at his current role. A signing bonus would strengthen the offer given the competing timeline.', time: '1:22 PM' },
      { id: 'a7', sender: 'PrincipalEng-Agent', type: 'a2a-left', text: 'We can accommodate a March 17 start date. I\'ll flag the signing bonus request to the hiring team. Our standard range is $15-25K for this level.', time: '1:26 PM' },
      { id: 'a8', sender: 'CTOBot', type: 'a2a-right', text: 'That timeline works. On the signing bonus, $20K would be the minimum to offset the FAANG offer\'s sign-on. Marcus is genuinely excited about the technical challenges here.', time: '1:30 PM' },
      { id: 'a9', sender: 'PrincipalEng-Agent', type: 'a2a-left', text: 'Noted. Let me summarize our alignment: Base $280-310K, equity package, $20K signing bonus request, March 17 start date. I\'ll present this to the hiring manager for final approval.', time: '1:35 PM' },
      { id: 'a10', sender: 'CTOBot', type: 'a2a-right', text: 'Confirmed. Marcus will prioritize your offer if these terms are met. He\'s particularly drawn to the distributed systems architecture work. Looking forward to the final round.', time: '1:38 PM' },
      { id: 'a11', sender: 'PrincipalEng-Agent', type: 'a2a-left', text: 'Excellent. Session concluded. I\'ll update the recruiter with full details and recommend expediting to final round this week.', time: '1:42 PM' },
    ],
  },
  {
    id: 't3', type: 'agent', title: 'DevRel-Agent', subtitle: 'Weekly performance summary', lastMsg: 'Screened 8 candidates this week — 3 advanced, avg score 82', time: '5h ago', unread: true,
    messages: [
      { id: 'm8', sender: 'DevRel-Agent', type: 'agent', text: 'Weekly Summary — DevRel Engineer Role\n\nScreened: 8 candidates\nAdvanced to Review: 3 (avg score: 82)\nRejected: 4 (avg score: 58)\nPending: 1\n\nTop candidate: Jordan Rivera (score: 89) — strong community building experience, 15K GitHub followers.', time: '9:00 AM' },
      { id: 'm9', sender: 'DevRel-Agent', type: 'agent', text: 'Recommendation: Consider adjusting culture-fit weighting from 20% to 25%. Several candidates with strong technical skills scored low on community engagement.', time: '9:02 AM' },
    ],
  },
  {
    id: 't4', type: 'team', title: 'Engineering Hiring', subtitle: 'Team channel', lastMsg: 'Updated Q1 hiring targets — 3 remaining positions', time: '6h ago', unread: false,
    messages: [
      { id: 'm10', sender: 'Sarah M.', type: 'user', text: 'Updated Q1 hiring targets: we still need to fill Staff ML Eng, Principal Eng, and Founding Eng. Let\'s prioritize the ML role.', time: 'Yesterday' },
      { id: 'm11', sender: 'David K.', type: 'user', text: 'Agreed. I\'ve reviewed the comp benchmarks — we should increase the Founding Eng range to be competitive with series-A offers.', time: 'Yesterday' },
      { id: 'm12', sender: 'Sarah M.', type: 'user', text: 'Good call. I\'ll update the role config. Also, let\'s discuss the Marcus Peterson situation in our 1:1 — we need to move fast.', time: '6h ago' },
    ],
  },
  {
    id: 't5', type: 'a2a', title: 'A2A: Priya Sharma', subtitle: 'StaffAI-Agent ↔ CareerBot', lastMsg: 'Session complete — mutual interest confirmed, timeline aligned', time: '1d ago', unread: false,
    messages: [
      { id: 'm13', sender: 'StaffAI-Agent', type: 'agent', text: 'A2A session with CareerBot for Priya Sharma (Staff AI Systems Eng). Session focused on role expectations and growth trajectory.', time: 'Yesterday' },
      { id: 'm14', sender: 'StaffAI-Agent', type: 'agent', text: 'Both sides confirmed mutual interest. Priya is currently 2 weeks into notice period. Timeline aligns with our March hiring target.', time: 'Yesterday' },
    ],
    a2aTranscript: [
      { id: 'b1', sender: 'StaffAI-Agent', type: 'a2a-left', text: 'Welcome, CareerBot. I\'m reaching out regarding the Staff AI Systems Engineer role. Priya\'s profile shows strong alignment with our requirements.', time: '10:30 AM' },
      { id: 'b2', sender: 'CareerBot', type: 'a2a-right', text: 'Thank you. Priya is very interested in the AI systems work. She\'s looking for a role where she can own the full ML infrastructure stack. Can you share more about the team?', time: '10:33 AM' },
      { id: 'b3', sender: 'StaffAI-Agent', type: 'a2a-left', text: 'The team is 6 engineers working on real-time inference pipelines and model serving infrastructure. The role involves leading the RLHF training pipeline initiative.', time: '10:36 AM' },
      { id: 'b4', sender: 'CareerBot', type: 'a2a-right', text: 'That aligns well. Priya built similar systems at her current company. She\'s in her notice period and available starting mid-March. What are the next steps?', time: '10:40 AM' },
      { id: 'b5', sender: 'StaffAI-Agent', type: 'a2a-left', text: 'I\'ll recommend moving her to the interview stage. The panel includes the VP of Engineering and two staff engineers. Session concluded — mutual interest confirmed.', time: '10:44 AM' },
    ],
  },
];

export default function MessagesPage() {
  const [filter, setFilter] = useState<'all' | ThreadType>('all');
  const [selectedId, setSelectedId] = useState<string | null>('t1');
  const messagesQuery = useMessages();
  const fromApi = !!messagesQuery.data?.fromApi;
  const [showA2ATranscript, setShowA2ATranscript] = useState(false);
  const [reply, setReply] = useState('');
  const [pausedThreads, setPausedThreads] = useState<Set<string>>(new Set());
  const [recruiterMsgs, setRecruiterMsgs] = useState<Record<string, Message[]>>({});
  const toast = useToast();

  const filtered = filter === 'all' ? THREADS : THREADS.filter(t => t.type === filter);
  const selected = THREADS.find(t => t.id === selectedId);

  return (
    <div className="flex flex-col gap-[13px]">
      <div className="card" style={{ padding: '14px 20px' }}>
        <div className="flex items-center justify-between">
          <span className="text-[16px] font-semibold" style={{ fontFamily: "'Roboto Slab', serif", color: 'var(--text-bright)' }}>Messages<DataSourceBadge fromApi={fromApi} /></span>
          <div className="flex gap-[2px] p-[3px] rounded-[7px]" style={{ background: 'var(--surface3)' }}>
            {([['all', 'All'], ['agent', 'Agents'], ['a2a', 'A2A Sessions'], ['team', 'Team']] as const).map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k as any)} className="font-mono text-[9px] px-[10px] py-[4px] rounded-[5px] transition-all" style={{
                color: filter === k ? 'var(--blue)' : 'var(--text-dim)',
                background: filter === k ? 'var(--surface)' : 'transparent',
                fontWeight: filter === k ? 600 : 400,
              }}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-[13px]" style={{ gridTemplateColumns: '340px 1fr', minHeight: 'calc(100vh - 200px)' }}>
        {/* Thread List */}
        <div className="card" style={{ padding: '8px', overflow: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
          {filtered.map(t => (
            <div key={t.id} className={`msg-thread ${t.unread ? 'unread' : ''} ${selectedId === t.id ? 'selected' : ''}`} onClick={() => { setSelectedId(t.id); setShowA2ATranscript(false); }} style={{ padding: '10px 12px' }}>
              <div className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center flex-shrink-0" style={{
                background: t.type === 'agent' ? 'var(--green-bg)' : t.type === 'a2a' ? 'var(--purple-bg)' : 'var(--blue-bg)',
                border: '1px solid var(--border)',
              }}>
                {t.type === 'agent' && <IconBot size={14} color="var(--green)" />}
                {t.type === 'a2a' && <IconHandshake size={14} color="var(--purple)" />}
                {t.type === 'team' && <IconUser size={14} color="var(--blue)" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-[6px]">
                  <span className="text-[11.5px] font-semibold truncate" style={{ color: 'var(--text-bright)' }}>{t.title}</span>
                  <span className="font-mono text-[8px] flex-shrink-0" style={{ color: 'var(--muted)' }}>{t.time}</span>
                </div>
                <div className="font-mono text-[8.5px] mt-[1px]" style={{ color: t.type === 'a2a' ? 'var(--purple)' : 'var(--muted)' }}>{t.subtitle}</div>
                <div className="text-[10.5px] mt-[3px] truncate" style={{ color: 'var(--text-dim)' }}>{t.lastMsg}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Detail */}
        <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 200px)' }}>
          {selected ? (
            <>
              <div className="flex items-center justify-between pb-[12px] mb-[12px]" style={{ borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div className="text-[14px] font-semibold" style={{ color: 'var(--text-bright)' }}>{selected.title}</div>
                  <div className="font-mono text-[9px] mt-[1px]" style={{ color: selected.type === 'a2a' ? 'var(--purple)' : 'var(--muted)' }}>{selected.subtitle}</div>
                </div>
                {selected.a2aTranscript && (
                  <button className={`ctrl-btn ${showA2ATranscript ? 'blue' : ''}`} onClick={() => setShowA2ATranscript(!showA2ATranscript)} style={{ fontSize: '9px' }}>
                    <IconHandshake size={10} className="inline mr-[4px]" />
                    {showA2ATranscript ? 'Agent Summary' : 'View Full A2A Transcript'}
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto pr-[4px]" style={{ scrollbarWidth: 'thin' }}>
                {showA2ATranscript && selected.a2aTranscript ? (
                  <div>
                    <div className="p-[10px_12px] rounded-[8px] mb-[14px]" style={{ background: 'var(--purple-bg)', border: '1px solid var(--purple-border)' }}>
                      <div className="font-mono text-[9px] font-bold" style={{ color: 'var(--purple)' }}>AGENT-TO-AGENT TRANSCRIPT</div>
                      <div className="text-[10.5px] mt-[2px]" style={{ color: 'var(--text-dim)' }}>Full conversation between recruiting agent and candidate agent</div>
                    </div>
                    {selected.a2aTranscript.map(msg => (
                      <div key={msg.id} className={`flex gap-[10px] mb-[10px] ${msg.type === 'a2a-right' ? 'flex-row-reverse' : ''}`}>
                        <div className="w-[28px] h-[28px] rounded-[7px] flex items-center justify-center flex-shrink-0" style={{
                          background: msg.type === 'a2a-left' ? 'var(--blue-bg)' : 'var(--purple-bg)',
                          border: `1px solid ${msg.type === 'a2a-left' ? 'var(--blue-border)' : 'var(--purple-border)'}`,
                        }}>
                          <IconBot size={13} color={msg.type === 'a2a-left' ? 'var(--blue)' : 'var(--purple)'} />
                        </div>
                        <div className={`flex-1 min-w-0 ${msg.type === 'a2a-right' ? 'text-right' : ''}`}>
                          <div className="font-mono text-[8.5px] mb-[2px]" style={{ color: msg.type === 'a2a-left' ? 'var(--blue)' : 'var(--purple)' }}>
                            {msg.sender} <span style={{ color: 'var(--muted)' }}>{msg.time}</span>
                          </div>
                          <div className="text-[11.5px] leading-[1.55] p-[8px_11px] rounded-[8px] inline-block" style={{
                            color: 'var(--text-mid)',
                            background: msg.type === 'a2a-left' ? 'var(--surface2)' : 'var(--purple-bg)',
                            maxWidth: '85%', textAlign: 'left',
                          }}>{msg.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  selected.messages.map(msg => (
                    <div key={msg.id} className={`flex gap-[10px] mb-[10px] ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                      {msg.type === 'agent' && <div className="w-[28px] h-[28px] rounded-[7px] flex items-center justify-center flex-shrink-0" style={{ background: 'var(--green-bg)', border: '1px solid var(--border)' }}><IconBot size={13} color="var(--green)" /></div>}
                      {msg.type === 'user' && <div className="w-[28px] h-[28px] rounded-full flex items-center justify-center flex-shrink-0 font-mono text-[9px] font-bold" style={{ background: 'var(--blue-bg)', color: 'var(--blue)', border: '1px solid var(--border)' }}>You</div>}
                      <div className={`flex-1 min-w-0 ${msg.type === 'user' ? 'text-right' : ''}`}>
                        <div className="font-mono text-[8.5px] mb-[2px]" style={{ color: 'var(--muted)' }}>{msg.sender} · {msg.time}</div>
                        <div className="chat-bubble agent inline-block" style={{ textAlign: 'left' }}>
                          {msg.signal && <div className="font-mono text-[8px] font-bold mb-[3px]" style={{ color: 'var(--green)' }}>⚡ {msg.signal.toUpperCase()} SIGNAL</div>}
                          <span style={{ whiteSpace: 'pre-line' }}>{msg.text}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* #12 — Recruiter Respond: Pause agent, respond, resume */}
              {selected && (() => {
                const isPaused = pausedThreads.has(selected.id);
                const extraMsgs = recruiterMsgs[selected.id] || [];
                const togglePause = () => {
                  setPausedThreads(prev => {
                    const next = new Set(prev);
                    if (next.has(selected.id)) { next.delete(selected.id); toast.show('Agent resumed — conversation continues'); }
                    else { next.add(selected.id); toast.show('Agent paused — you can respond now'); }
                    return next;
                  });
                };
                const sendReply = () => {
                  if (!reply.trim()) return;
                  const msg: Message = { id: `r-${Date.now()}`, sender: 'You (Recruiter)', type: 'user', text: reply, time: 'Just now' };
                  setRecruiterMsgs(prev => ({ ...prev, [selected.id]: [...(prev[selected.id] || []), msg] }));
                  setReply('');
                  toast.show('Message sent');
                };
                return (
                  <div className="mt-[12px] pt-[12px]" style={{ borderTop: '1px solid var(--border)' }}>
                    {extraMsgs.length > 0 && (
                      <div className="mb-[8px]">
                        {extraMsgs.map(msg => (
                          <div key={msg.id} className="flex gap-[10px] mb-[8px] flex-row-reverse">
                            <div className="w-[28px] h-[28px] rounded-full flex items-center justify-center flex-shrink-0 font-mono text-[9px] font-bold" style={{ background: 'var(--blue-bg)', color: 'var(--blue)', border: '1px solid var(--border)' }}>You</div>
                            <div className="flex-1 min-w-0 text-right">
                              <div className="font-mono text-[8.5px] mb-[2px]" style={{ color: 'var(--muted)' }}>{msg.sender} · {msg.time}</div>
                              <div className="chat-bubble agent inline-block" style={{ textAlign: 'left', background: 'var(--blue-bg)', border: '1px solid var(--blue-border)' }}>{msg.text}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-[8px] items-center">
                      {selected.type !== 'team' && (
                        <button className={`ctrl-btn ${isPaused ? 'run' : ''} flex items-center gap-[3px]`} onClick={togglePause} style={{ fontSize: 9 }}>
                          {isPaused ? (<><svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg> Resume Agent</>) : (<><svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="3" width="6" height="18"/><rect x="14" y="3" width="6" height="18"/></svg> Pause Agent</>)}
                        </button>
                      )}
                      {(isPaused || selected.type === 'team') && (
                        <>
                          <input className="form-input" style={{ flex: 1, padding: '8px 12px', fontSize: '11.5px' }} value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendReply()} placeholder={isPaused ? 'Respond while agent is paused…' : 'Reply to thread…'} />
                          <button className="ctrl-btn run" onClick={sendReply}><IconSend size={10} /> Send</button>
                        </>
                      )}
                      {!isPaused && selected.type !== 'team' && (
                        <span className="font-mono text-[9px]" style={{ color: 'var(--muted)' }}>Pause agent to respond in this conversation</span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[12px]" style={{ color: 'var(--muted)' }}>Select a thread to view messages</div>
          )}
        </div>
      </div>
    </div>
  );
}
