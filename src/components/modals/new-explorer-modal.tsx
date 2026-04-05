// @ts-nocheck
'use client';
import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { useCreateExplorer, useRoles } from '@/lib/data-provider';
import { IconX, IconBot, IconZap, IconTarget, IconBrain, IconRocket, IconDna, IconCpu } from '@/components/icons';
import { MOCK_ROLES } from '@/lib/mock-data';

const PERSONALITY_TEMPLATES = [
  { id: 'professional', label: 'Professional & Thorough', desc: 'Formal tone, deep technical evaluation', color: 'var(--blue)' },
  { id: 'conversational', label: 'Conversational & Warm', desc: 'Friendly, emphasizes culture and team fit', color: 'var(--green)' },
  { id: 'analytical', label: 'Analytical & Data-Driven', desc: 'Focus on skills metrics and benchmarks', color: 'var(--purple)' },
  { id: 'challenger', label: 'Challenger & Probing', desc: 'Pushes candidates to demonstrate depth', color: 'var(--orange)' },
];

const ICON_OPTIONS = [
  { key: 'bot', icon: <IconBot size={16} />, bg: 'var(--green-bg)' },
  { key: 'dna', icon: <IconDna size={16} />, bg: 'var(--blue-bg)' },
  { key: 'target', icon: <IconTarget size={16} />, bg: 'var(--purple-bg)' },
  { key: 'brain', icon: <IconBrain size={16} />, bg: 'var(--orange-bg)' },
  { key: 'rocket', icon: <IconRocket size={16} />, bg: 'var(--red-bg)' },
  { key: 'cpu', icon: <IconCpu size={16} />, bg: 'var(--surface3)' },
];

const STEPS = ['Configure', 'Screening', 'Review'];

