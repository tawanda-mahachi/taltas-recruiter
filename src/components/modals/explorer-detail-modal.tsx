'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import { resolveIcon } from '@/components/icon-resolver';
import { IconX, IconUser, IconSearch, IconMessageCircle } from '@/components/icons';

const BOT_DATA: Record<string, any> = {
  staffml: { name: 'StaffML-Agent', icon: 'bot', iconBg: 'var(--green-bg)', role: 'Staff ML Engineer', status: 'Active', conversations: 47, botToBots: 12, interviews: 9, rejected: 14, offerRate: '19.1%', deepMatch: '87%', tokensTotal: 2847000, costToDate: 14.23, costPerConv: 0.303, rejReasons: [{ label: 'Insufficient experience', pct: 35 }, { label: 'Skill mismatch', pct: 28 }, { label: 'Culture misalignment', pct: 22 }, { label: 'Salary expectations', pct: 15 }], withdrawReasons: [{ label: 'Accepted other offer', pct: 40 }, { label: 'Salary too low', pct: 25 }, { label: 'Role mismatch', pct: 20 }, { label: 'Location preference', pct: 15 }], threads: [{ name: 'Wei Chen', company: 'Anthropic', time: '2h ago', preview: 'Great fit for ML infra. Discussed distributed training with PyTorch FSDP...', score: 92, status: 'active', msgs: 12 }, { name: 'Priya S.', company: 'Meta', time: '5h ago', preview: 'Strong recommendation systems background. Scheduled technical screen...', score: 87, status: 'interview', msgs: 8 }, { name: 'Marcus T.', company: 'Databricks', time: '1d ago', preview: 'Spark optimization and real-time feature stores. Very engaged...', score: 85, status: 'active', msgs: 15 }] },
  principaleng: { name: 'PrincipalEng-Agent', icon: 'dna', iconBg: 'var(--blue-bg)', role: 'Principal Eng., Platform', status: 'Active', conversations: 31, botToBots: 8, interviews: 6, rejected: 9, offerRate: '19.4%', deepMatch: '91%', tokensTotal: 1923000, costToDate: 9.62, costPerConv: 0.310, rejReasons: [{ label: 'Architecture depth', pct: 38 }, { label: 'Scale experience', pct: 30 }, { label: 'Leadership gaps', pct: 20 }, { label: 'Other', pct: 12 }], withdrawReasons: [{ label: 'Counter-offered', pct: 45 }, { label: 'Timeline too slow', pct: 30 }, { label: 'Other', pct: 25 }], threads: [{ name: 'Jordan K.', company: 'Stripe', time: '4h ago', preview: '15+ years platform experience. API design philosophy...', score: 89, status: 'active', msgs: 9 }, { name: 'Lin W.', company: 'Vercel', time: '1d ago', preview: 'Next.js and edge computing background...', score: 84, status: 'active', msgs: 7 }] },
  devrel: { name: 'DevRel-Agent', icon: 'target', iconBg: 'var(--purple-bg)', role: 'DevRel Engineer', status: 'Assist', conversations: 19, botToBots: 5, interviews: 3, rejected: 6, offerRate: '15.8%', deepMatch: '82%', tokensTotal: 986000, costToDate: 4.93, costPerConv: 0.259, rejReasons: [{ label: 'Community experience', pct: 40 }, { label: 'Writing quality', pct: 35 }, { label: 'Other', pct: 25 }], withdrawReasons: [{ label: 'Preferred IC role', pct: 50 }, { label: 'Other', pct: 50 }], threads: [{ name: 'Chris B.', company: 'Hashicorp', time: '6h ago', preview: 'Active OSS contributor, 12k GitHub followers...', score: 82, status: 'active', msgs: 5 }] },
};

const statusColors: Record<string, string> = { active: 'var(--green)', interview: 'var(--blue)', paused: 'var(--orange)' };
const statusLabels: Record<string, string> = { active: 'Active', interview: 'Interview Set', paused: 'Paused' };