export function NewExplorerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const toast = useToast();
  const createExplorer = useCreateExplorer();
  const rolesQuery = useRoles();
  const allRoles = rolesQuery.data?.data || MOCK_ROLES;
  const [form, setForm] = useState({
    name: '', roleId: '', mode: 'AUTO' as 'AUTO' | 'ASSIST' | 'DRAFT',
    personality: 'professional', iconKey: 'bot',
    screeningQuestions: ['', '', ''],
    evaluationCriteria: ['Technical skills', 'Culture fit', 'Communication'],
    maxConversations: '50', autoAdvance: true, a2aEnabled: true,
  });
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const selectedRole = allRoles.find(r => r.id === form.roleId);
  const selectedIcon = ICON_OPTIONS.find(i => i.key === form.iconKey) || ICON_OPTIONS[0];

  return (
    <Modal open={open} onClose={onClose} maxWidth="640px">
      {/* Step Indicator */}
      <div className="flex items-center gap-[4px] mb-[18px] overflow-x-auto pb-[4px]">
        {STEPS.map((s, i) => (<div key={s} className="flex items-center gap-[4px]">
          <div className={`w-[22px] h-[22px] flex items-center justify-center text-[10px] font-mono flex-shrink-0 ${i <= step ? 'bg-[var(--blue)] text-white' : 'bg-[var(--surface3)] text-[var(--muted)]'}`}>{i + 1}</div>
          <span className={`font-mono text-[8.5px] whitespace-nowrap ${i <= step ? 'text-[var(--blue)] font-bold' : 'text-[var(--muted)]'}`}>{s}</span>
          {i < STEPS.length - 1 && <div className="w-[20px] h-[1px] flex-shrink-0" style={{ background: i < step ? 'var(--blue)' : 'var(--border)' }} />}
        </div>))}
      </div>

      {step === 0 && (<div>
        <div style={{ fontSize:19, fontWeight:300, marginBottom:2 }} style={{ fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", color: 'var(--text-bright)' }}>Configure Explorer</div>
        <div className="text-[12px] mb-[20px]" style={{ color: 'var(--text-dim)' }}>Set up the AI screening agent for a role — it will autonomously engage and evaluate candidates.</div>

        <div className="grid grid-cols-2 gap-[13px]">
          <div>
            <label className="form-label">Explorer Name</label>
            <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. StaffML-Agent" />
          </div>
          <div>
            <label className="form-label">Target Role</label>
            <select className="form-select" value={form.roleId} onChange={e => set('roleId', e.target.value)}>
              <option value="">Select a role…</option>
              {allRoles.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
            </select>
          </div>
        </div>

        <label className="form-label mt-[13px]">Mode</label>
        <div className="grid grid-cols-3 gap-[8px]">
          {(['AUTO', 'ASSIST', 'DRAFT'] as const).map(m => (
            <div key={m} onClick={() => set('mode', m)} className="p-[10px] cursor-pointer text-center transition-all" style={{ border: `2px solid ${form.mode === m ? (m === 'AUTO' ? 'var(--green-border)' : m === 'ASSIST' ? 'var(--purple-border)' : 'var(--border2)') : 'var(--border)'}`, background: form.mode === m ? (m === 'AUTO' ? 'var(--green-bg)' : m === 'ASSIST' ? 'var(--purple-bg)' : 'var(--surface3)') : 'transparent' }}>
              <div className="text-[12px] font-medium" style={{ color: m === 'AUTO' ? 'var(--green)' : m === 'ASSIST' ? 'var(--purple)' : 'var(--muted)' }}>{m}</div>
              <div className="text-[9px] mt-[2px]" style={{ color: 'var(--muted)' }}>{m === 'AUTO' ? 'Fully autonomous' : m === 'ASSIST' ? 'Human-in-loop' : 'Config only'}</div>
            </div>
          ))}
        </div>

        <label className="form-label mt-[13px]">Icon</label>
        <div className="flex gap-[6px]">
          {ICON_OPTIONS.map(ico => (
            <div key={ico.key} onClick={() => set('iconKey', ico.key)} className="w-[36px] h-[36px] flex items-center justify-center cursor-pointer transition-all" style={{ background: ico.bg, border: `2px solid ${form.iconKey === ico.key ? 'var(--blue)' : 'var(--border)'}` }}>{ico.icon}</div>
          ))}
        </div>

        <label className="form-label mt-[13px]">Personality Template</label>
        <div className="grid grid-cols-2 gap-[8px]">
          {PERSONALITY_TEMPLATES.map(p => (
            <div key={p.id} onClick={() => set('personality', p.id)} className="p-[10px_12px] cursor-pointer transition-all" style={{ border: `1.5px solid ${form.personality === p.id ? p.color : 'var(--border)'}`, background: form.personality === p.id ? `color-mix(in srgb, ${p.color} 8%, transparent)` : 'transparent' }}>
              <div className="text-[11px] font-medium" style={{ color: form.personality === p.id ? p.color : 'var(--text-mid)' }}>{p.label}</div>
              <div className="text-[9px]" style={{ color: 'var(--muted)' }}>{p.desc}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-[13px] p-[10px_12px]" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
          <div><div className="text-[12px] font-medium" style={{ color: 'var(--text-bright)' }}>Agent-to-Agent (A2A)</div><div className="text-[10px]" style={{ color: 'var(--muted)' }}>Allow negotiation with candidate agents</div></div>
          <button onClick={() => set('a2aEnabled', !form.a2aEnabled)} className="w-[36px] h-[20px] relative cursor-pointer transition-colors" style={{ background: form.a2aEnabled ? 'var(--blue)' : 'var(--border2)' }}><div className="absolute top-[2px] w-[16px] h-[16px] bg-white transition-all" style={{ left: form.a2aEnabled ? 18 : 2 }} /></button>
        </div>
      </div>)}

      {step === 1 && (<div>
        <div style={{ fontSize:19, fontWeight:300, marginBottom:2 }} style={{ fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", color: 'var(--text-bright)' }}>Screening Configuration</div>
        <div className="text-[12px] mb-[20px]" style={{ color: 'var(--text-dim)' }}>Define what the Explorer evaluates and custom screening questions.</div>

        <label className="form-label">Custom Screening Questions</label>
        {form.screeningQuestions.map((q, i) => (
          <input key={i} className="form-input mb-[8px]" value={q} onChange={e => { const qs = [...form.screeningQuestions]; qs[i] = e.target.value; set('screeningQuestions', qs); }} placeholder={`Question ${i + 1} (e.g. "Describe your experience with distributed systems")`} />
        ))}
        <button className="ctrl-btn blue mt-[4px]" style={{ fontSize: '9px' }} onClick={() => set('screeningQuestions', [...form.screeningQuestions, ''])}>+ Add Question</button>

        <label className="form-label mt-[16px]">Evaluation Criteria</label>
        <div className="flex flex-wrap gap-[6px]">
          {['Technical skills', 'Culture fit', 'Communication', 'Leadership', 'Problem solving', 'Growth potential', 'Domain expertise', 'Team collaboration'].map(c => (
            <button key={c} onClick={() => set('evaluationCriteria', form.evaluationCriteria.includes(c) ? form.evaluationCriteria.filter((x: string) => x !== c) : [...form.evaluationCriteria, c])} className="font-mono text-[9px] px-[10px] py-[4px] cursor-pointer transition-all" style={{ color: form.evaluationCriteria.includes(c) ? 'var(--blue)' : 'var(--text-dim)', background: form.evaluationCriteria.includes(c) ? 'var(--blue-bg)' : 'var(--surface2)', border: `1px solid ${form.evaluationCriteria.includes(c) ? 'var(--blue-border)' : 'var(--border)'}` }}>{c}</button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-[13px] mt-[16px]">
          <div><label className="form-label">Max Conversations</label><input className="form-input" type="number" value={form.maxConversations} onChange={e => set('maxConversations', e.target.value)} /></div>
          <div className="flex items-center justify-between p-[10px_12px] mt-[16px]" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <div><div className="text-[11px] font-medium" style={{ color: 'var(--text-bright)' }}>Auto-Advance</div><div className="text-[9px]" style={{ color: 'var(--muted)' }}>Move 90+ scores to Recruiter Review</div></div>
            <button onClick={() => set('autoAdvance', !form.autoAdvance)} className="w-[36px] h-[20px] relative cursor-pointer transition-colors" style={{ background: form.autoAdvance ? 'var(--green)' : 'var(--border2)' }}><div className="absolute top-[2px] w-[16px] h-[16px] bg-white transition-all" style={{ left: form.autoAdvance ? 18 : 2 }} /></button>
          </div>
        </div>
      </div>)}

      {step === 2 && (<div>
        <div style={{ fontSize:19, fontWeight:300, marginBottom:2 }} style={{ fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", color: 'var(--text-bright)' }}>Review Explorer</div>
        <div className="text-[12px] mb-[20px]" style={{ color: 'var(--text-dim)' }}>Confirm your Explorer configuration before activating.</div>

        <div className="p-[16px] mb-[12px]" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-[10px] mb-[10px]">
            <div className="w-[36px] h-[36px] flex items-center justify-center flex-shrink-0" style={{ background: selectedIcon.bg, border: '1px solid var(--border)' }}>{selectedIcon.icon}</div>
            <div>
              <div style={{ fontSize:15, fontWeight:400 }} style={{ fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", color: 'var(--text-bright)' }}>{form.name || 'Unnamed Explorer'}</div>
              <div className="text-[11px]" style={{ color: 'var(--muted)' }}>{selectedRole?.title || 'No role selected'}</div>
            </div>
            <span className={`jbot-mode ml-auto ${form.mode === 'AUTO' ? 'bm-auto' : form.mode === 'ASSIST' ? 'bm-assist' : 'bm-draft'}`}>{form.mode}</span>
          </div>
          <div className="grid grid-cols-2 gap-[8px]">
            {[
              { l: 'Personality', v: PERSONALITY_TEMPLATES.find(p => p.id === form.personality)?.label },
              { l: 'Agent-to-Agent', v: form.a2aEnabled ? 'Enabled' : 'Disabled' },
              { l: 'Max Conversations', v: form.maxConversations },
              { l: 'Auto-Advance', v: form.autoAdvance ? 'Enabled (90+ scores)' : 'Disabled' },
              { l: 'Criteria', v: form.evaluationCriteria.join(', ') },
              { l: 'Screening Qs', v: `${form.screeningQuestions.filter(Boolean).length} configured` },
            ].map(({ l, v }) => (
              <div key={l} className="flex justify-between py-[5px]" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="font-mono text-[8px] uppercase" style={{ color: 'var(--muted)' }}>{l}</span>
                <span className="text-[10px] text-right" style={{ color: 'var(--text-bright)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>)}

      {/* Nav */}
      <div className="flex items-center gap-[8px] mt-[18px] pt-[12px]" style={{ borderTop: '1px solid var(--border)' }}>
        <button className="ctrl-btn" onClick={() => { setStep(0); onClose(); }}>Cancel</button>
        <div className="flex gap-[8px] ml-auto">
          {step > 0 && <button className="ctrl-btn" onClick={() => setStep(s => s - 1)}>Back</button>}
          {step < 2 ? (
            <button className="ctrl-btn run" onClick={() => setStep(s => s + 1)}>Continue</button>
          ) : (
            <button className="ctrl-btn run" onClick={() => { const selIcon = ICON_OPTIONS.find(i => i.key === form.iconKey) || ICON_OPTIONS[0]; createExplorer.mutate({ type: 'explorer', name: form.name || 'New Explorer', context: { mode: form.mode, role: selectedRole?.title || 'Unknown Role', icon: form.iconKey, iconBg: selIcon.bg, conversations: 0, a2aSessions: 0, interviewsSet: 0, interactions: [] } }, { onSuccess: () => { toast.show(`Explorer "${form.name}" deployed via API for ${selectedRole?.title || 'role'} in ${form.mode} mode!`); setStep(0); onClose(); }, onError: () => { toast.show(`Explorer saved locally (API unavailable)`); setStep(0); onClose(); } }); }}>
              <IconZap size={10} className="inline mr-[4px]" /> Deploy Explorer
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