export function ExplorerDetailModal({ open, onClose, explorerId }: { open: boolean; onClose: () => void; explorerId: string | null }) {
  const [tab, setTab] = useState<'overview' | 'conversations' | 'rejected' | 'cost'>('overview');
  const [convSearch, setConvSearch] = useState('');
  const [selectedConv, setSelectedConv] = useState<number | null>(null);
  const router = useRouter();
  if (!explorerId) return null;
  const d = BOT_DATA[explorerId];
  if (!d) return null;

  return (
    <Modal open={open} onClose={onClose} maxWidth="min(780px, 95vw)">
      <div className="flex items-center gap-[10px] mb-[14px]">
        <div className="w-[36px] h-[36px] rounded-[8px] flex items-center justify-center flex-shrink-0" style={{ background: d.iconBg, border: '1px solid var(--border)' }}>{resolveIcon(d.icon, { size: 18 })}</div>
        <div className="flex-1"><div className="text-[17px] font-bold" style={{ fontFamily: "'Roboto Slab', serif", color: 'var(--text-bright)' }}>{d.name}</div><div className="text-[12px]" style={{ color: 'var(--muted)' }}>{d.role}</div></div>
        <span className="font-mono text-[9px] px-[8px] py-[2px] rounded" style={{ color: `var(--${d.status === 'Active' ? 'green' : 'blue'})`, background: `var(--${d.status === 'Active' ? 'green' : 'blue'}-bg)`, border: `1px solid var(--${d.status === 'Active' ? 'green' : 'blue'}-border)` }}>{d.status}</span>
        <button onClick={onClose} className="ctrl-btn"><IconX size={10} /></button>
      </div>

      <div className="flex overflow-x-auto mx-[-24px] px-[24px]" style={{ borderBottom: '1px solid var(--border)' }}>
        {(['overview', 'conversations', 'rejected', 'cost'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className="font-mono text-[10px] px-[14px] py-[8px] cursor-pointer transition-colors whitespace-nowrap" style={{ color: tab === t ? 'var(--blue)' : 'var(--muted)', borderBottom: tab === t ? '2px solid var(--blue)' : '2px solid transparent', background: 'transparent', fontWeight: tab === t ? 700 : 400 }}>
            {t === 'overview' ? 'Overview' : t === 'conversations' ? 'Conversations' : t === 'rejected' ? 'Rejected' : 'Cost & Usage'}
          </button>
        ))}
      </div>

      <div className="mx-[-24px] px-[24px] pt-[14px] overflow-y-auto" style={{ maxHeight: '65vh' }}>
        {tab === 'overview' && (<div>
          <div className="grid gap-[9px] mb-[16px]" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[{ v: d.conversations, l: 'Conversations' }, { v: d.botToBots, l: 'Agent-to-Agent' }, { v: d.interviews, l: 'Interviews Set' }, { v: d.rejected, l: 'Rejected', color: 'red' }, { v: d.offerRate, l: 'Offer Rate', color: 'green' }, { v: d.deepMatch, l: 'Deep Match Avg', color: 'blue' }].map(s => (
              <div key={s.l} className="text-center p-[10px] rounded-[9px]" style={{ background: s.color ? `var(--${s.color}-bg)` : 'var(--surface2)', border: `1px solid ${s.color ? `var(--${s.color}-border)` : 'var(--border)'}` }}>
                <div className="text-[18px] font-bold" style={{ fontFamily: "'Roboto Slab', serif", color: s.color ? `var(--${s.color})` : 'var(--text-bright)' }}>{s.v}</div>
                <div className="font-mono text-[8px]" style={{ color: 'var(--muted)' }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div className="font-mono text-[9px] uppercase tracking-[.12em] mb-[8px] pb-[4px]" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>Rejection Reasons — By Explorer</div>
          {d.rejReasons.map((r: any) => (<div key={r.label} className="flex items-center gap-[8px] mb-[6px]"><span className="text-[10px] w-[140px] flex-shrink-0" style={{ color: 'var(--text-dim)' }}>{r.label}</span><div className="flex-1 h-[5px] rounded overflow-hidden" style={{ background: 'var(--surface3)' }}><div className="h-full rounded" style={{ width: `${r.pct}%`, background: 'var(--red)' }} /></div><span className="font-mono text-[9px] w-[30px] text-right" style={{ color: 'var(--muted)' }}>{r.pct}%</span></div>))}
          <div className="font-mono text-[9px] uppercase tracking-[.12em] mt-[14px] mb-[8px] pb-[4px]" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>Withdrawal Reasons — By Candidate</div>
          {d.withdrawReasons.map((r: any) => (<div key={r.label} className="flex items-center gap-[8px] mb-[6px]"><span className="text-[10px] w-[140px] flex-shrink-0" style={{ color: 'var(--text-dim)' }}>{r.label}</span><div className="flex-1 h-[5px] rounded overflow-hidden" style={{ background: 'var(--surface3)' }}><div className="h-full rounded" style={{ width: `${r.pct}%`, background: 'var(--orange)' }} /></div><span className="font-mono text-[9px] w-[30px] text-right" style={{ color: 'var(--muted)' }}>{r.pct}%</span></div>))}
        </div>)}

        {tab === 'conversations' && (<div>
          {selectedConv !== null ? (() => {
            const ct = d.threads[selectedConv];
            if (!ct) return null;
            const sampleMsgs = [
              { from: 'agent', text: `Hi ${ct.name.split(' ')[0]}, thanks for connecting. I'd love to learn about your experience at ${ct.company} and how it relates to our ${d.role} role.` },
              { from: 'cand', text: `Thanks for reaching out! At ${ct.company}, I've been focused on scaling our core platform. Happy to share more about my experience.` },
              { from: 'agent', text: `That sounds great. Can you walk me through a challenging technical decision you made recently?` },
              { from: 'cand', text: `Sure — we had to redesign our data pipeline to handle 10x throughput. I led the architecture review and we migrated to an event-driven approach that cut latency by 40%.`, moment: true },
              { from: 'agent', text: `Impressive. How do you approach collaborating with cross-functional teams when priorities conflict?` },
              { from: 'cand', text: `I believe in transparent communication and data-driven prioritization. I set up shared dashboards so everyone could see impact metrics in real-time.` },
            ];
            return (<div>
              <button className="ctrl-btn" style={{ fontSize: 9, marginBottom: 12 }} onClick={() => setSelectedConv(null)}>← Back to conversations</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '10px 12px', borderRadius: 9, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--blue-bg)', border: '1px solid var(--border)' }}><IconUser size={16} color="var(--blue)" /></div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-bright)' }}>{ct.name}</div><div className="font-mono" style={{ fontSize: 9, color: 'var(--muted)' }}>{ct.company} · Score: {ct.score} · {ct.msgs} messages</div></div>
                <span className="font-mono" style={{ fontSize: 9, padding: '2px 8px', borderRadius: 4, color: statusColors[ct.status], background: `color-mix(in srgb, ${statusColors[ct.status]} 15%, transparent)`, border: `1px solid color-mix(in srgb, ${statusColors[ct.status]} 25%, transparent)` }}>{statusLabels[ct.status]}</span>
              </div>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {sampleMsgs.map((m, mi) => (
                  <div key={mi} style={{ display: 'flex', gap: 10, marginBottom: 10, flexDirection: m.from === 'cand' ? 'row-reverse' : 'row' }}>
                    <div style={{ width: 26, height: 26, borderRadius: m.from === 'agent' ? 6 : '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: m.from === 'agent' ? 'var(--blue-bg)' : 'var(--green-bg)', border: '1px solid var(--border)', fontSize: 10, fontWeight: 600, color: m.from === 'agent' ? 'var(--blue)' : 'var(--green)' }}>{m.from === 'agent' ? 'E' : ct.name[0]}</div>
                    <div style={{ flex: 1, minWidth: 0, textAlign: m.from === 'cand' ? 'right' : 'left' }}>
                      <div style={{ fontSize: 11.5, lineHeight: 1.5, padding: '8px 10px', borderRadius: 8, display: 'inline-block', color: 'var(--text-mid)', background: m.from === 'agent' ? 'var(--surface2)' : 'var(--blue-bg)', maxWidth: '88%', textAlign: 'left' }}>
                        {(m as any).moment && <div className="font-mono" style={{ fontSize: 8, fontWeight: 700, marginBottom: 3, color: 'var(--green)' }}>⚡ HIGH SIGNAL</div>}
                        {m.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="ctrl-btn blue flex items-center gap-[4px]" style={{ fontSize: '9px', marginTop: 12 }} onClick={() => { onClose(); router.push('/messages'); }}><IconMessageCircle size={10} /> Continue in Messages</button>
            </div>);
          })() : (<div>
          <div className="flex gap-[6px] mb-[12px]">
            <div className="relative flex-1"><IconSearch size={12} className="absolute left-[9px] top-1/2 -translate-y-1/2 opacity-40" /><input className="form-input" style={{ fontSize: '11px', paddingLeft: 32 }} placeholder="Search conversations..." value={convSearch} onChange={e => setConvSearch(e.target.value)} /></div>
            <select className="form-select" style={{ fontSize: '10px', padding: '7px 10px' }}><option>All Status</option><option>Active</option><option>Interview Set</option></select>
          </div>
          <div className="max-h-[380px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {d.threads.filter((t: any) => !convSearch || t.name.toLowerCase().includes(convSearch.toLowerCase())).map((t: any, i: number) => (
              <div key={i} className="flex gap-[12px] p-[12px] rounded-[9px] mb-[8px] cursor-pointer transition-all hover:bg-[var(--surface2)]" style={{ border: '1px solid var(--border)' }} onClick={() => setSelectedConv(i)}>
                <div className="w-[36px] h-[36px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--blue-bg)', border: '1px solid var(--border)' }}><IconUser size={16} color="var(--blue)" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-[6px] mb-[3px]"><span className="text-[12px] font-semibold" style={{ color: 'var(--text-bright)' }}>{t.name}</span><span className="font-mono text-[9px]" style={{ color: 'var(--muted)' }}>{t.company}</span><span className="font-mono text-[9px] ml-auto" style={{ color: 'var(--muted)' }}>{t.time}</span></div>
                  <div className="text-[11px] overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: 'var(--text-dim)' }}>{t.preview}</div>
                  <div className="flex items-center gap-[8px] mt-[6px]">
                    <span className="font-mono text-[9px] px-[7px] py-[2px] rounded" style={{ background: `color-mix(in srgb, ${statusColors[t.status]} 15%, transparent)`, color: statusColors[t.status], border: `1px solid color-mix(in srgb, ${statusColors[t.status]} 25%, transparent)` }}>{statusLabels[t.status]}</span>
                    <span className="font-mono text-[9px]" style={{ color: 'var(--muted)' }}>Score: {t.score}</span>
                    <span className="font-mono text-[9px]" style={{ color: 'var(--muted)' }}>{t.msgs} msgs</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>)}
        </div>)}

        {tab === 'rejected' && (<div className="text-center py-[30px]" style={{ color: 'var(--muted)' }}>
          <div className="text-[13px] mb-[4px]">{d.rejected} candidates rejected</div>
          <div className="text-[11px]">Detailed rejection profiles are generated after Explorer review</div>
        </div>)}

        {tab === 'cost' && (<div>
          <div className="grid gap-[9px] mb-[14px]" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="text-center p-[10px] rounded-[9px]" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}><div className="text-[18px] font-bold" style={{ fontFamily: "'Roboto Slab', serif", color: 'var(--text-bright)' }}>{d.tokensTotal.toLocaleString()}</div><div className="font-mono text-[8px]" style={{ color: 'var(--muted)' }}>Total Tokens</div></div>
            <div className="text-center p-[10px] rounded-[9px]" style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)' }}><div className="text-[18px] font-bold" style={{ fontFamily: "'Roboto Slab', serif", color: 'var(--green)' }}>${d.costToDate.toFixed(2)}</div><div className="font-mono text-[8px]" style={{ color: 'var(--muted)' }}>Cost to Date</div></div>
            <div className="text-center p-[10px] rounded-[9px]" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}><div className="text-[18px] font-bold" style={{ fontFamily: "'Roboto Slab', serif", color: 'var(--text-bright)' }}>${d.costPerConv.toFixed(3)}</div><div className="font-mono text-[8px]" style={{ color: 'var(--muted)' }}>Per Conversation</div></div>
          </div>
          <div className="p-[13px_15px] rounded-[9px] text-[11.5px] leading-[1.65]" style={{ color: 'var(--text-mid)', background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <strong style={{ color: 'var(--text-bright)' }}>Usage breakdown</strong><br />
            Input tokens (system prompt + history): <strong>~60%</strong><br />
            Output tokens (Explorer responses): <strong>~30%</strong><br />
            Agent-to-agent routing overhead: <strong>~10%</strong><br /><br />
            <span className="font-mono text-[9px]" style={{ color: 'var(--muted)' }}>Priced at claude-sonnet-4-6 API rates. Billed monthly to workspace.</span>
          </div>
        </div>)}
      </div>
    </Modal>
  );
}
